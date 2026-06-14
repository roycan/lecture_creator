// scripts/lib/split-slides.mjs
//
// Shared core — splits a Markdown lecture into presentation slides using the
// marked *token stream* (no DOM), so it runs identically in Node (CLI/server).
//
// Ported from the original browser tool's processMarkdown() (now archive/reorg-2026-06/app.js:95), which
// split on EVERY heading via a DOM walk. Real lectures use ### / #### as
// sub-content *inside* a section, so splitting on all headings shattered long
// decks into dozens of micro-slides. This port splits on headings up to
// `splitDepth` (default 2 -> # and ##) per context.md §7, and keeps deeper
// headings as content within the current slide.
//
// Design:
//   - marked.lexer(md) -> flat token array (headings carry `.depth`).
//   - A slide boundary is a heading token with depth <= splitDepth.
//   - Reference definitions live on the token list as `.links`; we copy that
//     onto each slide's token bucket so inline references resolve when we
//     re-parse the subset with marked.parser.

import { marked } from 'marked';

/**
 * Split Markdown into an array of slides.
 *
 * @param {string} markdown - Raw lecture Markdown.
 * @param {{ splitDepth?: number }} [opts] - `splitDepth` (default 2): headings
 *   with depth <= splitDepth start a new slide. 1 = H1 only, 2 = H1/H2, …
 * @returns {{ html: string }[]} One `{ html }` per slide (rendered HTML).
 */
export function splitSlides(markdown, { splitDepth = 2 } = {}) {
  const text = (markdown ?? '').trim();
  if (!text) return [];

  const depth = Math.max(1, Number(splitDepth) || 2);
  const tokens = marked.lexer(text);
  // Reference definitions (link/footnote) attached to the lexer output.
  const links = tokens.links || {};

  const groups = [];
  let bucket = [];

  for (const tok of tokens) {
    const isBoundary =
      tok.type === 'heading' &&
      typeof tok.depth === 'number' &&
      tok.depth <= depth;
    if (isBoundary && bucket.length > 0) {
      groups.push(bucket);
      bucket = [];
    }
    bucket.push(tok);
  }
  if (bucket.length > 0) groups.push(bucket);

  return groups.map((g) => {
    const groupTokens = g.slice();
    // marked.parser reads `.links` off the token array it is given.
    groupTokens.links = links;
    return { html: marked.parser(groupTokens).trim() };
  });
}

export default splitSlides;
