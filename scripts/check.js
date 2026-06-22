// scripts/check.js — integrity linter (Phase 3 + Phase 3 diagram gate)
//
// CI gate (context.md §5): scans EVERY lectures/<slug>/, splits its
// lecture.md, and reports every local image ref (![]() → <img src>) whose file
// is missing on disk. Exits NON-ZERO on any miss (Phase 3 decision A — an
// honest linter; the known-broken lectures are fixed in Phase 7a/7b).
//
// Diagram gate (Phase 3, on top of render-diagram.mjs): when a lecture has a
// diagramSrc/ folder, two checks run — reusing scanDiagramSrc() so there is
// ONE source of truth for "which sources win, and what PNG they produce":
//
//   ERROR   broken diagram ref — a ref under diagrams/... whose mirrored PNG is
//           absent AND there is NO matching diagramSrc source (any supported
//           ext) at the mirrored path. The build would ship a broken slide.
//           (A ref whose PNG is missing but that HAS a source is NOT broken —
//           buildLecture renders it automatically.)
//   WARNING stale render — a winning source's PNG exists but is OLDER than
//           ANY same-stem source (a source changed, not re-rendered). The
//           build re-renders it; this is an informational lint.
//
// Multi-format sources are a FIRST-CLASS FALLBACK feature now (render-fallback):
// they no longer produce a collision warning. Several formats of one diagram
// (.mmd + .puml + .dot) are intentional fallbacks the build tries in priority
// order on render failure — so they are NOT a problem to flag here.
//
// Unsupported-extension files in diagramSrc (.txt/.md design notes, etc.) are
// IGNORED — they are neither sources nor flagged. A lecture with NO diagramSrc
// is untouched by these checks (no regression vs. the plain image gate).
//
// Thin wrapper over the shared core: it reuses splitSlides() +
// scanMissingImages() (the read-only collector) and scanDiagramSrc() (the
// read-only diagram scan) — it never re-implements the pipeline (D5).
// scanLecture()/checkAll()/main are exported for the test suite.
//
// TODO(Phase 5+): extend to "Try-It" asset links (anchors to practice HTML in
// assets/ / shared/challenges). Phase 3 scopes to <img src> image refs only.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { splitSlides, scanMissingImages } from './lib/index.mjs';
// Single source of truth for diagram discovery + collision policy. We only need
// the read-only scan here (it returns the winning jobs + collision warnings);
// the per-file render helpers stay in render-diagram.mjs.
import { scanDiagramSrc } from './lib/render-diagram.mjs';

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

/** True when `resolvedPath` is inside (or equal to) `baseDir`. Pure path math,
 *  so a missing diagrams/ folder still classifies a `diagrams/x.png` ref. */
function isUnder(resolvedPath, baseDir) {
  const rel = path.relative(baseDir, resolvedPath);
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}

/**
 * Scan one lecture for missing local image refs PLUS diagram integrity.
 *
 * Broken refs (missing image files) drive `ok` and the exit code:
 *   - any non-diagram missing ref is broken (unchanged Phase 3 behavior).
 *   - a diagram ref (under diagrams/...) that is missing BUT has a matching
 *     diagramSrc source is NOT broken (the build renders it) — so it is dropped.
 *   - a diagram ref that is missing AND has no matching source IS broken.
 *
 * Diagram warnings (collisions + stale renders) are collected but never affect
 * `ok`/exit. They are empty for a lecture with no diagramSrc/ (a clean no-op).
 *
 * @param {string} slug
 * @param {{ lecturesDir?: string, splitDepth?: number }} [opts]
 * @returns {{ slug: string, ok: boolean, missing: { slug: string,
 *   slideIndex: number, resolvedPath: string, src: string,
 *   diagram?: true }[], diagrams: { hasDiagramSrc: boolean, sources: number,
 *   collisions: string[], stale: { src: string, pngPath: string, srcRel: string,
 *   pngRel: string }[] } }}
 */
