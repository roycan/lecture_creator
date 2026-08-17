// scripts/lib/mermaid-lint.mjs
//
// Layer 1 of mermaid syntax hardening (mermaid-check-hardening-plan.md): a
// HERMETIC, always-on structural lint over every mermaid source in the repo —
// the ```mermaid fences inside lecture.md plus the diagramSrc/**/*.mmd files.
//
// Trigger: the 2026-08-16 oop-classes incident — an unquoted pipe edge label
// `|new Product(...)|` shipped green through check/test/build and failed only
// in the browser ("Diagram could not be rendered"). Rules are deliberately
// CONSERVATIVE: each targets a demonstrated or mechanical failure class, and
// the lint errs toward no-false-positives rather than coverage. Full grammar
// validation is Layer 2 (`npm run check:mermaid`, Kroki-backed, on-demand).
//
// Rules:
//   R1 (ERROR)   unterminated fence — a ```mermaid with no closing ```
//   R2 (WARN)    unknown diagram keyword on the first content line (list is
//                extendable — new upstream syntax should warn, not block)
//   R3 (ERROR)   unquoted pipe edge label containing special chars — the
//                incident class. `-->|new Product(...)|` cannot parse;
//                the fix is quoting: `-->|"new Product(...)"|`. Quoted labels
//                and classDiagram's `--|>` arrow (no `>` before the pipe) are
//                correctly left alone.
//
// No network, no Docker, no rendering — pure text analysis. Reused by
// scripts/check.js (the always-on gate) and scripts/check-mermaid.mjs (Layer 2
// collects the same sources so both layers agree on what exists).

import fs from 'node:fs';
import path from 'node:path';

/** Diagram types whose first line we treat as known (R2). Anything else on
 *  line 1 produces a WARNING, never an error — upstream adds syntax often. */
const KNOWN_DIAGRAM_KEYWORDS = [
  'flowchart', 'graph', 'classDiagram', 'sequenceDiagram', 'stateDiagram-v2',
  'stateDiagram', 'erDiagram', 'gantt', 'pie', 'mindmap', 'timeline',
  'journey', 'gitGraph', 'quadrantChart', 'requirementDiagram',
  'architecture-beta', 'block-beta', 'sankey-beta', 'xychart-beta',
];

/** Pipe edge labels sit directly after a link arrow: `-->|x|`, `-.->|x|`,
 *  `==>|x|`, `--|x|`, `==|x|`. classDiagram's `--|>` inheritance arrow has NO
 *  `>` between the dashes and the pipe, so it cannot match — by construction. */
const PIPE_LABEL_RE = /(-->|-\.\->|==>|--|==)\|([^|\n]+)\|/g;

/** Characters that break mermaid's parser when unquoted inside a pipe label.
 *  Found the hard way: `(` was the incident; the rest are the same grammar
 *  neighborhood (brackets nest/conflict with node syntax, `#` starts entities). */
