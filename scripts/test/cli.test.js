// scripts/test/cli.test.js
//
// Phase 3 CLI tests:
//   - scanMissingImages (the read-only collector, shared core)
//   - build.js  (listSlugs / buildOne / main — thin wrapper over buildLecture)
//   - check.js  (scanLecture / checkAll / main — the integrity gate, decision A)
//
// Every case uses throwaway temp fixtures: a fake lectures/ tree built under
// os.tmpdir() + a temp dist/. Nothing touches the real lectures/ or dist/, and
// nothing depends on repo content, so the suite is hermetic + stable.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { scanMissingImages } from '../lib/index.mjs';
import { listSlugs, buildOne, main as buildMain } from '../build.js';
import { scanLecture, checkAll, main as checkMain } from '../check.js';

// --- fixtures ---------------------------------------------------------------
// Bytes need not be a *valid* image: inlineImages/scanMissingImages only care
// about file existence + extension (the real-image build is a manual smoke).
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x01]);

// --- helpers ----------------------------------------------------------------

/** A single throwaway dir (for scanMissingImages, which needs one lectureDir). */
function withDir(files, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scan-'));
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), content);
  }
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/** Build a throwaway lectures/ tree from { slug: { file: content } }, run
 *  asyncFn(root), clean up. Supports async asyncFn (awaited before cleanup). */
