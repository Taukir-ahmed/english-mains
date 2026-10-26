# English Practice

One React + Vite + Tailwind app for twelve English chapters: 215 cloze questions, 135 connector questions, and 55 each in the other ten chapters. Total: 900 questions, 180 sets and 291 shared vocabulary entries. All twelve chapters now have 15 questions under Moderate–Hard, for 180 harder-target questions in total. New chapters and levels reuse the existing UI without new screens or styling.

Open [English_Practice.html](../English_Practice.html) for the combined offline app. The existing cloze, connectors and vocabulary filenames also open the same shared UI at the appropriate chapter or view.

The interface uses a plain background, system fonts, simple controls and restrained correct/incorrect colours. Selecting an option immediately reveals the answer and explanation. That choice is committed until you explicitly retry. First-choice accuracy and latest-answer accuracy remain separate. There are no timers or test-mode selectors.

## Architecture

```text
study-app/
  data/
    registry.json             # Which chapters are available, and their order
    chapters/cloze.json       # Authored question data, no UI code
    chapters/connectors.json
    chapters/grammar.json     # Errors, correction and combined sentence verdicts
    chapters/fillers.json     # Single/double/same-word/triple and multiple-fit
    chapters/word-usage.json  # Replacement, usage and one/two-pair swaps
    chapters/sentence-order.json       # Fragment ordering and fixed positions
    chapters/paragraph-coherence.json  # Para jumbles, odd sentences, insertion
    chapters/column-matching.json      # Two/three columns and same meaning
    chapters/idioms-phrasal.json       # Context, meanings and pronoun placement
    chapters/context-vocabulary.json  # Contextual synonyms and antonyms
    chapters/spelling-confusables.json # Spelling, close pairs and usage
    chapters/advanced-mixed.json      # Error counts, multiple errors and hybrids
    vocabulary.json           # Shared definitions, examples and chapter links
    reading.json              # Original 72 vocabulary sentences + translations
  src/
    App.jsx                   # Navigation, chapter/set selection and progress
    progress.js               # Answer history, retries, imports and migration
    components/
      QuestionCard.jsx        # One answer UI for every chapter
      Explanation.jsx         # Shared clues, grammar, eliminations and models
      Passage.jsx             # Optional shared passage, with unrevealed blanks
      Vocabulary.jsx          # Shared vocabulary and daily reading views
    styles.css                # One small stylesheet + Tailwind
  scripts/
    sync-vocabulary.mjs       # Merge reviewed chapter vocabulary and link examples
    validate-data.mjs         # Validate question IDs, choices and vocabulary links
    export-html.mjs           # Export the same compiled app to offline entry files
  tests/                      # Progress/migration and content-preservation checks
  backups/legacy/             # Standalone HTML copies from before this migration
```

The app loads chapter files through the registry. A new multiple-choice chapter uses the same components. Optional passages and candidate statements cover cloze, fillers, error combinations, matching and rearrangement choices without a new screen for each topic.

## Future chapter workflow

1. Add a reviewed JSON file under `data/chapters/`, following either existing chapter.
2. Register its `id` and `file` in `data/registry.json`.
3. Give each question a permanent namespaced ID such as `fillers/F01-Q1`. Keep existing IDs, answers and options unchanged unless correcting an identified issue.
4. Supply its choices, answer, relationship/clue, grammar rule and elimination reasons. `single`, `not-fit` and `multiple` all share the same answer UI. Paired blanks and sentence rewrites can use `single` with textual choices.
5. Tag important words in each question's `vocabulary` array. Add every newly identified important word to the chapter's `vocabularyCandidates`, with a reviewed meaning, collocations and relevant forms.
   Important candidates must also have a reviewed `readingExample`. They enter focused Daily reading automatically, in packs of five. Explicitly mark optional reference-only entries `important: false`.
6. Run `npm run build`. Vocabulary sync, data validation, compilation and offline exports happen together. The UI is reused; question content is not regenerated.

Example vocabulary candidate:

