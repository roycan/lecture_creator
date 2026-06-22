// scripts/test/build-diagrams.test.js
//
// Phase 2 — pre-build diagram rendering integration tests.
//
// Covers the shared scan + collision logic (render-diagram.mjs) and its wiring
// into buildLecture() (lib/index.mjs), WITHOUT network:
//   - resolveCollisions: priority .mmd > .puml > .d2 > .dot/.gv > others, and
//     the chosen set excludes duplicate-format losers (non-destructive).
//   - scanDiagramSrc: null no-op when there is no diagramSrc/ (offline gate).
//   - renderDiagramSourcesSync: the orchestrator buildLecture() calls — uses an
//     injectable `render` so the suite is hermetic (no subprocess, no Kroki).
//   - buildLecture: a lecture with NO diagramSrc builds unchanged; a lecture
//     WITH diagramSrc + fresh PNGs also stays offline (mtime skip, no spawn).
//   - renderDiagramFileSync: the stat-only mtime skip returns {skipped:true}.
// One opt-in LIVE test (KROKI_LIVE=1) actually renders via Kroki.
//
// Matches the project's runner conventions (node:test + node:assert/strict),
// same temp-fixture style as cli.test.js / routes.test.js. No new devDependency.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import {
  resolveCollisions,
  scanDiagramSrc,
  renderDiagramSourcesSync,
  renderDiagramFileSync,
} from '../lib/render-diagram.mjs';
import { buildLecture, extractImageRefs } from '../lib/index.mjs';

// The single live-Kroki test runs ONLY when this is set; otherwise node:test
// reports it as skipped (never a failure). Keeps `npm test` offline-safe.
const RUN_LIVE = process.env.KROKI_LIVE === '1';

// PNG magic bytes — inlineImages only cares about existence + extension.
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x01]);

// --- helpers ----------------------------------------------------------------

/**
 * Create a throwaway dir populated with { relpath: content }, run fn(dir),
 * clean up. Content may be a Buffer. Directories in relpaths are created.
 */
function withDir(files, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'diagrams-'));
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

/** Stamp a file's mtime to the future so it is unambiguously newer than sibling
 *  sources — keeps the fresh-PNG mtime skip stable on coarse-mtime filesystems. */
function touchFuture(p, ms = Date.now() + 60_000) {
  const d = new Date(ms);
  fs.utimesSync(p, d, d);
}

// ===========================================================================
// resolveCollisions — priority + non-destructive selection (pure)
// ===========================================================================

test('resolveCollisions: .mmd wins over .puml and .dot for the same PNG', () => {
  const lectureDir = path.join(os.tmpdir(), 'lec');
  const src = (ext) => path.join(lectureDir, 'diagramSrc', 'sub', `if-else.${ext}`);
  const { jobs, warnings } = resolveCollisions(
    [src('dot'), src('mmd'), src('puml')],
    lectureDir,
  );
  assert.equal(jobs.length, 1, 'one job per unique PNG');
  assert.equal(path.basename(jobs[0].src), 'if-else.mmd', '.mmd wins');
  assert.equal(jobs[0].engine, 'mermaid');
  assert.equal(warnings.length, 1, 'one collision warning');
  assert.match(warnings[0], /if-else\.mmd/);
  assert.match(warnings[0], /if-else\.puml/);
  assert.match(warnings[0], /if-else\.dot/);
});

test('resolveCollisions: no warning when each diagram has a single format', () => {
  const lectureDir = path.join(os.tmpdir(), 'lec');
  const { jobs, warnings } = resolveCollisions(
    [
      path.join(lectureDir, 'diagramSrc', 'a.mmd'),
      path.join(lectureDir, 'diagramSrc', 'b.puml'),
    ],
    lectureDir,
  );
  assert.equal(jobs.length, 2);
  assert.deepEqual(warnings, []);
});

