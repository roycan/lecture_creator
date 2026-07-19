// scripts/audit-assets.mjs
//
// Read-only diagnostic (Phase 2 / T9). Scans every lectures/<slug>/lecture.md for
// `assets/...` backtick code-span references and reports whether each resolves to
// a real file — in the lecture's own assets/, or in shared/challenges, or
// shared/gates. This tells us which backtick refs are safe to turn into
// clickable links (only those whose target exists) and which are *missing
// content* (referenced starters that were never authored).
//
//   node scripts/audit-assets.mjs          # human report
//   node scripts/audit-assets.mjs --json    # machine-readable

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LECTURES_DIR = path.join(REPO_ROOT, 'lectures');
const SHARED_DIR = path.join(REPO_ROOT, 'shared');

const EXCLUDED_RE = /solution|quiz\.md$/i;

function listSlugs() {
  return fs
    .readdirSync(LECTURES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

// Candidate on-disk locations for an `assets/<rel>` reference authored in <slug>.
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
 * @returns {{slug:string,line:number,ref:string,where:string|null,excluded:boolean,tryPattern:boolean}[]}
 */
export function audit() {
  const rows = [];
  for (const slug of listSlugs()) {
    const mdPath = path.join(LECTURES_DIR, slug, 'lecture.md');
    if (!fs.existsSync(mdPath)) continue;
    const lines = fs.readFileSync(mdPath, 'utf8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      for (const m of lines[i].matchAll(/`assets\/([^`]+)`/g)) {
        const rel = m[1].trim();
        const excluded = EXCLUDED_RE.test(rel);
        rows.push({
          slug,
          line: i + 1,
          ref: 'assets/' + rel,
          where: excluded ? null : resolveExists(slug, rel),
          excluded,
          tryPattern: /try\s*it|open[:\s]|starter[:\s]/i.test(lines[i]),
        });
      }
    }
  }
  return rows;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const rows = audit();
  const missing = rows.filter((r) => !r.where && !r.excluded);
  const convertible = rows.filter((r) => r.where && !r.excluded && r.tryPattern);
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ total: rows.length, missing, convertible }, null, 2));
  } else {
    const slugs = new Set(rows.map((r) => r.slug)).size;
    console.log(`# asset-ref audit: ${rows.length} backtick refs across ${slugs} lectures`);
    console.log(
      `# resolved(exists): ${rows.filter((r) => r.where).length} | missing: ${missing.length} | excluded(soln/quiz): ${rows.filter((r) => r.excluded).length}`,
    );
    console.log(`# convertible (exists + Open:/Try It: line): ${convertible.length}\n`);
    console.log('## MISSING (referenced, no file) — content gaps:');
    for (const r of missing)
      console.log(`  ${r.slug}:${r.line}  ${r.ref}${r.tryPattern ? '  [Try It/Open]' : ''}`);
    console.log('\n## CONVERT candidates (file exists + Open:/Try It:):');
    for (const r of convertible) console.log(`  ${r.slug}:${r.line}  ${r.ref}`);
  }
}
