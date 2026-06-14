// scripts/test/routes.test.js
//
// Phase 5 — Express route tests (supertest) + zero-external-URL integration proof.
//
// Three layers:
//   1. Hermetic route tests — createApp({ lecturesDir: tmp }) + throwaway fixtures
//      (mirrors cli.test.js's withLectures convention: nothing depends on repo
//      content, so the suite is stable + fast).
//   2. Zero-external-URL integration — fixture build → assert no external resource
//      URLs (the "offline proof" from context.md §5, broader than the existing
//      cdnjs/jsdelivr assertions in bundle-libs.test.js).
//   3. Real-repo read smokes — createApp() against the real lectures/ tree.
//      NON-hermetic (clearly marked); uses robust non-count assertions so adding
//      a lecture never breaks the suite.
//
// The factory refactor (createApp) makes layers 1+2 hermetic; supertest imports
// the app object directly — no port binding, no boot-timing race.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import request from 'supertest';

import { createApp } from '../../server/app.js';

// --- fixtures ----------------------------------------------------------------
// Bytes need not be a *valid* image: inlineImages only cares about file
// existence + extension (same convention as cli.test.js).
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x01]);

// Minimal lecture markdown with a local image (clean — zero external URLs).
const MD_WITH_IMAGE = [
  '# Test Lecture',
  '',
  'A slide with a local image.',
  '',
  '![diagram](diagram.png)',
  '',
  '## Second Slide',
  '',
  'Plain text only.',
].join('\n');

// --- helpers ----------------------------------------------------------------

/**
 * Build a throwaway lectures/ tree from { slug: { file: content } }, create an
 * app pointed at it, run asyncFn(app), clean up. Supports binary content
 * (Buffers) for image fixtures.
 */
async function withApp(spec, asyncFn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'routes-'));
  for (const [slug, files] of Object.entries(spec)) {
    const slugDir = path.join(root, slug);
    fs.mkdirSync(slugDir, { recursive: true });
    for (const [name, content] of Object.entries(files)) {
      const full = path.join(slugDir, name);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, content);
    }
  }
  const app = createApp({ lecturesDir: root });
  try {
    return await asyncFn(app);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

/**
 * Regex: an external resource URL in a `src=` attribute — the offline-breaking
 * kind (images, scripts, iframes). The `\\?` makes the backslash optional
 * because renderPresentation() stores slide HTML inside JSON.stringify()
 * (template.mjs:57), so attribute quotes are escaped as `src=\"https://...\"`.
 * Deliberately ignores `data:` URIs (which start with `data:`, not `http`)
 * and SVG `xmlns="http://www.w3.org/..."` decls (on `xmlns=`, not `src=`).
 * Empirically validated against a real dist/*.html build (inspect-first).
 */
const EXTERNAL_SRC_RE = /\bsrc=\\?["']https?:\/\//i;

// ==========================================================================
// LAYER 1 — Hermetic route tests (throwaway fixtures, no repo coupling)
// ==========================================================================

test('GET /health → 200 JSON { status, phase }', async () => {
  await withApp({}, async (app) => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: 'ok', phase: 'editor' });
  });
});

test('GET / → 200 HTML with fixture slug in <select>', async () => {
  await withApp(
    { 'my-talk': { 'lecture.md': MD_WITH_IMAGE } },
    async (app) => {
      const res = await request(app).get('/');
      assert.equal(res.status, 200);
      assert.match(res.headers['content-type'], /html/);
      assert.ok(
        res.text.includes('my-talk'),
        'fixture slug appears as an <option>',
      );
    },
  );
});

test('GET /api/lectures → sorted { slugs }', async () => {
  await withApp(
    {
      beta: { 'lecture.md': '# Beta' },
      alpha: { 'lecture.md': '# Alpha' },
    },
    async (app) => {
      const res = await request(app).get('/api/lectures');
      assert.equal(res.status, 200);
      assert.deepEqual(res.body.slugs, ['alpha', 'beta']);
    },
  );
});

test('GET /api/lectures/:slug (valid) → { slug, markdown }', async () => {
  await withApp(
    { 'my-talk': { 'lecture.md': MD_WITH_IMAGE } },
    async (app) => {
      const res = await request(app).get('/api/lectures/my-talk');
      assert.equal(res.status, 200);
      assert.equal(res.body.slug, 'my-talk');
      assert.equal(res.body.markdown, MD_WITH_IMAGE);
    },
  );
});

