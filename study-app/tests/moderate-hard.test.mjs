import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {read,loadChapters,hasTerm} from '../scripts/data-tools.mjs';
const ids=['cloze','fillers','grammar'],level='Moderate–Hard';
const chapters=ids.map(id=>read('chapters/'+id+'.json'));
const packs=chapters.flatMap(c=>c.packs.filter(p=>p.batch==='moderate-hard-1'));
const questions=packs.flatMap(p=>p.questions);

test('hard batch appends 45 questions without changing any of the previous 720 question cores',()=>{
 const base=JSON.parse(fs.readFileSync(new URL('fixtures/pre-moderate-hard-content.json',import.meta.url),'utf8')),oldIds=new Set(base.questionIds);
 const old=loadChapters().flatMap(x=>x.chapter.packs.flatMap(p=>p.questions)).filter(q=>oldIds.has(q.id)).map(q=>({id:q.id,type:q.type,prompt:q.prompt,options:q.options,answer:q.answer,explanation:q.explanation}));
 assert.equal(old.length,720);assert.equal(old.length,base.questionCount);assert.equal(crypto.createHash('sha256').update(JSON.stringify(old)).digest('hex'),base.sha256);
 assert.equal(questions.length,45);assert.equal(new Set(questions.map(q=>q.id)).size,45);
 for(const c of chapters){const added=c.packs.filter(p=>p.batch==='moderate-hard-1');assert.equal(added.length,3);for(const p of added){assert.equal(p.level,level);assert.equal(p.questions.length,5);assert.ok(p.id.startsWith('MH-'));}}
});

test('every harder item has a reviewed near foil, at least two reasoning steps and full feedback',()=>{
 for(const q of questions){
  assert.equal(q.options.length,5,q.id);assert.equal(new Set(q.options).size,5,q.id);assert.ok(q.options.includes(q.answer),q.id);
  assert.equal(q.difficultyReview.target,level);assert.ok(q.difficultyReview.nearestAlternative,q.id);assert.ok(q.difficultyReview.whyNot.length>30,q.id);assert.ok(q.difficultyReview.reasoningSteps.length>=2,q.id);
  for(const key of ['clue','rule','model','relationship'])assert.ok(q.explanation[key],q.id+' '+key);
  assert.equal(q.source.kind,'original-format-practice');assert.ok(q.source.note.includes('not independently calibrated'));
  if(!q.candidates)assert.deepEqual(new Set(q.explanation.rejects.map(r=>r.option)),new Set(q.options.filter(s=>s!==q.answer)),q.id);
 }
});

test('multiple-fit and error-combination keys include every reviewed required statement',()=>{
 for(const q of questions.filter(q=>q.candidates)){
  const required=q.candidates.filter(c=>q.selectionDirection==='incorrect'?!c.valid:c.valid).map(c=>c.label);
  const chosen=q.candidates.filter(c=>new RegExp('(?<![A-Z])'+c.label+'(?![A-Z])').test(q.answer)).map(c=>c.label);
  assert.deepEqual(chosen,required,q.id);assert.ok(q.candidates.every(c=>c.reason.length>30),q.id);
  if(q.partCorrections)assert.equal(q.candidates.map(c=>q.partCorrections[c.label]?.text||c.text).join(' '),q.explanation.model,q.id);
 }
 assert.ok(questions.some(q=>q.answer==='No error'));assert.ok(questions.some(q=>q.answer==='None'));
 const repairs=chapters[2].packs.find(p=>p.id==='MH-G01').questions;assert.ok(repairs.every(q=>q.options.includes('No change required')));assert.equal(repairs.filter(q=>q.answer==='No change required').length,1);
});

test('cloze packs contain full context and each solution model reveals only its own blank',()=>{
 for(const p of packs.filter(p=>p.passage)){
  assert.ok(p.passage.split(/\s+/).length>=140,p.id);
  const slots=[...p.passage.matchAll(/\{\{(\d+)\}\}/g)].map(m=>Number(m[1]));assert.deepEqual(slots,[1,2,3,4,5],p.id);
  for(const q of p.questions){assert.ok(hasTerm(q.explanation.model,q.completion),q.id);assert.ok(!q.explanation.model.includes('{{'),q.id);for(const other of p.questions.filter(other=>other.slot>q.slot&&other.completion!==q.completion))assert.ok(!hasTerm(q.explanation.model,other.completion),q.id+' leaks '+other.slot);}
 }
});

test('six selected new priorities have examples, stable appended positions and new-question links',()=>{
 const vocabulary=read('vocabulary.json'),newIds=new Set(questions.map(q=>q.id));
 for(const term of ['qualify','preclude','suffice','contingent','calibrate','discount']){const v=vocabulary.find(v=>v.term===term);assert.ok(v?.important,term);assert.ok(v.readingOrder>70,term);assert.ok([term,...(v.forms||[])].some(f=>hasTerm(v.readingExample,f)),term);assert.ok(v.questionIds.some(id=>newIds.has(id)),term);assert.ok(v.examples.includes(v.readingExample),term);}
 assert.ok(vocabulary.find(v=>v.term==='qualify').meaning.includes('requirements'),'Both senses used in the new filler must be covered.');
});