export function scanLecture(slug, { lecturesDir = LECTURES_DIR, splitDepth = 2 } = {}) {
  const lectureDir = path.join(lecturesDir, slug);
  const md = fs.readFileSync(path.join(lectureDir, 'lecture.md'), 'utf8');
  const slides = splitSlides(md, { splitDepth });
  const diagramsDir = path.join(lectureDir, 'diagrams');

  // Read-only diagram scan: returns {jobs, warnings} when diagramSrc/ exists,
  // or null when it does not (the offline no-op: this lecture builds identically
  // to pre-diagram behavior). jobs[] each carry a `chain` (the ordered fallback
  // list — chain[0] is the primary) plus back-compat `src`/`engine` fields.
  // `warnings` is ALWAYS empty now: multi-format is a first-class fallback
  // feature (render-fallback), not a collision problem to flag.
  const diagramScan = scanDiagramSrc(lectureDir);

  // pngPath (abs) -> primary source (abs). A ref whose resolved path is in this
  // map has a source that renders it, so a missing PNG there is not broken.
  const pngToSource = new Map();
  if (diagramScan) {
    for (const job of diagramScan.jobs) pngToSource.set(job.pngPath, job.src);
  }

  // --- Broken refs (ERROR) ------------------------------------------------
  // scanMissingImages reports every referenced local file that does NOT exist.
  // We then refine the diagram refs: a diagram ref that is missing but has a
  // source is rescuable (the build renders it), so we drop it. Everything else
  // (non-diagram misses + diagram misses with no source) stays broken.
  const rawMissing = scanMissingImages(slides, { lectureDir });
  const missing = [];
  for (const m of rawMissing) {
    const isDiagram = isUnder(m.resolvedPath, diagramsDir);
    if (isDiagram && pngToSource.has(m.resolvedPath)) {
      continue; // missing PNG, but a source will render it → not broken
    }
    missing.push({ ...m, slug, ...(isDiagram ? { diagram: true } : {}) });
  }

  // --- Stale renders (WARNING) -------------------------------------------
  // Source-driven (not ref-driven): for each output PNG, if the PNG exists and
  // ANY same-stem source (primary OR a fallback) is NEWER than the PNG, the
  // render is out of date. This matches the build's mtime rule (decision 8: the
  // PNG is fresh iff it is at least as new as EVERY source in the chain — so
  // editing the .puml fallback correctly flags staleness). A PNG that does not
  // exist yet is skipped (it will render at build time — the first-build case,
  // not a stale warning). We attribute the stale flag to the NEWEST source so
  // the message points the teacher at the file they actually just edited.
  const rel = (p) => path.relative(lectureDir, p) || p;
  const stale = [];
  if (diagramScan) {
    for (const job of diagramScan.jobs) {
      const chain = job.chain || [{ src: job.src, engine: job.engine }];
      let pngStat;
      try {
        pngStat = fs.statSync(job.pngPath);
      } catch {
        continue; // PNG absent → first-build case, not a stale render
      }
      let newestSrc = null;
      let newestMtime = -Infinity;
      for (const c of chain) {
        try {
          const s = fs.statSync(c.src);
          if (s.mtimeMs > pngStat.mtimeMs && s.mtimeMs > newestMtime) {
            newestMtime = s.mtimeMs;
            newestSrc = c.src;
          }
        } catch {
          /* a missing source file is not a staleness signal */
        }
      }
      if (newestSrc) {
        stale.push({
          src: newestSrc,
          pngPath: job.pngPath,
          srcRel: rel(newestSrc),
          pngRel: rel(job.pngPath),
        });
      }
    }
  }

  return {
    slug,
    ok: missing.length === 0,
    missing,
    diagrams: {
      hasDiagramSrc: !!diagramScan,
      sources: diagramScan ? diagramScan.jobs.length : 0,
      // Retained for API back-compat; always [] now (multi-format is intentional).
      collisions: [],
      stale,
    },
  };
}

