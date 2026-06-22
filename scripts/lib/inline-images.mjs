// scripts/lib/inline-images.mjs
//
// Shared core — inlines every relative <img src> in each slide's HTML as a
// base64 data URI, read from the owning lecture folder. Absolute URLs
// (http(s)://), protocol-relative (//) and existing data: URIs are left
// untouched. This is the offline embedding step (decision D2) that runs AFTER
// splitSlides() and BEFORE renderPresentation().
//
// Missing-image policy (Option A, confirmed 2026-06-13):
//   onMissing='throw' (default) -> raise a loud Error naming the slide index,
//     the resolved absolute path, and the original src. Used by buildLecture()
//     + tests + the future CI gate (Phase 3 check.js).
//   onMissing='warn' -> console.warn with the same detail and leave the
//     original <img src> untouched (a broken img). For the Phase 4 editor
//     live-preview, where a teacher may reference an image not yet added.
//
// scanMissingImages(slides, { lectureDir }) (Phase 3): the read-only
// collection twin of inlineImages() — same <img src> discovery, skip rule and
// path resolution, but it neither inlines nor throws. Returns one record per
// referenced local file that does NOT exist, so check.js can report EVERY miss
// in a lecture instead of stopping at the first. Existence-only: a present
// file with an unsupported extension is not "missing" (inlineImages flags that
// loudly at build time).
//
// MIME is derived from the file extension (one consistent base64 path, incl.
// SVG). An unknown/unsupported extension throws a clear Error so a bad ref is
// never silently mis-typed. Only the `src` attribute is mutated; attribute
// order within the <img> tag is irrelevant.

import fs from 'node:fs';
import path from 'node:path';

const MIME_BY_EXT = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

// src values we never rewrite: http://, https://, // (protocol-relative), data:.
const SKIP_SRC = /^(?:https?:)?\/\//i;
const DATA_SRC = /^data:/i;

function isSkippable(src) {
  return !src || SKIP_SRC.test(src) || DATA_SRC.test(src);
}

// A whole <img ...> tag (self-closing or not). We then target only the src
// attribute *inside* it, so attribute order is irrelevant and only src changes.
const IMG_TAG_RE = /<img\b[^>]*>/gi;
// Inside an <img> tag: group(1) = leading whitespace or start-of-string so we
// match only a real `src` attribute (never `data-src` / `x-src`, whose hyphen
// is a word boundary that `\bsrc` alone would wrongly match); group(2) = `src`
// + `=` + any whitespace; then the value as "..."(4), '...'(5), or unquoted(6).
const SRC_ATTR_RE = /(^|\s)(src\s*=\s*)("([^"]*)"|'([^']*)'|([^\s>]+))/i;

// Markdown image syntax: ![alt](url) with an optional title ![alt](url "t").
// Group 1 = the URL (stops at the first ")" or whitespace-before-title). `g` is
// required for matchAll(). Kept here next to the <img> regexes so all image-ref
// discovery lives in ONE module (single source of truth).
const MD_IMAGE_RE = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

/**
 * Inline relative image srcs as base64 data URIs.
 *
 * @param {{ html: string }[]} slides - output of splitSlides(); each item is
 *   `{ html }` where html is the rendered slide markup.
 * @param {{ lectureDir: string, onMissing?: 'throw' | 'warn' }} opts -
 *   `lectureDir` (required): the owning lecture folder; relative refs resolve
 *   here. `onMissing` (default 'throw'): what to do when a referenced file
 *   does not exist.
 * @returns {{ html: string }[]} A NEW slide array with data-URI srcs
 *   (non-destructive; the input slides are not mutated).
 */
export function inlineImages(slides, { lectureDir, onMissing = 'throw' } = {}) {
  if (!lectureDir) {
    throw new Error('inlineImages: required option "lectureDir" is missing');
  }

  const input = Array.isArray(slides) ? slides : [];
  const cache = new Map(); // resolvedPath -> dataUri (only successes are cached)

  return input.map((slide, slideIndex) => {
    const html = slide && typeof slide.html === 'string' ? slide.html : '';
    if (!html) return { html };

    const next = html.replace(IMG_TAG_RE, (tag) =>
      tag.replace(SRC_ATTR_RE, (m, lead, prefix, _tok, dq, sq, unq) => {
        const value = dq ?? sq ?? unq ?? '';
        if (isSkippable(value)) return m; // absolute / data: / empty -> untouched

        const resolved = path.resolve(lectureDir, value);
        let dataUri = cache.get(resolved);

        if (dataUri === undefined) {
          if (!fs.existsSync(resolved)) {
            const detail = `inlineImages: missing image in slide ${slideIndex}: ${resolved} (src: "${value}")`;
            if (onMissing === 'throw') throw new Error(detail);
            // 'warn' (and any other value): warn + keep the original src. Do
            // not cache, so the same missing file warns per-occurrence (each
            // with its own slide index) rather than once.
            console.warn(detail);
            return m;
          }

          const ext = path.extname(resolved).toLowerCase();
          const mime = MIME_BY_EXT[ext];
          if (!mime) {
            throw new Error(
              `inlineImages: unsupported image extension "${ext || '(none)'}" in slide ${slideIndex}: ${resolved}`,
            );
          }

          dataUri = `data:${mime};base64,${fs.readFileSync(resolved).toString('base64')}`;
          cache.set(resolved, dataUri);
        }

        // Preserve the original quote style; normalize unquoted -> double.
        const quote = sq !== undefined ? "'" : '"';
        return `${lead}${prefix}${quote}${dataUri}${quote}`;
      }),
    );

    return { html: next };
  });
}

