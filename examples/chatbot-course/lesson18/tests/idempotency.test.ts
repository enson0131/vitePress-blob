import test from 'node:test';import assert from 'node:assert/strict';
import {openStore} from '../server/store.ts';
import {randomUUID} from 'node:crypto';
test('same key+same question creates a single stable Turn',()=>{
 const s=openStore(':memory:');try{
  const user='u',c=s.createConversation(user),key=randomUUID();
  const a=s.addTurnIdempotently(user,c.id,'什么是闭包？',key);
  const b=s.addTurnIdempotently(user,c.id,'什么是闭包？',key);
  assert.equal(a.created,true);assert.equal(b.created,false);
  assert.equal(a.turn.id,b.turn.id);assert.equal(s.read(user,c.id).turns.length,1);
  assert.throws(()=>s.addTurnIdempotently(user,c.id,'篡改问题',key),/IDEMPOTENCY_KEY_REUSED/);
  assert.equal(s.read(user,c.id).turns.length,1);
 }finally{s.close()}
});
test('same key in separate conversations is isolated; unauthorized user cannot add',()=>{
 const s=openStore(':memory:');try{
  const key=randomUUID(),a=s.createConversation('u'),b=s.createConversation('u');
  const x=s.addTurnIdempotently('u',a.id,'q',key),y=s.addTurnIdempotently('u',b.id,'q',key);
  assert.notEqual(x.turn.id,y.turn.id);
  assert.throws(()=>s.addTurnIdempotently('other',a.id,'q',randomUUID()),/NOT_FOUND/);
 }finally{s.close()}
});
