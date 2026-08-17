// scripts/test/mermaid-lint.test.js
//
// Tests for mermaid syntax hardening (mermaid-check-hardening-plan.md):
//
//   Layer 1 — scripts/lib/mermaid-lint.mjs (hermetic structural lint):
//     - the 2026-08-16 incident label is a permanent regression fixture
//     - every quoting pattern actually used in this repo is asserted CLEAN
//       (no false positives — the lint errs toward silence)
//     - R1 unterminated fences, R2 unknown keywords, R3 special chars
//   Layer 2 — scripts/check-mermaid.mjs (Kroki-backed, on-demand):
//     - transport is INJECTED, so these are hermetic: no real HTTP, no Docker.
//       200 → pass · 400 → failure carries the parser message · unreachable →
//       skipped:true (and the CLI exit stays 0 — skip is not failure)
//   Real-file gate — lint the ACTUAL lectures/ tree and expect 0 findings, so
//     any new violation fails npm test the moment it lands.
//
// Plan scores: unit fixtures 96/96 · transport stubs 93/94 · real gate 95/96.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

import {
  extractMermaidFences,
  lintMermaid,
  lintMermaidLecture,
  collectMermaidSources,
} from '../lib/mermaid-lint.mjs';
import { runCheck, probeKroki } from '../check-mermaid.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, '..', '..');

// --- helpers ----------------------------------------------------------------

