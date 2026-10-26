import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadChapters,read,project} from '../scripts/data-tools.mjs';
import path from 'node:path';
test('migration retains original questions; later additions and documented corrections are allowed',()=>{const legacy=[['cloze','cloze_trainer'],['connectors','connectors_trainer']];for(const [id,dir] of legacy){const old=JSON.parse(fs.readFileSync(path.join(project,'..',dir,'bank.json'),'utf8')),chapter=loadChapters().find(x=>x.chapter.id===id).chapter;const qs=chapter.packs.flatMap(p=>p.questions);assert.ok(qs.length>=old.sets.flatMap(s=>s.questions).length);for(const q of old.sets.flatMap(s=>s.questions)){const n=qs.find(x=>x.legacyId===q.id);assert.ok(n);if(n.correctionNote){assert.ok(n.correctionNote.trim().length>20,'Explain a reviewed correction.');}else{assert.equal(n.answer,q.answer);assert.deepEqual(n.options,q.options);}}}});
test('shared vocabulary includes newly identified important connector words and linked examples',()=>{const vocab=read('vocabulary.json');for(const term of ['defer','prerequisite','solvent','eligibility','corroboration','notwithstanding']){const v=vocab.find(v=>v.term===term);assert.ok(v);assert.ok(v.meaning);assert.ok(v.chapterIds.includes('connectors'));assert.ok(v.questionIds.length);assert.ok(v.examples.length);}});
test('the original 72 reading sentences and translations remain available',()=>{const r=read('reading.json');assert.equal(r.length,72);assert.ok(r.every(x=>x.text&&x.translation));});
