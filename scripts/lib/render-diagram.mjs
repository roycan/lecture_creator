// scripts/lib/render-diagram.mjs
//
// Render diagram source files (.puml/.d2/.dot/.mmd/...) to PNG bytes by talking
// to the Kroki HTTP API. This is the server-side replacement for the manual
// browser "download PNG → rename → move" workflow in
// references/diagram-converter/. Every engine — including Mermaid — routes
// through Kroki (decision 1), so there is NO Chromium/puppeteer dependency.
//
// Phase 1 deliverable: the render core + a file orchestrator. The CLI
// (scripts/diagram.js) is a thin wrapper over renderDiagramFile(). Phase 2 will
// import renderDiagramFile()/renderDiagram() from buildLecture to auto-render
// diagrams during a build, so this module has NO top-level side effects.
//
// Design notes (see the orchestrator's approved decisions):
//   2. Output path mirrors diagramSrc/<rel> → diagrams/<rel>.png
//   5. Faithful port of the krokiRequest() fallback chain.
//   6. Idempotent: skip if the output PNG is at least as new as the source.
//   7. Fail loud when no PNG exists; keep a stale PNG (warn) when offline.
//   8. Crisp slide PNGs: ?scale=2 + a white background by default.

import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { spawnSync } from 'node:child_process';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

// Default public Kroki endpoint. Override with KROKI_BASE_URL (e.g. a local
// Podman instance per references/diagram-converter/kroki-local.md). Trailing
// slashes are stripped at use time in resolveKrokiBase().
export const DEFAULT_KROKI_BASE = 'https://kroki.io';

/**
 * Resolve the Kroki base URL: explicit arg > KROKI_BASE_URL env > default.
 * Strips trailing slashes so `${base}/${engine}/${format}` is always clean.
 *
 * @param {string} [krokiBase] - Explicit override (highest priority).
 * @returns {string} Kroki base URL with no trailing slash.
 */
export function resolveKrokiBase(krokiBase) {
  const raw = krokiBase || process.env.KROKI_BASE_URL || DEFAULT_KROKI_BASE;
  return String(raw).replace(/\/+$/, '');
}

// ---------------------------------------------------------------------------
// Engine map: file extension → canonical Kroki engine name
// ---------------------------------------------------------------------------
// Derived from references/diagram-converter/data.js DIAGRAM_ENGINES (the
// authoritative engine list). Canonical Kroki engine names are used for the URL
// path segment (`POST <base>/<engine>/png`). `plaintext` is a browser-only
// canvas renderer in the reference tool and is intentionally absent — it has no
// Kroki endpoint. Mermaid IS here: Kroki renders it server-side (decision 1).
const EXT_TO_ENGINE = Object.freeze({
  '.puml': 'plantuml',
  '.d2': 'd2',
  '.dot': 'graphviz',
  '.gv': 'graphviz',
  '.mmd': 'mermaid',
  '.svgbob': 'svgbob',
  '.ditaa': 'ditaa',
  '.nomnoml': 'nomnoml',
  '.erd': 'erd',
  '.bytefield': 'bytefield',
  '.seqdiag': 'seqdiag',
  '.actdiag': 'actdiag',
  '.nwdiag': 'nwdiag',
  '.rackdiag': 'rackdiag',
  '.packetdiag': 'packetdiag',
});

/** Supported source extensions (keys of EXT_TO_ENGINE), in declaration order. */
export const SUPPORTED_EXTENSIONS = Object.keys(EXT_TO_ENGINE);

/**
 * Map a diagram source filename to its canonical Kroki engine name.
 *
 * @param {string} filename - Source filename with extension (a path is fine;
 *   only the extension is inspected).
 * @returns {string} Engine name, e.g. 'plantuml'.
 * @throws {Error} if the file has no supported diagram extension.
 */
export function engineFromExt(filename) {
  const ext = path.extname(filename).toLowerCase();
  const engine = EXT_TO_ENGINE[ext];
  if (!engine) {
    const shown = ext || '(none)';
    throw new Error(
      `engineFromExt: "${path.basename(String(filename))}" has extension ` +
        `"${shown}", which is not a supported diagram extension. ` +
        `Supported: ${SUPPORTED_EXTENSIONS.join(', ')}.`,
    );
  }
  return engine;
}

// ---------------------------------------------------------------------------
// Kroki source encoder (deflate + base64url) — used by the GET fallback
// ---------------------------------------------------------------------------

/**
 * Encode diagram source the way Kroki's GET endpoint expects: deflate
 * (zlib-wrapped, RFC 1950 — same bytes as the browser's
 * CompressionStream('deflate')) then URL-safe base64 with NO padding. This is
 * what Kroki appends to `GET <base>/<engine>/<format>/<encoded>`.
 *
 * Mirrors encodeKrokiSource() in references/diagram-converter/app.js. Exported
 * separately so the test suite can pin it to a known vector (decision 5).
 *
 * @param {string} text - Raw diagram source (UTF-8).
 * @returns {string} URL-safe base64 (no padding) of the deflated bytes.
 */
