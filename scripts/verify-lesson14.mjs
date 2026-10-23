import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {pathToFileURL} from 'node:url'
import {join} from 'node:path'
const {chromium}=await import(pathToFileURL(join(process.env.LESSON_TOOLS,'node_modules/playwright/index.mjs')).href)
const base='docs/.vitepress/theme/components/lesson14/'
const source=readFileSync(base+'article.html','utf8')
const hash=createHash('sha256').update(source).digest('hex')
assert.equal(hash,'f85f7e8f307ad05ee08e4c599591d491c07e413013e7e1ef058e93e20894967e','Original article bytes changed')
const html=source.split(/(<pre[\s\S]*?<\/pre>)/g).map(s=>s.startsWith('<pre')?s:s.replace(/\*\*([\s\S]+?)\*\*/g,'<strong>$1</strong>')).join('')
const questions=JSON.parse(readFileSync(base+'exercise-data.json','utf8'))
const target=process.env.LESSON_URL||'http://127.0.0.1:4173/vitePress-blob/guide/ai/chatbot-course/14-first-react-node-chat'
const out=process.env.REPORT_DIR||'lesson14-verification';mkdirSync(out,{recursive:true})
if(process.env.WAIT_FOR_PAGES==='true'){
 let ready=false
 for(let i=0;i<72;i++){
  const r=await fetch(target+'?verify='+Date.now()).catch(()=>null)
  if(r?.ok&&(await r.text()).includes('lesson14')){ready=true;break}
  await new Promise(r=>setTimeout(r,5000))
 }
 assert(ready,'Live page is not ready')
}
const browser=await chromium.launch({headless:true})
const page=await browser.newPage({viewport:{width:1280,height:900},locale:'zh-CN'})
const errors=[];page.on('pageerror',e=>errors.push(e.message))
const report={target,originalSha256:hash,checks:[],errors}
try{
 const response=await page.goto(target,{waitUntil:'networkidle',timeout:60000});assert(response?.ok())
 const compared=await page.evaluate(source=>{
  const expected=document.createElement('div');expected.innerHTML=source
  const snap=n=>({blocks:[...n.children].map(x=>[x.tagName,x.textContent]),codes:[...n.querySelectorAll('pre code')].map(x=>x.textContent)})
  return {expected:snap(expected),actual:snap(document.querySelector('.lesson14 .original'))}
 },html)
 assert.deepEqual(compared.actual,compared.expected)
 report.blocks=compared.actual.blocks.length;report.codeBlocks=compared.actual.codes.length
 for(const [language,path] of [['typescript','server/model.ts'],['tsx','src/App.tsx']]){
  const code=await page.locator('.original pre code.language-'+language).first().textContent()
  assert.equal(code,readFileSync('examples/lesson14-first-chat/'+path,'utf8'))
 }
 assert.equal(await page.locator('.original pre code.language-typescript').nth(1).textContent(),readFileSync('examples/lesson14-first-chat/vite.config.ts','utf8'))
 report.checks.push('Original HTML SHA256; all rendered source blocks; code matches runnable files')
 for(const scenario of ['answered','refused','incomplete','failed']){
  await page.locator('.extras select').selectOption(scenario)
  await page.getByRole('button',{name:'运行演示',exact:true}).click()
  await page.waitForFunction(s=>document.querySelector('.result strong')?.textContent===s,scenario)
 }
 await page.getByRole('button',{name:'重置演示',exact:true}).click();assert.equal(await page.locator('.result strong').textContent(),'idle')
 const submit=page.getByRole('button',{name:'提交评分',exact:true});assert(await submit.isDisabled())
 for(const [i,q] of questions.entries())await page.locator(`[name=l14q${i}]`).nth(q.a).check()
 await submit.click();assert.match(await page.locator('.extras>p[role=status]').innerText(),/4 \/ 4/)
 await page.locator('[name=l14q0]').nth(0).check();await submit.click();assert.match(await page.locator('.extras>p[role=status]').innerText(),/3 \/ 4/)
 await page.getByRole('button',{name:'重新作答',exact:true}).click();assert(await submit.isDisabled())
 report.checks.push('Four demo states, four quiz questions, wrong answer, feedback and resets')
 for(const [name,width,dark] of [['desktop',1280,false],['mobile',390,false],['mobile-dark',390,true]]){
  await page.setViewportSize({width,height:900});await page.evaluate(d=>document.documentElement.classList.toggle('dark',d),dark)
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow')
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:out+'/'+name+'-top.png'});await page.screenshot({path:out+'/'+name+'.png',fullPage:true})
 }
 assert.equal(errors.length,0);report.checks.push('Desktop, mobile, dark theme: no overflow or runtime errors');report.status='passed'
}catch(error){report.status='failed';report.error=String(error);await page.screenshot({path:out+'/failure.png',fullPage:true}).catch(()=>{});throw error}
finally{writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close()}
