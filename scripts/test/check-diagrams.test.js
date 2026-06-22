// scripts/test/check-diagrams.test.js
//
// Phase 3 diagram-gate tests for scripts/check.js. Covers the four new
// behaviors layered on top of the existing missing-image gate:
//
//   1. broken diagram ref (ERROR) — no source AND no PNG at the mirrored path
//   2. stale render (WARNING) — source mtime > PNG mtime
//   3. multi-format collision (WARNING) — 2+ supported sources → one PNG stem
//   4. no-diagramSrc lecture → diagram checks are a clean no-op
//   5. unsupported extensions (.txt/.md design notes) are IGNORED, not flagged
//   6. an existing PNG with no source is ACCEPTED (not broken, not stale)
//
// Plus mirror-path semantics (the curriculum-wide reality: a source at
// diagramSrc/<sub>/x.mmd renders to diagrams/<sub>/x.png and does NOT rescue a
// ref to diagrams/x.png). Every case uses throwaway temp fixtures under
// os.tmpdir() — no network, no repo content, no Kroki. Hermetic + stable.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { scanLecture, checkAll, main as checkMain } from '../check.js';

// Bytes need not be a valid image: the check is existence + mtime only.
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x01]);

// --- helpers ----------------------------------------------------------------

/** Build a throwaway lectures/ tree from { slug: { file: content } }, run
 *  asyncFn(root), clean up. Supports nested paths (e.g. 'diagramSrc/a/foo.mmd'). */
