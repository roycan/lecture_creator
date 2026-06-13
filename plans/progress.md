# 📊 Progress Tracker — lecture_creator restructure

> **Living document.** Update at the end of every session. New sessions: read [`inceptions/context.md`](../inceptions/context.md) first, then find **▶ RESUME HERE** below.

**Last updated:** 2026-06-13 · **Overall:** Phase 2a complete → ready for Phase 2b (image inlining).

---

## ▶ RESUME HERE

**Next action:** Phase 2b — core: data-URI image inlining (`inlineImages` in `scripts/lib/`); MIME detection for png/svg/jpg + clear missing-file errors; resolve refs relative to each `lectures/<slug>/`.
**Mode:** Code · **Confidence:** 93%
**Implementation order:** `0 → 1 → 6 → 2 → 3 → 7 → 4 → 5 → 8 → 9` (core split+template done; next: 2b → 2c → 3 → 7a → 7b → 4 → 5 → 8 → 9).

---

## Phase Status

| # | Phase | Confidence | Status | Session date |
|---|---|---|---|---|
| — | Planning (context, architecture, decisions, inventory) | — | ✅ Done | 2026-06-12 |
| 0 | Snapshot: archive stray root files (`git mv` → `archive/reorg-2026-06/`) | 96% | ✅ Done | 2026-06-12 |
| 1 | Scaffold: `package.json`, `server/`, `scripts/lib`, `shared/`, `dist/`, `.gitignore`, npm scripts | 95% | ✅ Done | 2026-06-12 |
| 6 | Restructure: dry-run mover, then `git mv` lectures → `lectures/<slug>/`; `shared/styles.css`; de-dup tmc-eval360; relocate stray `database-sqlite-lecture.md` | 95% | ✅ Done | 2026-06-13 |
| 2a | Core: `splitSlides` (marked.lexer) + port `createSingleHTML` template | 92% | ✅ Done | 2026-06-13 |
| 2b | Core: data-URI image inlining (MIME png/svg/jpg, clear errors) | 93% | ⏳ Next | — |
| 2c | Core: bundle highlight.js always; mermaid only when used | 91% | ⬜ Pending | — |
| 3 | CLI: `build.js` (`--slug`/`--all`) + `check.js` linter | 94% | ⬜ Pending | — |
| 7a | Rewire image/asset refs with valid target (fix 3 typos + repaths) | 97% | ⬜ Pending | — |
| 7b | Truly-missing images: render from sources or log TODO (non-blocking) | 85% | ⬜ Pending | — |
| 4 | Express+EJS editor: reuse `app.js` preview/TTS; list lectures; same-origin preview; `POST /export`; drop base-URL field | 92% | ⬜ Pending | — |
| 5 | Tests: unit + integration (zero external URLs) + routes (supertest); wire `check` | 93% | ⬜ Pending | — |
| 8 | Docs: update README, FOLDER-STRUCTURE, LECTURE-CREATION-PATTERN | 95% | ⬜ Pending | — |
| 9 | Verify acceptance: `npm test` green, `check` clean, zero external URLs, offline open OK, `npm start` round-trip | 92% | ⬜ Pending | — |

Legend: ✅ Done · ⏳ Next · 🔄 In progress · ⬜ Pending · ⚠️ Blocked

---

## Session Log

### Session 1 — 2026-06-12 (Planning)
- Read README + explored structure; diagnosed the github-pages hotlink mechanism and broken links.
- Locked direction: full restructure + offline Node data-URI build + Express/EJS SSR editor; bundle highlight.js + mermaid (conditional).
- Authored architecture, layered test strategy, confidence-scored phases.
- Generated [`plans/reorg-inventory.md`](reorg-inventory.md) (ownership map + broken-link worklist).
- Resolved 5 open decisions (D7–D11 in context doc).
- Created [`inceptions/context.md`](../inceptions/context.md) + this tracker.
- **Next:** Phase 0.

