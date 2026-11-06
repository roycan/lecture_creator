// scripts/lib/narration-text.mjs
// Phase D: build-time narration content extraction + sentence segmentation.
//
// Pure by design: marked token stream IN -> spoken text OUT. No DOM, no I/O,
// no dependency beyond the token shapes marked produces (pinned by
// scripts/test/narration-text.test.js). The playback controller stays
// presentation-free; this module knows nothing about playback.
//
// Content policy (Phase D authorization sec. 2, validated against the 30-deck
// corpus BEFORE the raw-HTML rule was fixed):
//   - headings / paragraphs / individual list items -> blocks, document order
//   - links -> descriptive text only; bare URL autolinks skipped
//   - images -> non-empty alt text only
//   - code fences and mermaid source -> excluded (token type 'code')
//   - inline code spans -> included verbatim as content (no backtick delimiters)
//   - blockquotes -> recursed like any block container
//   - tables -> one block per row, each cell prefixed with its column heading
//   - hr / space / link definitions -> skipped
//   - raw HTML -> ONLY allowlisted human-facing prose tags contribute
//     (summary, figcaption, caption, p, li, h1-h6); scripts, styles, form
//     controls, attributes and bare markup are dropped. Corpus evidence: the
//     30 decks contain exactly 7 block-html tokens (3 <summary> prompts, 1
//     example form whose <h2> heading is its only visible prose, 3 wrapper
//     remnants) and 350 inline html tokens (anchor tags, zero prose).
//
// Segmentation runs per block, so paragraph/list boundaries are guaranteed
// sentence boundaries. Intl.Segmenter('en', {granularity:'sentence'}) is the
// primary splitter; a conservative regex fallback covers environments
// without it. Both paths share abbreviation-merging and clause splitting.

// Abbreviations that must not end a sentence (matched on the trailing word
// before the final period). Single-letter trails (U.S.A., a.m., Ph.D) are
// handled by the length rule in endsWithAbbreviation.
const ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'rev', 'hon', 'sr', 'jr', 'st', 'mt',
  'vs', 'etc', 'eg', 'ie', 'cf', 'approx', 'no', 'fig', 'sec', 'vol', 'pp',
  'dept', 'est', 'min', 'max', 'inc', 'ltd', 'co', 'corp', 'al', 'ca',
  'us', 'uk', 'am', 'pm', 'ed', 'eds', 'uni', 'jr',
]);

// Clause-split thresholds. Provisional (Phase D authorization: "dwell /
// thresholds provisional, easy to adjust") and only ever applied to already
// extracted text - never to drop anything.
const LONG_SENTENCE = 200;   // try a clause split beyond this length
const COMMA_SENTENCE = 360;  // commas allowed only beyond this length
const MIN_CLAUSE_LEFT = 40;  // no tiny left fragment off a semicolon/dash
const MIN_COMMA_SIDE = 60;   // no tiny fragment off a comma

/**
 * True when a candidate sentence TERMINATES in an abbreviation or a
 * single-letter initial, i.e. the terminator should not split here.
 * Tolerates trailing closers (quotes/brackets) after the period.
 */