export function encodeKrokiSource(text) {
  const deflated = zlib.deflateSync(Buffer.from(String(text), 'utf8'));
  return deflated.toString('base64url');
}

// ---------------------------------------------------------------------------
// Output path + markdown reference helpers
// ---------------------------------------------------------------------------

/**
 * Absolute output PNG path for a diagram source. Mirrors the source's subpath
 * under diagramSrc/ into diagrams/, and swaps the extension to .png (decision 2):
 *
 *   src:  <lectureDir>/diagramSrc/js-basics/if-else.puml
 *   out:  <lectureDir>/diagrams/js-basics/if-else.png
 *
 * A source that is NOT under a diagramSrc/ folder is still placed under
 * diagrams/, preserving its relative path — we never invent a name.
 *
 * @param {string} srcPath - Source file path (absolute or lectureDir-relative).
 * @param {string} lectureDir - The lecture root (e.g. lectures/js-basics).
 * @returns {string} Absolute output .png path.
 */
export function deriveOutputPath(srcPath, lectureDir) {
  const root = path.resolve(lectureDir);
  const rel = path.relative(root, path.resolve(srcPath));
  const parts = rel.split(path.sep);

  if (parts[0] === 'diagramSrc') {
    // diagramSrc/<rel> → diagrams/<rel>
    parts[0] = 'diagrams';
  } else {
    // Not under diagramSrc/: mirror under diagrams/ without guessing a name.
    parts.unshift('diagrams');
  }

  // Swap the extension of the final segment to .png (keeps dotted basenames
  // like "my.diagram" → "my.diagram.png").
  const last = parts[parts.length - 1];
  parts[parts.length - 1] =
    path.basename(last, path.extname(last)) + '.png';

  return path.resolve(root, ...parts);
}

/**
 * Build the markdown reference line for a rendered PNG, relative to the lecture
 * directory (so it can be pasted straight into lecture.md). Always uses forward
 * slashes — a web path, not an OS path.
 *
 *   out:  <lectureDir>/diagrams/js-basics/if-else.png
 *   md:   ![if-else](diagrams/js-basics/if-else.png)
 *
 * @param {string} outputPath - Absolute output PNG path.
 * @param {string} lectureDir - The lecture root.
 * @param {string} [altText] - Optional alt text; defaults to the file stem.
 * @returns {string} `![alt](rel/path.png)`.
 */
export function markdownRef(outputPath, lectureDir, altText) {
  const rel = path.relative(
    path.resolve(lectureDir),
    path.resolve(outputPath),
  );
  const web = rel.split(path.sep).join('/');
  const alt = altText || path.basename(outputPath, path.extname(outputPath));
  return `![${alt}](${web})`;
}

// ---------------------------------------------------------------------------
// Kroki render core (the fallback chain)
// ---------------------------------------------------------------------------

// Default PNG query string: scale=2 for crisp projection, and an opaque white
// background (decision 8). SVG output takes no query (scale does not apply).
function pngQuery(scale) {
  const s = Number.isFinite(scale) && scale > 0 ? Math.floor(scale) : 2;
  return `?scale=${s}&transparency=false`;
}

// Read up to `max` chars of an error response body for diagnostics, swallowing
// any decode error so the fallback chain keeps moving.
async function peekBody(res, max = 200) {
  try {
    const text = (await res.text()).trim();
    return text ? text.slice(0, max) : '';
  } catch {
    return '';
  }
}

/**
 * Render diagram source to image bytes via Kroki. Implements the same fallback
 * chain as references/diagram-converter/app.js krokiRequest() (decision 5):
 *
 *   1. POST text/plain       (Content-Type: text/plain, body = raw source)
 *   2. POST application/json ({ "diagram_source": code })
 *   3. GET <base>/<engine>/<format>/<deflate+base64url-encoded>
 *
 * The first method that returns HTTP 2xx with a non-empty body wins. If all
 * three fail, a single Error is thrown naming the engine, each method's
 * outcome (HTTP status / network error), and the base URL — readable for a
 * non-Node teacher (decisions 5 + 7).
 *
 * @param {{ engine: string, code: string, format?: string,
 *   krokiBase?: string, scale?: number }} opts - `engine` + `code` required.
 * @returns {Promise<Buffer>} Image bytes (PNG when format='png').
 * @throws {Error} if engine/code is missing or every Kroki method fails.
 */
