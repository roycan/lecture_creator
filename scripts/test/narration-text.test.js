// scripts/test/narration-text.test.js
//
// Phase D: extraction helper + sentence segmentation tests. Behavior-level
// throughout: markdown IN -> expected spoken blocks/sentences OUT. Every
// applicable fixture also gets a losslessness assertion (no word, punctuation
// or meaningful separator may be added or removed by segmentation).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { marked } from 'marked';
import { extractNarration, segmentSentences } from '../lib/narration-text.mjs';

const blocks = (md) => extractNarration(marked.lexer(md));

/** Segmentation may only re-partition: joined output ~must equal input~. */
function assertLossless(text, sentences, label = '') {
  const stripAll = (s) => s.replace(/\s+/g, '');
  assert.equal(
    stripAll(sentences.join('')),
    stripAll(text),
    `losslessness violated ${label}: ${JSON.stringify(sentences)}`,
  );
}

function assertLosslessAll(md, { segmenter } = {}) {
  for (const block of blocks(md)) {
    const opts = segmenter === undefined ? {} : { segmenter };
    assertLossless(block, segmentSentences(block, opts), `(${JSON.stringify(block.slice(0, 40))})`);
  }
}

// ---------------------------------------------------------------------------
// Extraction: structure and document order
// ---------------------------------------------------------------------------

test('extraction: headings, paragraphs and list items in document order', () => {
  const md = [
    '# Encapsulation',
    '',
    'First paragraph.',
    '',
    '- First item',
    '- Second item',
    '',
    '## Second section',
    '',
    '1. Ordered one',
    '2. Ordered two',
    '',
    'Last paragraph.',
  ].join('\n');
  assert.deepEqual(blocks(md), [
    'Encapsulation',
    'First paragraph.',
    'First item',
    'Second item',
    'Second section',
    'Ordered one',
    'Ordered two',
    'Last paragraph.',
  ]);
});

test('extraction: sub-headings inside a section stay ordered blocks', () => {
  const md = '## CSS Selectors\n\n### Element Selectors\n\nbody { }\n\n### Class Selectors\n\n.box { }\n';
  assert.deepEqual(blocks(md), [
    'CSS Selectors',
    'Element Selectors',
    'body { }',
    'Class Selectors',
    '.box { }',
  ]);
});

// ---------------------------------------------------------------------------
// Links and images
// ---------------------------------------------------------------------------

test('extraction: descriptive link text in, raw destination URL out; bare autolinks skipped', () => {
  const md = [
    'Read the [MDN docs page](https://developer.mozilla.org/en-US/) for details.',
    '',
    '<https://example.com/guide>',
    '',
    'See [the docs](https://example.com/reference) again.',
  ].join('\n');
  const b = blocks(md);
  assert.ok(b.includes('Read the MDN docs page for details.'));
  assert.ok(b.includes('See the docs again.'));
  assert.equal(b.length, 2, 'the bare-autolink paragraph contributes no block');
  assert.ok(!b.join(' ').includes('https://'), 'no raw URL is ever spoken');
});

test('extraction: image alt text is spoken when descriptive, skipped when empty', () => {
  const md = [
    '![Architecture diagram of the request lifecycle](img/arch.png) explains the flow.',
    '',
    '![](blank.png)',
  ].join('\n');
  assert.deepEqual(blocks(md), [
    'Architecture diagram of the request lifecycle explains the flow.',
  ]);
});

// ---------------------------------------------------------------------------
// Code and Mermaid exclusion; inline code inclusion
// ---------------------------------------------------------------------------

test('extraction: code fences and Mermaid source are excluded, prose around them kept', () => {
  const md = [
    'Before the example.',
    '',
    '```js',
    'const DO_NOT_SPOKEN = "secret";',
    '```',
    '',
    '```mermaid',
    'graph TD; A-->B;',
    '```',
    '',
    'After the example.',
  ].join('\n');
  const b = blocks(md);
  assert.deepEqual(b, ['Before the example.', 'After the example.']);
  assert.ok(!b.join(' ').includes('DO_NOT_SPOKEN'));
  assert.ok(!b.join(' ').includes('graph TD'));
});

