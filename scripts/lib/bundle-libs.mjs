// scripts/lib/bundle-libs.mjs
//
// Shared core — returns inline-ready strings for the presentation shell's
// third-party libs (highlight.js always; mermaid only when a lecture actually
// uses a ```mermaid fence) read from vendored UMD bundles in ./vendor/.
//
// This is the Phase 2c piece that removes the last non-offline part of the
// shell: the CDN <script>/<link> tags. renderPresentation() consumes the
// strings this returns; buildLecture() decides whether to include mermaid by
// calling hasMermaid() on the source markdown (decision D4).
//
// Vendored bundles (pinned to the EXACT CDN versions the original template
// referenced, so the offline output is a faithful mirror of the online one):
//   vendor/highlight.min.js    highlight.js 11.9.0 (BSD-3-Clause)
//   vendor/github-dark.min.css hljs dark theme 11.9.0
//   vendor/github.min.css      hljs light theme 11.9.0
//   vendor/mermaid.min.js      mermaid 10.9.0 (MIT)
// (mermaid 10.9.0 is used rather than package.json's ^11.0.0 to match the
// version the template's old CDN tag loaded; mermaid.run({nodes}) is
// v10/v11-compatible.)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VENDOR_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'vendor',
);

// Read a vendored bundle as UTF-8. Throws a clear error naming the file if it
// is missing (e.g. someone deleted from ./vendor/) so the failure is obvious.
function readVendor(name) {
  const file = path.join(VENDOR_DIR, name);
  if (!fs.existsSync(file)) {
    throw new Error(
      `bundleLibs: vendored bundle not found: ${file}. Restore it from the pinned CDN versions (see ./vendor/README).`,
    );
  }
  return fs.readFileSync(file, 'utf8');
}

// Safely inline JS for use inside <script>...</script>: a literal </script>
// inside the bundle would close the host element early in the HTML parser, so
// escape it to the backslash form (which JS treats as an identical string).
export function safeInlineJs(code) {
  return String(code).replace(/<\/script>/gi, '<\\/script>');
}

// Same idea for CSS inside <style>...</style> (defensive — these hljs themes
// don't actually contain </style>, but the principle is identical and cheap).
export function safeInlineCss(css) {
  return String(css).replace(/<\/style>/gi, '<\\/style>');
}

/**
 * Build inline-ready lib strings for renderPresentation().
 *
 * @param {{ mermaid?: boolean }} [opts] - `mermaid` (default false): include
 *   the mermaid bundle string when the lecture uses a ```mermaid fence.
 * @returns {{ hljsScript: string, hljsStyleDark: string, hljsStyleLight: string,
 *   mermaidScript?: string }} Escaped bundle contents ready to drop into
 *   <style>/<script>. `mermaidScript` is omitted when `mermaid` is falsy.
 */
export function bundleLibs({ mermaid = false } = {}) {
  const bundle = {
    hljsScript: safeInlineJs(readVendor('highlight.min.js')),
    hljsStyleDark: safeInlineCss(readVendor('github-dark.min.css')),
    hljsStyleLight: safeInlineCss(readVendor('github.min.css')),
  };
  if (mermaid) {
    bundle.mermaidScript = safeInlineJs(readVendor('mermaid.min.js'));
  }
  return bundle;
}

/**
 * Detect a mermaid fenced code block in source markdown. Scans the raw `md`
 * passed to splitSlides() — NOT diagram-source files — because most lectures
 * embed pre-rendered PNGs and keep mermaid only in .mmd/diagram-src docs.
 *
 * @param {string} markdown - Raw lecture markdown.
 * @returns {boolean} true if a fenced ```mermaid block is present.
 */
export function hasMermaid(markdown) {
  const md = String(markdown ?? '');
  // An opening code fence whose info-string language is exactly "mermaid":
  // optional leading indentation, three backticks, optional spaces, "mermaid",
  // then end-of-line (optionally trailing spaces). Case-insensitive.
  return /(^|\n)[ \t]*```[ \t]*mermaid[ \t]*(\r?\n|$)/i.test(md);
}

export default bundleLibs;