export async function renderDiagram({
  engine,
  code,
  format = 'png',
  krokiBase,
  scale = 2,
} = {}) {
  if (!engine) throw new Error('renderDiagram: "engine" is required.');
  if (typeof code !== 'string') {
    throw new Error('renderDiagram: "code" (the diagram source text) is required.');
  }
  const fmt = format || 'png';
  const base = resolveKrokiBase(krokiBase);
  const accept = fmt === 'png' ? 'image/png' : 'image/svg+xml';
  const query = fmt === 'png' ? pngQuery(scale) : '';

  /** Try one request; return Buffer on success, null on any failure. */
  const attempt = async (label, url, init) => {
    let res;
    try {
      res = await fetch(url, init);
    } catch (err) {
      attempts.push(`${label}: network error — ${err.message}`);
      return null;
    }
    if (!res.ok) {
      const body = await peekBody(res);
      attempts.push(
        `${label}: HTTP ${res.status} ${res.statusText}${body ? ` — ${body}` : ''}`,
      );
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0) {
      attempts.push(`${label}: empty response body`);
      return null;
    }
    return buf;
  };

  const attempts = [];

  // 1) POST text/plain for the declared engine.
  const postUrl = `${base}/${engine}/${fmt}${query}`;
  let buf = await attempt('POST text/plain', postUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain', Accept: accept },
    body: code,
  });
  if (buf) return buf;

  // 2) POST application/json { diagram_source }.
  buf = await attempt('POST json', postUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: accept },
    body: JSON.stringify({ diagram_source: code }),
  });
  if (buf) return buf;

  // 3) GET <base>/<engine>/<fmt>/<encoded>  (deflate + base64url).
  const encoded = encodeKrokiSource(code);
  const getUrl = `${base}/${engine}/${fmt}/${encoded}${query}`;
  buf = await attempt('GET encoded', getUrl, {
    headers: { Accept: accept },
  });
  if (buf) return buf;

  throw new Error(
    `Kroki could not render this diagram (engine "${engine}"). ` +
      `Tried ${attempts.length} method(s):\n  - ${attempts.join('\n  - ')}\n` +
      `Kroki base: ${base}.\n` +
      `If your diagram syntax is correct, the service may be down — ` +
      `try again later, or set KROKI_BASE_URL to a local Kroki instance.`,
  );
}

// ---------------------------------------------------------------------------
// File-level orchestrator (engine-from-ext + read + mtime-skip + write)
// ---------------------------------------------------------------------------

/**
 * Render a single diagram source file to its deterministic PNG path. Orchestrates
 * the full per-file flow: resolve engine from the extension → read source →
 * mtime-skip check → render → write.
 *
 * Idempotency (decision 6): if the output PNG already exists and its mtime is
 * ≥ the source's mtime, the render is SKIPPED (no Kroki call) and
 * `skipped: true` is returned. Pass `force: true` to re-render regardless.
 * After the first successful render, later runs work fully OFFLINE.
 *
 * Failure semantics (decision 7):
 *   - render fails + NO png exists  → re-throw (fail loud; never ship a broken
 *     deck, matching the project's "honest linter" stance).
 *   - render fails + a STALE png exists → warn to stderr, KEEP the stale png,
 *     and return `{ skipped: false, stale: true }` so offline rebuilds survive.
 *
 * @param {string} srcPath - Diagram source file (.puml/.d2/.dot/.mmd/...).
 * @param {{ lectureDir: string, krokiBase?: string, force?: boolean,
 *   scale?: number, engine?: string }} opts - `lectureDir` is required.
 * @returns {Promise<{ pngPath: string, markdownRef: string, skipped: boolean,
 *   stale?: boolean }>}
 */
export async function renderDiagramFile(srcPath, {
  lectureDir,
  krokiBase,
  force = false,
  scale = 2,
  engine,
} = {}) {
  if (!lectureDir) {
    throw new Error('renderDiagramFile: "lectureDir" is required.');
  }
  const absSrc = path.resolve(srcPath);
  const resolvedEngine = engine || engineFromExt(absSrc);
  const pngPath = deriveOutputPath(absSrc, lectureDir);
  const ref = markdownRef(pngPath, lectureDir);

  const srcStat = await fs.stat(absSrc).catch(() => null);
  if (!srcStat) {
    throw new Error(`renderDiagramFile: source file not found: ${absSrc}`);
  }

  const outStat = await fs.stat(pngPath).catch(() => null);

  // Idempotency: a fresh-enough PNG means we can stay offline.
  if (outStat && !force && outStat.mtimeMs >= srcStat.mtimeMs) {
    return { pngPath, markdownRef: ref, skipped: true };
  }

  const code = await fs.readFile(absSrc, 'utf8');
  try {
    const png = await renderDiagram({
      engine: resolvedEngine,
      code,
      format: 'png',
      krokiBase,
      scale,
    });
    await fs.mkdir(path.dirname(pngPath), { recursive: true });
    await fs.writeFile(pngPath, png);
    return { pngPath, markdownRef: ref, skipped: false };
  } catch (err) {
    if (outStat) {
      // A (stale) PNG already exists: keep it so offline rebuilds don't break.
      console.error(
        `warning: could not re-render ${path.relative(process.cwd(), absSrc) || absSrc}; ` +
          `keeping the existing PNG (${path.relative(process.cwd(), pngPath) || pngPath}). ` +
          `Reason: ${err.message}`,
      );
      return { pngPath, markdownRef: ref, skipped: false, stale: true };
    }
    // No PNG at all → fail loud (never produce a broken deck).
    throw err;
  }
}

