# Session prompt — Phase 2c (core: bundle highlight.js + mermaid offline)

Paste this whole file into a new session to continue without context-window limits.
It tells the new session what to read, where we are, and exactly what to build next.

---

## BOOTSTRAP (do this first, in order)

1. Read **[`inceptions/context.md`](../../inceptions/context.md)** — the "second brain": identity (Grade-10 PH CS teacher), the problem, locked decisions **D1–D13** (§6), target architecture (§4), conventions (§7). Note **D2** (data-URI embedding, now done) and **D4** (bundle highlight.js always; mermaid only when used) — this phase is D4.
2. Read **[`plans/progress.md`](../progress.md)** → find **"▶ RESUME HERE"** (it points to Phase 2c). Skim the Session Log (Sessions 1–6) to understand state.
3. Skim **[`plans/reorg-inventory.md`](../reorg-inventory.md)** §2b (truly-missing PNGs) — **not** in scope for 2c, just context.
4. Read the existing core you are **extending**: [`scripts/lib/split-slides.mjs`](../../scripts/lib/split-slides.mjs), [`scripts/lib/inline-images.mjs`](../../scripts/lib/inline-images.mjs) (just added in 2b), [`scripts/lib/index.mjs`](../../scripts/lib/index.mjs) (has the `buildLecture()` orchestrator), and **especially** [`scripts/lib/template.mjs`](../../scripts/lib/template.mjs) — that is where the CDN `<script>`/`<link>` tags live that 2c must replace.
5. Verify on-disk state: `git status` should be clean on branch **`reorg`** (Session-6 commits: `feat(core): inlineImages + buildLecture…` + its docs commit); `npm test` → **27 pass, 0 fail**.

## CURRENT STATE (where we are)

