# Session prompt — Phase 2b (core: data-URI image inlining)

Paste this whole file into a new session to continue without context-window limits.
It tells the new session what to read, where we are, and exactly what to build next.

---

## BOOTSTRAP (do this first, in order)

1. Read **[`inceptions/context.md`](../../inceptions/context.md)** — the "second brain": identity (Grade-10 PH CS teacher), the problem, locked decisions **D1–D13** (§6), target architecture (§4), and conventions (§7).
2. Read **[`plans/progress.md`](../progress.md)** → find **"▶ RESUME HERE"** (it points to Phase 2b). Skim the Session Log (Sessions 1–5) to understand state.
3. Skim **[`plans/reorg-inventory.md`](../reorg-inventory.md)**: §0 (post-move corrections), §2 (broken image refs — **do NOT fix in 2b; that is Phase 7a**), §2b (truly-missing PNGs).
4. Read **[`plans/phase-2a-plan.md`](../phase-2a-plan.md)** and the existing core: [`scripts/lib/split-slides.mjs`](../../scripts/lib/split-slides.mjs), [`scripts/lib/template.mjs`](../../scripts/lib/template.mjs), [`scripts/lib/index.mjs`](../../scripts/lib/index.mjs) — you are **extending** this.
5. Verify on-disk state: `git status` should be clean on branch **`reorg`**; `npm test` → **14 pass, 0 fail**.

## CURRENT STATE (where we are)

- Branch `reorg`. Phases **0, 1, 6, 2a done**. All 20 lectures live in `lectures/<slug>/` (each = `lecture.md` + `assets/` + `diagrams/` + `diagram-src/`).
- The shared core exists: `splitSlides(md, {splitDepth})` and `renderPresentation(slides, {title})`, barrel-exported from `scripts/lib/index.mjs`.
- `npm test` green: 14 tests (scaffold 1 + split-slides 7 + template 6).
- Recent commits: `0c42dc0` (2a docs), `193c0ae` (2a core), `ca6198d` (6 docs), then the restructure commits `8f7854d / 77d3e09 / 993c9f1 / 3ca4327`.
- **Decision already locked (don't relitigate):** slide split depth = **2** — `#`/`##` start slides, `###`/`####` stay inside as content. `splitSlides` already supports `{ splitDepth }`. Validated: css 21 / database-sqlite 18 / express-basics 24 / html 17 slides.

## PHASE 2b GOAL

Make exports **offline-capable**: inline every relative `<img src>` in a slide as a **data URI**, read from the owning lecture folder. Absolute URLs (`http(s)://`, `//`, `data:`) are left untouched. This is the D2 decision (data-URI embedding > alt-hosting).

### Deliverables

1. **`scripts/lib/inline-images.mjs`** → `export function inlineImages(slides, { lectureDir })` returns `[{ html }]` with data-URI `src`s.
   - MIME by extension: `.png`→`image/png`, `.jpg`/`.jpeg`→`image/jpeg`, `.gif`→`image/gif`, `.webp`→`image/webp`, `.svg`→`image/svg+xml`. Unknown ext → clear error.
   - Resolve each relative `src` against `lectureDir`; `readFileSync`, base64 via `Buffer`, emit `data:${mime};base64,${b64}`. (SVG may alternatively use `data:image/svg+xml;utf8,` — pick base64 for one consistent path.)
   - **Skip** any `src` starting with `http://`, `https://`, `//`, or `data:`.
   - **Missing file** → throw a clear `Error` naming the **slide index** + the resolved path (Phase 3's `check.js` is the CI gate; 2b surfaces problems loudly).
   - Be robust to `<img ... >` attribute order; only mutate `src`.
2. **Orchestration** → add `buildLecture({ slug, lectureDir, splitDepth=2, title })` (or `buildSlides(md, { lectureDir })`) in `scripts/lib/index.mjs` composing `splitSlides → inlineImages → renderPresentation`. Phase 3's `build.js` will call this.
3. **Export** `inlineImages` (+ `buildLecture`) from `scripts/lib/index.mjs`.
4. **Tests** → `scripts/test/inline-images.test.js`: MIME detection; relative→data URI; skip absolute/data; missing-file throws with slide+path; SVG handled; a built slide set has **zero** relative `<img src>` left (round-trip grep). Keep `npm test` green.

### Non-obvious facts (so you don't re-discover them)

- **marked v15 API** (already used in `split-slides.mjs`): `marked.lexer(md)` → tokens with `.depth` and an attached `.links`; `marked.parser(tokens)` re-renders a token bucket; copy `tokens.links` onto each bucket.
- Slides are `{ html }` objects. The runtime player loads them from `<script id="slides-data" type="application/json">`. **Inlining mutates each `.html` string BEFORE `renderPresentation`.**
- Image refs in lectures are **relative to the lecture folder** (`diagrams/foo.png`, `assets/bar.png`, `diagrams/html/01-doc.mmd`, etc.).
- **Do NOT fix the 3 known image typos** (`promise-state`→`promise-states`, `datables`→`datatables`, `assets/full-stack.png`→`diagrams/...`) — that is **Phase 7a**. 2b just reads whatever path exists and errors clearly if missing.
- 36 unreferenced orphans sit in `assets/`; they don't affect inlining. Truly-missing PNGs (testing-quality ×6, responsive-bulma ×4, express-basics ×1, production-best-practices ×2 — inventory §2b) will surface as clear errors in 2b; **expected and non-blocking** (rendered in 7b).
- The Phase 2a output still references CDNs (highlight.js/mermaid) — that bundling is **Phase 2c**, not 2b. The "zero external URLs" acceptance gate is Phase 5/9.

### Decision to confirm with the user BEFORE coding

- **Missing-image handling**: (a) hard-fail the whole build, (b) fail just that lecture but build the rest and print a summary, or (c) warn + leave a broken `<img>`. **Recommend (b)** for the CLI and (c) for the editor preview. Ask the user.

## RULES

- **ESM** (`"type":"module"`), **kebab-case**, **one commit per phase**, `git mv` only (never `rm`), archive-never-delete (losers → `archive/reorg-2026-06/`).
- **Stay in scope:** do NOT start bundling (2c) or wire `build.js`/`check.js` (Phase 3).
- **At the end:** update [`plans/progress.md`](../progress.md) (Phase 2b → ✅, append Session 6, ▶ RESUME HERE → Phase 2c), commit docs separately.
- Report + **STOP before Phase 2c** — the user reviews between phases.

## DONE WHEN

- [ ] `inlineImages` (+ orchestrator) added in `scripts/lib/`, exported from `index.mjs`.
- [ ] `scripts/test/inline-images.test.js` added; `npm test` green.
- [ ] Manual build of one lecture (e.g. `css`) → a `dist/` file with **zero** relative `<img src>` (grep verifies); images open offline.
- [ ] [`plans/progress.md`](../progress.md) updated; docs committed separately.