// ===========================================================================
// Phase 2 — shared scan + collision resolution + sync render orchestrator.
// ===========================================================================
// These power the pre-build render step inside buildLecture() (scripts/lib/
// index.mjs) AND the diagram CLI (scripts/diagram.js), so the build and the CLI
// share ONE implementation of "which sources win, and in what order do they
// render" (orchestrator decision: shared helper).
//
// buildLecture() is SYNCHRONOUS — the Express /export route (server/, Phase 4)
// hands its return value straight to res.send(), and that route is out of scope
// for this phase. So the render path here is sync: a fresh-enough PNG is a
// stat-only skip (zero Kroki, zero subprocess), and a real render reuses the
// async renderDiagramFile() via a child process (spawnSync) so the exact
// failure semantics (decision 7) are shared, not duplicated.
//
// Multi-format is now a FIRST-CLASS FALLBACK feature (render-fallback): a
// teacher keeps several formats of the same diagram (e.g. if-else.{mmd,puml,dot})
// as deliberate fallbacks. The pipeline renders the PRIMARY (.mmd) first; only
// when the primary's render FAILS does it fall through to the next format
// (.puml → .d2 → .dot/.gv → others). The output PNG stem is unchanged whichever
// source wins. Source files are NEVER deleted (non-destructive, decision 2).

const SUPPORTED_SET = new Set(SUPPORTED_EXTENSIONS);

// Fallback priority (lower rank wins): .mmd > .puml > .d2 > .dot/.gv > any
// other supported extension (alphabetical tiebreak). Reused as the SINGLE
// ordering definition for both the build path and the diagram CLI.
const COLLISION_RANK = {
  '.mmd': 0,
  '.puml': 1,
  '.d2': 2,
  '.dot': 3,
  '.gv': 3,
};

/** Numeric priority for a source path (lower = wins). Unknown → 100. */
function collisionRank(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return Object.prototype.hasOwnProperty.call(COLLISION_RANK, ext)
    ? COLLISION_RANK[ext]
    : 100;
}

/** Comparator: priority rank, then alphabetical basename. This is the SINGLE
 *  fallback ordering (build + CLI + check all reuse it). */
function byCollisionPriority(a, b) {
  const ra = collisionRank(a);
  const rb = collisionRank(b);
  if (ra !== rb) return ra - rb;
  return path.basename(a).localeCompare(path.basename(b));
}

/**
 * Group diagram sources by the output PNG they would produce, and for each
 * group build an ORDERED FALLBACK CHAIN of all sources sorted by priority
 * (`.mmd > .puml > .d2 > .dot/.gv > others (alphabetical)`). The PRIMARY is
 * chain[0]; the rest are FALLBACKS, tried in order only when the primary's
 * render FAILS.
 *
 * This is the render-fallback model: multiple formats of the same diagram are
 * deliberate fallbacks (e.g. if-else.{mmd,puml} — if the .mmd has a typo or
 * Kroki chokes on it, the pipeline falls through to .puml). The output PNG stem
 * is unchanged whichever source wins (decision 3). Source files are NEVER
 * deleted (decision 2 / non-destructive).
 *
 * Pure + synchronous (no I/O, no rendering): safe to unit-test directly and
 * safe to call from the sync build path. Shared by buildLecture() and the
 * diagram CLI so there is ONE fallback policy everywhere.
 *
 * @param {string[]} sources - Absolute diagram source paths.
 * @param {string} lectureDir - The lecture root (used to compute output PNGs).
 * @returns {{ jobs: { pngPath: string, lectureDir: string,
 *   chain: { src: string, engine: string }[] }[] }} One job per unique output
 *   PNG, sorted by PRIMARY source path for deterministic output. `chain` is the
 *   ordered fallback list (chain[0] is the primary). Each entry carries its
 *   resolved Kroki engine so callers render without re-deriving it.
 */
export function resolveFallbackChain(sources, lectureDir) {
  const root = path.resolve(lectureDir);
  const groups = new Map(); // pngPath -> string[]
  for (const src of sources) {
    const png = deriveOutputPath(src, root);
    if (!groups.has(png)) groups.set(png, []);
    groups.get(png).push(src);
  }

  const jobs = [];
  for (const [pngPath, srcs] of groups) {
    const ranked = [...srcs].sort(byCollisionPriority);
    const chain = ranked.map((src) => ({ src, engine: engineFromExt(src) }));
    jobs.push({ pngPath, lectureDir: root, chain });
  }

  // Deterministic order: sort by each job's PRIMARY source path.
  jobs.sort((a, b) => a.chain[0].src.localeCompare(b.chain[0].src));
  return { jobs };
}

/**
 * Back-compat shim over resolveFallbackChain(). The original API returned
 * `{ jobs: [{ src, pngPath, lectureDir, engine }], warnings }` — a "winner per
 * PNG" plus a collision WARNING per multi-format group. Under the fallback
 * model multi-format is a FIRST-CLASS FEATURE (not a problem), so `warnings`
 * is now EMPTY by default. Callers that still want a one-line info note about
 * multi-format groups can pass `{ warn: true }` (opt-in; the build/CLI/check
 * pass DO NOT — the 21 collision warnings become 0). The returned `jobs` keep
 * the legacy single-source shape (the primary wins) so any older caller keeps
 * working unchanged.
 *
 * @param {string[]} sources - Absolute diagram source paths.
 * @param {string} lectureDir - The lecture root.
 * @param {{ warn?: boolean }} [opts] - `warn: true` to emit an opt-in info note
 *   for each multi-format group (default: none — multi-format is intentional).
 * @returns {{ jobs: { src: string, pngPath: string, lectureDir: string,
 *   engine: string, chain?: { src: string, engine: string }[] }[],
 *   warnings: string[] }}
 */
