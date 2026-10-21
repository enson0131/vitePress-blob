import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {pathToFileURL} from 'node:url'
import {join,resolve} from 'node:path'
const tools=process.env.LESSON12_TOOLS
assert(tools,'LESSON12_TOOLS is required')
const {chromium}=await import(pathToFileURL(join(tools,'node_modules/playwright/index.mjs')).href)
const ts=(await import(pathToFileURL(join(tools,'node_modules/typescript/lib/typescript.js')).href)).default
const html=readFileSync('docs/.vitepress/theme/components/lesson12/article.html','utf8')
const hash=s=>createHash('sha256').update(s).digest('hex')
const blob=createHash('sha1').update('blob '+Buffer.byteLength(html)+'\0').update(html).digest('hex')
assert.equal(blob,'ac44bc8daa646bcb57f4381fbe839c1155b56506','Canonical original must not be abridged or replaced')
const target=process.env.LESSON12_URL||'http://127.0.0.1:4173/vitePress-blob/guide/ai/chatbot-course/12-structured-responses'
const out=process.env.REPORT_DIR||'lesson12-verification'
mkdirSync(out,{recursive:true});writeFileSync(join(out,'article.html'),html)
if(process.env.WAIT_FOR_PAGES==='true'){
 let ready=false
 for(let i=0;i<72;i++){
  const r=await fetch(target+'?lesson12='+Date.now()).catch(()=>null)
  if(r?.ok&&(await r.text()).includes('lesson12-v1')){ready=true;break}
  await new Promise(r=>setTimeout(r,5000))
 }
 assert(ready,'Live Pages did not become ready after six minutes')
}
const browser=await chromium.launch({headless:true})
const context=await browser.newContext({viewport:{width:1280,height:960},locale:'zh-CN',permissions:['clipboard-read','clipboard-write']})
const page=await context.newPage();const errors=[]
page.on('pageerror',e=>errors.push(e.message))
const report={target,sourceSha256:hash(html),sourceBlob:blob,checks:[],counts:{},screenshots:[],browserErrors:errors}
try{
 await page.addInitScript(()=>localStorage.setItem('vitepress-theme-appearance','light'))
 const r=await page.goto(target,{waitUntil:'networkidle',timeout:60000});assert(r?.ok())
 await page.locator('.lesson12-original [data-copy]').first().waitFor()
 const data=await page.evaluate(source=>{
  const parse=el=>({blocks:[...el.children].map(n=>({tag:n.tagName,text:n.textContent.replace(/\s+/g,' ').trim()})),codes:[...el.querySelectorAll('pre code')].map(n=>n.textContent),files:[...el.querySelectorAll('pre[data-file]')].map(n=>({name:n.dataset.file,code:n.querySelector('code').textContent})),tables:[...el.querySelectorAll('table')].map(t=>[...t.rows].map(r=>[...r.cells].map(c=>c.textContent))),headings:[...el.querySelectorAll('h1,h2,h3')].map(n=>n.textContent)})
  const base=document.createElement('div');base.innerHTML=source
  const actual=document.querySelector('.lesson12-original').cloneNode(true);actual.querySelectorAll('[data-ui]').forEach(n=>n.remove())
  return {expected:parse(base),actual:parse(actual)}
 },html)
 assert.deepEqual(data.actual,data.expected,'Rendered blocks, code, tables and order must match the original')
 assert.equal(data.actual.codes.length,5);assert.equal(data.actual.files.length,3);assert.equal(data.actual.tables.length,6)
 report.counts={blocks:data.actual.blocks.length,codeBlocks:5,tables:6,headings:data.actual.headings.length}
 report.codeHashes=data.actual.codes.map(hash)
 report.checks.push('Canonical source blob fixed; all rendered text/code/table cells/headings match the original in order')
 for(let i=0;i<5;i++){await page.locator('[data-copy]').nth(i).click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),data.actual.codes[i])}
 const wrap=page.getByRole('button',{name:'切换换行'}).first();await wrap.click();assert.equal(await wrap.getAttribute('aria-pressed'),'true');await wrap.click()
 report.checks.push('Five complete code blocks copy byte-for-byte; wrapping toggles without changing content')
 const ex=join(tools,'lesson12-examples');mkdirSync(ex,{recursive:true});writeFileSync(join(ex,'package.json'),'{"type":"module"}')
 for(const f of data.actual.files){
  writeFileSync(join(ex,f.name),f.code)
  writeFileSync(join(out,f.name),f.code)
  writeFileSync(join(ex,f.name.replace(/\.ts$/,'.js')),ts.transpileModule(f.code,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText)
 }
 const program=ts.createProgram(data.actual.files.map(f=>join(ex,f.name)),{strict:true,noEmit:true,skipLibCheck:true,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,typeRoots:[join(tools,'node_modules/@types')]})
 const diagnostics=ts.getPreEmitDiagnostics(program)
 assert.equal(diagnostics.length,0,diagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,'\n')).join('\n'))
 const {validateDraft}=await import(pathToFileURL(join(ex,'contract.js')).href)
 const good={answerable:true,answer:'Token 校验由服务端完成，前端不得保存服务端密钥。',sourceIds:['S1'],clarification:null}
 const allowed=new Set(['S1'])
 const cases=[
  [good,'answered'],
  [{...good,answerable:'true'},'invalid_schema'],
  [{...good,sourceIds:['S99']},'invalid_sources'],
  [{...good,sourceIds:['S1','S1']},'invalid_sources'],
  [{...good,sourceIds:[]},'inconsistent_fields'],
  [{...good,answer:'  '},'inconsistent_fields'],
  [{...good,answer:'x'.repeat(8001)},'inconsistent_fields'],
  [{...good,answerable:false,clarification:'资料不足'},'inconsistent_fields'],
  [{answerable:false,answer:null,sourceIds:[],clarification:'请补充 SDK 版本'},'insufficient_evidence'],
  [{...good,extra:true},'invalid_schema'],
  [{answerable:true,answer:'a',sourceIds:['S1']},'invalid_schema'],
  [null,'invalid_schema'],
  [{...good,answer:'前端可以保存服务端密钥。'},'answered']
 ]
 for(const [value,expected]of cases){const result=validateDraft(value,allowed);assert.equal(result.status==='failed'?result.code:result.status,expected)}
 const {displayText}=await import(pathToFileURL(join(ex,'presentation.js')).href)
 for(const status of ['answered','insufficient_evidence','refused','incomplete','failed'])assert.equal(typeof displayText({status,answer:'a',message:'m',reason:'r',code:'c',schemaVersion:'1',requestId:'test'}),'string')
 report.checks.push('Three TypeScript files type-check; 13 validator scenarios and five presentation states pass, including a deliberately factually wrong but structurally valid answer')
 const realFetch=globalThis.fetch
 const oldKey=process.env.OPENAI_API_KEY,oldModel=process.env.OPENAI_MODEL
 process.env.OPENAI_API_KEY='test-key-not-real';process.env.OPENAI_MODEL='fixture-model'
 let fixture,throwNetwork=false,calls=0,lastBody
 globalThis.fetch=async(_url,init)=>{
  calls++;lastBody=JSON.parse(init.body)
  if(throwNetwork)throw new Error('mock network failure')
  return new Response(JSON.stringify(fixture),{status:200,headers:{'content-type':'application/json'}})
 }
 try{
  const {ask}=await import(pathToFileURL(join(ex,'sdk-qa.js')).href)
  const response=(status,text)=>({id:'resp_mock',object:'response',created_at:0,model:'fixture-model',status,output:[{id:'msg_mock',type:'message',role:'assistant',status:'completed',content:[{type:'output_text',text,annotations:[]}]}],incomplete_details:status==='incomplete'?{reason:'max_output_tokens'}:null})
  const providerCases=[['completed',JSON.stringify(good),'answered'],['completed',JSON.stringify({answerable:false,answer:null,sourceIds:[],clarification:'请补充资料'}),'insufficient_evidence'],['incomplete',JSON.stringify(good),'incomplete'],['failed',JSON.stringify(good),'failed'],['completed','{broken','failed'],['completed',JSON.stringify({...good,sourceIds:['S99']}),'failed']]
  for(const [status,text,expected]of providerCases){fixture=response(status,text);const result=await ask('如何验证 Token？',[{id:'S1',text:'服务端验证'}]);assert.equal(result.status,expected);assert.equal(result.schemaVersion,'1');assert.match(result.requestId,/^[0-9a-f-]{36}$/)}
  assert.equal(lastBody.text.format.strict,true);assert.equal(lastBody.store,false)
  fixture=response('completed','');fixture.output[0].content=[{type:'refusal',refusal:'拒绝样本'}]
  assert.equal((await ask('question',[])).status,'refused')
  throwNetwork=true;assert.equal((await ask('question',[])).code,'upstream_error');throwNetwork=false
  const before=calls;assert.equal((await ask('',[])).code,'invalid_input');delete process.env.OPENAI_MODEL;assert.equal((await ask('q',[])).code,'missing_model');assert.equal(calls,before)
  report.checks.push('Mocked SDK call checks strict format, completed/insufficient/refusal/incomplete/failed/invalid JSON/network/config paths; no real model or paid calls')
 }finally{
  globalThis.fetch=realFetch
  if(oldKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=oldKey
  if(oldModel===undefined)delete process.env.OPENAI_MODEL;else process.env.OPENAI_MODEL=oldModel
 }
 const expected=[['answered',null],['failed','invalid_schema'],['failed','invalid_sources'],['failed','inconsistent_fields'],['incomplete',null],['refused',null],['answered',null]]
 for(let i=0;i<7;i++){
  await page.locator('#l12-sample').selectOption(String(i));assert.equal(await page.locator('[data-lab-status]').innerText(),expected[i][0]);if(expected[i][1])assert.match(await page.locator('[data-lab-detail]').innerText(),new RegExp(expected[i][1]))
 }
 await page.locator('#l12-json').fill('{broken');assert.match(await page.locator('[data-lab-detail]').innerText(),/invalid_json/)
 await page.locator('#l12-json').fill(JSON.stringify({answerable:false,answer:null,sourceIds:[],clarification:'请补充 SDK 版本'}));assert.equal(await page.locator('[data-lab-status]').innerText(),'insufficient_evidence')
 await page.getByRole('button',{name:'重置实验',exact:true}).click();assert.equal(await page.locator('[data-lab-status]').innerText(),'answered')
 report.checks.push('Seven fixed lab cases, editable invalid JSON, insufficient evidence and reset pass')
 const submit=page.getByRole('button',{name:'提交评分',exact:true});assert(await submit.isDisabled())
 for(const [i,a] of [0,2,1,1].entries())await page.locator(`[name=l12-q-${i}]`).nth(a).check()
 await submit.click();assert.match(await page.locator('.l12-score').innerText(),/4 \/ 4/);assert.equal(await page.locator('.l12-explanation').count(),4)
 await page.locator('[name=l12-q-0]').nth(1).check();assert.equal(await page.locator('.l12-score').count(),0);await submit.click();assert.match(await page.locator('.l12-score').innerText(),/3 \/ 4/)
 await page.getByRole('button',{name:'重新作答',exact:true}).click();assert.equal(await page.locator('fieldset input:checked').count(),0)
 report.checks.push('Four quizzes: full score, changed wrong answer, explanations and reset')
 for(const [name,width,dark]of[['desktop',1280,false],['desktop-dark',1280,true],['mobile',390,false],['mobile-dark',390,true]]){
  await page.setViewportSize({width,height:900});await page.evaluate(d=>document.documentElement.classList.toggle('dark',d),dark)
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal page overflow')
  assert.equal(await page.locator('.lesson12-original > *').evaluateAll(nodes=>nodes.filter(n=>getComputedStyle(n).display==='none').length),0)
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:join(out,name+'-top.png')});await page.screenshot({path:join(out,name+'.png'),fullPage:true});report.screenshots.push(name+'-top.png',name+'.png')
 }
 report.checks.push('Desktop 1280 and mobile 390 light/dark screenshots; no hidden original blocks or horizontal overflow')
 assert.equal(errors.length,0,'No browser runtime errors');report.status='passed'
}catch(error){report.status='failed';report.error=String(error);await page.screenshot({path:join(out,'failure.png'),fullPage:true}).catch(()=>{});throw error}
finally{writeFileSync(join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close()}