test('resolveCollisions: full priority .mmd > .puml > .d2 > .dot', () => {
  const lectureDir = path.join(os.tmpdir(), 'lec');
  const src = (ext) => path.join(lectureDir, 'diagramSrc', `x.${ext}`);
  assert.equal(
    path.basename(resolveCollisions([src('dot')], lectureDir).jobs[0].src),
    'x.dot',
  );
  assert.equal(
    path.basename(resolveCollisions([src('dot'), src('d2')], lectureDir).jobs[0].src),
    'x.d2',
  );
  assert.equal(
    path.basename(
      resolveCollisions([src('dot'), src('d2'), src('puml')], lectureDir).jobs[0].src,
    ),
    'x.puml',
  );
  assert.equal(
    path.basename(
      resolveCollisions([src('dot'), src('d2'), src('puml'), src('mmd')], lectureDir)
        .jobs[0].src,
    ),
    'x.mmd',
  );
});

test('resolveCollisions: .gv ties with .dot (rank) → alphabetical basename wins', () => {
  const lectureDir = path.join(os.tmpdir(), 'lec');
  const src = (ext) => path.join(lectureDir, 'diagramSrc', `y.${ext}`);
  const { jobs, warnings } = resolveCollisions([src('gv'), src('dot')], lectureDir);
  assert.equal(jobs.length, 1);
  assert.equal(path.basename(jobs[0].src), 'y.dot', "'y.dot' < 'y.gv'");
  assert.equal(warnings.length, 1);
});

test('resolveCollisions: jobs sorted by source path (deterministic)', () => {
  const lectureDir = path.join(os.tmpdir(), 'lec');
  const { jobs } = resolveCollisions(
    [
      path.join(lectureDir, 'diagramSrc', 'z.mmd'),
      path.join(lectureDir, 'diagramSrc', 'a.mmd'),
      path.join(lectureDir, 'diagramSrc', 'm.mmd'),
    ],
    lectureDir,
  );
  assert.deepEqual(
    jobs.map((j) => path.basename(j.src)),
    ['a.mmd', 'm.mmd', 'z.mmd'],
  );
});

// ===========================================================================
// scanDiagramSrc — the offline no-op gate
// ===========================================================================

test('scanDiagramSrc: null when lectureDir has no diagramSrc/ (offline no-op)', () => {
  withDir({ 'lecture.md': '# x' }, (dir) => {
    assert.equal(scanDiagramSrc(dir), null);
  });
});

test('scanDiagramSrc: null when lectureDir does not exist (graceful, no throw)', () => {
  assert.equal(scanDiagramSrc(path.join(os.tmpdir(), 'definitely-missing-xyz-456')), null);
});

test('scanDiagramSrc: jobs + warnings for a real diagramSrc tree (mirrored paths)', () => {
  withDir(
    {
      'diagramSrc/sub/a.mmd': 'flowchart LR\n A-->B',
      'diagramSrc/sub/a.puml': '@startuml\nA->B\n@enduml',
      'diagramSrc/b.dot': 'digraph{a->b}',
    },
    (dir) => {
      const scan = scanDiagramSrc(dir);
      assert.ok(scan, 'scan returned a result');
      // a.{mmd,puml} collide → 1 job; b.dot → 1 job ⇒ 2 jobs total.
      assert.equal(scan.jobs.length, 2);
      assert.equal(scan.warnings.length, 1);
      const winner = scan.jobs.find((j) => path.basename(j.pngPath) === 'a.png');
      assert.ok(winner, 'a.png job present');
      assert.equal(path.basename(winner.src), 'a.mmd');
      assert.equal(
        path.relative(dir, winner.pngPath),
        path.join('diagrams', 'sub', 'a.png'),
        'mirrored nested path',
      );
    },
  );
});

// ===========================================================================
// renderDiagramSourcesSync — the orchestrator buildLecture() calls (hermetic
// via an injectable `render`)
// ===========================================================================

test('renderDiagramSourcesSync: no diagramSrc → null, render never called', () => {
  withDir({ 'lecture.md': '# x' }, (dir) => {
    let calls = 0;
    const res = renderDiagramSourcesSync(dir, {
      render: () => {
        calls += 1;
        return { skipped: true };
      },
    });
    assert.equal(res, null);
    assert.equal(calls, 0, 'render must not run when there is no diagramSrc');
  });
});

