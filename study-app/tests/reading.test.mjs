import test from 'node:test';
import assert from 'node:assert/strict';
import {importantVocabulary,importantReadingPacks} from '../src/reading.js';
import {read,hasTerm} from '../scripts/data-tools.mjs';

test('daily reading excludes reference-only words even if they have examples',()=>{
 const entries=[{term:'reference',examples:['An example.']},{term:'core',important:true,readingOrder:2,readingExample:'A core skill.'},{term:'first',important:true,readingOrder:1,readingExample:'The first item.'}];
 assert.deepEqual(importantVocabulary(entries).map(v=>v.term),['first','core']);
});
test('a new reviewed important entry joins reading without a UI edit',()=>{
 const entries=Array.from({length:5},(_,i)=>({term:'word'+i,important:true,readingOrder:i+1,readingExample:'An authored example.'}));
 entries.push({term:'salient',important:true,readingOrder:6,readingExample:'The report highlighted a salient discrepancy.'});
 const packs=importantReadingPacks(entries);assert.equal(packs.length,2);assert.equal(packs[1][0].term,'salient');
});
test('every selected important word has a reviewed reading example and stable order',()=>{
 const entries=importantVocabulary(read('vocabulary.json'));assert.ok(entries.length>=50);
 assert.equal(new Set(entries.map(v=>v.readingOrder)).size,entries.length);
 for(const v of entries){assert.ok(v.readingExample,v.term);assert.ok([v.term,...(v.forms||[])].some(f=>hasTerm(v.readingExample,f)),v.term);assert.ok(v.examples.includes(v.readingExample),v.term);}
});
test('the six added connector words are covered by focused daily reading',()=>{
 const important=new Map(importantVocabulary(read('vocabulary.json')).map(v=>[v.term,v]));
 for(const term of ['defer','prerequisite','solvent','eligibility','corroboration','notwithstanding'])assert.ok(important.get(term)?.readingExample,term);
});