### Session 2 — 2026-06-12 (Phase 0)
- Archived 15 stray root temp/summary/duplicate/test files into `archive/reorg-2026-06/` via `git mv` (history preserved): `SESSION_2_SUMMARY.md` + `session-2-summary.md` (dup pair), `session-3-summary.md`, `plan-part2.md`, `plan-polish.md`, `QUICK-TEST-GUIDE.md`, `DOCUMENTATION-UPDATE-2025-11-10.md`, `CURRICULUM-COMPLETE.md`, `WEB-APP-PART1-PROGRESS.md`, `THEME-TOGGLE-IMPLEMENTATION.md`, `TESTING-CHECKLIST.md`, `TESTING-CHECKLIST-v2.1.2.md`, `test-lecture.md`, `test-code-highlighting-mermaid.md`, `AJAX_FETCH_ASSETS.md`.
- Left untouched (relocate in Phase 6, NOT archived): `database-sqlite-lecture.md`, `authentication-sessions-migration-guide.md`, `advanced-features-migration-guide.md`. Kept at root: `README.md`, `CHANGELOG.md`, `app.js`, `index.html`, `style.css`.
- Decision: Session-1 planning docs (`inceptions/`, `plans/progress.md`, `plans/reorg-inventory.md`, `plans/session-prompts/`) were untracked → committed in a separate `docs:` commit (`ed6488d`) before the archive commit for clean semantics + clean status.
- Verified: `archive/reorg-2026-06/` holds exactly 15 files; root clean of all archived files; `git status` clean post-commit.
- Commit(s): `ed6488d` (docs: planning second-brain docs) + Phase 0 archive commit — "chore: archive stray temp/summary/test files (Phase 0)".
- **Next:** Phase 1 (scaffold).

### Session 3 — 2026-06-12 (Phase 1)
- Scaffolded the Node/Express app skeleton (ESM, `type:"module"`): `package.json`, `.gitignore`, `server/app.js` (bootable Express+EJS stub + `/health`), `scripts/{build.js,check.js}` stubs, `scripts/test/scaffold.test.js`, `shared/README.md`, and `.gitkeep` placeholders for `server/{routes,views}`, `scripts/lib`, `shared`, `lectures`.
- npm scripts wired: `start` → `node server/app.js`, `build`/`build:all` → `scripts/build.js`, `check` → `scripts/check.js`, `test` → `node --test "scripts/test/**/*.test.js"`.
- `npm install` clean: 210 packages, 0 vulnerabilities; committed `package-lock.json`. Deps: express, ejs, marked, highlight.js, mermaid (prod) + supertest (dev). `node_modules/` + `dist/` gitignored.
- Decisions: ESM over CJS; bootable + green scaffold (not files-only); `npm install` now; `style.css` → `shared/styles.css` move deferred to Phase 6 (per D7).
- Issue found + fixed: `node --test scripts/test/` (directory arg) failed on Node 22.22 (treated the dir as a module to run) → switched test script to the quoted glob `"scripts/test/**/*.test.js"` (Node expands it; future-proofs nested tests).
- Verified: `npm test` green (1 pass), `npm run check` exit 0, `npm run build` exit 0, `npm start` boots and serves `/health` + `/`; `git status` clean post-commit.
- Commit(s): `<phase-1 scaffold commit>` — "feat: scaffold node/express app skeleton (Phase 1)".
- **Next:** Phase 6 (restructure).

### Session 4 — 2026-06-13 (Phase 6)
- Did: Executed the full structural restructure. Built a non-destructive dry-run mover ([`scripts/reorg/dry-run.mjs`](../scripts/reorg/dry-run.mjs)) with a declarative manifest ([`scripts/reorg/move-manifest.mjs`](../scripts/reorg/move-manifest.mjs)), a reference-coverage scanner, and `--apply`/`--only=` batch flags. Moved all **20 lectures** into `lectures/<slug>/` (each carrying `lecture.md` + owned `assets/`/`diagrams/`/`diagram-src/`); established `shared/` (`styles.css` + `challenges/`); de-duped tmc-eval360; relocated stray root `.md` companions. ~190 `git mv` operations (history preserved). `diagrams/` + `web-lectures/` source roots drained.
- Decisions made (on-disk evidence):
  - **D7 revised** — `assets/styles.css` is the real file (root `style.css` is EMPTY); moved → `shared/styles.css`.
  - **D12 revised** — top-level `web-lectures/tmc-eval360.md` is canonical (cleaner refs); nested dup archived → `archive/reorg-2026-06/tmc-eval360-duplicate.md` (D13 — never delete).
  - **D9** — CSS lecture PNGs moved `assets/` → `lectures/css/diagrams/` for consistency.
  - **D8** — starter/solution challenge sets → canonical `shared/challenges/` (copy-on-build).