async function withLectures(spec, asyncFn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'chk-diag-'));
  for (const [slug, files] of Object.entries(spec)) {
    const slugDir = path.join(root, slug);
    fs.mkdirSync(slugDir, { recursive: true });
    for (const [name, content] of Object.entries(files)) {
      const full = path.join(slugDir, name);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, content);
    }
  }
  try {
    return await asyncFn(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

/** Set a file's atime+mtime to `daysAgo` days in the past (deterministic stale
 *  tests — no timing races). */
function age(filePath, daysAgo) {
  const t = Math.floor(Date.now() / 1000) - daysAgo * 86400;
  fs.utimesSync(filePath, t, t);
}

/** Capture console.log/error around an async fn; returns { log, err }. */
async function captureConsole(asyncFn) {
  const out = { log: [], err: [] };
  const oLog = console.log;
  const oErr = console.error;
  console.log = (...a) => void out.log.push(a.join(' '));
  console.error = (...a) => void out.err.push(a.join(' '));
  try {
    await asyncFn();
  } finally {
    console.log = oLog;
    console.error = oErr;
  }
  return out;
}

// ===========================================================================
// (1) broken diagram ref — ERROR
// ===========================================================================

test('scanLecture: diagram ref with NO source and NO png → broken (ERROR)', async () => {
  await withLectures(
    { demo: { 'lecture.md': '# Demo\n\n![x](diagrams/foo.png)\n' } },
    (root) => {
      const res = scanLecture('demo', { lecturesDir: root });
      assert.equal(res.ok, false, 'no source and no png → not ok');
      assert.equal(res.missing.length, 1);
      assert.equal(res.missing[0].diagram, true, 'flagged as a diagram ref');
      assert.equal(res.missing[0].src, 'diagrams/foo.png');
      assert.equal(res.diagrams.hasDiagramSrc, false);
    },
  );
});

test('scanLecture: a diagram ref missing but WITH a source is NOT broken', async () => {
  await withLectures(
    {
      demo: {
        'lecture.md': '# Demo\n\n![x](diagrams/foo.png)\n',
        'diagramSrc/foo.mmd': 'graph TD; A-->B',
        // no diagrams/foo.png on disk
      },
    },
    (root) => {
      const res = scanLecture('demo', { lecturesDir: root });
      assert.equal(res.ok, true, 'a source will render it at build time');
      assert.equal(res.missing.length, 0);
      assert.equal(res.diagrams.hasDiagramSrc, true);
      assert.equal(res.diagrams.sources, 1);
    },
  );
});

// ===========================================================================
// (6) existing PNG with no source → accepted
// ===========================================================================

test('scanLecture: diagram ref with an existing PNG and NO source → accepted', async () => {
  await withLectures(
    {
      demo: {
        'lecture.md': '# Demo\n\n![x](diagrams/foo.png)\n',
        'diagrams/foo.png': PNG,
      },
    },
    (root) => {
      const res = scanLecture('demo', { lecturesDir: root });
      assert.equal(res.ok, true);
      assert.equal(res.missing.length, 0);
      assert.equal(res.diagrams.stale.length, 0, 'no source → no stale check');
    },
  );
});

// ===========================================================================
// (2) stale render — WARNING
// ===========================================================================

test('scanLecture: source newer than its PNG → stale WARNING (non-fatal)', async () => {
  await withLectures(
    {
      demo: {
        'lecture.md': '# Demo\n\n![x](diagrams/foo.png)\n',
        'diagramSrc/foo.mmd': 'graph TD; A-->B',
        'diagrams/foo.png': PNG,
      },
    },
    (root) => {
      const png = path.join(root, 'demo', 'diagrams', 'foo.png');
      const src = path.join(root, 'demo', 'diagramSrc', 'foo.mmd');
      age(png, 5); // PNG 5 days old
      age(src, 0); // source fresh
      const res = scanLecture('demo', { lecturesDir: root });
      assert.equal(res.ok, true, 'stale is a WARNING, not an error');
      assert.equal(res.diagrams.stale.length, 1);
      assert.equal(res.diagrams.stale[0].pngPath, png);
      assert.equal(res.diagrams.stale[0].src, src);
      assert.match(res.diagrams.stale[0].srcRel, /diagramSrc\/foo\.mmd/);
      assert.match(res.diagrams.stale[0].pngRel, /diagrams\/foo\.png/);
    },
  );
});

test('scanLecture: PNG newer than source → NOT stale', async () => {
  await withLectures(
    {
      demo: {
        'lecture.md': '# Demo\n\n![x](diagrams/foo.png)\n',
        'diagramSrc/foo.mmd': 'graph TD; A-->B',
        'diagrams/foo.png': PNG,
      },
    },
    (root) => {
      const png = path.join(root, 'demo', 'diagrams', 'foo.png');
      const src = path.join(root, 'demo', 'diagramSrc', 'foo.mmd');
      age(png, 0); // PNG fresh
      age(src, 5); // source older
      const res = scanLecture('demo', { lecturesDir: root });
      assert.equal(res.diagrams.stale.length, 0);
      assert.equal(res.ok, true);
    },
  );
});

test('scanLecture: source whose mirrored PNG is ABSENT is not stale (will render)', async () => {
  await withLectures(
    {
      demo: {
        'lecture.md': '# Demo\n\n![x](diagrams/foo.png)\n',
        'diagramSrc/foo.mmd': 'graph TD; A-->B',
      },
    },
    (root) => {
      const res = scanLecture('demo', { lecturesDir: root });
      assert.equal(res.diagrams.stale.length, 0, 'no PNG yet → first-build case');
      assert.equal(res.ok, true);
    },
  );
});

// ===========================================================================
// (3) multi-format collision — WARNING
// ===========================================================================

test('scanLecture: two formats with the same stem → collision WARNING', async () => {
  await withLectures(
    {
      demo: {
        'lecture.md': '# Demo\n\n![x](diagrams/foo.png)\n',
        'diagramSrc/foo.mmd': 'graph TD; A-->B',
        'diagramSrc/foo.puml': '@startuml\nA-->B\n@enduml',
        'diagrams/foo.png': PNG,
      },
    },
    (root) => {
      const res = scanLecture('demo', { lecturesDir: root });
      assert.equal(res.ok, true, 'collision is a WARNING, not an error');
      assert.equal(res.diagrams.sources, 1, 'one winning job after resolution');
      assert.equal(res.diagrams.collisions.length, 1);
      assert.match(res.diagrams.collisions[0], /foo/);
      assert.match(
        res.diagrams.collisions[0],
        /keep only ONE source format/i,
        'teacher-readable guidance',
      );
    },
  );
});

// ===========================================================================
// (4) no diagramSrc → clean no-op
// ===========================================================================

test('scanLecture: no diagramSrc → diagram checks are a no-op', async () => {
  await withLectures(
    {
      demo: {
        'lecture.md': '# Demo\n\n![ok](ok.png)\n',
        'ok.png': PNG,
      },
    },
    (root) => {
      const res = scanLecture('demo', { lecturesDir: root });
      assert.equal(res.ok, true);
      assert.equal(res.diagrams.hasDiagramSrc, false);
      assert.equal(res.diagrams.sources, 0);
      assert.equal(res.diagrams.collisions.length, 0);
      assert.equal(res.diagrams.stale.length, 0);
    },
  );
});

// ===========================================================================
// (5) unsupported extensions are IGNORED, not flagged
// ===========================================================================

test('scanLecture: .txt/.md design notes in diagramSrc are ignored, not flagged', async () => {
  await withLectures(
    {
      demo: {
        'lecture.md': '# Demo\n\n![x](diagrams/foo.png)\n',
        'diagramSrc/foo.mmd': 'graph TD; A-->B',
        'diagramSrc/notes.txt': 'design notes — NOT a diagram source',
        'diagramSrc/README.md': '# design notes',
        'diagramSrc/foo.puml': '@startuml\nA-->B\n@enduml', // collides with foo.mmd
        'diagrams/foo.png': PNG,
      },
    },
    (root) => {
      const res = scanLecture('demo', { lecturesDir: root });
      assert.equal(res.diagrams.sources, 1, '.txt/.md do not count as sources');
      assert.equal(
        res.diagrams.collisions.length,
        1,
        'one collision (foo.mmd vs foo.puml) — .txt/.md do not collide',
      );
      assert.equal(res.diagrams.stale.length, 0);
      assert.equal(res.ok, true, 'ignored design notes are never errors');
    },
  );
});

// ===========================================================================
// mirror-path semantics — the curriculum-wide reality
// ===========================================================================

test('scanLecture: subfolder mirror — diagramSrc/sub/x.mmd matches diagrams/sub/x.png', async () => {
  await withLectures(
    {
      demo: {
        'lecture.md': '# Demo\n\n![x](diagrams/sub/foo.png)\n',
        'diagramSrc/sub/foo.mmd': 'graph TD; A-->B',
        // no PNG → but the mirrored source rescues it
      },
    },
    (root) => {
      const res = scanLecture('demo', { lecturesDir: root });
      assert.equal(res.ok, true, 'mirrored source → not broken even with no PNG');
      assert.equal(res.missing.length, 0);
      assert.equal(res.diagrams.sources, 1);
    },
  );
});

test('scanLecture: a source NOT at the mirrored path does NOT rescue a missing PNG', async () => {
  // Ref is diagrams/foo.png but the only source is at diagramSrc/sub/foo.mmd,
  // which renders to diagrams/sub/foo.png — a DIFFERENT path. So the ref is
  // broken. (This is exactly the ajax-fetch/dom/js-arrays-objects layout.)
  await withLectures(
    {
      demo: {
        'lecture.md': '# Demo\n\n![x](diagrams/foo.png)\n',
        'diagramSrc/sub/foo.mmd': 'graph TD; A-->B',
      },
    },
    (root) => {
      const res = scanLecture('demo', { lecturesDir: root });
      assert.equal(res.ok, false, 'no source at the mirrored path → broken');
      assert.equal(res.missing.length, 1);
      assert.equal(res.missing[0].diagram, true);
    },
  );
});

// ===========================================================================
// checkAll aggregation + main() exit codes
// ===========================================================================

test('checkAll: totalMisses counts broken refs; totalWarnings counts collisions + stale', async () => {
  await withLectures(
    {
      collide: {
        'lecture.md': '# C\n\n![x](diagrams/foo.png)\n',
        'diagramSrc/foo.mmd': 'g',
        'diagramSrc/foo.puml': '@startuml\nA-->B\n@enduml',
        'diagrams/foo.png': PNG,
      },
      staleLec: {
        'lecture.md': '# S\n\n![y](diagrams/bar.png)\n',
        'diagramSrc/bar.mmd': 'g',
        'diagrams/bar.png': PNG,
      },
      broken: {
        'lecture.md': '# B\n\n![z](diagrams/missing.png)\n',
      },
    },
    async (root) => {
      age(path.join(root, 'staleLec', 'diagrams', 'bar.png'), 5);
      age(path.join(root, 'staleLec', 'diagramSrc', 'bar.mmd'), 0);
      const { results, totalMisses, totalWarnings } = checkAll({ lecturesDir: root });
      assert.equal(results.length, 3);
      assert.equal(totalMisses, 1, 'one broken diagram ref (broken/missing.png)');
      assert.equal(totalWarnings, 2, '1 collision (collide) + 1 stale (staleLec)');
    },
  );
});

test('check main: collisions are reported but NON-FATAL (exit 0)', async () => {
  await withLectures(
    {
      warn: {
        'lecture.md': '# W\n\n![x](diagrams/foo.png)\n',
        'diagramSrc/foo.mmd': 'g',
        'diagramSrc/foo.puml': '@startuml\nA-->B\n@enduml',
        'diagrams/foo.png': PNG,
      },
    },
    async (root) => {
      const out = await captureConsole(async () => {
        assert.equal(checkMain({ lecturesDir: root }), 0, 'collision warning → exit 0');
      });
      assert.ok(out.log.some((l) => /collision/i.test(l)), 'collision reported');
      assert.ok(
        out.log.some((l) => /0 errors, 1 warning/i.test(l)),
        'summary line (collision is a warning, not an error)',
      );
    },
  );
});

test('check main: a broken diagram ref is FATAL (exit 1)', async () => {
  await withLectures(
    {
      bad: { 'lecture.md': '# B\n\n![z](diagrams/ghost.png)\n' },
    },
    async (root) => {
      const out = await captureConsole(async () => {
        assert.equal(checkMain({ lecturesDir: root }), 1);
      });
      assert.ok(
        out.err.some((e) => e.includes('diagrams/ghost.png')),
        'broken diagram ref reported on stderr',
      );
      assert.ok(
        out.err.some((e) => /no diagram source or PNG found/i.test(e)),
        'teacher-readable reason printed',
      );
    },
  );
});

test('check main: clean lecture tree → exit 0, "clean" reported on stdout', async () => {
  await withLectures(
    {
      good: {
        'lecture.md': '# G\n\n![ok](diagrams/ok.png)\n',
        'diagrams/ok.png': PNG,
      },
    },
    async (root) => {
      const out = await captureConsole(async () => {
        assert.equal(checkMain({ lecturesDir: root }), 0);
      });
      assert.ok(out.log.some((l) => /clean/i.test(l)), 'clean report on stdout');
    },
  );
});