/**
 * Scan every lecture.
 *
 * @param {{ lecturesDir?: string }} [opts]
 * @returns {{ results: ReturnType<typeof scanLecture>[], totalMisses: number,
 *   totalWarnings: number }}
 */
export function checkAll({ lecturesDir = LECTURES_DIR } = {}) {
  const results = listSlugs({ lecturesDir }).map((slug) =>
    scanLecture(slug, { lecturesDir }),
  );
  const totalMisses = results.reduce((n, r) => n + r.missing.length, 0);
  const totalWarnings = results.reduce(
    (n, r) => n + r.diagrams.collisions.length + r.diagrams.stale.length,
    0,
  );
  return { results, totalMisses, totalWarnings };
}

/** Format the aggregate report to a readable, structured string: a one-line
 *  summary, then an ERRORS block (broken refs) and a WARNINGS block (stale
 *  renders). Multi-format sources are intentional fallbacks (render-fallback),
 *  not collisions, so they no longer appear here. Teacher-readable. */
function formatReport({ results, totalMisses, totalWarnings }) {
  const errNoun = totalMisses === 1 ? 'error' : 'errors';
  const warnNoun = totalWarnings === 1 ? 'warning' : 'warnings';
  const lines = [
    `check: scanned ${results.length} lecture(s) — ${totalMisses} ${errNoun}, ${totalWarnings} ${warnNoun}.`,
  ];

  if (totalMisses === 0 && totalWarnings === 0) {
    lines.push('check: clean — no broken refs and no diagram warnings.');
    return lines.join('\n');
  }

  // ERRORS — broken image/diagram refs (these slides would not build).
  if (totalMisses > 0) {
    lines.push('');
    lines.push('ERRORS (broken refs — these slides will not build):');
    for (const r of results) {
      if (r.ok) continue;
      lines.push(`  ✗ ${r.slug} — ${r.missing.length} broken ref(s):`);
      for (const m of r.missing) {
        if (m.diagram) {
          lines.push(
            `      slide ${m.slideIndex}: references ${m.src} — no diagram source or PNG found`,
          );
        } else {
          lines.push(`      slide ${m.slideIndex}: ${m.src}  →  ${m.resolvedPath}`);
        }
      }
    }
  }

  // WARNINGS — non-fatal (stale renders). Multi-format sources are intentional
  // fallbacks now, so they do NOT appear here (render-fallback feature).
  if (totalWarnings > 0) {
    lines.push('');
    lines.push(
      'WARNINGS (non-fatal — review; fix and re-run `npm run check`):',
    );
    for (const r of results) {
      const d = r.diagrams;
      if (d.stale.length === 0) continue;
      lines.push(`  ⚠ ${r.slug} — ${d.stale.length} stale diagram(s):`);
      for (const s of d.stale) {
        lines.push(
          `      stale: ${s.pngRel} is older than its source ${s.srcRel} ` +
            `(re-render with: npm run diagram)`,
        );
      }
    }
  }

  return lines.join('\n');
}

/**
 * CLI entry. Returns the process exit code (0 clean, 1 any broken ref).
 * Warnings (collisions / stale renders) are printed but NEVER fail the gate.
 * The optional `lecturesDir` lets the test suite point at a fixture tree.
 *
 * @param {{ lecturesDir?: string }} [opts]
 * @returns {number}
 */
export function main({ lecturesDir = LECTURES_DIR } = {}) {
  const { results, totalMisses, totalWarnings } = checkAll({ lecturesDir });
  if (!results.length) {
    console.error('check: no lectures found in lectures/');
    return 1;
  }
  const report = formatReport({ results, totalMisses, totalWarnings });
  if (totalMisses > 0) {
    console.error(report);
  } else {
    console.log(report);
  }
  return totalMisses === 0 ? 0 : 1;
}

// Run only when invoked directly (not when imported by tests / `node -e`). The
// `argv[1]` guard keeps pathToFileURL() from throwing when there is no script
// path (e.g. `node --input-type=module -e '...'`), where argv[1] is undefined.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main());
}
