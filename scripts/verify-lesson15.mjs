import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {pathToFileURL} from 'node:url'
import {join} from 'node:path'
const tools=process.env.LESSON_TOOLS;assert(tools,'LESSON_TOOLS required')
const {chromium}=await import(pathToFileURL(join(tools,'node_modules/playwright/index.mjs')).href)
const base='docs/.vitepress/theme/components/lesson15/'
const read=p=>readFileSync(p,'utf8'),sha=s=>createHash('sha256').update(s).digest('hex')
const source=read(base+'article.html'),supplement=read(base+'utf8-supplement.html'),user=read(base+'utf8-supplement.md')
assert.equal(sha(source),'335dae04534ba7149a0c96f3a4f54080d8d4e3d6f1228408942cfbe505e8ece2','Original article must remain byte-identical')
assert.equal(sha(user),'771931d42935b239d1440db52b896d3d4d96b269214220098a26b547a723dfc9','User supplement must remain complete')
assert.equal(sha(supplement),'861d93f0915170c84c353e64b106dd562e54d5aa95c8916b3362e803d7707cbf')
const anchor='<h2>四、后端：不再只调用一次 res.end</h2>'
const complete=source.replace(anchor,supplement+anchor)
assert.equal(sha(complete),'098369f8a97c9eba4482207f279ec7e063d747b58ad9b64d9bd541c71513aa58')
const questions=JSON.parse(read(base+'exercise-data.json'))
const target=process.env.LESSON_URL||'http://127.0.0.1:4173/vitePress-blob/guide/ai/chatbot-course/15-streaming-sse-chat'
const out=process.env.REPORT_DIR||'lesson15-verification';mkdirSync(out,{recursive:true})
if(process.env.WAIT_FOR_PAGES==='true'){
 let ready=false
 for(let i=0;i<72;i++){
  const r=await fetch(target+'?lesson15='+Date.now()).catch(()=>null)
  if(r?.ok&&(await r.text()).includes('utf8-supplement')){ready=true;break}
  await new Promise(r=>setTimeout(r,5000))
 }
 assert(ready,'New Pages content not ready')
}
const browser=await chromium.launch({headless:true})
const page=await browser.newPage({viewport:{width:1280,height:900},locale:'zh-CN'})
const errors=[];page.on('pageerror',e=>errors.push(e.message))
const report={target,originalSha256:sha(source),supplementSha256:sha(supplement),checks:[],browserErrors:errors,paidModelCalls:0}
try{
 const response=await page.goto(target,{waitUntil:'networkidle',timeout:60000});assert(response?.ok())
 await page.locator('#utf8-lab').waitFor()
 const got=await page.evaluate(({html,original})=>{
  const snap=n=>({blocks:[...n.children].map(x=>[x.tagName,x.textContent]),codes:[...n.querySelectorAll('pre code')].map(x=>x.textContent),tables:[...n.querySelectorAll('table')].map(t=>[...t.rows].map(r=>[...r.cells].map(c=>c.textContent)))})
  const expected=document.createElement('div');expected.innerHTML=html
  const initial=document.createElement('div');initial.innerHTML=original
  const actual=document.querySelector('.lesson15 .original')
  const unchanged=actual.cloneNode(true);unchanged.querySelector('#utf8-supplement').remove()
  return {expected:snap(expected),actual:snap(actual),initial:snap(initial),unchanged:snap(unchanged),suppCodes:[...actual.querySelectorAll('#utf8-supplement pre code')].map(x=>x.textContent)}
 },{html:complete,original:source})
 assert.deepEqual(got.actual,got.expected);assert.deepEqual(got.unchanged,got.initial)
 assert.equal(got.initial.blocks.length,110);assert.equal(got.actual.codes.length,14);assert.equal(got.actual.tables.length,2)
 assert(got.actual.codes.includes(read('examples/lesson15-streaming-chat/server/sse.ts')))
 assert(got.actual.codes.includes(read('examples/lesson15-streaming-chat/src/readChat.ts')))
 const userCodes=[...user.matchAll(/```\n([\s\S]*?)\n```/g)].map(m=>m[1]+'\n')
 assert.deepEqual(got.suppCodes,userCodes,'All five supplied byte/code blocks preserved')
 report.originalBlocks=110;report.codeBlocks=14;report.tables=2
 report.checks.push('Original 110 HTML blocks unchanged; added user text includes all five code/byte blocks and table; complete rendered page matches source')
 const results=await page.evaluate(async codes=>{
  const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor
  const outputs=[]
  function response(){return new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array([0xe4,0xbd]));c.enqueue(new Uint8Array([0xa0,0xe5,0xa5,0xbd]));c.close()}}))}
  for(const index of [1,2,4]){
   const logs=[]
   // Only remove TypeScript non-null assertions to execute the supplied snippets as JS.
   const fn=new AsyncFunction('response','fetch','console','{'+codes[index].replaceAll('body!','body')+'}')
   await fn(response(),async()=>response(),{log:x=>logs.push(x)})
   outputs.push(logs)
  }
  return outputs
 },got.suppCodes)
 assert.equal(results[0].join(''),'��好');assert.deepEqual(results[1],['','你好']);assert.equal(results[2].join(''),'你好')
 report.checks.push('Actual browser execution of all three supplied decoding snippets: wrong example reproduces corruption; both correct approaches yield 你好')
 await page.getByRole('button',{name:'接收第 1 段 E4 BD',exact:true}).click()
 assert.equal(await page.locator('.good-output').textContent(),'""');assert.equal(await page.locator('.bad-output').textContent(),'"�"')
 await page.getByRole('button',{name:'接收第 2 段 A0 E5 A5 BD',exact:true}).click()
 assert.equal(await page.locator('.good-output').textContent(),'"你好"');assert.equal(await page.locator('.bad-output').textContent(),'"��好"')
 await page.getByRole('button',{name:'运行 TextDecoderStream 对比',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.pipeline-output').textContent.includes('你好'))
 await page.getByRole('button',{name:'重置解码实验',exact:true}).click();assert.equal(await page.locator('#utf8-lab tbody tr').count(),0)
 report.checks.push('UTF8 step-by-step lab, native TextDecoderStream comparison and reset pass')
 for(const[scenario,state]of[['answered','answered'],['incomplete','incomplete'],['refused','refused'],['failed','failed'],['disconnect','failed']]){
  await page.getByRole('button',{name:'重置演示',exact:true}).click();await page.locator('#l15scenario').selectOption(scenario);await page.getByRole('button',{name:'开始演示',exact:true}).click()
  await page.waitForFunction(s=>document.querySelector('.demo-state').dataset.state===s,state)
  if(scenario==='disconnect'){assert.match(await page.locator('.notice').innerText(),/未收到结束/);assert(await page.locator('.draft').innerText())}
 }
 await page.getByRole('button',{name:'重置演示',exact:true}).click();await page.getByRole('button',{name:'开始演示',exact:true}).click()
 await page.waitForFunction(()=>document.querySelector('.demo-state').dataset.state==='streaming')
 await page.getByRole('button',{name:'停止生成',exact:true}).click();const draft=await page.locator('.draft').innerText();await page.waitForTimeout(600);assert.equal(await page.locator('.draft').innerText(),draft)
 await page.getByRole('button',{name:'重置演示',exact:true}).click()
 const submit=page.getByRole('button',{name:'提交评分',exact:true});assert(await submit.isDisabled())
 for(const[i,q]of questions.entries())await page.locator(`[name=q15-${i}]`).nth(q.a).check()
 await submit.click();assert.match(await page.locator('.score').innerText(),/4 \/ 4/)
 await page.locator('[name=q15-0]').nth(1).check();assert.equal(await page.locator('.score').count(),0);await submit.click();assert.match(await page.locator('.score').innerText(),/3 \/ 4/)
 await page.getByRole('button',{name:'重新作答',exact:true}).click();assert(await submit.isDisabled())
 report.checks.push('Original five streaming scenarios, stop/reset, four quizzes, explanations and full/wrong scores pass')
 for(const[name,width,dark]of[['desktop',1280,false],['mobile',390,false],['mobile-dark',390,true]]){
  await page.setViewportSize({width,height:900});await page.evaluate(d=>document.documentElement.classList.toggle('dark',d),dark)
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page overflow')
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:out+'/'+name+'-top.png'});await page.screenshot({path:out+'/'+name+'.png',fullPage:true})
  await page.locator('#utf8-supplement').scrollIntoViewIfNeeded();await page.screenshot({path:out+'/'+name+'-utf8.png'})
  await page.locator('#utf8-lab').scrollIntoViewIfNeeded();await page.screenshot({path:out+'/'+name+'-lab.png'})
 }
 assert.equal(errors.length,0);report.checks.push('Desktop/mobile/light/dark: no page overflow or runtime errors; screenshots captured');report.status='passed'
}catch(error){report.status='failed';report.error=String(error);await page.screenshot({path:out+'/failure.png',fullPage:true}).catch(()=>{});throw error}
finally{writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close()}