export function resolveCollisions(sources, lectureDir, { warn = false } = {}) {
  const root = path.resolve(lectureDir);
  const { jobs: chainJobs } = resolveFallbackChain(sources, root);
  const rel = (p) => path.relative(root, p) || p;
  const warnings = [];
  const jobs = chainJobs.map((j) => {
    const primary = j.chain[0];
    if (warn && j.chain.length > 1) {
      const fallbacks = j.chain.slice(1).map((c) => rel(c.src));
      const stem = path.basename(j.pngPath, '.png');
      warnings.push(
        `info: the diagram "${stem}" has ${j.chain.length} source formats ` +
          `(intentional fallback chain). Primary ${rel(primary.src)} → on ` +
          `render failure falls back to ${fallbacks.join(', ')}.`,
      );
    }
    return {
      src: primary.src,
      pngPath: j.pngPath,
      lectureDir: j.lectureDir,
      engine: primary.engine,
      chain: j.chain,
    };
  });
  return { jobs, warnings };
}

/**
 * Synchronously walk a directory for supported diagram sources, sorted for
 * deterministic output. The sync twin of the CLI's async walkSources() (same
 * skip rule: node_modules/ and dist/ are ignored). Files only. Never throws on
 * a missing/unreadable directory — returns [] so scanDiagramSrc() can treat a
 * missing diagramSrc as a clean no-op.
 *
 * @param {string} dir - Directory to walk.
 * @returns {string[]} Absolute, sorted, de-duplicated source paths.
 */
export function walkDiagramSourcesSync(dir) {
  const out = [];
  const seen = new Set();
  const recurse = (d) => {
    let entries;
    try {
      entries = fsSync.readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) {
        if (e.name === 'node_modules' || e.name === 'dist') continue;
        recurse(full);
      } else if (e.isFile() && SUPPORTED_SET.has(path.extname(e.name).toLowerCase())) {
        if (!seen.has(full)) {
          seen.add(full);
          out.push(full);
        }
      }
    }
  };
  recurse(dir);
  return out.sort();
}

/**
 * Scan `<lectureDir>/diagramSrc/` for diagram sources and resolve them into
 * ordered FALLBACK CHAINS (one per unique output PNG). The shared entry point
 * both buildLecture() and the diagram CLI use to find what WOULD render,
 * without rendering anything.
 *
 * Returns `null` when there is no diagramSrc/ folder — the offline no-op case
 * (a lecture without diagrams builds IDENTICALLY to before: zero Kroki, zero
 * subprocess). Never throws for a missing lectureDir (returns null) so an
 * unknown / editor-preview path degrades gracefully.
 *
 * Each returned job carries a `chain` (the ordered fallback list, chain[0] is
 * the primary) AND a back-compat single-source shape (`src`/`engine` = the
 * primary). `warnings` is ALWAYS EMPTY now — multi-format is a first-class
 * fallback feature, not a problem. The chain is what the build path uses; the
 * single-source fields keep check.js / older callers working.
 *
 * @param {string} lectureDir - The lecture root.
 * @param {{ diagramSrcName?: string }} [opts] - Subfolder name (default 'diagramSrc').
 * @returns {{ diagramSrcDir: string, jobs: object[], warnings: string[] } | null}
 *   `jobs[i] = { src, pngPath, lectureDir, engine, chain: {src, engine}[] }`.
 */
export function scanDiagramSrc(lectureDir, { diagramSrcName = 'diagramSrc' } = {}) {
  if (!lectureDir) return null;
  const root = path.resolve(lectureDir);
  const diagramSrcDir = path.join(root, diagramSrcName);
  let st;
  try {
    st = fsSync.statSync(diagramSrcDir);
  } catch {
    return null;
  }
  if (!st.isDirectory()) return null;
  const sources = walkDiagramSourcesSync(diagramSrcDir);
  // Multi-format is intentional now → `warn: false` (the default) keeps
  // `warnings` empty so the 21 collision warnings drop to 0.
  const { jobs, warnings } = resolveCollisions(sources, root);
  return { diagramSrcDir, jobs, warnings };
}

// ---------------------------------------------------------------------------
// Synchronous single-file render. buildLecture() is sync (the Express /export
// route hands its return value straight to res.send), so we cannot await the
// async renderDiagramFile() inline. Instead: a stat-only mtime skip keeps the
// common (fresh-PNG) path 100% offline + subprocess-free, and a real render
// reuses the EXACT async renderDiagramFile() by running it in a child node
// process (spawnSync). The child imports THIS module, so there is one copy of
// the render + failure logic (decision 7: fail loud when no PNG, keep a stale
// PNG + warn when offline).
// ---------------------------------------------------------------------------

