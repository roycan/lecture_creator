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
  resolveCollisions,
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
    'Arguments:',
    '  <file>      Render one source file → <lecture>/diagrams/<...>.png',
    '  <dir>       Render ALL supported source files under <dir> (recursive)',
    '',
    'Options:',
    '  --engine <name>     Override the engine detected from the extension',
    '  --force             Re-render even if the PNG is newer than the source',
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
  let krokiBase = null;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--engine') {
      engineOverride = argv[++i];
      if (!engineOverride) return usageErr('--engine requires a value.');
    } else if (a === '--force') {
      force = true;
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

  // Resolve multi-format collisions per lecture (orchestrator decision 2):
  // when several sources map to the same output PNG (e.g. if-else.{mmd,dot,puml})
  // pick ONE by priority (.mmd > .puml > .d2 > .dot/.gv > others) and warn
  // loudly — render the winner only, NEVER delete a loser. Shared with
  // buildLecture() via render-diagram.mjs so the CLI and the build agree.
  const byLecture = new Map();
  for (const { src, lectureDir } of targets) {
    if (!byLecture.has(lectureDir)) byLecture.set(lectureDir, []);
    byLecture.get(lectureDir).push(src);
  }
  const renderJobs = [];
  for (const [ldir, srcs] of byLecture) {
    const { jobs, warnings } = resolveCollisions(srcs, ldir);
    for (const w of warnings) console.warn(w);
    for (const j of jobs) renderJobs.push({ src: j.src, lectureDir: ldir });
  }

  const dupes = targets.length - renderJobs.length;
  const base = resolveKrokiBase(krokiBase);
  console.log(
    `diagram: using Kroki at ${base} (${renderJobs.length} diagram${
      renderJobs.length === 1 ? '' : 's'
    }${dupes ? `, ${dupes} duplicate format${dupes === 1 ? '' : 's'} skipped` : ''})`,
  );

  let rendered = 0;
  let skipped = 0;
  let stale = 0;
  let failed = 0;
  const refLines = [];

  for (const { src, lectureDir } of renderJobs) {
    const rel = path.relative(REPO_ROOT, src) || src;
    try {
      const res = await renderDiagramFile(src, {
        lectureDir,
        krokiBase: base,
        force,
        scale: 2,
        engine: engineOverride || undefined,
      });
      if (res.stale) {
        stale++;
        console.warn(`  ⚠ stale   ${rel}  (kept existing PNG)`);
      } else if (res.skipped) {
        skipped++;
        console.log(`  ✓ skip    ${rel}  (PNG is up to date)`);
      } else {
        rendered++;
        console.log(`  ✓ render  ${rel}`);
      }
      refLines.push(res.markdownRef);
    } catch (err) {
      failed++;
      console.error(`  ✗ FAILED  ${rel} — ${err.message}`);
    }
  }

  console.log(
    `\ndiagram: ${rendered} rendered, ${skipped} skipped, ${stale} stale, ` +
      `${failed} failed (of ${renderJobs.length}).`,
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
