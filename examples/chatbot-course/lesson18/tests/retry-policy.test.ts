import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyStatus,parseRetryAfter,backoffMs,postBeforeStreamWithRetry} from '../src/retry-policy.ts';

test('only expected pre-stream HTTP statuses are considered transient',()=>{
 for(const s of [429,502,503,504]) assert.equal(classifyStatus(s),'retryable_prestream');
 for(const s of [400,401,403,404,422]) assert.equal(classifyStatus(s),'permanent');
 assert.equal(classifyStatus(409),'manual_reconcile');
});
test('Retry-After seconds, HTTP date, missing and jitter',()=>{
 assert.equal(parseRetryAfter('2'),2000);
 assert.equal(parseRetryAfter('Wed, 21 Oct 2015 07:28:00 GMT',Date.parse('2015-10-21T07:27:59Z')),1000);
 assert.equal(parseRetryAfter('broken'),null);
 assert.equal(parseRetryAfter(null),null);
 assert.equal(backoffMs(0,0),0);
 assert.equal(backoffMs(0,1),500);
 assert.equal(backoffMs(2,1),2000);
 assert.equal(backoffMs(20,1),4000);
});
test('429 retries same request payload, no new key',async()=>{
 const bodies:string[]=[];const hints:number[]=[];
 const fake:typeof fetch=async(_url,init)=>{
  bodies.push(String(init?.body));
  if(bodies.length===1)return new Response(JSON.stringify({error:'RATE_LIMIT'}),{status:429,headers:{'Retry-After':'0'}});
  return new Response('event: end\ndata: {}\n\n',{status:200});
 };
 const response=await postBeforeStreamWithRetry('/api',{question:'Q',clientKey:'KEY'},new AbortController().signal,(_attempt,delay)=>hints.push(delay),fake);
 assert.equal(response.status,200);
 assert.deepEqual(bodies,[bodies[0],bodies[0]]);
 assert.deepEqual(hints,[0]);
});
test('403 does not retry',async()=>{
 let calls=0;const fake:typeof fetch=async()=>{calls++;return new Response('',{status:403})};
 await assert.rejects(postBeforeStreamWithRetry('/',{},new AbortController().signal,()=>{},fake),/403/);
 assert.equal(calls,1);
});
test('network error before headers is unknown outcome, never silently repeats',async()=>{
 let calls=0;const fake:typeof fetch=async()=>{calls++;throw new Error('connection reset')};
 await assert.rejects(postBeforeStreamWithRetry('/',{},new AbortController().signal,()=>{},fake),/UNKNOWN_OUTCOME/);
 assert.equal(calls,1);
});
