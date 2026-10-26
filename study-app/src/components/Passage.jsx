import React from 'react';

export default function Passage({pack,visibleAttempts}){
 const parts=pack.passage.split(/(\{\{\d+\}\})/g);
 return <aside className="passage-panel"><h2>Passage</h2><p className="passage">{parts.map((part,i)=>{const match=part.match(/^\{\{(\d+)\}\}$/);if(!match)return <React.Fragment key={i}>{part}</React.Fragment>;const slot=Number(match[1]),q=pack.questions.find(q=>q.slot===slot);return <a className="blank" key={i} href={'#'+q.id}>{visibleAttempts.has(q.id)?q.completion:`[${slot}] ______`}</a>;})}</p><p className="small muted">Only answered blanks are completed. The other answers stay hidden.</p>{pack.sense&&<details><summary>Hinglish sense</summary><p className="small">{pack.sense}</p></details>}</aside>;
}
