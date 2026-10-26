import test from 'node:test';
import assert from 'node:assert/strict';
import {read,hasTerm} from '../scripts/data-tools.mjs';
const ids=['sentence-order','paragraph-coherence','column-matching'];
// Original ordering/matching batches only; appended Moderate–Hard sets have a separate suite.
const chapters=ids.map(id=>{const c=read('chapters/'+id+'.json');return {...c,packs:c.packs.filter(p=>!p.id.startsWith('MH-'))};});
const questions=chapters.flatMap(c=>c.packs.flatMap(p=>p.questions));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const parseMatch=s=>s==='None of the combinations'?[]:s.replace(/ only$/,'').split('; ').map(x=>x.split('–'));

test('ordering batch has 120 distinct complete questions with honest provenance and every alternative explained',()=>{
 assert.equal(new Set(questions.map(q=>q.prompt)).size,120);
 for(const c of chapters){
  assert.equal(c.packs.length,8);assert.equal(c.source.kind,'original-format-practice');
  assert.equal(c.packs.flatMap(p=>p.questions).length,40);
  for(const p of c.packs){assert.equal(p.questions.length,5);for(const q of p.questions){
   assert.ok(q.id.startsWith(c.id+'/'));assert.equal(q.options.length,5,q.id);
   assert.equal(new Set(q.options).size,5,q.id);assert.ok(q.options.includes(q.answer),q.id);
   assert.ok(q.source.formatReferences.length,q.id);
   for(const key of ['clue','rule','relationship','model','modelLabel'])assert.ok(q.explanation[key],q.id+' '+key);
   assert.deepEqual(new Set(q.explanation.rejects.map(r=>r.option)),new Set(q.options.filter(o=>o!==q.answer)),q.id);
   assert.ok(q.explanation.rejects.every(r=>r.reason.length>25),q.id);
  }}
 }
});

test('ordering keys use every part exactly once, respect anchors and reconstruct the reviewed model',()=>{
 for(const q of questions.filter(q=>q.ordering)){
  const o=q.ordering,labels=Object.keys(o.fragments);
  assert.deepEqual([...o.correctOrder].sort(),labels,q.id);
  assert.equal(new Set(o.correctOrder).size,labels.length,q.id);
  assert.equal(o.correctOrder.map(l=>o.fragments[l]).join(' '),q.explanation.model,q.id);
  if(o.fixed)assert.equal(o.correctOrder[o.fixed.position-1],o.fixed.label,q.id);
  if(o.requestedPosition)assert.equal(q.answer,o.correctOrder[o.requestedPosition-1],q.id);
  else{
   for(const option of q.options){const order=option==='No rearrangement required'?labels:option.split('');assert.deepEqual([...order].sort(),labels,q.id);}
   const solutions=q.options.filter(s=>same(s==='No rearrangement required'?labels:s.split(''),o.correctOrder));
   assert.deepEqual(solutions,[q.answer],q.id);
  }
 }
 const sentenceQuestions=chapters[0].packs.flatMap(p=>p.questions);
 assert.ok(sentenceQuestions.every(q=>q.options.includes('No rearrangement required')),'Option presence must not reveal that no rearrangement is correct.');
 assert.equal(sentenceQuestions.filter(q=>q.answer==='No rearrangement required').length,3);
 assert.equal(sentenceQuestions.filter(q=>q.ordering.fixed).length,10);
});

test('odd-sentence and insertion models preserve every required sentence in order',()=>{
 const coherence=questions.filter(q=>q.coherence);
 assert.equal(coherence.filter(q=>q.coherence.kind==='odd').length,10);
 assert.equal(coherence.filter(q=>q.coherence.kind==='insertion').length,10);
 for(const q of coherence){const c=q.coherence;if(c.kind==='odd'){
  assert.equal(q.answer,c.excludedLabel,q.id);
  const model=c.sentences.filter((_,i)=>String.fromCharCode(65+i)!==q.answer).join(' ');
  assert.equal(model,q.explanation.model,q.id);
 }else{
  const full=[...c.sentences];full.splice(c.position,0,c.inserted);
  assert.equal(full.join(' '),q.explanation.model,q.id);
  assert.equal(q.answer,String.fromCharCode(65+c.position),q.id);
 }}
});

test('matching keys include every valid reviewed join and exclude incomplete or invalid combinations',()=>{
 const qs=questions.filter(q=>q.matching);assert.equal(qs.length,40);
 assert.equal(qs.filter(q=>q.matching.kind==='two').length,20);
 assert.equal(qs.filter(q=>q.matching.kind==='three').length,10);
 assert.equal(qs.filter(q=>q.matching.kind==='meaning').length,10);
 for(const q of qs){const m=q.matching;
  assert.deepEqual(m.rowChecks.filter(r=>r.valid).map(r=>r.parts),m.validCombinations,q.id);
  const solutions=q.options.filter(s=>same(parseMatch(s),m.validCombinations));assert.deepEqual(solutions,[q.answer],q.id);
  for(const s of q.options)for(const parts of parseMatch(s)){
   assert.ok(m.starts[parts[0]],q.id);assert.ok(m.endings[parts.at(-1)],q.id);
   if(m.kind==='three'){assert.equal(parts.length,3,q.id);assert.ok(m.middles[parts[1]],q.id);}else assert.equal(parts.length,2,q.id);
  }
  for(const parts of m.validCombinations){
   if(m.kind!=='meaning'){const sentence=[m.starts[parts[0]],...(m.kind==='three'?[m.middles[parts[1]]]:[]),m.endings[parts.at(-1)]].join(' ');assert.ok(q.explanation.model.includes(sentence),q.id);}
  }
 }
 assert.equal(qs.filter(q=>q.answer==='None of the combinations').length,3);
});

test('three selected additions have reviewed daily examples and links to the new chapters',()=>{
 const vocab=read('vocabulary.json');
 for(const term of ['waive','reconcile','residual']){const v=vocab.find(v=>v.term===term);assert.ok(v?.important,term);assert.ok(v.readingOrder>59,term);assert.ok([term,...(v.forms||[])].some(f=>hasTerm(v.readingExample,f)),term);assert.ok(v.questionIds.some(id=>ids.some(prefix=>id.startsWith(prefix+'/'))),term);assert.ok(v.examples.includes(v.readingExample),term);}
});
