import { BrowserDraftWriter } from './draft-save.ts';
import {useEffect,useRef,useState} from 'react';
import type {FormEvent} from 'react';

type Status='waiting'|'streaming'|'answered'|'refused'|'incomplete'|'stopped'|'failed';
type Turn={id:string;conversationId:string;question:string;answer:string;status:Status;notice:string;revision:number};
type Conversation={id:string;title:string;updatedAt:string};
async function json<T>(path:string,options?:RequestInit):Promise<T>{
 const res=await fetch(path,options);const body=await res.json();
 if(!res.ok)throw new Error(body.error||`HTTP ${res.status}`);return body as T;
}
// This demo's backend writes single-line JSON `data:` frames. For arbitrary
// SSE providers, reuse the full parser from chapter 15 instead.
async function consume(response:Response,onEvent:(event:string,data:any)=>void,signal:AbortSignal){
 if(!response.ok||!response.body)throw new Error(`HTTP ${response.status}`);
 const reader=response.body.getReader();const decoder=new TextDecoder();let buffer='';let gotEnd=false;
 try{
  while(true){const {done,value}=await reader.read();if(done)break;
   buffer+=decoder.decode(value,{stream:true});
   let boundary;
   while((boundary=buffer.indexOf('\n\n'))>=0){
    const frame=buffer.slice(0,boundary);buffer=buffer.slice(boundary+2);
    const kind=frame.match(/^event: (.+)$/m)?.[1];const content=frame.match(/^data: (.+)$/m)?.[1];
    if(kind&&content){onEvent(kind,JSON.parse(content));if(kind==='end')gotEnd=true;}
   }
  }
  decoder.decode();if(!gotEnd&&!signal.aborted)throw new Error('连接结束，但未收到 end；草稿不是完整答案');
 }finally{await reader.cancel().catch(()=>{});reader.releaseLock()}
}
// Abortable delay: switching conversations cancels the REST poll immediately.
function delayWithSignal(ms:number, signal:AbortSignal):Promise<void>{
 return new Promise((resolve,reject)=>{
  if(signal.aborted){reject(new DOMException('Cancelled','AbortError'));return}
  const onAbort=()=>{clearTimeout(timer);signal.removeEventListener('abort',onAbort);reject(new DOMException('Cancelled','AbortError'))};
  const timer=setTimeout(()=>{signal.removeEventListener('abort',onAbort);resolve()},ms);
  signal.addEventListener('abort',onAbort,{once:true});
 });
}
export default function App(){
 const [conversations,setConversations]=useState<Conversation[]>([]);
 const [selected,setSelected]=useState('');const selectedRef=useRef('');
 const [turns,setTurns]=useState<Turn[]>([]);const [question,setQuestion]=useState('');
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const active=useRef<AbortController|null>(null);
 const loader=useRef<AbortController|null>(null);
 const draft=useRef<{controller:AbortController;writer:BrowserDraftWriter}|null>(null);
 const [restoring,setRestoring]=useState(false);
 const LAST_CONVERSATION='lesson17:selectedConversation';
 async function reloadList(){const result=await json<{conversations:Conversation[]}>('/api/conversations');setConversations(result.conversations)}
 async function selectConversation(id:string){
  // A previous conversation load must never overwrite the new selection.
  loader.current?.abort();
  const load=new AbortController();loader.current=load;
  const previous=active.current;active.current=null;previous?.abort();
  draft.current?.writer.cancelTimer();draft.current=null;
  selectedRef.current=id;setSelected(id);setError('');setTurns([]);setBusy(false);setRestoring(true);
  try{
   // The previous SSE connection may still be saving its incomplete state.
   // Re-check a small bounded number of times, without restarting the model.
   for(let attempt=0;attempt<4;attempt++){
    const result=await json<{turns:Turn[]}>(`/api/conversations/${id}`,{signal:load.signal,cache:'no-store'});
    if(load.signal.aborted||selectedRef.current!==id)return;
    setTurns(result.turns);
    localStorage.setItem(LAST_CONVERSATION,id); // only ID, never message bodies
    const stillPending=result.turns.some(t=>t.status==='waiting'||t.status==='streaming');
    if(!stillPending)break;
    if(attempt<3){
     await delayWithSignal(300,load.signal);
     if(load.signal.aborted||selectedRef.current!==id)return;
    }
   }
  }catch(e){
   if(!load.signal.aborted&&selectedRef.current===id){
    localStorage.removeItem(LAST_CONVERSATION);
    setError(e instanceof Error?e.message:String(e));
   }
  }finally{
   if(loader.current===load){loader.current=null;setRestoring(false)}
  }
 }
 useEffect(()=>{
  let disposed=false;
  void (async()=>{
    await reloadList();
    if(disposed)return;
    const saved=localStorage.getItem(LAST_CONVERSATION);
    if(saved)await selectConversation(saved);
  })().catch(e=>{if(!disposed)setError(String(e))});
  return()=>{disposed=true;active.current?.abort();loader.current?.abort();draft.current?.writer.cancelTimer()}
 },[]);
 async function createConversation(){try{
  const result=await json<{conversation:Conversation}>('/api/conversations',{method:'POST'});
  await reloadList();await selectConversation(result.conversation.id);
 }catch(e){setError(String(e))}}
 async function renameConversation(){
  if(!selectedRef.current||busy)return;
  const id=selectedRef.current;
  const current=conversations.find(c=>c.id===id);
  const title=window.prompt('修改会话标题（1～80字）',current?.title||'');
  if(title===null)return; // User cancelled
  const value=title.trim();
  if(!value||value.length>80){setError('标题长度需为 1～80 字');return}
  try{
   await json(`/api/conversations/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:value})});
   await reloadList();
  }catch(e){setError(e instanceof Error?e.message:String(e))}
 }
 async function send(event?:FormEvent, retryTurnId?:string){event?.preventDefault();
  if(active.current||!selectedRef.current||(!retryTurnId&&!question.trim()))return;
  const id=selectedRef.current;
  const ctl=new AbortController();active.current=ctl;setBusy(true);setError('');
  let writer:BrowserDraftWriter|null=null;
  let ended=false;
  try {
   let streamedTurnId=retryTurnId || '';
   const url=retryTurnId?`/api/conversations/${id}/turns/${retryTurnId}/retry`:`/api/conversations/${id}/turns`;
   const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},
     body:retryTurnId?'{}':JSON.stringify({question:question.trim()}),signal:ctl.signal});
   if(!response.ok)throw new Error((await response.json()).error||'STREAM_FAILED');
   if(!retryTurnId)setQuestion('');
   await consume(response,(kind,data)=>{
    if(active.current!==ctl||ctl.signal.aborted||selectedRef.current!==id)return;
    if(kind==='meta') {
      const t=data.turn as Turn;streamedTurnId=t.id;
      // Save requests are intentionally independent from the SSE controller.
      // They are serial and compare the latest revision returned by SQLite.
      writer=new BrowserDraftWriter(t,async input=>{
        const result=await json<{turn:Turn}>(`/api/conversations/${id}/turns/${t.id}`,{
          method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)
        });
        if(active.current===ctl&&selectedRef.current===id)
          setTurns(prev=>prev.map(item=>item.id===t.id?{...item,revision:result.turn.revision}:item));
        return result.turn;
      });
      draft.current={controller:ctl,writer};
      setTurns(prev=>retryTurnId?prev.map(x=>x.id===t.id?t:x):[...prev,t]);
    } else if(kind==='delta') {
      writer?.append(String(data.text)); // UI update is immediate; PUT is debounced.
      setTurns(prev=>prev.map(t=>t.id===streamedTurnId&&(t.status==='waiting'||t.status==='streaming')?
        {...t,answer:t.answer+String(data.text),status:'streaming'}:t));
    } else if(kind==='end') {
      ended=true; // End of generation, NOT end of persistence.
    }
   },ctl.signal);
   if(!ended||!writer)throw new Error('缺少完整 end；不能保存成 answered');
   await writer.finish('answered'); // Always await the final PUT.
   if(active.current===ctl&&selectedRef.current===id)
     setTurns(prev=>prev.map(t=>t.id===streamedTurnId?{...t,answer:writer!.text,status:'answered',notice:''}:t));
  }catch(e){
    if(!ctl.signal.aborted)setError('生成或保存失败：'+(e instanceof Error?e.message:String(e))+'；请重新加载核对数据库。');
  }finally{
    writer?.cancelTimer();
    if(draft.current?.controller===ctl)draft.current=null;
    if(active.current===ctl){active.current=null;setBusy(false);await selectConversation(id).catch(()=>{})}
    void reloadList();
  }
 }
 async function stop(){
  const id=selectedRef.current,ctl=active.current;
  const inProgress=turns.findLast(t=>['waiting','streaming'].includes(t.status));
  if(!ctl||!inProgress)return;
  try {
    // Flush browser's latest accumulated text BEFORE asking the server to stop.
    if(draft.current?.controller===ctl)await draft.current.writer.checkpoint('streaming');
    await json(`/api/conversations/${id}/turns/${inProgress.id}/stop`,{method:'POST'});
  }catch(e){setError('停止请求失败：'+String(e))}
  finally{ctl.abort()}
 }
 async function removeConversation(){if(!selected)return;
  try{await json(`/api/conversations/${selected}`,{method:'DELETE'});selectedRef.current='';localStorage.removeItem(LAST_CONVERSATION);setSelected('');setTurns([]);await reloadList()}
  catch(e){setError(String(e))}}
 return <div className="layout">
  <aside><h2>历史会话</h2><button onClick={createConversation}>+ 新建会话</button>
   {conversations.map(c=><button key={c.id} className={selected===c.id?'selected':''} onClick={()=>void selectConversation(c.id)}>{c.title}<small>{new Date(c.updatedAt).toLocaleString()}</small></button>)}
  </aside><main><h1>第 17 篇 · 聊天持久化</h1><p>模拟 SSE + 前端 800ms/2KB 检查点 PUT + SQLite。刷新后恢复最后一次已保存的内容；未连接付费模型。</p>
   {restoring&&<p role="status">正在恢复并核对服务端状态……</p>}
   {selected?<><div className="chat">{turns.map(t=><article key={t.id}><p className="user"><strong>你：</strong>{t.question}</p><p className="assistant"><strong>助手：</strong>{t.answer||'（暂无正文）'}</p><small>状态：{t.status} {t.notice}</small>
   {['waiting','streaming'].includes(t.status)&&!busy&&<p role="status">状态尚未确认：可以点击“重新加载”核对，不能自动当作成功。</p>}
   {t.status==='incomplete'&&<p>生成未完成；这里只能恢复已经通过 PUT 保存的草稿，最后尚未提交的片段可能丢失。</p>}
   {['stopped','failed','incomplete'].includes(t.status)&&!busy&&<button onClick={()=>void send(undefined,t.id)}>重新回答（ID 不变）</button>}</article>)}</div>
    <form onSubmit={e=>void send(e)}><textarea disabled={busy} value={question} onChange={e=>setQuestion(e.target.value)} placeholder="请输入问题" maxLength={2000}/>
    <div className="actions"><button disabled={busy||!question.trim()}>发送</button><button type="button" disabled={!busy} onClick={()=>void stop()}>停止</button><button type="button" disabled={busy} onClick={()=>void selectConversation(selected)}>重新加载</button><button type="button" disabled={busy} onClick={()=>void renameConversation()}>重命名会话</button><button type="button" disabled={busy} onClick={removeConversation}>删除会话</button></div></form>
   </>:<p>先点击“新建会话”。</p>}
   {error&&<p role="alert">{error}</p>}
  </main></div>
}
