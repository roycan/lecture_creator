# Session prompt — Phase 3 (CLI: build.js + check.js)

Paste this whole file into a new session to continue without context-window limits.
It tells the new session what to read, where we are, and exactly what to build next.

---

## BOOTSTRAP (do this first, in order)

1. Read **[`inceptions/context.md`](../../inceptions/context.md)** — the "second brain": identity (Grade-10 PH CS teacher), the problem, locked decisions **D1–D13** (§6), target architecture (§4 — esp. the npm-scripts table), conventions (§7). Note **D5** (shared core for CLI + server — one source of truth) and **D2/D4** (data-URI images + bundled libs — both done).
2. Read **[`plans/progress.md`](../progress.md)** → find **"▶ RESUME HERE"** (it points to Phase 3). Skim the Session Log (Sessions 1–7) to understand state.
3. Skim **[`plans/reorg-inventory.md`](../reorg-inventory.md)** §2 (broken image refs → Phase 7a) + §2b (truly-missing PNGs → Phase 7b) — **not** in scope for Phase 3, but `check.js` WILL surface them; understand they are expected/known.
4. Read the **shared core** you are calling: **[`scripts/lib/index.mjs`](../../scripts/lib/index.mjs)** (the `buildLecture()` orchestrator + barrel exports — this is the single import surface), and skim [`scripts/lib/inline-images.mjs`](../../scripts/lib/inline-images.mjs) (its `onMissing` `'throw'`/`'warn'` semantics are the backbone of the integrity check). [`split-slides.mjs`](../../scripts/lib/split-slides.mjs), [`bundle-libs.mjs`](../../scripts/lib/bundle-libs.mjs), [`template.mjs`](../../scripts/lib/template.mjs) are **stable/done** — read only if you need detail. Then read the two **stubs you are replacing**: [`scripts/build.js`](../../scripts/build.js) and [`scripts/check.js`](../../scripts/check.js).
5. Verify on-disk state: `git status` should be clean on branch **`reorg`** (Session-7 commits: `b708acf` feat(core): bundle highlight.js + mermaid offline (Phase 2c) + `d6e11b4` docs); `npm test` → **37 pass, 0 fail**.

## CURRENT STATE (where we are)

- Branch `reorg`. Phases **0, 1, 6, 2a, 2b, 2c done**. All 20 lectures live in `lectures/<slug>/` (each = `lecture.md` + `assets/` + `diagrams/` + `diagram-src/`).
- The shared core (single source of truth, D5) — all barrel-exported from [`scripts/lib/index.mjs`](../../scripts/lib/index.mjs):
  - `splitSlides(md, { splitDepth=2 })` → `[{ html }]`
  - `inlineImages(slides, { lectureDir, onMissing='throw'|'warn' })` → data-URI slides
  - `bundleLibs({ mermaid })` + `hasMermaid(md)` → inline-ready lib strings
  - `renderPresentation(slides, { title, bundle })` → full offline HTML
  - `buildLecture({ slug, lectureDir, splitDepth=2, title, markdown, onMissing })` → composes **split → inline → bundle → render** into one complete, self-contained HTML string.
