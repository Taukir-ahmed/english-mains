// One-time append-only batch. Maintain reviewed canonical JSON after creation.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {read,write,loadChapters,hasTerm} from './data-tools.mjs';
const batch='moderate-hard-2',level='Moderate–Hard',ids=['connectors','word-usage','sentence-order'];
const chapters=Object.fromEntries(ids.map(id=>[id,read('chapters/'+id+'.json')]));
if(Object.values(chapters).some(c=>c.packs.some(p=>p.batch===batch)))throw Error('Batch already exists; edit canonical JSON.');
const old=loadChapters().flatMap(x=>x.chapter.packs.flatMap(p=>p.questions)).map(q=>({id:q.id,type:q.type,prompt:q.prompt,options:q.options,answer:q.answer,explanation:q.explanation}));
fs.writeFileSync(new URL('../tests/fixtures/pre-moderate-hard-2-content.json',import.meta.url),JSON.stringify({questionIds:old.map(q=>q.id),questionCount:old.length,sha256:crypto.createHash('sha256').update(JSON.stringify(old)).digest('hex')},null,2)+'\n');
const source={kind:'original-format-practice',formatReferences:[
 'IBPS-Clerk-Mains-Memory-Based-29-November-2025-Shift-1.pdf: Q113–115, connectors',
 'IBPS-Clerk-Mains-Question-Paper-Held-on-13.10.2024.pdf: Q57–60, fragments; Q82–87 and Q90, contextual replacement and swaps',
 'SBI-Clerk-Mains-Memory-Based-2023-2024.pdf: Q82–86, usage and replacement',
 'Mains Checklist 1 and 12, word swaps; checklist 16 and 18, phrase rearrangement'
],note:'New original practice informed by local formats. Moderate–Hard is a reviewed reasoning target, not independently calibrated exam equivalence.'};
const banks=Object.fromEntries(ids.map(id=>[id,[]]));let serial=0;
function single(id,prompt,answer,wrong,clue,rule,model,relationship,skill,review,extra={}){
 const options=wrong.map(r=>r[0]);options.splice(serial++%5,0,answer);
 const q={type:'single',prompt,instructions:'Choose the one option that preserves all stated facts, their scope and the intended relationship.',options,answer,source,batch,skill,vocabulary:[],explanation:{clue,rule,model,relationship,rejects:wrong.map(([option,reason])=>({option,reason}))},difficultyReview:{target:level,nearestAlternative:review[0],whyNot:review[1],reasoningSteps:review.slice(2)},...extra};banks[id].push(q);return q;
}
function combo(id,prompt,rows,clue,rule,model,skill,review,direction='correct'){
 const permutations=[[0,2,1],[2,0,1],[1,2,0]],perm=permutations[serial%3],labels=['I','II','III'];rows=perm.map(i=>rows[i]);
 const candidates=rows.map(([text,valid,reason],i)=>({label:labels[i],text,valid,reason}));
 const required=candidates.filter(c=>direction==='incorrect'?!c.valid:c.valid).map(c=>c.label),name=xs=>xs.length?xs.join(' and ')+' only':'None',answer=name(required),pool=[];
 for(let mask=0;mask<8;mask++)pool.push(name(labels.filter((_,i)=>mask&(1<<i))));
 const options=pool.filter(o=>o!==answer).slice(0,4);options.splice(serial++%5,0,answer);
 const q={type:'multiple',prompt,instructions:`Evaluate all three candidates and choose ALL and ONLY the ${direction==='incorrect'?'incorrect':'valid'} ones. Preserve the degree and direction of every claim.`,options,answer,candidates,selectionDirection:direction,source,batch,skill,vocabulary:[],explanation:{relationship:direction==='incorrect'?'Select incorrect candidates; valid means grammatically and contextually correct':'Every selected candidate must preserve all stated constraints',clue,rule,model},difficultyReview:{target:level,nearestAlternative:review[0],whyNot:review[1],reasoningSteps:review.slice(2)}};banks[id].push(q);return q;
}

const conn='connectors';
single(conn,'A complete application is necessary for review. Some complete applications are still refused because they fall outside the panel’s jurisdiction. Choose the rewrite preserving both the prerequisite and the possible refusal.',
 'The panel will review an application only if it is complete, but completeness alone does not guarantee review.',[
 ['The panel will review an application if it is complete, even if it falls outside its jurisdiction.','If makes completeness sufficient here, and even if removes the explicitly retained jurisdiction barrier.'],
 ['Only if the panel reviews an application will the application become complete, although some reviews may be refused.','This reverses the implication and makes completeness an outcome of review rather than a prerequisite for it.'],
 ['Although some complete applications fall outside its jurisdiction, the panel will review every complete application.','Every promises review of the very complete applications the original says may be refused.'],
 ['The panel will not review an application unless it is complete, so every complete application must be reviewed.','The unless-clause preserves necessity, but so then adds the unsupported converse guarantee.']
 ],'Check the second clause as carefully as the first. Completeness is required, but jurisdiction can still block review.','Only if and not unless can preserve a necessary condition; neither licences the converse.',
 'The panel will review an application only if it is complete, but completeness alone does not guarantee review.',
 'Necessary condition versus sufficient trigger','complete connector rewrite',
 ['The panel will not review an application unless it is complete, so every complete application must be reviewed.','It gets the first link right and then incorrectly turns necessity into a guaranteed outcome.','Translate the prerequisite.','Test the second clause with a complete application outside the jurisdiction.']);
single(conn,'The signature was not verified before the vote. That absence prevented approval at the vote. A later verification would remove that one obstacle, but other approval conditions could remain. Choose the complete rewrite.',
 'Because the signature had not been verified, approval could not be granted at the vote; later verification would remove that barrier without guaranteeing approval.',[
 ['Unless the signature was verified later, approval had already been granted at the vote.','It changes a prevented approval into an approval already granted and reverses the order of the events.'],
 ['Although the signature had not been verified, approval could be granted at the vote, provided that verification occurred later.','This makes later verification sufficient to permit the earlier approval that was expressly prevented.'],
 ['Approval was deferred because the signature was unverified; once the signature was verified, approval was necessarily granted.','The causal first clause fits, but necessarily granted invents a guarantee after the missing condition is repaired.'],
 ['Verification was withheld because approval could not be granted at the vote; therefore later approval was impossible.','It reverses the causal direction and then converts a temporary obstacle into permanent impossibility.']
 ],'Unverified signature → blocked approval at the vote. Removing that obstacle later does not remove every possible obstacle.','Preserve cause, time and the limit on what satisfying one condition achieves.',
 'Because the signature had not been verified, approval could not be granted at the vote; later verification would remove that barrier without guaranteeing approval.',
 'Past cause, later condition, unresolved outcome','complete connector rewrite',
 ['Approval was deferred because the signature was unverified; once the signature was verified, approval was necessarily granted.','The first clause is right; the second substitutes a promised decision for removal of one barrier.','Locate the vote and later verification separately.','Check whether the last connector adds certainty.']);