test('extraction: inline code spans are spoken verbatim without backtick delimiters', () => {
  const md = 'Set `box-sizing: border-box` for the layout.\n\n## Using `useState` for state\n';
  assert.deepEqual(blocks(md), [
    'Set box-sizing: border-box for the layout.',
    'Using useState for state',
  ]);
});

// ---------------------------------------------------------------------------
// Tables and blockquotes
// ---------------------------------------------------------------------------

test('extraction: table rows become blocks with cells associated to column headings', () => {
  const md = [
    '| Keyword | Meaning |',
    '| --- | --- |',
    '| class | defines a blueprint |',
    '| instance | one created object |',
  ].join('\n');
  assert.deepEqual(blocks(md), [
    'Keyword: class, Meaning: defines a blueprint',
    'Keyword: instance, Meaning: one created object',
  ]);
  const spoken = blocks(md).join(' ');
  assert.ok(!spoken.includes('---'), 'the separator row is never spoken');
});

test('extraction: blockquotes are recursed and their prose included in order', () => {
  const md = '> Remember: encapsulation hides state.\n> Second line of the quote.\n\nAfter the quote.\n';
  const b = blocks(md);
  assert.equal(b.length, 2);
  assert.match(b[0], /Remember: encapsulation hides state\./);
  assert.match(b[0], /Second line of the quote\./);
  assert.equal(b[1], 'After the quote.');
});

// ---------------------------------------------------------------------------
// Raw HTML (real corpus examples)
// ---------------------------------------------------------------------------

test('raw HTML: keeps <summary> prose (corpus: oop-classes), drops form markup (corpus: localstorage)', () => {
  // Real shape from lectures/oop-classes/lecture.md: an html block ends at
  // the blank line; the markdown after it must still be extracted.
  const details = [
    '<details>',
    '<summary>Check your predictions (click to expand)</summary>',
    '',
    '- Prediction one',
  ].join('\n');
  const b = blocks(details + '\n\nNext section.\n');
  assert.ok(b.includes('Check your predictions (click to expand)'));
  assert.ok(b.includes('Prediction one'), 'markdown after the html block still extracted');
  assert.ok(b.includes('Next section.'));

  // Real shape from lectures/localstorage/lecture.md: heading + form example
  // in ONE html block. Only the visible heading survives; attributes, input
  // placeholders and button labels are implementation detail.
  const form = [
    '<h2>Save a Note</h2>',
    '<form id="noteForm">',
    '<input id="name" placeholder="Your name" required>',
    '<button type="submit">Save Note</button>',
    '</form>',
  ].join('\n');
  assert.deepEqual(blocks(form), ['Save a Note']);

  // Inline anchors (350 of them in the corpus) contribute nothing themselves.
  const anchored = 'Jump to <a name="section-2">the anchor point</a> in the text.\n';
  assert.deepEqual(blocks(anchored), ['Jump to the anchor point in the text.']);
});

test('raw HTML: scripts and styles never leak into narration', () => {
  const md = '<script>alert("nope");</script>\n<style>.x{color:red}</style>\n\nVisible words.\n';
  const b = blocks(md);
  assert.deepEqual(b, ['Visible words.']);
  assert.ok(!b.join(' ').includes('alert'));
  assert.ok(!b.join(' ').includes('color'));
});

// ---------------------------------------------------------------------------
// Structural tokens skipped
// ---------------------------------------------------------------------------

test('extraction: horizontal rules and link definitions are skipped', () => {
  const md = '---\n\nKeep this line.\n\n[ref]: https://example.com/target\n';
  const b = blocks(md);
  assert.deepEqual(b, ['Keep this line.']);
  assert.ok(!b.join(' ').includes('example.com'));
});