function withDir(files, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mmd-lint-'));
  for (const [name, content] of Object.entries(files)) {
    const full = path.join(dir, name);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const fence = (body) => ['```mermaid', body, '```'].join('\n');

// ===========================================================================
// Layer 1 — lintMermaid rules
// ===========================================================================

test('R3 regression — the 2026-08-16 incident label is flagged with line + fix', () => {
  const src = ['flowchart LR', '    BP["Blueprint"]', '    BP -->|new Product(...)| I1["sardinas"]'].join('\n');
  const findings = lintMermaid(src, { startLine: 2 });
  assert.equal(findings.length, 1, 'exactly one finding');
  const f = findings[0];
  assert.equal(f.rule, 'R3');
  assert.equal(f.severity, 'error');
  assert.equal(f.line, 4, 'absolute line (startLine 2 + idx 2)');
  assert.ok(f.message.includes('new Product(...)'));
  assert.ok(f.hint.includes('-->|"new Product(...)"|'), 'hint shows the quoted fix');
});

test('R3 — quoted labels, thick-link quoted text, and classDiagram arrows are all clean', () => {
  const cases = [
    // the fix for the incident
    'flowchart LR\n    BP -->|"new Product(...)"| I1["sardinas"]',
    // real pattern from lectures/oop-classes (quoted parens on a == link)
    'flowchart TB\n    STORE == "has-a (contains)" ==> PROD',
    // real pattern from lectures/oop-inheritance-diagrams (inheritance arrow + colon label)
    'classDiagram\n    PerishableProduct --|> Product : extends (is-a)',
    // dotted link with a quoted label
    'flowchart LR\n    A -.->|"ref (chain)"| B',
    // plain labels without special chars stay legal
    'flowchart LR\n    A -->|reads field| B',
  ];
  for (const src of cases) {
    assert.deepEqual(lintMermaid(src), [], `no findings for: ${src.split('\n')[1].trim()}`);
  }
});

test('R1 — an unterminated mermaid fence is an error at the opening line', () => {
  const md = ['# Demo', '', '```mermaid', 'flowchart LR', '    A-->B', '', 'text after'].join('\n');
  const { fences, unterminated } = extractMermaidFences(md);
  assert.equal(fences.length, 0, 'no complete fence extracted');
  assert.deepEqual(unterminated, [3], 'opening flagged at line 3');
});

test('R2 — an unknown first-line keyword warns (never errors)', () => {
  const findings = lintMermaid('bananas TD\n    A-->B');
  assert.equal(findings.length, 1);
  assert.equal(findings[0].rule, 'R2');
  assert.equal(findings[0].severity, 'warning');
});

test('R2 — known keywords (incl. -v2 / -beta suffixes and blank first lines) are clean', () => {
  for (const first of ['flowchart LR', 'graph TD', 'classDiagram', 'sequenceDiagram',
    'stateDiagram-v2', 'erDiagram', 'gantt', 'pie', 'mindmap', 'timeline',
    'journey', 'gitGraph', 'architecture-beta']) {
    assert.deepEqual(lintMermaid(`${first}\n  A-->B`), [], first);
  }
  assert.deepEqual(lintMermaid('\n\nflowchart LR\n  A-->B'), [], 'blank lines before keyword');
});

// ===========================================================================
// Layer 1 — lintMermaidLecture over a fixture lecture tree
// ===========================================================================

test('lintMermaidLecture — lints fences AND diagramSrc/*.mmd, with rel file names', () => {
  const md = [
    '# Demo', '',
    fence('flowchart LR\n    A -->|"ok(...)"| B'), '',
    fence('flowchart LR\n    A -->|broken(...)| B'),
  ].join('\n');
  const badMmd = 'flowchart LR\n    X -->|also broken [x]| Y\n';
  withDir(
    {
      'lecture.md': md,
      'diagramSrc/demo/bad.mmd': badMmd,
      'diagramSrc/demo/note.txt': 'not a mermaid source — ignored',
      'assets/quiz.md': '# quiz',
    },
    (dir) => {
      const r = lintMermaidLecture(dir);
      assert.equal(r.sources, 3, '2 fences + 1 .mmd');
      assert.equal(r.errors.length, 2, 'one fence error + one .mmd error');
      assert.ok(r.errors.some((e) => e.file === 'lecture.md' && e.rule === 'R3'));
      assert.ok(r.errors.some((e) => e.file === path.join('diagramSrc', 'demo', 'bad.mmd')));
      assert.equal(r.warnings.length, 0);
    },
  );
});

// ===========================================================================
// Layer 2 — check-mermaid with an injected (stubbed) transport
// ===========================================================================

/** fetch-shaped stub. Map url → {ok, status, text}. Unmatched → throws. */
const stubTransport = (routes) => async (url) => {
  for (const [prefix, reply] of Object.entries(routes)) {
    if (url.startsWith(prefix)) {
      if (reply.throw) throw new Error(reply.throw);
      return { ok: reply.ok, status: reply.status, text: async () => reply.body || '' };
    }
  }
  throw new Error('no stub route for ' + url);
};

test('Layer 2 — health probe: reachable true/false via transport', async () => {
  const up = await probeKroki({ transport: stubTransport({ 'http://x/health': { ok: true, status: 200 } }), baseUrl: 'http://x' });
  const down = await probeKroki({ transport: stubTransport({ 'http://x/health': { throw: 'ECONNREFUSED' } }), baseUrl: 'http://x' });
  assert.equal(up, true);
  assert.equal(down, false);
});

test('Layer 2 — unreachable Kroki means skipped:true, zero checks, no failures', async () => {
  const result = await runCheck({
    lecturesDir: path.join(REPO, 'lectures'),
    baseUrl: 'http://down.invalid',
    transport: stubTransport({ 'http://down.invalid/health': { throw: 'ECONNREFUSED' } }),
  });
  assert.equal(result.skipped, true);
  assert.equal(result.checked, 0);
  assert.deepEqual(result.failures, []);
});

test('Layer 2 — a 400 response becomes a failure carrying slug, file, and parser message', async () => {
  const fixture = {
    'demo/lecture.md': fence('flowchart LR\n    A -->|new Product(...)| B'),
  };
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mmd-kroki-'));
  for (const [name, content] of Object.entries(fixture)) {
    const full = path.join(dir, name);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  try {
    const result = await runCheck({
      lecturesDir: dir,
      baseUrl: 'http://x',
      transport: stubTransport({
        'http://x/health': { ok: true, status: 200 },
        'http://x/mermaid/png': {
          ok: false, status: 400,
          body: 'Error 400: SyntaxError: Parse error on line 2\nExpecting SQE',
        },
      }),
    });
    assert.equal(result.skipped, false);
    assert.equal(result.checked, 1);
    assert.equal(result.failures.length, 1);
    assert.equal(result.failures[0].slug, 'demo');
    assert.equal(result.failures[0].rel, 'lecture.md');
    assert.equal(result.failures[0].status, 400);
    assert.ok(result.failures[0].message.includes('Parse error'));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('Layer 2 — all-200 Kroki run is clean and checks every collected source', async () => {
  const result = await runCheck({
    lecturesDir: path.join(REPO, 'lectures'),
    baseUrl: 'http://x',
    transport: stubTransport({
      'http://x/health': { ok: true, status: 200 },
      'http://x/mermaid/png': { ok: true, status: 200 },
    }),
  });
  assert.equal(result.skipped, false);
  assert.ok(result.checked >= 50, `checked the real corpus (got ${result.checked})`);
  assert.deepEqual(result.failures, []);
});

// ===========================================================================
// Real-file content gate — the actual repo must lint clean
// ===========================================================================

test('real-file gate — every real mermaid fence + .mmd lints with ZERO findings', () => {
  const lecturesDir = path.join(REPO, 'lectures');
  const slugs = fs.readdirSync(lecturesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory()).map((d) => d.name);
  let sources = 0;
  for (const slug of slugs) {
    const r = lintMermaidLecture(path.join(lecturesDir, slug));
    sources += r.sources;
    assert.deepEqual(r.errors, [], `${slug}: 0 mermaid errors`);
    assert.deepEqual(r.warnings, [], `${slug}: 0 mermaid warnings`);
  }
  assert.ok(sources >= 50, `gate is really covering the corpus (linted ${sources} sources)`);
});

test('collectMermaidSources — collector and linter agree on what exists', () => {
  const lecturesDir = path.join(REPO, 'lectures');
  const collected = collectMermaidSources(lecturesDir).length;
  const linted = fs.readdirSync(lecturesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .reduce((n, d) => n + lintMermaidLecture(path.join(lecturesDir, d.name)).sources, 0);
  assert.equal(collected, linted, 'Layer 2 validates exactly what Layer 1 lints');
});
