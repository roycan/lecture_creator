// scripts/test/stage-student-assets.test.js
//
// Unit tests for the staging pipeline (Option A + Phase 2). Covers the pure
// helpers (rewriteAssetsLinks, rewritePrereqLinks, resolveSharedFallback,
// shouldExcludeAsset) plus an end-to-end temp-tree run of stageStudentAssets().

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import {
  rewriteAssetsLinks,
  rewritePrereqLinks,
  resolveSharedFallback,
  shouldExcludeAsset,
  stageStudentAssets,
} from '../stage-student-assets.mjs';

test('rewriteAssetsLinks rewrites the JSON-escaped href form by slug', () => {
  const html = String.raw`<a href=\"assets/foo.html\">open</a> and <code>assets/foo.html</code>`;
  assert.equal(
    rewriteAssetsLinks(html, 'html'),
    String.raw`<a href=\"assets/html/foo.html\">open</a> and <code>assets/foo.html</code>`,
  );
});

test('rewriteAssetsLinks leaves assets/_shared/ untouched', () => {
  const html = String.raw`<a href=\"assets/_shared/challenges/x.html\">shared</a>`;
  assert.equal(rewriteAssetsLinks(html, 'dom'), html);
});

test('rewritePrereqLinks rewrites ../slug/lecture.md -> slug.html (escaped + plain)', () => {
  assert.equal(
    rewritePrereqLinks(String.raw`<a href=\"../html/lecture.md\">p</a>`),
    String.raw`<a href=\"html.html\">p</a>`,
  );
  assert.equal(
    rewritePrereqLinks(`<a href="../css/lecture.md">p</a>`),
    `<a href="css.html">p</a>`,
  );
});

test('rewritePrereqLinks leaves non-prereq links alone', () => {
  const html = String.raw`<a href=\"assets/foo.html\">x</a> text`;
  assert.equal(rewritePrereqLinks(html), html);
});

test('resolveSharedFallback redirects an unresolved local ref to _shared/challenges', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fallback-'));
  const stageDir = tmp;
  // _shared/challenges/dashboard-starter.html exists; slug folder does NOT.
  fs.mkdirSync(path.join(stageDir, 'assets', '_shared', 'challenges'), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(stageDir, 'assets', '_shared', 'challenges', 'dashboard-starter.html'),
    's',
  );
  const html = String.raw`<a href=\"assets/dom/dashboard-starter.html\">d</a>`;
  assert.equal(
    resolveSharedFallback(html, stageDir),
    String.raw`<a href=\"assets/_shared/challenges/dashboard-starter.html\">d</a>`,
  );
});

test('resolveSharedFallback leaves a locally-resolving link unchanged', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fallback-ok-'));
  fs.mkdirSync(path.join(tmp, 'assets', 'dom'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'assets', 'dom', 'practice1.html'), 'x');
  const html = String.raw`<a href=\"assets/dom/practice1.html\">p</a>`;
  assert.equal(resolveSharedFallback(html, tmp), html);
});

test('resolveSharedFallback leaves a genuinely-missing link unchanged', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fallback-missing-'));
  const html = String.raw`<a href=\"assets/dom/ghost.html\">g</a>`;
  assert.equal(resolveSharedFallback(html, tmp), html);
});

test('shouldExcludeAsset drops solutions, quizzes, tests, dotfiles, node_modules', () => {
  for (const yes of [
    'broken-sari-sari-solution.html',
    'app.solution.js',
    'gate-g2-dom-events-solution.html',
    'quiz.md',
    'thing.test.js',
    '.gitignore',
    '.gitkeep',
    '.DS_Store',
    'node_modules',
  ]) {
    assert.equal(shouldExcludeAsset(yes), true, `${yes} should be excluded`);
  }
  for (const no of [
    'barangay-clearance-form.html',
    'gate-g3-data.json',
    'README.md',
    'manifest-store.json',
    'sw-cache-first.js',
  ]) {
    assert.equal(shouldExcludeAsset(no), false, `${no} should be kept`);
  }
});

test('stageStudentAssets: rewrites links, provisions styles.css, resolves shared, excludes solutions', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'stage-'));
  const distDir = path.join(tmp, 'dist');
  const lecturesDir = path.join(tmp, 'lectures');
  const sharedDir = path.join(tmp, 'shared');
  const stageDir = path.join(tmp, 'web');

  // Lecture: deck references a local starter, styles.css, a shared dashboard
  // starter (as if local), and a prereq lecture.
  fs.mkdirSync(path.join(lecturesDir, 'data-modeling', 'assets'), { recursive: true });
  fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(
    path.join(distDir, 'data-modeling.html'),
    [
      String.raw`<a href=\"../requirements-user-stories/lecture.md\">prereq</a>`,
      String.raw`<a href=\"assets/schema-worksheet.html\">local</a>`,
      String.raw`<a href=\"assets/styles.css\">css</a>`,
      String.raw`<a href=\"assets/dashboard-starter.html\">shared</a>`,
    ].join(' '),
  );
  fs.writeFileSync(
    path.join(lecturesDir, 'data-modeling', 'assets', 'schema-worksheet.html'),
    'starter',
  );

  // shared/: styles.css + challenges (starter kept, solution dropped).
  fs.mkdirSync(path.join(sharedDir, 'challenges'), { recursive: true });
  fs.writeFileSync(path.join(sharedDir, 'styles.css'), 'body{color:#000}');
  fs.writeFileSync(
    path.join(sharedDir, 'challenges', 'dashboard-starter.html'),
    'shared-starter',
  );
  fs.writeFileSync(
    path.join(sharedDir, 'challenges', 'dashboard-solution.html'),
    'shared-solution',
  );

  const res = stageStudentAssets({ distDir, lecturesDir, sharedDir, stageDir });

  assert.equal(res.decks, 1);
  assert.equal(res.stylesProvisioned, 1);

  const out = fs.readFileSync(path.join(stageDir, 'data-modeling.html'), 'utf8');

  // P1: prereq -> deck.
  assert.ok(out.includes(String.raw`href=\"requirements-user-stories.html\"`), 'prereq rewritten');
  // Local starter -> assets/<slug>/.
  assert.ok(out.includes(String.raw`href=\"assets/data-modeling/schema-worksheet.html\"`), 'local rewritten');
  // styles.css -> assets/<slug>/styles.css and file present (P2).
  assert.ok(out.includes(String.raw`href=\"assets/data-modeling/styles.css\"`), 'styles link rewritten');
  assert.ok(fs.existsSync(path.join(stageDir, 'assets', 'data-modeling', 'styles.css')), 'styles.css provisioned');
  // P3: shared dashboard -> _shared/challenges/.
  assert.ok(
    out.includes(String.raw`href=\"assets/_shared/challenges/dashboard-starter.html\"`),
    'shared fallback applied',
  );
  assert.ok(
    fs.existsSync(path.join(stageDir, 'assets', '_shared', 'challenges', 'dashboard-starter.html')),
    'shared starter staged',
  );

  // Excludes: solution not staged anywhere.
  assert.ok(
    !fs.existsSync(path.join(stageDir, 'assets', '_shared', 'challenges', 'dashboard-solution.html')),
    'solution excluded',
  );
});

test('stageStudentAssets throws a clear error when dist/ has no decks', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'stage-empty-'));
  assert.throws(
    () =>
      stageStudentAssets({
        distDir: path.join(tmp, 'dist'),
        lecturesDir: path.join(tmp, 'lectures'),
        sharedDir: path.join(tmp, 'shared'),
        stageDir: path.join(tmp, 'web'),
      }),
    /no \*\.html found/,
  );
});
