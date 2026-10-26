// One-time enrichment identified while migrating the existing connectors chapter.
import { read,write } from './data-tools.mjs';
const chapter=read('chapters/connectors.json');
chapter.vocabularyCandidates=[
 {term:'defer',meaning:'postpone something until a later time',collocations:['defer approval / defer a decision'],forms:['deferred','deferring','deferral']},
 {term:'prerequisite',meaning:'something required before another action or situation is possible',collocations:['a prerequisite for access'],forms:['prerequisites']},
 {term:'solvent',meaning:'able to meet financial debts and obligations',collocations:['remain solvent'],forms:[]},
 {term:'eligibility',meaning:'the state of meeting the conditions needed to qualify',collocations:['eligibility criteria / checks on eligibility'],forms:['eligible']},
 {term:'corroboration',meaning:'supporting evidence that strengthens a claim or account',collocations:['independent corroboration / lack of corroboration'],forms:[]},
 {term:'notwithstanding',meaning:'in spite of; a formal expression of concession',collocations:['notwithstanding the rise in costs'],forms:[]},
];
write('chapters/connectors.json',chapter);
