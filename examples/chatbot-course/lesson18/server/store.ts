import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

export const statuses = ['waiting','streaming','answered','refused','incomplete','stopped','failed'] as const;
export type TurnStatus = typeof statuses[number];
export type Turn = { id:string; conversationId:string; question:string; answer:string; status:TurnStatus; notice:string; revision:number; createdAt:string; updatedAt:string };
export type Conversation = { id:string; title:string; createdAt:string; updatedAt:string };
const now = () => new Date().toISOString();

export function openStore(path = './data/chats.sqlite') {
  if (path !== ':memory:') mkdirSync(dirname(path), {recursive:true});
  const db = new DatabaseSync(path, {timeout: 3000});
  db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, title TEXT NOT NULL,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS turns (
      id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      question TEXT NOT NULL, answer TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL CHECK(status IN ('waiting','streaming','answered','refused','incomplete','stopped','failed')),
      notice TEXT NOT NULL DEFAULT '', revision INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_conversation_owner ON conversations(user_id, updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_turns_by_conversation ON turns(conversation_id, created_at, id);`);
  // Lesson 17 revision: migrate an earlier demo DB that used position.
  // A fresh database needs no migration. Back up real data before schema changes.
  const legacyColumns = db.prepare('PRAGMA table_info(turns)').all() as Array<{name:string}>;
  if (legacyColumns.some(c => c.name === 'position')) {
    db.exec('BEGIN IMMEDIATE');
    try {
      db.exec(`
        CREATE TABLE turns_next (
          id TEXT PRIMARY KEY,
          conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
          question TEXT NOT NULL, answer TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL CHECK(status IN ('waiting','streaming','answered','refused','incomplete','stopped','failed')),
          notice TEXT NOT NULL DEFAULT '', revision INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL, updated_at TEXT NOT NULL
        );
        INSERT INTO turns_next
          (id,conversation_id,question,answer,status,notice,revision,created_at,updated_at)
        SELECT id,conversation_id,question,answer,status,notice,revision,created_at,updated_at FROM turns;
        DROP TABLE turns;
        ALTER TABLE turns_next RENAME TO turns;
        CREATE INDEX idx_turns_by_conversation ON turns(conversation_id,created_at,id);
      `);
      db.exec('COMMIT');
    } catch (e) { db.exec('ROLLBACK'); throw e; }
  }
  // Chapter 18 migration: retrying the original POST must not duplicate a Turn.
  const columns=db.prepare('PRAGMA table_info(turns)').all() as Array<{name:string}>;
  if(!columns.some(c=>c.name==='client_key')) db.exec('ALTER TABLE turns ADD COLUMN client_key TEXT');
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_turn_client_key ON turns(conversation_id,client_key) WHERE client_key IS NOT NULL');
  // If the server crashed mid-response, never pretend a previous draft completed.
  db.prepare(`UPDATE turns SET status='incomplete',notice='服务重启后恢复：上次生成未确认完成',updated_at=?,revision=revision+1 WHERE status IN ('waiting','streaming')`).run(now());

  const owns = db.prepare('SELECT id FROM conversations WHERE id=? AND user_id=?');
  const row = (r: any):Turn => ({id:r.id,conversationId:r.conversation_id,question:r.question,answer:r.answer,status:r.status,notice:r.notice,revision:r.revision,createdAt:r.created_at,updatedAt:r.updated_at});
  const check = (userId:string, conversationId:string) => {
    if (!owns.get(conversationId,userId)) throw new Error('NOT_FOUND');
  };
  const getTurnStmt=db.prepare(`SELECT t.* FROM turns t JOIN conversations c ON c.id=t.conversation_id
    WHERE c.user_id=? AND t.conversation_id=? AND t.id=?`);
  return {
    close(){db.close()},
    createConversation(userId:string,title='新对话'):Conversation {
      const id=randomUUID(), time=now();
      db.prepare('INSERT INTO conversations(id,user_id,title,created_at,updated_at) VALUES(?,?,?,?,?)').run(id,userId,title,time,time);
      return {id,title,createdAt:time,updatedAt:time};
    },
    renameConversation(userId:string, conversationId:string, title:string):Conversation {
      const clean = title.trim();
      if (!clean || clean.length > 80) throw new Error('INVALID_TITLE');
      const changed = db.prepare('UPDATE conversations SET title=?,updated_at=? WHERE id=? AND user_id=?')
        .run(clean,now(),conversationId,userId);
      if (changed.changes !== 1) throw new Error('NOT_FOUND');
      return db.prepare('SELECT id,title,created_at AS createdAt,updated_at AS updatedAt FROM conversations WHERE id=? AND user_id=?')
        .get(conversationId,userId) as Conversation;
    },
    list(userId:string):Conversation[] {
      return db.prepare('SELECT id,title,created_at AS createdAt,updated_at AS updatedAt FROM conversations WHERE user_id=? ORDER BY updated_at DESC').all(userId) as Conversation[];
    },
    read(userId:string,conversationId:string) {
      check(userId,conversationId);
      const conversation=db.prepare('SELECT id,title,created_at AS createdAt,updated_at AS updatedAt FROM conversations WHERE id=?').get(conversationId) as Conversation;
      const turns=db.prepare('SELECT * FROM turns WHERE conversation_id=? ORDER BY created_at ASC, id ASC').all(conversationId).map(row);
      return {conversation,turns};
    },
    getTurn(userId:string,conversationId:string,turnId:string):Turn {
      const result=getTurnStmt.get(userId,conversationId,turnId);
      if (!result) throw new Error('NOT_FOUND');
      return row(result);
    },
    addTurn(userId:string,conversationId:string,question:string):Turn {
      check(userId,conversationId);
      const id=randomUUID(),time=now();
      db.exec('BEGIN IMMEDIATE');
      try {
        db.prepare(`INSERT INTO turns(id,conversation_id,question,answer,status,notice,revision,created_at,updated_at)
          VALUES(?,?,?,'','waiting','',0,?,?)`).run(id,conversationId,question,time,time);
        db.prepare('UPDATE conversations SET updated_at=? WHERE id=?').run(time,conversationId);
        db.exec('COMMIT');
      }catch(e){db.exec('ROLLBACK');throw e}
      return this.getTurn(userId,conversationId,id);
    },
    addTurnIdempotently(userId:string,conversationId:string,question:string,clientKey:string):{turn:Turn;created:boolean} {
      if(!/^[a-f0-9-]{36}$/i.test(clientKey))throw new Error('INVALID_CLIENT_KEY');
      check(userId,conversationId);
      db.exec('BEGIN IMMEDIATE');
      try {
        const existing=db.prepare('SELECT id,question FROM turns WHERE conversation_id=? AND client_key=?')
          .get(conversationId,clientKey) as {id:string;question:string}|undefined;
        if(existing){
          if(existing.question!==question)throw new Error('IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_QUESTION');
          db.exec('COMMIT');
          return {turn:this.getTurn(userId,conversationId,existing.id),created:false};
        }
        const id=randomUUID(),time=now();
        db.prepare(`INSERT INTO turns(id,conversation_id,question,answer,status,notice,revision,created_at,updated_at,client_key)
          VALUES(?,?,?,'','waiting','',0,?,?,?)`).run(id,conversationId,question,time,time,clientKey);
        db.prepare('UPDATE conversations SET updated_at=? WHERE id=?').run(time,conversationId);
        db.exec('COMMIT');
        return {turn:this.getTurn(userId,conversationId,id),created:true};
      }catch(e){db.exec('ROLLBACK');throw e}
    },
    update(userId:string,conversationId:string,turnId:string,expectedRevision:number,patch:{answer:string;status:TurnStatus;notice:string}):Turn {
      const time=now();
      const changed=db.prepare(`UPDATE turns SET answer=?,status=?,notice=?,revision=revision+1,updated_at=?
        WHERE id=? AND conversation_id=? AND revision=? AND EXISTS (
          SELECT 1 FROM conversations c WHERE c.id=turns.conversation_id AND c.user_id=?
        )`).run(patch.answer,patch.status,patch.notice,time,turnId,conversationId,expectedRevision,userId);
      if (changed.changes!==1) throw new Error('CONFLICT_OR_NOT_FOUND');
      db.prepare('UPDATE conversations SET updated_at=? WHERE id=?').run(time,conversationId);
      return this.getTurn(userId,conversationId,turnId);
    },
    // Browser submits checkpoints. Server checks ownership, revision, and
    // a narrow status transition. This DOES NOT authenticate AI authorship.
    saveBrowserDraft(userId:string,conversationId:string,turnId:string,expectedRevision:number,
      draft:{answer:string;status:TurnStatus;notice:string}):Turn {
      const previous=this.getTurn(userId,conversationId,turnId);
      if (!['waiting','streaming'].includes(previous.status)) throw new Error('INVALID_STATUS');
      if (!['streaming','answered','incomplete'].includes(draft.status)) throw new Error('INVALID_STATUS');
      // Answer snapshots should grow while streaming. A retry resets separately.
      if (!draft.answer.startsWith(previous.answer)) throw new Error('INVALID_DRAFT');
      return this.update(userId,conversationId,turnId,expectedRevision,draft);
    },
    markUnfinished(userId:string,conversationId:string,turnId:string,status:'incomplete'|'stopped'|'failed',notice:string):Turn {
      const previous=this.getTurn(userId,conversationId,turnId);
      if (!['waiting','streaming'].includes(previous.status)) return previous;
      return this.update(userId,conversationId,turnId,previous.revision,{answer:previous.answer,status,notice});
    },
    remove(userId:string,conversationId:string):boolean {
      return db.prepare('DELETE FROM conversations WHERE id=? AND user_id=?').run(conversationId,userId).changes===1;
    }
  }
}
