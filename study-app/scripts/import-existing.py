"""One-time migration of existing authored content. Does not create new questions."""
from pathlib import Path
import json,re,html,shutil
root=Path(__file__).resolve().parents[2]
target=root/'study-app/data'
(target/'chapters').mkdir(parents=True,exist_ok=True)
backup=root/'study-app/backups/legacy'
backup.mkdir(parents=True,exist_ok=True)
for name in ['Cloze_Mains_Trainer.html','Connectors_Mains_Trainer.html','dense_bank_exam_vocabulary_improved.html']:
    if not (backup/name).exists():shutil.copy2(root/name,backup/name)
cloze=json.loads((root/'cloze_trainer/bank.json').read_text(encoding='utf-8'))
connectors=json.loads((root/'connectors_trainer/bank.json').read_text(encoding='utf-8'))
terms=[g['word'] for g in cloze['glossary']]
def matches(text):return [w for w in terms if re.search(r'(?<!\w)'+re.escape(w)+r'(?!\w)',text,re.I)]
def dump(name,data):
    p=target/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
packs=[]
labels={'positive':'Beneficial / corrective','negative':'Harmful / worsening','neutral':'Neutral / grammar / procedure','qualified':'Contrast / uncertainty / condition'}
for s in cloze['sets']:
    p={k:s[k] for k in ['id','title','level','passage','sense']};p['questions']=[]
    for i,q in enumerate(s['questions']):
        d=q['direction']
        kind='multiple' if s['kind']=='multiple' else 'not-fit' if s['kind']=='unsuitable' else 'single'
        n={'id':'cloze/'+q['id'],'legacyId':q['id'],'slot':i+1,'type':kind,'prompt':f'Blank {i+1}','instructions':s['directions'],'options':q['options'],'answer':q['answer'],'completion':q['completion'],'explanation':{'relationship':labels[d['category']],'clue':d['clue'],'rule':d['label'],'summary':q['explanation'],'rejects':d['rejects']},'vocabulary':matches(' '.join([s['completed'],*q.get('words',q['options'])]))}
        if 'words' in q:n['candidates']=[{'label':['I','II','III','IV'][j],'text':w,'valid':q['valid'][j],'reason':next((r['reason'] for r in d['rejects'] if r['option']==w),'Fits the required meaning and construction.')} for j,w in enumerate(q['words'])]
        p['questions'].append(n)
    packs.append(p)
dump('chapters/cloze.json',{'id':'cloze','title':'Cloze tests','description':'200 existing questions. M01–M10 are introductory practice; the level labels are approximate.','packs':packs,'vocabularyCandidates':[]})
packs=[]
for s in connectors['sets']:
    p={k:s[k] for k in ['id','title','level']};p['questions']=[]
    for q in s['questions']:
        n={'id':'connectors/'+q['id'],'legacyId':q['id'],'type':'multiple' if q['kind']=='multiple' else 'single','prompt':q['prompt'],'instructions':q['directions'],'options':q['options'],'answer':q['answer'],'explanation':{'relationship':connectors['relations'][q['relation']],'clue':q['clue'],'rule':q['rule'],'model':q['completed'],'rejects':[{'option':o,'reason':q['optionReasons'][o]} for o in q['options'] if o!=q['answer']]},'vocabulary':matches(' '.join([q['prompt'],q['completed'],*q['options']]))}
        if q.get('candidates'):n['candidates']=[{'label':['I','II','III'][j],'text':c['sentence'],'valid':c['valid'],'reason':c['why']} for j,c in enumerate(q['candidates'])]
        p['questions'].append(n)
    packs.append(p)
dump('chapters/connectors.json',{'id':'connectors','title':'Connectors','description':'120 existing questions, from core distinctions to sentence joining and rewrite combinations.','packs':packs,'reference':connectors['cards'],'vocabularyCandidates':[]})
dump('registry.json',[{'id':'cloze','file':'cloze.json'},{'id':'connectors','file':'connectors.json'}])
dump('vocabulary.json',[{'id':'v-'+re.sub(r'[^a-z0-9]+','-',g['word'].lower()).strip('-'),'term':g['word'],'meaning':g['meaning'],'collocations':[g['collocation']] if g['collocation'] else [],'examples':[],'chapterIds':[],'questionIds':[]} for g in cloze['glossary']])
raw=(root/'dense_bank_exam_vocabulary_improved.html').read_text(encoding='utf-8')
translations=json.loads(re.search(r'const hinglishTranslations = (\[.*?\]);',raw,re.S)[1])
reading=[]
for i,body in enumerate(re.findall(r'<li class="sentence-item">(.*?)</li>',raw,re.S)):
    body=re.sub(r'<span class="tooltip">.*?</span>','',body,flags=re.S)
    sentence=html.unescape(re.sub(r'<[^>]+>','',body))
    reading.append({'id':f'reading-{i+1}','text':sentence,'translation':translations[i] if i<len(translations) else ''})
assert len(reading)==72
dump('reading.json',reading)
print('Reused 320 questions, 64 packs, 250 vocabulary entries and 72 reading sentences.')
