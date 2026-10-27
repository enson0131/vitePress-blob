import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {pathToFileURL} from 'node:url'
import {join} from 'node:path'
const tools=process.env.LESSON_TOOLS
assert(tools,'LESSON_TOOLS is required')
const {chromium}=await import(pathToFileURL(join(tools,'node_modules/playwright/index.mjs')).href)
const manifest=JSON.parse(readFileSync('scripts/lesson16-source-manifest.json','utf8'))
for(const [path,expected] of Object.entries(manifest)){
 const b=readFileSync(path)
 assert.equal(createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex'),expected,`Source changed: ${path}`)
}
const base='docs/.vitepress/theme/components/lesson16/'
const source=readFileSync(base+'article.html','utf8')
const sha256=s=>createHash('sha256').update(s).digest('hex')
assert.equal(sha256(source),'7d4d5d0d598fdf6c67de6e73175fa1fceec0c500dde1219f58b97ff1a444503c')
const questions=JSON.parse(readFileSync(base+'exercise-data.json','utf8'))
const target=process.env.LESSON_URL||'http://127.0.0.1:4173/vitePress-blob/guide/ai/chatbot-course/16-multiturn-message-state'
const out=process.env.REPORT_DIR||'lesson16-verification/local'
mkdirSync(out,{recursive:true})
if(process.env.WAIT_FOR_PAGES==='true'){
 let ready=false
 for(let i=0;i<84;i++){
  const r=await fetch(target+'?check='+Date.now()).catch(()=>null)
  if(r?.ok&&(await r.text()).includes('lesson16')){ready=true;break}
  await new Promise(r=>setTimeout(r,5000))
 }
 assert(ready,'Published lesson 16 did not become available')
}
const browser=await chromium.launch({headless:true})
const context=await browser.newContext({viewport:{width:1280,height:900},locale:'zh-CN',permissions:['clipboard-read','clipboard-write']})
const page=await context.newPage();page.setDefaultTimeout(12000)
const errors=[];page.on('pageerror',e=>errors.push(e.message))
const report={target,articleSha256:sha256(source),sourceFiles:Object.keys(manifest).length,checks:['All 36 source files match revised package Git blob hashes'],errors}
try{
 await page.addInitScript(()=>localStorage.setItem('vitepress-theme-appearance','light'))
 const r=await page.goto(target,{waitUntil:'networkidle',timeout:60000});assert(r?.ok())
 await page.locator('.lesson16 .original .code-tools').first().waitFor()
 const got=await page.evaluate(html=>{
  const expected=document.createElement('div');expected.innerHTML=html
  const actual=document.querySelector('.lesson16 .original').cloneNode(true)
  actual.querySelectorAll('[data-ui]').forEach(n=>n.remove())
  const snapshot=n=>({blocks:[...n.children].map(x=>[x.tagName,x.textContent]),codes:[...n.querySelectorAll('pre code')].map(x=>x.textContent),tables:[...n.querySelectorAll('table')].map(t=>[...t.rows].map(r=>[...r.cells].map(c=>c.textContent))),headings:n.querySelectorAll('h1,h2,h3').length})
  return {expected:snapshot(expected),actual:snapshot(actual)}
 },source)
 assert.deepEqual(got.actual,got.expected)
 assert.equal(got.actual.blocks.length,116);assert.equal(got.actual.codes.length,15);assert.equal(got.actual.tables.length,1);assert.equal(got.actual.headings,18)
 report.checks.push('116 ordered blocks, 15 complete code blocks, 1 table and 18 headings match source')
 report.codeSha256=got.actual.codes.map(sha256)
 for(let i=0;i<15;i++){
  await page.locator('.lesson16 .original').getByRole('button',{name:'复制代码',exact:true}).nth(i).click()
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),got.actual.codes[i])
 }
 await page.locator('.lesson16 .original').getByRole('button',{name:'切换换行',exact:true}).first().click()
 assert(await page.locator('.lesson16 .original pre').first().evaluate(n=>n.classList.contains('wrap')))
 await page.locator('.lesson16 .original').getByRole('button',{name:'切换换行',exact:true}).first().click()
 report.checks.push('All 15 code copies match exactly; wrapping toggles')
 const lab=page.locator('.lesson16 .supplement')
 const click=name=>lab.getByRole('button',{name,exact:true}).click()
 await click('开始一轮');await click('收到一段文字');await click('停止当前生成')
 const stopped=await lab.locator('.readout>p').first().innerText();assert.match(stopped,/T1/)
 await click('重新回答');await click('收到一段文字')
 const answer=await lab.locator('.answer').innerText()
 for(const name of ['注入旧请求增量','注入旧请求结束','注入旧请求报错','执行旧请求清理']){
  await click(name);assert.equal(await lab.locator('.answer').innerText(),answer)
  assert.match(await lab.locator('.terminal').innerText(),/生成中/)
  assert.match(await lab.locator('.readout>p').first().innerText(),/T1.*有效控制器/)
 }
 await click('完成当前回答');assert.match(await lab.locator('.terminal').innerText(),/生成完成/)
 await click('重置实验')
 for(let i=0;i<8;i++){await click('开始一轮');await click('完成当前回答')}
 const history=JSON.parse(await lab.locator('pre code').innerText())
 assert.equal(history.length,16);assert.equal(history[0].content,'我叫小陈')
 await click('开始一轮');await click('新会话');await click('注入旧请求结束')
 assert.match(await lab.locator('.terminal').innerText(),/尚未开始/)
 assert.equal(JSON.parse(await lab.locator('pre code').innerText()).length,0)
 await click('重置实验')
 report.checks.push('Fixed T1 retry; stale delta/end/error/finally ignored; all 8 answered pairs retained; new conversation isolated')
 const submit=lab.getByRole('button',{name:'提交评分',exact:true});assert(await submit.isDisabled())
 for(const [i,q] of questions.entries())await lab.locator(`[name="l16-q-${i}"]`).nth(q.answer).check()
 await submit.click();assert.match(await lab.locator('.score').innerText(),/4 \/ 4/);assert.equal(await lab.locator('.feedback').count(),4)
 await lab.locator('[name="l16-q-0"]').nth(0).check();assert.equal(await lab.locator('.score').count(),0)
 await submit.click();assert.match(await lab.locator('.score').innerText(),/3 \/ 4/)
 await click('重新作答');assert(await submit.isDisabled());assert.equal(await lab.locator('input:checked').count(),0)
 report.checks.push('Four questions: scoring, wrong-answer explanations and reset')
 for(const [name,width,dark] of [['desktop',1280,false],['mobile',390,false],['mobile-dark',390,true]]){
  await page.setViewportSize({width,height:900});await page.evaluate(d=>document.documentElement.classList.toggle('dark',d),dark)
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal page overflow')
  assert.equal(await page.locator('.lesson16 .original>*').evaluateAll(nodes=>nodes.filter(n=>getComputedStyle(n).display==='none').length),0)
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:out+'/'+name+'-top.png'})
  await lab.scrollIntoViewIfNeeded();await page.screenshot({path:out+'/'+name+'-lab.png'})
  await page.screenshot({path:out+'/'+name+'-full.png',fullPage:true})
 }
 report.checks.push('1280px desktop and 390px mobile, light/dark; no hidden original blocks or horizontal overflow')
 if(process.env.APP_URL){
  const app=await context.newPage();app.setDefaultTimeout(15000);app.on('pageerror',e=>errors.push('React: '+e.message))
  await app.goto(process.env.APP_URL,{waitUntil:'networkidle'})
  const send=async(text,status='answered')=>{
   await app.locator('#q').fill(text);await app.getByRole('button',{name:'发送',exact:true}).click()
   await app.locator(`.turn:last-child [data-status="${status}"]`).waitFor()
  }
  await send('我叫小陈');await send('我叫什么？')
  assert.match(await app.locator('.turn:last-child .assistant p').first().innerText(),/你叫小陈/)
  let body=JSON.parse(await app.locator('[data-testid=request]').textContent())
  assert.equal(body.history.length,2);assert.equal(Object.hasOwn(body,'runId'),false)
  await app.locator('#scenario').selectOption('failed');await send('失败后重试','failed')
  const id=await app.locator('.turn').last().getAttribute('data-turn-id');const count=await app.locator('.turn').count()
  await app.locator('#scenario').selectOption('')
  await app.getByRole('button',{name:'重新回答这一题',exact:true}).click()
  await app.locator('.turn:last-child [data-status="answered"]').waitFor()
  assert.equal(await app.locator('.turn').count(),count);assert.equal(await app.locator('.turn').last().getAttribute('data-turn-id'),id)
  body=JSON.parse(await app.locator('[data-testid=request]').textContent());assert.equal(body.history.length,4);assert.equal(body.turnId,id)
  await app.locator('#q').fill('停止测试');await app.getByRole('button',{name:'发送',exact:true}).click()
  await app.locator('.turn:last-child [data-status="streaming"]').waitFor()
  await app.getByRole('button',{name:'停止生成',exact:true}).click()
  await app.locator('.turn:last-child [data-status="stopped"]').waitFor()
  const before=await app.locator('[data-testid=conversation-id]').innerText()
  await app.getByRole('button',{name:'新会话',exact:true}).click()
  assert.notEqual(await app.locator('[data-testid=conversation-id]').innerText(),before)
  assert.equal(await app.locator('.turn').count(),0)
  await send('我叫什么？');assert.match(await app.locator('.turn:last-child .assistant p').first().innerText(),/没有你的名字/)
  await app.screenshot({path:out+'/react-mock.png',fullPage:true});await app.close()
  report.checks.push('Actual React app + local Node HTTP mock: two-turn history, stable-ID failed retry, stop and new conversation; no paid models')
 }
 assert.equal(errors.length,0);report.status='passed'
}catch(e){report.status='failed';report.error=String(e);await page.screenshot({path:out+'/failure.png',fullPage:true}).catch(()=>{});throw e}
finally{writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close()}
