import {mkdirSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const lessons=['02-token-and-embedding','05-llm-training','06-inference','09-conversation-memory'];
const browser=await chromium.launch({headless:true});
const results=[];
for(const slug of lessons){
 const dir=`lesson-audit/${slug}`;mkdirSync(dir,{recursive:true});
 const context=await browser.newContext({viewport:{width:1280,height:960},locale:'zh-CN',permissions:['clipboard-read','clipboard-write']});
 await context.addInitScript(()=>localStorage.setItem('vitepress-theme-appearance','light'));
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const report={slug,url:`https://enson0131.github.io/vitePress-blob/guide/ai/chatbot-course/${slug}`,errors,interactions:[]};
 try{
  const response=await page.goto(report.url,{waitUntil:'networkidle',timeout:60000});report.http=response?.status();
  const root=page.locator('.vp-doc');await root.waitFor();
  const dom=await root.evaluate(el=>{
   const visible=n=>n.getClientRects().length>0&&getComputedStyle(n).visibility!=='hidden'&&getComputedStyle(n).display!=='none';
   const style=n=>{const s=getComputedStyle(n);const b=n.getBoundingClientRect();return {font:s.fontFamily,size:s.fontSize,line:s.lineHeight,color:s.color,width:b.width,height:b.height,top:b.top,marginTop:s.marginTop,marginBottom:s.marginBottom};};
   return {html:el.outerHTML,text:el.innerText,headings:Array.from(el.querySelectorAll('h1,h2,h3,h4')).map(n=>({text:n.textContent,visible:visible(n),style:style(n)})),paragraphs:Array.from(el.querySelectorAll('p,li,blockquote')).filter(visible).map(n=>n.textContent),codes:Array.from(el.querySelectorAll('pre')).map(n=>({text:n.querySelector('code')?.textContent??n.textContent,visible:visible(n),style:style(n)})),tables:Array.from(el.querySelectorAll('table')).map(t=>Array.from(t.rows).map(r=>Array.from(r.cells).map(c=>c.textContent))),math:Array.from(el.querySelectorAll('math,annotation,.formula')).map(n=>({tag:n.tagName,text:n.textContent,visible:visible(n)})),svgs:Array.from(el.querySelectorAll('svg')).map(n=>({label:n.getAttribute('aria-label'),text:n.textContent,viewBox:n.getAttribute('viewBox'),width:n.getBoundingClientRect().width})),ranges:Array.from(el.querySelectorAll('input[type=range],[role=slider]')).map(n=>({name:n.getAttribute('name'),id:n.id,min:n.getAttribute('min')??n.getAttribute('aria-valuemin'),max:n.getAttribute('max')??n.getAttribute('aria-valuemax'),step:n.getAttribute('step'),value:n.value??n.getAttribute('aria-valuenow')})),radios:Array.from(el.querySelectorAll('input[type=radio]')).map(n=>({name:n.name,value:n.value,label:n.closest('label')?.textContent})),buttons:Array.from(el.querySelectorAll('button')).map(n=>({text:n.textContent,aria:n.getAttribute('aria-label'),disabled:n.disabled})),style:style(el)};
  });
  writeFileSync(`${dir}/dom.json`,JSON.stringify(dom,null,2));writeFileSync(`${dir}/page.html`,dom.html);
  await page.screenshot({path:`${dir}/desktop.png`,fullPage:true});
  report.stats={headings:dom.headings.length,codes:dom.codes.length,tables:dom.tables.length,svgs:dom.svgs.filter(x=>x.width>80).length,ranges:dom.ranges.length,radioGroups:new Set(dom.radios.map(x=>x.name)).size};
  const ranges=page.locator('.vp-doc input[type=range]');
  for(let i=0;i<await ranges.count();i++){
   const r=ranges.nth(i);const before=await root.innerText();const orig=await r.inputValue();
   await r.evaluate(e=>{e.value=e.value===e.max?e.min:e.max;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));});
   await page.waitForTimeout(80);
   report.interactions.push({type:'range',index:i,original:orig,changedText:before!==await root.innerText()});
   await r.evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));},orig);
  }
  const radioNames=[...new Set(dom.radios.map(x=>x.name))];
  for(const name of radioNames){const items=page.locator(`input[type=radio][name="${name}"]`);await items.nth(Math.min(1,(await items.count())-1)).check({timeout:5000});}
  const submit=page.getByRole('button',{name:/提交.*(评分|答案)|提交$/});
  if(await submit.count()){const b=submit.first();const disabled=await b.isDisabled();if(!disabled){await b.click();report.interactions.push({type:'quizSubmit',text:(await root.innerText()).slice(-5500)});}else report.interactions.push({type:'quizSubmit',disabled});}
  const reset=page.getByRole('button',{name:/重新作答|重新答题/});
  if(await reset.count()){await reset.first().click();report.interactions.push({type:'quizReset',remaining:await page.locator('.vp-doc input[type=radio]:checked').count()});}
  const copy=page.locator('.vp-doc button.copy,.vp-doc button[data-action=copy]');
  if(await copy.count()){await copy.first().click({force:true});report.interactions.push({type:'copy',clipboardLength:(await page.evaluate(()=>navigator.clipboard.readText())).length});}
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(120);
  report.mobile=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,hiddenHeadings:Array.from(document.querySelectorAll('.vp-doc h1,.vp-doc h2,.vp-doc h3')).filter(n=>!n.getClientRects().length).map(n=>n.textContent)}));
  await page.screenshot({path:`${dir}/mobile.png`,fullPage:true});
  await page.evaluate(()=>document.documentElement.classList.add('dark'));await page.screenshot({path:`${dir}/mobile-dark.png`,fullPage:true});report.status='captured';
 }catch(e){report.status='capture-error';report.error=String(e);await page.screenshot({path:`${dir}/error.png`,fullPage:true}).catch(()=>{});}
 writeFileSync(`${dir}/report.json`,JSON.stringify(report,null,2));results.push(report);await context.close();
}
writeFileSync('lesson-audit/summary.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results.map(({slug,status,http,stats,mobile,errors,error})=>({slug,status,http,stats,mobile,errors,error})),null,2));await browser.close();
