import React from 'react';
import Explanation from './Explanation.jsx';

export default function QuestionCard({question:q,attempt,onAnswer,onRetry,index}){
 const answered=!!attempt,correct=attempt?.answer===q.answer;
 return <article className="question" id={q.id} data-testid={`question-${q.id}`}>
  <h3>Question {index+1}{q.slot?` · Blank ${q.slot}`:''}</h3>
  <p className="question-prompt">{q.prompt}</p>
  <p className="small muted">{q.instructions}</p>
  {q.candidates?.map(c=><p key={c.label}><strong>{c.label}.</strong> {c.text}</p>)}
  {answered&&<div className={`answer-status ${correct?'':'wrong'}`} role="status" aria-live="polite"><strong>{correct?'Correct.':'Incorrect.'}</strong> {q.type==='not-fit'?'Word that does NOT fit':'Correct answer'}: <strong>{q.answer}</strong></div>}
  <div role="group" aria-label={`Choices for question ${index+1}`}>
   {q.options.map((o,i)=><button key={o} disabled={answered} onClick={()=>onAnswer(q.id,o)} className={`option ${answered&&o===q.answer?'correct':''} ${answered&&o===attempt.answer&&!correct?'incorrect':''}`} aria-label={`${String.fromCharCode(65+i)}. ${o}`}>
    <span className="muted">{String.fromCharCode(65+i)}.</span> {o}{answered&&o===attempt.answer?' (your choice)':''}{answered&&o===q.answer?' (correct)':''}
   </button>)}
  </div>
  {answered&&<><Explanation question={q}/><button className="small" onClick={()=>onRetry([q.id])}>Try this question again</button><p className="small muted">A retry is saved separately. Your first choice stays in your history.</p></>}
 </article>;
}
