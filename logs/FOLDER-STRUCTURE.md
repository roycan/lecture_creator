# Folder Structure

> Reference map of the `lecture_creator` repo **after the restructure** (Phase 6 onward).
> Pair with [`LECTURE-CREATION-PATTERN.md`](LECTURE-CREATION-PATTERN.md) (how a lecture is built) and
> [`../README.md`](../README.md) (quick start). Authoritative design + rationale:
> [`../inceptions/context.md`](../inceptions/context.md).

**Last updated:** 2026-06-14 · **Layout version:** post-restructure (`lectures/<slug>/` + `server/` + `scripts/lib/`)

---

## 1. The big picture

The repo is split into three concerns:

| Concern | Where | Edited by |
|---|---|---|
| **Lecture content** (the only thing you author) | [`lectures/<slug>/`](../lectures) | the teacher |
| **The tool** (turns content into self-contained HTML) | [`server/`](../server) + [`scripts/`](../scripts) | rarely — it's done |
| **Cross-lecture shared assets** | [`shared/`](../shared) | the teacher |

Everything else is generated output ([`dist/`](../dist)), historical preservation
([`archive/`](../archive)), or documentation ([`inceptions/`](../inceptions) / [`plans/`](../plans) / [`logs/`](.)).

```
lecture_creator/
├── package.json                # deps + npm scripts (start / build / check / test)
├── .gitignore                  # ignores node_modules/ and dist/
├── CHANGELOG.md
├── README.md                   # project front door (quick start)
│
├── lectures/                   # SOURCE — one portable folder per lecture
│   └── <slug>/
│       ├── lecture.md          #   the Markdown deck (the only required file)
│       ├── assets/             #   practice HTML/CSS/JSON, copy-on-build
│       ├── diagrams/           #   rendered PNGs (+ rendered diagram .md)
│       └── diagram-src/        #   .mmd/.d2/.puml/.dot diagram sources
│
├── server/                     # Express + EJS editor (author / preview / export)
│   ├── app.js                  #   createApp() factory + listen guard
│   ├── routes/                 #   editor.js, lectures.js, export.js
│   ├── views/                  #   editor.ejs (the editor page)
│   └── public/                 #   editor.js (browser client)
│
├── scripts/                    # CLI + shared core + tests + reorg tooling
│   ├── build.js                #   npm run build -- <slug> | --all  → dist/<slug>.html
│   ├── check.js                #   npm run check — integrity linter (ship gate)
│   ├── lib/                    #   SHARED CORE (CLI + server import this)
│   │   ├── index.mjs           #     barrel + buildLecture() orchestrator + listSlugs()
│   │   ├── split-slides.mjs    #     splitSlides()  (marked.lexer token split)
│   │   ├── inline-images.mjs   #     inlineImages() + scanMissingImages()
│   │   ├── bundle-libs.mjs     #     bundleLibs() + hasMermaid()
│   │   ├── template.mjs        #     renderPresentation() (the narrated deck shell)
│   │   └── vendor/             #     vendored highlight.js + mermaid UMD (offline)
│   ├── test/                   #   npm test — node --test (7 files, 68 tests)
│   └── reorg/                  #   one-time Phase-6 restructure mover (historical)
│
├── shared/                     # cross-lecture assets (copy-on-build)
│   ├── styles.css              #   canonical slide theme
│   ├── challenges/             #   starter/solution practice HTML pairs
│   └── README.md
│
├── dist/                       # GENERATED exports — gitignored (dist/<slug>.html)
├── archive/                    # superseded files — NEVER deleted (decision D13)
│   └── reorg-2026-06/          #   this restructure's archive (incl. original app.js + index.html)
│
├── inceptions/                 # project "second brain"
│   ├── context.md              #   single source of truth (identity, decisions D1–D15)
│   └── next-session-prompt.md
├── plans/                      # progress tracker + reorg inventory (excluded from index)
└── logs/                       # this folder — developer reference docs
    ├── FOLDER-STRUCTURE.md     #   ← you are here
    └── LECTURE-CREATION-PATTERN.md
```

---

## 2. `lectures/<slug>/` — the source (what you author)

Each lecture is a **self-contained portable folder**. Its folder name (the **slug**, kebab-case)
is its identity everywhere: the CLI slug, the output filename, and the editor's dropdown value.

```
lectures/git-github/
├── lecture.md          # REQUIRED — the Markdown deck
├── assets/             # practice files students download / Try-It links point at
│   └── git-github/     #   (often nested under a slug-named subfolder)
├── diagrams/           # rendered images referenced from lecture.md as diagrams/<name>.png
└── diagram-src/        # the .mmd/.puml/.d2/.dot sources those images came from
```