single(conn,'The trial reduced processing time. It did not measure errors. The report therefore rejected a claim of improved accuracy. Preserve the observed benefit and the specific evidence limit.',
 'Although the trial reduced processing time, it did not measure errors, so the report rejected the claim that accuracy had improved.',[
 ['Because the trial reduced processing time, it did not measure errors; nevertheless, the report proved that accuracy had not improved.','It invents a cause for the missing measurement and changes an unsupported improvement claim into proof of no improvement.'],
 ['Even if the trial were to reduce processing time, the report would reject improved accuracy because errors had certainly increased.','It weakens an observed reduction into a hypothetical one and invents an increase in errors.'],
 ['The trial reduced processing time, so accuracy improved, although the report did not measure errors.','So makes speed evidence of accuracy, the inference the original specifically rejects.'],
 ['Since the trial measured no errors, the report concluded that no errors occurred, despite the reduction in processing time.','No errors measured is a missing assessment, not an observation that there were zero errors.']
 ],'The reduction is a fact; the accuracy improvement is unestablished, not disproved. No error measurement means neither zero errors nor more errors.','A correct rewrite must preserve both the positive observation and the limited conclusion.',
 'Although the trial reduced processing time, it did not measure errors, so the report rejected the claim that accuracy had improved.',
 'Concession followed by an evidential consequence','complete connector rewrite',
 ['Because the trial reduced processing time, it did not measure errors; nevertheless, the report proved that accuracy had not improved.','It retains the topic but reverses the report’s limited conclusion into a stronger disproof.','Keep the speed reduction factual.','Distinguish missing evidence from evidence of no improvement.']);
single(conn,'The bank acknowledged the complaint despite missing documents. It did so to preserve the applicant’s queue position, not to accept the complaint’s merits. Select the rewrite preserving both the concession and the purpose.',
 'Although documents were missing, the bank acknowledged the complaint so that the applicant would retain the queue position, without thereby accepting the merits.',[
 ['Because documents were missing, the bank accepted the complaint’s merits so that the applicant would retain the queue position.','It makes missing documents the cause and acknowledgement an acceptance of merits.'],
 ['The bank acknowledged the complaint only if the missing documents proved its merits, thereby preserving the queue position.','It adds a proof requirement and makes acknowledgement conditional on proof, whereas acknowledgement occurred despite the gap.'],
 ['The bank preserved the queue position because it had accepted the merits, although some documents were missing.','It invents acceptance of the merits as the cause for preserving the place.'],
 ['Even though documents were missing, the bank acknowledged the complaint because the applicant had retained the queue position.','The concession fits, but because reverses the intended prospective purpose into a prior reason.']
 ],'The acknowledgement has a procedural purpose; it is not a finding on the complaint’s substance.','Keep acknowledgement, queue protection and acceptance of merits separate; purpose is not an already achieved cause.',
 'Although documents were missing, the bank acknowledged the complaint so that the applicant would retain the queue position, without thereby accepting the merits.',
 'Concession, purpose and a limit on implication','complete connector rewrite',
 ['Even though documents were missing, the bank acknowledged the complaint because the applicant had retained the queue position.','The first connector fits, but the second turns the intended result into a prior cause.','Identify why acknowledgement was allowed despite the gap.','Keep the queue outcome after its stated purpose.']);
single(conn,'Residence abroad does not prevent a digital appeal. Identity verification is still necessary, and a verified appellant may still lose the appeal. Choose the complete rewrite.',
 'An applicant may appeal digitally even if residing abroad, provided identity has been verified; verification does not guarantee a successful appeal.',[
 ['An applicant may appeal digitally only if residing abroad, provided identity has been verified, so every such appeal must succeed.','Only if creates a residence requirement and the last clause turns verification into a success guarantee.'],
 ['Unless an applicant resides abroad, a verified digital appeal cannot be refused on its merits.','Unless creates the wrong residence exception and removes the possibility of a merits-based refusal.'],
 ['Although identity verification guarantees a successful appeal, residence abroad can still prevent a digital appeal.','Both the guarantee and the residence bar contradict the facts.'],
 ['An applicant may appeal digitally whether or not identity has been verified, even if residing abroad; success remains uncertain.','The residence and uncertain outcome fit, but whether or not removes the mandatory identity condition.']
 ],'Residence is a permitted circumstance, identity is a prerequisite, and success is a separate decision.',
 'Place even if around the non-barrier and provided around the actual prerequisite; retain the uncertainty of outcome.',
 'An applicant may appeal digitally even if residing abroad, provided identity has been verified; verification does not guarantee a successful appeal.',
 'Different scopes for concession, condition and outcome','complete connector rewrite',
 ['An applicant may appeal digitally whether or not identity has been verified, even if residing abroad; success remains uncertain.','It preserves two facts but removes the third, mandatory verification.','Assign each circumstance its precise role.','Check that no connector turns a prerequisite into an optional circumstance.']);

