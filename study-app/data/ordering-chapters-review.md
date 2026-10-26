# Ordering and matching batch — reviewed 26 October 2026

120 original questions in 24 five-question sets, using the existing React UI. Total library: 560 questions in eight chapters. No RC or passage-inference questions are added.

## Source formats

- Sentence fragments: IBPS Clerk 13 October 2024 Q57–60; SBI Clerk 10 April 2025 shift 1 Q18–19; checklist 16/18 phrase rearrangement.
- Paragraph order/coherence: IBPS Clerk 7 October 2023 Q73–76; SBI Clerk 10 April 2025 shift 1 Q9–13 fixed-position ordering; checklist 44 ordering/insertion and checklist 46 odd sentence.
- Matching: SBI Clerk 2022 Q36–40 two-column joins; IBPS Clerk 29 November 2025 Q89–91 same-meaning columns; checklist 20 PDF pp2–4 three-column combinations.

The audit already records provenance and answer-key defects in several compilations. These sources establish relevance of formats, not exact official difficulty or question weightage. All new text is original, with format references stored per chapter and question. Warm-up/mains-style/higher labels are training labels, not calibrated difficulty guarantees.

## Coverage

| Chapter | Questions | Scope |
|---|---:|---|
| Sentence rearrangement | 40 | 30 full fragment orders, 10 with a fixed third position; three genuinely already-correct orders |
| Para jumbles & coherence | 40 | 12 complete orders, 8 positional questions, 10 odd sentences, 10 insertion questions |
| Column matching | 40 | 20 two-column joins, 10 three-column combinations, 10 same-meaning matches |

Every sentence-order question offers No rearrangement required, including when it is wrong. Its presence cannot signal the key. Three column questions genuinely have no valid combination; partial lists are rejected when other valid matches remain.

## Review scope and decisions

- Sentence solutions follow subject/verb, complement, relative-clause, paired-conjunction and scope dependencies. Fixed anchors are stored in structured data and checked in tests.
- Every paragraph question has its own short context. Feedback on one does not expose answers to other questions. Order, omission and insertion exercise coherence, not factual comprehension of an RC passage.
- Odd sentences can mention the same bank or employee but fail to advance the local argument. Insertion explanations check references on both sides, with explicit first/last-gap cases.
- Column starts and endings were reviewed for unintended cross-joins. Ambiguous draft joins were replaced by stronger grammatical bindings, rather than marking an otherwise plausible sentence wrong.
- Three-column questions require both joins. Matching the first two parts is insufficient.
- Same-meaning matches preserve permissions, obligations, prohibitions, quantifiers, causal direction, timing, necessary/sufficient conditions and degree of evidence. No evidence of fraud is not proof that fraud was impossible; lack of obligation is not prohibition.
- Added waive, reconcile and residual to the focused shared list, with reviewed examples and question links. The focused list now contains 62 entries. Existing priority words and their reading positions remain.

Tests verify model reconstruction, complete label use, fixed positions, insertion/omission integrity, complete matching keys, explanations, vocabulary links, browser feedback and progress persistence. Mechanical consistency with a reviewed model is not an independent proof that no other English wording is possible, nor a guarantee of an exam score.