// Inline ESM worker. It imports renderDiagramFile from THIS module (via
// import.meta.url captured below) and reports a JSON result on stdout / an
// error message on stderr. Using --input-type=module keeps it ESM so the
// top-level await works on Node 18+.
const RENDER_WORKER_SRC = `
import { renderDiagramFile } from ${JSON.stringify(import.meta.url)};
// Options arrive via an env-var JSON blob, NOT argv: Node's -e does not add an
// '[eval]' entry to process.argv, so positional argv indexing is fragile across
// versions. The env blob is unambiguous + tiny (paths/options only — the diagram
// SOURCE text is read from disk by renderDiagramFile, not passed here).
const o = JSON.parse(process.env.RENDER_DIAGRAM_OPTS || '{}');
try {
  const r = await renderDiagramFile(o.src, {
    lectureDir: o.lectureDir,
    krokiBase: o.krokiBase || undefined,
    force: !!o.force,
    scale: Number(o.scale) || 2,
    engine: o.engine || undefined,
  });
  process.stdout.write(JSON.stringify({
    pngPath: r.pngPath,
    markdownRef: r.markdownRef,
    skipped: !!r.skipped,
    stale: !!r.stale,
  }));
} catch (err) {
  process.stderr.write((err && err.message) ? err.message : String(err));
  process.exit(1);
}
`;

/**
 * Render one diagram source to its PNG, synchronously. Mirrors renderDiagramFile
 * (same mtime-skip, same failure semantics) but blocks the caller so the sync
 * buildLecture() can use it before inlineImages().
 *
 *   - Fresh PNG (mtime ≥ source) → { skipped: true }, no Kroki, no subprocess.
 *   - Stale/missing PNG → spawnSync a child running renderDiagramFile(); on
 *     success → { skipped: false } (or { stale: true } if it kept a stale PNG
 *     after a Kroki failure). On a hard failure (no PNG at all) → throws a
 *     teacher-readable Error.
 *
 * @param {string} srcPath - Diagram source file.
 * @param {{ lectureDir: string, krokiBase?: string, force?: boolean,
 *   scale?: number, engine?: string }} opts - `lectureDir` required.
 * @returns {{ pngPath: string, markdownRef: string, skipped: boolean, stale?: boolean }}
 */
export function renderDiagramFileSync(srcPath, {
  lectureDir,
  krokiBase,
  force = false,
  scale = 2,
  engine,
} = {}) {
  if (!lectureDir) {
    throw new Error('renderDiagramFileSync: "lectureDir" is required.');
  }
  const absSrc = path.resolve(srcPath);
  const resolvedLectureDir = path.resolve(lectureDir);
  const pngPath = deriveOutputPath(absSrc, resolvedLectureDir);

  // Stat-only fast path: a fresh-enough PNG means no Kroki and no subprocess.
  // Mirrors renderDiagramFile()'s mtime check (decision 6) so the offline
  // rebuild (the common case after the first render) stays free of network.
  let srcStat = null;
  let outStat = null;
  try { srcStat = fsSync.statSync(absSrc); } catch { /* missing src handled below */ }
  try { outStat = fsSync.statSync(pngPath); } catch { /* no PNG yet */ }

  if (!srcStat) {
    throw new Error(`renderDiagramFileSync: source file not found: ${absSrc}`);
  }
  if (outStat && !force && outStat.mtimeMs >= srcStat.mtimeMs) {
    return {
      pngPath,
      markdownRef: markdownRef(pngPath, resolvedLectureDir),
      skipped: true,
    };
  }

  // A real render is needed → reuse the async renderDiagramFile() in a child so
  // the failure semantics (decision 7) are shared, not re-implemented.
  const child = spawnSync(process.execPath, [
    '--input-type=module', '-e', RENDER_WORKER_SRC,
  ], {
    encoding: 'utf8',
    env: {
      ...process.env,
      RENDER_DIAGRAM_OPTS: JSON.stringify({
        src: absSrc,
        lectureDir: resolvedLectureDir,
        krokiBase: krokiBase || '',
        force: !!force,
        scale,
        engine: engine || '',
      }),
    },
  });

  if (child.error) {
    throw new Error(
      `renderDiagramFileSync: could not start the renderer for ${absSrc}: ${child.error.message}`,
    );
  }
  // Surface the child's stderr ONLY on the success path — that is where the
  // stale-PNG warning (printed by renderDiagramFile when it keeps an existing
  // PNG after a Kroki fail) legitimately lives. On the FAILURE path the child's
  // stderr is the renderer's error message, which is already embedded in the
  // thrown Error below; echoing it verbatim would duplicate (and, for engines
  // whose 400 body is binary, garble) the console. The caller (the build's
  // renderDiagramSourcesSync) formats a single teacher-readable warning from the
  // thrown error instead (Phase 6).
  if (child.status === 0 && child.stderr) process.stderr.write(child.stderr);
  if (child.status !== 0) {
    const detail = (child.stderr || '').trim() || `renderer exited with code ${child.status}`;
    throw new Error(
      `Could not render diagram "${path.relative(process.cwd(), absSrc) || absSrc}".\n` +
        `  ${detail}\n` +
        `If Kroki is unreachable, set KROKI_BASE_URL to a local instance, ` +
        `or pre-render with: npm run diagram -- ${path.relative(process.cwd(), absSrc) || absSrc}`,
    );
  }
  let parsed;
  try {
    parsed = JSON.parse(child.stdout);
  } catch {
    throw new Error(
      `renderDiagramFileSync: unexpected renderer output for ${absSrc}: ` +
        `${(child.stdout || '').slice(0, 200)}`,
    );
  }
  return parsed;
}

