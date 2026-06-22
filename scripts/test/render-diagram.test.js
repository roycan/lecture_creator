// scripts/test/render-diagram.test.js
//
// Phase 1 tests for scripts/lib/render-diagram.mjs. Covers the PURE helpers only
// (no network): engineFromExt, deriveOutputPath, markdownRef, and the Kroki
// deflate+base64url encoder (encodeKrokiSource). ONE opt-in LIVE test hits the
// real Kroki API but is skipped unless KROKI_LIVE=1, so CI/offline stays green.
//
// Matches the project's runner conventions (node:test + node:assert/strict, same
// as scripts/test/cli.test.js and bundle-libs.test.js). No new devDependency.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import zlib from 'node:zlib';

import {
  engineFromExt,
  deriveOutputPath,
  markdownRef,
  encodeKrokiSource,
  SUPPORTED_EXTENSIONS,
  renderDiagram,
} from '../lib/render-diagram.mjs';

// The single live-Kroki test runs ONLY when this is set; otherwise node:test
// reports it as skipped (never a failure). This keeps `npm test` offline-safe.
const RUN_LIVE = process.env.KROKI_LIVE === '1';

// ===========================================================================
// engineFromExt
// ===========================================================================

test('engineFromExt: maps every supported extension to its canonical engine', () => {
  const cases = [
    ['x.puml', 'plantuml'],
    ['x.d2', 'd2'],
    ['x.dot', 'graphviz'],
    ['x.gv', 'graphviz'],
    ['x.mmd', 'mermaid'],
    ['x.svgbob', 'svgbob'],
    ['x.ditaa', 'ditaa'],
    ['x.nomnoml', 'nomnoml'],
    ['x.erd', 'erd'],
    ['x.bytefield', 'bytefield'],
    ['x.seqdiag', 'seqdiag'],
    ['x.actdiag', 'actdiag'],
    ['x.nwdiag', 'nwdiag'],
    ['x.rackdiag', 'rackdiag'],
    ['x.packetdiag', 'packetdiag'],
  ];
  for (const [file, engine] of cases) {
    assert.equal(engineFromExt(file), engine, `${file} → ${engine}`);
  }
});

test('engineFromExt: is case-insensitive on the extension', () => {
  assert.equal(engineFromExt('IF.PUML'), 'plantuml');
  assert.equal(engineFromExt('Diagram.Dot'), 'graphviz');
  assert.equal(engineFromExt('a.MMD'), 'mermaid');
});

test('engineFromExt: ignores the directory part (only the extension matters)', () => {
  assert.equal(
    engineFromExt(path.join('lectures', 'js-basics', 'diagramSrc', 'js-basics', 'if-else.puml')),
    'plantuml',
  );
  assert.equal(engineFromExt('a/b/c/y.d2'), 'd2');
});

test('engineFromExt: throws on an unknown extension', () => {
  assert.throws(() => engineFromExt('notes.txt'), /not a supported diagram extension/);
  assert.throws(() => engineFromExt('photo.png'), /not a supported diagram extension/);
  assert.throws(() => engineFromExt('diagram.svg'), /not a supported diagram extension/);
});

test('engineFromExt: throws on a file with no extension', () => {
  assert.throws(() => engineFromExt('README'), /not a supported diagram extension/);
});

// ===========================================================================
// deriveOutputPath — mirror diagramSrc/ → diagrams/, swap ext to .png
// ===========================================================================

test('deriveOutputPath: mirrors a nested diagramSrc subpath into diagrams/', () => {
  const lectureDir = path.join('lectures', 'js-basics');
  const src = path.join(lectureDir, 'diagramSrc', 'js-basics', 'if-else.puml');
  const out = deriveOutputPath(src, lectureDir);
  assert.equal(
    path.relative(lectureDir, out),
    path.join('diagrams', 'js-basics', 'if-else.png'),
  );
});

test('deriveOutputPath: a source directly in diagramSrc/ lands in diagrams/', () => {
  const lectureDir = path.join('lectures', 'x');
  const out = deriveOutputPath(path.join(lectureDir, 'diagramSrc', 'a.dot'), lectureDir);
  assert.equal(path.relative(lectureDir, out), path.join('diagrams', 'a.png'));
});

test('deriveOutputPath: returns an absolute path', () => {
  const lectureDir = path.resolve('lectures', 'x');
  const out = deriveOutputPath(path.join(lectureDir, 'diagramSrc', 'a.mmd'), lectureDir);
  assert.ok(path.isAbsolute(out), 'output path should be absolute');
  assert.ok(out.endsWith('.png'));
});

test('deriveOutputPath: only the LAST extension is swapped (dotted basenames)', () => {
  const lectureDir = path.join('lectures', 'x');
  const out = deriveOutputPath(
    path.join(lectureDir, 'diagramSrc', 'my.diagram.puml'),
    lectureDir,
  );
  assert.equal(path.basename(out), 'my.diagram.png');
});

