// scripts/test/template.test.js
//
// Unit tests for renderPresentation (Phase 2a) — the createSingleHTML() port.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderPresentation } from '../lib/template.mjs';

const SAMPLE = [
  { html: '<h1 id="title-slide">Title Slide</h1><p>hello world</p>' },
  { html: '<h2 id="section">Section</h2><p>content here</p>' },
];

function extractSlidesData(html) {
  const m = html.match(/ id="slides-data"[^>]*>([\s\S]*?)<\/script>/);
  assert.ok(m, '#slides-data script block should be present');
  return m[1];
}

test('returns a complete HTML document', () => {
  const html = renderPresentation(SAMPLE, { title: 'My Lecture' });
  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /<\/html>/);
});

test('injects the title into <title> (custom and default)', () => {
  assert.match(
    renderPresentation(SAMPLE, { title: 'My Lecture' }),
    /<title>My Lecture<\/title>/
  );
  assert.match(
    renderPresentation(SAMPLE),
    /<title>Lecture Presentation<\/title>/
  );
});

test('embeds slides as JSON in #slides-data and round-trips', () => {
  const html = renderPresentation(SAMPLE);
  const parsed = JSON.parse(extractSlidesData(html));
  assert.deepEqual(parsed, SAMPLE);
});

test('a </script> inside slide html is escaped and cannot break the data block', () => {
  const withCloseTag = [{ html: '<p>code example</p><pre>alert()</pre> ends </script> here' }];
  const html = renderPresentation(withCloseTag);
  const block = extractSlidesData(html);
  // The raw closing tag must be escaped (backslash form), not present literally.
  assert.ok(block.includes('<\\/script>'), 'closing tag should be escaped');
  assert.ok(!block.includes('ends </script> here'), 'no raw unescaped closing tag');
  // And it must still round-trip back to the original via JSON.parse.
  assert.deepEqual(JSON.parse(block), withCloseTag);
});

test('carries the runtime player + CDN libs (bundling deferred to Phase 2c)', () => {
  const html = renderPresentation(SAMPLE);
  assert.match(html, /\[Lecture Player\]/);
  assert.match(html, /highlight\.js/);
  assert.match(html, /mermaid/);
});

test('handles empty slide list without throwing', () => {
  const html = renderPresentation([], { title: 'Empty' });
  assert.match(html, /^<!doctype html>/i);
  // No slides -> empty JSON array embedded.
  assert.match(html, / id="slides-data"[^>]*>\[\]<\/script>/);
});
