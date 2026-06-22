// scripts/diagram.js — CLI renderer for diagram source files (Phase 1)
//
// Thin wrapper over scripts/lib/render-diagram.mjs (renderDiagramFile). Mirrors
// scripts/build.js argv style: a main(argv, opts) that returns an exit code,
// and a bottom guard that runs it only when invoked directly (so the tests can
// import main() without spawning a process).
//
//   npm run diagram -- <file>                       render one source file
//   npm run diagram -- <dir>                        render ALL supported files under <dir>
//   npm run diagram -- <file> --engine <name>       override the detected engine
//   npm run diagram -- <file> --force               re-render even if the PNG is fresh
//
// Prints a clear summary: each file rendered/skipped/stale, the markdown ref
// lines to paste into lecture.md, and any warnings. Exits non-zero on a hard
// failure (decision 7: never ship a broken deck silently).

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  renderDiagramFile,
  resolveFallbackChain,
  resolveKrokiBase,
  SUPPORTED_EXTENSIONS,
} from './lib/render-diagram.mjs';

// scripts/diagram.js lives ONE level under the repo root (scripts/), so a single
// '..' reaches it — same as scripts/build.js.
const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

const SUPPORTED_SET = new Set(SUPPORTED_EXTENSIONS);

/** True if a filename has a supported diagram source extension. */
function isSupported(name) {
  const ext = path.extname(name).toLowerCase();
  return SUPPORTED_SET.has(ext);
}

/**
 * Walk a directory recursively and return every supported diagram source file,
 * sorted for deterministic output. Files only; skips node_modules/ and dist/.
 *
 * @param {string} dir - Directory to walk.
 * @returns {Promise<string[]>} Absolute, sorted source paths.
 */
async function walkSources(dir) {
  const out = [];
  async function recurse(d) {
    let entries;
    try {
      entries = await fsp.readdir(d, { withFileTypes: true });
    } catch (err) {
      throw new Error(`cannot read directory ${d}: ${err.message}`);
    }
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) {
        if (e.name === 'node_modules' || e.name === 'dist') continue;
        await recurse(full);
      } else if (e.isFile() && isSupported(e.name)) {
        out.push(full);
      }
    }
  }
  await recurse(dir);
  return out.sort();
}

/**
 * Infer a source's lecture directory: the nearest ancestor whose name is
 * "diagramSrc" (its parent is the lecture), else the nearest ancestor that is a
 * direct child of lectures/. Falls back to the input's own directory. Works for
 * both file and directory inputs (e.g. the diagramSrc/ folder itself).
 *
 * @param {string} p - Source file or directory path.
 * @param {string} lecturesDir - Absolute path to lectures/.
 * @returns {string} Absolute lecture directory.
 */
function inferLectureDir(p, lecturesDir) {
  const abs = path.resolve(p);
  const lecturesAbs = path.resolve(lecturesDir);

  if (path.basename(abs) === 'diagramSrc') return path.dirname(abs);

  let cur = path.dirname(abs);
  let guard = 0;
  while (cur && cur !== path.dirname(cur) && guard++ < 40) {
    if (path.basename(cur) === 'diagramSrc') return path.dirname(cur);
    if (path.dirname(cur) === lecturesAbs) return cur;
    cur = path.dirname(cur);
  }
  return path.dirname(abs);
}

function usage() {
  return [
    'Usage: npm run diagram -- <file-or-dir> [options]',
    '',
    'Render diagram source files (.puml/.d2/.dot/.mmd/...) to PNG via Kroki.',
    '',
    'Multi-format fallback (default): when several sources map to one PNG stem',
    '(e.g. if-else.{mmd,puml}), the PRIMARY (.mmd) renders first; only if it',
    'FAILS does the pipeline fall through to the next format (.puml → .d2 →',
    '.dot/.gv → others). This mirrors the build, so `npm run diagram` and the',
    'build behave identically.',
    '',
    'Arguments:',
    '  <file>      Render one source file → <lecture>/diagrams/<...>.png',
    '  <dir>       Render ALL supported source files under <dir> (recursive)',
    '',
    'Options:',
    '  --engine <name>     Override the engine detected from the extension',
    '  --force             Re-render even if the PNG is newer than the source',
    '  --all-formats       Render EVERY format of each diagram (no fallback / no',
    '                      dedupe). Debugging aid — produces one PNG per source,',
    '                      later sources overwriting the same stem.',
    '  --kroki-base <url>  Kroki base URL (default: https://kroki.io / $KROKI_BASE_URL)',
    '  --lectures-dir <p>  Path to lectures/ (default: <repo>/lectures)',
    '',
    'Environment:',
    '  KROKI_BASE_URL      Override the Kroki base URL',
    '',
    'Examples:',
    '  npm run diagram -- lectures/js-basics/diagramSrc/js-basics/if-else.puml',
    '  npm run diagram -- lectures/js-basics/diagramSrc',
    '  npm run diagram -- lectures/js-basics/diagramSrc/js-basics/if-else.puml --engine plantuml --force',
  ].join('\n');
}

