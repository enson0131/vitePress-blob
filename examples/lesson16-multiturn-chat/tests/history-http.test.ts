import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import { makeServer } from "../server/app.ts";
import { readChat } from "../src/readChat.ts";
import { streamAnswer } from "../server/stream-model.ts";

test("two HTTP turns: name becomes available only when matching history is provided",async t=>{
 const server=makeServer('mock');server.listen(0,'127.0.0.1');await once(server,'listening');
 t.after(()=>{server.closeAllConnections();server.close()});
 const url=`http://127.0.0.1:${(server.address() as AddressInfo).port}/api/chat/stream`;
 const post=async(question:string,history:unknown[])=>readChat(await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({conversationId:'c1',turnId:'r1',question,history})}),()=>{},new AbortController().signal);
 const first=await post('我叫小陈',[]);
 const second=await post('我叫什么？',[{role:'user',content:'我叫小陈'},{role:'assistant',content:first.text}]);
 assert.match(second.text,/你叫小陈/);assert.match(second.text,/收到 1 轮历史/);
 const fresh=await post('我叫什么？',[]);assert.match(fresh.text,/没有你的名字/);
});
test("live adapter sends selected history plus exactly one current question; no paid model call",async t=>{
 const oldKey=process.env.OPENAI_API_KEY,oldModel=process.env.OPENAI_MODEL;
 process.env.OPENAI_API_KEY='test-key';process.env.OPENAI_MODEL='test-model';
 t.after(()=>{if(oldKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=oldKey;
  if(oldModel===undefined)delete process.env.OPENAI_MODEL;else process.env.OPENAI_MODEL=oldModel;});
 let body:any;
 t.mock.method(globalThis,'fetch',async(_url: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1])=>{
  body=JSON.parse(String(init?.body));
  const event={type:'response.completed',response:{status:'completed',output:[{type:'message',content:[{type:'output_text',text:'ok'}]}]}};
  return new Response(`event: response.completed\ndata: ${JSON.stringify(event)}\n\n`,{headers:{'Content-Type':'text/event-stream'}});
 });
 const history=[{role:'user' as const,content:'我叫小陈'},{role:'assistant' as const,content:'你好'}];
 for await(const _ of streamAnswer('我叫什么','live',new AbortController().signal,'answered',history)) { /* collect through completion */ }
 assert.deepEqual(body.input,[...history,{role:'user',content:'我叫什么'}]);
 assert.equal(body.store,false);assert.equal(body.previous_response_id,undefined);
 assert.equal(body.stream,true);assert.equal(typeof body.instructions,'string');
});
