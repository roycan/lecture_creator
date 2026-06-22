// scripts/lib/index.mjs
//
// Shared core barrel — single import surface for the CLI build (scripts/build.js),
// the integrity linter (scripts/check.js), and the Express /export route
// (server/). Keeping one import path means there is never a second copy of the
// export logic (context.md §3 / D5).
//
// Phase 2a: splitSlides + renderPresentation.
// Phase 2b: inlineImages + buildLecture orchestrator (split -> inline -> render).
// Phase 2c: bundleLibs + hasMermaid plug into buildLecture (inline highlight.js
// always + mermaid only when used), so exports are fully offline.
// Phase 3: scanMissingImages — read-only missing-image collector for the CLI
// integrity linter (scripts/check.js) and build's --all error reporting.
// Phase 4: listSlugs — read-only lecture enumerator shared by the CLI
// (scripts/build.js --all) and the Express editor (server/routes/), so both
// read the same lectures/ tree (D5 single source of truth).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { splitSlides } from './split-slides.mjs';
import { renderPresentation } from './template.mjs';
import { inlineImages, scanMissingImages, extractImageRefs } from './inline-images.mjs';
import { bundleLibs, hasMermaid } from './bundle-libs.mjs';
import {
  renderDiagramSourcesSync,
  scanDiagramSrc,
  resolveCollisions,
} from './render-diagram.mjs';

export { splitSlides } from './split-slides.mjs';
export { renderPresentation } from './template.mjs';
export { inlineImages, scanMissingImages, extractImageRefs } from './inline-images.mjs';
export { bundleLibs, hasMermaid } from './bundle-libs.mjs';
// Phase 2: pre-build diagram rendering (shared with the diagram CLI). Re-exported
// so callers can import everything from the barrel (D5 single source of truth).
export {
  renderDiagramSourcesSync,
  scanDiagramSrc,
  resolveCollisions,
} from './render-diagram.mjs';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);

function defaultLectureDir(slug) {
  return path.join(REPO_ROOT, 'lectures', slug);
}

/**
 * Sorted list of lecture slugs (the subdirectory names of lectures/).
 * Shared by the CLI --all pass and the Express editor's lecture list (D5).
 *
 * @param {{ lecturesDir?: string }} [opts] - defaults to <repo>/lectures;
 *   tests/the editor point this at a specific tree.
 * @returns {string[]} Sorted slug names; [] if lectures/ is absent.
 */
export function listSlugs({
  lecturesDir = path.join(REPO_ROOT, 'lectures'),
} = {}) {
  let entries;
  try {
    entries = fs.readdirSync(lecturesDir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

// Pull a presentation <title> from the first H1/H2 in the deck (strip inner
// markup). Returns '' if none found so renderPresentation() can fall back.
function extractTitle(slides) {
  for (const slide of slides) {
    const html = slide && slide.html;
    if (!html) continue;
    const m = html.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/i);
    if (m) return m[1].replace(/<[^>]+>/g, '').trim();
  }
  return '';
}

/**
 * Build one lecture end-to-end: read lecture.md -> splitSlides -> inlineImages
 * -> renderPresentation. Phase 3's build.js calls this per slug; Phase 4's
 * /export route calls it for the editor preview/export.
 *
 * @param {{ slug?: string, lectureDir?: string, splitDepth?: number,
 *   title?: string, markdown?: string, onMissing?: 'throw' | 'warn' }} opts -
 *   Either `slug` (resolved to <repo>/lectures/<slug>) or an explicit
 *   `lectureDir` is required. `markdown` overrides reading lecture.md.
 * @returns {string} Complete, self-contained HTML document.
 */
export function buildLecture({
  slug,
  lectureDir,
  splitDepth = 2,
  title,
  markdown,
  onMissing = 'throw',
} = {}) {
  const dir = lectureDir || (slug ? defaultLectureDir(slug) : null);
  if (!dir) {
    throw new Error('buildLecture: provide either "slug" or "lectureDir"');
  }

  // Read the lecture markdown ONCE (either the override or lecture.md) so we
  // can both extract referenced image paths (Phase 6) and feed splitSlides().
  const md = markdown ?? fs.readFileSync(path.join(dir, 'lecture.md'), 'utf8');

  // Phase 6: classify each diagram source's output PNG as REFERENCED or
  // UNREFERENCED against this markdown. A REFERENCED image that fails to render
  // with no PNG on disk still hard-fails (decision 7: never ship a broken
  // deck). An UNREFERENCED source (WIP/legacy/orphan whose mirrored PNG path no
  // slide uses) that fails to render now WARNS and lets the build proceed using
  // whatever PNGs already exist — so a flaky Kroki or a half-finished diagram
  // can't abort a whole lecture (e.g. ajax-fetch/dom, whose nested diagramSrc/
  // mirrors to PNG paths the slides don't reference).
  const referencedPaths = extractImageRefs(md);

  // Phase 2: render diagram sources (lectures/<slug>/diagramSrc/**) to PNGs
  // BEFORE inlineImages() so the PNGs exist on disk when images are inlined.
  // buildLecture() is synchronous (the Express /export route hands its return
  // value straight to res.send), so this uses the sync render path: a lecture
  // with NO diagramSrc/ is a clean no-op (returns null → zero Kroki, zero
  // subprocess — byte-for-byte identical to pre-Phase-2). On a hard render
  // failure of a REFERENCED image (no PNG at all) it throws; in draft/preview
  // mode (onMissing:'warn') we downgrade that to a warning so the editor
  // preview never hard-crashes, while the strict ship-build (onMissing:'throw')
  // fails loud (decision 4: never ship a broken deck).
  try {
    renderDiagramSourcesSync(dir, { referencedPaths });
  } catch (err) {
    if (onMissing === 'warn') {
      console.warn(`buildLecture: diagram rendering skipped — ${err.message}`);
    } else {
      throw err;
    }
  }

  const slides = splitSlides(md, { splitDepth });
  const inlined = inlineImages(slides, { lectureDir: dir, onMissing });
  // Phase 2c: bundle highlight.js always + mermaid only when the lecture uses a
  // ```mermaid fence (decision D4). Inlining here makes the export fully offline.
  const bundle = bundleLibs({ mermaid: hasMermaid(md) });
  return renderPresentation(inlined, {
    title: title || extractTitle(slides),
    bundle,
  });
}

export default buildLecture;
