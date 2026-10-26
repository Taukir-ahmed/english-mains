import { read,loadChapters,normalize,hasTerm } from './data-tools.mjs';
const chapters=loadChapters(),vocab=read('vocabulary.json'),ids=new Set(),chapterIds=new Set(),vocabIds=new Set(),terms=new Set();
for(const v of vocab){if(!v.id||!v.term||!v.meaning||vocabIds.has(v.id)||terms.has(normalize(v.term)))throw Error('Invalid/duplicate vocabulary: '+v.term);vocabIds.add(v.id);terms.add(normalize(v.term));}
const readingOrders=new Set();
for(const v of vocab)if(v.important!==undefined&&typeof v.important!=='boolean')throw Error('Important must be true or false: '+v.term);
for(const v of vocab.filter(v=>v.important)){
 if(!v.readingExample||![v.term,...(v.forms||[])].some(form=>hasTerm(v.readingExample,form)))throw Error('Important word needs a reviewed example containing the word or its form: '+v.term);
 if(!Number.isInteger(v.readingOrder)||v.readingOrder<1||readingOrders.has(v.readingOrder))throw Error('Invalid daily-reading order for '+v.term);
 readingOrders.add(v.readingOrder);
}
let count=0,packs=0;
for(const {entry,chapter:c} of chapters){
 if(c.id!==entry.id||chapterIds.has(c.id)||!Array.isArray(c.packs)||!c.packs.length)throw Error('Invalid chapter registry entry: '+entry.id);chapterIds.add(c.id);
 const packIds=new Set();
 for(const p of c.packs){if(!p.id||packIds.has(p.id)||!p.questions?.length)throw Error('Invalid pack '+p.id);packIds.add(p.id);packs++;
   for(const q of p.questions){
    if(!q.id.startsWith(c.id+'/')||ids.has(q.id)||!['single','multiple','not-fit'].includes(q.type)||!q.prompt||!q.explanation?.clue||!q.explanation?.rule)throw Error('Invalid question '+q.id);
    if(!Array.isArray(q.options)||q.options.length<2||new Set(q.options).size!==q.options.length||!q.options.includes(q.answer))throw Error('Invalid choices '+q.id);
    for(const v of q.vocabulary||[])if(!terms.has(normalize(v)))throw Error('Undefined vocabulary '+v+' in '+q.id);
    for(const r of q.explanation.rejects||[])if(q.type!=='multiple'&&(!q.options.includes(r.option)||(q.type!=='not-fit'&&r.option===q.answer)))throw Error('Invalid elimination '+q.id);
    if(p.passage&&(!q.slot||!p.passage.includes('{{'+q.slot+'}}')||!q.completion))throw Error('Missing cloze context '+q.id);
    if(q.type==='multiple'&&!q.candidates?.length)throw Error('Missing candidates '+q.id);
    ids.add(q.id);count++;
   }
   if(p.passage){const slots=[...p.passage.matchAll(/\{\{(\d+)\}\}/g)].map(m=>Number(m[1]));if(slots.length!==p.questions.length||new Set(slots).size!==slots.length)throw Error('Invalid passage slots '+p.id);}
 }
}
for(const v of vocab)for(const id of v.questionIds||[])if(!ids.has(id))throw Error('Dangling vocabulary link '+id);
console.log(`Data valid: ${chapters.length} chapters, ${packs} sets, ${count} questions, ${vocab.length} vocabulary entries.`);
