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

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { splitSlides } from './split-slides.mjs';
import { renderPresentation } from './template.mjs';
import { inlineImages } from './inline-images.mjs';
import { bundleLibs, hasMermaid } from './bundle-libs.mjs';

export { splitSlides } from './split-slides.mjs';
export { renderPresentation } from './template.mjs';
export { inlineImages } from './inline-images.mjs';
export { bundleLibs, hasMermaid } from './bundle-libs.mjs';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);

function defaultLectureDir(slug) {
  return path.join(REPO_ROOT, 'lectures', slug);
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

  const md = markdown ?? fs.readFileSync(path.join(dir, 'lecture.md'), 'utf8');
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