test('renderDiagramSourcesSync: render called once per winner; losers not rendered', () => {
  withDir(
    {
      'diagramSrc/a.mmd': 'x',
      'diagramSrc/a.puml': 'x',
      'diagramSrc/a.dot': 'x',
      'diagramSrc/b.mmd': 'x',
    },
    (dir) => {
      const calls = [];
      const res = renderDiagramSourcesSync(dir, {
        render: (src) => {
          calls.push(path.basename(src));
          return { skipped: false };
        },
      });
      assert.ok(res);
      assert.equal(res.jobs.length, 2, 'a + b = 2 unique PNGs');
      assert.deepEqual(calls.sort(), ['a.mmd', 'b.mmd'], 'only winners rendered');
      assert.equal(res.rendered, 2);
    },
  );
});

test('renderDiagramSourcesSync: propagates a hard render failure (fail loud)', () => {
  withDir({ 'diagramSrc/a.mmd': 'x' }, (dir) => {
    assert.throws(
      () =>
        renderDiagramSourcesSync(dir, {
          render: () => {
            throw new Error('Kroki down');
          },
        }),
      /Kroki down/,
    );
  });
});

test('renderDiagramSourcesSync: stale result counted separately', () => {
  withDir({ 'diagramSrc/a.mmd': 'x' }, (dir) => {
    const res = renderDiagramSourcesSync(dir, {
      render: () => ({ stale: true }),
    });
    assert.equal(res.stale, 1);
    assert.equal(res.rendered, 0);
  });
});

test('renderDiagramSourcesSync: null + one-line note when lectureDir is absent', () => {
  const notes = [];
  const oLog = console.log;
  console.log = (...a) => void notes.push(a.join(' '));
  try {
    assert.equal(renderDiagramSourcesSync(null), null);
  } finally {
    console.log = oLog;
  }
  assert.ok(notes.some((n) => /skipping diagram rendering/i.test(n)));
});

// ===========================================================================
// renderDiagramFileSync — stat-only mtime skip (no subprocess, no network)
// ===========================================================================

test('renderDiagramFileSync: fresh PNG → {skipped:true} (stat-only, no spawn)', () => {
  withDir(
    {
      'diagramSrc/a.mmd': 'flowchart LR\n A-->B',
      'diagrams/a.png': PNG,
    },
    (dir) => {
      touchFuture(path.join(dir, 'diagrams', 'a.png'));
      const r = renderDiagramFileSync(path.join(dir, 'diagramSrc', 'a.mmd'), {
        lectureDir: dir,
      });
      assert.equal(r.skipped, true);
      assert.ok(r.pngPath.endsWith(path.join('diagrams', 'a.png')));
      assert.ok(typeof r.markdownRef === 'string');
    },
  );
});

test('renderDiagramFileSync: lectureDir is required', () => {
  assert.throws(() => renderDiagramFileSync('x.mmd'), /lectureDir/);
});

// ===========================================================================
// buildLecture — end-to-end wiring (hermetic, no Kroki)
// ===========================================================================

test('buildLecture: a lecture with NO diagramSrc builds unchanged (offline)', () => {
  withDir(
    {
      'lecture.md': '# No Diagrams\n\n![pic](pic.png)\n',
      'pic.png': PNG,
    },
    (dir) => {
      const html = buildLecture({ lectureDir: dir });
      assert.match(html, /^<!doctype html>/i);
      assert.ok(html.includes('data:image/png;base64,'), 'pic inlined');
    },
  );
});

test('buildLecture: diagramSrc + fresh PNGs builds offline (mtime skip, no render)', () => {
  withDir(
    {
      'lecture.md': '# With Diagrams\n\n![d](diagrams/d.png)\n',
      'diagramSrc/d.mmd': 'flowchart LR\n A-->B',
      'diagrams/d.png': PNG,
    },
    (dir) => {
      // Fresh PNG → the pre-build step stat-skips; no Kroki, no subprocess.
      touchFuture(path.join(dir, 'diagrams', 'd.png'));
      const html = buildLecture({ lectureDir: dir });
      assert.ok(
        html.includes('data:image/png;base64,'),
        'rendered diagram PNG inlined by inlineImages',
      );
    },
  );
});

test('buildLecture: nested diagramSrc mirrors to nested PNG (js-basics shape)', () => {
  withDir(
    {
      'lecture.md': '# Nested\n\n![f](diagrams/sub/f.png)\n',
      'diagramSrc/sub/f.mmd': 'flowchart LR\n A-->B',
      'diagrams/sub/f.png': PNG,
    },
    (dir) => {
      touchFuture(path.join(dir, 'diagrams', 'sub', 'f.png'));
      const html = buildLecture({ lectureDir: dir });
      assert.ok(html.includes('data:image/png;base64,'));
    },
  );
});

