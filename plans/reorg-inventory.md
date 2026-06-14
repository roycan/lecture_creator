# 📋 Reorganization Reference Inventory

**Purpose:** The ownership map and broken-link worklist that drives the full restructure (Phase 6/7). Generated *before* any file moves so we review a concrete map first.

**How to read:** Paths are relative to the repo root. "✅ exists" = target file present. "❌ MISSING" = referenced but no file. "⚠️ TYPO/MISMATCH" = target exists under a different name. "🚧 NOT YET CREATED" = referenced future content (planned, never built).

---

## 0. Post-Move Corrections (Phase 6, 2026-06-13)

On-disk verification during Phase 6 found these errors in §1/§3 below. **This section supersedes the marked rows.**

| Where | Inventory said | Reality (confirmed on disk) | Action taken |
|---|---|---|---|
| §1 / §3 — `ajax-fetch` | `weather.html` + `weather-data.json` ❌ MISSING | ✅ Both EXIST at `assets/` | Moved → `lectures/ajax-fetch/assets/` |
| §1 / §3 — `database-sqlite` | `practice-apps/{barangay-directory,store-inventory}-v2/` 🚧 NOT YET CREATED | ✅ Both EXIST (+ `class-list-v2/`) | Moved → `lectures/database-sqlite/assets/` |
| §1 / §6 — `tmc-eval360` | 8 PNGs "🔍 VERIFY" at `assets/tmc-eval360/` | ✅ Physically at `web-lectures/tmc-eval360/tmc-eval360/` | Moved → `lectures/tmc-eval360/assets/` |
| §6 — `tmc-eval360` duplicate | Two `.md` copies, pick one | Top-level `web-lectures/tmc-eval360.md` is canonical (cleaner refs) — **D12 revised** | Nested dup → `archive/reorg-2026-06/tmc-eval360-duplicate.md` (D13) |
| §1 — `dom`/global | `assets/styles.css` shared | Root `style.css` is EMPTY; `assets/styles.css` is the real file — **D7 confirmed** | Moved → `shared/styles.css` (canonical, copy-on-build) |
| §5 — orphans | ~36 listed as candidates | Confirmed unreferenced | **Left in `assets/` intentionally** (non-blocking; later pass) |

> §8 "Open Decisions" are now all resolved: see [`inceptions/context.md`](../inceptions/context.md) §6 (D7 revised, D8, D9, D12 revised, D13) + the table above.

---

## 1. Lecture → Owned Assets Map

Each lecture becomes `lectures/<slug>/` carrying its `assets/`, `diagrams/`, and `diagram-src/`. Items marked **SHARED** are referenced by 2+ lectures → go to top-level `shared/`.