const connectorCombos=[
 ['No disbursement is allowed without a verified original record. Possessing that record does not itself guarantee disbursement. Select every equivalent rewrite.',[
 ['Disbursement is allowed only if an original record has been verified, but that condition alone does not guarantee it.',true,'Only if preserves the prerequisite; the final clause retains the lack of a guarantee.'],
 ['Disbursement is allowed if an original record has been verified, so verification alone is sufficient.',false,'If and sufficient add the converse guarantee explicitly withheld.'],
 ['Unless an original record has been verified, disbursement is not allowed; even verification need not lead to disbursement.',true,'The negative unless construction and the later qualification preserve both directions.']
 ],'A necessary document can be present while another condition still prevents release.','Check the conditional in both directions, not just whether verification and disbursement both appear.',
 'Disbursement is allowed only if an original record has been verified, but that condition alone does not guarantee it.',
 ['A combination that includes the rewrite with if ... sufficient','That rewrite promises what the original describes only as a prerequisite.','Test an unverified case.','Then test a verified case refused for another reason.']],
 ['The branch completed verification before the deadline, yet the claim was refused for lack of eligibility. Select every rewrite preserving the completed check and the independent reason for refusal.',[
 ['Although verification was completed before the deadline, the claim was refused because the applicant was ineligible.',true,'The concession preserves timely verification and because retains the independent eligibility ground.'],
 ['The claim was refused because verification had missed the deadline, even though the applicant was eligible.',false,'It reverses both the timing fact and the eligibility fact.'],
 ['Despite completing verification before the deadline, the branch refused the claim on eligibility grounds.',true,'Branch is the agent of completing and refusing; the concessive phrase and stated ground both fit.']
 ],'A completed procedural step and an adverse substantive outcome can coexist.','Do not turn an insufficient successful step into a failed step merely to explain refusal.',
 'Although verification was completed before the deadline, the claim was refused because the applicant was ineligible.',
 ['A combination rejecting the despite rewrite','Despite + -ing correctly refers to the branch doing both actions; it preserves the same concession.','Keep the timing fact intact.','Locate the actual reason for refusal.']],
 ['The service was suspended because the server failed. The report did not claim that server failure was the only possible cause of a suspension. Select all faithful rewrites.',[
 ['Since the server failed, the service was suspended.',true,'Since expresses the supplied actual reason without claiming that no other cause was possible.'],
 ['The service was suspended only because the server failed, and no other event could have caused a suspension.',false,'Only because plus the added impossibility overstates an actual cause as an exclusive possible cause.'],
 ['The server failed; consequently, the service was suspended.',true,'Consequently keeps the supplied cause-to-result direction.']
 ],'The original identifies the actual cause in this event, not the sole conceivable cause of every suspension.','A cause is not automatically an exclusive cause. Preserve the difference between this event and all possible events.',
 'The server failed; consequently, the service was suspended.',
 ['A combination including only because ... no other event','It introduces exclusivity and impossibility outside the supplied causal finding.','Keep the direction of the actual cause.','Check whether only adds a universal claim.']],
 ['If the records are not received by Friday, the file will be closed. Files may also be closed for other reasons. Select every equivalent restatement of the deadline rule.',[
 ['Unless the records are received by Friday, the file will be closed.',true,'Unless negates receipt and preserves the stated sufficient trigger for closure.'],
 ['The file will be closed only if the records are not received by Friday.',false,'Only if makes missing the deadline necessary for every closure, contradicting other closure grounds.'],
 ['Failure to receive the records by Friday will result in closure of the file.',true,'This retains the missed deadline as a sufficient cause without excluding other causes.']
 ],'Missing the deadline guarantees closure; closure does not prove that the deadline was missed.','Do not reverse an if-rule into an only-if rule.',
 'Unless the records are received by Friday, the file will be closed.',
 ['A combination including the only-if rewrite','Other closure grounds are expressly permitted, so a missed deadline cannot be required for every closure.','Translate unless into if not.','Test a closure for a different reason.']],
 ['The review found no evidence of deliberate fraud. It nevertheless identified procedural failures requiring correction. Select every faithful joining of these findings.',[
 ['Although the review found no evidence of deliberate fraud, it identified procedural failures that required correction.',true,'The concession preserves both the limited reassuring finding and the remaining problems.'],
 ['The review proved that fraud was impossible, so the procedural failures needed no correction.',false,'It turns absence of evidence into proof of impossibility and removes the explicit correction requirement.'],
 ['The review found no evidence of deliberate fraud; however, procedural failures still required correction.',true,'However qualifies the reassurance without changing either finding.']
 ],'No evidence of deliberate fraud is a limited finding, not a complete clearance of every procedure.','Preserve the evidence limit and the remaining corrective obligation.',
 'The review found no evidence of deliberate fraud; however, procedural failures still required correction.',
 ['A combination including proved that fraud was impossible','That stronger finding is not supplied, and it would not erase the separately stated procedural failures.','Read the scope of no evidence.','Retain the independent correction requirement.']]
];
connectorCombos.forEach(([p,r,c,rule,m,review])=>combo(conn,p,r,c,rule,m,'multi-link connector rewrites',review));

const connectorGaps=[
 ['The bank was forbidden to release funds before review ended, and actual release took place two days later. It released funds ___ the review was complete.',[
 ['after',true,'After fits the later release without requiring it to happen immediately.'],['only after',true,'Only after preserves the prohibition on release before completion and permits a later delay.'],['as soon as',false,'As soon as implies an immediate transition, contradicted by the stated two-day delay.']
 ],'The timing is both not before and not immediately upon completion.','Separate an earliest permitted time from an immediate action.',
 'It released funds only after the review was complete.',
 ['A combination including as soon as','An earliest permission is not an assertion of immediate release; the actual delay rules it out.','Locate the completion boundary.','Retain the explicit delay after that boundary.']],
 ['The service may continue only while the reserve remains above the minimum. The bank may continue the service ___ the reserve remains above that minimum.',[
 ['provided that',true,'Provided that attaches the reserve condition to permission to continue.'],['as long as',true,'As long as expresses continuation subject to the same maintained condition.'],['even if',false,'Even if makes the reserve condition a conceded circumstance rather than the required limit on continued operation.']
 ],'Permission is conditional on maintaining the reserve, not independent of its level.','Keep the continuing condition inside the permission; do not turn it into a concession.',
 'The bank may continue the service as long as the reserve remains above that minimum.',
 ['A combination including even if','It weakens an actual prerequisite into a circumstance that does not control permission.','Identify the condition for continuation.','Check whether the connector requires or merely concedes it.']],
 ['The records were authentic, but their authenticity did not settle the uncertain future costs. The records were authentic; ___, the forecast remained provisional.',[
 ['however',true,'However contrasts genuine historical records with uncertainty about a different dimension.'],['nevertheless',true,'Nevertheless also preserves the reservation despite the reassuring authenticity finding.'],['consequently',false,'Consequently makes authenticity the cause of the provisional forecast; the uncertainty concerns separate future costs.']
 ],'Authenticity is reassuring but not sufficient to settle a forecast based on unsettled future assumptions.','A qualification of a favourable fact is not necessarily its consequence.',
 'The records were authentic; nevertheless, the forecast remained provisional.',
 ['A combination including consequently','It wrongly assigns causation to authenticity rather than retaining the independent cost uncertainty.','Separate the two dimensions.','Check contrast versus result rather than punctuation alone.']],
 ['Before the notice, borrowers could not distinguish a repayment pause from cancellation. The bank issued the notice ___ borrowers could distinguish the two; that was its stated prospective purpose.',[
 ['so that',true,'So that introduces the intended improvement in understanding.'],['in order that',true,'In order that expresses the same purpose with a finite clause.'],['because',false,'Because would make an existing ability to distinguish the reason for the notice, contrary to the stated initial inability and prospective aim.']
 ],'The ability is intended as an outcome, not supplied as a pre-existing cause.','Preserve purpose without asserting that the desired result already existed or was guaranteed.',
 'The bank issued the notice so that borrowers could distinguish the two.',
 ['A combination including because','It turns the stated future aim into a prior reason and contradicts the initial lack of understanding.','Locate the borrowers’ understanding before the notice.','Check purpose against existing cause.']],
 ['The originals had already been checked. This completed check was the stated reason the bank accepted the copies. The bank accepted the copies ___ the originals had already been checked.',[
 ['since',true,'Since gives the completed check as the actual reason.'],['given that',true,'Given that also treats the checked originals as an established ground for acceptance.'],['unless',false,'Unless would make acceptance depend on the originals not having been checked, reversing the stated ground.']
 ],'Verification is an established completed fact and explains the acceptance.','An existing reason cannot be replaced by an exception that negates it.',
 'The bank accepted the copies given that the originals had already been checked.',
 ['A combination including unless','Unless negates the very fact given as the reason for acceptance.','Keep the verification fact completed.','Check the polarity introduced by the connector.']]
];
connectorGaps.forEach(([p,rows,c,r,m,review])=>combo(conn,p+' Select every valid completion.',rows,c,r,m,'multiple-fit connector completion',review));