test('deriveOutputPath: a source NOT under diagramSrc/ still mirrors under diagrams/', () => {
  const lectureDir = path.join('lectures', 'x');
  const out = deriveOutputPath(path.join(lectureDir, 'loose', 'a.d2'), lectureDir);
  assert.equal(path.relative(lectureDir, out), path.join('diagrams', 'loose', 'a.png'));
});

// ===========================================================================
// markdownRef — relative web path + sensible default alt
// ===========================================================================

test('markdownRef: correct relative path + default alt = file stem', () => {
  const lectureDir = path.join('lectures', 'js-basics');
  const out = path.join(lectureDir, 'diagrams', 'js-basics', 'if-else.png');
  assert.equal(
    markdownRef(out, lectureDir),
    '![if-else](diagrams/js-basics/if-else.png)',
  );
});

test('markdownRef: honors an explicit alt text', () => {
  const lectureDir = path.join('lectures', 'x');
  const out = path.join(lectureDir, 'diagrams', 'a.png');
  assert.equal(
    markdownRef(out, lectureDir, 'my custom alt'),
    '![my custom alt](diagrams/a.png)',
  );
});

test('markdownRef: always uses forward slashes (a web path)', () => {
  const lectureDir = path.join('lectures', 'x');
  const out = path.join(lectureDir, 'diagrams', 'deep', 'nested', 'a.png');
  assert.ok(!markdownRef(out, lectureDir).includes('\\'), 'no backslashes in a web ref');
});

// ===========================================================================
// encodeKrokiSource — deflate (zlib-wrapped) + base64url, no padding
// ===========================================================================

test('encodeKrokiSource: matches a known Kroki vector', () => {
  // Pinned vector: zlib.deflateSync of the UTF-8 bytes of this string, then
  // base64url (no padding). Independently computed via Node's zlib — a
  // regression in the encoding (e.g. switching to raw deflate) is caught here.
  const input = 'flowchart LR\n  A-->B\n';
  assert.equal(encodeKrokiSource(input), 'eJxLy8kvT85ILCpR8AniUlBw1NW1c-ICAE71Bfg');
});

test('encodeKrokiSource: is deterministic (same input → same output)', () => {
  const src = '@startuml\nAlice -> Bob: Hi\n@enduml';
  assert.equal(encodeKrokiSource(src), encodeKrokiSource(src));
});

test('encodeKrokiSource: output is URL-safe base64 with NO padding', () => {
  const enc = encodeKrokiSource('a moderately long diagram source line\n'.repeat(8));
  assert.ok(!enc.includes('='), 'must not contain padding');
  assert.ok(!enc.includes('+'), 'must not contain "+" (use "-")');
  assert.ok(!enc.includes('/'), 'must not contain "/" (use "_")');
});

test('encodeKrokiSource: round-trips via inflate (version-independent check)', () => {
  const input = 'sequenceDiagram\n  A->>B: hello\n  B-->>A: hi\n';
  const enc = encodeKrokiSource(input);
  // base64url → buffer → inflate → original UTF-8 string.
  const restored = zlib.inflateSync(Buffer.from(enc, 'base64url')).toString('utf8');
  assert.equal(restored, input);
});

// ===========================================================================
// SUPPORTED_EXTENSIONS sanity
// ===========================================================================

test('SUPPORTED_EXTENSIONS includes the core diagram types', () => {
  const lower = SUPPORTED_EXTENSIONS.map((e) => e.toLowerCase());
  for (const ext of ['.puml', '.d2', '.dot', '.gv', '.mmd']) {
    assert.ok(lower.includes(ext), `should include ${ext}`);
  }
});

// ===========================================================================
// renderDiagram argument guards (no network — rejects before fetch)
// ===========================================================================

test('renderDiagram: throws on missing engine (before any network call)', async () => {
  await assert.rejects(() => renderDiagram({ code: 'x' }), /"engine" is required/);
});

test('renderDiagram: throws on missing code (before any network call)', async () => {
  await assert.rejects(() => renderDiagram({ engine: 'plantuml' }), /"code"/);
});

// ===========================================================================
// LIVE Kroki test — opt-in only (KROKI_LIVE=1). Skipped otherwise so CI/offline
// stays green. Renders a tiny known-good diagram and asserts PNG magic bytes.
// ===========================================================================

test(
  'LIVE renderDiagram: a tiny PlantUML returns a real PNG buffer',
  { skip: !RUN_LIVE },
  async () => {
    const png = await renderDiagram({
      engine: 'plantuml',
      code: '@startuml\nAlice -> Bob: Hi\n@enduml',
      format: 'png',
    });
    assert.ok(Buffer.isBuffer(png), 'result must be a Buffer');
    assert.ok(png.length > 100, 'PNG should be non-trivial in size');
    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    assert.deepEqual(
      Array.from(png.slice(0, 8)),
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
      'must start with the PNG signature',
    );
  },
);
