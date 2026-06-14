// scripts/build.js — CLI export builder (Phase 3)
//
// Thin wrapper over the shared core (scripts/lib — D5: one source of truth).
//   npm run build -- <slug>   build one lecture → dist/<slug>.html
//   npm run build:all         build every lecture (per-lecture error isolation)
//
// buildLecture() already does split → inline → bundle → render into one
// self-contained HTML string; this file only adds argv parsing + writing the
// file to dist/. The reusable bits (listSlugs, buildOne, main) are exported so
// the test suite can exercise them without spawning the process.
//
// Single-slug builds are FAIL-LOUD: buildLecture's default onMissing='throw'
// turns a missing image ref into a non-zero exit so a broken deck never ships
// silently (Phase 3 decision A). --all keeps that per-lecture strictness but
// isolates failures so one bad slug can't abort the batch.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { buildLecture } from './lib/index.mjs';

// scripts/build.js + scripts/check.js live ONE level under the repo root
// (scripts/), so a single '..' reaches it — unlike scripts/lib/*.mjs which are
// two levels deep and need two.
const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const DEFAULT_DIST = path.join(REPO_ROOT, 'dist');
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
 * Build one lecture and write dist/<slug>.html.
 *
 * @param {string} slug
 * @param {{ distDir?: string, lecturesDir?: string, onMissing?: 'throw' | 'warn' }} [opts] -
 *   `distDir` (default <repo>/dist), `lecturesDir` (default <repo>/lectures;
 *   tests point this at a fixture tree), `onMissing` defaults to 'throw'
 *   (fail-loud single builds, decision A).
 * @returns {{ slug: string, file: string, bytes: number }}
 * @throws {Error} if buildLecture fails (e.g. a missing image ref with 'throw').
 */
export function buildOne(
  slug,
  { distDir = DEFAULT_DIST, lecturesDir = LECTURES_DIR, onMissing = 'throw' } = {},
) {
  // Resolve via lectureDir (not slug) so tests can point at a fixture tree;
  // the default lecturesDir resolves identically to buildLecture's slug path.
  const lectureDir = path.join(lecturesDir, slug);
  const html = buildLecture({ lectureDir, onMissing });
  fs.mkdirSync(distDir, { recursive: true });
  const file = path.join(distDir, `${slug}.html`);
  fs.writeFileSync(file, html);
  return { slug, file, bytes: Buffer.byteLength(html) };
}

function usage() {
  return [
    'Usage: npm run build -- <slug>    build one lecture → dist/<slug>.html',
    '       npm run build:all          build every lecture (isolated failures)',
    '',
    'Options:',
    '  --slug <slug>   explicit slug (a bare positional slug also works)',
    '  --all           build every lectures/<slug>/',
  ].join('\n');
}

/**
 * Build every slug with per-lecture error isolation. Prints progress and a
 * summary; returns the exit code (1 if any lecture failed).
 *
 * @param {{ lecturesDir?: string, distDir?: string }} [opts]
 * @returns {number}
 */
function buildAll({ lecturesDir = LECTURES_DIR, distDir = DEFAULT_DIST } = {}) {
  const slugs = listSlugs({ lecturesDir });
  if (!slugs.length) {
    console.error('build --all: no lectures found in lectures/');
    return 1;
  }
  const built = [];
  const failed = [];
  for (const slug of slugs) {
    try {
      const res = buildOne(slug, { distDir, lecturesDir });
      built.push(res);
      console.log(
        `build: wrote ${path.relative(REPO_ROOT, res.file)} (${res.bytes} bytes)`,
      );
    } catch (err) {
      failed.push({ slug, message: err.message });
      console.error(`build: ${slug} FAILED — ${err.message}`);
    }
  }
  console.log(
    `build --all: ${built.length} ok, ${failed.length} failed (of ${slugs.length}).`,
  );
  if (failed.length) {
    console.error('  failed: ' + failed.map((f) => f.slug).join(', '));
  }
  return failed.length ? 1 : 0;
}

/**
 * CLI entry. Parses argv and dispatches. Returns the process exit code; does
 * NOT call process.exit itself (the module-bottom guard does). The optional
 * `opts` lets tests point at a fixture tree / temp dist without clobbering.
 *
 * @param {string[]} argv - typically process.argv.slice(2)
 * @param {{ lecturesDir?: string, distDir?: string }} [opts]
 * @returns {Promise<number>} exit code (0 success, 1 usage/failure)
 */
export async function main(argv, { lecturesDir = LECTURES_DIR, distDir = DEFAULT_DIST } = {}) {
  const wantsAll = argv.includes('--all');
  const positional = argv.filter((a) => !a.startsWith('-'));
  // Prefer an explicit `--slug <slug>`, else the first bare positional arg.
  let slug;
  const slugIdx = argv.indexOf('--slug');
  if (slugIdx !== -1 && argv[slugIdx + 1]) {
    slug = argv[slugIdx + 1];
  } else if (positional.length) {
    slug = positional[0];
  }

  if (wantsAll) return buildAll({ lecturesDir, distDir });

  if (slug) {
    try {
      const { file, bytes } = buildOne(slug, { distDir, lecturesDir });
      console.log(
        `build: wrote ${path.relative(REPO_ROOT, file)} (${bytes} bytes)`,
      );
      return 0;
    } catch (err) {
      console.error(`build: ${slug} FAILED — ${err.message}`);
      return 1;
    }
  }

  console.error(usage());
  return 1;
}

// Run only when invoked directly (not when imported by tests).
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const code = await main(process.argv.slice(2));
  process.exit(code);
}