/** Print "diagram: <msg>" + usage to stderr; return exit code 1. */
function usageErr(msg) {
  console.error(`diagram: ${msg}\n`);
  console.error(usage());
  return 1;
}

/**
 * CLI entry. Parses argv and dispatches. Returns the process exit code; does NOT
 * call process.exit itself (the module-bottom guard does), matching build.js.
 *
 * @param {string[]} argv - Typically process.argv.slice(2).
 * @param {{ lecturesDir?: string }} [opts] - Tests point this at a fixture tree.
 * @returns {Promise<number>} 0 success, 1 usage/failure.
 */
export async function main(argv, { lecturesDir = path.join(REPO_ROOT, 'lectures') } = {}) {
  const positional = [];
  let engineOverride = null;
  let force = false;
  let allFormats = false;
  let krokiBase = null;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--engine') {
      engineOverride = argv[++i];
      if (!engineOverride) return usageErr('--engine requires a value.');
    } else if (a === '--force') {
      force = true;
    } else if (a === '--all-formats' || a === '--allFormats') {
      allFormats = true;
    } else if (a === '--kroki-base' || a === '--krokiBase') {
      krokiBase = argv[++i];
      if (!krokiBase) return usageErr('--kroki-base requires a value.');
    } else if (a === '--lectures-dir' || a === '--lecturesDir') {
      lecturesDir = argv[++i];
      if (!lecturesDir) return usageErr('--lectures-dir requires a value.');
    } else if (a.startsWith('-')) {
      return usageErr(`unknown option: ${a}`);
    } else {
      positional.push(a);
    }
  }

  if (!positional.length) {
    return usageErr('no input file or directory given.');
  }

  // Expand each positional target into { src, lectureDir } render jobs.
  const targets = [];
  for (const target of positional) {
    const abs = path.resolve(target);
    const st = await fsp.stat(abs).catch(() => null);
    if (!st) {
      console.error(`diagram: not found: ${target}`);
      return 1;
    }
    const lectureDir = inferLectureDir(abs, lecturesDir);
    if (st.isDirectory()) {
      const files = await walkSources(abs);
      for (const f of files) targets.push({ src: f, lectureDir });
    } else {
      targets.push({ src: abs, lectureDir });
    }
  }

  if (!targets.length) {
    console.error('diagram: no supported diagram source files found.');
    console.error(`  (Supported extensions: ${SUPPORTED_EXTENSIONS.join(', ')})`);
    return 1;
  }

  // Group targets per lecture so the fallback chain is resolved within one
  // lecture's output namespace (diagramSrc/<rel> → diagrams/<rel>.png).
  const byLecture = new Map();
  for (const { src, lectureDir } of targets) {
    if (!byLecture.has(lectureDir)) byLecture.set(lectureDir, []);
    byLecture.get(lectureDir).push(src);
  }

  // `--all-formats` (debugging): render EVERY source independently, no dedupe,
  // no fallback. Each renders to the same stem, so later ones overwrite — the
  // point is to exercise every format against Kroki.
  if (allFormats) {
    const allJobs = [];
    for (const [ldir, srcs] of byLecture) {
      for (const src of srcs) allJobs.push({ src, lectureDir: ldir });
    }
    const base = resolveKrokiBase(krokiBase);
    console.log(
      `diagram: --all-formats — rendering every format (${allJobs.length} ` +
        `source(s)) using Kroki at ${base}.`,
    );
    return runRenderLoop(allJobs, {
      force,
      krokiBase: base,
      engineOverride,
      fallback: false,
    });
  }

  // Default: render the PRIMARY of each fallback chain; on FAILURE fall through
  // to the next format (.mmd → .puml → .d2 → .dot/.gv → others). This MIRRORS
  // the build (renderDiagramSourcesSync) so `npm run diagram` and the build
  // behave identically. One chain per unique output PNG stem.
  const chainJobs = [];
  let primaryCount = 0;
  for (const [ldir, srcs] of byLecture) {
    const { jobs } = resolveFallbackChain(srcs, ldir);
    for (const j of jobs) {
      primaryCount += 1;
      chainJobs.push({ lectureDir: ldir, chain: j.chain, pngPath: j.pngPath });
    }
  }

  const base = resolveKrokiBase(krokiBase);
  const fallbackSources = chainJobs.reduce(
    (n, j) => n + Math.max(0, j.chain.length - 1),
    0,
  );
  console.log(
    `diagram: using Kroki at ${base} (${primaryCount} diagram${
      primaryCount === 1 ? '' : 's'
    }${
      fallbackSources
        ? `, ${fallbackSources} fallback format${fallbackSources === 1 ? '' : 's'} available`
        : ''
    })`,
  );
  return runRenderLoop(chainJobs, {
    force,
    krokiBase: base,
    engineOverride,
    fallback: true,
  });
}

