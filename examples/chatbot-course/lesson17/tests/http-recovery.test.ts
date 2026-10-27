import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const base='http://127.0.0.1:3001';
const isRunning=async()=>{try{return (await fetch(base+'/api/conversations')).ok}catch{return false}};

async function waitForServer(){
 for(let i=0;i<60;i++){if(await isRunning())return;await sleep(50)}
 throw new Error('server did not start');
}

async function postJson(url:string, data:unknown){
 return fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
}

test('frontend PUT checkpoint survives HTTP disconnect; unsaved delta is not guaranteed',async t=>{
 if(await isRunning()) {t.skip('Port 3001 already in use');return}
 const dir=mkdtempSync(join(tmpdir(),'lesson17-http-'));
 const server=spawn(process.execPath,['--experimental-strip-types','server/index.ts'],{
  cwd:join(import.meta.dirname,'..'),
  env:{...process.env,CHAT_DB_PATH:join(dir,'chat.sqlite'),NODE_NO_WARNINGS:'1'},
  stdio:['ignore','pipe','pipe']
 });
 let err=''; server.stderr?.on('data',b=>{err+=String(b)});
 try{
  await waitForServer();
  const c=await postJson(base+'/api/conversations',{});
  assert.equal(c.status,201);
  const id=(await c.json()).conversation.id as string;
  const rename=await fetch(base+`/api/conversations/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:'刷新恢复验证'})});
  assert.equal(rename.status,200);
  assert.equal((await rename.json()).conversation.title,'刷新恢复验证');
  const invalidRename=await fetch(base+`/api/conversations/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:'  '})});
  assert.equal(invalidRename.status,400);
  const abort=new AbortController();
  const response=await fetch(base+`/api/conversations/${id}/turns`,{
   method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({question:'解释一下闭包'}),signal:abort.signal
  });
  assert.equal(response.headers.get('content-type')?.startsWith('text/event-stream'),true);
  const reader=response.body!.getReader();
  const decoder=new TextDecoder(); let received='';
  // The first chunk can contain meta only; read until an actual delta arrives.
  for(let i=0;i<20&&!received.includes('event: delta');i++){
   const item=await reader.read();if(item.done)break;received+=decoder.decode(item.value,{stream:true});
  }
  assert.match(received,/event: delta/);
  // Browser emits one PUT checkpoint for its accumulated SSE text.
  const snapshot=(received.match(/event: delta\ndata: (\{[^\n]+\})/)||[])[1];
  assert(snapshot);
  const delta=JSON.parse(snapshot).text as string;
  const idBefore=(await (await fetch(base+`/api/conversations/${id}`)).json()).turns[0].id;
  const saved=await fetch(base+`/api/conversations/${id}/turns/${idBefore}`,{
   method:'PUT',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({answer:delta,status:'streaming',revision:0,notice:''})
  });
  assert.equal(saved.status,200);
  assert.equal((await saved.json()).turn.answer,delta);
  abort.abort();await reader.cancel().catch(()=>{});
  let settled:any;
  for(let i=0;i<30;i++){
   settled=await (await fetch(base+`/api/conversations/${id}`)).json();
   if(!['waiting','streaming'].includes(settled.turns[0].status))break;
   await sleep(50);
  }
  const turn=settled.turns[0];
  assert.equal(turn.status,'incomplete');
  assert.equal(turn.question,'解释一下闭包');
  assert.equal(turn.id.length,36);
  assert.equal(turn.answer,delta);
  assert(turn.revision>=1);
  // Another new turn: browser receives ALL deltas then sends ONE terminal PUT.
  const second=await fetch(base+`/api/conversations/${id}/turns`,{
   method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({question:'第二个问题'})
  });
  assert.equal(second.status,200);
  const streamText=await second.text();
  assert.match(streamText,/event: end/);
  const frames=streamText.split('\n\n').filter(Boolean);
  const metaFrame=frames.find(f=>f.startsWith('event: meta'))!;
  const meta=JSON.parse(metaFrame.match(/data: (.*)/)![1]);
  const answer=frames.filter(f=>f.startsWith('event: delta'))
   .map(f=>JSON.parse(f.match(/data: (.*)/)![1]).text).join('');
  // An end event alone does not make DB status answered.
  const beforeSave=await (await fetch(base+`/api/conversations/${id}`)).json();
  assert.notEqual(beforeSave.turns[1].status,'answered');
  const done=await fetch(base+`/api/conversations/${id}/turns/${meta.turn.id}`,{
   method:'PUT',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({answer,status:'answered',revision:meta.turn.revision,notice:''})
  });
  assert.equal(done.status,200);
  assert.equal((await done.json()).turn.answer,answer);
  assert.equal((await (await fetch(base+`/api/conversations/${id}`)).json()).turns[1].status,'answered');
  // A fresh GET restores exactly the same persisted Turn; no new model request.
  const fetched=await (await fetch(base+`/api/conversations/${id}`)).json();
  assert.equal(fetched.turns.length,2);
  assert.equal(fetched.turns[0].id,turn.id);
  assert.equal(fetched.turns[0].answer,turn.answer);
 }finally{
  server.kill('SIGTERM');
  await Promise.race([new Promise(resolve=>server.once('exit',resolve)),sleep(2000)]);
  if(server.exitCode===null)server.kill('SIGKILL');
  rmSync(dir,{recursive:true,force:true});
 }
 assert.equal(err,'',err);
});
