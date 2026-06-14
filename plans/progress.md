# 📊 Progress Tracker — lecture_creator restructure

> **Living document.** Update at the end of every session. New sessions: read [`inceptions/context.md`](../inceptions/context.md) first, then find **▶ RESUME HERE** below.

**Last updated:** 2026-06-14 | **Overall:** Phase 5 complete -- tests green (68 pass: 53 unit + 15 route/integration via supertest); zero-external-URL integration proof locked; factory refactor enables hermetic route tests. All gates green (check 0; build --all 20 ok). Next: Phase 8 (docs: README, FOLDER-STRUCTURE, LECTURE-CREATION-PATTERN).

---

## ▶ RESUME HERE

**Next action:** Phase 8 -- Docs: update README.md (project overview, npm scripts, architecture), logs/FOLDER-STRUCTURE.md (new lectures/<slug>/ + server/ + scripts/lib/ layout), and logs/LECTURE-CREATION-PATTERN.md (the lecture.md -> buildLecture -> self-contained .html workflow + check gate). Phases 0-7 + 4 + 5 are done; the tool is feature-complete and all gates are green.
**Mode:** Code | **Confidence:** ~95% (Phase 5 landed clean: factory refactor preserved Phase-4 runtime (re-smoke green); 15 new tests (11 hermetic routes + 2 zero-URL + 2 real-repo smokes) all pass; zero-URL regex empirically grounded against real build output. Total 68 tests / check 0 / build --all 20 ok. Remaining uncertainty for Phase 8 = doc accuracy only -- no code risk).
**Implementation order:** 0 -> 1 -> 6 -> 2 -> 3 -> 7 -> 4 -> 5 -> 8 -> 9 (Phases 0-7 + 4 + 5 done; next: 8 -> 9).

---

## Phase Status

| # | Phase | Confidence | Status | Session date |
|---|---|---|---|---|
| — | Planning (context, architecture, decisions, inventory) | — | ✅ Done | 2026-06-12 |
| 0 | Snapshot: archive stray root files (`git mv` → `archive/reorg-2026-06/`) | 96% | ✅ Done | 2026-06-12 |
| 1 | Scaffold: `package.json`, `server/`, `scripts/lib`, `shared/`, `dist/`, `.gitignore`, npm scripts | 95% | ✅ Done | 2026-06-12 |
| 6 | Restructure: dry-run mover, then `git mv` lectures → `lectures/<slug>/`; `shared/styles.css`; de-dup tmc-eval360; relocate stray `database-sqlite-lecture.md` | 95% | ✅ Done | 2026-06-13 |
| 2a | Core: `splitSlides` (marked.lexer) + port `createSingleHTML` template | 92% | ✅ Done | 2026-06-13 |
| 2b | Core: data-URI image inlining (MIME png/svg/jpg, clear errors) | 95% | ✅ Done | 2026-06-13 |
| 2c | Core: bundle highlight.js always; mermaid only when used | 94% | ✅ Done | 2026-06-13 |
| 3 | CLI: `build.js` (`--slug`/`--all`) + `check.js` linter | 94% | ✅ Done | 2026-06-14 |
| 7a | Rewire image/asset refs with valid target (fix 3 typos + repaths) | 97% | ✅ Done | 2026-06-14 |
| 7b | Resolve the 1 truly-missing image ref (express-basics add-data-flow → inline mermaid) | 96% | ✅ Done | 2026-06-14 |
| 4 | Express+EJS editor (server-core preview A1): list lectures; same-origin `iframe` preview; `POST /export`; dropped base-URL field (D6) | 94% | ✅ Done | 2026-06-14 |
| 5 | Tests: factory refactor (createApp); hermetic supertest route tests; zero-external-URL integration proof; real-repo read smokes | 95% | Done | 2026-06-14 |
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