// State both the necessary boundary and sufficiency for permission, without promising actual continuation.
{
 const q=banks.connectors[11];q.prompt=q.prompt.replace('The bank may continue','This is the sole condition on permission to continue, though the bank may choose to stop. The bank may continue');
 const r=banks.connectors[0],oldAnswer=r.answer,newAnswer='The panel will review an application only if it is complete; some complete applications are nevertheless refused because they fall outside its jurisdiction.';
 r.answer=newAnswer;r.options[r.options.indexOf(oldAnswer)]=newAnswer;r.explanation.model=newAnswer;
}

const usage='word-usage';
const usageCases=[
 ['infer / imply',[
 ['From the receipt and timestamp, the auditor inferred that the transfer preceded the outage, although no witness had said so explicitly.',true,'The auditor draws a conclusion from evidence, which is infer.'],
 ['The wording of the notice implied that receiving a complaint was not acceptance of its merits.',true,'The wording indicates something without directly stating it, which is imply.'],
 ['The discrepancy inferred that the account had been altered, even though the auditor had not drawn that conclusion.',false,'A discrepancy is evidence from which someone may infer; it can imply an alteration but does not itself perform the reasoning.']
 ],'Distinguish the person drawing an inference from the evidence or wording carrying an implication.',
 'Infer describes the recipient’s reasoning; imply describes what the source indicates. Neither word alone settles whether the conclusion is true.',
 'From the receipt and timestamp, the auditor inferred that the transfer preceded the outage. The discrepancy implied that the account might have been altered.',
 ['A combination retaining inferred with discrepancy as its subject','It assigns the mental act of drawing a conclusion to the evidence rather than to its reader.','Identify who or what is the grammatical subject.','Distinguish receiving an implication from giving one.']],
 ['prescribe / proscribe',[
 ['The regulator prescribed a minimum retention period and proscribed destruction of the records before that period expired.',true,'Prescribe lays down the required period; proscribe prohibits the premature destruction.'],
 ['Because the circular was intended to prohibit password sharing, it prescribed that practice rather than merely discouraging it.',false,'Prohibiting the practice requires proscribed, not prescribed; prescribed would lay it down as the required practice.'],
 ['The circular proscribed the mandatory verification step by setting it out as the procedure every branch must follow.',false,'Setting out a mandatory procedure is prescribing it; proscribing would ban it.']
 ],'The words differ by one vowel but reverse the rule’s direction: lay down a requirement versus prohibit a practice.',
 'Do not judge by general association with rules. Determine whether the sentence mandates or bans the action.',
 'The regulator prescribed a minimum retention period and proscribed destruction of the records before that period expired.',
 ['A combination treating prescribed as another word for prohibited','It makes a banned action a required procedure, reversing the stated intention.','Locate the action governed by the rule.','Check whether the action is required or forbidden.']],
 ['credible / creditable / credulous',[
 ['The panel found the witness’s account credible, while noting that the separate cost forecast remained tentative.',true,'Credible means worthy of belief; it need not make an unrelated forecast final.'],
 ['The team’s prompt disclosure of its own error was creditable, although the disclosure did not prove that every other entry was correct.',true,'Creditable means deserving praise; praise for disclosure is not proof of all transactions.'],
 ['The forecast was described as credulous solely to say that it was worthy of belief, not that anyone accepted claims too readily.',false,'Worthy of belief requires credible; credulous describes excessive readiness to believe.']
 ],'Believability, praiseworthiness and readiness to believe are three separate attributes.',
 'Keep the property attached to the correct object and do not turn praise into verification.',
 'The account was credible. The team’s disclosure was creditable. A listener who accepts claims too readily is credulous.',
 ['A combination accepting credulous as worthy of belief','That word describes the believer’s excessive trust, not the forecast’s credibility.','Identify the intended attribute.','Then check whether the word describes the claim, the action or its audience.']],
 ['detract / distract',[
 ['The missing annex did not detract from the central finding because independent records established the same point.',true,'Detract from concerns diminishing force, value or credibility.'],
 ['The chair would not allow arguments about room allocation to distract the panel from examining eligibility.',true,'Distract concerns diverting attention from the task.'],
 ['The absence of a receipt distracted from the credibility of the account, even though nobody’s attention was diverted.',false,'The intended reduction in credibility is detracted from; distracted would concern diverted attention.']
 ],'Both verbs can occur with from, so the preposition alone cannot solve the question.',
 'Determine whether the effect is reduced value or diverted attention.',
 'The absence of a receipt detracted from the credibility of the account; unrelated arguments could distract the panel from examining it.',
 ['A combination accepting distracted from credibility','Nobody’s attention is diverted; the stated effect is on the strength of the account.','Identify what is affected.','Use meaning rather than the shared from pattern.']],
 ['exhaustive / exhausting / exhausted',[
 ['The review was exhaustive in coverage, examining every required account, but it did not exhaust the allocated budget.',true,'Exhaustive concerns complete coverage; exhaust a budget means use it up, a separate dimension.'],
 ['The exhausting review left even experienced auditors exhausted, although it covered only a small sample of the required accounts.',true,'Exhausting causes fatigue, exhausted describes the tired people, and neither entails complete coverage.'],
 ['The review was exhaustive merely because it exhausted the staff, despite covering only a small sample of the required accounts.',false,'Fatiguing the staff does not make coverage exhaustive; the required coverage is expressly incomplete.']
 ],'The amount of effort and the completeness of coverage can differ sharply.',
 'Exhaustive describes scope, exhausting causes fatigue, and exhausted describes depletion or fatigue.',
 'An exhausting review can leave auditors exhausted without being exhaustive in its required coverage.',
 ['A combination identifying complete coverage from staff fatigue','Effort and fatigue do not establish that all required accounts were examined.','Separate the review’s coverage from its effect on people.','Check whether the stated sample can satisfy exhaustive.']]
];
usageCases.forEach(([term,rows,c,r,m,review],i)=>combo(usage,`Which statements use “${term}” ${i%2?'INCORRECTLY':'correctly'}?`,rows,c,r,m,'close-sense usage combination',review,i%2?'incorrect':'correct'));