```json
{
  "term": "defer",
  "meaning": "postpone something until a later time",
  "important": true,
  "readingExample": "The board decided to defer approval until verification was complete.",
  "collocations": ["defer approval / defer a decision"],
  "forms": ["deferred", "deferring", "deferral"]
}
```

`sync-vocabulary.mjs` deduplicates terms, retains existing reviewed definitions, links the words to chapters/questions, and collects examples from correct sentences. A conflicting definition stops the build for review. A question referencing a word without a definition fails validation. Deciding which new words matter for the exam remains an authoring/review task; the script does not invent meanings or automatically classify unknown words as important.

## Focused daily reading

The initial reviewed selection contained 50 useful words. The first three added chapters add or promote nine more: cursory, exhaustive, explicit, refute, redress, deter, disburse, stipulated and lucrative. The ordering/matching batch adds waive, reconcile and residual. The remaining-topic batch adds eight selected entries: rule out, carry out, look into, at stake, credulous, discreet, adverse and complement. The first Moderate–Hard batch adds/promotes qualify, preclude, suffice, contingent, calibrate and discount. The second adds infer, imply, prescribe, proscribe, creditable and detract. The final harder batch adds caveat, tenable, disinterested, equivocal, material, red herring, at face value, put up with, complaisance and precedence. The current focused list contains 92 entries. These are a focused learning priority, not an official word-frequency ranking. Both Vocabulary and Daily reading default to this important subset. The remaining reference entries, original 72 sentences and completed chapter examples remain accessible.

`important: true` and a reviewed `readingExample` on the shared vocabulary entry make it appear in Daily reading. `readingOrder` keeps the sequence stable; newly added important words append automatically. The sync preserves reviewed examples rather than discarding them, and validation prevents an important word from being published without a usable sentence. Reading pack position is remembered in the current browser.

## Commands

```text
npm install
npm run dev
npm test
npm run build
```

Development uses `http://127.0.0.1:5173/`. The production build also exports a self-contained `dist/index.html` and updates these workspace files:

- `English_Practice.html`
- `Cloze_Mains_Trainer.html`
- `Connectors_Mains_Trainer.html`
- `dense_bank_exam_vocabulary_improved.html`

The four files contain the same compiled UI with different default views. They do not require a running server or external libraries to practise. Use one preferred entry file or the stable localhost address for a consistent browser storage location.

## Progress and migration

The new app stores namespaced question attempts under `mains-english-progress-v1`. It checks the former cloze and connectors keys where the current browser exposes them, converts answered items and unfinished selected choices, and retains the old keys. Skipped blanks do not become wrong answers.

Imports accept both former JSON backup formats and the new combined format. Merging deduplicates attempt records and preserves existing first choices. An explicit retry adds another attempt rather than replacing history.

Browsers may isolate different local files, and localhost has a different origin. If previous answers are missing, open the updated HTML at its original filename and export progress there, or import your older JSON backup. Export before changing browsers or storage locations.

## Source maintenance

`cloze_trainer/` and `connectors_trainer/` are preserved legacy authoring sources. Their old build scripts produce the retired interfaces. Future changes belong in `study-app/`; do not run those legacy builders over the current exports. `scripts/import-existing.py`, `scripts/seed-connector-vocab.mjs`, `scripts/select-important-vocabulary.mjs`, `scripts/add-core-chapters.mjs`, `scripts/add-ordering-chapters.mjs` and `scripts/add-remaining-chapters.mjs` were one-time authoring/migration tools and should not be rerun over edited canonical data. The new chapters were refined in their canonical JSON after the initial batch; those refinements must be retained.

The three added chapters contain original questions inspired by the local paper/checklist formats cited in each chapter and question. They are not unchanged PYQs or a calibrated simulation of an exact exam difficulty. Warm-ups are deliberately easier; mains-style and higher practice introduce closer choices, combinations, triple blanks and multi-step swaps. See `data/core-chapters-review.md` for the coverage and review scope.