/**
 * Pre-build diagram render for a lecture — the helper buildLecture() calls
 * right before inlineImages(). Scans `<lectureDir>/diagramSrc/`, resolves
 * multi-format collisions, prints the warnings, and renders each winner
 * (honoring mtime-skip + failure semantics). Writes PNGs into
 * `<lectureDir>/diagrams/`.
 *
 * Offline / no-regression guarantees (decision 4):
 *   - No diagramSrc/ folder → returns null (zero Kroki, zero subprocess; the
 *     build is byte-for-byte identical to pre-Phase-2).
 *   - diagramSrc/ present but every PNG fresh → stat-only skips, zero Kroki.
 *
 * REFERENCED-aware failure severity (Phase 6 — the "never ship a broken deck"
 * guarantee is scoped to what the deck actually uses):
 *   - REFERENCED output (its relative PNG path appears in `referencedPaths`)
 *     that fails to render with no PNG on disk → re-throw (fail loud, decision
 *     7). The deck NEEDS this image; we must not ship without it.
 *   - UNREFERENCED output (WIP/legacy/orphan — e.g. a nested diagramSrc/ whose
 *     mirrored PNG path no slide uses) that fails to render → warn to stderr and
 *     continue. A flaky Kroki or a half-finished diagram must not abort a whole
 *     lecture; the build proceeds with whatever PNGs already exist. The soft
 *     failure is recorded in `softFailures` for reporting.
 *   - When `referencedPaths` is NOT supplied (e.g. a caller that doesn't know
 *     the markdown), EVERY output is treated as REFERENCED — i.e. the strict,
 *     fail-loud pre-Phase-6 behavior is the default, so the legacy/CLI contract
 *     and the existing tests are preserved.
 *
 * `render` is injectable so the test suite can exercise the orchestration +
 * collision + severity logic WITHOUT spawning subprocesses or hitting Kroki.
 *
 * @param {string} lectureDir - The lecture root.
 * @param {{ krokiBase?: string, force?: boolean, scale?: number,
 *   render?: function, log?: boolean, referencedPaths?: Set<string> }} [opts] -
 *   `referencedPaths`: a Set of forward-slash relative PNG paths the deck
 *   references (from extractImageRefs in lib/index.mjs). Omit for strict
 *   (all-referenced) behavior.
 * @returns {{ jobs: object[], warnings: string[], rendered: number,
 *   skipped: number, stale: number, softFailures: object[] } | null} null when
 *   there is no diagramSrc.
 */