function restore(template,correctWords,shownOrder,clue,bindings){
 const labels=['A','B','C','D'],shown=shownOrder.map(i=>correctWords[i]),repair=correctWords.map(w=>labels[shown.indexOf(w)]),name=ls=>ls.join(', ');
 const pool=[labels,['B','A','C','D'],['A','C','B','D'],['A','B','D','C'],['B','A','D','C'],['C','A','B','D'],['D','C','B','A']];
 const wrongs=[...new Map(pool.map(p=>[name(p),p])).values()].filter(p=>name(p)!==name(repair)).slice(0,4);
 const render=words=>template.replace(/\{([A-D])\}/g,(_,l)=>words[labels.indexOf(l)]);
 const wrong=wrongs.map(p=>{const words=p.map(l=>shown[labels.indexOf(l)]),bad=labels.find((l,i)=>words[i]!==correctWords[i]);return [name(p),`Position ${bad} would contain “${words[labels.indexOf(bad)]}” instead of “${correctWords[labels.indexOf(bad)]}”. ${bindings[labels.indexOf(bad)]}`];});
 const q=single(usage,render(shown.map((w,i)=>w+' ('+labels[i]+')')),name(repair),wrong,clue,
 'Each option gives the original labels to place at A, B, C and D. Check every context, including words already correctly positioned; A, B, C, D makes no change.',render(correctWords),
 'Restore all four words while preserving each distinct dimension','close-sense word restoration',
 [name(wrongs[0]),'This restores at most part of the required wording and leaves a different semantic dimension in at least one slot.','Identify the property or action described at every position.','Apply the whole permutation and reread all four positions.'],
 {restoration:{template,shown,correctWords,repair,bindings}});
 q.instructions='Choose the original word labels to place at A, B, C and D, in that order. Use every word once. A, B, C, D means no interchange.';q.explanation.modelLabel='Correct wording';
}
restore('The initial account was {A}: believable but still unverified. The final evidence was {B}: it settled the disputed point. The notice was {C}: every exception was stated directly. The design was {D}: it could be built with the available resources.',
 ['plausible','conclusive','explicit','feasible'],[1,3,0,2],
 'All four words have favourable meanings, but they describe belief, evidential finality, direct wording and practical implementation respectively.',
 ['Believable but unverified requires plausible, not conclusive.','Settling the disputed point requires conclusive, not merely plausible.','Directly stated exceptions concern explicit wording.','A design that can be built concerns feasibility, not whether its story is believable.']);
restore('Verification was {A} for release because no unverified application could proceed. For a separate service with several access routes, a valid card was {B}: it alone granted access, though other routes also existed. The location data were {C}: they concerned the dispute without settling it. The dated receipt was {D}: it settled whether payment had occurred.',
 ['necessary','sufficient','relevant','conclusive'],[0,2,1,3],
 'The first condition is mandatory; the second is one enough-by-itself route among others; the last two distinguish relevance from decisive proof.',
 ['No unverified application may proceed, so verification is necessary.','A valid card alone grants access, but other routes remain: it is sufficient, not necessary.','Concerning the dispute without settling it describes relevance.','The receipt settles the payment question and is conclusive on that point.']);
restore('The new revenue was {A} on an authorisation that might be refused. The estimate was {B}, awaiting missing costs. After all prerequisites were met, the board’s final approval remained {C}: it could still choose refusal. In contrast, the receipt acknowledgement was {D}: the system generated it immediately on submission with no human choice.',
 ['contingent','provisional','discretionary','automatic'],[1,2,0,3],
 'Dependence on an event, an unfinished estimate, retained choice and a fixed system response are different properties.',
 ['Revenue depends on an unresolved authorisation, making it contingent on that event.','Missing costs leave the estimate provisional rather than final.','The board retains choice even after prerequisites: discretionary.','The acknowledgement follows a fixed trigger with no discretion: automatic.']);
restore('The partial match could {A} the witness’s account by adding support, without checking every detail. A complete authenticity check could {B} the signature. A dated record showing the alleged transfer never happened could {C} that allegation. A reservation about excluded files could {D} a favourable assessment without withdrawing it.',
 ['corroborate','verify','refute','qualify'],[1,0,3,2],
 'All four verbs concern evidence or evaluation, but they add support, check truth, disprove and limit a claim respectively.',
 ['Adding partial independent support without checking everything is corroboration.','Checking the signature’s authenticity is verification.','Showing the alleged event did not occur refutes that allegation.','Adding a reservation limits or qualifies the assessment without retracting it.']);
restore('The undecided vote was {A} until Friday. The completed funding decision was negative, so the request was {B}. Before another decision was made, the applicant removed that separate request, so it was {C}. The operating service was {D} for maintenance and was due to resume afterwards.',
 ['deferred','declined','withdrawn','suspended'],[0,1,2,3],
 'Every slot concerns a pause or cessation, but the actor, finality and expected next event distinguish them. The existing positions already fit.',
 ['Moving an undecided vote to a later day is deferral.','A completed negative decision declines the request.','An applicant removing its own request withdraws it.','A temporary halt to an operating service is suspension.']);

const replacementCases=[
 ['The potential loss was measured in rupees, and the favourable assessment was then limited by a reservation about missing files. The auditor ___ the potential loss and ___ the assessment. Select every pair preserving those separate actions.',[
 ['quantified / qualified',true,'Quantified gives the numerical measure; qualified adds the limiting reservation.'],['qualified / quantified',false,'This reverses the measured quantity and the restricted judgement.'],['measured / limited',true,'These replacements preserve both actions without introducing proof or withdrawal.']
 ],'A numerical estimate is not the same act as attaching a reservation to a judgement.','Both words must fit their objects and retain the direction of the two actions.',
 'The auditor quantified the potential loss and qualified the assessment.',
 ['A combination accepting qualified / quantified','It associates the right general topic with the wrong objects, reversing both operations.','Identify what receives a numerical value.','Identify what receives a limitation rather than a number.']],
 ['The record added independent support to the account but left details unchecked. It ___ the account without ___ every detail. Select every pair preserving both the support and its limit.',[
 ['corroborated / establishing',true,'Corroborated adds support; without establishing every detail retains the limit.'],['supported / proving',true,'Supported and without proving preserve the same weaker-versus-stronger distinction.'],['refuted / qualifying',false,'Refuted would disprove the account, reversing the stated support, regardless of the second word.']
 ],'A partial evidential match supports an account without proving its whole content.','Do not confuse confirmation in part, complete proof and disproof.',
 'It corroborated the account without establishing every detail.',
 ['A combination retaining refuted','The evidence supports the account; a verb of disproof reverses that fact.','Retain the favourable direction.','Then preserve the explicit boundary on completeness.']],
 ['The committee moved an undecided vote from Monday to Friday. Separately, the applicant removed a request before any decision. The vote was ___; the other request was ___. Select every faithful pair.',[
 ['deferred / withdrawn',true,'Deferred preserves a later decision; withdrawn preserves removal by the applicant before a decision.'],['postponed / retracted',true,'Postponed is valid for the vote; retracting the request also means taking it back.'],['declined / suspended',false,'Declined invents a completed refusal of the vote; suspended substitutes a temporary halt for removal of the request.']
 ],'The two actions have different actors and different implications for whether a decision exists.','Keep a delayed vote separate from an applicant taking back a request.',
 'The vote was deferred; the other request was withdrawn.',
 ['A combination accepting declined / suspended','It changes both a pending decision and a removed request into different procedural states.','Locate the actor and timing of each action.','Check whether the original event remains pending or has been removed.']],
 ['The transaction records were final and independently authenticated, while the forecast still depended on undecided tariffs. The records were ___, while the forecast remained ___. Select every faithful pair.',[
 ['authentic / tentative',true,'Authentic preserves the authenticated records; tentative preserves the unsettled forecast.'],['genuine / provisional',true,'Genuine and provisional express the same respective dimensions.'],['provisional / authentic',false,'The records are expressly final, not provisional, and authenticity does not preserve the forecast’s unfinished status.']
 ],'Uncertainty belongs to future assumptions, not to the authenticity or final status of the historical records.','A property true of one object cannot be transferred to another merely because the objects are related.',
 'The records were authentic, while the forecast remained tentative.',
 ['A combination accepting provisional / authentic','It relocates uncertainty to final records and fails to state uncertainty about the forecast.','Separate historical data from future estimates.','Track which property belongs to which object.']],
 ['The account was worthy of belief; the team’s prompt disclosure was deserving of praise, though disclosure alone did not prove every transaction. The account was ___; the disclosure was ___. Select every pair preserving the intended attributes.',[
 ['credible / creditable',true,'Credible describes belief-worthiness; creditable describes praiseworthiness without proving other facts.'],['believable / praiseworthy',true,'These ordinary synonyms preserve the same two attributes.'],['credulous / credible',false,'Credulous describes excessive readiness to believe, not a believable account; the second word also fails to preserve the specified praise.']
 ],'A statement, its audience and an action can receive different evaluations. Praise is not complete verification.','Distinguish credible, credulous and creditable without inventing a difference between genuine synonyms.',
 'The account was credible; the disclosure was creditable.',
 ['A combination accepting credulous / credible','The words have familiar roots but attach the wrong attributes to the two objects.','Identify whether the text evaluates truth, trust or conduct.','Check both replacements rather than accepting one familiar-looking word.']]
];
replacementCases.forEach(([p,rows,c,r,m,review])=>combo(usage,p,rows,c,r,m,'paired contextual replacements',review));

