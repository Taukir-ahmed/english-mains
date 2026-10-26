import fs from 'node:fs';
import path from 'node:path';
import {project} from './data-tools.mjs';
const root=path.dirname(project),dist=path.join(project,'dist');
const css=fs.readFileSync(path.join(dist,'practice.css'),'utf8');
const js=fs.readFileSync(path.join(dist,'practice.js'),'utf8').replace(/<\/script/gi,'<\\/script');
function page(chapter='cloze',view='practice'){return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>English Practice</title><style>${css}</style></head><body><div id="root"></div><script>window.__DEFAULT_CHAPTER__=${JSON.stringify(chapter)};window.__DEFAULT_VIEW__=${JSON.stringify(view)};</script><script>${js}</script></body></html>`;}
fs.writeFileSync(path.join(dist,'index.html'),page());
for(const [name,chapter,view] of [['English_Practice.html','cloze','practice'],['Cloze_Mains_Trainer.html','cloze','practice'],['Connectors_Mains_Trainer.html','connectors','practice'],['dense_bank_exam_vocabulary_improved.html','cloze','vocabulary']])fs.writeFileSync(path.join(root,name),page(chapter,view));
console.log('Exported one shared app to English_Practice.html and the three existing HTML entry files.');