// ---------------------------------------------------------------------------
// Sentence segmentation: decimals, abbreviations, initials, quoting
// ---------------------------------------------------------------------------

test('segmentation: decimal numbers never split a sentence', () => {
  const text = 'The ratio is 3.14 times the base. It grows slowly.';
  for (const opts of [{}, { segmenter: null }]) {
    const s = segmentSentences(text, opts);
    assert.equal(s.length, 2, `path ${JSON.stringify(opts)}`);
    assert.ok(s[0].includes('3.14'));
    assertLossless(text, s);
  }
});

test('segmentation: abbreviations and initials do not split (both paths)', () => {
  const text = 'Dr. Smith visited the U.S.A. last year. Then he left.';
  for (const opts of [{}, { segmenter: null }]) {
    const s = segmentSentences(text, opts);
    assert.equal(s.length, 2, `path ${JSON.stringify(opts)} -> ${JSON.stringify(s)}`);
    assert.ok(s[0].includes('Dr. Smith'));
    assert.ok(s[0].includes('U.S.A.'));
    assertLossless(text, s);
  }
  const fig = 'The value (see Fig. 3) was stable. Everyone agreed.';
  for (const opts of [{}, { segmenter: null }]) {
    const s = segmentSentences(fig, opts);
    assert.equal(s.length, 2, `fig path ${JSON.stringify(opts)} -> ${JSON.stringify(s)}`);
    assertLossless(fig, s);
  }
});

test('segmentation: quoted and parenthesized terminators split at the closing quote (both paths)', () => {
  const text = 'He shouted "Stop immediately." Then the demo ended. The result was stable.';
  for (const opts of [{}, { segmenter: null }]) {
    const s = segmentSentences(text, opts);
    assert.equal(s.length, 3, `path ${JSON.stringify(opts)} -> ${JSON.stringify(s)}`);
    assertLossless(text, s);
  }
});

test('segmentation: paragraph and list boundaries are guaranteed sentence boundaries', () => {
  const md = 'Short line one.\n\n- Item with ending. And more\n- Second item ends here.\n';
  const b = blocks(md);
  const sentences = b.flatMap((block) => segmentSentences(block));
  assert.ok(
    !sentences.some((s) => s.includes('line one') && s.includes('Item')),
    'no sentence may span two blocks',
  );
  assert.ok(
    !sentences.some((s) => s.includes('And more') && s.includes('Second item')),
    'no sentence may span two list items',
  );
});

// ---------------------------------------------------------------------------
// Long prose and clause splitting
// ---------------------------------------------------------------------------

const RUN_ON =
  'The model kept training for hours and the loss kept falling and nobody stopped it and the logs grew huge; ' +
  'the team then decided to cap the run at twenty minutes before the next experiment began and everyone agreed ' +
  'with the plan after a short discussion about compute budget for the rest of the week';

test('clause splitting: genuinely long sentences split at semicolons, conservatively', () => {
  assert.ok(RUN_ON.length > 200, 'fixture must exceed the long-sentence threshold');
  const s = segmentSentences(RUN_ON);
  assert.equal(s.length, 2, `expected one semicolon split, got ${s.length}`);
  assert.ok(s[0].endsWith(';'), 'separator stays attached to the left piece');
  assertLossless(RUN_ON, s);
  // Fallback shares the clause stage:
  const f = segmentSentences(RUN_ON, { segmenter: null });
  assert.equal(f.length, 2);
  assertLossless(RUN_ON, f);
});

test('clause splitting: short sentences with semicolons are NOT split', () => {
  const short = 'Use flex for rows; use grid for columns. Pick one.';
  assert.equal(segmentSentences(short).length, 2, 'two real sentences stay two');
  const one = segmentSentences(short)[0];
  assert.ok(one.includes(';'), 'the semicolon sentence is untouched');
  assert.equal(segmentSentences(short, { segmenter: null }).length, 2);
});

