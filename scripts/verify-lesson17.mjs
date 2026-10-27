import assert from 'node:assert/strict'
import {readFileSync, mkdirSync, writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {join} from 'node:path'
import {pathToFileURL} from 'node:url'

const root='docs/.vitepress/theme/components/lesson17/'
const manifest=JSON.parse(readFileSync('scripts/lesson17-source-hashes.json','utf8'))
const sha=bytes=>createHash('sha256').update(bytes).digest('hex')
for(const [file,expected] of Object.entries(manifest))assert.equal(sha(readFileSync(file)),expected,`${file} source changed`)
const html=readFileSync(root+'article.html','utf8')
const md=readFileSync(root+'article.md','utf8')
assert(md.includes('前端缓冲 SSE，按时间/大小批量 PUT'))
assert(md.includes('时按 F5')) // Replaced below if text explicitly says 按 F5
assert(md.includes('最后一个 PUT 不能省'))
assert(!md.includes('AI 输出由后端写检查点和最终状态'))
assert(md.includes('最近 6 轮'))
const codeCount=(html.match(/<pre>/g)||[]).length
assert(codeCount>=20)

const tools=process.env.LESSON_TOOLS
assert(tools,'LESSON_TOOLS required')
const {chromium}=await import(pathToFileURL(join(tools,'node_modules/playwright/index.mjs')).href)
const url=process.env.LESSON_URL||'http://127.0.0.1:4173/vitePress-blob/guide/ai/chatbot-course/17-conversation-persistence'
const dir=process.env.REPORT_DIR||'lesson17-verification/local'
mkdirSync(dir,{recursive:true})
if(process.env.WAIT_FOR_PAGES==='true') {
 let seen=false
 for(let i=0;i<48;i++) {
  const res=await fetch(url+'?check17='+Date.now()).catch(()=>null)
  if(res?.ok()&&(await res.text()).includes('会话与消息持久化')){seen=true;break}
  await new Promise(r=>setTimeout(r,5000))
 }
 assert(seen,'Published Page not ready')
}
const browser=await chromium.launch({headless:true})
const context=await browser.newContext({viewport:{width:1280,height:900},permissions:['clipboard-read','clipboard-write']})
const page=await context.newPage(),errors=[]
page.on('pageerror',e=>errors.push(e.message))
const result={url,manifestCount:Object.keys(manifest).length,codeCount,sourceSha256:sha(html),checks:[],errors}
try {
 const resp=await page.goto(url,{waitUntil:'networkidle',timeout:60000});assert(resp?.ok())
 await page.locator('.lesson17 .original h1').waitFor()
 const original=await page.locator('.lesson17 .original').evaluate(el=>{
  const clones=el.cloneNode(true);clones.querySelectorAll('[data-copy17]').forEach(x=>x.remove())
  return {texts:[...clones.children].map(x=>[x.tagName,x.textContent]),code:[...clones.querySelectorAll('pre code')].map(x=>x.textContent)}
 })
 const expected=await page.evaluate(source=>{
  const el=document.createElement('div');el.innerHTML=source
  return {texts:[...el.children].map(x=>[x.tagName,x.textContent]),code:[...el.querySelectorAll('pre code')].map(x=>x.textContent)}
 },html)
 assert.deepEqual(original,expected)
 result.checks.push(`${original.texts.length} original blocks and ${original.code.length} code blocks match full HTML exactly`)
 assert(original.code.length>=20)
 await page.getByRole('button',{name:'复制代码',exact:true}).first().click()
 assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),original.code[0])
 result.checks.push('Copy code matches complete source')
 const click=async name=>page.getByRole('button',{name,exact:true}).click()
 await click('接收 SSE delta');await click('接收 SSE delta');await click('模拟检查点 PUT');await click('接收 SSE delta');
 assert.match(await page.locator('.lab-panels').innerText(),/正在生成/)
 await click('模拟刷新 GET')
 const panels=await page.locator('.lab-panels').innerText()
 assert(!panels.includes('正在生成的'))
 assert(panels.includes('incomplete'))
 await click('重置实验');await click('接收 SSE delta');await click('模拟最终 PUT');
 assert.match(await page.locator('.lab-panels').innerText(),/answered/)
 result.checks.push('Frontend checkpoint / refresh / final-save lab')
 const qs=page.locator('.lesson17 .quiz fieldset')
 assert.equal(await qs.count(),4)
 const choices=[1,0,2,1]
 for(let i=0;i<4;i++)await qs.nth(i).locator('input[type=radio]').nth(choices[i]).check()
 await click('提交评分')
 assert.match(await page.locator('.lesson17 .quiz').innerText(),/得分：4 \/ 4/)
 await click('重新作答')
 result.checks.push('4 MCQs grading / explanations / reset')
 await page.screenshot({path:join(dir,'desktop.png'),fullPage:false})
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true})
 const m=await mobile.newPage();const resMobile=await m.goto(url,{waitUntil:'networkidle',timeout:60000});assert(resMobile?.ok())
 await m.locator('.lesson17 .original h1').waitFor()
 assert(await m.locator('.lesson17 .lab').isVisible())
 await m.screenshot({path:join(dir,'mobile-light.png'),fullPage:false})
 await m.evaluate(()=>document.documentElement.classList.add('dark'))
 await m.screenshot({path:join(dir,'mobile-dark.png'),fullPage:false})
 await mobile.close()
 assert.deepEqual(errors,[])
 result.checks.push('Desktop/mobile/dark screenshots; no page errors')
} finally {writeFileSync(join(dir,'report.json'),JSON.stringify(result,null,2));await context.close();await browser.close()}
console.log(JSON.stringify(result,null,2))