// ===========================================================================
// Phase 6 — referenced-aware render severity.
//
// A diagram source's output PNG is REFERENCED if its relative path appears in
// the lecture markdown (extractImageRefs, covering BOTH ![alt](path) and
// <img src="path">). On a render failure:
//   - REFERENCED   → hard fail (re-throw) — "never ship a broken deck" (dec 7).
//   - UNREFERENCED → warn + continue — a flaky Kroki / WIP / orphan source must
//     not abort a whole lecture (e.g. ajax-fetch & dom, whose nested diagramSrc/
//     mirrors to PNG paths the flat slide refs don't use).
//
// The default (no `referencedPaths`) is STRICT: the existing test
// "renderDiagramSourcesSync: propagates a hard render failure (fail loud)" pins
// that the legacy fail-loud contract holds when a caller omits the set.
// ===========================================================================

test('extractImageRefs: collects markdown ![]() and <img src>; skips absolute/data/protocol-relative', () => {
  const md = [
    '# H',
    '',
    '![a](diagrams/a.png)',
    '![b with title](./diagrams/sub/b.png "title")',
    '<img src="diagrams/c.png" alt="c">',
    "<img src='diagrams/d.png'>",
    '![remote](https://example.com/x.png)',
    '![data](data:image/png;base64,xx)',
    '![proto-rel](//cdn/y.png)',
  ].join('\n');
  const refs = extractImageRefs(md);
  assert.ok(refs.has('diagrams/a.png'), 'markdown image a');
  assert.ok(refs.has('diagrams/sub/b.png'), "markdown image b, leading './' stripped");
  assert.ok(refs.has('diagrams/c.png'), 'html <img> double-quoted src');
  assert.ok(refs.has('diagrams/d.png'), 'html <img> single-quoted src');
  assert.ok(!refs.has('https://example.com/x.png'), 'absolute http(s) skipped');
  assert.ok(!refs.has('data:image/png;base64,xx'), 'data: skipped');
  assert.ok(!refs.has('//cdn/y.png'), 'protocol-relative skipped');
  assert.equal(refs.size, 4, 'exactly the four local refs');
});

test('renderDiagramSourcesSync: UNREFERENCED render failure → warn + continue (no throw)', () => {
  withDir({ 'diagramSrc/a.mmd': 'x' }, (dir) => {
    const warns = [];
    const oWarn = console.warn;
    console.warn = (...a) => void warns.push(a.join(' '));
    let res;
    try {
      res = renderDiagramSourcesSync(dir, {
        referencedPaths: new Set(), // nothing referenced → a.png is an orphan
        render: () => {
          throw new Error('Kroki down');
        },
      });
    } finally {
      console.warn = oWarn;
    }
    assert.ok(res, 'did not throw — unreferenced failure must not abort the build');
    assert.equal(res.rendered, 0);
    assert.equal(res.softFailures.length, 1, 'recorded exactly one soft failure');
    assert.equal(
      res.softFailures[0].outRel,
      ['diagrams', 'a.png'].join('/'),
      'relative output path recorded',
    );
    assert.match(res.softFailures[0].message, /unreferenced/i);
    assert.match(res.softFailures[0].message, /Kroki down/, 'underlying error surfaced');
    assert.ok(warns.some((w) => /unreferenced/i.test(w)), 'warned to stderr');
  });
});

test('renderDiagramSourcesSync: REFERENCED render failure → throws (hard fail preserved)', () => {
  withDir({ 'diagramSrc/a.mmd': 'x' }, (dir) => {
    assert.throws(
      () =>
        renderDiagramSourcesSync(dir, {
          referencedPaths: new Set(['diagrams/a.png']),
          render: () => {
            throw new Error('Kroki down');
          },
        }),
      /Kroki down/,
      'a referenced output that fails to render must hard-fail',
    );
  });
});

