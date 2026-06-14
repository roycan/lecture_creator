# Lecture Creation Pattern

> How a lecture goes from `lecture.md` to a self-contained, narrated `.html` file students open
> offline. Pair with [`FOLDER-STRUCTURE.md`](FOLDER-STRUCTURE.md) (where things live) and
> [`../README.md`](../README.md) (quick start). Design + rationale:
> [`../inceptions/context.md`](../inceptions/context.md).

**Last updated:** 2026-06-14

---

## 1. The round-trip at a glance

```
            author                              the tool                           deliver
 ┌─────────────────────┐   ┌───────────────────────────────────────────┐   ┌────────────────┐
 │ lectures/<slug>/    │   │ splitSlides → inlineImages → bundleLibs    │   │ dist/<slug>.html│
 │   lecture.md  ──────┼──▶│        → renderPresentation               │──▶│ (one file,      │
 │   assets/ diagrams/ │   │ = buildLecture()  (scripts/lib/index.mjs)  │   │  zero URLs)     │
 └─────────────────────┘   └───────────────────────────────────────────┘   └────────────────┘
        ▲                                            ▲                              │
        │ npm run check (gate: no missing images)    │ npm run build                │ share / USB
        └────────────────────────────────────────────┘                              ▼
                                  npm start (editor: preview ≡ export)        student double-clicks
```

There are **two ways** to drive the tool, both using the *same* core:

- **CLI** (`npm run build`) — fastest for "edit → build → ship one file".
- **Editor** (`npm start`) — a localhost page to author, live-preview, and export in the browser.

Both call [`buildLecture()`](../scripts/lib/index.mjs) — one source of truth (decision D5).

---

## 2. Authoring `lecture.md`

### Slide splitting (the one rule that matters most)

A **new slide** starts at every `#` (H1) or `##` (H2) heading. `###`/`####` headings stay **inside**
the current slide as sub-content. This is "split depth 2" — it yields presentable decks instead of
dozens of micro-slides.

```markdown
# Introduction            ← slide 1 starts
Welcome to the lecture!

## Main Topic             ← slide 2 starts
This whole section is slide 2.

### A sub-point           ← still slide 2 (not a new slide)
Bullet points, a code block, an image…

## Another Topic          ← slide 3 starts
```

### What Markdown you can use

| Feature | Notes |
|---|---|
| Headings `#`–`######` | `#`/`##` split slides; deeper headings are in-slide content. |
| **bold**, *italic*, `inline code` | Standard Markdown. |
| Lists (`-`, `1.`) | Standard. |
| Fenced code blocks | Add a language for syntax highlighting: <code>```js</code>, <code>```html</code>, <code>```python</code>… highlight.js is bundled in. |
| ```` ```mermaid ```` fence | Rendered as a diagram. **Mermaid is only bundled when a lecture uses it** (decision D4) — keeps files small. |
| Images `![alt](path)` | **Relative to the lecture folder.** See below. |
| Raw HTML | Allowed — useful for embedded forms/demos (see [`../lectures/localstorage/lecture.md`](../lectures/localstorage/lecture.md)). |

### Images — relative paths only

Reference images **relative to the lecture folder**, then let the build inline them:

```markdown
![Request/response flow](diagrams/web-server-basics/01-request-response-flow.png)
![A practice file](assets/mini-project-students/index.html)
```

- Use `diagrams/<name>.png` for rendered images, `assets/<name>` for practice files.
- **Never** use `https://…` or old `github.io` URLs for slide content — the offline guarantee
  depends on every image being a local file the build can read.
- The build rewrites each `<img src>` to a `data:image/…;base64,…` URI so the export has **no
  external image URLs** (decision D2).

### A minimal, real example

The smallest lecture in the repo is
[`../lectures/localstorage/lecture.md`](../lectures/localstorage/lecture.md) — just `lecture.md`,
no images. Its top looks like:

```markdown
# localStorage Lecture

> Roy Canseco

## User Interface
…HTML for a "Save a Note" form…

## loadNotes script
```js
function loadNotes() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}
```
```

---

## 3. The build pipeline — what `buildLecture()` does

[`buildLecture({ slug | lectureDir, … })`](../scripts/lib/index.mjs) runs four steps and returns
**one complete HTML string**:

| Step | Function | What it does |
|---|---|---|
| 1 | [`splitSlides()`](../scripts/lib/split-slides.mjs) | Parse Markdown with `marked.lexer`; cut into slides on `#`/`##`. |
| 2 | [`inlineImages()`](../scripts/lib/inline-images.mjs) | Replace each relative `<img src>` with a base64 **data URI** read from the lecture folder. |
| 3 | [`bundleLibs()`](../scripts/lib/bundle-libs.mjs) | Inline **highlight.js** (always) + **mermaid** (only if the deck has a ```` ```mermaid ```` fence) from [`vendor/`](../scripts/lib/vendor). |
| 4 | [`renderPresentation()`](../scripts/lib/template.mjs) | Wrap the slides in the themed deck shell: theme CSS, keyboard controls, and the text-to-speech **voice player**. |

The result is a **single, self-contained `.html`** file:

- ✅ Images are data URIs — no `https://` image fetches.
- ✅ highlight.js + mermaid are inlined — no CDN `<script>` tags.
- ✅ The voice player is built in — narration works offline.
- ➡️ Therefore: **zero external URLs**. The Phase-5/9 acceptance test asserts exactly this.

> The title is auto-extracted from the first `#`/`##` in the deck; you can also pass it explicitly.

### Missing-image handling: `throw` vs `warn`

[`inlineImages()`](../scripts/lib/inline-images.mjs) takes `onMissing`:

- `'throw'` (CLI default) — a missing image **fails the build** with a clear error naming the slide
  index + resolved path. This makes broken decks impossible to ship silently.
- `'warn'` (editor default) — logs the missing image and leaves the `<img src>` as-is, so the
  authoring loop tolerates drafts whose images don't exist yet.

[`npm run check`](#4-the-check-gate) is the strict, authoritative gate that runs the read-only
collector ([`scanMissingImages()`](../scripts/lib/inline-images.mjs)) across **all** lectures.

---

## 4. The `check` gate

```bash
npm run check
```

Scans every `lectures/<slug>/lecture.md`, splits it, and reports each local image reference whose
file is missing on disk. **Exits non-zero on any miss** — this is the strict ship gate (decision: an
honest linter). A clean run:

```
check: scanned 20 lecture(s), 0 missing image ref(s).
check: clean — no missing local image refs.
```

> **Ship rule:** `npm run check` must exit 0 before distributing any lecture. Run it after editing
> images or moving files.

---

## 5. Building with the CLI

```bash
npm run build -- git-github        # one lecture  → dist/git-github.html
npm run build:all                  # every lecture (per-lecture error isolation)
```

Single-slug builds are **fail-loud** (`onMissing: 'throw'`), so a broken ref stops the build. The
`--all` pass keeps that per-lecture strictness but isolates failures so one bad slug can't abort the
batch:

```
build: wrote dist/git-github.html (3697539 bytes)
…
build --all: 20 ok, 0 failed (of 20).
```

Output is written to **`dist/<slug>.html`** (gitignored — rebuild anytime).

---

## 6. The editor round-trip (`npm start`)

```bash
npm start      # → http://localhost:3000
```

The editor is an Express + EJS page (decision D3) that runs on `localhost` so it is **same-origin**
with the build — the preview `<iframe>` can show a fully self-contained deck (data-URI images,
inlined libs) with no `file://` CORS problem.

| UI element | Calls | Result |
|---|---|---|
| Lecture dropdown | `GET /api/lectures/:slug` | Loads that lecture's Markdown into the editor. |
| **Refresh** | `POST /preview` | Builds the current Markdown → sets `iframe.srcdoc`. **Preview ≡ export.** |
| **Export** | `POST /export` | Same build, returned as a download (`Content-Disposition: attachment`). |

Because preview and export use the **same** [`buildLecture()`](../scripts/lib/index.mjs) (with
`onMissing: 'warn'`), what you see in the iframe is exactly what students get — WYSIWYG (decision D14).

---

## 7. Adding a new lecture (step-by-step)

1. **Create the folder** — `mkdir lectures/<slug>` (kebab-case slug).
2. **Write the deck** — `lectures/<slug>/lecture.md` (start with a `#` title).
3. **Add assets/diagrams** if needed — `assets/`, `diagrams/`, `diagram-src/`. Reference images
   with **relative paths**.
4. **Check** — `npm run check` must be clean.
5. **Build** — `npm run build -- <slug>` → `dist/<slug>.html`.
6. **Ship** — copy `dist/<slug>.html` to students (USB, shared drive, LMS). They double-click it.

> Nothing is registered by hand — the slug is auto-discovered from the folder name, so it appears in
> `npm run build:all`, `npm run check`, and the editor dropdown immediately.

---

## 8. Conventions & gotchas

- **Slugs are kebab-case** (`ajax-fetch`, not `Ajax_Fetch`) — they're used as folder names, the CLI
  argument, and the output filename.
- **Relative image paths only.** No absolute, `https://`, or legacy `github.io` URLs for slide
  content. The build only inlines local files it can read.
- **`#`/`##` split slides; `###`+ stay inside.** If a deck feels like too few/many slides, rework
  the heading levels (`splitDepth` is configurable per-build but defaults to 2).
- **Don't hand-edit `dist/`.** It's generated and gitignored — regenerate with `npm run build`.
- **Voice/TTS is the deck player's job**, not the author's. Every export already has auto-play +
  manual modes, speed/pitch control, and graceful fallback when a platform has no speech voice.
- **Archive, never delete** (D13). Superseded files go to [`../archive/`](../archive).

---

## 9. Where to look in the code

| Want to… | Read |
|---|---|
| See the pipeline / orchestrator | [`scripts/lib/index.mjs`](../scripts/lib/index.mjs) (`buildLecture`) |
| Understand slide splitting | [`scripts/lib/split-slides.mjs`](../scripts/lib/split-slides.mjs) |
| Understand image inlining / missing-image errors | [`scripts/lib/inline-images.mjs`](../scripts/lib/inline-images.mjs) |
| Understand lib bundling (offline guarantee) | [`scripts/lib/bundle-libs.mjs`](../scripts/lib/bundle-libs.mjs) + [`vendor/`](../scripts/lib/vendor) |
| See the narrated deck shell | [`scripts/lib/template.mjs`](../scripts/lib/template.mjs) |
| See the CLI build / linter | [`scripts/build.js`](../scripts/build.js), [`scripts/check.js`](../scripts/check.js) |
| See the editor routes | [`server/routes/`](../server/routes) |
| Trust it's correct | [`scripts/test/`](../scripts/test) (`npm test`, 68 tests) |
