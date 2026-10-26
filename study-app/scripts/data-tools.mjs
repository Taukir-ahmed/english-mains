import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const dataDir=path.join(project,'data');
export const read=name=>JSON.parse(fs.readFileSync(path.join(dataDir,name),'utf8'));
export const write=(name,value)=>fs.writeFileSync(path.join(dataDir,name),JSON.stringify(value,null,2)+'\n');
export const normalize=term=>term.trim().toLowerCase().replace(/\s+/g,' ');
export const termId=term=>'v-'+normalize(term).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function loadChapters(){return read('registry.json').map(r=>({entry:r,chapter:read('chapters/'+r.file)}));}
export function completedPassage(pack){return pack.passage?.replace(/\{\{(\d+)\}\}/g,(_,n)=>pack.questions.find(q=>q.slot===Number(n))?.completion??'___')||'';}
export const hasTerm=(text,term)=>new RegExp('(?<![a-z])'+term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![a-z])','i').test(text);