const LABEL_SPECIAL_CHARS = /[()[\]{}#]/;

/**
 * Find every ```mermaid fence in a markdown text, with 1-based line offsets,
 * and flag fences that never close.
 *
 * @param {string} mdText
 * @returns {{ fences: { startLine: number, text: string }[],
 *             unterminated: number[] }} lines of ```mermaid openers with no
 *   closer before the next opener or EOF.
 */
export function extractMermaidFences(mdText) {
  const lines = mdText.split('\n');
  const fences = [];
  const unterminated = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/^```mermaid\s*$/.test(lines[i])) continue;
    // Find the closer: the next bare ``` fence line.
    let closeIdx = -1;
    for (let j = i + 1; j < lines.length; j++) {
      if (/^```\s*$/.test(lines[j])) {
        closeIdx = j;
        break;
      }
    }
    if (closeIdx === -1) {
      unterminated.push(i + 1);
    } else {
      fences.push({ startLine: i + 1, text: lines.slice(i + 1, closeIdx).join('\n') });
    }
  }
  return { fences, unterminated };
}

/**
 * Lint ONE mermaid source (a fence body or a .mmd file's content).
 *
 * @param {string} text — the mermaid source (no fence markers).
 * @param {{ startLine?: number }} [opts] — 1-based line of `text`'s first line
 *   in its file, so findings point at real lines (0 = line numbers are
 *   relative to `text` itself + 1).
 * @returns {{ line: number, rule: 'R2'|'R3', severity: 'error'|'warning',
 *             message: string, hint?: string }[]}
 */
export function lintMermaid(text, { startLine = 0 } = {}) {
  const findings = [];
  const lines = text.split('\n');
  const lineNo = (idx) => startLine + idx; // startLine is the line of idx 0

  // R2 — known diagram keyword on the first non-empty line.
  const firstIdx = lines.findIndex((l) => l.trim() !== '');
  if (firstIdx !== -1) {
    const first = lines[firstIdx].trim();
    const keyword = KNOWN_DIAGRAM_KEYWORDS.find((k) =>
      first === k || first.startsWith(k + ' ') || first.startsWith(k + '-'),
    );
    if (!keyword) {
      findings.push({
        line: lineNo(firstIdx),
        rule: 'R2',
        severity: 'warning',
        message: `unrecognized diagram keyword: "${first.split(/\s+/)[0]}" — is it new mermaid syntax?`,
        hint: 'if valid, extend KNOWN_DIAGRAM_KEYWORDS in scripts/lib/mermaid-lint.mjs',
      });
    }
  }

  // R3 — unquoted special chars in pipe edge labels (the incident class).
  lines.forEach((line, idx) => {
    if (line.trim().startsWith('%%')) return; // mermaid comment
    for (const m of line.matchAll(PIPE_LABEL_RE)) {
      const label = m[2];
      if (LABEL_SPECIAL_CHARS.test(label) && !label.trim().startsWith('"')) {
        findings.push({
          line: lineNo(idx),
          rule: 'R3',
          severity: 'error',
          message: `unquoted special character(s) in edge label |${label}| — mermaid cannot parse this`,
          hint: `wrap the label in double quotes: ${m[1]}|"${label}"|`,
        });
      }
    }
  });

  return findings;
}

/**
 * Collect + lint every mermaid source in one lecture: the fences in
 * lecture.md (plus R1 unterminated-fence detection) and every .mmd under
 * diagramSrc/ (recursively).
 *
 * @param {string} lectureDir — absolute path to lectures/<slug>/
 * @returns {{ sources: number, errors: { file: string, line: number, rule,
 *   severity: 'error', message: string, hint?: string }[],
 *   warnings: { file: string, line: number, rule, severity: 'warning',
 *   message: string, hint?: string }[] }}
 */
export function lintMermaidLecture(lectureDir) {
  const errors = [];
  const warnings = [];
  let sources = 0;

  const push = (finding, file) => {
    const out = { ...finding, file };
    if (out.severity === 'error') errors.push(out);
    else warnings.push(out);
  };

  // lecture.md fences (+ R1).
  try {
    const md = fs.readFileSync(path.join(lectureDir, 'lecture.md'), 'utf8');
    const { fences, unterminated } = extractMermaidFences(md);
    for (const u of unterminated) {
      errors.push({
        file: 'lecture.md',
        line: u,
        rule: 'R1',
        severity: 'error',
        message: '```mermaid fence is never closed',
        hint: 'add the closing ``` on its own line',
      });
    }
    for (const f of fences) {
      sources++;
      lintMermaid(f.text, { startLine: f.startLine + 1 }).forEach((x) =>
        push(x, 'lecture.md'),
      );
    }
  } catch {
    /* no lecture.md → nothing to lint (check.js reports the missing file) */
  }

  // diagramSrc/**/*.mmd — whole files.
  const srcDir = path.join(lectureDir, 'diagramSrc');
  const walk = (dir) => {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith('.mmd')) {
        sources++;
        const rel = path.relative(lectureDir, full);
        lintMermaid(fs.readFileSync(full, 'utf8'), { startLine: 1 }).forEach(
          (x) => push(x, rel),
        );
      }
    }
  };
  walk(srcDir);

  return { sources, errors, warnings };
}

/**
 * Collect mermaid sources across every lecture (slug → sources) — the shared
 * collector so Layer 2 (`npm run check:mermaid`) validates exactly what
 * Layer 1 lints.
 *
 * @param {string} lecturesDir
 * @returns {{ slug: string, rel: string, text: string, startLine: number }[]}
 */
export function collectMermaidSources(lecturesDir) {
  const out = [];
  let slugs;
  try {
    slugs = fs
      .readdirSync(lecturesDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
  } catch {
    return out;
  }
  for (const slug of slugs) {
    const lectureDir = path.join(lecturesDir, slug);
    try {
      const md = fs.readFileSync(path.join(lectureDir, 'lecture.md'), 'utf8');
      for (const f of extractMermaidFences(md).fences) {
        out.push({ slug, rel: 'lecture.md', text: f.text, startLine: f.startLine + 1 });
      }
    } catch {
      /* skip lectures without lecture.md */
    }
    const walk = (dir) => {
      let entries;
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) walk(full);
        else if (e.name.endsWith('.mmd')) {
          out.push({
            slug,
            rel: path.relative(lectureDir, full),
            text: fs.readFileSync(full, 'utf8'),
            startLine: 1,
          });
        }
      }
    };
    walk(path.join(lectureDir, 'diagramSrc'));
  }
  return out;
}
