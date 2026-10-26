import test from 'node:test';
import assert from 'node:assert/strict';
import {read,hasTerm} from '../scripts/data-tools.mjs';
// This suite covers the original 40-question core batches; append-only hard sets have their own suite.
const chapters=['grammar','fillers','word-usage'].map(id=>{const c=read('chapters/'+id+'.json');return {...c,packs:c.packs.filter(p=>!p.id.startsWith('MH-'))};});
const questions=chapters.flatMap(c=>c.packs.flatMap(p=>p.questions));

test('new chapters have complete sets, explicit provenance and explanations for every alternative',()=>{
 for(const c of chapters){
  assert.equal(c.packs.length,8);assert.equal(c.source.kind,'original-format-practice');
  assert.equal(c.packs.flatMap(p=>p.questions).length,40);
  assert.deepEqual([...new Set(c.packs.map(p=>p.level))],['Warm-up','Mains-style','Higher practice']);
  for(const p of c.packs){assert.equal(p.questions.length,5);for(const q of p.questions){
   assert.equal(q.options.length,5,q.id);assert.ok(q.source.formatReferences.length,q.id);
   for(const key of ['relationship','clue','rule','model'])assert.ok(q.explanation[key],q.id+' '+key);
   assert.ok(!q.explanation.model.includes('___'),q.id+' unfinished model');
   if(!q.candidates){assert.deepEqual(new Set(q.explanation.rejects.map(r=>r.option)),new Set(q.options.filter(o=>o!==q.answer)),q.id);assert.ok(q.explanation.rejects.every(r=>r.reason.length>20),q.id);}
  }}
 }
});

test('all correct/incorrect combinations match the independently marked statement verdicts',()=>{
 const labels=['I','II','III'];
 for(const q of questions.filter(q=>q.candidates)){
  assert.ok(['correct','incorrect'].includes(q.selectionDirection),q.id);
  const required=q.candidates.filter(c=>q.selectionDirection==='incorrect'?!c.valid:c.valid).map(c=>c.label);
  const selected=labels.filter(l=>new RegExp('(?<![I])'+l+'(?![I])').test(q.answer));
  assert.deepEqual(selected,required,q.id);
  assert.equal(q.candidates.length,3,q.id);assert.ok(q.candidates.every(c=>c.reason.length>20),q.id);
 }
});

test('every swap has exactly one option restoring the complete reviewed model',()=>{
 for(const q of questions.filter(q=>q.skill.includes('swap'))){
  const matches=[...q.prompt.matchAll(/([a-z]+) \(([A-D])\)/gi)];
  assert.equal(matches.length,4,q.id);
  const original=Object.fromEntries(matches.map(m=>[m[2],m[1]]));
  const solutions=q.options.filter(option=>{
   const words={...original};for(const m of option.matchAll(/([A-D])–([A-D])/g))[words[m[1]],words[m[2]]]=[words[m[2]],words[m[1]]];
   return q.prompt.replace(/([a-z]+) \(([A-D])\)/gi,(_,word,label)=>words[label])===q.explanation.model;
  });
  assert.deepEqual(solutions,[q.answer],q.id);
 }
});

test('new important chapter words have shared reading examples and live question links',()=>{
 const vocabulary=read('vocabulary.json');
 const terms=new Set(['cursory','exhaustive','explicit','refute','redress','deter','disburse','stipulated','lucrative']);
 assert.equal(terms.size,9);
 for(const term of terms){const v=vocabulary.find(v=>v.term===term);assert.ok(v?.important,term);assert.ok(v.readingExample,term);assert.ok(v.questionIds.some(id=>questions.some(q=>q.id===id)),term);assert.ok([term,...(v.forms||[])].some(f=>hasTerm(v.readingExample,f)),term);}
});

test('the bank covers retained wording, incorrect directions, two-pair swaps and all filler variants',()=>{
 const skills=new Set(questions.map(q=>q.skill));
 for(const skill of ['phrase correction','single-part error spotting','combined correct/incorrect sentences','contextual filler','double filler','same-word filler','triple filler','multiple-fit phrase filler','word replacement','contextual usage combination','word swap','two-pair word swap'])assert.ok(skills.has(skill),skill);
 for(const answer of ['No error','No change required','No replacement required','No interchange required','None of these'])assert.ok(questions.some(q=>q.answer===answer),answer);
 assert.ok(questions.some(q=>q.selectionDirection==='incorrect'));
});