test('GET /api/lectures/:slug (unknown) → 404', async () => {
  await withApp({}, async (app) => {
    const res = await request(app).get('/api/lectures/nonexistent');
    assert.equal(res.status, 404);
  });
});

test('GET /preview/:slug (valid) → 200 HTML', async () => {
  await withApp(
    { 'my-talk': { 'lecture.md': '# Hello World' } },
    async (app) => {
      const res = await request(app).get('/preview/my-talk');
      assert.equal(res.status, 200);
      assert.ok(res.text.includes('Hello World'), 'built HTML has slide content');
    },
  );
});

test('GET /preview/:slug (invalid slug — uppercase) → 400', async () => {
  await withApp({}, async (app) => {
    const res = await request(app).get('/preview/UPPERCASE');
    assert.equal(res.status, 400);
  });
});

test('POST /preview → 200 HTML reflecting posted markdown', async () => {
  await withApp(
    { 'my-talk': { 'lecture.md': '# Placeholder' } },
    async (app) => {
      const res = await request(app)
        .post('/preview')
        .send({ slug: 'my-talk', markdown: '# Edited Slide\n\nLive preview.' });
      assert.equal(res.status, 200);
      assert.ok(res.text.includes('Edited Slide'), 'built HTML has posted content');
    },
  );
});

test('POST /preview (missing slug) → 400', async () => {
  await withApp({}, async (app) => {
    const res = await request(app).post('/preview').send({});
    assert.equal(res.status, 400);
  });
});

test('POST /export → 200 + Content-Disposition attachment', async () => {
  await withApp(
    { 'my-talk': { 'lecture.md': '# Export Me' } },
    async (app) => {
      const res = await request(app)
        .post('/export')
        .send({ slug: 'my-talk' });
      assert.equal(res.status, 200);
      assert.match(
        res.headers['content-disposition'],
        /attachment; filename="my-talk\.html"/,
      );
    },
  );
});

test('GET /nonexistent → 404', async () => {
  await withApp({}, async (app) => {
    const res = await request(app).get('/totally-nonexistent-route');
    assert.equal(res.status, 404);
  });
});

// ==========================================================================
// LAYER 2 — Zero-external-URL integration proof (the offline proof)
// ==========================================================================

test('POST /export (clean fixture) → image inlined + zero external resource URLs', async () => {
  await withApp(
    {
      'offline-talk': {
        'lecture.md': MD_WITH_IMAGE,
        'diagram.png': PNG,
      },
    },
    async (app) => {
      const res = await request(app)
        .post('/export')
        .send({ slug: 'offline-talk' });
      assert.equal(res.status, 200);
      // The local image must be inlined as a data URI, not left as a path.
      assert.ok(
        res.text.includes('data:image/png;base64,'),
        'local image inlined as data URI',
      );
      // No external resource URLs in src= attributes (the offline proof).
      assert.doesNotMatch(
        res.text,
        EXTERNAL_SRC_RE,
        'no external src= URL — offline proof',
      );
    },
  );
});

test('zero-URL assertion catches an injected external src (negative control)', async () => {
  // Proves the regex isn't vacuously true: an external image URL in the
  // markdown leaks through (inlineImages can't inline external URLs), and the
  // assertion correctly flags it.
  const mdWithLeak =
    MD_WITH_IMAGE + '\n\n![leak](https://example.com/leak.png)';
  await withApp(
    { 'leaky-talk': { 'lecture.md': mdWithLeak } },
    async (app) => {
      const res = await request(app)
        .post('/export')
        .send({ slug: 'leaky-talk' });
      assert.equal(res.status, 200);
      assert.ok(
        EXTERNAL_SRC_RE.test(res.text),
        'injected https:// src present — proves the regex catches leaks',
      );
    },
  );
});

// ==========================================================================
// LAYER 3 — Real-repo read smokes (NON-hermetic — reads the real lectures/)
// ==========================================================================

test('[real-repo] GET / → 200 with at least one lecture option', async () => {
  const app = createApp(); // real lectures/
  const res = await request(app).get('/');
  assert.equal(res.status, 200);
  assert.ok(
    res.text.includes('<option'),
    'real lectures/ yields at least one <option>',
  );
});

test('[real-repo] GET /api/lectures → non-empty slug list', async () => {
  const app = createApp();
  const res = await request(app).get('/api/lectures');
  assert.equal(res.status, 200);
  assert.ok(
    Array.isArray(res.body.slugs) && res.body.slugs.length > 0,
    'real lectures/ has at least one slug',
  );
});
