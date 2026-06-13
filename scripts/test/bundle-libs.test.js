// scripts/test/bundle-libs.test.js
//
// Phase 2c tests: bundleLibs() + hasMermaid(), the safe-inline helpers, and the
// offline proof — a built (bundled) slide doc has ZERO cdnjs/jsdelivr URLs.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// bundleLibs + hasMermaid are imported from the barrel (proves they are
// re-exported by scripts/lib/index.mjs per the Phase 2c deliverables).
import { bundleLibs, hasMermaid, buildLecture } from '../lib/index.mjs';
import { safeInlineJs, safeInlineCss } from '../lib/bundle-libs.mjs';

// A directory that genuinely exists; the synthetic fixtures below contain no
// <img>, so inlineImages never reads it — it just must be a valid path.
const EXISTING_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Any occurrence of the lib CDNs must NOT appear in a bundled (offline) export.
const CDN_URL_RE = /cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/i;

test('bundleLibs({mermaid:true}) returns all four non-empty bundle strings', () => {
  const b = bundleLibs({ mermaid: true });
  assert.equal(typeof b.hljsScript, 'string');
  assert.equal(typeof b.hljsStyleDark, 'string');
  assert.equal(typeof b.hljsStyleLight, 'string');
  assert.equal(typeof b.mermaidScript, 'string');
  assert.ok(b.hljsScript.length > 1000, 'hljsScript should be a real bundle (~120KB)');
  assert.ok(b.hljsStyleDark.length > 100, 'hljsStyleDark should be a real theme');
  assert.ok(b.hljsStyleLight.length > 100, 'hljsStyleLight should be a real theme');
  assert.ok(b.mermaidScript.length > 100000, 'mermaidScript should be a real bundle (~3MB)');
  // The pinned highlight.js version is embedded in the bundle header.
  assert.match(b.hljsScript, /Highlight\.js v11\.9\.0/);
});

test('bundleLibs({mermaid:false}) omits mermaidScript but keeps the hljs bundles', () => {
  const b = bundleLibs({ mermaid: false });
  assert.ok(b.hljsScript.length > 0);
  assert.ok(b.hljsStyleDark.length > 0);
  assert.ok(b.hljsStyleLight.length > 0);
  assert.equal(
    'mermaidScript' in b,
    false,
    'mermaidScript key must be absent (not just empty)',
  );
});

test('bundleLibs() defaults mermaid to false', () => {
  const b = bundleLibs();
  assert.equal('mermaidScript' in b, false);
});

test('emitted bundle strings contain no raw </script> or </style> (safe inline guard)', () => {
  const b = bundleLibs({ mermaid: true });
  for (const key of ['hljsScript', 'mermaidScript']) {
    assert.ok(!b[key].includes('</script>'), `${key} must not contain a raw </script>`);
  }
  for (const key of ['hljsStyleDark', 'hljsStyleLight']) {
    assert.ok(!b[key].includes('</style>'), `${key} must not contain a raw </style>`);
  }
});

test('safeInlineJs escapes </script> (case-insensitive) for <script> inlining', () => {
  assert.equal(safeInlineJs('var x = "</script>";'), 'var x = "<\\/script>";');
  // Case-insensitive MATCH, but the replacement is a fixed lowercase escape.
  assert.equal(safeInlineJs('a</SCRIPT>b'), 'a<\\/script>b');
});

test('safeInlineCss escapes </style> for <style> inlining', () => {
  assert.equal(safeInlineCss('x{}</style>'), 'x{}<\\/style>');
});

test('hasMermaid detects a fenced ```mermaid block', () => {
  assert.equal(hasMermaid('Some text\n```mermaid\ngraph LR\nA-->B\n```\n'), true);
  assert.equal(hasMermaid('```mermaid\nflowchart LR\nA-->B\n```'), true);
  // Tolerant of leading indentation and CRLF line endings.
  assert.equal(hasMermaid('  ```mermaid\r\ngraph TD\r\n```'), true);
  // Indented fence (4-space) still counts.
  assert.equal(hasMermaid('    ```mermaid\ngraph TD\n```'), true);
});

test('hasMermaid is false without a real mermaid fence', () => {
  assert.equal(hasMermaid('# Title\n\nno diagrams here'), false);
  assert.equal(hasMermaid('```js\nconst x = 1;\n```'), false);
  // The info-string language must be exactly "mermaid".
  assert.equal(hasMermaid('```mermaidflow\n'), false);
  // Inline triple-backtick text with no newline terminator is not a fence.
  assert.equal(hasMermaid('text mentioning ```mermaid inline'), false);
  assert.equal(hasMermaid(''), false);
  assert.equal(hasMermaid(undefined), false);
  assert.equal(hasMermaid(null), false);
});

test('a bundled (offline) NON-mermaid doc has zero lib-CDN URLs and no mermaid bundle', () => {
  const md = '# Intro\n\n## Code\n\n```js\nconst x = 42;\n```\n';
  const html = buildLecture({ markdown: md, lectureDir: EXISTING_DIR, title: 'No Mermaid' });
  assert.ok(!CDN_URL_RE.test(html), 'no cdnjs/jsdelivr URL should remain in a bundled doc');
  // hljs bundle inlined as two switchable <style> sheets + one <script>.
  assert.match(html, /id="hljs-style-dark"/);
  assert.match(html, /id="hljs-style-light"/);
  // Mermaid intentionally omitted for this lecture.
  assert.match(html, /Mermaid: not used by this lecture/);
});

test('a bundled (offline) MERMAID doc has zero lib-CDN URLs and inlines the mermaid bundle', () => {
  const md = '# Diagrams\n\n```mermaid\ngraph LR\nA-->B\n```\n';
  const html = buildLecture({ markdown: md, lectureDir: EXISTING_DIR, title: 'Has Mermaid' });
  assert.ok(!CDN_URL_RE.test(html), 'no cdnjs/jsdelivr URL should remain in a bundled doc');
  assert.match(html, /Mermaid Diagram Rendering \(bundled offline\)/);
});