- Branch `reorg`. Phases **0, 1, 6, 2a, 2b done**. All 20 lectures live in `lectures/<slug>/`.
- The shared core: `splitSlides(md,{splitDepth})`, `inlineImages(slides,{lectureDir,onMissing})`, `renderPresentation(slides,{title})`, and the orchestrator `buildLecture({slug,lectureDir,splitDepth=2,title,markdown,onMissing})` — all barrel-exported from [`scripts/lib/index.mjs`](../../scripts/lib/index.mjs).
- `npm test` green: **27 tests** (scaffold 1 + split-slides 7 + template 6 + inline-images 13).
- Images are already inlined as data URIs (2b). A clean lecture (`git-github`) builds to a single 3.57 MB HTML file with **7** `data:image/…` URIs and **zero** relative `<img src>`.
- **Decision already locked (don't relitigate):** missing-image handling = **Option A** — `inlineImages`'s `onMissing` option (`'throw'` default raises an Error naming slide index + resolved path; `'warn'` leaves the `<img>` + console.warn).
- The 2b output still references **CDNs** (highlight.js + mermaid) — that is the *only* remaining non-offline part of the shell. **2c removes it.**

## PHASE 2c GOAL

Make the presentation shell **fully offline**: replace the CDN `<script>`/`<link>` tags with **inlined local bundles** — highlight.js **always**, mermaid **only when the lecture actually uses it** (decision D4). After 2c, a built file has **zero `cdnjs.cloudflare.com` / `cdn.jsdelivr.net` URLs**.

### Where the CDN refs are today (in `scripts/lib/template.mjs`)

- **Line 41** — hljs dark theme CSS: `<link … href="https://cdnjs…/highlight.js/11.9.0/styles/github-dark.min.css" id="hljs-theme">`
- **Line 42** — hljs JS: `<script src="https://cdnjs…/highlight.js/11.9.0/highlight.min.js"></script>`
- **Line 44** — mermaid JS: `<script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js"></script>`
- **Lines 616 & 625** — ⚠️ the theme-toggle runtime (`setTheme`) **also swaps the hljs CSS via CDN** (light = `github.min.css`, dark = `github-dark.min.css`). **Bundling must inline BOTH themes and rewire `setTheme` to switch offline** (e.g. toggle two `<style>` blocks, or swap a `<link>` to an inlined data URI). This is the easy-to-miss part.
- Keep intact: the runtime init (`hljs.highlightAll()` ~L754; `mermaid.initialize(…)` + `mermaidEnabled` flag ~L760–787) and the per-slide `mermaid.run({nodes})` renderer (~L982–999).

### Deliverables

1. **`scripts/lib/bundle-libs.mjs`** →
   - `export function bundleLibs({ mermaid })` returns inline-ready strings read from local files, e.g. `{ hljsScript, hljsStyleDark, hljsStyleLight, mermaidScript }` (omit `mermaidScript` when `mermaid` is false).
   - `export function hasMermaid(markdown)` → `true` if the markdown contains a fenced ` ```mermaid ` block (scan the **source `md`** passed to `splitSlides`, not diagram-src files).
   - A small helper to **safely inline JS**: replace any literal `</script>` inside a bundle with `<\/script>` before emitting it inside `<script>…</script>`.
2. **Vendored browser bundles** under `scripts/lib/vendor/` (see the decision below): `highlight.min.js`, `github-dark.min.css`, `github.min.css`, `mermaid.min.js`. Commit them.
3. **Modify [`renderPresentation`](../../scripts/lib/template.mjs)** to accept `{ title, bundle }`: when `bundle` is supplied, inject the inlined `<style>`/`<script>` (and the offline theme toggle), and emit **no** CDN tags. **When `bundle` is omitted, keep the current CDN tags** — this preserves the existing 2a `template.test.js` behavior (backward-compatible) and isolates the change.
4. **[`buildLecture`](../../scripts/lib/index.mjs)** computes `const mermaid = hasMermaid(md); const bundle = bundleLibs({ mermaid });` and passes `bundle` into `renderPresentation`.
5. **Export** `bundleLibs` + `hasMermaid` from [`scripts/lib/index.mjs`](../../scripts/lib/index.mjs).
6. **Tests** → `scripts/test/bundle-libs.test.js`: `bundleLibs({mermaid:true})` returns non-empty `hljsScript`/`hljsStyleDark`/`hljsStyleLight`/`mermaidScript`; `bundleLibs({mermaid:false})` omits `mermaidScript`; `hasMermaid` true on a ` ```mermaid ` fence and false otherwise; a built (bundled) slide doc has **zero** `cdnjs.cloudflare.com`/`cdn.jsdelivr.net` URLs. Re-run `npm test` green.

### Non-obvious facts (so you don't re-discover them)

- **Mermaid is rarely live today.** A repo-wide scan shows ```` ```mermaid ```` blocks almost entirely in **diagram-source** files (`.mermaid.md`, `diagram-src/*.md`) and READMEs — **not** in the main `lecture.md`. Most lectures embed **pre-rendered PNGs** (now data URIs via 2b). So `hasMermaid` will usually return `false` for real lectures; the mermaid bundle is "ready but seldom triggered." **Tests must use a synthetic `md` fixture with a ` ```mermaid ` fence.**
- **Version mismatch:** the template's CDN tag says `mermaid@10.9.0`, but `package.json` has `mermaid ^11.0.0`. When vendoring, pick **one** consistent version and note it. The runtime uses `mermaid.run({nodes})` (v10+/v11 compatible).
- **File-size impact is expected and acceptable** (D2/D4): `mermaid.min.js` is ~2–3 MB; inlining it makes a mermaid lecture's HTML large. That is the offline trade-off this project explicitly chose.
- **highlight.js auto-detects languages** from the bundle; no per-language registration needed for these lectures.
- The "zero **external** URLs" Definition-of-Done lives at Phase 5/9 and includes lecture *content* URLs (e.g. `img.shields.io` badges in some lectures — `inlineImages` correctly skips those). **2c's gate is narrower:** zero *lib-CDN* (`cdnjs`/`jsdelivr`) URLs.

### Decision to confirm with the user BEFORE coding

- **How to source the browser bundles** — the npm `highlight.js`/`mermaid` packages don't reliably ship a browser-ready `.min.js` (they're CJS/ESM module trees), and you'd hit Node↔browser module issues. Options:
  - **(a) Vendor prebuilt UMD into `scripts/lib/vendor/`** (recommended) — download once from the matching CDN versions, commit the 4 files; `bundleLibs` reads them. Deterministic, no bundler, no runtime module resolution.
  - **(b) Read + adapt from `node_modules`** — risk: no browser-ready min; you'd need to hand-assemble or accept CJS-in-browser breakage.
  - **(c) Introduce a bundler** (esbuild/rollup) — new build dep + step; heaviest.
  - **Recommend (a).** Ask the user; also confirm the mermaid version to pin (10.9.0 vs 11.x).

## RULES

- **ESM** (`"type":"module"`), **kebab-case**, **one commit per phase**, `git mv` only (never `rm`), archive-never-delete (losers → `archive/reorg-2026-06/`). Vendored files under `scripts/lib/vendor/` are *new* additions (commit normally).
- **Stay in scope:** do NOT wire the full `build.js` CLI or `check.js` linter (Phase 3), and do NOT build the Express `/export` route (Phase 4). 2c only touches the core (`scripts/lib/`).
- **At the end:** update [`plans/progress.md`](../progress.md) (Phase 2c → ✅, append Session 7, ▶ RESUME HERE → Phase 3), commit code + vendored libs together, docs separately.
- Report + **STOP before Phase 3** — the user reviews between phases.

## DONE WHEN

- [ ] `bundleLibs({mermaid})` + `hasMermaid(md)` added in `scripts/lib/bundle-libs.mjs`; vendored browser bundles committed under `scripts/lib/vendor/`.
- [ ] `renderPresentation(slides,{title,bundle})` injects inlined libs (offline theme toggle) and emits no CDN tags when `bundle` is provided; `buildLecture` computes + passes the bundle. Both exported from `index.mjs`.
- [ ] `scripts/test/bundle-libs.test.js` added; existing 2a `template.test.js` still green (backward-compat path); `npm test` green (27 + new).
- [ ] Manual build of a **non-mermaid** lecture (e.g. `git-github`) AND a synthetic **mermaid** fixture → both have **zero** `cdnjs`/`jsdelivr` URLs (grep); the mermaid bundle string appears only in the mermaid one; hljs bundle present in both.
- [ ] [`plans/progress.md`](../progress.md) updated; code+vendor committed, docs committed separately.