const orderRows=[
 {
 text:'Only after the records¦that the branch had initially¦described as complete¦were independently checked¦did the auditor realise¦that several signatures¦had never been verified.',
 clue:'The relative clause describes the records; were checked closes the only-after time clause; did the auditor realise is the inverted main clause, followed by a statement-order that-clause.',
 swaps:[[3,4],[2,3],[5,6]],reasons:[
 'Did the auditor realise is introduced before the records were checked has completed the fronted time clause, leaving were checked misplaced in the main-clause sequence.',
 'The auxiliary had initially is separated from its required participle described by were checked; the relative clause cannot be completed in that order.',
 'Realise requires that several signatures had never been verified, not the finite predicate before its subject and that-marker.'
 ]
 },
 {
 text:'What the committee disputed¦was not whether the figures¦had been copied accurately¦but whether the method¦used to collect them¦could support the conclusion¦drawn from them.',
 constraint:'The dispute concerns whether the collection method supports the inference, not whether copying was accurate. The conclusion was drawn from the figures; the method was used to collect them.',
 clue:'Was not whether ... but whether ... contrasts two embedded questions. Used to collect describes method, while drawn from describes conclusion.',
 swaps:[[4,5],[1,3],[5,6]],reasons:[
 'This attaches used to collect after conclusion instead of method, changing which thing collected the figures and failing the expressly stated roles.',
 'Moving but whether ahead of was not whether breaks both the finite predicate of the what-clause and the not ... but contrast.',
 'Drawn from them is detached from conclusion and placed inside the method phrase; this no longer preserves the specified method/conclusion attachments.'
 ]
 },
 {
 text:'The bank’s decision¦to retain records¦that were no longer needed¦for routine processing¦did not imply¦that those records¦could be disclosed without consent.',
 constraint:'The records were no longer needed for routine processing. Keeping them did not itself grant permission to disclose them.',
 clue:'To retain records modifies decision; no longer needed for routine processing is one relative-clause description; did not imply introduces the separate permission limit.',
 swaps:[[3,4],[2,5],[5,6]],reasons:[
 'This moves for routine processing away from needed and into the implication clause, no longer retaining the specifically limited operational-need finding.',
 'That those records is put where the records’ relative description belongs, while the relative-clause predicate is moved into the later implication. The two clauses cannot close coherently.',
 'The embedded statement requires that those records could be disclosed; placing could be disclosed before that those records breaks its word order.'
 ]
 },
 {
 text:'Had the panel been told¦that the figures¦on which the proposal depended¦had not been independently verified,¦it might have deferred¦the decision rather than¦rejected the proposal outright.',
 clue:'The figures are the subject of had not been verified inside the reported information; on which modifies figures. Might have governs the contrasted participles deferred and rejected.',
 swaps:[[3,4],[1,2],[5,6]],reasons:[
 'The result clause it might have deferred appears before the condition’s embedded figures had not been verified is complete.',
 'On which loses its antecedent figures and the reported that-clause begins too late; the panel was told something about figures, not on which without an antecedent.',
 'The shared might have needs deferred the decision rather than rejected the proposal; this order strands the decision rather than after the rejected phrase.'
 ]
 },
 {
 text:'The more carefully¦the auditor distinguished¦between a missing record¦and evidence that¦a payment had not occurred,¦the less willing she became¦to infer fraud from the gap alone.',
 clue:'Between pairs with and; the that-clause supplies the content of the evidence. The more ... the less ... comparison then takes the infinitive explaining less willing.',
 swaps:[[2,3],[4,5],[5,6]],reasons:[
 'And evidence that cannot precede the first term between a missing record; it also separates evidence from its finite content clause.',
 'The less main comparison is placed inside the evidence that-clause before its content a payment had not occurred is complete.',
 'To infer belongs with less willing she became; this moves the infinitive before its controlling adjective and leaves the paired comparison at the end.'
 ]
 },
 {
 text:'Having been checked¦against the originals,¦the copies were retained¦not because the originals¦were dispensable¦but because the appeal¦might require another comparison.',
 already:true,
 clue:'The passive having been checked correctly refers to copies. Not because ... but because ... distinguishes the rejected reason from the actual reason for retention.',
 swaps:[[2,3],[3,5],[4,5],[5,6]],reasons:[
 'Not because is inserted before the main subject and predicate, leaving the introductory passive modifier without its proper main-clause continuation.',
 'Exchanging the two because-clauses reverses which reason is denied and which is asserted; it also gives the appeal the predicate were dispensable.',
 'The predicate were dispensable is separated from the originals, so neither because-clause can complete its own subject–verb structure.',
 'The appeal must be the subject of might require; putting the predicate before but because the appeal breaks that clause.'
 ]
 },
 {
 text:'Not only did¦the revised protocol require¦staff to record¦why an exception was granted,¦but it also made¦the person approving it¦responsible for the explanation.',
 clue:'Did takes the subject protocol and base require. The first object includes the embedded why-clause; the second predicate made needs the person as object and responsible as its complement.',
 swaps:[[1,2],[3,4],[2,4]],reasons:[
 'Did is followed by staff to record before the actual main subject protocol and its base verb require; this cannot form the inverted first clause.',
 'But it also made begins the second coordinate before the object of record, why an exception was granted, has been supplied.',
 'Moving but it also made into the first verb’s object slot breaks the not only ... but also coordination and leaves staff to record in the wrong clause.'
 ]
 },
 {
 text:'Whether the proposal¦could be judged viable¦if recurring costs increased¦depended less on¦the optimism of its authors¦than on the assumptions¦that the auditors could verify.',
 constraint:'The question is viability under higher recurring costs. The judgement depends more on verifiable assumptions than on the authors’ optimism.',
 clue:'Whether ... could be judged viable if costs increased is the subject clause. Depended less on ... than on ... supplies the main comparison, and that the auditors could verify modifies assumptions.',
 swaps:[[2,3],[3,4],[4,5]],reasons:[
 'Depended less on is inserted before the conditional within the whether-clause, leaving on directly followed by an if-clause rather than its compared noun phrase.',
 'The optimism noun phrase is placed before the main predicate and separated from less on, so the two compared grounds cannot be coordinated.',
 'Than on the assumptions appears immediately after depended less on, without the first compared ground. The less ... than comparison is incomplete in that position.'
 ]
 },
 {
 text:'A finding that¦the evidence was insufficient¦to establish misconduct¦was not equivalent to¦a finding that¦no misconduct¦could have occurred.',
 fixed:{index:0,position:1},
 clue:'The fixed opening introduces a finding about insufficient evidence. Was not equivalent to introduces a different finding about impossibility; the two that-clauses must each close with their own subject and predicate.',
 swaps:[[1,2],[3,4],[5,6]],reasons:[
 'To establish appears directly after a finding that, before the subject evidence and its finite predicate; it cannot start the embedded finite statement.',
 'The second a finding that is inserted before the main comparison was not equivalent to, breaking the link between the two complete findings.',
 'The second finding needs no misconduct could have occurred, not could have occurred no misconduct; this is an embedded statement, not an inverted question.'
 ]
 },
 {
 text:'Only the applications¦whose original documents¦had been independently verified¦were eligible for review,¦and eligibility for review¦did not itself guarantee¦that the claims would be accepted.',
 clue:'Only modifies applications, so no main-clause inversion is required. Whose documents had been verified closes the relative clause; the final clause denies that eligibility guarantees acceptance.',
 swaps:[[2,3],[3,4],[5,6]],reasons:[
 'Were eligible is placed where original documents still needs its passive verification predicate, attaching eligibility to documents and leaving the application clause incomplete.',
 'And eligibility for review arrives before the applications have received their main predicate were eligible, breaking both coordinated clauses.',
 'The that-clause describing acceptance is moved ahead of did not guarantee as though it were a modifier of eligibility; this no longer supplies the object of guarantee in the required clause.'
 ]
 },
 {
 text:'Not until the objections¦raised by the reviewers¦had been answered¦did the board consider¦whether the conditions¦on which approval depended¦could be met¦without revising the forecast.',
 constraint:'The reviewers raised the objections. Approval depended on the conditions, not on the objections. Consideration happened only after the objections were answered.',
 fixed:{index:3,position:4},
 clue:'The two relative phrases have different antecedents: reviewers → objections and approval depended → conditions. The completed fronted time clause is followed by did the board consider and an embedded whether-clause.',
 swaps:[[1,5],[4,6],[2,4]],reasons:[
 'The resulting wording attaches on which approval depended to objections and raised by the reviewers to conditions. It can look grammatical, but swaps the expressly stated roles.',
 'Could be met comes before whether the conditions, breaking the embedded statement and leaving the conditions after its own predicate.',
 'Whether the conditions is moved into the fronted time clause and had been answered into the later question, so the objection-answering boundary is no longer complete before the fixed main clause.'
 ]
 },
 {
 text:'Had the bank retained¦the receipts¦that the reviewer later requested,¦the discrepancy¦might have been resolved¦before the decision¦that triggered the appeal¦was announced.',
 constraint:'The reviewer requested the receipts; the decision triggered the appeal. The discrepancy is what might have been resolved earlier.',
 fixed:{index:4,position:5},
 clue:'The counterfactual condition concerns retained receipts, its result concerns a resolved discrepancy, and before introduces the later decision that triggered the appeal.',
 swaps:[[2,6],[3,5],[1,3]],reasons:[
 'The two relative clauses change antecedents: receipts become what triggered the appeal, and the decision becomes what the reviewer requested. This violates the supplied facts despite a superficially coherent structure.',
 'Before the decision is moved into the result’s subject position while the discrepancy appears inside the later time clause, reversing the grammatical jobs of the two noun phrases.',
 'The bank retains the discrepancy and the receipts become what might be resolved; this swaps the given objects and fails the stated condition/result roles.'
 ]
 },
 {
 text:'The question was¦not whether the reserve¦would prevent every overrun¦but whether it¦would allow the firm¦to meet the additional costs¦without interrupting essential payments¦if an overrun occurred.',
 constraint:'The reserve is meant to fund extra costs while essential payments continue; it is not intended to prevent every overrun.',
 fixed:{index:3,position:4},
 clue:'Not whether ... but whether ... contrasts prevention of an event with capacity to meet its consequences. Allow the firm takes to meet, followed by the payment and conditional qualifications.',
 swaps:[[1,2],[4,5],[2,4]],reasons:[
 'Would prevent is placed before not whether the reserve, so the embedded question loses its marker and subject before its finite predicate.',
 'To meet is placed where the embedded subject it still requires its finite predicate would allow; the infinitive is also separated from allow the firm.',
 'This exchanges the two predicates across not ... but and leaves allow without its intended action complement, reversing prevention and cost-bearing roles.'
 ]
 },
 {
 text:'No proposal¦that the committee had¦already found commercially unviable¦was approved merely because¦the pilot had attracted¦more customers than¦the earlier trial¦had managed to attract.',
 constraint:'Preserve the limit on the reason for approval. Do not turn the sentence into a claim that no proposal of any kind was approved.',
 fixed:{index:3,position:4},
 clue:'The restrictive relative clause defines the proposals in question. Was approved merely because introduces the rejected ground, and more customers than needs the full earlier-trial comparison.',
 swaps:[[1,4],[2,5],[5,6]],reasons:[
 'The pilot clause is inserted after proposal before the committee’s relative clause is introduced, so had already found has no coherent subject and object connection.',
 'More customers than is inserted into the committee’s relative clause before found unviable, breaking both the proposal description and the later numerical comparison.',
 'The pilot is made to attract the earlier trial rather than more customers; the comparative quantity then loses the comparison subject it needs.'
 ]
 },
 {
 text:'What the regulator required¦was not a promise¦that every complaint¦would receive a favourable decision¦but an explanation¦of why each decision¦had been reached¦and how it could be challenged.',
 fixed:{index:4,position:5},
 clue:'The what-clause takes was not ... but ... as its predicate. That every complaint would receive ... completes promise; why and how are parallel embedded questions explaining the decision and challenge route.',
 swaps:[[1,3],[2,6],[5,7]],reasons:[
 'Would receive is moved before the subject every complaint and before promise has introduced its content clause, leaving both structures incomplete.',
 'Had been reached is inserted where promise still needs the that-clause subject; every complaint is then displaced into the explanation of a decision.',
 'And how ... is placed before the first why-question has been completed, while of why each decision is stranded after had been reached. The parallel explanation cannot close.'
 ]
 }
];

