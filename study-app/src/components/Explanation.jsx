import React from 'react';

export default function Explanation({question:q}){
 const e=q.explanation;
 return <div className="feedback" data-testid={`explanation-${q.id}`}>
  <p><strong>{q.type==='not-fit'?'Required meaning for a suitable completion':'Relationship / required meaning'}:</strong> {e.relationship}</p>
  <p><strong>Clue:</strong> {e.clue}</p>
  <p><strong>Grammar / meaning check:</strong> {e.rule}</p>
  {e.summary&&<p>{e.summary}</p>}
  {q.candidates?.length>0&&<details><summary>Check every candidate</summary><ul>{q.candidates.map(c=><li key={c.label}><strong>{c.label}. {c.text} — {c.valid?'fits / valid':'does not fit / invalid'}.</strong> {c.reason}</li>)}</ul></details>}
  {!q.candidates?.length&&e.rejects?.length>0&&<details><summary>{q.type==='not-fit'?'Why this word does not fit':'Why the other choices fail'}</summary><ul>{e.rejects.map(r=><li key={r.option}><strong>{String.fromCharCode(65+q.options.indexOf(r.option))}. {r.option}</strong> — {r.reason}</li>)}</ul></details>}
  {e.model&&<p><strong>{e.modelLabel||'Correct sentence'}:</strong> {e.model}</p>}
 </div>;
}
