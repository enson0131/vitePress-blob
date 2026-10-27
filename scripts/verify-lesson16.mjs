import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {pathToFileURL} from 'node:url'
import {join} from 'node:path'
const tools=process.env.LESSON_TOOLS
assert(tools,'LESSON_TOOLS is required')
const {chromium}=await import(pathToFileURL(join(tools,'node_modules/playwright/index.mjs')).href)
const manifest=JSON.parse(readFileSync('scripts/lesson16-source-hashes.json','utf8'))
const sha=b=>createHash('sha256').update(b).digest('hex')
for(const [path,expected] of Object.entries(manifest))assert.equal(sha(readFileSync(path)),expected,path+' differs from approved package')
const source=readFileSync('docs/.vitepress/theme/components/lesson16/article.html','utf8')
assert(!source.includes('本版不需要在 Turn、事件或请求体里再保存一个'))
const url=process.env.LESSON_URL||'http://127.0.0.1:4173/vitePress-blob/guide/ai/chatbot-course/16-multiturn-message-state'
const out=process.env.REPORT_DIR||'lesson16-verification/local'
mkdirSync(out,{recursive:true})
if(process.env.WAIT_FOR_PAGES==='true'){
 let ready=false
 for(let i=0;i<72;i++){
  const r=await fetch(url+'?lesson16='+Date.now()).catch(()=>null)
  if(r?.ok&&(await r.text()).includes('保留所有状态的回答，截取最近 6 轮')){ready=true;break}
  await new Promise(r=>setTimeout(r,5000))
 }
 assert(ready,'Published chapter 16 not ready')
}
const browser=await chromium.launch({headless:true})
const context=await browser.newContext({viewport:{width:1280,height:900},locale:'zh-CN',permissions:['clipboard-read','clipboard-write']})
const page=await context.newPage();const errors=[]
page.on('pageerror',e=>errors.push(e.message))
const report={url,sourceFiles:Object.keys(manifest).length,sourceSha256:sha(source),checks:[],errors}
try{
 await page.addInitScript(()=>localStorage.setItem('vitepress-theme-appearance','light'))
 const response=await page.goto(url,{waitUntil:'networkidle',timeout:60000});assert(response?.ok())
 await page.locator('.lesson16 .code-tools').first().waitFor()
 const data=await page.evaluate(html=>{
  const expected=document.createElement('div');expected.innerHTML=html
  const actual=document.querySelector('.lesson16 .original').cloneNode(true);actual.querySelectorAll('[data-ui]').forEach(n=>n.remove())
  const snap=n=>({blocks:[...n.children].map(x=>[x.tagName,x.textContent]),codes:[...n.querySelectorAll('pre code')].map(x=>x.textContent),tables:[...n.querySelectorAll('table')].map(t=>[...t.rows].map(r=>[...r.cells].map(c=>c.textContent)))})
  return {expected:snap(expected),actual:snap(actual)}
 },source)
 assert.deepEqual(data.actual,data.expected)
 assert.equal(data.actual.blocks.length,118);assert.equal(data.actual.codes.length,15);assert.equal(data.actual.tables.length,1)
 report.content={blocks:118,codeBlocks:15,tables:1}
 report.checks.push('38 approved files verified by SHA256; all 118 rendered blocks, 15 code blocks and table match full source')
 for(let i=0;i<15;i++){
  await page.getByRole('button',{name:'复制代码',exact:true}).nth(i).click()
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),data.actual.codes[i])
 }
 await page.getByRole('button',{name:'切换换行',exact:true}).first().click();assert(await page.locator('.original pre').first().evaluate(n=>n.classList.contains('wrap')))
 await page.getByRole('button',{name:'切换换行',exact:true}).first().click()
 report.checks.push('All 15 code blocks copy completely; wrapping works')
 const click=async name=>page.getByRole('button',{name,exact:true}).click()
 const lab=page.locator('.lesson16 .supplement')
 await click('开始一轮');await click('收到一段文字');await click('停止当前生成');await click('重新回答')
 assert.match(await lab.locator('.readout').innerText(),/T1/)
 for(const name of ['注入旧请求增量','注入旧请求结束','注入旧请求报错','执行旧请求清理']){
  await click(name);assert.equal(await lab.locator('.answer').innerText(),'（尚无正文）')
  assert.match(await lab.locator('.terminal').innerText(),/等待首段/);assert.match(await lab.locator('.readout').innerText(),/有效控制器/)
 }
 await click('收到一段文字');await click('完成当前回答');assert.match(await lab.locator('.terminal').innerText(),/生成完成/)
 for(let i=0;i<7;i++){await click('开始一轮');await click('完成当前回答')}
 let history=JSON.parse(await lab.locator('pre code').innerText());assert.equal(history.length,12)
 await click('载入8轮混合状态');history=JSON.parse(await lab.locator('pre code').innerText())
 assert.equal(history.length,11);assert.equal(history[0].content,'第3轮问题');assert.equal(history.at(-1).content,'第8轮问题')
 assert(history.some(m=>m.content==='第6轮已有回答'));assert(!history.some(m=>m.content.includes('模拟网络错误')))
 assert.equal(await lab.locator('.eventlog').nth(1).locator(':scope > div').count(),8)
 await click('新会话');await click('开始一轮');await click('注入旧请求结束');assert.match(await lab.locator('.terminal').innerText(),/等待首段/)
 await click('重置实验');assert.match(await lab.locator('.terminal').innerText(),/尚未开始/)
 report.checks.push('Fixed Turn ID on retry; stale delta/end/error/finally blocked; latest-six mixed-status history, user-only empty answer, all UI turns retained; reset')
 const submit=page.getByRole('button',{name:'提交评分',exact:true});assert(await submit.isDisabled())
 for(const [i,a] of [1,0,2,1].entries())await page.locator(`[name=l16-q-${i}]`).nth(a).check()
 await submit.click();assert.match(await lab.locator('.score').innerText(),/4 \/ 4/);assert.equal(await lab.locator('fieldset .feedback').count(),4)
 await page.locator('[name=l16-q-0]').nth(0).check();await submit.click();assert.match(await lab.locator('.score').innerText(),/3 \/ 4/)
 await click('重新作答');assert(await submit.isDisabled());assert.equal(await lab.locator('input:checked').count(),0)
 report.checks.push('Four quiz questions: full/wrong scores, explanations and reset')
 for(const [name,width,dark] of [['desktop',1280,false],['mobile',390,false],['mobile-dark',390,true]]){
  await page.setViewportSize({width,height:900});await page.evaluate(d=>document.documentElement.classList.toggle('dark',d),dark)
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page horizontal overflow')
  assert.equal(await page.locator('.original > *').evaluateAll(nodes=>nodes.filter(n=>getComputedStyle(n).display==='none').length),0)
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:out+'/'+name+'-top.png'});await page.screenshot({path:out+'/'+name+'-full.png',fullPage:true})
  await lab.scrollIntoViewIfNeeded();await page.screenshot({path:out+'/'+name+'-lab.png'})
 }
 assert.equal(errors.length,0);report.checks.push('1280px desktop / 390px mobile light/dark screenshots; no horizontal overflow, hidden blocks or runtime errors');report.status='passed'
}catch(e){report.status='failed';report.error=String(e);await page.screenshot({path:out+'/failure.png',fullPage:true}).catch(()=>{});throw e}
finally{writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close()}
