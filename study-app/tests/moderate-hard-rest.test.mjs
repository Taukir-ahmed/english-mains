import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {read,loadChapters,hasTerm} from '../scripts/data-tools.mjs';
const batch='moderate-hard-rest',level='Moderate–Hard';
const ids=['paragraph-coherence','column-matching','idioms-phrasal','context-vocabulary','spelling-confusables','advanced-mixed'];
const chapters=ids.map(id=>read('chapters/'+id+'.json'));
const packs=chapters.flatMap(c=>c.packs.filter(p=>p.batch===batch)),qs=packs.flatMap(p=>p.questions);
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

test('final harder layer appends 90 and preserves all 810 earlier question cores',()=>{
 const baseline=JSON.parse(fs.readFileSync(new URL('fixtures/pre-moderate-hard-rest-content.json',import.meta.url),'utf8')),known=new Set(baseline.questionIds);
 const previous=loadChapters().flatMap(x=>x.chapter.packs.flatMap(p=>p.questions)).filter(q=>known.has(q.id)).map(q=>({id:q.id,type:q.type,prompt:q.prompt,options:q.options,answer:q.answer,explanation:q.explanation}));
 assert.equal(previous.length,810);assert.equal(previous.length,baseline.questionCount);assert.equal(crypto.createHash('sha256').update(JSON.stringify(previous)).digest('hex'),baseline.sha256);
 assert.equal(qs.length,90);assert.equal(new Set(qs.map(q=>q.id)).size,90);
 for(const c of chapters){const ps=c.packs.filter(p=>p.batch===batch);assert.equal(ps.length,3);for(const p of ps){assert.equal(p.level,level);assert.equal(p.questions.length,5);}}
 assert.ok(loadChapters().every(x=>x.chapter.packs.some(p=>p.level===level)),'Every chapter now has the shared harder level.');
});

test('all new questions provide full feedback, source limits and reviewed close alternatives',()=>{
 assert.equal(new Set(qs.map(q=>q.prompt+JSON.stringify(q.candidates||[]))).size,90);
 for(const q of qs){assert.equal(q.options.length,5,q.id);assert.equal(new Set(q.options).size,5,q.id);assert.ok(q.options.includes(q.answer),q.id);
  for(const k of ['relationship','clue','rule','model'])assert.ok(q.explanation[k]?.length>20,q.id+' '+k);
  assert.ok(!q.explanation.model.includes('___'),q.id);assert.equal(q.difficultyReview.target,level);assert.ok(q.difficultyReview.whyNot.length>30,q.id);assert.ok(q.difficultyReview.reasoningSteps.length>=2,q.id);
  assert.equal(q.source.kind,'original-format-practice');assert.ok(q.source.formatReferences.length);assert.ok(q.source.note.includes('not independently calibrated'));
  if(!q.candidates)assert.deepEqual(new Set(q.explanation.rejects.map(r=>r.option)),new Set(q.options.filter(o=>o!==q.answer)),q.id);
 }
});

test('paragraph orders and insertions preserve every sentence and named reference link',()=>{
 const ordered=qs.filter(q=>q.ordering),coherence=qs.filter(q=>q.coherence);assert.equal(ordered.length,5);assert.equal(coherence.length,10);
 for(const q of ordered){const o=q.ordering,labels=Object.keys(o.fragments);assert.equal(labels.length,6);assert.deepEqual([...o.correctOrder].sort(),labels);assert.equal(o.correctOrder.map(l=>o.fragments[l]).join(' '),q.explanation.model);
  for(const s of q.options)assert.deepEqual([...s].sort(),labels,q.id);assert.deepEqual(q.options.filter(s=>equal([...s],o.correctOrder)),[q.answer]);
 }
 for(const q of coherence){const c=q.coherence;if(c.kind==='odd'){assert.equal(q.answer,c.excludedLabel);assert.equal(c.sentences.filter((_,i)=>String.fromCharCode(65+i)!==c.excludedLabel).join(' '),q.explanation.model);}else{const full=[...c.sentences];full.splice(c.position,0,c.inserted);assert.equal(full.join(' '),q.explanation.model);assert.equal(q.answer,String.fromCharCode(65+c.position));}}
 const inserted=coherence.filter(q=>q.coherence.kind==='insertion');assert.equal(inserted.length,5);
 assert.ok(inserted[0].coherence.sentences[2].startsWith('That possibility of a systematic difference'));
 assert.ok(inserted[2].coherence.sentences[2].startsWith('Including this missing mark'));
});

