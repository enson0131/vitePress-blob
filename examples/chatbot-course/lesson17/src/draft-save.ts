export type DraftStatus = 'streaming' | 'answered' | 'incomplete';
export type SavedDraft = { answer: string; status: DraftStatus | 'waiting' | 'stopped' | 'failed' | 'refused'; revision: number };
export type DraftPut = (input: {answer: string; status: DraftStatus; revision: number; notice: string}) => Promise<SavedDraft>;

/**
 * Browser-side writer. SSE can arrive much faster than persistence.
 * - UI displays deltas immediately via the caller.
 * - Saving is serialized, never sending concurrent stale revisions.
 * - Timer OR pending byte budget triggers a checkpoint.
 * - The terminal 'answered' write is awaited before the UI claims success.
 */
export class BrowserDraftWriter {
  private answer: string;
  private persisted: string;
  private revision: number;
  private pendingBytes = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private chain: Promise<void> = Promise.resolve();
  private error: Error | null = null;
  private finished = false;
  private readonly put: DraftPut;
  readonly maxDelayMs: number;
  readonly maxBytes: number;

  constructor(initial: {answer: string; revision: number}, put: DraftPut,
    options: {maxDelayMs?: number; maxBytes?: number} = {}) {
    this.put = put;
    this.answer = this.persisted = initial.answer;
    this.revision = initial.revision;
    this.maxDelayMs = options.maxDelayMs ?? 800;
    this.maxBytes = options.maxBytes ?? 2048;
    if(this.maxDelayMs <= 0 || this.maxBytes <= 0) throw new Error('INVALID_LIMIT');
  }
  get text(){return this.answer}
  get lastSaved(){return this.persisted}
  get lastError(){return this.error}
  append(delta: string) {
    if(this.finished) throw new Error('WRITER_CLOSED');
    if(this.error) throw this.error;
    if(!delta) return;
    this.answer += delta;
    this.pendingBytes += new TextEncoder().encode(delta).byteLength;
    if(this.pendingBytes >= this.maxBytes) {
      // Checkpoint failures go into lastError and propagate when finalizing.
      void this.checkpoint().catch(()=>{});
    } else if(!this.timer) {
      this.timer=setTimeout(()=>{this.timer=undefined;void this.checkpoint().catch(()=>{})},this.maxDelayMs);
    }
  }
  checkpoint(status: DraftStatus = 'streaming', notice = ''):Promise<void> {
    if(this.timer){clearTimeout(this.timer);this.timer=undefined}
    const snapshot=this.answer;
    this.pendingBytes=0;
    // 'answered' must be committed even when the last streamed delta was checkpointed.
    const run=async()=>{
      if(this.error) throw this.error;
      if(status==='streaming' && snapshot===this.persisted) return;
      try {
        const updated=await this.put({answer:snapshot,status,revision:this.revision,notice});
        this.revision=updated.revision;
        this.persisted=updated.answer;
      } catch(e) {
        this.error=e instanceof Error?e:new Error(String(e));
        throw this.error;
      }
    };
    this.chain=this.chain.then(run);
    return this.chain;
  }
  async finish(status: Extract<DraftStatus,'answered'|'incomplete'>, notice='') {
    this.finished=true;
    await this.checkpoint(status,notice);
  }
  cancelTimer(){if(this.timer)clearTimeout(this.timer);this.timer=undefined;}
}
