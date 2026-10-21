import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { join } from 'node:path'
const tools=process.env.LESSON11_TOOLS
assert(tools,'LESSON11_TOOLS is required')
const {chromium}=await import(pathToFileURL(join(tools,'node_modules/playwright/index.mjs')).href)
const ts=(await import(pathToFileURL(join(tools,'node_modules/typescript/lib/typescript.js')).href)).default
const source=readFileSync('docs/.vitepress/theme/components/lesson11/article.html','utf8')
const sha=s=>createHash('sha256').update(s).digest('hex')
assert.equal(sha(source),'73444cf827ff0853c77681ee00d3994e56482b7d8d230bd24105ae76879c6bdd','Canonical lesson must not be shortened or rewritten')
const target=process.env.LESSON11_URL||'http://127.0.0.1:4173/vitePress-blob/guide/ai/chatbot-course/11-context-optimization'
const out=process.env.REPORT_DIR||'lesson11-verification'
mkdirSync(out,{recursive:true})
if(process.env.WAIT_FOR_PAGES==='true'){
 let ready=false
 for(let i=0;i<72;i++){
  const r=await fetch(target+'?lesson11='+Date.now()).catch(()=>null)
  if(r?.ok&&(await r.text()).includes('lesson11-v1')){ready=true;break}
  await new Promise(resolve=>setTimeout(resolve,5000))
 }
 assert(ready,'Published chapter 11 not ready after six minutes')
}
const browser=await chromium.launch({headless:true})
const context=await browser.newContext({viewport:{width:1280,height:960},locale:'zh-CN',permissions:['clipboard-read','clipboard-write']})
const page=await context.newPage();const errors=[]
page.on('pageerror',e=>errors.push(e.message))
const report={target,sourceSha256:sha(source),checks:[],screenshots:[],browserErrors:errors}
try{
 await page.addInitScript(()=>localStorage.setItem('vitepress-theme-appearance','light'))
 const response=await page.goto(target,{waitUntil:'networkidle',timeout:60000});assert(response?.ok())
 await page.locator('.lesson11-original [data-copy]').first().waitFor()
 const data=await page.evaluate(html=>{
  const parse=el=>({blocks:[...el.children].map(n=>({tag:n.tagName,text:n.textContent.replace(/\s+/g,' ').trim()})),codes:[...el.querySelectorAll('pre code')].map(n=>n.textContent),tables:[...el.querySelectorAll('table')].map(t=>[...t.rows].map(r=>[...r.cells].map(c=>c.textContent))),headings:el.querySelectorAll('h1,h2,h3').length,formulas:el.querySelectorAll('.formula').length})
  const base=document.createElement('div');base.innerHTML=html
  const actual=document.querySelector('.lesson11-original').cloneNode(true);actual.querySelectorAll('[data-ui]').forEach(n=>n.remove())
  return {expected:parse(base),actual:parse(actual)}
 },source)
 assert.deepEqual(data.actual,data.expected,'All authored blocks must render in the same order without omitted text')
 assert.equal(data.actual.blocks.length,105);assert.equal(data.actual.codes.length,5);assert.equal(data.actual.tables.length,5);assert.equal(data.actual.headings,27);assert.equal(data.actual.formulas,4)
 report.checks.push('105 ordered source blocks, 5 code blocks, 5 tables, 4 formulas and 27 headings match canonical HTML')
 const codeHashes=['94868a87aaf6c1c518cb79a9303c0f69ab5d042d401b3420d44a027d638146a6','8e2e30a8bb4ee6426c5165a168d1f2a25326671a8c25077b46aacbe1518f3e63','37f8504a2b80609a400cb63c4b954bf12888c46f37b8b6c12b2837b11c8cada9','7f5be0bf3b4e675937f9b5ff8c6e8466eba255045081cf38bfae40223db02ad0','803e1e759319a4e93aea8f3546d3a8c2762a9e11ae8782512de58c7b1e60cc63']
 assert.deepEqual(data.actual.codes.map(sha),codeHashes)
 for(let i=0;i<5;i++){await page.locator('[data-copy]').nth(i).click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),data.actual.codes[i])}
 const wrap=page.getByRole('button',{name:'切换换行'}).first();await wrap.click();assert.equal(await wrap.getAttribute('aria-pressed'),'true');await wrap.click()
 report.checks.push('All five code blocks copy byte-for-byte; wrapping toggles')
 const program=data.actual.codes[3];const adapter=data.actual.codes[4]
 const sample=join(tools,'lesson11-example.ts');writeFileSync(sample,program+'\n'+adapter+'\n')
 const typeProgram=ts.createProgram([sample],{strict:true,noEmit:true,skipLibCheck:true,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,typeRoots:[join(tools,'node_modules/@types')]})
 const diagnostics=ts.getPreEmitDiagnostics(typeProgram)
 assert.equal(diagnostics.length,0,diagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,'\n')).join('\n'))
 const js=ts.transpileModule(program,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText
 const {packContext}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'))
 const turn=id=>({id,messages:[{role:'user',content:'q'+id},{role:'assistant',content:'a'+id}]})
 const opts={instructions:'rules',reference:'facts',currentQuestion:'now',history:[turn('old'),turn('new')],window:200,outputReserve:50,safetyMargin:10}
 const count=async r=>80+r.input.length*10 // Deterministic test double, not a real tokenizer.
 const exact=await packContext(opts,count);assert.equal(exact.inputTokens,140);assert.deepEqual(exact.dropped,[])
 const cut=await packContext({...opts,window:180},count);assert.equal(cut.inputTokens,120);assert.deepEqual(cut.dropped,['old']);assert.equal(cut.request.input.at(-1).content,'now');assert.equal(opts.history.length,2)
 await assert.rejects(()=>packContext({...opts,window:150},count),/CONTEXT_BUDGET_EXCEEDED/)
 await assert.rejects(()=>packContext(opts,async()=>NaN),/无效/)
 await assert.rejects(()=>packContext({...opts,currentQuestion:''},count),/为空/)
 await assert.rejects(()=>packContext({...opts,window:-1},count),/预算/)
 await assert.rejects(()=>packContext({...opts,history:[turn('a'),turn('a')]},count),/ID/)
 await assert.rejects(()=>packContext({...opts,history:[{id:'bad',messages:[{role:'assistant',content:'x'}]}]},count),/配对/)
 report.checks.push('TypeScript example and OpenAI SDK adapter type-check; 8 planner scenarios pass with fake counts; no paid model calls')
 assert.match(await page.locator('.l11-total').innerText(),/14,000/)
 await page.locator('[name=l11-compressed]').uncheck();assert.match(await page.locator('.l11-total').innerText(),/17,500/);assert.match(await page.locator('.l11-feedback').innerText(),/超限 1,500/)
 await page.getByRole('button',{name:'恢复示例数值'}).click()
 await page.locator('#l11-recent').evaluate(n=>{n.value='6000';n.dispatchEvent(new Event('input',{bubbles:true}))})
 assert.match(await page.locator('.l11-total').innerText(),/16,000/)
 await page.locator('#l11-output').evaluate(n=>{n.value='5000';n.dispatchEvent(new Event('input',{bubbles:true}))})
 assert.match(await page.locator('.l11-feedback').innerText(),/超限 1,000/)
 await page.getByRole('button',{name:'恢复示例数值'}).click()
 report.checks.push('Budget defaults, full/compressed modes, boundary, overflow and reset pass')
 const submit=page.getByRole('button',{name:'提交评分',exact:true});assert(await submit.isDisabled())
 for(const [i,a] of [1,2,0,1].entries())await page.locator(`[name=l11-q-${i}]`).nth(a).check()
 await submit.click();assert.match(await page.locator('.l11-score').innerText(),/4 \/ 4/);assert.equal(await page.locator('.l11-explanation').count(),4)
 await page.locator('[name=l11-q-0]').nth(0).check();assert.equal(await page.locator('.l11-score').count(),0);await submit.click();assert.match(await page.locator('.l11-score').innerText(),/3 \/ 4/)
 await page.getByRole('button',{name:'重新作答',exact:true}).click();assert.equal(await page.locator('.l11-question input:checked').count(),0)
 report.checks.push('Four interactive questions: full score, wrong answer, explanations and reset')
 for(const [name,width,dark]of[['desktop',1280,false],['mobile',390,false],['mobile-dark',390,true]]){
  await page.setViewportSize({width,height:900});await page.evaluate(d=>document.documentElement.classList.toggle('dark',d),dark)
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page must not overflow horizontally')
  assert.equal(await page.locator('.lesson11-original > *').evaluateAll(nodes=>nodes.filter(n=>getComputedStyle(n).display==='none').length),0)
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${out}/${name}-top.png`});await page.screenshot({path:`${out}/${name}.png`,fullPage:true});report.screenshots.push(`${name}-top.png`,`${name}.png`)
 }
 report.checks.push('1280px desktop and 390px mobile, light/dark, no hidden source blocks or horizontal overflow')
 assert.equal(errors.length,0,'No page runtime errors');report.status='passed'
}catch(error){report.status='failed';report.error=String(error);await page.screenshot({path:`${out}/failure.png`,fullPage:true}).catch(()=>{});throw error}
finally{writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close()}