The later ordering/matching batch follows the same provenance policy. Each paragraph exercise has its own context so immediate feedback on one question does not solve the next. Optional explanation labels reuse the same explanation component for a correct sentence, paragraph or set of matches. See `data/ordering-chapters-review.md` for coverage. Browser QA is reusable: `node scripts/qa-core-chapters.cjs sentence-order paragraph-coherence column-matching` checks the later batch; omitting arguments checks the earlier three chapters.

The final planned batch is documented in `data/remaining-chapters-review.md`. Its spelling questions are original maintenance drills, not a claim that an unchanged source paper contained them. The advanced chapter is targeted mixed learning practice, without a timer; it is not a held-out readiness test. Run `node scripts/qa-core-chapters.cjs idioms-phrasal context-vocabulary spelling-confusables advanced-mixed` for its browser checks. A compact hash fixture verifies that adding this batch does not alter the 560 earlier prompts, options, answer keys or explanations; a future intentional correction needs an explicit review rather than a silent baseline update.

## Moderate–Hard extension

The first harder batch appends 15 questions each to Cloze, Contextual fillers and Errors & correction. Choose **Level → Moderate–Hard** in Practice. Set IDs are `MH-C01–03`, `MH-F01–03` and `MH-G01–03`. The earlier 720 question cores and their IDs remain intact; earlier levels are not relabelled.

These sets target close alternatives, full-context limits, multiple valid completions, interacting grammar and preservation of meaning. Every new question records a nearest foil, why it fails and at least two reasoning steps. The label is a reviewed training target, not independently measured equivalence to a particular mains shift. The earlier easy/moderate learning bank remains useful and is not reclassified by this addition.

See `data/moderate-hard-1-review.md`. `scripts/add-moderate-hard-1.mjs` is another guarded one-time authoring tool: do not rerun it over canonical data. To reuse browser QA for only these 45 questions, run `node scripts/qa-core-chapters.cjs cloze fillers grammar --level=Moderate–Hard`. It also checks that answering one cloze blank does not reveal later blanks. Separate preservation fixtures cover the original 560 and the full earlier 720 questions; their hashes remain unchanged when append-only coverage expands.

The second harder batch appends 15 questions each to Connectors, Word usage & swaps and Sentence rearrangement, using `MH-N01–03`, `MH-W01–03` and `MH-S01–03`. All six covered chapters use the same Moderate–Hard option. See `data/moderate-hard-2-review.md`; its one-time generator is `scripts/add-moderate-hard-2.mjs`. The original 765 questions are protected by another preservation fixture. Run `node scripts/qa-core-chapters.cjs connectors word-usage sentence-order --level=Moderate–Hard --batch=moderate-hard-2` to check only this batch. The optional batch argument selects test data and output names; it does not add a UI filter or a new tab.

The final harder batch adds 15 questions each to Para jumbles & coherence, Column matching, Idioms & phrasal verbs, Synonyms & antonyms, Spelling & confused words, and Advanced mixed practice. Its sets are `MH-P01–03`, `MH-K01–03`, `MH-I01–03`, `MH-V01–03`, `MH-T01–03` and `MH-X01–03`. See `data/moderate-hard-rest-review.md`. Its guarded one-time authoring script, `scripts/add-moderate-hard-rest.mjs`, must not be rerun over canonical data. A preservation snapshot protects all 810 earlier question cores. Existing IDs, earlier levels and browser progress remain compatible.

Run `node scripts/qa-core-chapters.cjs paragraph-coherence column-matching idioms-phrasal context-vocabulary spelling-confusables advanced-mixed --level=Moderate–Hard --batch=moderate-hard-rest` for all 90 additions. `node scripts/qa-important-reading.cjs` verifies the focused list and shared reading definitions. Spelling fundamentals remain maintenance drills within the harder level; combining several checks does not make every word or question difficult. None of these labels is an independently measured exam difficulty rating.

The stack follows [Vite's guide](https://vite.dev/guide/) and [Tailwind's Vite integration](https://tailwindcss.com/docs/installation/using-vite). Dependency versions are fixed by `package-lock.json`.