| Slug (proposed) | Source markdown | Diagrams (PNG) | Practice HTML / JSON | Demo folders / extras |
|---|---|---|---|---|
| `html` | `web-lectures/html-lecture.md` | `diagrams/html/*` (7) ✅ | `assets/html-structure.html`, `barangay-semantic.html`, `text-practice.html`, `links-images-practice.html`, `barangay-clearance-form.html`, `price-list-table.html`, `barangay-profile-{starter,solution}.html`, `store-catalog-{starter,solution}.html`, `contact-form-{starter,solution}.html`, `school-website-{starter,elementary,highschool,vocational}.html` | — |
| `css` | `web-lectures/css-lecture.md` | ⚠️ images live in `assets/css-*.png` (NOT `diagrams/`) — 7 PNGs ✅ | (none beyond the PNGs above) | — |
| `responsive-bulma` | `web-lectures/responsive-bulma-lecture.md` | `diagrams/bulma/*` (4 exist: grid-system, column-sizing-reference, media-query-syntax, responsive-helpers) | `assets/bulma-grid-demo.html`, `bulma-responsive-helpers.html`, `mobile-form.html` + reuses html lecture starters | — |
| `js-basics` | `web-lectures/js-lecture-part1.md` | `diagrams/{if-else,discount-tiers,loop-lifecycle,break-continue,nested-loops-grid,function-anatomy}.png` ✅ | — | — |
| `js-arrays-objects` | `web-lectures/js-lecture-part2.md` | `diagrams/{array-indexing,array-mutation,method-taxonomy,array-pipeline,search-methods,reduce-steps,sort-comparator,object-anatomy,inventory-architecture,category-filter,ranking-pipeline,attendance-matrix}.png` ✅ | — | — |
| `dom` | `web-lectures/dom-lecture.md` | `diagrams/{dom-tree,element-selection,class-toggle,element-creation,event-flow-theory,event-flow-practical,form-validation,cart-architecture,event-delegation}.png` ✅ | `assets/practice{1,2,3}.html`, `todo.html`, `calculator.html`, `store.html`, `dashboard-{starter,solution}.html` | **SHARED** `assets/styles.css` |
| `ajax-fetch` | `web-lectures/ajax-fetch-lecture.md` | `diagrams/{promise-states,fetch-lifecycle,async-await-comparison,json-structure,error-flow,loading-states,debounce-timeline}.png` | `assets/promise-basics.html`, `fetch-demo.html`, `async-await-demo.html`, `json-practice.html`, `error-handling.html`, `search-demo.html`, `directory.html`, `quiz.html`, `dashboard-{starter,school,store,transport}.html`, `provinces.json`, `students.json`, `barangay-data.json`, `questions.json` | **SHARED** `assets/styles.css`; ⚠️ `assets/weather.html`+`weather-data.json` ❌ MISSING |
| `express-basics` | `web-lectures/express-basics-lecture.md` | `diagrams/{folder-structure,request-response-flow,request-response-flow-1,ejs-rendering,deployment-flow,json-vs-database}.png`; `diagram-src/web-server-basics/*.md` | demo apps `assets/01-hello-express/` … `assets/06-json-add/`, `assets/mini-project-{barangay,students,store}/`, `assets/railway-deployment-guide.md` | — |
| `database-sqlite` | ⚠️ **stray at root** `database-sqlite-lecture.md` (+ `web-lectures/database-sqlite-migration-guide.md`) | `diagrams/sql-operations.png` | `support-materials/{sql-cheat-sheet,sqlite-setup-guide}.md`, `support-materials/schema-templates/*.sql`, `practice-apps/class-list-v2/` | 🚧 `practice-apps/{barangay-directory-v2,store-inventory-v2}` NOT YET CREATED |
| `authentication-sessions` | `web-lectures/authentication-sessions-lecture.md` | `diagrams/authentication/*` (6) ✅, `diagrams/supplementary/middleware-stack.png` ✅ | 🚧 `support-materials/{auth-patterns,session-config-guide}.md` NOT YET CREATED; ⚠️ `security-checklist` mismatch; 🚧 `practice-apps/*-v3/` NOT YET CREATED | ⚠️ migration guide misplaced at root (`authentication-sessions-migration-guide.md`) |
| `csv-datatables-qr` | `web-lectures/csv-datatables-qr-lecture.md` | `diagrams/advanced-features/*` (15) ✅; ⚠️ `diagrams/supplementary/datatables-features.png` TYPO (file is `datables-features.png`) | `assets/database-backup-scripts.html`, `env-setup-guide.html`, `health-check-dashboard.html`, `security-checklist.html`, `error-handling-templates.html` | `diagram-src/advanced-features` sources |
| `json-api-audit` | `web-lectures/json-api-audit-lecture.md` | `diagrams/advanced-features/{system-architecture,json-backup-restore,rest-api-integration}.png` ✅ | (overlaps csv assets) | — |
| `testing-quality` | `web-lectures/testing-quality-lecture.md` | `diagrams/testing-quality/*` (6 exist) — ⚠️ 6 more ❌ MISSING (see §2) | `assets/{acceptance-criteria-generator,smoke-test-checklist,bug-report-form,e2e-test-script,test-case-template,demo-prep-checklist}.html`; ❌ `user-story-template.html`, `debugging-practice.html`, `uat-form.html` MISSING | `mini-projects/{barangay-test-plan,appointment-uat-session}.md`, `challenges/*` |
| `git-github` | `web-lectures/git-github-collaboration-lecture.md` | `diagrams/git-github/*` (7) ✅ | `assets/git-github/*` (templates) | `diagram-src` none (mmd live in `diagrams/git-github/`) |
| `production-best-practices` | `web-lectures/production-best-practices-lecture.md` | `diagrams/production-best-practices/{dev-vs-production,security-layers,security-packages-guide}.png` ✅; ⚠️ 2 ❌ MISSING (see §2) | `assets/{env-setup-guide,security-checklist,health-check-dashboard,database-backup-scripts}.html` | — |
| `pwa-basics` | `web-lectures/pwa-basics-lecture.md` | `diagrams/pwa-basics/*` (7) ✅ | `assets/pwa-basics/*` (manifests, service workers, offline html) | — |
| `full-stack` | `web-lectures/full-stack-handouts.md` + `full-stack-showcase.md` | `diagrams/{full-stack,api-testing}/*` ✅ | ⚠️ `assets/full-stack.png` ❌ MISSING (real file is `diagrams/full-stack/full-stack.png`) | — |
| `api-testing` | `web-lectures/api-testing-handouts*.md` | `diagrams/api-testing/*` ✅ | — | — |
| `localstorage` | `web-lectures/localstorage.md` | (none referenced) | — | — |
| `tmc-eval360` | ⚠️ **DUPLICATE** `web-lectures/tmc-eval360.md` AND `web-lectures/tmc-eval360/tmc-eval360.md` | 8 PNGs `assets/tmc-eval360/*.png` — 🔍 VERIFY actual location (paths inconsistent: `assets/tmc-eval360/`, `../assets/tmc-eval360/`, `tmc-eval360/`) | — | — |

