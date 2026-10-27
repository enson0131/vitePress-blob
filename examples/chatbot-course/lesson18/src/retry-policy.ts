/** 第18篇：只自动重试“尚未开始流式生成”的明确临时错误。 */
export type RetryClass = 'retryable_prestream' | 'manual_reconcile' | 'permanent';

export function classifyStatus(status:number):RetryClass {
  if([429,502,503,504].includes(status)) return 'retryable_prestream';
  if(status===409) return 'manual_reconcile';
  return 'permanent';
}

/** Retry-After supports delay-seconds or HTTP-date; null means absent/invalid. */
export function parseRetryAfter(header:string|null,now=Date.now()):number|null {
  if(header===null) return null;
  const value=header.trim();
  if(/^\d+$/.test(value)) return Math.min(Number(value)*1000, 60_000);
  const date=Date.parse(value);
  return Number.isNaN(date)?null:Math.max(0,Math.min(date-now,60_000));
}

export function backoffMs(retryIndex:number,random=Math.random()):number {
  const cap=Math.min(4000,500*2**Math.max(0,retryIndex));
  return Math.floor(cap*Math.min(1,Math.max(0,random)));
}

export function waitOrAbort(ms:number,signal:AbortSignal):Promise<void>{
  return new Promise((resolve,reject)=>{
    if(signal.aborted){reject(new DOMException('请求已取消','AbortError'));return}
    const onAbort=()=>{clearTimeout(timer);signal.removeEventListener('abort',onAbort);reject(new DOMException('请求已取消','AbortError'))};
    const timer=setTimeout(()=>{signal.removeEventListener('abort',onAbort);resolve()},ms);
    signal.addEventListener('abort',onAbort,{once:true});
  });
}

/** HTTP 200 and response body handled by consumer; a stream error is not re-POSTed. */
export async function postBeforeStreamWithRetry(
  url:string,
  payload:unknown,
  signal:AbortSignal,
  onRetry:(attempt:number,delay:number,status:number)=>void=()=>{},
  request:typeof fetch=fetch
):Promise<Response>{
  const body=JSON.stringify(payload);
  for(let attempt=0;attempt<=2;attempt++){
    let response:Response;
    try{
      response=await request(url,{
        method:'POST',headers:{'Content-Type':'application/json'},body,signal
      });
    }catch(e){
      // Connection lost BEFORE headers: server may have created a Turn.
      // Do not blindly POST again; GET conversation to reconcile.
      throw new Error('NETWORK_UNKNOWN_OUTCOME：请重新加载会话核对是否已创建消息',{cause:e});
    }
    if(response.ok) return response;
    if(classifyStatus(response.status)!=='retryable_prestream'||attempt===2){
      throw new Error(`HTTP ${response.status}：请检查提示或手动处理`);
    }
    const retryAfter=parseRetryAfter(response.headers.get('retry-after'));
    const ms=retryAfter??backoffMs(attempt);
    onRetry(attempt+1,ms,response.status);
    await waitOrAbort(ms,signal);
  }
  throw new Error('UNREACHABLE');
}
