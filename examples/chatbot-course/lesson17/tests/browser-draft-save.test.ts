import test from 'node:test';
import assert from 'node:assert/strict';
import { BrowserDraftWriter } from '../src/draft-save.ts';
import { setTimeout as sleep } from 'node:timers/promises';

test('browser buffers deltas then saves at time threshold, not per chunk', async()=>{
 let rev=0, writes=0; const saves:string[]=[];
 const writer=new BrowserDraftWriter({answer:'',revision:0},async input=>{
  assert.equal(input.revision,rev++);writes++;saves.push(input.answer);
  return {answer:input.answer,status:input.status,revision:rev};
 },{maxDelayMs:45,maxBytes:2048});
 writer.append('你好');writer.append('世界');assert.equal(writes,0);
 await sleep(75);assert.equal(writes,1);assert.equal(saves[0],'你好世界');
 await writer.finish('answered');assert.equal(writes,2);
 assert.equal(writer.lastSaved,'你好世界');
});
test('UTF-8 threshold saves one full snapshot; terminal save is serialized',async()=>{
 let rev=0;const saves:Array<{answer:string,status:string,revision:number}>=[];
 const writer=new BrowserDraftWriter({answer:'',revision:0},async input=>{
  await sleep(4);assert.equal(input.revision,rev++);saves.push(input);
  return {answer:input.answer,status:input.status,revision:rev};
 },{maxDelayMs:300,maxBytes:6});
 writer.append('中');writer.append('文');writer.append('补充');
 await writer.finish('answered');
 assert.equal(saves.at(-1)?.answer,'中文补充');
 assert.equal(saves.at(-1)?.status,'answered');
 assert(saves.every((s,i)=>s.revision===i));
});
test('failed PUT propagates; never claims answered without final commit',async()=>{
 const writer=new BrowserDraftWriter({answer:'',revision:0},async()=>{throw new Error('DB_DOWN')});
 writer.append('abc');await assert.rejects(()=>writer.finish('answered'),/DB_DOWN/);
 assert.equal(writer.lastSaved,'');
});