export function renderDiagramSourcesSync(lectureDir, {
  krokiBase,
  force = false,
  scale = 2,
  render = renderDiagramFileSync,
  log = true,
  referencedPaths,
} = {}) {
  if (!lectureDir) {
    if (log) {
      console.log('buildLecture: no lecture directory supplied — skipping diagram rendering.');
    }
    return null;
  }
  const scan = scanDiagramSrc(lectureDir);
  if (!scan) return null; // no diagramSrc → offline no-op
  const { jobs, warnings } = scan;
  for (const w of warnings) console.warn(w);

  // When the caller doesn't supply referencedPaths, default to STRICT (treat
  // every output as referenced) so the legacy contract — fail loud on any render
  // error — is preserved for callers that don't know the markdown. Only
  // buildLecture() passes the real set (from extractImageRefs).
  const refSet = referencedPaths instanceof Set ? referencedPaths : null;
  const root = path.resolve(lectureDir);
  const rel = (p) => path.relative(root, p) || p;

  // Sanitize a Kroki error for a teacher-readable warning (the UNREFERENCED
  // soft-fail path ONLY — the referenced throw keeps the raw error). Some engines
  // answer a render failure with HTTP 400 but a *binary* body (a PNG "error
  // image"), so res.text() decodes it to U+FFFD + stray printable-ASCII
  // fragments (PNG chunk names like "IHDR"/"IDAT" + compressed data) — pure
  // noise ("HDR\IDATx^w…"). We elide any 400-body that isn't plausibly real error
  // text (too many non-printables, or one long unbroken token) and keep genuinely
  // readable messages (e.g. "Syntax Error: …"). The English template + the HTTP
  // status label around each body are always preserved.
  const NON_PRINT_RE = /[^\x09\x0a\x0d\x20-\x7e]/g;
  const looksLikeText = (seg) => {
    if (!seg) return false;
    const stripped = seg.replace(NON_PRINT_RE, '');
    // Binary image data ⇒ many non-printables; real error text ⇒ ~0%.
    if ((seg.length - stripped.length) / seg.length > 0.1) return false;
    // A real message has short space-separated words; a binary chunk collapses
    // to one long dense token (e.g. "HDRIDATxw…").
    return stripped
      .trim()
      .split(/\s+/)
      .some((w) => w.length > 0 && w.length <= 48);
  };
  // A 400 body sits after " — " (U+2014) and runs until the next attempt
  // ("\n  - "), the "Kroki base:" line, the trailing tip, or end-of-string.
  // Bodies can contain embedded newlines (PNG bytes include 0x0A) and the em-dash
  // marker never occurs inside a binary body, so this anchors robustly where a
  // naive split('\n') would fragment a body and leak stray "IHDR"/"IDAT" runs.
  // Bodies are the only untrusted part; the template + HTTP status around them
  // are always clean ASCII, so any leftover non-printables get stripped last.
  const BODY_RE = / \u2014 ([\s\S]*?)(?=\n {2}- |\nKroki base:|\nIf your|$)/g;
  const sanitizeErr = (err) => {
    const raw = String((err && err.message) || err);
    const cleaned = raw
      .replace(BODY_RE, (_m, body) =>
        looksLikeText(body)
          ? ` \u2014 ${body.replace(NON_PRINT_RE, '').replace(/[ \t]{2,}/g, ' ').trim().slice(0, 200)}`
          : ' \u2014 (binary response body, elided)',
      )
      .replace(NON_PRINT_RE, '')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();
    return cleaned || '(no detail)';
  };

  let rendered = 0;
  let skipped = 0;
  let stale = 0;
  const softFailures = [];
  for (const job of jobs) {
    const chain = job.chain || [{ src: job.src, engine: job.engine }];
    const outRel = path.relative(root, job.pngPath).split(path.sep).join('/');

    // --- mtime check across ALL same-stem sources (decision 8) --------------
    // The PNG is "fresh" iff it exists and is at least as new as EVERY source
    // in the chain (so editing a FALLBACK source — e.g. the .puml — also
    // invalidates the cache correctly). When fresh, skip entirely: zero Kroki,
    // zero fallback attempts (same as today, generalized to the chain).
    if (!force) {
      let pngStat = null;
      try { pngStat = fsSync.statSync(job.pngPath); } catch { /* no PNG yet */ }
      if (pngStat) {
        const allCovered = chain.every((c) => {
          try {
            return pngStat.mtimeMs >= fsSync.statSync(c.src).mtimeMs;
          } catch {
            return true; // missing source: don't block the skip on a vanished file
          }
        });
        if (allCovered) {
          skipped += 1;
          continue;
        }
      }
    }

    // --- Walk the fallback chain: primary first, fall through on FAILURE ----
    // decision 1: fallback triggers ONLY on a render FAILURE (throw), not on
    // the happy path. The first format that succeeds (or keeps a stale PNG)
    // wins; the output PNG stem is unchanged whichever source produced it.
    let result = null;
    let lastErr = null;
    const attemptSrcs = [];
    for (let i = 0; i < chain.length; i++) {
      const { src, engine } = chain[i];
      attemptSrcs.push(src);
      try {
        // force:true bypasses the per-source mtime check inside the renderer:
        // we already decided (above) that a real render is needed.
        const r = render(src, {
          lectureDir,
          krokiBase,
          force: true,
          scale,
          engine,
        });
        if (r && r.stale) {
          // The renderer kept an existing (stale) PNG after a Kroki failure.
          // That is a SUCCESS for chain purposes — stop, don't try fallbacks.
          result = r;
          break;
        }
        result = r;
        break; // primary (or earlier fallback) succeeded → done, no more attempts
      } catch (err) {
        lastErr = err;
        // decision 9: clear, teacher-readable fallback note. Only printed when
        // there is at least one more format to try.
        if (i < chain.length - 1 && log) {
          const next = chain[i + 1];
          console.warn(
            `${rel(src)} failed — falling back to ${rel(next.src)}.`,
          );
        }
      }
    }

    if (result) {
      if (result.stale) stale += 1;
      else rendered += 1;
      continue;
    }

    // --- ALL formats failed → referenced-aware severity (Phase 6) ----------
    const isReferenced = refSet ? refSet.has(outRel) : true;
    if (isReferenced) {
      // decision 4: never ship a broken deck. Throw the last error verbatim
      // (NOT sanitized) so debugging info is preserved.
      throw lastErr;
    }
    // decision 5 / Phase 6: unreferenced (WIP/legacy/orphan) → warn + continue.
    const srcRel = rel(attemptSrcs[0]);
    const errText = sanitizeErr(lastErr);
    const msg =
      `${srcRel} failed to render (unreferenced — output ${outRel} is not ` +
      `used by any slide). All ${attemptSrcs.length} format(s) failed. Build ` +
      `continues using any existing PNG; fix or remove the source when ready:\n  ${errText}`;
    if (log) console.warn(msg);
    softFailures.push({
      src: attemptSrcs[0],
      pngPath: job.pngPath,
      outRel,
      message: msg,
      error: lastErr,
    });
  }
  return { jobs, warnings, rendered, skipped, stale, softFailures };
}

export default renderDiagramFile;