### Anatomy

| Path in `<slug>/` | Required? | Purpose |
|---|---|---|
| `lecture.md` | **Yes** | The deck. `#`/`##` headings become slide breaks (split depth 2). |
| `assets/` | No | Practice HTML/CSS/JSON. Linked from slides as `assets/<file>` (Try-It buttons). |
| `diagrams/` | No | Rendered images (PNG). Referenced as `diagrams/<name>.png`. |
| `diagram-src/` | No | Editable sources for those diagrams (`.mmd`/`.d2`/`.puml`/`.dot`). |

> **Image references are relative to the lecture folder** — write `![alt](diagrams/foo.png)`,
> never an absolute or `github.io` URL. The build inlines them as data URIs (see
> [`LECTURE-CREATION-PATTERN.md`](LECTURE-CREATION-PATTERN.md)).

### The 20 lectures currently in the repo

`ajax-fetch` · `api-testing` · `authentication-sessions` · `css` · `csv-datatables-qr` ·
`database-sqlite` · `dom` · `express-basics` · `full-stack` · `git-github` · `html` ·
`js-arrays-objects` · `js-basics` · `json-api-audit` · `localstorage` ·
`production-best-practices` · `pwa-basics` · `responsive-bulma` · `testing-quality` · `tmc-eval360`

To **add a new lecture**: create `lectures/<new-slug>/lecture.md` and (optionally) its
`assets/`/`diagrams/`. It shows up everywhere automatically — the slug is discovered, not
registered. See [`LECTURE-CREATION-PATTERN.md`](LECTURE-CREATION-PATTERN.md) §"Adding a new lecture".

---

## 3. `server/` — the Express + EJS editor

A localhost authoring tool (decision D3). Same-origin, so the preview `<iframe>` can render a
self-contained build with data-URI images and inlined libs — no `file://` CORS problem.

| File | Role |
|---|---|
| [`app.js`](../server/app.js) | `createApp({ lecturesDir })` factory + `npm start` listen guard. Mounts the routers; tests inject a temp `lecturesDir` for hermetic route tests (Phase 5). |
| [`routes/editor.js`](../server/routes/editor.js) | `GET /` — renders the editor page, listing all slugs. |
| [`routes/lectures.js`](../server/routes/lectures.js) | `GET /api/lectures` → `{ slugs }`; `GET /api/lectures/:slug` → `{ slug, markdown }`. |
| [`routes/export.js`](../server/routes/export.js) | `GET /preview/:slug`, `POST /preview` (markdown → built deck), `POST /export` (deck as a download attachment). |
| [`views/editor.ejs`](../server/views/editor.ejs) | The editor page: slug `<select>`, markdown `<textarea>`, preview `<iframe>`, Refresh + Export buttons. |
| [`public/editor.js`](../server/public/editor.js) | Browser client: load a lecture, refresh preview, export. |

> The editor and the CLI call the **same** [`buildLecture()`](../scripts/lib/index.mjs) — there is
> never a second copy of the export logic (decision D5). The only difference: editor builds use
> `onMissing: 'warn'` (a draft may lack an image), the CLI single-build uses `'throw'`.

---

## 4. `scripts/` — CLI, shared core, tests

### 4a. `scripts/lib/` — the shared core (single source of truth)

Both [`scripts/build.js`](../scripts/build.js) (CLI) and [`server/`](../server) import from this one
barrel, so the build pipeline exists in exactly one place.

| Module | Exports | Role in the pipeline |
|---|---|---|
| [`index.mjs`](../scripts/lib/index.mjs) | `buildLecture()`, `listSlugs()` | Orchestrator + lecture enumerator. `buildLecture` runs the whole pipeline. |
| [`split-slides.mjs`](../scripts/lib/split-slides.mjs) | `splitSlides()` | **Step 1** — split Markdown into slides via the `marked` token stream (`#`/`##` = new slide). |
| [`inline-images.mjs`](../scripts/lib/inline-images.mjs) | `inlineImages()`, `scanMissingImages()` | **Step 2** — rewrite each relative `<img src>` to a base64 **data URI**. |
| [`bundle-libs.mjs`](../scripts/lib/bundle-libs.mjs) | `bundleLibs()`, `hasMermaid()` | **Step 3** — inline highlight.js (always) + mermaid (only when used) from `vendor/`. |
| [`template.mjs`](../scripts/lib/template.mjs) | `renderPresentation()` | **Step 4** — wrap slides in the narrated deck shell (theme CSS + the player JS). |
| `vendor/` | `highlight.min.js`, `mermaid.min.js`, `github{,-dark}.min.css` | Vendored UMD copies so exports need no CDN (decision D4). See [`vendor/README.md`](../scripts/lib/vendor/README.md). |

