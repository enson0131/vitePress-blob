import {createServer, type IncomingMessage, type ServerResponse} from 'node:http';
import {setTimeout as sleep} from 'node:timers/promises';
import {openStore, type Turn, type TurnStatus} from './store.ts';

const store = openStore(process.env.CHAT_DB_PATH || './data/chats.sqlite');
// Single-user localhost tutorial, NOT suitable for public deployment.
const USER_ID='local-demo';
type Active={controller:AbortController;explicitStop:boolean};
const active=new Map<string,Active>();
// Single-process teaching guard: final answered PUT requires generation end.
// This is NOT a proof of client-submitted answer authenticity.
const finishedGeneration=new Set<string>();
const asJson=(res:ServerResponse,status:number,value:unknown)=>{
 res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
 res.end(JSON.stringify(value));
};
const problem=(res:ServerResponse,e:unknown)=>{
 const message=e instanceof Error?e.message:'UNKNOWN';
 asJson(res,message==='NOT_FOUND'?404:message==='CONFLICT_OR_NOT_FOUND'?409:message==='INVALID_STATUS'?409:400,{error:message});
};
async function body(req:IncomingMessage) {
 const pieces:Buffer[]=[];let size=0;
 for await(const chunk of req){const bytes=Buffer.from(chunk);size+=bytes.length;
  if(size>200_000)throw new Error('BODY_TOO_LARGE');pieces.push(bytes)}
 try{return JSON.parse(Buffer.concat(pieces).toString('utf8')||'{}') as unknown}
 catch{throw new Error('INVALID_JSON')}
}
function sse(res:ServerResponse,event:string,data:unknown){
 if(!res.destroyed && !res.writableEnded) res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

/**
 * Generation server streams deltas but DOES NOT persist assistant answer chunks.
 * The frontend owns draft checkpoint PUTs and final PUT.
 * On abnormal close the server preserves last CHECKPOINT and marks incomplete.
 */
async function streamTurn(res:ServerResponse,conversationId:string,turn:Turn){
 const session:Active={controller:new AbortController(),explicitStop:false};
 active.set(turn.id,session);
 let generated=false;
 res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});
 res.flushHeaders();
 res.on('close',()=>{if(!generated)session.controller.abort()});
 try {
  sse(res,'meta',{turn});
  const chunks=['【模拟回复】','你的问题是：',turn.question,'。','刷新后，我的草稿以此前成功保存的检查点为准。'];
  for(const chunk of chunks){
   await sleep(240,undefined,{signal:session.controller.signal});
   session.controller.signal.throwIfAborted();
   if(active.get(turn.id)!==session) return;
   sse(res,'delta',{text:chunk});
  }
  if(active.get(turn.id)===session && !session.controller.signal.aborted){
   generated=true;
   finishedGeneration.add(turn.id);
   // A transport end means generation finished, NOT "already persisted".
   sse(res,'end',{status:'answered',note:'前端收到 end 后须等待最终 PUT 成功'});
   // Give the browser a short time to commit its final answer. If it never
   // does (tab closed / write failed), mark saved checkpoint as incomplete.
   const timer=setTimeout(()=>{
    finishedGeneration.delete(turn.id);
    try{store.markUnfinished(USER_ID,conversationId,turn.id,'incomplete','模型生成完毕，但客户端未确认最终保存');}
    catch(e){console.error('mark pending final save:',e)}
   },2500);
   timer.unref();
  }
 }catch(error){
  if(active.get(turn.id)===session){
   try {
    const status:TurnStatus=session.explicitStop?'stopped':session.controller.signal.aborted?'incomplete':'failed';
    store.markUnfinished(USER_ID,conversationId,turn.id,status,
      status==='stopped'?'用户主动停止':'流式连接中断；只保留已保存的检查点');
   }catch(saveError){console.error('terminal update failed:',saveError)}
  }
 }finally{
  if(active.get(turn.id)===session)active.delete(turn.id);
  if(!res.writableEnded) res.end();
 }
}
const server=createServer(async(req,res)=>{
 try {
  const url=new URL(req.url||'/', 'http://localhost');
  if(req.method==='GET'&&url.pathname==='/api/conversations')
   return asJson(res,200,{conversations:store.list(USER_ID)});
  if(req.method==='POST'&&url.pathname==='/api/conversations')
   return asJson(res,201,{conversation:store.createConversation(USER_ID)});
  const matched=url.pathname.match(/^\/api\/conversations\/([a-f\d-]{36})(?:\/turns(?:\/([a-f\d-]{36})(?:\/(retry|stop))?)?)?$/i);
  if(!matched)return asJson(res,404,{error:'NOT_FOUND'});
  const [,conversationId,turnId,operation]=matched;
  if(req.method==='GET'&&!turnId&&!url.pathname.endsWith('/turns'))
   return asJson(res,200,store.read(USER_ID,conversationId));
  if(req.method==='PATCH'&&url.pathname===`/api/conversations/${conversationId}`){
   const input=await body(req);
   const title=typeof input==='object'&&input!==null&&'title'in input?(input as {title:unknown}).title:null;
   if(typeof title!=='string'||!title.trim()||title.length>80)throw new Error('INVALID_TITLE');
   return asJson(res,200,{conversation:store.renameConversation(USER_ID,conversationId,title)});
  }
  if(req.method==='DELETE'&&url.pathname===`/api/conversations/${conversationId}`){
   if(store.read(USER_ID,conversationId).turns.some(t=>active.has(t.id)))return asJson(res,409,{error:'ACTIVE_STREAM'});
   if(!store.remove(USER_ID,conversationId))throw new Error('NOT_FOUND');
   return asJson(res,200,{ok:true});
  }
  if(req.method==='POST'&&url.pathname.endsWith('/turns')){
   const input=await body(req);
   const question=typeof input==='object'&&input!==null&&'question'in input?(input as {question:unknown}).question:null;
   if(typeof question!=='string'||!question.trim()||question.length>2000)throw new Error('INVALID_QUESTION');
   const turn=store.addTurn(USER_ID,conversationId,question.trim());
   return void streamTurn(res,conversationId,turn);
  }
  if(req.method==='PUT'&&turnId&&!operation){
   const input=await body(req) as Record<string,unknown>;
   if(!input||typeof input.answer!=='string'||input.answer.length>100_000||
    !Number.isSafeInteger(input.revision)||typeof input.notice!=='string'||input.notice.length>500||
    !['streaming','answered','incomplete'].includes(String(input.status)))throw new Error('INVALID_DRAFT');
   if(input.status==='answered'&&!finishedGeneration.has(turnId))throw new Error('GENERATION_NOT_FINISHED');
   // NOTE: this educational endpoint trusts the browser's answer text;
   // production systems must validate AI-output provenance and identity.
   const turn=store.saveBrowserDraft(USER_ID,conversationId,turnId,input.revision as number,{
    answer:input.answer,status:input.status as TurnStatus,notice:input.notice
   });
   if(input.status==='answered')finishedGeneration.delete(turnId);
   return asJson(res,200,{turn});
  }
  if(req.method==='POST'&&turnId&&operation==='retry'){
   finishedGeneration.delete(turnId);
   const old=store.getTurn(USER_ID,conversationId,turnId);
   if(active.has(turnId))return asJson(res,409,{error:'ACTIVE_STREAM'});
   if(!['incomplete','failed','stopped'].includes(old.status))return asJson(res,409,{error:'CANNOT_RETRY'});
   const turn=store.update(USER_ID,conversationId,turnId,old.revision,{answer:'',status:'waiting',notice:''});
   return void streamTurn(res,conversationId,turn);
  }
  if(req.method==='POST'&&turnId&&operation==='stop'){
   store.getTurn(USER_ID,conversationId,turnId);
   const session=active.get(turnId);
   if(!session)return asJson(res,409,{error:'NOT_STREAMING'});
   session.explicitStop=true;
   store.markUnfinished(USER_ID,conversationId,turnId,'stopped','用户主动停止');
   session.controller.abort();
   return asJson(res,200,{ok:true});
  }
  return asJson(res,404,{error:'NOT_FOUND'});
 }catch(e){if(!res.headersSent)problem(res,e);else res.end()}
});
server.listen(3001,'127.0.0.1',()=>console.log('Lesson17 frontend-save server at http://127.0.0.1:3001'));
const quit=()=>{for(const a of active.values())a.controller.abort();server.close(()=>{store.close();process.exit(0)})};
process.on('SIGTERM',quit);process.on('SIGINT',quit);
