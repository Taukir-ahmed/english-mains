import React,{useState,useEffect,useMemo} from 'react';
import {chapters,questionMap} from './content.js';
import {STORAGE_KEY,emptyProgress,loadProgress,validateProgress,convertLegacy,mergeProgress,latestAttempts,firstAttempts,summary,recordAnswer,retryQuestions} from './progress.js';
import QuestionCard from './components/QuestionCard.jsx';
import Passage from './components/Passage.jsx';
import Vocabulary,{DailyReading} from './components/Vocabulary.jsx';

const defaultChapter=window.__DEFAULT_CHAPTER__||chapters[0].id;
function safeLoad(){try{return loadProgress(localStorage,questionMap);}catch{return {progress:emptyProgress(),notice:'Browser storage is unavailable. Export progress before closing.'};}}
const initial=safeLoad();

export default function App(){
 const [progress,setProgress]=useState(initial.progress),[notice,setNotice]=useState(initial.notice),[storageError,setStorageError]=useState(false);
 const [view,setView]=useState(window.__DEFAULT_VIEW__||'practice'),[chapterId,setChapterId]=useState(defaultChapter),[filter,setFilter]=useState('all'),[level,setLevel]=useState('all'),[backup,setBackup]=useState('');
 const chapter=chapters.find(c=>c.id===chapterId)||chapters[0];
 const latest=useMemo(()=>latestAttempts(progress),[progress]),first=useMemo(()=>firstAttempts(progress),[progress]);
 const visible=useMemo(()=>new Map([...latest].filter(([id])=>!progress.hidden.includes(id))),[latest,progress.hidden]);
 const [packId,setPackId]=useState(progress.lastPack[defaultChapter]||chapters.find(c=>c.id===defaultChapter)?.packs[0].id);
 const available=chapter.packs.filter(p=>(level==='all'||p.level===level)&&(filter==='all'||filter==='mistakes'&&p.questions.some(q=>latest.has(q.id)&&latest.get(q.id).answer!==q.answer)||filter==='unanswered'&&p.questions.some(q=>!latest.has(q.id))));
 const pack=available.find(p=>p.id===packId)||available[0];
 useEffect(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(progress));}catch{setStorageError(true);}},[progress]);
 function changeChapter(id){setChapterId(id);setLevel('all');setFilter('all');setPackId(progress.lastPack[id]||chapters.find(c=>c.id===id).packs[0].id);setView('practice');}
 function choosePack(id){setPackId(id);setProgress(p=>({...p,lastPack:{...p.lastPack,[chapter.id]:id}}));}
 function answer(id,value){setProgress(p=>recordAnswer(p,id,value,questionMap));}
 function retry(ids){setProgress(p=>retryQuestions(p,ids));}
 function statsText(items){const s=summary(items,questionMap);return `${s.answered} answered · ${s.correct} correct${s.accuracy===null?'':` · ${s.accuracy}% accuracy`}`;}
 function exportBackup(){const json=JSON.stringify(progress,null,2);setBackup(json);const url=URL.createObjectURL(new Blob([json],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='english-practice-progress.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
 async function importBackup(event){const file=event.target.files[0];if(!file)return;try{if(file.size>15000000)throw Error('Backup is too large.');const raw=JSON.parse(await file.text());const incoming=raw.kind==='mains-english-progress'?validateProgress(raw,questionMap):convertLegacy(raw,questionMap);setProgress(p=>mergeProgress(p,incoming));setNotice(`Merged ${incoming.attempts.length} answers from the backup. Existing answers were kept; duplicate records were ignored.`);}catch(error){setNotice('Import failed: '+error.message);}event.target.value='';}
 const chapterQuestionIds=new Set(chapter.packs.flatMap(p=>p.questions.map(q=>q.id)));
 const chapterLatest=[...latest.values()].filter(a=>chapterQuestionIds.has(a.questionId));
 return <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
  <a href="#main" className="skip-to-content">Skip to practice</a>
  <header className="border-b border pb-4 mb-5"><h1>English Practice</h1><nav aria-label="Main" className="mt-3 flex flex-wrap gap-y-2">{[['practice','Practice'],['vocabulary','Vocabulary'],['reading','Daily reading'],['progress','Progress & backup']].map(([id,label])=><button className="nav-button" key={id} aria-current={view===id?'page':undefined} onClick={()=>setView(id)}>{label}</button>)}</nav></header>
  {notice&&<div className="notice" role="status">{notice} <button className="small" onClick={()=>setNotice('')}>Dismiss</button></div>}
  {storageError&&<div className="notice" role="alert">Progress could not be saved. Use Progress & backup to export it before closing.</div>}
  <main id="main">
   {view==='practice'&&<>
    <div className="flex flex-wrap gap-2 mb-4" aria-label="Chapters">{chapters.map(c=><button key={c.id} className={c.id===chapter.id?'primary':''} onClick={()=>changeChapter(c.id)} aria-pressed={c.id===chapter.id}>{c.title}</button>)}</div>
    <h2>{chapter.title}</h2><p className="small muted chapter-description">{chapter.description}</p>
    <p className="small">{statsText(chapterLatest)}. Select an option to see the answer immediately.</p>
    <div className="flex flex-wrap gap-3 items-end my-4">
     <label className="small">Show <select aria-label="Question filter" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All sets</option><option value="unanswered">Sets with unanswered questions</option><option value="mistakes">Sets with mistakes</option></select></label>
     <label className="small">Level <select aria-label="Level" value={level} onChange={e=>setLevel(e.target.value)}><option value="all">All levels</option>{[...new Set(chapter.packs.map(p=>p.level))].map(l=><option key={l}>{l}</option>)}</select></label>
     <label className="small grow">Set <select aria-label="Set" className="w-full" value={pack?.id||''} onChange={e=>choosePack(e.target.value)}>{available.length?available.map(p=><option key={p.id} value={p.id}>{p.id} · {p.title}</option>):<option value="">No matching sets</option>}</select></label>
    </div>
    {chapter.reference&&<details className="small mb-4"><summary>Connector patterns and common mistakes</summary>{chapter.reference.map(c=><div key={c.expression} className="reference-row"><strong>{c.expression}</strong><p>{c.meaning}</p><p>{c.pattern}</p><p className="muted">{c.trap} · {c.hinglish}</p></div>)}</details>}
    {pack?<><h3 className="my-4">{pack.id} · {pack.title}</h3><div className={`practice-layout ${pack.passage?'has-passage':''}`}>{pack.passage&&<Passage pack={pack} visibleAttempts={visible}/>}<section aria-label="Questions">{pack.questions.map((q,i)=><QuestionCard key={q.id} index={i} question={q} attempt={visible.get(q.id)} onAnswer={answer} onRetry={retry}/>)}</section></div><div className="flex flex-wrap gap-2 mt-5 no-print"><button onClick={()=>retry(pack.questions.map(q=>q.id))}>Retry this set</button><button onClick={()=>{const i=chapter.packs.findIndex(p=>p.id===pack.id);choosePack(chapter.packs[(i+1)%chapter.packs.length].id);setLevel('all');setFilter('all');window.scrollTo(0,0);}}>Next set</button></div></>:<p>No sets match this filter.</p>}
   </>}
   {view==='vocabulary'&&<Vocabulary/>}
   {view==='reading'&&<DailyReading/>}
   {view==='progress'&&<section>
    <h2>Progress & backup</h2><p>Latest answers: {statsText(latest.values())}.</p><p>First choices: {statsText(first.values())}.</p><p className="small muted">Retries are learning attempts. First-choice results stay separate. Older unanswered or skipped blanks are not counted as answered questions.</p>
    <div className="flex flex-wrap gap-3 my-4"><button onClick={exportBackup}>Export progress</button><label className="small">Import current or older JSON backup <input aria-label="Import progress" className="block mt-1 max-w-full" type="file" accept="application/json,.json" onChange={importBackup}/></label></div>
    {backup&&<details open><summary>Backup text — use this if the download is blocked</summary><p className="small">Copy this text into a file ending in .json.</p><textarea aria-label="Progress backup JSON" rows={6} readOnly value={backup} onFocus={e=>e.target.select()}/></details>}
    <details className="my-5"><summary>How older progress is handled</summary><p className="small">The app checks the older cloze and connector storage keys in the current browser. Some browsers isolate local HTML files, and a localhost app has a different origin. If older answers are missing, open the updated file at its original filename and export progress there, or import your previous JSON backup. No old browser records are deleted.</p></details>
    <div className="overflow-x-auto"><table className="progress-table"><thead><tr><th>Question</th><th>Latest answer</th><th>Result</th><th>Attempts</th></tr></thead><tbody>{[...latest.values()].map(a=><tr key={a.questionId}><td>{a.questionId}</td><td>{a.answer}</td><td>{questionMap.get(a.questionId).answer===a.answer?'Correct':'Needs review'}</td><td>{progress.attempts.filter(p=>p.questionId===a.questionId).length}</td></tr>)}</tbody></table></div>
   </section>}
  </main>
  <footer className="small muted border-t border mt-8 pt-4">Original practice material. Level labels are approximate. Your progress is saved in this browser; keep a JSON backup when switching files or browsers.</footer>
 </div>;
}
