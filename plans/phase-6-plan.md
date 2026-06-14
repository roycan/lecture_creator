# Phase 6 Plan — Structural Restructure (move-only)

> **Status:** DRAFT for STEP B sign-off. Structural only — `git mv` everything into `lectures/<slug>/`. Do **not** fix image refs (Phase 7a) or render PNGs (Phase 7b). Built from [`plans/reorg-inventory.md`](reorg-inventory.md) §1 + on-disk verification.

**Branch:** `reorg` · **Constraint:** every relocation is `git mv`; nothing is ever deleted (losers → `archive/reorg-2026-06/`).

---

## 0. Execution note (mode/capability)

STEP A (build the dry-run mover) and STEP C (apply the `git mv`s) require a terminal (`git`, `npm`). They run in **Code mode**. This document is the reviewable map the plan mandates before any `--apply`.

---

## 1. Target layout (per slug)

```
lectures/<slug>/
├── lecture.md            # renamed from web-lectures/<src>.md
├── assets/               # practice HTML/JSON (+ shared copy-on-build in Phase 2b/3)
├── diagrams/             # rendered PNGs
└── diagram-src/          # .mmd/.d2/.puml/.dot sources
shared/
├── styles.css            # canonical (from assets/styles.css)
└── challenges/           # shared starters/solutions (D8)
archive/reorg-2026-06/    # tmc-eval360 duplicate + any decided losers
```

---

## 2. Per-slug move manifest (SOURCE OF TRUTH)

Each lecture's markdown is renamed to `lecture.md`. Diagram subfolders move whole. Flat root PNGs in `diagrams/` are assigned by the lecture that references them (dry-run mover validates coverage).

