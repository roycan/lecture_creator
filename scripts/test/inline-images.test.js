// scripts/test/inline-images.test.js
//
// Unit tests for inlineImages (Phase 2b): MIME detection by extension,
// relative->data-URI inlining, skip rules for absolute/data/protocol-relative
// srcs, missing-image handling (throw vs warn), SVG, unknown-extension errors,
// attribute-order robustness, and the "zero relative <img src> left"
// round-trip. Also a buildLecture() end-to-end smoke test (orchestrator wiring).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { inlineImages } from '../lib/inline-images.mjs';
import { buildLecture } from '../lib/index.mjs';

// --- fixtures ---------------------------------------------------------------
// File bytes need not be *valid* images: inlineImages only base64-encodes the
// bytes and types them by extension. (The real-image open test happens in the
// manual build of an actual lecture, not here.)
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x01]);
const JPG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const GIF = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]); // "GIF89a"
const WEBP = Buffer.from([0x52, 0x49, 0x46, 0x46]); // "RIFF"
const SVG = '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>';

// --- helpers ----------------------------------------------------------------

/** Create a temp "lecture folder" with the given files, run fn(dir), clean up. */
function withLecture(files, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'inline-img-'));
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

/** First double-quoted src in the html (null if none). */
function firstSrc(html) {
  const m = html.match(/<img\b[^>]*?\bsrc\s*=\s*"([^"]*)"/i);
  return m ? m[1] : null;
}

/** All double-quoted srcs across the html. */
function imgSrcs(html) {
  const out = [];
  const re = /<img\b[^>]*?\bsrc\s*=\s*"([^"]*)"/gi;
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}

// --- tests ------------------------------------------------------------------

test('lectureDir is required', () => {
  assert.throws(
    () => inlineImages([{ html: '<img src="a.png">' }]),
    /lectureDir/,
  );
});

test('MIME detection by extension (png/jpg/jpeg/gif/webp/svg)', () => {
  const cases = {
    'p.png': [PNG, 'image/png'],
    'p.jpg': [JPG, 'image/jpeg'],
    'p.jpeg': [JPG, 'image/jpeg'],
    'p.gif': [GIF, 'image/gif'],
    'p.webp': [WEBP, 'image/webp'],
    'p.svg': [Buffer.from(SVG), 'image/svg+xml'],
  };
  const files = Object.fromEntries(Object.entries(cases).map(([n, [b]]) => [n, b]));
  withLecture(files, (dir) => {
    for (const [name, [, mime]] of Object.entries(cases)) {
      const out = inlineImages([{ html: `<img src="${name}">` }], { lectureDir: dir });
      assert.ok(
        out[0].html.includes(`data:${mime};base64,`),
        `${name} -> ${mime}`,
      );
    }
  });
});

test('relative src is replaced with the exact base64 data URI', () => {
  withLecture({ 'a.png': PNG }, (dir) => {
    const expected = 'data:image/png;base64,' + PNG.toString('base64');
    const out = inlineImages([{ html: '<img src="a.png" alt="a">' }], { lectureDir: dir });
    assert.equal(firstSrc(out[0].html), expected);
  });
});

test('absolute, protocol-relative and data: srcs are left untouched', () => {
  const srcs = [
    'https://example.com/y.png',
    'http://example.com/y.png',
    '//cdn.example.com/y.png',
    'data:image/png;base64,AAAA',
  ];
  const html = srcs.map((s) => `<img src="${s}">`).join('');
  const out = inlineImages([{ html }], { lectureDir: '/does/not/matter' });
  for (const s of srcs) {
    assert.ok(out[0].html.includes(`src="${s}"`), `untouched: ${s}`);
  }
});

test('missing file (throw) raises an Error naming slide index + resolved path', () => {
  withLecture({}, (dir) => {
    assert.throws(
      () => inlineImages([{ html: '<img src="nope.png">' }], { lectureDir: dir }),
      (err) =>
        /slide 0/.test(err.message) &&
        err.message.includes('nope.png') &&
        err.message.includes(dir),
    );
  });
});

