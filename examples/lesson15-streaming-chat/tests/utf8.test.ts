import test from "node:test";
import assert from "node:assert/strict";
import { readSSE } from "../shared/sse.ts";
const first=new Uint8Array([0xe4,0xbd]);
const second=new Uint8Array([0xa0,0xe5,0xa5,0xbd]);
function stream(chunks:Uint8Array[]){return new ReadableStream<Uint8Array>({start(c){for(const bytes of chunks)c.enqueue(bytes);c.close();}})}

test("supplement: per-chunk fresh decoder reproduces replacement characters",()=>{
 assert.equal(new TextDecoder().decode(first),"�");
 assert.equal(new TextDecoder().decode(second),"�好");
});
test("supplement: same decoder with stream true yields empty then 你好",()=>{
 const decoder=new TextDecoder("utf-8");
 assert.equal(decoder.decode(first,{stream:true}),"");
 assert.equal(decoder.decode(second,{stream:true}),"你好");
 assert.equal(decoder.decode(),"");
});
test("supplement: the same decoder without stream true still loses the split character",()=>{
 const decoder=new TextDecoder();
 assert.equal(decoder.decode(first)+decoder.decode(second),"��好");
});
test("supplement: TextDecoderStream rejoins every byte boundary including emoji",async()=>{
 const text="你好🙂，流式解码";
 const bytes=new TextEncoder().encode(text);
 for(let cut=1;cut<bytes.length;cut++){
  const reader=stream([bytes.slice(0,cut),bytes.slice(cut)]).pipeThrough(new TextDecoderStream()).getReader();
  let actual="";
  try{while(true){const part=await reader.read();if(part.done)break;actual+=part.value;}}
  finally{reader.releaseLock();}
  assert.equal(actual,text,`cut at byte ${cut}`);
 }
});
test("supplement: final flush distinguishes replacement and fatal incomplete UTF8",()=>{
 const replacement=new TextDecoder();replacement.decode(first,{stream:true});assert.equal(replacement.decode(),"�");
 const fatal=new TextDecoder("utf-8",{fatal:true});assert.equal(fatal.decode(first,{stream:true}),"");assert.throws(()=>fatal.decode(),TypeError);
});
test("supplement: SSE reassembles Chinese across all byte cuts, not just event boundaries",async()=>{
 const wire='event: delta\ndata: {"text":"你好🙂"}\n\nevent: end\ndata: {}\n\n';
 const bytes=new TextEncoder().encode(wire);
 for(let cut=1;cut<bytes.length;cut++){
  const messages=[];
  for await(const event of readSSE(stream([bytes.slice(0,cut),bytes.slice(cut)])))messages.push(event);
  assert.deepEqual(messages,[{event:"delta",data:'{"text":"你好🙂"}'},{event:"end",data:"{}"}]);
 }
});
