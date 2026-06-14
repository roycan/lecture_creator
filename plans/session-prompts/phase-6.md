We are continuing the "lecture_creator" restructure project. This session implements
PHASE 6 only — the big structural restructure into per-lecture folders.

BOOTSTRAP — do this first, before any action:
1. Read inceptions/context.md   (project "second brain": identity, problem, locked decisions D1–D13, target architecture §4, conventions §7)
2. Read plans/progress.md        (find the "▶ RESUME HERE" pointer — it should point to Phase 6 — and the phase table)
3. Read plans/reorg-inventory.md CAREFULLY, especially:
     §1 (Lecture → Owned Assets Map — THIS IS THE SOURCE OF TRUTH for every move)
     §4 (Shared Assets → shared/)
     §5 (Orphan Candidates)
     §6 (Duplicates / Misplacements)
   Then confirm on-disk state: `git status` (must be clean), `git log --oneline -5`, and skim the current
   `web-lectures/`, `assets/`, `diagrams/`, `diagram-src/` listings.

CURRENT STATE (as of end of Phase 1):
- Branch: `reorg`. Recent commits (oldest→newest):
    2dd3f84 ref: pivot to using local pictures
    ed6488d docs: add planning second-brain docs
    b7be196 chore: archive stray temp/summary/test files (Phase 0)
    f0fbf90 feat: scaffold node/express app skeleton (Phase 1)
- Phase 0 done (15 strays archived in archive/reorg-2026-06/).
- Phase 1 done: Node/Express ESM scaffold exists — `package.json` (type:module),
  `server/app.js` (bootable stub), `scripts/{build,check}.js` (stubs), `scripts/test/`,
  empty `shared/`, empty `lectures/` (+ .gitkeep). `npm install` already run; node_modules gitignored.
- The OLD browser tool still lives at repo root: `app.js`, `index.html`, `style.css` (port to Express in Phase 4 — leave for now).

CONTEXT IN ONE PARAGRAPH:
A public-high-school CS teacher (Grade 10, Philippines) builds narrated Markdown→HTML lecture
slides. GitHub Pages hotlinking died and the repo is disorganized. We are doing a FULL RESTRUCTURE
into per-lecture folders (`lectures/<slug>/` each with `lecture.md` + `assets/` + `diagrams/` +
`diagram-src/`) plus a Node/Express+EJS app that exports fully-offline single-file presentations.
Phases 0–1 are done. THIS SESSION is the structural move (Phase 6) — physically relocate every
lecture and its owned assets into the new layout. Do NOT build/fix logic here.

===========================================================================
PHASE 6 SCOPE — relocate everything into the target layout via `git mv`.
===========================================================================

This phase is STRUCTURAL ONLY: move files into the right folders, preserving history and all
existing references. Do not rewrite markdown, do not fix broken image links (that is Phase 7a),
do not render missing PNGs (Phase 7b). Just move.

STEP A — BUILD A DRY-RUN MOVER (non-destructive), commit it.
  - Create `scripts/reorg/move-manifest.mjs` (or .js): a DECLARATIVE map built from inventory §1.
    For each slug, list its source `lecture.md` plus the source dirs/files for its `assets/`,
    `diagrams/`, `diagram-src/`. Structure suggestion:
        { slug, md: '<src>', diagrams: [...], assets: [...], diagramSrc: [...] }
  - Create `scripts/reorg/dry-run.mjs`: reads the manifest, resolves every source → destination
    under `lectures/<slug>/`, prints a reviewable table, AND for each lecture scans its `lecture.md`
    for `![](...)` + Try-It/`<a href>` asset refs and WARNS about any referenced file NOT covered
    by the manifest (catches misses). It must `--apply` to actually perform `git mv`s; default
    (no flag) only prints + validates.
  - Run it in dry-run mode. Do NOT apply yet. Commit the scripts ("feat(reorg): dry-run mover + manifest (Phase 6)").