test('missing file (warn) leaves the src untouched and warns with slide + path', () => {
  withLecture({}, (dir) => {
    const warns = [];
    const orig = console.warn;
    console.warn = (...a) => warns.push(a.join(' '));
    try {
      const out = inlineImages(
        [{ html: '<img src="nope.png">' }],
        { lectureDir: dir, onMissing: 'warn' },
      );
      assert.equal(out[0].html, '<img src="nope.png">', 'original src preserved');
      assert.ok(
        warns.some((w) => /slide 0/.test(w) && w.includes('nope.png') && w.includes(dir)),
        'warned with detail',
      );
    } finally {
      console.warn = orig;
    }
  });
});

test('SVG is inlined as a base64 data URI', () => {
  withLecture({ 'x.svg': Buffer.from(SVG) }, (dir) => {
    const expected = 'data:image/svg+xml;base64,' + Buffer.from(SVG).toString('base64');
    const out = inlineImages([{ html: '<img src="x.svg">' }], { lectureDir: dir });
    assert.equal(firstSrc(out[0].html), expected);
  });
});

test('unsupported extension throws a clear error', () => {
  withLecture({ 'x.bmp': Buffer.from('BM') }, (dir) => {
    assert.throws(
      () => inlineImages([{ html: '<img src="x.bmp">' }], { lectureDir: dir }),
      (err) => /unsupported image extension/.test(err.message) && err.message.includes('.bmp'),
    );
  });
});

test('attribute order is irrelevant; only src is mutated', () => {
  withLecture({ 'a.png': PNG }, (dir) => {
    const expected = 'data:image/png;base64,' + PNG.toString('base64');
    const out = inlineImages(
      [{ html: '<img class="c" alt="A" src="a.png" width="10">' }],
      { lectureDir: dir },
    );
    const h = out[0].html;
    assert.ok(h.includes('class="c"'));
    assert.ok(h.includes('alt="A"'));
    assert.ok(h.includes('width="10"'));
    assert.ok(h.includes(`src="${expected}"`), 'src inlined');
  });
});

test('slides without images and empty html pass through unchanged', () => {
  const out = inlineImages(
    [{ html: '<p>no images here</p>' }, { html: '' }, {}],
    { lectureDir: '/tmp' },
  );
  assert.equal(out[0].html, '<p>no images here</p>');
  assert.equal(out[1].html, '');
  assert.equal(out[2].html, '');
});

test('round-trip: a built slide set has ZERO relative <img src> left', () => {
  withLecture({ 'a.png': PNG, 'sub/b.svg': Buffer.from(SVG) }, (dir) => {
    const slides = [
      { html: '<p>one</p><img src="a.png" alt="a">' },
      { html: '<img src="sub/b.svg"><img src="https://x/y.png">' },
    ];
    const out = inlineImages(slides, { lectureDir: dir });

    const allSrcs = out.flatMap((s) => imgSrcs(s.html));
    assert.ok(allSrcs.length >= 3, 'found the images');
    for (const s of allSrcs) {
      assert.match(s, /^(?:data:|(?:https?:)?\/\/)/i, `no relative src left: ${s}`);
    }
    assert.ok(allSrcs.some((s) => s.startsWith('data:image/png;base64,')), 'png inlined');
    assert.ok(allSrcs.some((s) => s.startsWith('data:image/svg+xml;base64,')), 'svg inlined');
  });
});

test('buildLecture() end-to-end on a fixture lecture folder', () => {
  withLecture(
    {
      'lecture.md': '# Title Slide\n\nintro\n\n## Section\n\n![alt](a.png)\n',
      'a.png': PNG,
    },
    (dir) => {
      const html = buildLecture({ lectureDir: dir });
      assert.match(html, /^<!doctype html>/i);
      assert.match(html, /<title>Title Slide<\/title>/i);
      assert.ok(html.includes('data:image/png;base64,'), 'image inlined');

      // No relative src may survive anywhere in the rendered document.
      for (const s of imgSrcs(html)) {
        assert.match(s, /^(?:data:|(?:https?:)?\/\/)/i, `no relative src: ${s}`);
      }
    },
  );
});

test('buildLecture() requires slug or lectureDir', () => {
  assert.throws(() => buildLecture({}), /provide either/);
});
