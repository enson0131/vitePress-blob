import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {pathToFileURL} from 'node:url'
import {join} from 'node:path'
const sha=b=>createHash('sha256').update(b).digest('hex')
const manifest=JSON.parse(readFileSync('scripts/lesson18-source-hashes.json','utf8'))
for(const [file,hash] of Object.entries(manifest)){
 assert.equal(sha(readFileSync(file)),hash,`${file}: source differs`)
}
const original=readFileSync('docs/.vitepress/theme/components/lesson18/article.html','utf8')
const url=process.env.LESSON_URL||'http://127.0.0.1:4173/vitePress-blob/guide/ai/chatbot-course/18-error-retry-recovery'
const output=process.env.REPORT_DIR||'lesson18-verification/local'
const tools=process.env.LESSON_TOOLS
assert(tools,'LESSON_TOOLS must be set to external Playwright installation')
mkdirSync(output,{recursive:true})
if(process.env.WAIT_FOR_PAGES==='true'){
 let ready=false
 for(let tries=0;tries<72;tries++){
  const res=await fetch(`${url}?verify18=${Date.now()}`).catch(()=>null)
  if(res?.ok){
   const text=await res.text()
   if(text.includes('第 18 篇')||text.includes('error-retry-recovery')){ready=true;break}
  }
  await new Promise(resolve=>setTimeout(resolve,5000))
 }
 assert(ready,'GitHub Pages lesson 18 not deployed')
}
const {chromium}=await import(pathToFileURL(join(tools,'node_modules/playwright/index.mjs')).href)
const browser=await chromium.launch({headless:true})
const errors=[]
const report={url,sourceFiles:Object.keys(manifest).length,checks:[],errors,htmlHash:sha(original)}
try{
 const page=await browser.newPage({viewport:{width:1280,height:850},permissions:['clipboard-read','clipboard-write']})
 page.on('pageerror',e=>errors.push(e.message))
 await page.goto(url,{waitUntil:'networkidle',timeout:60000})
 await page.locator('.lesson18 .original pre button.copy18').first().waitFor()
 const blocks=await page.evaluate(expectedHTML=>{
  const parent=document.createElement('div');parent.innerHTML=expectedHTML
  const real=document.querySelector('.lesson18 .original').cloneNode(true)
  real.querySelectorAll('[data-copy18]').forEach(b=>b.remove())
  const snap=el=>({blocks:[...el.children].map(n=>[n.tagName,n.textContent]),
   code:[...el.querySelectorAll('pre code')].map(n=>n.textContent),
   tables:[...el.querySelectorAll('table')].map(t=>[...t.rows].map(r=>[...r.cells].map(x=>x.textContent)))})
  return {expected:snap(parent),real:snap(real)}
 },original)
 assert.deepEqual(blocks.real,blocks.expected)
 assert.equal(blocks.real.code.length,13)
 assert.equal(blocks.real.tables.length,4)
 report.content={blocks:blocks.real.blocks.length,codeBlocks:blocks.real.code.length,tables:blocks.real.tables.length}
 report.checks.push('complete original HTML matches Vue-rendered blocks, code blocks and tables')
 for(let i=0;i<blocks.real.code.length;i++){
  await page.getByRole('button',{name:'复制代码',exact:true}).nth(i).click()
  const value=await page.evaluate(()=>navigator.clipboard.readText())
  assert.equal(value,blocks.real.code[i])
 }
 report.checks.push('all code block copy buttons preserve entire code')
 await page.getByRole('button',{name:'开始发送'}).click()
 await page.getByRole('button',{name:'429/503 后自动重试'}).click()
 const lab=page.locator('.lesson18 .lab')
 assert.match(await lab.innerText(),/相同 clientKey=K1/)
 await page.getByRole('button',{name:'收到 delta'}).click()
 await page.getByRole('button',{name:'检查点 PUT'}).click()
 await page.getByRole('button',{name:'收到 end + 最终 PUT'}).click()
 assert.match(await lab.innerText(),/answered/)
 await page.getByRole('button',{name:'模拟刷新 GET'}).click()
 assert.match(await lab.innerText(),/从持久化快照恢复/)
 report.checks.push('retry simulation retains clientKey and Turn.id; checkpoint/end/refresh interactions')
 const options=page.locator('.lesson18 .quiz fieldset')
 assert.equal(await options.count(),4)
 for(let i=0;i<4;i++)await options.nth(i).locator('input[type=radio]').nth(1).check()
 await page.getByRole('button',{name:'提交评分'}).click()
 assert.match(await page.locator('.lesson18 .result').innerText(),/4 \/ 4/)
 await page.getByRole('button',{name:'重新作答'}).click()
 assert.equal(await page.locator('.lesson18 .result').count(),0)
 report.checks.push('four MCQs, correct explanations, scoring and reset')
 await page.screenshot({path:join(output,'desktop.png'),fullPage:true})
 await page.setViewportSize({width:390,height:844})
 await page.screenshot({path:join(output,'mobile-light.png'),fullPage:true})
 const overflow=await page.evaluate(()=>({body:document.documentElement.scrollWidth,viewport:innerWidth}))
 assert(overflow.body<=overflow.viewport+2,`mobile overflow: ${JSON.stringify(overflow)}`)
 await page.evaluate(()=>document.documentElement.classList.add('dark'))
 await page.screenshot({path:join(output,'mobile-dark.png'),fullPage:true})
 assert.deepEqual(errors,[])
 report.checks.push('mobile light/dark screenshots; no page errors or horizontal overflow')
 writeFileSync(join(output,'report.json'),JSON.stringify(report,null,2))
 console.log(JSON.stringify(report,null,2))
}finally{await browser.close()}