- `npm test` green: **37 tests** (scaffold 1 + split-slides 7 + template 6 + inline-images 13 + bundle-libs 10).
- Exports are now **fully offline**: `git-github` builds to a single 3.52 MB HTML with 7 data-URI images, hljs inlined, **zero** cdnjs/jsdelivr URLs; mermaid bundles only for lectures with a live ```` ```mermaid ```` fence (rare — most lectures use pre-rendered PNGs).
- **Decisions already locked (don't relitigate):** missing-image `onMissing` = Option A (`'throw'` default / `'warn'`); split depth ≤ 2; data-URI embedding (D2); bundle hljs always + mermaid when used (D4).
- [`scripts/build.js`](../../scripts/build.js) + [`scripts/check.js`](../../scripts/check.js) are **Phase-1 stubs** (they print "not yet implemented" / "full integrity scan arrives in Phase 3" and `exit(0)`). Phase 3 replaces them with the real CLI + linter.

## PHASE 3 GOAL

Wire the **CLI** so the shared core is usable from the command line and CI:
- **`npm run build -- <slug>`** → `buildLecture({ slug })` → write **`dist/<slug>.html`** (a single self-contained file).
- **`npm run build:all`** → build **every** `lectures/<slug>/` → `dist/<slug>.html` each.
- **`npm run check`** → integrity linter: scan **all** lectures, report every missing image ref, exit **non-zero** on any miss (the CI gate — context.md §5).

Both scripts are **thin wrappers** over the shared core (D5 — never duplicate the pipeline).

### Where things stand today (the stubs)

- [`scripts/build.js`](../../scripts/build.js): parses `--all` / first non-flag arg as slug, prints "not yet implemented (Phase 2/3)", `exit(0)`.
- [`scripts/check.js`](../../scripts/check.js): reads `lectures/`, counts/lists slugs, prints "full integrity scan arrives in Phase 3 (scaffold OK)", `exit(0)`.

### Deliverables

1. **[`scripts/build.js`](../../scripts/build.js)** → real builder.
   - `--slug <slug>` (or first positional arg) → `buildLecture({ slug })` → `fs.mkdirSync(dist, { recursive: true })` + write `dist/<slug>.html`. Print a one-line success (slug + byte size).
   - `--all` → enumerate `lectures/<slug>/` dirs (dirs only, sorted), build each, **try/catch per lecture** (one failure must not abort the batch), print a summary (built N, failed M + each failure's message), **exit non-zero if any failed**.
   - No args → print usage (`npm run build -- <slug> | npm run build:all`) + `exit(1)`.
   - Factor the reusable bits (e.g. `listSlugs()`, `buildOne(slug)`) into **importable functions**, guarded by `import.meta.url === pathToFileURL(process.argv[1]).href` for the CLI `main`, so they're unit-testable without spawning the process.
2. **[`scripts/check.js`](../../scripts/check.js)** → real linter.
   - For every `lectures/<slug>/`: split its `lecture.md` + resolve image refs (reuse [`inline-images.mjs`](../../scripts/lib/inline-images.mjs)) and **collect every missing ref** as `{ slug, slideIndex, resolvedPath, src }`. Print a structured, readable report. **Exit 1 if any miss; 0 if clean.**
   - To collect ALL misses per lecture (not just the first), do NOT use the throwing path. Either (a) drive `inlineImages(slides, { lectureDir, onMissing: 'warn' })` (it continues past every miss and warns per-occurrence with slide + path), or (b) — **recommended** — extract a small `scanMissingImages(slides, { lectureDir })` helper from [`inline-images.mjs`](../../scripts/lib/inline-images.mjs) returning the structured list (cleaner than scraping `console.warn`). Re-export it from [`index.mjs`](../../scripts/lib/index.mjs) and reuse it in build's `--all` error path too.
   - Scope Phase 3 to **image refs** (`![]()` → `<img src>`). "Try-It" **asset-link** checking (links to practice HTML files) can be a follow-up — note it as a TODO, don't block on it.
3. **Tests** → `scripts/test/cli.test.js` (or `build.test.js` + `check.test.js`): build writes `dist/<slug>.html` for the known-clean `git-github` (or a synthetic fixture) and the file is a complete `<!doctype html>` doc with **zero** cdnjs/jsdelivr URLs; `check` is clean on a clean fixture and reports ≥1 miss + non-zero on a fixture with a deliberately-missing image. Prefer importing the factored functions over spawning the CLI; use a temp `dist` to avoid clobbering. Keep `npm test` green (37 + new).
4. Update [`plans/progress.md`](../progress.md) (Phase 3 → ✅, append Session 8, ▶ RESUME HERE → Phase 7a). Commit code + tests together, docs separately.

### Non-obvious facts (so you don't re-discover them)

- **`buildLecture` already does everything.** `build.js` must be a thin argv → `buildLecture` → `writeFile` wrapper. Do NOT re-implement split/inline/bundle/render (D5).
- **Known-broken lectures will FAIL `check.js` right now** — this is **expected and NOT a bug to fix in Phase 3**: `css` (D9 moved PNGs `assets/`→`diagrams/` but `lecture.md` still says `assets/…`), `csv-datatables-qr` (`datables`/`datatables` typo), `tmc-eval360` (`tmc-eval360/*.png` path), plus the truly-missing PNGs (testing-quality ×6, responsive-bulma ×4, express-basics ×1, production-best-practices ×2). These fixes are **Phase 7a/7b**. `git-github` is the clean known-good slug — use it to prove the happy path.
- **`dist/` is gitignored** — build artifacts are throwaway; never commit them.
- `inlineImages`'s skip rule: `http(s)://`, `//`, and `data:` srcs are never checked (correct — those aren't local files).
- Mermaid inlining adds ~3 MB to a mermaid lecture's HTML (D2/D4) — `build --all` will emit a few large files; that's the accepted offline trade-off.
- The "zero **external** URLs" Definition-of-Done (incl. lecture *content* URLs like badge images) is Phase 5/9. Phase 3's gate is narrower: `check.js` = missing **local image files**.

### Decision to confirm with the user BEFORE coding

- **`check.js` strictness, given known-broken lectures exist (Phase 3 ships BEFORE 7a/7b):**
  - **(a) Hard CI gate** — exit 1 on any missing ref (true linter). It will be **RED today** until 7a/7b fix the known lectures; document the known-failures in the report. **Recommended** — honest, and 7a/7b are scheduled next.
  - **(b) Advisory** — report all misses but always exit 0 for now; flip to a hard gate after 7a/7b.
  - **(c) Baseline/allowlist** — maintain a list of known-missing to suppress; exit 1 only on *new* misses.
- **Sub-decision:** on a single `--slug` build that hits a missing image, should build **fail loud** (`onMissing:'throw'` → exit 1) — **recommended** — or build with a placeholder?
- **Recommend (a) + fail-loud single builds.** Ask the user.

## RULES

- **ESM** (`"type":"module"`), **kebab-case**, **one commit per phase**, `git mv` only (never `rm`), archive-never-delete (losers → `archive/reorg-2026-06/`).
- **Stay in scope:** do NOT fix the known image typos/missing PNGs (Phase 7a/7b); do NOT build the Express `/export` route (Phase 4); do NOT modify the shared core's pipeline (`build.js`/`check.js` are thin wrappers over it — you MAY add a small scan helper to `inline-images.mjs` + re-export it).
- **At the end:** update [`plans/progress.md`](../progress.md) (Phase 3 → ✅, append Session 8, ▶ RESUME HERE → Phase 7a), commit code + tests together, docs separately.
- Report + **STOP before Phase 7a** — the user reviews between phases.

## DONE WHEN

- [ ] `scripts/build.js` builds one slug → `dist/<slug>.html` and `--all` → every slug, with per-lecture error isolation + summary + correct exit code; no-args prints usage.
- [ ] `scripts/check.js` scans all lectures, reports every missing image ref (slug + slide + path), and exits non-zero on any miss (per the confirmed strictness decision).
- [ ] `scripts/test/cli.test.js` (or split files) added; `npm test` green (37 + new); existing 37 stay green.
- [ ] `npm run build -- git-github` produces `dist/git-github.html` (complete doc, zero cdnjs/jsdelivr); `npm run check` runs and its report lists the known-broken lectures (expected) without crashing.
- [ ] [`plans/progress.md`](../progress.md) updated; code + tests committed together, docs separately.
