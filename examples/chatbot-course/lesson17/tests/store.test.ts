import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {openStore} from '../server/store.ts';
import { DatabaseSync as NativeSqlite } from 'node:sqlite';

test('create, read, persist across reopen, ownership, cascade delete',()=>{
  const dir=mkdtempSync(join(tmpdir(),'lesson17-'));const file=join(dir,'chats.db');
  let s=openStore(file);
  try {
    const c=s.createConversation('alice','第一条会话');const t=s.addTurn('alice',c.id,'我叫小陈');
    let a=s.update('alice',c.id,t.id,t.revision,{answer:'你好小陈',status:'answered',notice:''});
    assert.equal(a.id,t.id);assert.equal(a.revision,1);
    assert.equal(s.read('alice',c.id).turns[0].answer,'你好小陈');
    assert.throws(()=>s.read('bob',c.id),/NOT_FOUND/);
    assert.throws(()=>s.update('bob',c.id,t.id,a.revision,{answer:'x',status:'answered',notice:''}),/CONFLICT_OR_NOT_FOUND/);
    s.close();s=openStore(file);
    assert.equal(s.read('alice',c.id).turns[0].answer,'你好小陈');
    assert.equal(s.list('alice').length,1);
    assert.equal(s.remove('bob',c.id),false);
    assert.equal(s.remove('alice',c.id),true);
    assert.equal(s.list('alice').length,0);
  } finally {s.close();rmSync(dir,{recursive:true,force:true})}
});

test('restore interrupted progress and reject stale revisions',()=>{
 const dir=mkdtempSync(join(tmpdir(),'lesson17-'));const file=join(dir,'db.sqlite');let s=openStore(file);
 try {
  const c=s.createConversation('demo');let t=s.addTurn('demo',c.id,'hi');
  const x=s.update('demo',c.id,t.id,t.revision,{answer:'半句',status:'streaming',notice:''});
  assert.throws(()=>s.update('demo',c.id,t.id,t.revision,{answer:'旧数据',status:'answered',notice:''}),/CONFLICT/);
  s.close();s=openStore(file);
  const after=s.getTurn('demo',c.id,t.id);
  assert.equal(after.answer,'半句');assert.equal(after.status,'incomplete');assert.equal(after.revision,x.revision+1);
  assert.equal(s.read('demo',c.id).turns.length,1);
 } finally {s.close();rmSync(dir,{recursive:true,force:true})}
});

test('migrate the earlier position schema to createdAt sorting without losing records',()=>{
 const dir=mkdtempSync(join(tmpdir(),'lesson17-migrate-'));const file=join(dir,'old.sqlite');
 const {DatabaseSync}=requireSqliteForTest();
 const old=new DatabaseSync(file);
 try{
  old.exec(`CREATE TABLE conversations(id TEXT PRIMARY KEY,user_id TEXT NOT NULL,title TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
    CREATE TABLE turns(id TEXT PRIMARY KEY,conversation_id TEXT NOT NULL,position INTEGER NOT NULL,question TEXT NOT NULL,answer TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL,notice TEXT NOT NULL DEFAULT '',revision INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
    INSERT INTO conversations VALUES ('conv','alice','legacy','2026-01-01T00:00:00.000Z','2026-01-01T00:00:00.000Z');
    INSERT INTO turns VALUES ('a','conv',0,'问题一','回答一','answered','',0,'2026-01-01T00:00:00.000Z','2026-01-01T00:00:00.000Z');
    INSERT INTO turns VALUES ('b','conv',1,'问题二','半句','streaming','',1,'2026-01-01T00:00:01.000Z','2026-01-01T00:00:01.000Z');`);
 }finally{old.close()}
 const s=openStore(file);
 try{
  const values=s.read('alice','conv').turns;
  assert.deepEqual(values.map(t=>t.id),['a','b']);
  assert.equal(values[1].status,'incomplete');
  assert.equal(values[1].answer,'半句');
  const t=s.addTurn('alice','conv','问题三');
  assert.equal(t.question,'问题三');
  assert(!('position' in t));
 }finally{s.close();rmSync(dir,{recursive:true,force:true})}
});

function requireSqliteForTest(){return {DatabaseSync:NativeSqlite}}

test('rename is API-style server-owned update and enforces user ownership',()=>{
 const dir=mkdtempSync(join(tmpdir(),'lesson17-title-'));
 const s=openStore(join(dir,'test.sqlite'));
 try{
  const c=s.createConversation('alice','旧标题');
  const changed=s.renameConversation('alice',c.id,'  新标题  ');
  assert.equal(changed.title,'新标题');
  assert.equal(s.read('alice',c.id).conversation.title,'新标题');
  assert.throws(()=>s.renameConversation('bob',c.id,'无权修改'),/NOT_FOUND/);
  assert.throws(()=>s.renameConversation('alice',c.id,'  '),/INVALID_TITLE/);
  assert.equal(s.read('alice',c.id).conversation.title,'新标题');
 }finally{s.close();rmSync(dir,{recursive:true,force:true})}
});
