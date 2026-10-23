import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {pathToFileURL} from 'node:url'
import {join} from 'node:path'
const tools=process.env.LESSON_TOOLS
assert(tools,'LESSON_TOOLS is required')
const {chromium}=await import(pathToFileURL(join(tools,'node_modules/playwright/index.mjs')).href)
const ts=(await import(pathToFileURL(join(tools,'node_modules/typescript/lib/typescript.js')).href)).default
const base='docs/.vitepress/theme/components/lesson13/'
const html=readFileSync(base+'article.html','utf8')
const hash=s=>createHash('sha256').update(s).digest('hex')
assert.equal(hash(html),'79174a19c32be19694b707fd4554124dca27215d84ff84899a354878992b6874','Article must match the supplied lesson13 source byte for byte')
const data=JSON.parse(readFileSync(base+'exercise-data.json','utf8'))
const target=process.env.LESSON_URL||'http://127.0.0.1:4173/vitePress-blob/guide/ai/chatbot-course/13-hallucinations-and-evidence'
const out=process.env.REPORT_DIR||'lesson13-verification';mkdirSync(out,{recursive:true})
if(process.env.WAIT_FOR_PAGES==='true'){
 let ready=false
 for(let i=0;i<72;i++){
  const r=await fetch(target+'?check='+Date.now()).catch(()=>null)
  if(r?.ok&&(await r.text()).includes('lesson13')){ready=true;break}
  await new Promise(r=>setTimeout(r,5000))
 }
 assert(ready,'Live page not ready')
}
const browser=await chromium.launch({headless:true})
const page=await browser.newPage({viewport:{width:1280,height:900},locale:'zh-CN'})
const errors=[];page.on('pageerror',e=>errors.push(e.message))
const report={target,articleSha256:hash(html),checks:[],errors}
try{
 await page.goto(target,{waitUntil:'networkidle',timeout:60000})
 await page.locator('.lesson13 .original').waitFor()
 const got=await page.evaluate(source=>{
  const root=document.createElement('div');root.innerHTML=source
  const snap=n=>({blocks:[...n.children].map(x=>[x.tagName,x.textContent]),codes:[...n.querySelectorAll('pre code')].map(x=>x.textContent),tables:[...n.querySelectorAll('table')].map(t=>[...t.rows].map(r=>[...r.cells].map(c=>c.textContent)))})
  return {expected:snap(root),actual:snap(document.querySelector('.lesson13 .original'))}
 },html)
 assert.deepEqual(got.actual,got.expected)
 assert.equal(got.actual.codes.length,3);assert.equal(got.actual.tables.length,2)
 report.blocks=got.actual.blocks.length;report.codeBlocks=3;report.tables=2
 report.checks.push('All source blocks, three code blocks and two tables identical in rendered page')
 const compiled=ts.transpileModule(got.actual.codes[2],{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText
 const {chooseAction}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'))
 const check=v=>({claim:'sample',verdict:v})
 assert.equal(chooseAction([]),'补充材料或完成核对')
 assert.equal(chooseAction([check('supported')]),'按已核对的结论回答')
 assert.equal(chooseAction([check('insufficient')]),'说明证据不足，不猜测')
 assert.equal(chooseAction([check('supported'),check('insufficient')]),'只回答有依据的部分，并说明缺口')
 assert.equal(chooseAction([check('contradicted'),check('supported')]),'撤回冲突结论，重写后再核对')
 report.checks.push('Five answer-gate cases pass; no model calls')
 const labels={supported:'有依据',contradicted:'冲突',insufficient:'证据不足'}
 for(let i=0;i<data.cases.length;i++){
  const row=page.locator('.lesson13 .trial').nth(i)
  await row.getByRole('button',{name:labels[data.cases[i].answer],exact:true}).click()
  assert.match(await row.locator('.feedback').innerText(),/判断正确/)
 }
 await page.getByRole('button',{name:'重做证据练习',exact:true}).click();assert.equal(await page.locator('.trial .feedback').count(),0)
 const submit=page.getByRole('button',{name:'提交评分',exact:true});assert(await submit.isDisabled())
 for(const [i,q] of data.questions.entries())await page.locator(`[name=l13q${i}]`).nth(q.a).check()
 await submit.click();assert.match(await page.locator('.extras>p[role=status]').innerText(),/4 \/ 4/)
 await page.locator('[name=l13q0]').nth(0).check();await submit.click();assert.match(await page.locator('.extras>p[role=status]').innerText(),/3 \/ 4/)
 await page.getByRole('button',{name:'重新作答',exact:true}).click();assert(await submit.isDisabled())
 report.checks.push('Five evidence exercises and four scored questions, wrong answer and both resets pass')
 for(const [name,width,dark] of [['desktop',1280,false],['mobile',390,false],['mobile-dark',390,true]]){
  await page.setViewportSize({width,height:900});await page.evaluate(d=>document.documentElement.classList.toggle('dark',d),dark)
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal page overflow')
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:out+'/'+name+'-top.png'});await page.screenshot({path:out+'/'+name+'.png',fullPage:true})
 }
 assert.equal(errors.length,0);report.checks.push('Desktop/mobile/light/dark checks; no horizontal overflow or runtime errors');report.status='passed'
}catch(error){report.status='failed';report.error=String(error);await page.screenshot({path:out+'/failure.png',fullPage:true}).catch(()=>{});throw error}
finally{writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close()}
