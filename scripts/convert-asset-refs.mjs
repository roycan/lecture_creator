// scripts/convert-asset-refs.mjs
//
// Phase 2 / P6b (T9). Converts BARE backtick `assets/<file>` references in each
// lectures/<slug>/lecture.md into clickable markdown links, but ONLY when the
// target file actually exists. Safety rails:
//   - skips fenced code blocks (``` / ~~~) — never corrupts code samples;
//   - skips refs already inside a markdown link (negative lookbehind for `[`);
//   - skips solution / quiz refs;
//   - skips folder refs (requires a file extension);
//   - skips refs whose file does not exist (lecture assets OR shared).
//
//   node scripts/convert-asset-refs.mjs          # dry-run (prints counts, no writes)
//   node scripts/convert-asset-refs.mjs --write   # apply in-place

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LECTURES_DIR = path.join(REPO_ROOT, 'lectures');
const SHARED_DIR = path.join(REPO_ROOT, 'shared');

const EXCLUDED_RE = /solution|quiz\.md$/i;
const FENCE_RE = /^(\s*)(```|~~~)/;
// bare `assets/<rel.ext>` NOT immediately preceded by '[' (already-linked).
const REF_RE = /(?<!\[)`assets\/([^`]+\.[a-z0-9]+)`/gi;

function listSlugs() {
  return fs
    .readdirSync(LECTURES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

function resolveExists(slug, rel) {
  const base = path.basename(rel);
  const cands = [
    path.join(LECTURES_DIR, slug, 'assets', rel),
    path.join(SHARED_DIR, 'challenges', base),
    path.join(SHARED_DIR, 'gates', base),
  ];
  for (const p of cands) if (fs.existsSync(p)) return p;
  return null;
}

/**
 * @param {string} slug
 * @param {string} md
 * @returns {{ out: string, changed: number }}
 */
export function convertMd(slug, md) {
  const lines = md.split('\n');
  let inFence = false;
  let changed = 0;
  for (let i = 0; i < lines.length; i++) {
    if (FENCE_RE.test(lines[i])) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    lines[i] = lines[i].replace(REF_RE, (m, rel) => {
      rel = rel.trim();
      if (EXCLUDED_RE.test(rel)) return m;
      if (!resolveExists(slug, rel)) return m;
      changed += 1;
      return `[\`assets/${rel}\`](assets/${rel})`;
    });
  }
  return { out: lines.join('\n'), changed };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const write = process.argv.includes('--write');
  let total = 0;
  const touched = [];
  for (const slug of listSlugs()) {
    const mdPath = path.join(LECTURES_DIR, slug, 'lecture.md');
    if (!fs.existsSync(mdPath)) continue;
    const md = fs.readFileSync(mdPath, 'utf8');
    const { out, changed } = convertMd(slug, md);
    if (changed > 0) {
      touched.push(`${slug}: ${changed}`);
      total += changed;
      if (write) fs.writeFileSync(mdPath, out);
    }
  }
  console.log(
    `${write ? 'wrote' : 'DRY-RUN'}: ${total} backtick ref(s) -> links across ${touched.length} lecture(s)`,
  );
  for (const t of touched) console.log(`  ${t}`);
  if (!write) console.log('\n(re-run with --write to apply)');
}