---

## 2. Broken Image References (Phase 7 worklist)

These are `![](path)` with no valid target. Split into "typo/renamable" vs "truly missing".

### 2a. Typo / target exists under another name (rewire — high confidence)
| Lecture | Referenced | Actual file | Fix |
|---|---|---|---|
| `ajax-fetch` | `diagrams/promise-state.png` | `diagrams/promise-states.png` | add trailing `s` |
| `csv-datatables-qr` | `diagrams/supplementary/datatables-features.png` | `diagrams/supplementary/datables-features.png` | rename file to fix typo |
| `full-stack` | `assets/full-stack.png` | `diagrams/full-stack/full-stack.png` | repath to diagrams |

### 2b. Truly missing PNGs (Phase 7b — render from `.mmd`/`.d2` sources or log TODO)
| Lecture | Missing PNGs |
|---|---|
| `testing-quality` | `testing-timeline`, `types-of-testing`, `user-story-format`, `testing-pyramid`, `uat-process-flow`, `test-case-library-structure` (6) |
| `responsive-bulma` | `viewport-meta-tag`, `mobile-first-approach`, `print-workflow`, `breakpoints` (4) — sources may exist as `diagrams/bulma/*.txt` |
| `express-basics` | `add-data-flow` (1) |
| `production-best-practices` | `environment-variables-flow`, `csrf-protection-guide` (2; csrf has only `.txt`) |

---

## 3. Missing Practice / Support Files (referenced, not created)

| Lecture | Missing file | Status |
|---|---|---|
| `ajax-fetch` | `assets/weather.html`, `assets/weather-data.json` | 🚧 not created |
| `testing-quality` | `assets/user-story-template.html`, `assets/debugging-practice.html`, `assets/uat-form.html` | 🚧 not created |
| `authentication-sessions` | `support-materials/auth-patterns.md`, `support-materials/session-config-guide.md` | 🚧 not created |
| `database-sqlite` | `practice-apps/barangay-directory-v2/`, `practice-apps/store-inventory-v2/` | 🚧 not created |
| `authentication-sessions` | `practice-apps/{barangay-directory,class-list,store-inventory}-v3/` | 🚧 not created (future unit) |

> These are **content gaps**, not breakage from the reorg. They become tracked TODOs; they do not block the build (the linter will list them).

---

## 4. Shared Assets (referenced by 2+ lectures → `shared/`)

