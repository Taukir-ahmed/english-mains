const {chromium}=require('C:/Users/rockt/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('path'),fs=require('fs'),assert=require('assert'),{pathToFileURL}=require('url');
const root=path.resolve(__dirname,'../..');
const vocabulary=JSON.parse(fs.readFileSync(path.join(root,'study-app/data/vocabulary.json'),'utf8')),important=vocabulary.filter(v=>v.important),packCount=Math.ceil(important.length/5);
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(root,'English_Practice.html')).href);
 await page.getByRole('button',{name:'Daily reading',exact:true}).click();
 assert.equal(await page.getByLabel('Reading source').inputValue(),'important');
 assert.equal(await page.locator('.important-reading-word').count(),5);
 assert.equal(await page.locator('.important-reading-word h3').first().innerText(),'mitigate');
 const terms=[];
 for(let i=0;i<packCount;i++){await page.getByLabel('Important reading pack').selectOption(String(i));const pack=await page.locator('.important-reading-word h3').allTextContents();terms.push(...pack);assert.equal(await page.locator('.important-reading-word .reading-text').count(),Math.min(5,important.length-i*5));}
 assert.equal(new Set(terms).size,important.length);
 for(const term of ['defer','prerequisite','eligibility','corroboration','notwithstanding','solvent'])assert.ok(terms.includes(term));
 await page.reload();await page.getByRole('button',{name:'Daily reading',exact:true}).click();assert.equal(await page.getByLabel('Important reading pack').inputValue(),String(packCount-1));
 await page.getByLabel('Important reading pack').selectOption('0');await page.getByRole('button',{name:'Next 5 words'}).click();assert.equal(await page.getByLabel('Important reading pack').inputValue(),'1');
 await page.screenshot({path:path.join(root,'analysis/important-reading.png')});
 await page.getByLabel('Reading source').selectOption('sentences');assert.equal(await page.locator('main ol>li').count(),72);
 await page.getByRole('button',{name:'Vocabulary',exact:true}).click();assert.equal(await page.getByLabel('Vocabulary scope').inputValue(),'important');assert.equal(await page.locator('main article.reference-row').count(),important.length);
 await page.getByLabel('Vocabulary scope').selectOption('all');assert.equal(await page.locator('main article.reference-row').count(),vocabulary.length);
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Daily reading',exact:true}).click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.locator('.important-reading-word').first().getByText('Meaning and usual word partners',{exact:true}).click();assert.ok((await page.locator('.important-reading-word').first().innerText()).includes('care'));
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(root,'study-app/important-reading-qa.json'),JSON.stringify({wordsCovered:important.length,packSize:5,importantDefault:true,fullReferenceEntries:vocabulary.length,packPositionPersists:true,originalReadingsRetained:72,mobileOverflow:false,pageErrors:errors},null,2));console.log('Focused reading checks passed:',important.length,'important words, five-word packs, shared definitions and preserved reference/reading content.');
}finally{await browser.close();}})().catch(e=>{console.error(e.stack);process.exit(1)});