/**
 * Shared render+report loop for the default (fallback) and --all-formats paths.
 * Each job is either `{ src, lectureDir }` (all-formats: single source) or
 * `{ lectureDir, chain, pngPath }` (fallback: ordered chain to walk). Returns
 * the process exit code (1 if any render failed, else 0).
 *
 * @param {object[]} jobs
 * @param {{ force: boolean, krokiBase: string, engineOverride: string|null,
 *   fallback: boolean }} opts
 * @returns {Promise<number>}
 */
async function runRenderLoop(jobs, { force, krokiBase, engineOverride, fallback }) {
  let rendered = 0;
  let skipped = 0;
  let stale = 0;
  let failed = 0;
  const refLines = [];
  const rel = (p) => path.relative(REPO_ROOT, p) || p;

  for (const job of jobs) {
    // Build the attempt list for this job: either the single source (--all-formats
    // or a job with no chain) or the ordered fallback chain (default mode).
    const attemptList = fallback && job.chain
      ? job.chain.map((c) => ({ src: c.src, engine: c.engine }))
      : [{ src: job.src, engine: null }];

    let done = false;
    let lastErr = null;
    for (let i = 0; i < attemptList.length; i++) {
      const { src, engine } = attemptList[i];
      try {
        const res = await renderDiagramFile(src, {
          lectureDir: job.lectureDir,
          krokiBase,
          force,
          scale: 2,
          engine: engineOverride || engine || undefined,
        });
        if (res.stale) {
          stale++;
          console.warn(`  ⚠ stale   ${rel(src)}  (kept existing PNG)`);
        } else if (res.skipped) {
          skipped++;
          console.log(`  ✓ skip    ${rel(src)}  (PNG is up to date)`);
        } else {
          rendered++;
          console.log(`  ✓ render  ${rel(src)}`);
        }
        refLines.push(res.markdownRef);
        done = true;
        break; // success (or kept-stale) → stop the fallback chain
      } catch (err) {
        lastErr = err;
        if (fallback && i < attemptList.length - 1) {
          const next = attemptList[i + 1];
          console.warn(
            `  ⚠ ${rel(src)} failed — falling back to ${rel(next.src)}.`,
          );
        }
      }
    }
    if (!done) {
      failed++;
      const head = rel(attemptList[0].src);
      console.error(`  ✗ FAILED  ${head} — ${lastErr ? lastErr.message : '(no detail)'}`);
    }
  }

  console.log(
    `\ndiagram: ${rendered} rendered, ${skipped} skipped, ${stale} stale, ` +
      `${failed} failed (of ${jobs.length}).`,
  );
  if (refLines.length) {
    console.log('\nMarkdown ref lines to paste into lecture.md:');
    for (const line of refLines) console.log(`  ${line}`);
  }
  return failed ? 1 : 0;
}

// Run only when invoked directly (not when imported by tests).
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const code = await main(process.argv.slice(2));
  process.exit(code);
}
