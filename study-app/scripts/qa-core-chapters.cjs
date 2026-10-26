const {chromium}=require('C:/Users/rockt/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('path'),fs=require('fs'),assert=require('assert'),{pathToFileURL}=require('url');
const root=path.resolve(__dirname,'../..');
const args=process.argv.slice(2),level=args.find(s=>s.startsWith('--level='))?.slice(8),onlyBatch=args.find(s=>s.startsWith('--batch='))?.slice(8),requested=args.filter(s=>!s.startsWith('--')),ids=requested.length?requested:['grammar','fillers','word-usage'];
const batch=onlyBatch||(level?'moderate-hard':ids.includes('advanced-mixed')?'remaining':requested.length?'ordering':'core'),shotPrefix=batch==='core'?'three-chapters':batch;
const chapters=ids.map(id=>{const c=JSON.parse(fs.readFileSync(path.join(root,'study-app/data/chapters',id+'.json'),'utf8'));return {...c,levelPackCount:c.packs.filter(p=>!level||p.level===level).length,packs:c.packs.filter(p=>(!level||p.level===level)&&(!onlyBatch||p.batch===onlyBatch))};});
const vocab=JSON.parse(fs.readFileSync(path.join(root,'study-app/data/vocabulary.json'),'utf8'));
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(root,'English_Practice.html')).href);
 let checked=0,wrong=0;
 for(const chapter of chapters){
  await page.getByRole('button',{name:chapter.title,exact:true}).click();
  if(level){await page.getByLabel('Level',{exact:true}).selectOption(level);assert.equal(await page.getByLabel('Set',{exact:true}).locator('option').count(),chapter.levelPackCount);}
  for(const pack of chapter.packs){
   await page.getByLabel('Set',{exact:true}).selectOption(pack.id);
   assert.equal(await page.locator('article.question').count(),5);
   if(level&&pack.passage)assert.ok((await page.locator('.passage .blank').allTextContents()).every(s=>s.includes('______')));
   for(const [i,q]of pack.questions.entries()){
    const card=page.getByTestId('question-'+q.id);assert.equal(await card.getByRole('status').count(),0);
    const choice=i===0?q.options.find(x=>x!==q.answer):q.answer;
    if(i===0)wrong++;
    await card.getByRole('button',{name:String.fromCharCode(65+q.options.indexOf(choice))+'. '+choice,exact:true}).click();
    assert.ok((await card.getByRole('status').innerText()).includes(i===0?'Incorrect.':'Correct.'),q.id);
    assert.ok((await card.getByRole('status').innerText()).includes(q.answer),q.id);
    assert.equal(await card.locator('.option:disabled').count(),5);
    assert.ok((await card.getByTestId('explanation-'+q.id).innerText()).includes(q.explanation.clue),q.id);
    assert.ok((await card.getByTestId('explanation-'+q.id).innerText()).includes(q.explanation.model),q.id);
    if(level&&pack.passage){assert.equal(await page.locator('.passage .blank').nth(q.slot-1).innerText(),q.completion);for(let k=i+1;k<pack.questions.length;k++)assert.ok((await page.locator('.passage .blank').nth(k).innerText()).includes('______'));}
    if(q.candidates){await card.getByText('Check every candidate',{exact:true}).click();for(const c of q.candidates)assert.ok((await card.innerText()).includes(c.reason),q.id);}
    checked++;
   }
  }
 }
 let data=await page.evaluate(()=>JSON.parse(localStorage.getItem('mains-english-progress-v1')));assert.equal(data.attempts.length,checked);
 const lastChapter=chapters.at(-1),lastPack=lastChapter.packs.at(-1);
 await page.reload();await page.getByRole('button',{name:lastChapter.title,exact:true}).click();
 await page.getByLabel('Question filter').selectOption('mistakes');assert.equal(await page.getByLabel('Set',{exact:true}).locator('option').count(),lastChapter.packs.length);
 await page.getByLabel('Set',{exact:true}).selectOption(lastPack.id);const q=lastPack.questions[0],card=page.getByTestId('question-'+q.id);
 assert.ok((await card.getByRole('status').innerText()).includes('Incorrect.'));
 await card.getByRole('button',{name:'Try this question again',exact:true}).click();
 await card.getByRole('button',{name:String.fromCharCode(65+q.options.indexOf(q.answer))+'. '+q.answer,exact:true}).click();
 data=await page.evaluate(()=>JSON.parse(localStorage.getItem('mains-english-progress-v1')));assert.equal(data.attempts.filter(a=>a.questionId===q.id).length,2);
 await page.getByRole('button',{name:'Daily reading',exact:true}).click();const important=vocab.filter(v=>v.important);const count=Math.ceil(important.length/5);
 await page.getByLabel('Important reading pack').selectOption(String(count-1));
 assert.equal(await page.locator('.important-reading-word').count(),important.length%5||5);
 const lastWord=[...important].sort((a,b)=>a.readingOrder-b.readingOrder).at(-1);assert.ok((await page.locator('main').innerText()).includes(lastWord.term));
 await page.getByRole('button',{name:'Vocabulary',exact:true}).click();await page.getByRole('searchbox').fill('disburse');assert.equal(await page.locator('main article.reference-row').count(),1);assert.ok((await page.locator('main').innerText()).includes('pay out money'));
 await page.setViewportSize({width:390,height:844});
 for(const chapter of chapters){await page.getByRole('button',{name:'Practice',exact:true}).click();await page.getByRole('button',{name:chapter.title,exact:true}).click();if(level)await page.getByLabel('Level',{exact:true}).selectOption(level);await page.getByLabel('Set',{exact:true}).selectOption(chapter.packs.at(-1).id);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
 await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(root,'analysis/'+shotPrefix+'-mobile.png')});
 await page.getByRole('button',{name:'Daily reading',exact:true}).click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.setViewportSize({width:1280,height:900});await page.getByRole('button',{name:'Practice',exact:true}).click();await page.getByRole('button',{name:chapters[0].title,exact:true}).click();if(level)await page.getByLabel('Level',{exact:true}).selectOption(level);await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(root,'analysis/'+shotPrefix+'-desktop.png')});
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(root,'study-app/'+batch+'-chapters-qa.json'),JSON.stringify({chapters:chapters.map(c=>c.title),questionsChecked:checked,deliberateWrongAnswers:wrong,immediateFeedback:true,allOptionsLock:true,combinationsExplained:true,persistenceAndRetryHistory:true,mistakeFilter:true,importantWords:important.length,vocabularyAndReadingSynced:true,mobileOverflow:false,pageErrors:errors},null,2));
 console.log('Passed:',checked,'questions, immediate explanations, persistence/retry, mistake filters, vocabulary/reading sync and mobile layout.');
}finally{await browser.close();}})().catch(e=>{console.error(e.stack);process.exit(1)});
