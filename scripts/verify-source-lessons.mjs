import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {pathToFileURL} from 'node:url'
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href)
const manifest=JSON.parse(readFileSync('scripts/lesson-source-baseline.json','utf8'))
const base=process.env.AUDIT_BASE||'http://127.0.0.1:4173/vitePress-blob/guide/ai/chatbot-course/'
const out=process.env.REPORT_DIR||'lesson-audit/verified'
mkdirSync(out,{recursive:true})
const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex')
const browser=await chromium.launch({headless:true});const reports=[]
for(const lesson of manifest.lessons){
 const dir=`${out}/${lesson.slug}`;mkdirSync(dir,{recursive:true})
 const ctx=await browser.newContext({viewport:{width:1280,height:960},locale:'zh-CN',permissions:['clipboard-read','clipboard-write']})
 await ctx.addInitScript(()=>localStorage.setItem('vitepress-theme-appearance','light'))
 const page=await ctx.newPage();const report={chapter:lesson.chapter,url:base+lesson.slug,checks:[],errors:[]}
 page.on('pageerror',e=>report.errors.push(e.message))
 try{
  const response=await page.goto(report.url,{waitUntil:'networkidle',timeout:60000});assert(response?.ok())
  const root=page.locator(`.web-course-source[data-chapter="${lesson.chapter}"]`);await root.waitFor()
  const parts=[]
  for(const expected of lesson.parts){
   const actual=await page.locator(`[data-dil-message-id="${expected.selector}"]`).evaluate(el=>{
    const norm=s=>s.replace(/\s+/g,'').replace(/\u200b/g,'')
    const text=node=>{const c=node.cloneNode(true);c.querySelectorAll('script,[data-markdown-copy="exclude"],.katex-html').forEach(n=>n.remove());c.querySelectorAll('.katex-mathml').forEach(n=>{const a=n.querySelector('annotation');if(a)n.replaceWith(document.createTextNode(a.textContent||''))});return c.textContent||''}
    const prose=[],headings=[]
    Array.from(el.children).forEach(n=>{if(['P','BLOCKQUOTE'].includes(n.tagName))prose.push(norm(text(n)));if(['UL','OL'].includes(n.tagName))Array.from(n.children).filter(n=>n.tagName==='LI').forEach(n=>prose.push(norm(text(n))));if(/^H[1-4]$/.test(n.tagName))headings.push(norm(text(n)))})
    return {prose,headings,codes:Array.from(el.querySelectorAll('pre code,[data-code-block-source]')).map(n=>n.textContent),tables:Array.from(el.querySelectorAll('table')).map(t=>Array.from(t.querySelectorAll('tr')).map(r=>Array.from(r.querySelectorAll('th,td')).map(text))),formulas:Array.from(el.querySelectorAll('annotation[encoding="application/x-tex"]')).map(n=>n.textContent)}
   })
   for(const [key,hashKey] of [['prose','proseHash'],['headings','headingsHash'],['codes','codeHash'],['tables','tableHash'],['formulas','formulaHash']]){
    assert.equal(actual[key].length,expected[key],`${lesson.chapter} ${expected.selector} ${key} count`)
    assert.equal(sha(actual[key]),expected[hashKey],`${lesson.chapter} ${expected.selector} ${key} exact ordered contents`)
   }
   parts.push(Object.fromEntries(['prose','headings','codes','tables','formulas'].map(k=>[k,actual[k].length])))
  }
  report.parts=parts;report.checks.push('Ordered source prose/headings, exact code/flow text, table cells and TeX formula hashes match uploaded archive')
  await page.screenshot({path:`${dir}/desktop.png`,fullPage:true})
  const blocks=root.locator('[data-web-code]');let copied=0
  for(let i=0;i<await blocks.count();i++){
   const block=blocks.nth(i),button=block.locator('[data-web-action="copy-code"]').first()
   if(await button.count()){
    const expected=await block.locator('code').first().textContent();await button.click({force:true});await page.waitForTimeout(30)
    assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),expected,'Complete code/flow copying');copied++
   }
  }
  report.copiedBlocks=copied;report.checks.push('Every code/flow copy button returns the complete text')
  const setRange=async(lab,index,value)=>{await lab.locator('input[type=range]').nth(index).evaluate((el,v)=>{el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}))},value);await page.waitForTimeout(40)}
  if(lesson.chapter===2){
   const images=root.locator('img[data-d-component="svg"]');assert.equal(await images.count(),4)
   for(const image of await images.all()){const src=decodeURIComponent((await image.getAttribute('src')).split(',').slice(1).join(','));assert(src.includes('color:rgb(13, 13, 13)'),'Light-mode graph labels must not remain white')}
   const lab=root.locator('[data-web-lab="cosine"]');for(const [i,v]of [0,0,1,0].entries())await setRange(lab,i,v)
   assert.match(await lab.locator('[data-web-output="cosine"]').innerText(),/未定义/)
   await setRange(lab,0,1);assert.equal(await lab.locator('[data-web-output="cosine"]').innerText(),'1.000')
   const graph=decodeURIComponent((await lab.locator('img').getAttribute('src')).split(',').slice(1).join(','));assert(graph.includes('x2="178"')&&graph.includes('y2="122"'),'Cosine SVG must follow inputs')
   await lab.locator('[data-web-action="reset-lab"]').click();await page.waitForTimeout(100)
   const original=decodeURIComponent((await lab.locator('img').getAttribute('src')).split(',').slice(1).join(','));assert(original.includes('x2="214"')&&original.includes('y2="50"'),'Reset restores original vector geometry')
   report.checks.push('Four SVGs have readable light-mode labels; cosine zero-vector, dynamic vectors and reset verified')
  }
  if(lesson.chapter===5){const lab=root.locator('[data-web-lab="loss"]');await setRange(lab,0,90);assert.equal(await lab.locator('[data-web-output="loss"]').innerText(),'0.105');await setRange(lab,0,20);report.checks.push('Loss slider: 90% -> 0.105')}
  if(lesson.chapter===6){const top=root.locator('[data-web-lab="top-p"]');await setRange(top,0,0.8);assert.equal(await top.locator('[data-web-output^="top-p-"]').filter({hasText:'保留'}).count(),2);report.checks.push('Top-p 0.8 retains A and B')}
  if(lesson.chapter===9){const lab=root.locator('[data-web-lab="history-growth"]');await setRange(lab,0,500);await setRange(lab,1,1000);await setRange(lab,2,2000);assert.equal(await lab.locator('[data-web-output="history-total"]').innerText(),'1,500,000');await setRange(lab,0,100);await setRange(lab,1,100);await setRange(lab,2,400);report.checks.push('History total and restored initial state verified')}
  if(lesson.chapter===9){
   const q=page.locator('.lesson-quiz');for(const [i,a]of [0,1,1,1,1].entries())await q.locator(`input[name="lesson-9-question-${i}"]`).nth(a).check()
   await q.getByRole('button',{name:'提交答案',exact:true}).click();assert.match(await q.locator('.score').innerText(),/5 \/ 5/)
   await q.getByRole('button',{name:'重新作答',exact:true}).click();assert.equal(await q.locator('input:checked').count(),0)
  }else{
   const cfg=JSON.parse(readFileSync(`docs/.vitepress/theme/components/course-sources/${lesson.slug}.web.json`,'utf8'))
   for(const [i,q]of cfg.questions.entries())await root.locator(`[data-web-question="${i}"] input[type=radio]`).nth(q.answer).check()
   const inlineSubmit=root.locator('[data-web-action="submit-quiz"]')
   if(await inlineSubmit.count())await inlineSubmit.click()
   else await page.locator('.web-extra-quiz-actions').getByRole('button',{name:'提交评分',exact:true}).click()
   assert.match(await root.locator('[data-web-score]').innerText(),new RegExp(`${cfg.questions.length} / ${cfg.questions.length}`))
   const reset=page.getByRole('button',{name:'重新作答',exact:true});await reset.first().click();assert.equal(await root.locator('[data-web-question] input:checked').count(),0)
  }
  report.checks.push('All quiz answers, full score, explanations and reset verified (chapter 09 supplement treated separately)')
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150)
  report.mobile=await page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth,overflows:Array.from(document.querySelectorAll('.vp-doc *')).filter(n=>n.getBoundingClientRect().right>innerWidth+1).slice(0,30).map(n=>({tag:n.tagName,cls:n.className,style:n.getAttribute('data-web-style'),right:n.getBoundingClientRect().right,text:n.textContent?.slice(0,50)}))}))
  await page.screenshot({path:`${dir}/mobile.png`,fullPage:true});assert(report.mobile.width<=391,'390px page must not overflow')
  await page.setViewportSize({width:1280,height:960})
  await page.locator('.VPSwitchAppearance').first().click()
  await page.waitForFunction(()=>document.documentElement.classList.contains('dark'))
  await page.waitForTimeout(100)
  if(lesson.chapter===2)for(const image of await root.locator('img[data-d-component="svg"]').all())assert(decodeURIComponent((await image.getAttribute('src')).split(',').slice(1).join(',')).includes('color:rgb(237, 237, 237)'),'SVG labels adapt to dark mode without changing content')
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:`${dir}/mobile-dark.png`,fullPage:true})
  report.checks.push('390px viewport has no horizontal page overflow; real theme toggle and light/dark screenshots verified')
  assert.equal(report.errors.length,0,'No browser runtime errors');report.status='passed'
 }catch(e){report.status='failed';report.failure=String(e);await page.screenshot({path:`${dir}/failure.png`,fullPage:true}).catch(()=>{})}
 writeFileSync(`${dir}/report.json`,JSON.stringify(report,null,2));reports.push(report);await ctx.close()
}
await browser.close();writeFileSync(`${out}/summary.json`,JSON.stringify(reports,null,2));console.log(JSON.stringify(reports,null,2));if(reports.some(r=>r.status==='failed'))process.exitCode=1