The pipeline (see [`LECTURE-CREATION-PATTERN.md`](LECTURE-CREATION-PATTERN.md) for the full walkthrough):

```
lecture.md ─▶ splitSlides ─▶ inlineImages ─▶ bundleLibs ─▶ renderPresentation ─▶ one self-contained .html
                 (slide        (data-URI       (offline         (themed deck
                  breaks)        images)        libs)            + voice player)
```

### 4b. `scripts/build.js` + `scripts/check.js` — the CLI

| Script | Command | What it does |
|---|---|---|
| [`build.js`](../scripts/build.js) | `npm run build -- <slug>` | Build one lecture → `dist/<slug>.html`. Fail-loud (`onMissing: 'throw'`). |
| [`build.js`](../scripts/build.js) | `npm run build:all` | Build every slug, isolating per-lecture failures. |
| [`check.js`](../scripts/check.js) | `npm run check` | Integrity linter — exits non-zero if **any** lecture has a missing local image ref. The strict ship gate. |

### 4c. `scripts/test/` — the test suite

`npm test` runs `node --test` across **7 files / 68 tests**:

- `scaffold.test.js` — app skeleton smoke.
- `split-slides.test.js` — slide-splitting (depth, edge cases).
- `template.test.js` — `renderPresentation` deck shell.
- `inline-images.test.js` — MIME handling, missing-image errors, `scanMissingImages`.
- `bundle-libs.test.js` — zero CDN URLs left after bundling.
- `cli.test.js` — `build` + `check` end-to-end on fixture lectures (incl. the zero-external-URL proof).
- `routes.test.js` — hermetic supertest route tests + real-repo read smokes (Phase 5).

### 4d. `scripts/reorg/` — historical (Phase 6 restructure)

The one-time non-destructive mover (`dry-run.mjs` + `move-manifest.mjs`) used to relocate everything
into `lectures/<slug>/`. Kept for the record; **not** part of the active build pipeline.

---

## 5. `shared/` — cross-lecture assets

Assets that more than one lecture uses, copied into a lecture's build rather than duplicated (decisions
D7/D8).

| Path | Purpose |
|---|---|
| [`styles.css`](../shared/styles.css) | Canonical slide theme (copied on build). |
| [`challenges/`](../shared/challenges) | Starter/solution practice-HTML pairs + school-website variants. |
| [`README.md`](../shared/README.md) | Notes on the shared assets. |

---

## 6. Generated, ignored & preserved locations

| Path | Status | Notes |
|---|---|---|
| [`dist/`](../dist) | **Generated, gitignored** | `npm run build` writes `dist/<slug>.html` here. Delete freely; rebuild anytime. |
| `node_modules/` | **Generated, gitignored** | From `npm install`. |
| [`archive/`](../archive) | **Preserved, committed** | Superseded files. **Never delete** — `git mv` here instead (D13). `archive/reorg-2026-06/` holds this restructure's retirees, including the original pre-port `app.js` + `index.html` and the superseded logs. |
| [`inceptions/`](../inceptions) | Docs | `context.md` = the project "second brain" (read first). |
| [`plans/`](../plans) | Docs | `progress.md` (where we are) + reorg inventory. |
| [`logs/`](.) | Docs | This folder — developer reference (`FOLDER-STRUCTURE`, `LECTURE-CREATION-PATTERN`). |

---

## 7. Root files

| File | Role |
|---|---|
| [`package.json`](../package.json) | Deps (express, ejs, marked, highlight.js, mermaid) + dev (supertest); npm scripts. ESM (`"type": "module"`), Node ≥ 20. |
| [`.gitignore`](../.gitignore) | Ignores `node_modules/` and `dist/`. |
| [`CHANGELOG.md`](../CHANGELOG.md) | Release history (decision D10 — stays at root). |
| [`README.md`](../README.md) | Project front door — quick start, scripts, architecture. |

> **No `.js`/`.html` at the repo root anymore.** The original single-file browser tool
> (`app.js` + `index.html`) was fully ported into [`server/`](../server) + [`scripts/lib/`](../scripts/lib)
> and the originals were archived to [`archive/reorg-2026-06/`](../archive/reorg-2026-06) (Phase 8).