STEP B — REVIEW THE PLAN WITH ME before moving anything. Surface and get my decision on these
known ambiguities (do not guess):
  1. `styles.css` canonical: there is `style.css` at root AND `assets/styles.css` referenced by
     `dom` + `ajax-fetch`. Which is canonical for `shared/styles.css` (D7)? Reconcile/dedup.
  2. tmc-eval360 de-dup (D12): `web-lectures/tmc-eval360.md` vs `web-lectures/tmc-eval360/tmc-eval360.md`
     — pick ONE canonical, verify where its 8 PNGs actually live, archive the other copy.
  3. `advanced-features-migration-guide.md` (root stray) → target lecture? It shares
     `diagrams/advanced-features/` with both `csv-datatables-qr` and `json-api-audit`. Which folder?
  4. Shared starters/solutions (D8): which set is canonical for `shared/challenges/`
     (`dashboard-*`, `store-catalog-*`, `barangay-clearance-*`, `contact-form-*`, `school-website-*`)?
  5. Inventory §5 orphans: archive, assign, or leave? (non-blocking — list them, let me decide.)
  6. Commit strategy: one big commit for the whole restructure, or one commit per lecture/batch?
     (Recommend grouped batches, e.g. one commit per logical group.)

STEP C — EXECUTE the moves via the mover's `--apply` (every move is a `git mv`) in the batches we
agreed. Target layout per inventory §1 + context §4. Lectures to create (≈20 slugs; derive the
FULL asset map from inventory §1, do not rely only on this list):
  html, css, responsive-bulma, js-basics, js-arrays-objects, dom, ajax-fetch, express-basics,
  database-sqlite, authentication-sessions, csv-datatables-qr, json-api-audit, testing-quality,
  git-github, production-best-practices, pwa-basics, full-stack, api-testing, localstorage, tmc-eval360.

SPECIAL MOVES (in addition to the per-lecture asset moves):
  - D7  root `style.css` → `shared/styles.css` (after resolving ambiguity #1).
  - D8  shared starters/solutions → `shared/challenges/` (after resolving #4).
  - D9  CSS lecture PNGs `assets/css-*.png` (7) → `lectures/css/diagrams/` (they wrongly live in assets/).
  - D12 tmc-eval360: keep ONE canonical copy in `lectures/tmc-eval360/`; archive the duplicate.
  - Relocate (do NOT archive) the 3 stray root .md (inventory §6 ⚠️):
        database-sqlite-lecture.md               → lectures/database-sqlite/lecture.md
        authentication-sessions-migration-guide.md → lectures/authentication-sessions/
        advanced-features-migration-guide.md      → (per decision #3)

DO NOT (these belong to other phases):
  - Do NOT fix broken image refs / typos (promise-state→promise-states, datables, full-stack.png) — Phase 7a.
  - Do NOT render or fabricate missing PNGs — Phase 7b.
  - Do NOT port the browser tool / build the editor — Phase 4.
  - Do NOT touch `archive/` (already settled) or `README.md`/`CHANGELOG.md` (root, Phase 8).
  - Do NOT `rm`/delete anything — duplicate/loser files go to `archive/reorg-2026-06/` via `git mv`.

RULES:
  - `git mv` for EVERY move (preserve history). Never `rm`/delete — archive only (D13).
  - DRY-RUN FIRST. Get my sign-off on the full plan + the 6 ambiguities before any `--apply`.
  - Agree the commit strategy with me first; one commit per logical batch.
  - After the moves: run `npm run check` (must list all the lecture slugs), `npm test` (must stay green),
    and the mover's verification pass (every source moved; no unexpected orphans).
  - At the end: update `plans/progress.md` (Phase 6 → ✅, session log, ▶ RESUME HERE → Phase 2a) and
    note any inventory discoveries/corrections in `plans/reorg-inventory.md`. Commit docs separately.

DONE WHEN:
  - `lectures/` contains one folder per slug (≈20), each with `lecture.md` (+ `assets/`/`diagrams/`/
    `diagram-src/` as applicable per inventory §1).
  - `shared/styles.css` exists (canonical; root `style.css` reconciled); `shared/challenges/` holds
    the shared starters/solutions.
  - tmc-eval360 de-duped to ONE canonical copy; its PNGs verified and in place.
  - The 3 stray root `.md` files relocated (not archived); `assets/css-*.png` now under `lectures/css/diagrams/`.
  - `scripts/reorg/{move-manifest,dry-run}.mjs` committed; its verification reports all sources moved.
  - `npm run check` lists every slug; `npm test` green; `git status` clean after the final commit.
  - `plans/progress.md` updated: Phase 6 → ✅, session log appended, "▶ RESUME HERE" → Phase 2a.
  - Report the move summary (counts per slug) + commit hashes, then STOP (do not start Phase 2a — I review between phases).