function order(row,index){
 const parts=row.text.split('¦'),n=parts.length,labels=parts.map((_,i)=>String.fromCharCode(65+i));
 const permutations=[[3,0,5,1,6,2,4,7],[2,5,0,6,1,4,3,7],[4,1,6,0,5,3,2,7]];
 const display=row.already?parts.map((_,i)=>i):permutations[index%3].filter(i=>i<n),fragments=Object.fromEntries(labels.map((l,i)=>[l,parts[display[i]]]));
 const canonical=parts.map((_,i)=>labels[display.indexOf(i)]),encode=p=>p.map(i=>labels[display.indexOf(i)]).join('');
 const wrong=row.swaps.map(([a,b],i)=>{const perm=parts.map((_,j)=>j);[perm[a],perm[b]]=[perm[b],perm[a]];return [encode(perm),row.reasons[i]];});
 const answer=row.already?'No rearrangement required':canonical.join('');
 if(!row.already)wrong.push(['No rearrangement required','The displayed alphabetical order does not preserve the required clause boundaries and roles. '+row.clue]);
 if(wrong.length!==4)throw Error('Need four ordering alternatives '+index);
 const fixed=row.fixed?{label:canonical[row.fixed.index],position:row.fixed.position}:null;
 const intro='Arrange all fragments into one coherent sentence.'+(row.constraint?' Preserve this meaning: '+row.constraint:'')+(fixed?` Fragment ${fixed.label} is fixed in position ${fixed.position}.`:'');
 const q=single('sentence-order',intro+'\n\n'+labels.map(l=>l+'. '+fragments[l]).join('\n'),answer,wrong,row.clue,
 'Use every fragment once. Check the finite predicate of each clause, the scope of not/only, the antecedent of each relative phrase, and every stated fixed position. Do not reject a valid alternative merely for style.',parts.join(' '),
 'Nested clauses, modifier attachment and preserved scope','nested sentence ordering',
 [wrong[0][0],wrong[0][1],'Identify the main finite predicate and close the embedded clauses.','Check the supplied roles and scope, then any fixed anchor.'],
 {ordering:{fragments,correctOrder:canonical,fixed,requestedPosition:null,meaningConstraint:row.constraint||'',reviewedAlternatives:wrong.map(([option,reason])=>({option,reason}))}});
 q.instructions='Use every fragment exactly once. Choose No rearrangement required only when the displayed order already works. Keep any stated fixed position and meaning constraint.';
 q.explanation.summary='Complete order: '+canonical.join(' → ')+'.';
}
orderRows.forEach(order);