- **`assets/styles.css`** — used by `dom`, `ajax-fetch`, and indirectly every practice HTML (`<link href="styles.css">`). → canonical `shared/styles.css`; build copies into each `lectures/<slug>/assets/`.
- **Starter/solution sets reused across lectures**: `dashboard-{starter,solution}.html`, `store-catalog-{starter,solution}.html`, `barangay-clearance-{starter,solution}.html` appear in `html`, `dom`, `ajax-fetch`, `responsive-bulma`. → decide: keep one canonical in `shared/` and reference, or accept duplication per lecture. **Recommendation: canonical in `shared/challenges/`, copy-on-build.**
- **`diagrams/advanced-features/*`** — shared by `csv-datatables-qr` and `json-api-audit`. → these two may share a folder or `shared/diagrams/advanced-features/`.

---

## 5. Orphan Candidates (in `assets/`/`diagrams/`, referenced by nothing)

To confirm during Phase 6 (the dry-run mover will list these): e.g. `assets/inner-planets.png`, `assets/mobile-catalog.html`, `assets/responsive-dashboard.html`, `assets/responsive-store-{starter,solution}.html`, `assets/printable-clearance-form.html`, `assets/school-enrollment.html`, `assets/barangay-certificate.html`, `assets/business-permit.html`, `assets/{certificate,barangay-profile}-{starter,solution}.html` (some referenced, verify each). → archive or assign.

---

## 6. Duplicates / Misplacements

- 🔴 `web-lectures/tmc-eval360.md` **and** `web-lectures/tmc-eval360/tmc-eval360.md` — two copies, **different image paths**. Pick one canonical; reconcile paths.
- 🔴 Root strays (temp/summary/dup): `SESSION_2_SUMMARY.md` vs `session-2-summary.md` (dup), `session-3-summary.md`, `plan-part2.md`, `plan-polish.md`, `QUICK-TEST-GUIDE.md`, `DOCUMENTATION-UPDATE-2025-11-10.md`, `CURRICULUM-COMPLETE.md`, `WEB-APP-PART1-PROGRESS.md`, `THEME-TOGGLE-IMPLEMENTATION.md`, `TESTING-CHECKLIST.md`, `TESTING-CHECKLIST-v2.1.2.md`, `test-lecture.md`, `test-code-highlighting-mermaid.md`, `AJAX_FETCH_ASSETS.md` → `archive/reorg-2026-06/`.
- ⚠️ Misplaced-but-referenced (relocate, don't archive): `database-sqlite-lecture.md` (root → `lectures/database-sqlite/`), `authentication-sessions-migration-guide.md` (root → `lectures/authentication-sessions/`), `advanced-features-migration-guide.md` (root → relevant lecture).
- `CHANGELOG.md` — keep at root or move to `archive/`? (recommend keep).

---

## 7. Special Notes

- **CSS lecture stores its PNGs in `assets/`** (not `diagrams/`) — inconsistent with every other lecture. Decide: move them to `lectures/css/diagrams/` for consistency (recommended).
- **`diagrams/` mixes flat PNGs and subfolders**; `diagram-src/` is already topic-organized. Post-restructure each lecture gets its own `diagrams/` + `diagram-src/`.
- **The browser tool** (`index.html`, `app.js`, `style.css`) is the current creator — becomes the Express+EJS editor in `server/`.
- **GitHub hotlink refs** (`roycan.github.io/...`) appear only in `QUICK-TEST-GUIDE.md` and `archive/*` — historical, not in active lectures. Lectures themselves use relative paths. ✅ confirms the fix is purely about *delivery* (embed/host), not path rewriting.

---

## 8. Open Decisions for You

> **All resolved during Phase 6 (2026-06-13).** Outcomes:

1. ✅ **tmc-eval360** — canonical = top-level `web-lectures/tmc-eval360.md`; 8 PNGs were at `web-lectures/tmc-eval360/tmc-eval360/` → `lectures/tmc-eval360/assets/`.
2. ✅ **Shared starters/solutions** — canonical-in-`shared/challenges/` + copy-on-build (D8).
3. ✅ **CSS PNGs** — moved `assets/` → `lectures/css/diagrams/` (D9).
4. ✅ **CHANGELOG.md** — kept at root.
5. ✅ **Content gaps (§3)** — tracked as TODOs; note weather/practice-apps-v2 were false alarms (see §0).

---

## 9. Confidence Impact

Completing this inventory raises **Phase 6 (92% → ~95%)** and **Phase 7a (95% → ~97%)** because file ownership and the exact broken-link set are now known rather than guessed.