async function withLectures(spec, asyncFn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-lect-'));
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

/** A throwaway dist dir; cleaned up after asyncFn(distDir). */
async function withDist(asyncFn) {
  const distDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-dist-'));
  try {
    return await asyncFn(distDir);
  } finally {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
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
// scanMissingImages — the read-only collector
// ===========================================================================

test('scanMissingImages: lectureDir is required', () => {
  assert.throws(
    () => scanMissingImages([{ html: '<img src="a.png">' }]),
    /lectureDir/,
  );
});

test('scanMissingImages: reports a missing relative ref with full detail', () => {
  withDir({}, (dir) => {
    const [miss] = scanMissingImages([{ html: '<img src="nope.png">' }], {
      lectureDir: dir,
    });
    assert.deepEqual(Object.keys(miss).sort(), ['resolvedPath', 'slideIndex', 'src']);
    assert.equal(miss.slideIndex, 0);
    assert.equal(miss.src, 'nope.png');
    assert.equal(miss.resolvedPath, path.join(dir, 'nope.png'));
  });
});

test('scanMissingImages: [] when every referenced file exists', () => {
  withDir({ 'a.png': PNG }, (dir) => {
    const misses = scanMissingImages([{ html: '<img src="a.png">' }], {
      lectureDir: dir,
    });
    assert.deepEqual(misses, []);
  });
});

test('scanMissingImages: absolute / data: / protocol-relative / empty srcs skipped', () => {
  withDir({}, (dir) => {
    const html = [
      '<img src="https://x/y.png">',
      '<img src="//cdn/x.png">',
      '<img src="data:image/png;base64,AAAA">',
      '<img src="">',
      '<img>',
    ].join('');
    const misses = scanMissingImages([{ html }], { lectureDir: dir });
    assert.deepEqual(misses, []);
  });
});

test('scanMissingImages: collects multiple distinct misses (not just the first)', () => {
  withDir({}, (dir) => {
    const misses = scanMissingImages(
      [{ html: '<img src="a.png"><img src="b.png">' }],
      { lectureDir: dir },
    );
    assert.equal(misses.length, 2);
    assert.deepEqual(
      misses.map((m) => m.src).sort(),
      ['a.png', 'b.png'],
    );
  });
});

test('scanMissingImages: reports every occurrence (same missing file on 2 slides → 2 records)', () => {
  withDir({}, (dir) => {
    const slides = [
      { html: '<img src="shared.png">' },
      { html: '<p>text</p><img src="shared.png">' },
    ];
    const misses = scanMissingImages(slides, { lectureDir: dir });
    assert.equal(misses.length, 2);
    assert.deepEqual(
      misses.map((m) => m.slideIndex),
      [0, 1],
    );
    assert.ok(misses.every((m) => m.src === 'shared.png'));
  });
});

test('scanMissingImages: a PRESENT file with an unsupported ext is not "missing"', () => {
  withDir({ 'weird.bmp': Buffer.from('BM') }, (dir) => {
    const misses = scanMissingImages([{ html: '<img src="weird.bmp">' }], {
      lectureDir: dir,
    });
    assert.deepEqual(
      misses,
      [],
      'file exists -> not missing (unsupported-ext is a build-time concern)',
    );
  });
});

// ===========================================================================
// build.js — thin wrapper over buildLecture
// ===========================================================================

test('listSlugs: sorted dir names, files ignored, [] if absent', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'slugs-'));
  try {
    fs.mkdirSync(path.join(root, 'b-slug'));
    fs.mkdirSync(path.join(root, 'a-slug'));
    fs.writeFileSync(path.join(root, 'README.md'), 'x'); // file, ignored
    assert.deepEqual(listSlugs({ lecturesDir: root }), ['a-slug', 'b-slug']);
    assert.deepEqual(listSlugs({ lecturesDir: path.join(root, 'nope') }), []);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('buildOne: writes a complete offline doc — doctype, image inlined, zero cdnjs/jsdelivr', async () => {
  await withLectures(
    {
      demo: {
        'lecture.md': '# Demo Lecture\n\nIntro.\n\n## Section\n\n![diagram](diagram.png)\n',
        'diagram.png': PNG,
      },
    },
    async (root) => {
      await withDist(async (distDir) => {
        const { file, bytes } = buildOne('demo', { lecturesDir: root, distDir });
        assert.ok(fs.existsSync(file), 'dist/demo.html written');
        assert.ok(bytes > 0);

        const html = fs.readFileSync(file, 'utf8');
        assert.match(html, /^<!doctype html>/i, 'complete HTML document');
        assert.ok(html.includes('data:image/png;base64,'), 'image inlined as data URI');
        assert.doesNotMatch(html, /cdnjs\.cloudflare\.com/i, 'no cdnjs URL (hljs bundled)');
        assert.doesNotMatch(html, /cdn\.jsdelivr\.net/i, 'no jsdelivr URL (mermaid bundled/omitted)');
      });
    },
  );
});

test('buildOne: fail-loud — a missing image throws and writes nothing', async () => {
  await withLectures(
    { broken: { 'lecture.md': '# Broken\n\n![nope](nope.png)\n' } },
    async (root) => {
      await withDist(async (distDir) => {
        assert.throws(
          () => buildOne('broken', { lecturesDir: root, distDir }),
          /missing image/i,
        );
        assert.ok(!fs.existsSync(path.join(distDir, 'broken.html')), 'no file written');
      });
    },
  );
});

test('build --all: isolates failures (good builds, bad reported), exit 1', async () => {
  await withLectures(
    {
      good: { 'lecture.md': '# Good\n\n![ok](ok.png)\n', 'ok.png': PNG },
      bad: { 'lecture.md': '# Bad\n\n![nope](nope.png)\n' },
    },
    async (root) => {
      await withDist(async (distDir) => {
        const out = await captureConsole(async () => {
          const code = await buildMain(['--all'], { lecturesDir: root, distDir });
          assert.equal(code, 1, '--all exits 1 when any slug fails');
        });
        assert.ok(fs.existsSync(path.join(distDir, 'good.html')), 'good.html built');
        assert.ok(!fs.existsSync(path.join(distDir, 'bad.html')), 'bad.html not built');
        assert.ok(
          out.err.some((e) => /bad.*FAILED/i.test(e)),
          'bad slug failure reported on stderr',
        );
        assert.ok(
          out.log.some((l) => /1 ok, 1 failed/i.test(l)),
          'summary line printed',
        );
      });
    },
  );
});

test('build no-args: prints usage and exits 1', async () => {
  const out = await captureConsole(async () => {
    const code = await buildMain([]);
    assert.equal(code, 1);
  });
  assert.ok(out.err.some((e) => /usage/i.test(e)), 'usage printed');
});

// ===========================================================================
// check.js — integrity gate (decision A: hard gate, exit 1 on any miss)
// ===========================================================================

test('scanLecture: clean lecture → ok, no misses', async () => {
  await withLectures(
    { ok: { 'lecture.md': '# OK\n\n![good](good.png)\n', 'good.png': PNG } },
    (root) => {
      const res = scanLecture('ok', { lecturesDir: root });
      assert.equal(res.slug, 'ok');
      assert.equal(res.ok, true);
      assert.equal(res.missing.length, 0);
    },
  );
});

test('scanLecture: broken lecture → reports {slug, slideIndex, resolvedPath, src}', async () => {
  await withLectures(
    { bad: { 'lecture.md': '# Bad\n\n![nope](nope.png)\n' } },
    (root) => {
      const res = scanLecture('bad', { lecturesDir: root });
      assert.equal(res.ok, false);
      assert.equal(res.missing.length, 1);
      const m = res.missing[0];
      assert.equal(m.slug, 'bad');
      assert.equal(m.slideIndex, 0);
      assert.equal(m.src, 'nope.png');
      assert.equal(m.resolvedPath, path.join(root, 'bad', 'nope.png'));
    },
  );
});

test('checkAll: aggregates across lectures; totalMisses counts every miss', async () => {
  await withLectures(
    {
      clean: { 'lecture.md': '# Clean\n\n![ok](ok.png)\n', 'ok.png': PNG },
      broken: { 'lecture.md': '# Broken\n\n![a](a.png)\n![b](b.png)\n' },
    },
    (root) => {
      const { results, totalMisses } = checkAll({ lecturesDir: root });
      assert.equal(results.length, 2);
      assert.equal(totalMisses, 2, 'two missing refs in broken');
      const bySlug = Object.fromEntries(results.map((r) => [r.slug, r]));
      assert.equal(bySlug.clean.ok, true);
      assert.equal(bySlug.broken.missing.length, 2);
    },
  );
});

test('check main: exit 0 clean, exit 1 on any miss', async () => {
  await withLectures(
    { clean: { 'lecture.md': '# Clean\n\n![ok](ok.png)\n', 'ok.png': PNG } },
    async (cleanRoot) => {
      const cleanOut = await captureConsole(async () => {
        assert.equal(checkMain({ lecturesDir: cleanRoot }), 0);
      });
      assert.ok(cleanOut.log.some((l) => /clean/i.test(l)), 'clean report on stdout');
    },
  );

  await withLectures(
    { bad: { 'lecture.md': '# Bad\n\n![nope](nope.png)\n' } },
    async (badRoot) => {
      const badOut = await captureConsole(async () => {
        assert.equal(checkMain({ lecturesDir: badRoot }), 1);
      });
      assert.ok(badOut.err.some((e) => e.includes('nope.png')), 'miss reported on stderr');
    },
  );
});
