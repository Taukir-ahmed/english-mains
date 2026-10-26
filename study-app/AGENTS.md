# Study app maintenance

- Reuse the shared React UI. New chapters should normally change only a chapter JSON file, the registry and shared vocabulary data. Do not generate another standalone UI or rewrite existing question banks.
- Keep the presentation basic and comfortable: plain light background, readable system fonts, simple buttons. Do not add decorative headers, animations, dashboard tiles or elaborate styling unless the user asks.
- Answers and explanations appear immediately on selection. Keep timers and mode selectors out of the app. Preserve first-choice history when allowing retries.
- Use permanent chapter-prefixed question IDs. Do not silently change existing IDs, option text or correct answers; identify and review corrections.
- For every new chapter, identify important new exam vocabulary. Add reviewed meanings, collocations and forms through `vocabularyCandidates`, tag questions with their vocabulary, then run the shared sync/build. Do not silently replace a conflicting definition or invent meanings automatically.
- Keep daily reading focused. Every important candidate needs a reviewed `readingExample`; it is then synced into the shared vocabulary and automatically shown in focused Daily reading. Use `important: false` explicitly for reference-only additions. Do not push every option word into the daily list. Existing selected words carry stable `readingOrder` values.
- Add Moderate–Hard practice as new packs inside existing chapters, using the shared Level filter. Preserve earlier level labels and IDs. Difficulty must come from close alternatives, scope, multiple constraints or interacting grammar; record the nearest foil and at least two reasoning steps. If several synonyms genuinely fit, accept them in an explicit multiple-fit question rather than inventing a distinction. The label is a reviewed training target, not an independently calibrated exam rating.
- Keep relationship/direction clues, grammar and option-elimination reasons in raw data. Do not force positive/negative labels onto neutral or condition-based questions. Preserve facts, negation, certainty and causal direction in connector rewrites.
- Use `npm run build` to sync vocabulary, validate and export all entry files from the one UI. Run tests appropriate to logic/content changes. A small content addition needs data validation, not a redesign or a full visual rework.
- Preserve older JSON import support and browser records. Never delete legacy storage keys as part of migration.
- See README.md for architecture, commands and migration details.
