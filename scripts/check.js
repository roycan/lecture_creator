// scripts/check.js — integrity linter (Phase 3)
//
// CI gate (context.md §5): scans EVERY lectures/<slug>/, splits its
// lecture.md, and reports every local image ref (![]() → <img src>) whose file
// is missing on disk. Exits NON-ZERO on any miss (Phase 3 decision A — an
// honest linter; the known-broken lectures are fixed in Phase 7a/7b).
//
// Thin wrapper over the shared core: it reuses splitSlides() +
// scanMissingImages() (the read-only collector) — it never re-implements the
// pipeline (D5). scanLecture()/checkAll()/main are exported for the test suite.
//
// TODO(Phase 5+): extend to "Try-It" asset links (anchors to practice HTML in
// assets/ / shared/challenges). Phase 3 scopes to <img src> image refs only.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { splitSlides, scanMissingImages } from './lib/index.mjs';

// scripts/build.js + scripts/check.js live ONE level under the repo root
// (scripts/), so a single '..' reaches it — unlike scripts/lib/*.mjs which are
// two levels deep and need two.
const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const LECTURES_DIR = path.join(REPO_ROOT, 'lectures');

/**
 * Sorted list of lecture slugs (the subdirectory names of lectures/).
 *
 * @param {{ lecturesDir?: string }} [opts]
 * @returns {string[]} Sorted slug names; [] if lectures/ is absent.
 */
export function listSlugs({ lecturesDir = LECTURES_DIR } = {}) {
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

/**
 * Scan one lecture for missing local image refs.
 *
 * @param {string} slug
 * @param {{ lecturesDir?: string, splitDepth?: number }} [opts]
 * @returns {{ slug: string, ok: boolean, missing: { slug: string,
 *   slideIndex: number, resolvedPath: string, src: string }[] }}
 */
export function scanLecture(slug, { lecturesDir = LECTURES_DIR, splitDepth = 2 } = {}) {
  const lectureDir = path.join(lecturesDir, slug);
  const md = fs.readFileSync(path.join(lectureDir, 'lecture.md'), 'utf8');
  const slides = splitSlides(md, { splitDepth });
  const missing = scanMissingImages(slides, { lectureDir }).map((m) => ({
    ...m,
    slug,
  }));
  return { slug, ok: missing.length === 0, missing };
}

/**
 * Scan every lecture.
 *
 * @param {{ lecturesDir?: string }} [opts]
 * @returns {{ results: ReturnType<typeof scanLecture>[], totalMisses: number }}
 */
export function checkAll({ lecturesDir = LECTURES_DIR } = {}) {
  const results = listSlugs({ lecturesDir }).map((slug) =>
    scanLecture(slug, { lecturesDir }),
  );
  const totalMisses = results.reduce((n, r) => n + r.missing.length, 0);
  return { results, totalMisses };
}

/** Format the aggregate report to a readable, structured string. */
function formatReport({ results, totalMisses }) {
  const lines = [
    `check: scanned ${results.length} lecture(s), ${totalMisses} missing image ref(s).`,
  ];
  if (totalMisses === 0) {
    lines.push('check: clean — no missing local image refs.');
    return lines.join('\n');
  }
  for (const r of results) {
    if (r.ok) continue;
    lines.push(`  ✗ ${r.slug} — ${r.missing.length} miss(es):`);
    for (const m of r.missing) {
      lines.push(`      slide ${m.slideIndex}: ${m.src}  →  ${m.resolvedPath}`);
    }
  }
  return lines.join('\n');
}

/**
 * CLI entry. Returns the process exit code (0 clean, 1 any miss). The optional
 * `lecturesDir` lets the test suite point at a fixture tree.
 *
 * @param {{ lecturesDir?: string }} [opts]
 * @returns {number}
 */
export function main({ lecturesDir = LECTURES_DIR } = {}) {
  const { results, totalMisses } = checkAll({ lecturesDir });
  if (!results.length) {
    console.error('check: no lectures found in lectures/');
    return 1;
  }
  if (totalMisses === 0) {
    console.log(formatReport({ results, totalMisses }));
  } else {
    console.error(formatReport({ results, totalMisses }));
  }
  return totalMisses === 0 ? 0 : 1;
}

// Run only when invoked directly (not when imported by tests).
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main());
}
