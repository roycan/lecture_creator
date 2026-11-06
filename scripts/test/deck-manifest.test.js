// scripts/test/deck-manifest.test.js
//
// Validation tests for the collection-scoped numbering manifest, the numbered
// filename builder, prerequisite-link mapping, and the legacy-URL redirect
// stub. Kept independent of dist/ (gitignored): manifest-vs-source consistency
// is checked against lectures/, which is tracked.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  loadManifest,
  buildNumberedName,
  validateManifest,
  buildSlugToNumbered,
  redirectPage,
  rewritePrereqLinks,
} from '../stage-student-assets.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

test('real manifest: 29 decks, contiguous 1..29, valid slugs, excluded list', () => {
  const m = loadManifest();
  assert.equal(m.collection, 'g10-fullstack');
  assert.equal(m.decks.length, 29);
  const numbers = m.decks.map((d) => d.number);
  assert.deepEqual(numbers, Array.from({ length: 29 }, (_, i) => i + 1));
  const slugs = m.decks.map((d) => d.slug);
  assert.equal(new Set(slugs).size, 29, 'slugs unique');
  for (const s of slugs) assert.match(s, SLUG_RE);
  assert.deepEqual(m.excluded, [
    'tmc-eval360',
    'sg9-inheritance',
    'sg10-method-overriding',
    'sg11-polymorphism',
  ]);
});

test('real manifest matches lectures/ exactly (no orphan, no missing)', () => {
  const m = loadManifest();
  const dirs = fs
    .readdirSync(path.join(REPO_ROOT, 'lectures'), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  const declared = [...m.decks.map((d) => d.slug), ...m.excluded].sort();
  assert.deepEqual(declared, dirs);
});

test('buildNumberedName zero-pads to two digits', () => {
  assert.equal(buildNumberedName(1, 'course-intro'), '01-course-intro.html');
  assert.equal(buildNumberedName(7, 'requirements-user-stories'), '07-requirements-user-stories.html');
  assert.equal(buildNumberedName(29, 'oop-prototypes'), '29-oop-prototypes.html');
});

test('validateManifest accepts a consistent manifest, sorted by number', () => {
  const out = validateManifest(
    {
      decks: [
        { number: 2, slug: 'b' },
        { number: 1, slug: 'a' },
      ],
      excluded: ['c'],
    },
    ['a', 'b', 'c'],
  );
  assert.deepEqual(out, [
    { number: 1, slug: 'a' },
    { number: 2, slug: 'b' },
  ]);
});

test('validateManifest rejects a dist deck missing from the manifest', () => {
  assert.throws(
    () => validateManifest({ decks: [{ number: 1, slug: 'a' }], excluded: [] }, ['a', 'mystery']),
    /mystery\.html is neither in decks\[\] nor in excluded\[\]/,
  );
});

test('validateManifest rejects a manifest slug with no built deck', () => {
  assert.throws(
    () => validateManifest({ decks: [{ number: 1, slug: 'ghost' }], excluded: [] }, ['a']),
    /manifest slug "ghost" has no dist\/ghost\.html/,
  );
});

test('validateManifest rejects duplicate numbers, gaps, duplicate and bad slugs', () => {
  assert.throws(
    () =>
      validateManifest(
        { decks: [{ number: 1, slug: 'a' }, { number: 1, slug: 'b' }], excluded: [] },
        ['a', 'b'],
      ),
    /duplicate number 1/,
  );
  assert.throws(
    () =>
      validateManifest(
        { decks: [{ number: 1, slug: 'a' }, { number: 3, slug: 'b' }], excluded: [] },
        ['a', 'b'],
      ),
    /contiguous 1\.\.N/,
  );
  assert.throws(
    () =>
      validateManifest(
        { decks: [{ number: 1, slug: 'a' }, { number: 2, slug: 'a' }], excluded: [] },
        ['a'],
      ),
    /duplicate slug "a"|has no dist/,
  );
  assert.throws(
    () => validateManifest({ decks: [{ number: 1, slug: 'Bad Slug' }], excluded: [] }, ['a']),
    /invalid slug/,
  );
});

test('validateManifest rejects a slug both included and excluded', () => {
  assert.throws(
    () => validateManifest({ decks: [{ number: 1, slug: 'a' }], excluded: ['a'] }, ['a']),
    /both in decks\[\] and excluded\[\]/,
  );
});

test('validateManifest rejects an empty deck list', () => {
  assert.throws(() => validateManifest({ decks: [], excluded: [] }, ['a']), /decks\[\] is empty/);
});

test('buildSlugToNumbered maps every slug to its numbered filename', () => {
  const map = buildSlugToNumbered([
    { number: 3, slug: 'html' },
    { number: 4, slug: 'css' },
  ]);
  assert.deepEqual(map, { html: '03-html.html', css: '04-css.html' });
});

test('rewritePrereqLinks targets the numbered canonical deck via the map', () => {
  const map = { html: '03-html.html' };
  assert.equal(
    rewritePrereqLinks(String.raw`<a href=\"../html/lecture.md\">p</a>`, map),
    String.raw`<a href=\"03-html.html\">p</a>`,
  );
  assert.equal(
    rewritePrereqLinks(`<a href="../html/lecture.md">p</a>`, map),
    `<a href="03-html.html">p</a>`,
  );
  // Slug outside the collection falls back to the unnumbered stub URL.
  assert.equal(
    rewritePrereqLinks(`<a href="../tmc-eval360/lecture.md">t</a>`, map),
    `<a href="tmc-eval360.html">t</a>`,
  );
});

test('redirectPage: meta refresh + visible link, relative URL, no JS, no deck HTML', () => {
  const page = redirectPage('03-html.html');
  assert.ok(page.includes('<meta http-equiv="refresh" content="0; url=03-html.html">'));
  assert.ok(page.includes('<a href="03-html.html">Continue to 03-html.html</a>'));
  assert.ok(page.includes('<title>Redirecting…</title>'));
  assert.ok(!/url=(https?:)?\/\//.test(page), 'refresh target is relative');
  assert.ok(!page.includes('url=/'), 'no root-absolute target');
  assert.ok(!/<script/i.test(page), 'no JavaScript');
  assert.ok(!page.includes('slides-data'), 'no presentation content');
  assert.ok(!page.includes('slide-container'), 'no presentation content');
  assert.ok(page.length < 1024, `stub must stay tiny (got ${page.length} bytes)`);
});