test('renderDiagramSourcesSync: mix (referenced throws + unreferenced throws) → throws', () => {
  // Two sources with distinct output PNGs: a.png is REFERENCED, b.png is NOT.
  // Both injected renders throw; the build must still hard-fail because a.png is
  // needed by the deck — the unreferenced b.png must NOT mask a real failure.
  withDir(
    {
      'diagramSrc/a.mmd': 'x',
      'diagramSrc/b.mmd': 'x',
    },
    (dir) => {
      assert.throws(
        () =>
          renderDiagramSourcesSync(dir, {
            referencedPaths: new Set(['diagrams/a.png']),
            render: () => {
              throw new Error('Kroki down');
            },
          }),
        /Kroki down/,
      );
    },
  );
});

test('renderDiagramSourcesSync: ALL unreferenced + ALL throw → builds fine (no throw)', () => {
  withDir(
    {
      'diagramSrc/a.mmd': 'x',
      'diagramSrc/sub/b.mmd': 'x',
    },
    (dir) => {
      const res = renderDiagramSourcesSync(dir, {
        referencedPaths: new Set(['diagrams/flat.png']), // neither orphan referenced
        render: () => {
          throw new Error('boom');
        },
        log: false,
      });
      assert.ok(res, 'did not throw');
      assert.equal(res.softFailures.length, 2, 'both orphans soft-failed');
      assert.equal(res.rendered + res.skipped + res.stale, 0, 'nothing rendered');
    },
  );
});

test('renderDiagramSourcesSync: nested orphan output classified unreferenced (ajax-fetch/dom shape)', () => {
  // Mirrors the real regression: a nested diagramSrc/sub/x.mmd whose mirrored
  // output diagrams/sub/x.png is NOT what the slides reference (flat diagrams/x.png).
  withDir({ 'diagramSrc/sub/x.mmd': 'x' }, (dir) => {
    const res = renderDiagramSourcesSync(dir, {
      referencedPaths: new Set(['diagrams/x.png']),
      render: () => {
        throw new Error('boom');
      },
      log: false,
    });
    assert.ok(res, 'did not throw');
    assert.equal(res.softFailures.length, 1);
    assert.equal(
      res.softFailures[0].outRel,
      ['diagrams', 'sub', 'x.png'].join('/'),
      'nested mirrored output path',
    );
  });
});

test('buildLecture: UNREFERENCED failing source still produces HTML (extractImageRefs wiring)', () => {
  // End-to-end wiring: buildLecture extracts refs from the markdown and passes
  // them to the render step, so an UNREFERENCED orphan that fails to render
  // warns + continues, and the REFERENCED flat PNG still inlines.
  // Hermetic: point Kroki at an unreachable address so the orphan render fails
  // fast (connection refused) — the child renderer inherits this env var.
  const oKroki = process.env.KROKI_BASE_URL;
  process.env.KROKI_BASE_URL = 'http://127.0.0.1:1';
  try {
    withDir(
      {
        'lecture.md': '# H\n\n![ok](diagrams/flat.png)\n',
        'diagramSrc/orphan/orphan.mmd': 'flowchart LR\n A-->B',
        'diagrams/flat.png': PNG,
      },
      (dir) => {
        const html = buildLecture({ lectureDir: dir });
        assert.match(html, /^<!doctype html>/i);
        assert.ok(
          html.includes('data:image/png;base64,'),
          'the REFERENCED flat PNG is still inlined despite the orphan render failure',
        );
      },
    );
  } finally {
    if (oKroki === undefined) delete process.env.KROKI_BASE_URL;
    else process.env.KROKI_BASE_URL = oKroki;
  }
});

// ===========================================================================
// LIVE Kroki render — opt-in only (KROKI_LIVE=1). Skipped otherwise so the
// default suite is fully offline + subprocess-free.
// ===========================================================================

test(
  'LIVE renderDiagramFileSync: renders a tiny Mermaid → real PNG on disk',
  { skip: !RUN_LIVE },
  () => {
    withDir(
      {
        'diagramSrc/tiny.mmd': 'flowchart LR\n  A-->B\n',
      },
      (dir) => {
        const r = renderDiagramFileSync(path.join(dir, 'diagramSrc', 'tiny.mmd'), {
          lectureDir: dir,
        });
        assert.equal(r.skipped, false);
        const buf = fs.readFileSync(r.pngPath);
        assert.ok(buf.length > 100, 'non-trivial PNG');
        assert.deepEqual(
          Array.from(buf.slice(0, 8)),
          [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
          'must start with the PNG signature',
        );
      },
    );
  },
);
