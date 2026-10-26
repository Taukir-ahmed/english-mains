import { read,write,loadChapters,normalize,termId,hasTerm,completedPassage } from './data-tools.mjs';
const chapters=loadChapters(),entries=read('vocabulary.json'),index=new Map(entries.map(v=>[normalize(v.term),v]));
let added=0;
let nextReadingOrder=Math.max(0,...entries.map(v=>v.readingOrder||0))+1;
for(const {chapter} of chapters)for(const c of chapter.vocabularyCandidates||[]){
  if(!c.term||!c.meaning)throw Error(`${chapter.id}: vocabulary candidates need a term and reviewed meaning.`);
  const key=normalize(c.term),old=index.get(key);
  if(old){if(old.meaning.trim()!==c.meaning.trim())throw Error(`Conflicting meaning for ${c.term}; review the shared entry rather than silently replacing it.`);}
  else{const v={id:termId(c.term),term:key,meaning:c.meaning,collocations:c.collocations||[],forms:c.forms||[],examples:[],chapterIds:[],questionIds:[]};entries.push(v);index.set(key,v);added++;}
  const entry=index.get(key);
  if(c.important!==false){
    entry.important=true;
    entry.readingExample=c.readingExample||entry.readingExample;
    if(!entry.readingExample)throw Error(`${c.term}: an important word needs a reviewed readingExample so it can appear in Daily reading.`);
    entry.readingOrder??=nextReadingOrder++;
  }
}
for(const v of entries){v.chapterIds=[];v.questionIds=[];v.examples=v.readingExample?[v.readingExample]:[];}
const reading=read('reading.json');
for(const v of entries)for(const r of reading)if(hasTerm(r.text,v.term)&&v.examples.length<3)v.examples.push(r.text);
for(const {chapter,entry} of chapters){
  for(const pack of chapter.packs){const context=completedPassage(pack);
    for(const q of pack.questions){
      const text=[q.prompt,context,q.explanation.model||'',...q.options].join(' ');
      const candidates=(chapter.vocabularyCandidates||[]).filter(c=>[c.term,...(c.forms||[])].some(f=>hasTerm(text,f)));
      q.vocabulary=[...new Set([...(q.vocabulary||[]),...candidates.map(c=>normalize(c.term))])];
      for(const term of q.vocabulary){
        const v=index.get(normalize(term));if(!v)throw Error(`${q.id}: missing shared definition for ${term}. Add a reviewed vocabulary candidate.`);
        if(!v.chapterIds.includes(chapter.id))v.chapterIds.push(chapter.id);
        if(!v.questionIds.includes(q.id))v.questionIds.push(q.id);
        const model=q.explanation.model||context;
        const sentence=model.split(/(?<=[.!?])\s+/).find(s=>[v.term,...(v.forms||[])].some(f=>hasTerm(s,f)));
        if(sentence&&!v.examples.includes(sentence)&&v.examples.length<3)v.examples.push(sentence);
      }
    }
  }
  write('chapters/'+entry.file,chapter);
}
write('vocabulary.json',entries.sort((a,b)=>a.term.localeCompare(b.term)));
console.log(`Vocabulary synced: ${entries.length} entries (${added} new).`);