test('matching keys include all valid joins and full cross-product verdicts, without one-to-one assumptions',()=>{
 const matching=qs.filter(q=>q.matching);assert.equal(matching.length,15);
 const parse=s=>s==='None of the combinations'?[]:s.replace(/ only$/,'').split('; ').map(x=>x.split('–'));
 for(const q of matching){const m=q.matching,start=Object.keys(m.starts),end=Object.keys(m.endings),middle=m.middles?Object.keys(m.middles):[];
  assert.equal(m.rowChecks.length,start.length*end.length*(middle.length||1));assert.equal(new Set(m.rowChecks.map(r=>r.parts.join(''))).size,m.rowChecks.length);
  const valid=m.rowChecks.filter(r=>r.valid).map(r=>r.parts);assert.deepEqual(valid,m.validCombinations,q.id);assert.deepEqual(q.options.filter(s=>equal(parse(s),valid)),[q.answer],q.id);
  for(const r of m.rowChecks){assert.ok(start.includes(r.parts[0]));assert.ok(end.includes(r.parts.at(-1)));if(middle.length)assert.ok(middle.includes(r.parts[1]));assert.ok(r.reason.length>40);}
  if(m.kind!=='meaning')for(const c of valid){const model=[m.starts[c[0]],...(middle.length?[m.middles[c[1]]]:[]),m.endings[c.at(-1)]].join(' ');assert.ok(q.explanation.model.includes(model),q.id);}
 }
 assert.equal(matching.filter(q=>q.matching.kind==='three').length,5);assert.equal(matching.filter(q=>q.matching.kind==='meaning').length,5);
 assert.ok(matching.some(q=>q.matching.validCombinations.length===5),'Some starts have more than one genuine match.');
});

test('combination keys preserve every reviewed verdict and contextual synonyms are genuinely allowed together',()=>{
 const combinations=qs.filter(q=>q.candidates);assert.equal(combinations.length,30);
 for(const q of combinations){const wanted=q.candidates.filter(c=>c.valid).map(c=>c.label),actual=q.candidates.filter(c=>new RegExp('(?<![A-Z])'+c.label+'(?![A-Z])').test(q.answer)).map(c=>c.label);assert.deepEqual(actual,wanted,q.id);assert.ok(q.candidates.every(c=>c.reason.length>30),q.id);}
 const lexical=qs.filter(q=>q.lexical);assert.equal(lexical.length,10);assert.equal(lexical.filter(q=>q.lexical.direction==='opposite').length,5);
 for(const q of lexical){assert.ok(q.prompt.includes('['+q.lexical.target+']'));assert.ok(q.instructions.includes(q.lexical.direction==='nearest'?'NEAREST':'OPPOSITE'));}
 const fit=qs.find(q=>q.candidates?.some(c=>c.text==='unworkable'));assert.ok(fit.candidates.find(c=>c.text==='unworkable').valid);assert.ok(fit.candidates.find(c=>c.text==='infeasible').valid);
});

test('mixed counts reconstruct the corrected paragraphs and hybrids have complete clause bindings',()=>{
 const counts=qs.filter(q=>q.grammarIssues);assert.equal(counts.length,5);assert.deepEqual(new Set(counts.map(q=>q.grammarIssues.length)),new Set([0,1,2,3,4]));
 for(const q of counts){let model=q.prompt;for(const e of q.grammarIssues){assert.equal(model.split(e.incorrect).length,2,q.id);model=model.replace(e.incorrect,e.correction);assert.ok(e.reason.length>30);}assert.equal(model,q.explanation.model,q.id);assert.equal(q.answer,q.grammarIssues.length===1?'1 error':q.grammarIssues.length+' errors');}
 const hybrids=qs.filter(q=>q.hybrid);assert.equal(hybrids.length,5);
 for(const q of hybrids){const h=q.hybrid;assert.equal(new Set(h.order).size,3);assert.equal(Object.values(h.parts).filter(s=>s.includes('___')).length,1);assert.equal(h.order.map(l=>h.parts[l]).join(' ').replace('___',h.word),q.explanation.model);assert.equal(q.answer,h.order.join('')+' / '+h.word);}
});

test('only ten selected new words append to focused reading with reviewed examples and question links',()=>{
 const vocab=read('vocabulary.json'),newIds=new Set(qs.map(q=>q.id));
 for(const term of ['caveat','tenable','disinterested','equivocal','material','red herring','at face value','put up with','complaisance','precedence']){const v=vocab.find(v=>v.term===term);assert.ok(v?.important,term);assert.ok(v.readingOrder>82,term);assert.ok([term,...(v.forms||[])].some(f=>hasTerm(v.readingExample,f)),term);assert.ok(v.questionIds.some(id=>newIds.has(id)),term);assert.ok(v.examples.includes(v.readingExample),term);}
 assert.equal(vocab.filter(v=>v.important).length,92);
});
