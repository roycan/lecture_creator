// scripts/test/split-slides.test.js
//
// Unit tests for splitSlides (Phase 2a). Verifies the token-based, depth-aware
// split ported from the browser tool's processMarkdown().

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { splitSlides } from '../lib/split-slides.mjs';
import { inlineImages } from '../lib/inline-images.mjs';

test('offline patch: git-github renders zero external image requests; fenced teaching examples intact', () => {
  const md = fs.readFileSync(new URL('../../lectures/git-github/lecture.md', import.meta.url), 'utf8');
  const slides = splitSlides(md);
  // no rendered slide may carry an external image request
  slides.forEach((s, i) => {
    assert.ok(!/<img[^>]*src="https?:/i.test(s.html), `slide ${i + 1} renders an external image`);
  });
  // the profile-README teaching example survives as CODE, with its badge/stats URLs
  const example = slides.find((s) => s.html.includes('img.shields.io'));
  assert.ok(example, 'example profile README block still present');
  assert.match(example.html, /github-readme-stats\.vercel\.app/, 'stats example survives as code');
  assert.match(example.html, /<code/, 'examples remain fenced code, not images');
  // all four technology names retained on the slide
  for (const name of ['HTML5', 'CSS3', 'JavaScript', 'Node.js']) {
    assert.ok(example.html.includes(name), `technology name retained: ${name}`);
  }
  // the local offline explanation reaches narration extraction
  const spoken = slides.flatMap((s) => s.sentences).join(' ');
  assert.ok(spoken.includes('badges and stats card'), 'offline explanation reaches narration');
  assert.ok(spoken.includes('repositories and developer activity'), 'profile point narrated');
  assert.ok(!spoken.includes('github-readme-stats.vercel.app'), 'URLs are never narrated');
});

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

test('Phase D: splitSlides returns build-time narration sentences', () => {
  const md = [
    '# Title',
    '',
    'A plain paragraph.',
    '',
    '```js',
    'const x = 1;',
    '```',
  ].join('\n');
  const slides = splitSlides(md);
  assert.ok(Array.isArray(slides[0].sentences), 'sentences field exists');
  assert.deepEqual(slides[0].sentences, ['Title', 'A plain paragraph.']);
  assert.match(slides[0].html, /const x = 1;/, 'html still renders the code block');
  assert.ok(
    !slides[0].sentences.join(' ').includes('const x'),
    'code content is excluded from narration'
  );
});

test('Phase D: inlineImages preserves extra slide fields (sentences survive inlining)', () => {
  const slides = [
    {
      html: '<img src="data:image/png;base64,AA" alt="x"><p>Hi</p>',
      sentences: ['A kept sentence.', 'Second.'],
    },
  ];
  const out = inlineImages(slides, { lectureDir: '/does/not/matter', onMissing: 'warn' });
  assert.deepEqual(out[0].sentences, ['A kept sentence.', 'Second.']);
  assert.equal(out[0].html, slides[0].html, 'html pass-through unchanged');

  // empty-html branch preserves fields too
  const out2 = inlineImages([{ html: '', sentences: ['kept too'] }], {
    lectureDir: '/does/not/matter',
    onMissing: 'warn',
  });
  assert.deepEqual(out2[0].sentences, ['kept too']);
  assert.equal(out2[0].html, '');
});

test('figure surface wrappers: survive rendering, keep alt for narration, leave splitting and unwrapped images unchanged', () => {
  const md = [
    'Intro paragraph.',
    '',
    '<figure class="light-surface">',
    '',
    '![Wrapped alt text.](diagrams/x.png)',
    '',
    '</figure>',
    '',
    'Tail paragraph.',
  ].join('\n');
  const slides = splitSlides(md);
  assert.equal(slides.length, 1, 'a wrapper must not change slide splitting');
  assert.match(slides[0].html, /<figure class="light-surface">/, 'figure class survives rendering');
  assert.match(slides[0].html, /<img src="diagrams\/x\.png" alt="Wrapped alt text\."/, 'image renders inside the wrapper');
  assert.ok(slides[0].sentences.includes('Wrapped alt text.'), 'alt reaches narration extraction inside the wrapper');
  assert.ok(slides[0].sentences.includes('Intro paragraph.'), 'surrounding prose unaffected');

  // unwrapped images retain their current behavior (no figure, same image + alt)
  const plain = splitSlides('Plain lead.\n\n![Plain alt.](diagrams/y.png)\n');
  assert.equal(plain.length, 1);
  assert.ok(!plain[0].html.includes('<figure'), 'no figure added to unwrapped images');
  assert.match(plain[0].html, /<p><img src="diagrams\/y\.png" alt="Plain alt\."/);
  assert.ok(plain[0].sentences.includes('Plain alt.'), 'unwrapped alt behavior unchanged');
});
