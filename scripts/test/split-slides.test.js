// scripts/test/split-slides.test.js
//
// Unit tests for splitSlides (Phase 2a). Verifies the token-based, depth-aware
// split ported from the browser tool's processMarkdown().

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitSlides } from '../lib/split-slides.mjs';

test('empty / whitespace-only input returns no slides', () => {
  assert.deepEqual(splitSlides(''), []);
  assert.deepEqual(splitSlides('   \n\n  '), []);
  assert.deepEqual(splitSlides(undefined), []);
});

test('H1 + two H2 sections yields three slides (depth 2 default)', () => {
  const md = [
    '# Title',
    '',
    'intro paragraph',
    '',
    '## Section A',
    '',
    'a content',
    '',
    '## Section B',
    '',
    'b content',
  ].join('\n');
  const slides = splitSlides(md);
  assert.equal(slides.length, 3);
  assert.match(slides[0].html, /<h1[^>]*>Title<\/h1>/i);
  assert.match(slides[1].html, /<h2[^>]*>Section A<\/h2>/i);
  assert.match(slides[2].html, /<h2[^>]*>Section B<\/h2>/i);
});

test('depth-2 keeps ### sub-headings INSIDE the section slide', () => {
  const md = [
    '# Lecture',
    '',
    '## CSS Selectors',
    '',
    '### Element Selectors',
    '',
    '### Class Selectors',
    '',
    'paragraph text',
  ].join('\n');
  const slides = splitSlides(md); // default depth 2
  assert.equal(slides.length, 2, 'one title slide + one section slide');
  const section = slides[1].html;
  assert.match(section, /<h2[^>]*>CSS Selectors<\/h2>/i);
  assert.match(section, /<h3[^>]*>Element Selectors<\/h3>/i);
  assert.match(section, /<h3[^>]*>Class Selectors<\/h3>/i);
});

test('#### sub-sub-headings also stay inside the parent slide', () => {
  const md = [
    '## Decision Framework',
    '',
    '#### Use When',
    '',
    'some reason',
    '',
    '#### Avoid When',
    '',
    'another reason',
  ].join('\n');
  const slides = splitSlides(md, { splitDepth: 2 });
  assert.equal(slides.length, 1);
  assert.match(slides[0].html, /<h4[^>]*>Use When<\/h4>/i);
  assert.match(slides[0].html, /<h4[^>]*>Avoid When<\/h4>/i);
});

test('splitDepth=1 splits only on H1 (## and ### stay inside)', () => {
  const md = [
    '# One',
    '',
    '## nested section',
    '',
    '### deeper',
    '',
    '# Two',
    '',
    'second top slide',
  ].join('\n');
  const slides = splitSlides(md, { splitDepth: 1 });
  assert.equal(slides.length, 2);
  assert.match(slides[0].html, /<h2[^>]*>nested section<\/h2>/i);
  assert.match(slides[0].html, /<h3[^>]*>deeper<\/h3>/i);
  assert.match(slides[1].html, /<h1[^>]*>Two<\/h1>/i);
});

test('preamble before the first heading becomes slide 1', () => {
  const md = [
    'lead-in paragraph',
    '',
    '# First Real Slide',
    '',
    'body content',
  ].join('\n');
  const slides = splitSlides(md);
  assert.equal(slides.length, 2);
  assert.match(slides[0].html, /lead-in paragraph/i);
  assert.match(slides[1].html, /<h1[^>]*>First Real Slide<\/h1>/i);
});

test('each slide has an html string property', () => {
  const slides = splitSlides('# A\n\nx\n\n# B\n\ny\n');
  assert.equal(slides.length, 2);
  for (const s of slides) {
    assert.equal(typeof s.html, 'string');
    assert.ok(s.html.length > 0);
  }
});
