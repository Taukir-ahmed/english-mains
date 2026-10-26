import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {read,loadChapters,hasTerm} from '../scripts/data-tools.mjs';
const ids=['idioms-phrasal','context-vocabulary','spelling-confusables','advanced-mixed'];
// Retain coverage of this historical 160-question batch; appended levels have their own suite.
const originalTerms=new Set(['rule out','carry out','look into','at stake','credulous','discreet','adverse','complement']);
const chapters=ids.map(id=>{const c=read('chapters/'+id+'.json');return {...c,packs:c.packs.filter(p=>!p.id.startsWith('MH-')),vocabularyCandidates:c.vocabularyCandidates.filter(v=>originalTerms.has(v.term))};});
const qs=chapters.flatMap(c=>c.packs.flatMap(p=>p.questions));

test('all 560 earlier questions retain their original prompts, options, keys and explanations',()=>{
 const base=JSON.parse(fs.readFileSync(new URL('fixtures/pre-remaining-content.json',import.meta.url),'utf8'));
 const originalIds=new Set(base.questionIds);
 const old=loadChapters().flatMap(x=>x.chapter.packs.flatMap(p=>p.questions)).filter(q=>originalIds.has(q.id)).map(q=>({id:q.id,type:q.type,prompt:q.prompt,options:q.options,answer:q.answer,explanation:q.explanation}));
 assert.equal(old.length,base.questionCount);assert.equal(crypto.createHash('sha256').update(JSON.stringify(old)).digest('hex'),base.sha256);
});

test('remaining chapters contain 160 complete, distinct, original questions with all choices explained',()=>{
 assert.equal(qs.length,160);assert.equal(new Set(qs.map(q=>q.prompt+JSON.stringify((q.candidates||[]).map(c=>c.text)))).size,160);
 for(const c of chapters){assert.equal(c.packs.length,8);for(const p of c.packs){assert.equal(p.questions.length,5);for(const q of p.questions){
  assert.equal(q.source.kind,'original-format-practice');assert.ok(q.source.formatReferences.length);
  assert.equal(q.options.length,5,q.id);assert.equal(new Set(q.options).size,5,q.id);assert.ok(q.options.includes(q.answer),q.id);
  for(const key of ['relationship','clue','rule','model'])assert.ok(q.explanation[key],q.id+' '+key);
  assert.ok(!q.explanation.model.includes('___'),q.id);
  if(!q.candidates)assert.deepEqual(new Set(q.explanation.rejects.map(r=>r.option)),new Set(q.options.filter(o=>o!==q.answer)),q.id);
 }}}
});

test('usage combinations and multi-error parts match every independently reviewed verdict',()=>{
 const combinations=qs.filter(q=>q.candidates);assert.equal(combinations.length,30);
 for(const q of combinations){
  const needed=q.candidates.filter(c=>q.selectionDirection==='incorrect'?!c.valid:c.valid).map(c=>c.label);
  const actual=q.candidates.filter(c=>new RegExp('(?<![A-Z])'+c.label+'(?![A-Z])').test(q.answer)).map(c=>c.label);
  assert.deepEqual(actual,needed,q.id);assert.ok(q.candidates.every(c=>c.reason.length>20),q.id);
  if(q.partCorrections){const model=q.candidates.map(c=>q.partCorrections[c.label]?.text||c.text).join(' ');assert.equal(model,q.explanation.model,q.id);}
 }
 const idioms=chapters[0].packs.flatMap(p=>p.questions).filter(q=>q.candidates);
 assert.ok(new Set(idioms.map(q=>q.answer)).size>=5,'Candidate ordering must not expose a repeated combination key.');
});

test('synonym and antonym directions are explicit and not confused with each other',()=>{
 const lexical=qs.filter(q=>q.lexical);assert.equal(lexical.length,40);
 assert.equal(lexical.filter(q=>q.lexical.direction==='nearest').length,25);
 assert.equal(lexical.filter(q=>q.lexical.direction==='opposite').length,15);
 for(const q of lexical){assert.ok(q.prompt.includes('['+q.lexical.target+']'),q.id);assert.ok(q.instructions.includes(q.lexical.direction==='nearest'?'NEAREST':'OPPOSITE'),q.id);}
});

test('spelling keys select the conventional form and never a distractor spelling',()=>{
 const spelling=qs.filter(q=>q.spelling);assert.equal(spelling.length,15);
 for(const q of spelling){assert.equal(q.answer,q.spelling.correct,q.id);assert.ok(q.explanation.model.includes(q.spelling.correct),q.id);assert.ok(q.instructions.includes('correctly spelled'),q.id);}
});

test('paragraph error counts reconstruct the clean paragraph from every independently faulty phrase',()=>{
 const counts=qs.filter(q=>q.grammarIssues);assert.equal(counts.length,10);
 assert.deepEqual(new Set(counts.map(q=>q.grammarIssues.length)),new Set([0,1,2,3,4]));
 for(const q of counts){let corrected=q.prompt;for(const e of q.grammarIssues){assert.equal(corrected.split(e.incorrect).length,2,q.id);corrected=corrected.replace(e.incorrect,e.correction);assert.ok(e.reason.length>20,q.id);}assert.equal(corrected,q.explanation.model,q.id);assert.equal(q.answer,q.grammarIssues.length===1?'1 error':q.grammarIssues.length+' errors',q.id);}
});

test('hybrids and complete word restorations satisfy both tasks and all positions',()=>{
 const hybrids=qs.filter(q=>q.hybrid);assert.equal(hybrids.length,10);
 for(const q of hybrids){const h=q.hybrid;assert.equal(new Set(h.order).size,3);assert.equal(h.order.map(l=>h.parts[l].replace('___',h.word)).join(' '),q.explanation.model,q.id);assert.equal(q.answer,h.order.join('')+' / '+h.word,q.id);}
 const restores=qs.filter(q=>q.restoration);assert.equal(restores.length,5);
 const labels=['A','B','C','D'];
 for(const q of restores){const r=q.restoration;
  const solutions=q.options.filter(option=>{const order=option.split(', ');assert.deepEqual([...order].sort(),labels,q.id);const words=order.map(l=>r.shown[labels.indexOf(l)]);return words.every((w,i)=>w===r.correctWords[i]);});
  assert.deepEqual(solutions,[q.answer],q.id);
  assert.equal(r.template.replace(/\{([A-D])\}/g,(_,l)=>r.correctWords[labels.indexOf(l)]),q.explanation.model,q.id);
 }
 const dual=qs.filter(q=>q.dual);assert.equal(dual.length,5);
 for(const q of dual){const d=q.dual;assert.equal(d.sentences.map((s,i)=>s.replace('['+d.originals[i]+']',d.replacements[i])).join(' '),q.explanation.model,q.id);assert.equal(q.answer,'I: '+d.replacements[0]+'; II: '+d.replacements[1],q.id);}
});

test('only eight selected additions join shared daily reading with reviewed examples',()=>{
 const terms=new Set(chapters.flatMap(c=>c.vocabularyCandidates.map(v=>v.term)));assert.equal(terms.size,8);
 const vocab=read('vocabulary.json');for(const term of terms){const v=vocab.find(v=>v.term===term);assert.ok(v?.important,term);assert.ok(v.readingOrder>62,term);assert.ok([term,...(v.forms||[])].some(f=>hasTerm(v.readingExample,f)),term);assert.ok(v.examples.includes(v.readingExample),term);assert.ok(v.questionIds.some(id=>ids.some(c=>id.startsWith(c+'/'))),term);}
});
