import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {read,loadChapters,hasTerm} from '../scripts/data-tools.mjs';
const ids=['connectors','word-usage','sentence-order'],batch='moderate-hard-2',level='Moderate–Hard';
const chapters=ids.map(id=>read('chapters/'+id+'.json'));
const packs=chapters.flatMap(c=>c.packs.filter(p=>p.batch===batch)),qs=packs.flatMap(p=>p.questions);

test('second hard batch appends 45 while preserving all 765 earlier question cores',()=>{
 const base=JSON.parse(fs.readFileSync(new URL('fixtures/pre-moderate-hard-2-content.json',import.meta.url),'utf8')),known=new Set(base.questionIds);
 const prior=loadChapters().flatMap(x=>x.chapter.packs.flatMap(p=>p.questions)).filter(q=>known.has(q.id)).map(q=>({id:q.id,type:q.type,prompt:q.prompt,options:q.options,answer:q.answer,explanation:q.explanation}));
 assert.equal(prior.length,765);assert.equal(prior.length,base.questionCount);assert.equal(crypto.createHash('sha256').update(JSON.stringify(prior)).digest('hex'),base.sha256);
 assert.equal(qs.length,45);assert.equal(new Set(qs.map(q=>q.id)).size,45);
 for(const c of chapters){const sets=c.packs.filter(p=>p.batch===batch);assert.equal(sets.length,3);for(const p of sets){assert.equal(p.level,level);assert.equal(p.questions.length,5);}}
});

test('new hard questions have complete explanations and reviewed close alternatives',()=>{
 for(const q of qs){assert.equal(q.options.length,5,q.id);assert.equal(new Set(q.options).size,5,q.id);assert.ok(q.options.includes(q.answer),q.id);
  for(const key of ['relationship','clue','rule','model'])assert.ok(q.explanation[key],q.id+' '+key);
  assert.equal(q.difficultyReview.target,level);assert.ok(q.difficultyReview.whyNot.length>30,q.id);assert.ok(q.difficultyReview.reasoningSteps.length>=2,q.id);
  assert.equal(q.source.kind,'original-format-practice');assert.ok(q.source.note.includes('not independently calibrated'));
  if(!q.candidates)assert.deepEqual(new Set(q.explanation.rejects.map(r=>r.option)),new Set(q.options.filter(s=>s!==q.answer)),q.id);
 }
});

test('every rewrite and replacement combination includes all required reviewed verdicts',()=>{
 const combos=qs.filter(q=>q.candidates);assert.equal(combos.length,20);
 for(const q of combos){const wanted=q.candidates.filter(c=>q.selectionDirection==='incorrect'?!c.valid:c.valid).map(c=>c.label),chosen=q.candidates.filter(c=>new RegExp('(?<![A-Z])'+c.label+'(?![A-Z])').test(q.answer)).map(c=>c.label);assert.deepEqual(chosen,wanted,q.id);assert.ok(q.candidates.every(c=>c.reason.length>30),q.id);}
 const complete=chapters[0].packs.find(p=>p.id==='MH-N01').questions;assert.ok(complete.every(q=>q.explanation.rejects.length===4));
});

test('related-word restorations use every original label and have one complete model repair',()=>{
 const labels=['A','B','C','D'],restores=qs.filter(q=>q.restoration);assert.equal(restores.length,5);
 const cycleSizes=[];
 for(const q of restores){const r=q.restoration;const solutions=q.options.filter(s=>{const p=s.split(', ');assert.deepEqual([...p].sort(),labels,q.id);return p.map(l=>r.shown[labels.indexOf(l)]).every((w,i)=>w===r.correctWords[i]);});assert.deepEqual(solutions,[q.answer],q.id);
  assert.equal(r.template.replace(/\{([A-D])\}/g,(_,l)=>r.correctWords[labels.indexOf(l)]),q.explanation.model,q.id);
  assert.equal(r.bindings.length,4);cycleSizes.push(r.repair.filter((l,i)=>l!==labels[i]).length);
 }
 assert.ok(cycleSizes.includes(0),'A genuinely unchanged order is retained.');assert.ok(cycleSizes.includes(3),'At least one three-word cycle must be repaired.');assert.ok(cycleSizes.includes(4),'At least one four-word repair must be completed.');
});

test('new sentence orders reconstruct full models, respect anchors and do not expose no-change keys',()=>{
 const orders=qs.filter(q=>q.ordering);assert.equal(orders.length,15);
 assert.equal(orders.filter(q=>q.ordering.fixed).length,6);assert.equal(orders.filter(q=>q.answer==='No rearrangement required').length,1);
 for(const q of orders){const o=q.ordering,labels=Object.keys(o.fragments);assert.ok(labels.length>=7,q.id);assert.deepEqual([...o.correctOrder].sort(),labels,q.id);assert.equal(o.correctOrder.map(l=>o.fragments[l]).join(' '),q.explanation.model,q.id);
  if(o.fixed)assert.equal(o.correctOrder[o.fixed.position-1],o.fixed.label,q.id);
  assert.ok(q.options.includes('No rearrangement required'),q.id);
  const solutions=q.options.filter(s=>{const p=s==='No rearrangement required'?labels:s.split('');assert.deepEqual([...p].sort(),labels,q.id);return JSON.stringify(p)===JSON.stringify(o.correctOrder);});assert.deepEqual(solutions,[q.answer],q.id);
  assert.equal(o.reviewedAlternatives.length,4);assert.ok(o.reviewedAlternatives.every(r=>r.reason.length>40),q.id);
 }
});

test('six selected vocabulary additions reach both new questions and shared daily reading',()=>{
 const vocab=read('vocabulary.json'),newIds=new Set(qs.map(q=>q.id));
 for(const term of ['infer','imply','prescribe','proscribe','creditable','detract']){const v=vocab.find(v=>v.term===term);assert.ok(v?.important,term);assert.ok(v.readingOrder>76,term);assert.ok([term,...(v.forms||[])].some(f=>hasTerm(v.readingExample,f)),term);assert.ok(v.questionIds.some(id=>newIds.has(id)),term);assert.ok(v.examples.includes(v.readingExample),term);}
});