const vocab=read('vocabulary.json');
const definitions=[
 ['infer','draw a conclusion from evidence or reasoning',['infer from evidence / infer a conclusion'],['inferred','inferring','inference'],'The auditor could infer a possible error from the mismatch, but could not yet establish its cause.'],
 ['imply','indicate or suggest something without stating it directly',['imply a condition / wording that implies'],['implied','implies','implying','implication'],'The notice implied that acknowledgement of a complaint was not acceptance of its merits.'],
 ['prescribe','lay down or specify a required rule, procedure or action',['prescribe a procedure / prescribe a requirement'],['prescribed','prescribing'],'The regulator prescribed a minimum period for retaining the original records.'],
 ['proscribe','formally prohibit or forbid a practice',['proscribe an activity / proscribe password sharing'],['proscribed','proscribing'],'The security policy proscribed sharing passwords even with a person claiming to be an officer.'],
 ['creditable','deserving approval or praise',['a creditable effort / creditable conduct'],['creditably'],'The team’s prompt disclosure of its own error was creditable, although the remaining records still needed checking.'],
 ['detract','reduce the value, strength or credibility of something, usually with from',['detract from credibility / detract from a finding'],['detracted','detracting'],'The missing annex did not detract from the finding because independent records established the same point.']
].map(([term,meaning,collocations,forms,readingExample])=>({term,meaning:vocab.find(v=>v.term===term)?.meaning||meaning,collocations,forms,important:true,readingExample:vocab.find(v=>v.term===term)?.readingExample||readingExample}));
const config={connectors:['MH-N',['Complete rewrites: keep every link','Equivalent joins and the false converse','Time, concession, purpose and multiple fits']],'word-usage':['MH-W',['Close senses and the role of the subject','Restore all four related words','Paired replacements: synonyms and scope']],'sentence-order':['MH-S',['Close the inner clauses','Preserve voice, comparison and reference','Fixed anchors and explicit attachment roles']]};
for(const id of ids){
 const c=chapters[id],qs=banks[id];if(qs.length!==15)throw Error('Expected fifteen questions in '+id);
 const [prefix,titles]=config[id],selected=definitions.filter(v=>qs.some(q=>[v.term,...v.forms].some(f=>hasTerm(JSON.stringify(q),f))));
 c.vocabularyCandidates||=[];for(const v of selected)if(!c.vocabularyCandidates.some(old=>old.term===v.term))c.vocabularyCandidates.push(v);
 for(let i=0;i<3;i++){const p={id:prefix+'0'+(i+1),title:titles[i],level,batch,questions:qs.slice(i*5,i*5+5)};p.questions.forEach((q,j)=>{q.id=id+'/'+p.id+'-Q'+(j+1);q.vocabulary=[...new Set([...vocab.filter(v=>hasTerm(q.prompt+' '+q.explanation.model,v.term)).map(v=>v.term),...selected.filter(v=>[v.term,...v.forms].some(f=>hasTerm(JSON.stringify(q),f))).map(v=>v.term)])];});c.packs.push(p);}
 c.description=(id==='connectors'?'135 questions: the original 120 plus 15 Moderate–Hard items.':'55 questions: the original 40 plus 15 Moderate–Hard items.')+' Select Moderate–Hard for close alternatives and complete meaning checks. The label is a reviewed training target, not an independently calibrated exam rating.';
 write('chapters/'+id+'.json',c);
}
console.log('Appended 45 Moderate–Hard questions: connectors, word usage and sentence rearrangement.');