| Slug | Source MD | Diagrams (PNG) | Assets (HTML/JSON) | diagram-src |
|---|---|---|---|---|
| `html` | `web-lectures/html-lecture.md` | `diagrams/html/*` | `assets/{html-structure,barangay-semantic,text-practice,links-images-practice,barangay-clearance-form,price-list-table}.html` | `diagrams/html/*.{mmd,txt}` |
| `css` | `web-lectures/css-lecture.md` | `assets/css-*.png` + `assets/simple-navigation-bar-structure.png` → `diagrams/` (D9) | (none) | (none) |
| `responsive-bulma` | `web-lectures/responsive-bulma-lecture.md` | `diagrams/bulma/*` | `assets/{bulma-grid-demo,bulma-responsive-helpers,mobile-form}.html` | (none — `.txt`/`.png` already in `diagrams/bulma/`) |
| `js-basics` | `web-lectures/js-lecture-part1.md` | `diagrams/{if-else,discount-tiers,loop-lifecycle,break-continue,nested-loops-grid,function-anatomy}.png` | — | `diagram-src/js-basics/*` |
| `js-arrays-objects` | `web-lectures/js-lecture-part2.md` | `diagrams/{array-indexing,array-mutation,method-taxonomy,array-pipeline,search-methods,reduce-steps,sort-comparator,object-anatomy,inventory-architecture,category-filter,ranking-pipeline,attendance-matrix}.png` | — | `diagram-src/js-arrays-objects/*` |
| `dom` | `web-lectures/dom-lecture.md` | `diagrams/{dom-tree,element-selection,class-toggle,element-creation,event-flow-theory,event-flow-practical,form-validation,cart-architecture,event-delegation}.png` | `assets/{practice1,practice2,practice3,todo,calculator,store}.html` | `diagram-src/dom/*` |
| `ajax-fetch` | `web-lectures/ajax-fetch-lecture.md` | `diagrams/{promise-states,fetch-lifecycle,async-await-comparison,json-structure,error-flow,loading-states,debounce-timeline}.png` (+ extras `event-loop`,`parallel-vs-sequential`,`cors-explanation` flagged by mover) | `assets/{promise-basics,fetch-demo,async-await-demo,json-practice,error-handling,search-demo,directory,quiz}.html`, `assets/{dashboard-school,dashboard-store,dashboard-transport}.html`, `assets/{provinces,students,barangay-data,questions,store-sales}.json` | `diagram-src/ajax-fetch-async/*` |
| `express-basics` | `web-lectures/express-basics-lecture.md` | `diagrams/{folder-structure,request-response-flow,request-response-flow-1,ejs-rendering,deployment-flow,json-vs-database}.png` (+ root `express-routing,form-submission,middleware-concept,mvc-pattern,static-files` extras) | demo apps `assets/{01-hello-express,02-static-files,03-ejs-basic,04-ejs-data,05-json-read,06-json-add}/`, `assets/mini-project-{barangay,students,store}/`, `assets/railway-deployment-guide.md` | `diagram-src/web-server-basics/*` |
| `database-sqlite` | **ROOT stray** `database-sqlite-lecture.md` (+ `web-lectures/database-sqlite-migration-guide.md`) | `diagrams/sql-operations.png`, `diagrams/database-basics/*` | `support-materials/{sql-cheat-sheet,sqlite-setup-guide}.md`, `support-materials/schema-templates/*.sql`, `practice-apps/class-list-v2/` | `diagrams/database-basics/*.md` |
| `authentication-sessions` | `web-lectures/authentication-sessions-lecture.md` (+ **ROOT stray** `authentication-sessions-migration-guide.md`) | `diagrams/authentication/*`, `diagrams/supplementary/middleware-stack.png` | (none created — content gap) | `diagrams/authentication/*.{mermaid.md,graphviz.md}` |
| `csv-datatables-qr` | `web-lectures/csv-datatables-qr-lecture.md` | `diagrams/advanced-features/*` (15) + `diagrams/supplementary/datables-features.png` | `assets/{database-backup-scripts,env-setup-guide,health-check-dashboard,security-checklist,error-handling-templates}.html` | `diagrams/advanced-features/*.{md,dot,puml}` (SHARED w/ json-api-audit) |
| `json-api-audit` | `web-lectures/json-api-audit-lecture.md` | (shares `diagrams/advanced-features/{system-architecture,json-backup-restore,rest-api-integration}.png`) | overlaps csv assets | — |
| `testing-quality` | `web-lectures/testing-quality-lecture.md` | `diagrams/testing-quality/*` (6 exist; 6 missing) | `assets/{acceptance-criteria-generator,smoke-test-checklist,bug-report-form,e2e-test-script,test-case-template,demo-prep-checklist}.html` | `diagrams/testing-quality/*.{mmd,txt}` |
| `git-github` | `web-lectures/git-github-collaboration-lecture.md` | `diagrams/git-github/*` (7) | `assets/git-github/*` (templates) | `diagrams/git-github/*.mmd` (sources live with PNGs here) |
| `production-best-practices` | `web-lectures/production-best-practices-lecture.md` | `diagrams/production-best-practices/*` (5 exist; 2 missing) | `assets/{env-setup-guide,security-checklist,health-check-dashboard,database-backup-scripts}.html` (⚠️ overlap with csv — see §4 ambiguity) | `diagrams/production-best-practices/*.{mmd,txt}` |
| `pwa-basics` | `web-lectures/pwa-basics-lecture.md` | `diagrams/pwa-basics/*` (7) | `assets/pwa-basics/*` | `diagrams/pwa-basics/*.{mmd,md}` |
| `full-stack` | `web-lectures/full-stack-handouts.md` (+ `full-stack-showcase.md`) | `diagrams/full-stack/*` | — | — |
| `api-testing` | `web-lectures/api-testing-handouts.md` (+ `api-testing-handouts-mermaid.md`) | `diagrams/api-testing/*` | — | — |
| `localstorage` | `web-lectures/localstorage.md` | (none referenced) | — | — |
| `tmc-eval360` | **canonical = `web-lectures/tmc-eval360.md`** (cleaner refs; see §4 #2) | 8 PNGs from `web-lectures/tmc-eval360/tmc-eval360/*` → `assets/` | (the 8 PNGs are its assets) | — |

**Auxiliary dirs** (lecture-indexed) that move per above: `support-materials/`, `practice-apps/`, `mini-projects/`, `challenges/` content where owned.

---

## 3. Special moves

- **D7** `assets/styles.css` → `shared/styles.css` (canonical). Root `style.css` is **empty** — it is the old browser-tool stub → stays at root for the **Phase 4** port (NOT shared/styles.css). *(Corrects the phase prompt's assumption.)*
- **D8** shared starters/solutions → `shared/challenges/`: `barangay-clearance-{starter,solution}.html`, `store-catalog-{starter,solution}.html`, `contact-form-{starter,solution}.html`, `school-website-{starter,elementary,highschool,vocational}.html`, `dashboard-{starter,solution}.html`, `barangay-profile-{starter,solution}.html`, `certificate-{starter,solution}.html`. (These are referenced by ≥2 lectures.)
- **D9** CSS lecture PNGs `assets/css-*.png` (+ `simple-navigation-bar-structure.png`) → `lectures/css/diagrams/`.
- **D12** tmc-eval360: keep ONE canonical in `lectures/tmc-eval360/`; archive the whole `web-lectures/tmc-eval360/` tree (duplicate md + relocate PNGs).
- **3 stray root `.md`** (relocate, don't archive):
  - `database-sqlite-lecture.md` → `lectures/database-sqlite/lecture.md`
  - `authentication-sessions-migration-guide.md` → `lectures/authentication-sessions/`
  - `advanced-features-migration-guide.md` → `lectures/csv-datatables-qr/` (see §4 #3)

---

## 4. The 6 ambiguities — recommendations (STEP B gate)

| # | Ambiguity | Evidence | Recommendation |
|---|---|---|---|
| 1 | styles.css canonical | `assets/styles.css` is a real, populated stylesheet; root `style.css` is **empty** (1 blank line). | `assets/styles.css` → `shared/styles.css`. Root `style.css` stays for Phase 4 port. **Reverses the phase prompt's "root → shared" assumption.** |
| 2 | tmc-eval360 canonical copy | Both copies have **broken** paths today. 8 PNGs physically at `web-lectures/tmc-eval360/tmc-eval360/`. Top-level `web-lectures/tmc-eval360.md` has cleaner refs (`tmc-eval360/...`); subfolder copy uses messy `assets/`+`../assets/` mix. | **Top-level `web-lectures/tmc-eval360.md` is canonical** → `lectures/tmc-eval360/lecture.md`; PNGs → `lectures/tmc-eval360/assets/`; archive `web-lectures/tmc-eval360/`. **Reverses D12** ("subfolder canonical") based on evidence. |
| 3 | `advanced-features-migration-guide.md` target | Unified v3→v4 guide (DataTables/flash/CSV/QR/audit/JSON) spanning csv-datatables-qr + json-api-audit; csv consumes ~15 of the shared diagrams vs 3. | → `lectures/csv-datatables-qr/`; note cross-ref for json-api-audit. |
| 4 | shared starters/solutions | Only **one** copy of each set exists (in `assets/`), referenced by multiple lectures. | Move single copies → `shared/challenges/` (D8). No dedup needed. |
| 5 | Inventory §5 orphans | Candidates: `assets/inner-planets.png`, `mobile-catalog.html`, `responsive-dashboard.html`, `responsive-store-{starter,solution}.html`, `printable-clearance-form.html`, `school-enrollment.html`, `barangay-certificate.html`, `business-permit.html`, `gov-doc-starter.html`, `font-family-fallback-chain.png`, `box-model-with-measurements.png`, stray diagrams extras (`event-loop`,`parallel-vs-sequential`,`cors-explanation`, express extras). | **Leave in place** (non-blocking); let the dry-run mover list any *referenced-but-uncovered* file, then decide archive/assign in a follow-up batch. No deletion. |
| 6 | commit strategy | — | **Grouped batches, one commit per logical group**: (1) mover scripts; (2) shared/ + special strays; (3) lectures batch 1; (4) lectures batch 2; (5) docs. |

---

## 5. Commit batches

1. `feat(reorg): dry-run mover + manifest (Phase 6)` — adds `scripts/reorg/{move-manifest,dry-run}.mjs`.
2. `refactor(reorg): establish shared/ — styles.css + challenges (D7/D8)` — D7 + D8 moves.
3. `refactor(reorg): relocate special strays + CSS PNGs (D9/D12/strays)` — 3 root `.md`, css PNGs, tmc-eval360 dedup.
4. `refactor(reorg): move lectures batch 1 (html…express-basics)` — first ~8 slugs.
5. `refactor(reorg): move lectures batch 2 (database-sqlite…tmc-eval360)` — remaining slugs.
6. `docs(reorg): progress + inventory notes (Phase 6 done)` — `plans/progress.md`, `plans/reorg-inventory.md`.

---

## 6. Dry-run mover spec

- `scripts/reorg/move-manifest.mjs` — declarative array built from §2: `{ slug, md: '<src>', diagrams:[...], assets:[...], diagramSrc:[...] }`.
- `scripts/reorg/dry-run.mjs` — reads manifest, resolves each source → `lectures/<slug>/...`, prints a reviewable table; scans each lecture's `lecture.md` for `![](...)` + `<a href>`/`<img src>` refs and **WARNs** on any referenced file not covered by the manifest (catches misses). Default = print+validate only; `--apply` performs the `git mv`s in the agreed batches.

---

## 7. Verification (done-when)

- `npm run check` lists all ~20 slugs.
- `npm test` stays green.
- Mover verification pass: every source moved; no unexpected orphans.
- `git status` clean after final commit.
- `plans/progress.md`: Phase 6 → ✅; session log appended; ▶ RESUME HERE → Phase 2a.

---

## 8. Out of scope (other phases)

- Fix broken image refs (`promise-state→promise-states`, `datables`, `assets/full-stack.png`) — **Phase 7a**.
- Render/fabricate missing PNGs (testing-quality ×6, responsive-bulma ×4, express ×1, production ×2) — **Phase 7b**.
- Port browser tool / build editor — **Phase 4**.
- Touch `archive/`, `README.md`, `CHANGELOG.md` — **Phase 8**.