### Session 6 — 2026-06-13 (Phase 2b)
- Did: Added data-URI image inlining to the shared core. [`scripts/lib/inline-images.mjs`](../scripts/lib/inline-images.mjs) `inlineImages(slides,{lectureDir,onMissing='throw'})` rewrites each relative `<img src>` to a base64 data URI (`data:${mime};base64,…`) read from the owning lecture folder; MIME by extension (`.png/.jpg/.jpeg/.gif/.webp/.svg` → base64, one consistent path incl. SVG); skips `http(s)://`, protocol-relative `//`, and existing `data:` srcs untouched; mutates **only** `src` (robust to attribute order via a whitespace-anchored `src=` regex so `data-src` is never touched); unknown extension → clear `Error`. [`scripts/lib/index.mjs`](../scripts/lib/index.mjs) gains the orchestrator `buildLecture({slug,lectureDir,splitDepth=2,title,markdown,onMissing})` composing `splitSlides → inlineImages → renderPresentation` (title auto-extracted from the first H1/H2), and re-exports `inlineImages`.
- Decision (confirmed with user via scored review): **missing-image handling = Option A** — an `onMissing` option. `'throw'` (default) raises a loud `Error` naming **slide index + resolved path + original src** (feeds the Phase-3 `check.js` CI gate and `buildLecture`); `'warn'` does `console.warn` with the same detail and leaves the original `<img src>` (for the Phase-4 editor live-preview where an image may not exist yet). Scores: **A 96/95** vs **B 98/82** (B's confidence gap = the editor-preview "warn" would need a resolve+exist wrapper that duplicates `inlineImages`); B's simplification converges on A, so A wins.
- Verified: `npm test` green (**27 pass, 0 fail**: scaffold 1 + split-slides 7 + template 6 + inline-images 13). Manual build of a *clean* lecture `git-github` → `dist/git-github.html` (3.57 MB), **7** images inlined as `data:image/…` and **zero** relative `<img src>` left. Missing-image path confirmed loud: building `css` throws `inlineImages: missing image in slide 2: …/lectures/css/assets/css-cascade-flow.png (src: "assets/css-cascade-flow.png")` — expected & non-blocking.
- Findings: the bootstrap's suggested `css` example is currently **broken** — D9 moved its PNGs `assets/` → `diagrams/` but [`lectures/css/lecture.md`](../lectures/css/lecture.md) still says `assets/…`; used `git-github` for the success build instead. That `assets/` → `diagrams/` rewire is **Phase 7a** (out of 2b scope). The Phase-2a CDN refs (highlight.js/mermaid) remain by design — bundling is **Phase 2c**.
- Out of scope (next phases): bundle highlight.js + mermaid (2c); wire `build.js`/`check.js` (Phase 3); editor `/export` (Phase 4).
- Commit(s): `<phase-2b core commit>` — "feat(core): inlineImages + buildLecture data-URI inlining (Phase 2b)"; this docs commit.
- **Next:** Phase 2c (bundle highlight.js always; mermaid only when used).

### Session 7 — 2026-06-13 (Phase 2c)
- Did: Made the presentation shell **fully offline** by bundling highlight.js (always) + mermaid (only when a lecture uses a ```mermaid fence) — decision D4. Added [`scripts/lib/bundle-libs.mjs`](../scripts/lib/bundle-libs.mjs): `bundleLibs({mermaid})` returns inline-ready strings (`hljsScript`/`hljsStyleDark`/`hljsStyleLight` + `mermaidScript` when mermaid) read from **vendored UMD bundles** under `scripts/lib/vendor/` (`highlight.min.js` 11.9.0, `github-dark.min.css`/`github.min.css` 11.9.0, `mermaid.min.js` 10.9.0 — the EXACT CDN versions the template referenced); `hasMermaid(md)` scans the source `md` for a fenced ```mermaid block; `safeInlineJs`/`safeInlineCss` escape `</script>`/`</style>` for safe inlining. Modified [`renderPresentation`](../scripts/lib/template.mjs) `(slides,{title,bundle})`: when `bundle` is supplied it inlines the libs as two switchable `<style>` sheets (light-before-dark for a correct default-dark cascade) + `<script>`s and emits **no** CDN tags, and rewired the `setTheme()` runtime to toggle the inlined hljs sheets via `.sheet.disabled` (the easy-to-miss part — it previously swapped a CDN `<link>` href). Omitting `bundle` keeps the original CDN tags verbatim (2a backward-compat path; keeps `template.test.js` green). [`buildLecture`](../scripts/lib/index.mjs) now computes `bundleLibs({ mermaid: hasMermaid(md) })` and passes it through; `bundleLibs`+`hasMermaid` barrel-exported.
- Decision (confirmed with user): **source the browser bundles by vendoring prebuilt UMD** (option a) over reading `node_modules` or adding a bundler — deterministic, no runtime module resolution. Pinned **hljs 11.9.0 + mermaid 10.9.0** (the exact CDN versions) rather than `package.json`'s mermaid ^11.0.0, for a faithful offline mirror; `mermaid.run({nodes})` is v10/v11-compatible. Vendored files committed (new additions, not gitignored); provenance + re-fetch steps in [`scripts/lib/vendor/README.md`](../scripts/lib/vendor/README.md).
- Verified: `npm test` green (**37 pass, 0 fail**: scaffold 1 + split-slides 7 + template 6 + inline-images 13 + bundle-libs 10). Manual build of a real **non-mermaid** lecture `git-github` → `dist/git-github.html` (3.52 MB) and a synthetic **mermaid** fixture → `dist/mermaid-fixture.html` (3.34 MB): **both have zero** `cdnjs.cloudflare.com`/`cdn.jsdelivr.net` URLs; the mermaid bundle string appears **only** in the mermaid one; hljs `<style>` inlined in both; the offline theme toggle (`hljsDarkSheet.sheet.disabled`) is present and the CDN `<link id="hljs-theme">`/`hljsThemeLink` swap is absent.
- File-size impact (expected, D2/D4): inlining mermaid (~3 MB) makes a mermaid lecture's HTML large — the explicit offline trade-off. Most lectures embed pre-rendered PNGs and have no live mermaid fence, so they stay smaller and mermaid-free.
- Out of scope (next phases): wire `build.js`/`check.js` (Phase 3); Express `/export` (Phase 4).
- Commit(s): `<phase-2c core commit>` — "feat(core): bundle highlight.js + mermaid offline (Phase 2c)"; this docs commit.
- **Next:** Phase 3 (CLI `build.js` + `check.js`).

### Session 8 — 2026-06-14 (Phase 3)
- Did: Wired the CLI as thin wrappers over the shared core (D5). [`scripts/build.js`](../scripts/build.js): importable `listSlugs()` / `buildOne(slug,{distDir,lecturesDir,onMissing})` / `main(argv,{lecturesDir,distDir})`; `--slug` or positional → `buildLecture` → writes `dist/<slug>.html` (one-line success w/ byte size); `--all` → per-lecture `try/catch` (one failure can't abort the batch) + summary (`N ok, M failed (of T)`) + exit non-zero; no-args → usage + `exit(1)`. Single builds are **fail-loud** (`onMissing:'throw'` → exit 1). [`scripts/check.js`](../scripts/check.js): importable `scanLecture()` / `checkAll()` / `main({lecturesDir})`; splits each `lecture.md` + collects every missing local `<img src>` via a new **`scanMissingImages(slides,{lectureDir})`** helper extracted into [`scripts/lib/inline-images.mjs`](../scripts/lib/inline-images.mjs) (read-only, existence-only, reports every occurrence as `{slideIndex,resolvedPath,src}`, never throws — the collection twin of `inlineImages`, sharing its exact regex + skip rule) and re-exported from the barrel; prints a grouped report and exits **1 on any miss** (hard CI gate). `build.js`/`check.js` use the `import.meta.url === pathToFileURL(process.argv[1]).href` guard so importing them in tests never runs the CLI.
- Decision (confirmed with user via scored review): **check.js strictness = (a) Hard CI gate + fail-loud single builds.** `check` exits 1 on any missing ref and stays RED until 7a/7b fix the known-broken lectures (acceptable — 7a/7b is the very next phase). Scores reported to the user: **feasibility ~95%** (thin-wrapper phase over a proven, 37-test-green core; the only *new* code is `scanMissingImages` — a read-only extraction of the existing regex/`existsSync` loop — plus the two thin CLIs; no new deps/algorithms), **confidence ~82%** (technically ~95%; long-term-choice vs. the (c) allowlist ~80%, with nearly all uncertainty schedule-dependent — if 7a/7b slips several sessions, the "boy who cried wolf" check-fatigue effect makes (c) the better daily-workflow tool; mitigant: (a)→(c) is a ~5-line reversal, so the downside of having chosen (a) is near-zero). Dropped (b) advisory — a green-on-broken linter undercuts the correctness mindset the tool is meant to model for students.
- Issues/TODOs: **Fixed a path bug caught ONLY by the manual smoke** — `REPO_ROOT` in `build.js`/`check.js` climbed two `..` (copied from [`scripts/lib/index.mjs`](../scripts/lib/index.mjs), which is two levels deep under `scripts/lib/`) but these files are one level deep in `scripts/`, so it resolved to `<repo>/..` → `ENOENT`/no-lectures. One `..` is correct. Unit tests missed it (they pass an explicit `lecturesDir`); the real-CLI `npm run build -- git-github` + `npm run check` smoke caught it immediately — a strong argument for keeping the manual smoke in DONE-WHEN. **`check.js` surface (authoritative 7a worklist):** 22 misses / 8 lectures — `css`×7, `tmc-eval360`×8, `json-api-audit`×2, `csv-datatables-qr`/`express-basics`/`ajax-fetch`/`authentication-sessions`/`full-stack` ×1 each. Broader than the §2/§2b snapshot — e.g. `full-stack` → `diagrams/api-testing/analogy.png` (a PNG owned by the `api-testing` lecture, misfiled/referenced cross-lecture). Phase 7a reconciles against `check`'s **live** output, not the inventory snapshot. Try-It **asset-link** checking (anchors to practice HTML) is left as a TODO (Phase 5+); Phase 3 scopes to `<img src>` image refs only, as specified.
- Verified: `npm test` green (**53 pass, 0 fail**: prior 37 + 16 new in [`scripts/test/cli.test.js`](../scripts/test/cli.test.js), all hermetic via temp fixtures). `npm run build -- git-github` → `dist/git-github.html` (3.70 MB), `<!doctype html>`, **0** `cdnjs.cloudflare.com` / `cdn.jsdelivr.net`, 7 `data:image/png;base64,`. `npm run check` → exit 1, scanned 20 lectures, 22 misses grouped by slug, no crash. `npm run build -- --all` → exit 1, "12 ok, 8 failed (of 20)" (the 8 = exactly what `check` flagged). `npm run build` (no-args) → usage + exit 1.
- Out of scope (next phases): fix the broken refs (7a), render truly-missing PNGs (7b), Express `/export` route (Phase 4), zero-**external**-URLs gate incl. lecture *content* URLs like badge images (Phase 5/9).
- Commit(s): `<phase-3 code+tests commit>` — "feat(cli): build.js + check.js + scanMissingImages (Phase 3)"; this docs commit.
- **Next:** Phase 7a (rewire broken image refs — use `npm run check` as the worklist).

### Session 9 — 2026-06-14 (Phase 7a)
- Did: Rewired every repathable broken image ref so lectures build clean. Used live `npm run check` as the authoritative worklist (22 misses / 8 lectures) and reconciled each against on-disk evidence — NOT the stale inventory snapshot. All fixes in source `lecture.md` (refs resolve relative to the lecture folder): **css** ×7 — `assets/css-*.png` → `diagrams/…` (D9 move); **tmc-eval360** ×8 — `tmc-eval360/X.png` → `assets/X.png`; **authentication-sessions** ×1 — dropped ghost `diagrams/supplementary/` → `diagrams/middleware-stack.png`; **ajax-fetch** ×1 — `promise-state.png` → `promise-states.png` (add `s`); **csv-datatables-qr** ×1 — `git mv datables-features.png → datatables-features.png` (typo fix, history preserved) + rewire ghost `supplementary/` path; **full-stack** ×1 — cross-lecture ref `diagrams/api-testing/analogy.png` (owned by api-testing): copied `analogy.png` into `lectures/full-stack/diagrams/` (D2 self-containment) + rewired ref to local `diagrams/analogy.png`; **json-api-audit** ×2 — cross-lecture refs `diagrams/advanced-features/{json-backup-restore,system-architecture}.png` (owned by csv-datatables-qr; this lecture had NO `diagrams/`): copied both into `lectures/json-api-audit/diagrams/advanced-features/` (refs already pointed there, so no `.md` edit needed). See [`plans/phase-7a-plan.md`](phase-7a-plan.md).
- Decisions (confirmed with user): **cross-lecture refs → copy the PNG into the referencing lecture's own `diagrams/`** (D2 offline self-containment; rejected relative `../other-slug/…` climb as fragile coupling); **csv typo → `git mv` to correct spelling** (fix at source; never `rm`); **scope → 7a = repathable only** — the genuinely-missing `express-basics/add-data-flow.png` left for 7b, not rendered here.
- Issues/TODOs: **⚠️ Inventory §2b "truly-missing ×13" set is STALE.** Verified on disk — `testing-quality` (12 PNGs), `responsive-bulma` (8), `production-best-practices` (5) ALL have their referenced PNGs present, which is why they never appeared in the live `check`. The ONLY genuinely-missing PNG in the whole tree is **`express-basics/diagrams/add-data-flow.png`** (no `.mmd`/`.txt` source in `diagramSrc/`). So Phase 7b shrinks to a single item, NOT 13. Also found a systematic ghost `diagrams/supplementary/` path prefix in 2 lectures (auth-sessions + csv) — fixed per-ref.
- Verified: `npm test` green (**53 pass, 0 fail**). `npm run check` → exit 1, **1 miss** (express-basics `add-data-flow` only — down from 22; no new misses). `npm run build -- --all` → **19 ok, 1 failed** (express-basics only — down from 8 failed); the 7 repathable lectures that previously failed now build clean.
- Commit(s): `<phase-7a lecture commit>` — "fix(lectures): rewire broken image refs (Phase 7a)"; this docs commit.
- **Next:** Phase 7b (render/stub the 1 truly-missing PNG: express-basics add-data-flow; §2b inventory set is stale).

### Session 10 — 2026-06-14 (Phase 7b)
- Did: Resolved the **last** missing image ref — `express-basics/diagrams/add-data-flow.png` — flipping `npm run check` GREEN for the first time. The only genuinely-missing PNG in the whole tree (confirmed on disk: no `.png` in [`diagrams/`](../lectures/express-basics/diagrams/), no `.mmd`/`.txt` source in `diagramSrc/web-server-basics/` — it has `01`–`10`; the §2b "truly-missing ×13" set is STALE and was NOT chased, per the brief). **Decision (a) inline mermaid fence (user-confirmed, recommended):** replaced `![Add Data Flow](diagrams/add-data-flow.png)` at [`lectures/express-basics/lecture.md`](../lectures/express-basics/lecture.md):996 with a fenced ```` ```mermaid ```` `sequenceDiagram` adapted from the existing [`diagramSrc/web-server-basics/06-form-submission.md`](../lectures/express-basics/diagramSrc/web-server-basics/06-form-submission.md) and mapped 1:1 to the slide's 8 numbered "Understanding the Flow" steps (visit `/add` → form → POST → read JSON → add → write → redirect → updated list). No PNG file, no new dependency, stays self-contained (D2); `buildLecture` auto-bundles mermaid because the fence now exists (D4).
- Decisions: **(a) inline mermaid** over (b) render-to-PNG (would add a mermaid-CLI/puppeteer renderer — a new dep + build step the repo deliberately lacks) and over (c) drop (loses the figure, against D13). Trade-off (D2/D4): `express-basics` previously had NO mermaid fence, so `dist/express-basics.html` grows ~3 MB to 4.85 MB (mermaid bundle inlined) — acceptable for offline-first.
- Issues/TODOs: None. The miss was self-contained to one ref; `check` was NOT weakened. `/images/logo.png` (line ~567, inside a ```` ```html ```` code fence) left as escaped text (not a real `<img>`, never flagged).
- Verified: `npm run check` → exit **0** ("clean — no missing local image refs") — **first green check** (22 → 1 → 0 misses across 7a→7b). `npm run build -- express-basics` → clean, `dist/express-basics.html` (4,882,018 bytes). `npm run build -- --all` → **20 ok, 0 failed (of 20)**. `npm test` → **53 pass, 0 fail** (no regression). `git status` clean pre-commit on branch `reorg`.
- Commit(s): `<phase-7b lecture commit>` — "fix(lectures): inline mermaid for add-data-flow (Phase 7b)"; this docs commit.
- **Next:** Phase 4 (Express+EJS editor).

### Session 11 — 2026-06-14 (Phase 4)
- Did: Built the **Express+EJS editor** (architecture **A1 — server-core preview**, user-locked after feasibility ~96% / confidence ~90% scoring). Key insight: `renderPresentation` (ported from `createSingleHTML`) already embeds the full narrated deck player (voice loading, auto/manual mode, speed control, TTS) — so the editor's preview `<iframe>` IS a playable deck; no port of the original `app.js` TTS code needed. Refactored `listSlugs` into the shared core barrel [`scripts/lib/index.mjs`](../scripts/lib/index.mjs) and re-exported from [`scripts/build.js`](../scripts/build.js) (D5 — editor + CLI import one function). Created [`server/views/editor.ejs`](../server/views/editor.ejs) (EJS port of `index.html`: lecture `<select>` server-populated via `listSlugs()`, markdown `<textarea>`, preview `<iframe>`, Refresh + Export buttons; **base-URL field dropped** (D6); editor-level voice settings dropped — the deck player owns TTS). Created [`server/public/editor.js`](../server/public/editor.js) (`loadLecture` → GET `/api/lectures/:slug`; `refreshPreview` → POST `/preview` → `iframe.srcdoc`; `exportLecture` → POST `/export` → blob → `<a download>`). Created 3 route modules: [`server/routes/editor.js`](../server/routes/editor.js) (GET `/`), [`server/routes/lectures.js`](../server/routes/lectures.js) (GET `/api/lectures`, GET `/api/lectures/:slug`; `SLUG_RE=/^[a-z0-9-]+$/` for path safety), [`server/routes/export.js`](../server/routes/export.js) (GET `/preview/:slug`, POST `/preview`, POST `/export` + `Content-Disposition: attachment`). All editor builds use `buildLecture({ onMissing:'warn' })` (authoring loop tolerates drafts; CLI single-build stays `'throw'`; `npm run check` remains the strict ship-gate). Rewired [`server/app.js`](../server/app.js): `express.json`, static(`/static`), routers mounted, `/health` kept, 404 + error handlers, listen guard kept (for supertest in Phase 5), `export default app`.
- Decisions: **D14 — editor architecture = server-core preview (A1)** over A2 (faithful port of `app.js` TTS — redundant, the deck player already does it) and A3 (A1 + persist to `dist/` — adds write side-effects to the editor loop). A1 is D5-pure (one `buildLecture`), D6-done-by-construction (base-URL field dropped), D3-same-origin (localhost Express sidesteps `file://` CORS), and WYSIWYG (preview ≡ export, same build). CDN Bulma/FontAwesome used for editor *chrome only* — the **exported** student file has zero external URLs (data-URI images, inlined highlight.js + mermaid). Export download uses native `<a download>` (no FileSaver dep).
- Issues/TODOs: None blocking. Scope deliberately deferred to Phase 5: supertest route tests, zero-external-URL *integration* assertion (unit-level spot-check already confirmed the exported `dist/express-basics.html` has zero `http` URLs). Smoke test hit a boot-timing race on first try (4 endpoints blank with 2s warmup) — re-run with 4s warmup was fully green; no code change needed.
- Verified: `npm start` smoke — GET `/health` `{status:'ok',phase:'editor'}`; GET `/` renders 20 lecture `<option>`s; GET `/static/editor.js` 200; GET `/api/lectures` 20 slugs; GET `/api/lectures/git-github` `{slug,markdown}`; POST `/preview` → built HTML in `iframe.srcdoc`; POST `/export` → attachment, zero external URLs; 404 + 400 (bad slug) handled. Regression gates: `npm test` **53 pass / 0 fail**; `npm run check` **exit 0** (0 misses); `npm run build -- --all` **20 ok, 0 failed**. `git status` clean pre-commit on branch `reorg`.
- Commit(s): `e6905b9` — "feat(editor): Express+EJS editor with server-core preview (Phase 4)"; this docs commit.
- **Next:** Phase 5 (tests: supertest routes + zero-external-URL integration + wire `check`).

### Session 12 -- 2026-06-14 (Phase 5)
- Did: Implemented Phase 5 tests -- **Option C (hybrid)**, locked after scoring (feasibility ~96%, confidence ~92%; all tasks >=93% after the Task-4 inspect-first simplification). **Factory refactor:** converted the 3 route modules (server/routes/editor.js, lectures.js, export.js) from `export default router` to factory exports `createXxxRouter({ lecturesDir })`, and wrapped server/app.js in `export function createApp({ lecturesDir })` + `export default createApp()` (so `npm start` is unchanged and supertest imports the factory for hermetic tests). Fixed a null guard on `process.argv[1]` in the listen guard (was `undefined` under `node -e`/`node --test`, would throw `path.resolve(undefined)`). **Created scripts/test/routes.test.js** (15 tests, 3 layers): (1) Hermetic route tests (11) -- `supertest(createApp({ lecturesDir: tmp }))` with throwaway fixtures (mirrors cli.test.js withLectures convention); covers all routes + error paths (400 invalid slug, 404 unknown, 400 missing body). (2) Zero-external-URL integration proof (2) -- clean fixture (local PNG) -> POST /export -> asserts zero external src= URLs; negative control proves the regex catches an injected https:// leak. Key discovery: renderPresentation stores slide HTML via JSON.stringify() (template.mjs:57), so attribute quotes are escaped; the regex uses optional backslash to handle both escaped and unescaped forms. (3) Real-repo read smokes (2, non-hermetic) -- GET / -> >=1 option, GET /api/lectures -> non-empty slugs.
- Decisions: **D15 -- test architecture = Option C (hybrid):** factory refactor (createApp) enables hermetic route tests matching the existing cli.test.js convention; plus lightweight real-repo read smokes with non-count assertions. Zero-URL regex scoped to src= resource attributes (images/scripts/iframes), deliberately ignoring data: URIs, SVG xmlns, and content <a href> links. Chose C over B (pure hermetic) and A-prime (real-repo -- slower, couples test counts to repo content).
- Issues/TODOs: None. The process.argv[1] null guard fix was the only code change beyond the factory refactor + new test file.
- Verified: npm test -> **68 pass / 0 fail** (53 original + 15 new). npm run check -> **exit 0** (0 misses). npm run build -- --all -> **20 ok, 0 failed**. Phase-4 re-smoke after refactor: all endpoints unchanged. git status clean pre-commit on branch reorg.
- Commit(s): see git log (this session).
- **Next:** Phase 8 (docs: README, FOLDER-STRUCTURE, LECTURE-CREATION-PATTERN).

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
| 2026-06-14 | D14 | Editor architecture = **server-core preview (A1)**: editor + CLI share `buildLecture` (D5); preview via `POST /preview` → `iframe.srcdoc`; export via `POST /export` + `Content-Disposition: attachment`; `onMissing:'warn'` on editor routes (CLI stays `'throw'`). WYSIWYG (preview ≡ export). CDN Bulma = editor chrome only; exported file has zero external URLs. |
| 2026-06-14 | D15 | Test architecture = **Option C (hybrid)**: factory refactor (createApp({ lecturesDir })) -> hermetic supertest route tests (throwaway fixtures, no repo coupling) + lightweight real-repo read smokes. Zero-URL regex scoped to src= resource attributes (ignoring data:, SVG xmlns, content a-href); handles JSON.stringify escaping. |

---

## Open TODOs / Known Gaps (non-blocking)

- Content gaps to author later: `user-story-template.html`, `debugging-practice.html`, `uat-form.html`, `support-materials/auth-patterns.md`, `support-materials/session-config-guide.md`, `practice-apps/authentication-sessions/*-v3`. **(Corrected 2026-06-13: `weather.html`+`weather-data.json` and `practice-apps/{barangay-directory,store-inventory,class-list}-v2/` DO exist — moved during Phase 6; see [`plans/reorg-inventory.md`](reorg-inventory.md) §0.)**
- ~~Truly-missing PNGs to render/stub (Phase 7b): express-basics ×1 only (`diagrams/add-data-flow.png`, no source).~~ ✅ Done (Phase 7b, Session 10) — replaced with an inline ```` ```mermaid ```` `sequenceDiagram`; `check` is GREEN. ⚠️ The testing-quality ×6 / responsive-bulma ×4 / production-best-practices ×2 counts in the inventory were **STALE** — those PNGs all exist on disk (verified Phase 7a); they never appeared in the live `check`.
- ~~Verify tmc-eval360 image locations during Phase 6.~~ ✅ Done — 8 PNGs were at `web-lectures/tmc-eval360/tmc-eval360/` (not `assets/tmc-eval360/`); moved → `lectures/tmc-eval360/assets/` (commit `8f7854d`).
- 36 unreferenced orphan files intentionally left in `assets/` (non-blocking — decide archive vs. assign in a later pass).
- **Phase-2b confirmed broken refs (fix in 7a/7b, non-blocking):** `css` still points at `assets/css-*.png` after D9 moved them to `diagrams/`; `csv-datatables-qr` `datables`/`datatables` typo; `tmc-eval360` uses `tmc-eval360/*.png`; plus the truly-missing PNGs (testing-quality ×6, responsive-bulma ×4, express-basics ×1, production-best-practices ×2). All surface as clear `inlineImages` errors — by design. **As of Phase 3, `npm run check` is the authoritative LIVE worklist** (currently 22 misses / 8 lectures — see Session 8; broader than this snapshot, which predates the move). Reconcile 7a against `check`'s output, not this list.

---

## Commit Hygiene

- One commit per phase (or logical sub-step).
- Use `git mv` for all relocations (preserve history).
- Never `rm` — move to `archive/reorg-2026-06/`.
- After each phase: update this file's status table + session log, then commit.