test('clause splitting: comma-only run-ons split only past the comma threshold', () => {
  const parts = [];
  for (let i = 0; i < 14; i++) {
    parts.push('the incremental change was discussed at length by everyone present in the room');
  }
  const commaRunOn = parts.join(', ') + '.';
  assert.ok(commaRunOn.length > 360, 'fixture exceeds the comma threshold');
  const s = segmentSentences(commaRunOn);
  assert.ok(s.length >= 2, 'comma run-on is broken into clauses');
  assertLossless(commaRunOn, s);
  // Same content just under the threshold stays whole:
  const small = segmentSentences('One, two and three remain together here.');
  assert.equal(small.length, 1, 'below threshold: no comma fragmentation');
});

test('clause splitting: em-dash clauses are preferred over commas', () => {
  const dash =
    'The engine kept listening for another full second after the event — and the team could not explain ' +
    'why the callback fired twice in a row during the cold start of the very first narration attempt today ' +
    'before anyone reached for the debugger';
  assert.ok(dash.length > 200);
  const s = segmentSentences(dash);
  assert.equal(s.length, 2, `expected one dash split, got ${s.length}`);
  assert.ok(s[0].includes('—'), 'separator preserved');
  assertLossless(dash, s);
});

// ---------------------------------------------------------------------------
// Losslessness across every fixture + no truncation
// ---------------------------------------------------------------------------

const KITCHEN_SINK = [
  '# Slide title with `inline code`',
  '',
  'A paragraph with a [link](https://x.test/y), **bold** text, 3.14 and Dr. Smith.',
  '',
  '- Item one with a semicolon; and more',
  '- Item two',
  '',
  '> A quoted line worth speaking.',
  '',
  '| A | B |',
  '| --- | --- |',
  '| 1 | 2 |',
  '',
  '```js',
  'const dropped = true;',
  '```',
  '',
  'Closing paragraph with an emoji-free finish.',
].join('\n');

test('losslessness: every fixture block round-trips through both segmentation paths', () => {
  assertLosslessAll(KITCHEN_SINK);
  assertLosslessAll(KITCHEN_SINK, { segmenter: null });
  const longMd = RUN_ON + '.\n\n' + 'Trailing block ends now.\n';
  assertLosslessAll(longMd);
  assertLosslessAll(longMd, { segmenter: null });
});

test('no truncation: every word of the source reaches the spoken output', () => {
  const spoken = blocks(KITCHEN_SINK).flatMap((b) => segmentSentences(b)).join(' ');
  for (const word of ['Slide', 'title', 'inline', 'code', 'paragraph', 'link', 'bold',
    '3.14', 'Smith', 'semicolon', 'Item', 'quoted', 'finish']) {
    assert.ok(spoken.includes(word), `word missing from speech: ${word}`);
  }
  assert.ok(!spoken.includes('dropped'), 'code content must not appear');
});

// ---------------------------------------------------------------------------
// Edge inputs
// ---------------------------------------------------------------------------

test('edge cases: empty inputs produce empty output, not exceptions', () => {
  assert.deepEqual(extractNarration([]), []);
  assert.deepEqual(segmentSentences(''), []);
  assert.deepEqual(segmentSentences('   \n  '), []);
  assert.deepEqual(segmentSentences('', { segmenter: null }), []);
});

test('fallback path: covers environments without Intl.Segmenter end-to-end', () => {
  const md = 'First sentence here. Dr. Smith spoke. Done.\n';
  const b = blocks(md);
  assert.equal(b.length, 1);
  const s = segmentSentences(b[0], { segmenter: null });
  assert.equal(s.length, 3, `fallback split -> ${JSON.stringify(s)}`);
  assert.ok(s[1].includes('Dr. Smith'), 'abbreviation guard holds in fallback');
  assertLossless(b[0], s);
});