- Inventory corrections found (see [`plans/reorg-inventory.md`](reorg-inventory.md) §0): `weather.html`+`weather-data.json` DO exist → `lectures/ajax-fetch/assets/`; `practice-apps/{barangay-directory,store-inventory,class-list}-v2/` DO exist → `lectures/database-sqlite/assets/`; tmc-eval360's 8 PNGs lived at `web-lectures/tmc-eval360/tmc-eval360/` (not `assets/tmc-eval360/`) → `lectures/tmc-eval360/assets/`.
- Issues/TODOs: 36 unreferenced orphans intentionally left in `assets/` (non-blocking, later pass); 3 meta `.md` remain in `diagram-src/` (INTEGRATION-GUIDE/README/RENDERING-CHECKLIST — not lecture-owned); 2 supplementary diagram-source `.md` were missed by the manifest (PNGs only) and relocated manually.
- Verified: `npm test` green (1 pass, 0 fail); `npm run check` lists all 20 slugs; dry-run scanner reports 0 real misses after manifest fixes.
- Commit(s): `3ca4327` (mover + manifest), `993c9f1` (establish `shared/`), `77d3e09` (batch A), `8f7854d` (batch B + relocate + dedup) — all `refactor(reorg):`; this docs commit `docs(reorg): progress + inventory notes`.
- **Next:** Phase 2a (core: `splitSlides`).

### Session 5 — 2026-06-13 (Phase 2a)
- Did: Ported the slide core into the Node shared lib. [`scripts/lib/split-slides.mjs`](../scripts/lib/split-slides.mjs) `splitSlides(md,{splitDepth=2})` uses `marked.lexer` tokens (no DOM) — splits on heading tokens with depth ≤ splitDepth and keeps `###`/`####` as content inside the section slide; carries the token list's `.links` onto each bucket so inline refs resolve. [`scripts/lib/template.mjs`](../scripts/lib/template.mjs) `renderPresentation(slides,{title})` is a faithful verbatim port of `createSingleHTML` (theme CSS + body + runtime player JS); title now parametric, dead github.io base-URL path dropped (D6), CDN lib tags kept (bundling = Phase 2c). [`scripts/lib/index.mjs`](../scripts/lib/index.mjs) barrel export so CLI + server share one core (D5).
- Decision: **split depth ≤ 2** (`#`/`##` split; `###`/`####` stay inside). Validated on real lectures — depth-2 yields presentable decks (css 21, database-sqlite 18, express-basics 24, html 17 slides) vs the original all-headings split's 49/105/108/139 micro-slides. `splitDepth` stays configurable for per-lecture overrides later.
- Verified: `npm test` green (14 pass, 0 fail: scaffold 1 + split-slides 7 + template 6); end-to-end render of `css` → `dist/css.html` (gitignored), 21 slides, title auto-extracted "Introduction to CSS".
- Out of scope (next phases): image data-URI inlining (2b), highlight.js/mermaid bundling (2c), `build.js`/`check.js` wiring (Phase 3). The 2a output still references CDNs by design — "zero external URLs" is the Phase 5/9 acceptance gate.
- Commit(s): `193c0ae` — "feat(core): splitSlides + presentation template (Phase 2a)"; this docs commit.
- **Next:** Phase 2b (data-URI image inlining).

<!-- Append new sessions below using this template:
### Session N — YYYY-MM-DD (Phase X)
- Did: ...
- Decisions: ...
- Issues/TODOs: ...
- Commit(s): <sha>
- **Next:** ...
-->

---

## Decisions Log

See [`inceptions/context.md`](../inceptions/context.md) §6 (D1–D13) for the full locked-decisions table with rationale. Add new decisions here as they arise:

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-12 | D1–D13 | see context.md §6 |

---

## Open TODOs / Known Gaps (non-blocking)

- Content gaps to author later: `user-story-template.html`, `debugging-practice.html`, `uat-form.html`, `support-materials/auth-patterns.md`, `support-materials/session-config-guide.md`, `practice-apps/authentication-sessions/*-v3`. **(Corrected 2026-06-13: `weather.html`+`weather-data.json` and `practice-apps/{barangay-directory,store-inventory,class-list}-v2/` DO exist — moved during Phase 6; see [`plans/reorg-inventory.md`](reorg-inventory.md) §0.)**
- Truly-missing PNGs to render from `.mmd`/`.d2`/`.txt` sources (Phase 7b): testing-quality ×6, responsive-bulma ×4, express-basics ×1, production-best-practices ×2.
- ~~Verify tmc-eval360 image locations during Phase 6.~~ ✅ Done — 8 PNGs were at `web-lectures/tmc-eval360/tmc-eval360/` (not `assets/tmc-eval360/`); moved → `lectures/tmc-eval360/assets/` (commit `8f7854d`).
- 36 unreferenced orphan files intentionally left in `assets/` (non-blocking — decide archive vs. assign in a later pass).

---

## Commit Hygiene

- One commit per phase (or logical sub-step).
- Use `git mv` for all relocations (preserve history).
- Never `rm` — move to `archive/reorg-2026-06/`.
- After each phase: update this file's status table + session log, then commit.