/**
 * Scan slides for missing local image refs (read-only integrity check).
 *
 * The collection twin of inlineImages(): same <img src> discovery, same skip
 * rule (absolute / protocol-relative / data: / empty), same path resolution —
 * but it neither inlines nor throws. It returns one record per referenced
 * local file that does NOT exist on disk, so a caller (Phase 3 check.js) can
 * report EVERY miss in a lecture instead of stopping at the first.
 *
 * Existence-only by design: a present file with an unsupported extension is
 * not "missing" — inlineImages handles that as a separate, loud error at build
 * time. scanMissingImages reports only files that cannot be found.
 *
 * @param {{ html: string }[]} slides - output of splitSlides().
 * @param {{ lectureDir: string }} opts - `lectureDir` (required): the owning
 *   lecture folder; relative refs resolve here.
 * @returns {{ slideIndex: number, resolvedPath: string, src: string }[]} One
 *   entry per missing local image ref, in document order.
 */
export function scanMissingImages(slides, { lectureDir } = {}) {
  if (!lectureDir) {
    throw new Error('scanMissingImages: required option "lectureDir" is missing');
  }

  const input = Array.isArray(slides) ? slides : [];
  const missing = [];

  input.forEach((slide, slideIndex) => {
    const html = slide && typeof slide.html === 'string' ? slide.html : '';
    if (!html) return;

    // IMG_TAG_RE carries the `g` flag (stateful lastIndex); reset per slide.
    IMG_TAG_RE.lastIndex = 0;
    let m;
    while ((m = IMG_TAG_RE.exec(html)) !== null) {
      const sm = m[0].match(SRC_ATTR_RE);
      if (!sm) continue; // <img> with no src — not a ref we track
      const value = sm[4] ?? sm[5] ?? sm[6] ?? '';
      if (isSkippable(value)) continue; // absolute / data: / empty -> not local

      const resolved = path.resolve(lectureDir, value);
      if (fs.existsSync(resolved)) continue; // present -> fine

      missing.push({ slideIndex, resolvedPath: resolved, src: value });
    }
  });

  return missing;
}

/** Normalize a local image ref to web form: backslashes → "/", strip "./". */
function toWebPath(value) {
  return value.replace(/\\/g, '/').replace(/^\.\//, '');
}

/**
 * Extract every LOCAL image reference path from a markdown string — both
 * Markdown image syntax `![alt](path)` and HTML `<img src="path">`. Absolute
 * (http(s)://), protocol-relative (//) and data: URIs are skipped using the
 * SAME rule as inlineImages()/scanMissingImages(), so this is the single source
 * of truth for "what images does this deck reference".
 *
 * Returned paths are normalized to web form (forward slashes, a leading "./"
 * stripped) — exactly as they appear under the lecture dir — so they can be
 * compared against a diagram's relative output PNG path (deriveOutputPath).
 *
 * Used by buildLecture()'s pre-build render step to classify each diagram
 * output as REFERENCED vs UNREFERENCED: a render failure on an UNREFERENCED
 * (WIP/legacy/orphan) source warns + continues instead of aborting the build
 * (Phase 6), while a REFERENCED failure still hard-fails (decision 7).
 *
 * @param {string} markdown - Raw lecture markdown.
 * @returns {Set<string>} Unique normalized local image paths (web form).
 */
export function extractImageRefs(markdown) {
  const refs = new Set();
  const text = typeof markdown === 'string' ? markdown : '';

  // Markdown image syntax ![alt](path) / ![alt](path "title").
  for (const m of text.matchAll(MD_IMAGE_RE)) {
    const value = (m[1] || '').trim();
    if (isSkippable(value)) continue;
    refs.add(toWebPath(value));
  }

  // HTML <img src="path"> — reuse the SAME regexes as inlineImages so the
  // discovery rule never diverges. IMG_TAG_RE carries a stateful lastIndex
  // (shared, module-level); reset it before scanning this string.
  IMG_TAG_RE.lastIndex = 0;
  let tag;
  while ((tag = IMG_TAG_RE.exec(text)) !== null) {
    const sm = tag[0].match(SRC_ATTR_RE);
    if (!sm) continue; // <img> with no src
    const value = sm[4] ?? sm[5] ?? sm[6] ?? '';
    if (isSkippable(value)) continue;
    refs.add(toWebPath(value));
  }

  return refs;
}

export default inlineImages;
