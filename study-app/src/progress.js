export const STORAGE_KEY='mains-english-progress-v1';
export const emptyProgress=()=>({kind:'mains-english-progress',version:1,attempts:[],hidden:[],lastPack:{}});
export function validateProgress(value,questions){
 if(!value||value.kind!=='mains-english-progress'||value.version!==1||!Array.isArray(value.attempts)||value.attempts.length>100000||!Array.isArray(value.hidden)||!value.lastPack||typeof value.lastPack!=='object')throw Error('Use a compatible English Practice backup.');
 const seen=new Set();
 for(const a of value.attempts){const q=questions.get(a.questionId);if(!q||!a.id||seen.has(a.id)||!Number.isFinite(a.at)||!q.options.includes(a.answer))throw Error('Invalid saved answer.');seen.add(a.id);}
 if(value.hidden.some(id=>!questions.has(id)))throw Error('Invalid hidden question.');
 return value;
}
export function latestAttempts(progress){const map=new Map();for(const a of progress.attempts){if(!map.has(a.questionId)||map.get(a.questionId).at<=a.at)map.set(a.questionId,a);}return map;}
export function firstAttempts(progress){const map=new Map();for(const a of progress.attempts){if(!map.has(a.questionId)||map.get(a.questionId).at>a.at)map.set(a.questionId,a);}return map;}
export function summary(attempts,questions){const arr=[...attempts].filter(a=>questions.has(a.questionId));const correct=arr.filter(a=>questions.get(a.questionId).answer===a.answer).length;return {answered:arr.length,correct,wrong:arr.length-correct,accuracy:arr.length?Math.round(correct/arr.length*100):null};}
export function recordAnswer(progress,qid,answer,questions,at=Date.now(),id=globalThis.crypto?.randomUUID?.()||String(Date.now())+Math.random()){
 const q=questions.get(qid);if(!q?.options.includes(answer))throw Error('Unknown answer.');
 if(latestAttempts(progress).has(qid)&&!progress.hidden.includes(qid))return progress;
 return {...progress,hidden:progress.hidden.filter(x=>x!==qid),attempts:[...progress.attempts,{id,questionId:qid,answer,at,source:'practice'}]};
}
export function retryQuestions(progress,ids){return {...progress,hidden:[...new Set([...progress.hidden,...ids])]};}
export function convertLegacy(value,questions){
 const chapter=value?.kind==='cloze-lab-progress'?'cloze':value?.kind==='connector-progress'?'connectors':null;
 if(!chapter||value.schema!==1||!Array.isArray(value.history))throw Error('Unrecognised backup format.');
 const out=emptyProgress();
 function add(row,index,draft=false){
   const answers=row.answers||[];
   for(let i=0;i<answers.length;i++){
     const selected=draft?answers[i]:answers[i]?.selected;if(selected==null)continue;
     const questionId=`${chapter}/${row.setId}-Q${i+1}`,q=questions.get(questionId);
     if(!q||!q.options.includes(selected))throw Error('An older answer does not match the current question data.');
     const at=Number(row.at||row.start||Date.now());
     out.attempts.push({id:`legacy:${chapter}:${row.setId}:${at}:${index}:${i}`,questionId,answer:selected,at,source:'legacy'});
   }
 }
 value.history.forEach((h,i)=>add(h,i));
 if(value.draft){add(value.draft,'draft',true);out.lastPack[chapter]=value.draft.setId;}
 return validateProgress(out,questions);
}
export function mergeProgress(current,incoming){const byId=new Map([...current.attempts,...incoming.attempts].map(a=>[a.id,a]));return {...current,attempts:[...byId.values()].sort((a,b)=>a.at-b.at),lastPack:{...incoming.lastPack,...current.lastPack}};}
export function loadProgress(storage,questions){
 let progress=emptyProgress(),notice='';
 try{const raw=storage.getItem(STORAGE_KEY);if(raw)progress=validateProgress(JSON.parse(raw),questions);
   let imported=0;
   for(const key of ['cloze-lab-clerk-v1','connectors-lab-clerk-v1']){const old=storage.getItem(key);if(old){const before=progress.attempts.length;progress=mergeProgress(progress,convertLegacy(JSON.parse(old),questions));imported+=progress.attempts.length-before;}}
   if(imported)notice=`Imported ${imported} older answers. Your original browser records were kept.`;
 }catch(error){notice='Some saved progress could not be read. You can still practise and import a backup.';}
 return {progress,notice};
}
