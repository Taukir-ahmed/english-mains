# English mains practice

Offline English practice for SBI Clerk, IBPS Clerk and RRB PO mains preparation. The bank contains **900 original practice questions across 12 chapters**, including **180 Moderate–Hard questions**, plus **291 vocabulary entries** and a focused Daily reading list of **92 selected words and expressions**. Reading comprehension is outside this app's scope.

Questions follow formats reviewed against local paper compilations and checklists. They are original practice, not unchanged previous-year questions or independently calibrated replicas of an exam shift.

## Practise offline

Download the repository ZIP and extract it. Open `English_Practice.html` in a browser. No installation, internet connection or running server is needed. Choose a chapter and set; select **Level → Moderate–Hard** for the harder layer.

Selecting an answer immediately displays feedback, clues, option-elimination reasons and a completed example. The interface uses plain readable styling and has no timer. Important vocabulary is shared between Vocabulary and Daily reading.

The cloze, connectors and vocabulary HTML filenames are alternate entry points into the same app. Keep using one preferred file and browser for consistent local progress. Progress is saved in browser storage, not to GitHub. Use **Progress & backup** to export or import it before changing browsers or storage locations.

## Develop and build

The maintained React/Vite/Tailwind application lives in `study-app/`. Use Node.js 22.12+ and npm:

```sh
cd study-app
npm ci
npm test
npm run build
```

The build syncs reviewed vocabulary, validates the data, compiles the shared UI and updates all four offline HTML files at the repository root. For local development, run `npm run dev` and open the address it prints. See [the application README](study-app/README.md) for architecture, authoring, migration and optional browser-QA commands.

Content lives in `study-app/data/chapters/`; the shared vocabulary and reading data are alongside it. Reuse the existing UI for additions. Follow [AGENTS.md](AGENTS.md) and [study-app/AGENTS.md](study-app/AGENTS.md). Historical authoring and migration scripts must not overwrite the canonical question banks.

The two legacy `bank.json` files are retained for preservation tests. Local source PDFs, extracted source archives, screenshots, backups, dependencies and caches are not included. [The source audit](English_Mains_Source_Audit.md) records the format review and limitations; references to local source files require those files to be supplied separately.