function endsWithAbbreviation(fragment) {
  // The lookbehind-style [^A-Za-z0-9] prefix anchors the capture at the
  // START of the trailing word, so long words (e.g. 'urgently.') can never
  // be mis-captured as a short tail and mistaken for an initial.
  const m = String(fragment == null ? '' : fragment)
    .trimEnd()
    .match(/(^|[^A-Za-z0-9])([A-Za-z]{1,6})\.[\u201d\u2019"'\)\]]*$/);
  if (!m) return false;
  if (m[2].length === 1) return true; // initials: U.S.A., a.m., J.K.
  return ABBREVIATIONS.has(m[2].toLowerCase());
}

/** Conservative fallback splitter for hosts without Intl.Segmenter. */
function splitFallback(text) {
  const pieces = [];
  let start = 0;
  const re = /([.!?]+[\u201d\u2019"'\)\]]*)(\s+|$)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const end = m.index + m[1].length;
    const candidate = text.slice(start, end);
    // decimals never match: '3.14' has no whitespace after the '.'
    if (endsWithAbbreviation(candidate)) continue; // keep scanning (no split)
    pieces.push(candidate);
    start = end;
  }
  if (start < text.length) pieces.push(text.slice(start));
  return pieces.length ? pieces : [text];
}

/** Primary splitter via Intl.Segmenter when available. */
function splitSegmenter(text) {
  const seg = new Intl.Segmenter('en', { granularity: 'sentence' });
  const pieces = [];
  for (const part of seg.segment(text)) pieces.push(part.segment);
  return pieces.length ? pieces : [text];
}

/** Merge any boundary whose left side ends in an abbreviation/initial. */
function mergeAbbrevBoundaries(pieces) {
  const out = [];
  for (const piece of pieces) {
    if (out.length > 0 && endsWithAbbreviation(out[out.length - 1].trimEnd())) {
      out[out.length - 1] += piece; // re-join: content preserved verbatim
    } else {
      out.push(piece);
    }
  }
  return out;
}

/** Find the first valid clause split index for a separator, or -1. */
function findSplit(s, sep, minLeft) {
  let i = s.indexOf(sep);
  while (i !== -1) {
    if (i >= minLeft && i + sep.length < s.length) return i + sep.length;
    i = s.indexOf(sep, i + 1);
  }
  return -1;
}

/** First comma with both sides substantial, or -1. */
function findCommaSplit(s) {
  let i = s.indexOf(', ');
  while (i !== -1) {
    if (i >= MIN_COMMA_SIDE && s.length - (i + 2) >= MIN_COMMA_SIDE) return i + 2;
    i = s.indexOf(', ', i + 1);
  }
  return -1;
}

/**
 * Conservative clause splitting for genuinely long sentences. Semicolons
 * and em/en dashes are preferred; commas are a last resort and only past
 * COMMA_SENTENCE. Separators stay attached to the left piece, splits are
 * strictly shrinking (terminating), and NOTHING is ever dropped.
 */
function clauseSplit(s) {
  if (s.length <= LONG_SENTENCE) return [s];
  for (const sep of ['; ', ' \u2014 ', ' \u2013 ']) {
    const at = findSplit(s, sep, MIN_CLAUSE_LEFT);
    if (at !== -1) {
      return [...clauseSplit(s.slice(0, at)), ...clauseSplit(s.slice(at))];
    }
  }
  if (s.length > COMMA_SENTENCE) {
    const at = findCommaSplit(s);
    if (at !== -1) {
      return [...clauseSplit(s.slice(0, at)), ...clauseSplit(s.slice(at))];
    }
  }
  return [s];
}

/**
 * Split one block of text into spoken sentences.
 *
 * @param {string} blockText
 * @param {{ segmenter?: object|null }} [opts] - `segmenter: null` forces the
 *   fallback path (used by tests); a segmenter-like object is used as-is;
 *   otherwise Intl.Segmenter is used when available, else the fallback.
 * @returns {string[]} trimmed non-empty sentences, in order. The pieces are
 *   a strict partition of the input up to outer whitespace: no word,
 *   punctuation or separator is ever added or removed.
 */
export function segmentSentences(blockText, opts = {}) {
  const text = String(blockText == null ? '' : blockText);
  if (!text.trim()) return [];
  let raw;
  if (opts.segmenter === null) {
    raw = splitFallback(text);
  } else if (opts.segmenter && typeof opts.segmenter.segment === 'function') {
    const pieces = [];
    for (const part of opts.segmenter.segment(text)) pieces.push(part.segment);
    raw = pieces.length ? pieces : [text];
  } else if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    raw = splitSegmenter(text);
  } else {
    raw = splitFallback(text);
  }
  const merged = mergeAbbrevBoundaries(raw);
  const out = [];
  for (const piece of merged) {
    for (const sub of clauseSplit(piece)) {
      const t = sub.trim();
      if (t) out.push(t);
    }
  }
  return out.length ? out : [text.trim()];
}

// ---------------------------------------------------------------------------
// Token walking
// ---------------------------------------------------------------------------

function normalize(s) {
  return String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
}

function addBlock(out, s) {
  const t = normalize(s);
  if (t) out.push(t);
}

/** Visible text of a raw-HTML fragment with tags removed and entities decoded. */
function stripTags(s) {
  return normalize(
    String(s)
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&'),
  );
}

/** Bare URL / autolink detection: spoken only when it is also the raw URL. */
function isBareUrl(text) {
  return /^(https?:\/\/|www\.)\S+$/i.test(String(text || '').trim());
}

/** Render one inline token to spoken text. */
function inlineOne(tok) {
  if (!tok || typeof tok !== 'object') return '';
  switch (tok.type) {
    case 'text':
    case 'escape':
      return tok.tokens && tok.tokens.length
        ? inlineToText(tok.tokens)
        : normalize(tok.text);
    case 'em':
    case 'strong':
    case 'del':
      return tok.tokens && tok.tokens.length
        ? inlineToText(tok.tokens)
        : normalize(tok.text);
    case 'link': {
      const text =
        tok.tokens && tok.tokens.length ? inlineToText(tok.tokens) : normalize(tok.text);
      return isBareUrl(text) ? '' : text; // descriptive text in, raw URL out
    }
    case 'image':
      return normalize(tok.text); // alt text; empty alt contributes nothing
    case 'codespan':
      return String(tok.text == null ? '' : tok.text); // verbatim, no backticks
    case 'br':
      return ' ';
    case 'html':
      // Inline raw markup: only <br>-like tags contribute spacing; anchors
      // and wrappers contribute nothing (their prose lives in sibling tokens).
      return /^\s*<br\s*\/?>\s*$/i.test(String(tok.raw == null ? tok.text : tok.raw))
        ? ' '
        : '';
    default:
      if (tok.tokens && tok.tokens.length) return inlineToText(tok.tokens);
      return tok.type === 'html' ? '' : normalize(tok.text);
  }
}

function inlineToText(tokens) {
  const parts = [];
  for (const tok of tokens || []) {
    const s = inlineOne(tok);
    if (s) parts.push(s);
  }
  return parts.join(' ');
}

const HTML_PROSE_TAG = /^(summary|figcaption|caption|p|li|h[1-6])$/i;

function extractHtmlBlock(tok, out) {
  let raw = String(tok.raw == null ? tok.text : tok.raw);
  raw = raw
    .replace(/<script[\s\S]*?<\/script\s*>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style\s*>/gi, ' ');
  const re = /<(summary|figcaption|caption|p|li|h[1-6])\b[^>]*>([\s\S]*?)<\/\1\s*>/gi;
  let m;
  while ((m = re.exec(raw)) !== null) {
    if (HTML_PROSE_TAG.test(m[1])) addBlock(out, stripTags(m[2]));
  }
  // Everything else in a raw-HTML block (form controls, attributes, bare
  // markup, loose text with no prose wrapper) is dropped by design.
}

function cellText(cell) {
  if (!cell || typeof cell !== 'object') return '';
  if (Array.isArray(cell.tokens) && cell.tokens.length) return inlineToText(cell.tokens);
  return normalize(cell.text);
}

function extractTable(tok, out) {
  const header = (tok.header || []).map(cellText);
  for (const row of tok.rows || []) {
    const parts = [];
    (row || []).forEach((cell, i) => {
      const value = cellText(cell);
      if (!value) return;
      const label = header[i];
      parts.push(label ? label + ': ' + value : value);
    });
    if (parts.length) addBlock(out, parts.join(', '));
  }
}

function walkBlocks(tokens, out) {
  for (const tok of tokens || []) {
    if (!tok || typeof tok !== 'object') continue;
    switch (tok.type) {
      case 'space':
      case 'hr':
      case 'def':
        break;
      case 'heading':
      case 'paragraph':
      case 'text':
        addBlock(
          out,
          tok.tokens && tok.tokens.length ? inlineToText(tok.tokens) : tok.text,
        );
        break;
      case 'html':
        extractHtmlBlock(tok, out);
        break;
      case 'code':
        break; // code fences + mermaid source: never spoken
      case 'blockquote':
      case 'list_item':
        walkBlocks(tok.tokens, out);
        break;
      case 'list':
        walkBlocks(tok.items, out);
        break;
      case 'table':
        extractTable(tok, out);
        break;
      default:
        if (Array.isArray(tok.items)) walkBlocks(tok.items, out);
        else if (Array.isArray(tok.tokens)) walkBlocks(tok.tokens, out);
        else if (tok.type !== 'image') addBlock(out, tok.text);
        break;
    }
  }
}

/**
 * Extract narration blocks from a marked token array (a splitSlides token
 * group). Returns UNSEGMENTED blocks in document order; pair with
 * segmentSentences() per block to get spoken sentences.
 *
 * @param {object[]} tokens - marked.lexer output (or one split group).
 * @returns {string[]}
 */
export function extractNarration(tokens) {
  const blocks = [];
  walkBlocks(tokens, blocks);
  return blocks;
}

export default { extractNarration, segmentSentences };