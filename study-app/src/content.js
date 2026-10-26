import registry from '../data/registry.json';
import vocabulary from '../data/vocabulary.json';
import reading from '../data/reading.json';
const files=import.meta.glob('../data/chapters/*.json',{eager:true,import:'default'});
export const chapters=registry.map(r=>files['../data/chapters/'+r.file]);
export const questionMap=new Map(chapters.flatMap(c=>c.packs.flatMap(p=>p.questions.map(q=>[q.id,{...q,chapterId:c.id,packId:p.id}]))));
export const vocabMap=new Map(vocabulary.map(v=>[v.term.toLowerCase(),v]));
for(const entry of vocabulary)for(const form of entry.forms||[])if(!vocabMap.has(form.toLowerCase()))vocabMap.set(form.toLowerCase(),entry);
export { vocabulary,reading };
