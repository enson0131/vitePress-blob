<script setup lang="ts">
import { ref } from 'vue'
const step=ref(0),bad=ref(''),good=ref(''),rows=ref<{bytes:string;bad:string;good:string}[]>([])
const streamResult=ref(''),running=ref(false)
const chunks=[new Uint8Array([0xe4,0xbd]),new Uint8Array([0xa0,0xe5,0xa5,0xbd])]
let decoder:TextDecoder|undefined,epoch=0
function next(){
 if(step.value>=chunks.length)return
 decoder??=new TextDecoder('utf-8')
 const chunk=chunks[step.value]
 const wrong=new TextDecoder('utf-8').decode(chunk)
 const right=decoder.decode(chunk,{stream:true})
 bad.value+=wrong;good.value+=right
 rows.value.push({bytes:Array.from(chunk,b=>b.toString(16).padStart(2,'0').toUpperCase()).join(' '),bad:JSON.stringify(wrong),good:JSON.stringify(right)})
 step.value++
 if(step.value===chunks.length)good.value+=decoder.decode()
}
function reset(){epoch++;step.value=0;bad.value='';good.value='';rows.value=[];decoder=undefined;streamResult.value='';running.value=false}
async function pipeline(){
 const token=epoch;running.value=true
 try{
  const input=new ReadableStream<Uint8Array>({start(c){chunks.forEach(v=>c.enqueue(v));c.close()}})
  const reader=input.pipeThrough(new TextDecoderStream()).getReader()
  let text=''
  try{while(true){const part=await reader.read();if(part.done)break;text+=part.value}}
  finally{reader.releaseLock()}
  if(token===epoch)streamResult.value=text
 }catch{if(token===epoch)streamResult.value='当前浏览器无法运行 TextDecoderStream 示例。'}
 finally{if(token===epoch)running.value=false}
}
</script>
<template><section id="utf8-lab" class="utf8-lab">
<h2>中文分块解码实验</h2><p>真实使用浏览器解码器处理固定字节；不发送网络请求。第一次只给“你”的前两个字节，第二次补齐并附上“好”。</p>
<div class="actions"><button type="button" :disabled="step>=2" @click="next">{{step===0?'接收第 1 段 E4 BD':step===1?'接收第 2 段 A0 E5 A5 BD':'两段已收齐'}}</button><button type="button" @click="reset">重置解码实验</button></div>
<div class="comparison"><p>每段新建解码器：<code class="bad-output">{{JSON.stringify(bad)}}</code></p><p>同一实例 + stream: true：<code class="good-output">{{JSON.stringify(good)}}</code></p></div>
<table v-if="rows.length"><thead><tr><th>收到的字节</th><th>独立解码</th><th>流式解码</th></tr></thead><tbody><tr v-for="(row,i) in rows" :key="i"><td>{{row.bytes}}</td><td>{{row.bad}}</td><td>{{row.good}}</td></tr></tbody></table>
<p class="utf8-status" role="status">{{step===0?'尚未接收数据':step===1?'第一段还不能组成完整字符：正确输出为空字符串。':'字节已补齐：正确结果为“你好”。'}}</p>
<button type="button" :disabled="running" @click="pipeline">运行 TextDecoderStream 对比</button><p class="pipeline-output" role="status">{{streamResult?'TextDecoderStream 结果：'+streamResult:''}}</p>
<small>实验只负责 UTF-8 解码；SSE 事件仍需等分隔空行后再解析。</small>
</section></template>
<style scoped>
.utf8-lab{min-width:0;border-bottom:1px solid var(--vp-c-divider);padding-bottom:24px;margin-bottom:24px}.utf8-lab h2{font-size:23px;line-height:1.5}.utf8-lab p{margin:14px 0}.actions{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0}button{padding:8px 12px;border:1px solid var(--vp-c-divider);background:var(--vp-c-bg);color:inherit;border-radius:8px;cursor:pointer}button:disabled{opacity:.45;cursor:not-allowed}button:focus-visible{outline:2px solid var(--vp-c-brand-1);outline-offset:3px}.comparison{padding:4px 14px;border-radius:10px;background:var(--vp-c-bg-soft)}code{overflow-wrap:anywhere}table{display:block;max-width:100%;overflow-x:auto;font-size:13px}td,th{padding:8px;border:1px solid var(--vp-c-divider)}.utf8-status{font-weight:600}small{color:var(--vp-c-text-2)}@media(max-width:600px){.utf8-lab h2{font-size:21px}}
</style>
