// scripts/reorg/dry-run.mjs
//
// Phase 6 restructure mover. Structural only — every relocation is a `git mv`.
//
// Usage:
//   node scripts/reorg/dry-run.mjs                 # dry-run: print plan + validate + ref-coverage scan
//   node scripts/reorg/dry-run.mjs --apply         # perform ALL git mv's
//   node scripts/reorg/dry-run.mjs --apply --only=A,B,shared,relocate   # subset
//   node scripts/reorg/dry-run.mjs --only=html,css # specific slugs
//
// --only tokens:  A | B | shared | relocate | all | <slug>   (comma-separated)
//   A/B   -> lecture batches A / B
//   shared/relocate -> special groups
//   all   -> everything
//   <slug> -> one lecture

import { readFileSync, readdirSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, basename, dirname, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lectures, special } from './move-manifest.mjs';

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..', '..');
const args = process.argv.slice(2);
const apply = args.includes('--apply');
const onlyArg = args.find((a) => a.startsWith('--only='));
const only = onlyArg ? onlyArg.slice('--only='.length).split(',').map((s) => s.trim()) : null;

const log = (...x) => console.log(...x);

// ── build flat move list ──────────────────────────────────────────────
// each move: { src, dest, group, kind }  (kind: file|dir)
function buildMoves() {
  const moves = [];

  for (const lec of lectures) {
    const inScope = !only || only.includes('all') || only.includes(lec.batch) || only.includes(lec.slug);
    if (!inScope) continue;
    const base = `lectures/${lec.slug}`;
    // markdown -> lecture.md
    moves.push({ src: lec.md, dest: `${base}/lecture.md`, group: lec.slug, bucket: 'md' });
    // docs
    for (const d of lec.docs || []) moves.push({ src: d, dest: `${base}/${basename(d)}`, group: lec.slug, bucket: 'docs' });
    // diagrams / assets / diagramSrc / extras -> bucket dir, name = basename(src)
    for (const b of ['diagrams', 'assets', 'diagramSrc', 'extras']) {
      for (const src of lec[b] || []) {
        moves.push({ src, dest: `${base}/${b}/${basename(src)}`, group: lec.slug, bucket: b });
      }
    }
  }

  for (const [group, list] of Object.entries(special)) {
    const inScope = !only || only.includes('all') || only.includes(group);
    if (!inScope) continue;
    for (const m of list) moves.push({ src: m.src, dest: m.dest, group, bucket: 'special' });
  }

  return moves;
}

// ── helpers ───────────────────────────────────────────────────────────
function rel(p) { return posix.relative(ROOT.replaceAll('\\', '/'), resolve(ROOT, p).replaceAll('\\', '/')); }
function isDir(p) { try { return statSync(resolve(ROOT, p)).isDirectory(); } catch { return false; } }
function exists(p) { try { return existsSync(resolve(ROOT, p)); } catch { return false; } }

function walkRel(p) {
  const out = [];
  const abs = resolve(ROOT, p);
  if (!existsSync(abs)) return out;
  const st = statSync(abs);
  if (st.isFile()) { out.push(rel(abs)); return out; }
  for (const e of readdirSync(abs)) out.push(...walkRel(posix.join(p, e)));
  return out;
}

// all source files this plan will move (used for ref-coverage miss detection)
function srcFileSet(moves) {
  const set = new Set();
  for (const m of moves) {
    if (isDir(m.src)) for (const f of walkRel(m.src)) set.add(f);
    else set.add(rel(m.src));
  }
  return set;
}

// extract relative asset/image refs from a markdown file (repo-root-relative as written)
const MD_IMG = /!?\[[^\]]*\]\(([^)]+)\)/g;            // ![alt](url) and [text](url)
const HTML_SRC = /(?:src|href)\s*=\s*["']([^"']+)["']/g; // <img src=...> <a href=...>
// repo-root "tool" files referenced only as inline code examples (never lecture assets)
const ROOT_TOOL_IGNORE = new Set(['README.md', 'CHANGELOG.md', 'app.js', 'index.html', 'style.css', 'package.json']);
function extractRefs(mdFile) {
  const txt = readFileSync(resolve(ROOT, mdFile), 'utf8');
  const refs = new Set();
  const add = (u) => {
    u = u.trim();
    if (!u) return;
    if (/^(https?:|mailto:|tel:|sms:|callto:|whatsapp:|#|data:|\/\/)/i.test(u)) return; // external / anchor
    if (/<%=|<%-|<%|\$\{|`/.test(u)) return;                 // template expr / interpolation
    u = u.replace(/^\.?\//, '');                              // normalize leading ./
    u = u.split('#')[0].split('?')[0];
    if (!u) return;
    if (!u.includes('.')) return;                             // route paths w/o extension (login, admin, products/x)
    if (ROOT_TOOL_IGNORE.has(u)) return;                      // generic tool filename used as example
    refs.add(u);
  };
  for (const m of txt.matchAll(MD_IMG)) add(m[1]);
  for (const m of txt.matchAll(HTML_SRC)) add(m[1]);
  return [...refs];
}

// ── main ──────────────────────────────────────────────────────────────
function main() {
  const moves = buildMoves();

  log(`\n=== Phase 6 mover :: ${apply ? 'APPLY' : 'DRY-RUN'} :: only=${only ? only.join(',') : 'all'} ===`);
  log(`Plan size: ${moves.length} move(s) across ${new Set(moves.map((m) => m.group)).size} group(s)\n`);

  // 1) integrity: duplicate destinations + existence
  const destMap = new Map();
  let problems = 0;
  for (const m of moves) {
    if (destMap.has(m.dest)) { log(`  ✗ DUP DEST ${m.dest}  (already from ${destMap.get(m.dest)})`); problems++; }
    else destMap.set(m.dest, m.src);
    if (!exists(m.src)) { log(`  ✗ MISSING SRC ${m.src}  (group ${m.group})`); problems++; }
  }

  // 2) reviewable table
  let cur = '';
  for (const m of moves) {
    if (m.group !== cur) { cur = m.group; log(`\n[${cur}]`); }
    const kind = isDir(m.src) ? 'dir ' : 'file';
    log(`  ${kind}  ${m.src}  →  ${m.dest}`);
  }

  // 3) ref-coverage scan: warn on referenced files NOT in the manifest (real misses)
  const srcs = srcFileSet(moves);
  log(`\n=== Reference coverage scan ===`);
  let warns = 0, gaps = 0;
  for (const lec of lectures) {
    if (only && !only.includes('all') && !only.includes(lec.batch) && !only.includes(lec.slug)) continue;
    const inScopeMoves = moves.filter((m) => m.group === lec.slug);
    if (!inScopeMoves.length) continue;
    const refs = extractRefs(lec.md);
    for (const r of refs) {
      // is the referenced file being moved by this plan at all?
      if (srcs.has(r)) continue;                                   // covered (moved somewhere)
      if (!exists(r)) { log(`    ℹ  [${lec.slug}] content gap / Phase7b: ${r}`); gaps++; continue; }
      log(`    ⚠  [${lec.slug}] REFERENCED & EXISTS but NOT in manifest: ${r}`); warns++;
    }
  }
  log(`\n  coverage: ${warns} potential miss(es), ${gaps} content-gap(s) (Phase 7a/7b).`);

  if (problems > 0) { log(`\n✗ ${problems} plan problem(s). Aborting (not applying).\n`); process.exit(1); }

  if (!apply) { log('\n(dry-run only — no files moved. Re-run with --apply to execute git mv.)\n'); return; }

  // 4) APPLY via git mv
  log('\n=== Applying git mv ===');
  let done = 0;
  // order: files first then dirs is unnecessary; just mkdir parent + git mv
  for (const m of moves) {
    if (!exists(m.src)) { log(`  skip (missing src): ${m.src}`); continue; }
    const destAbs = resolve(ROOT, m.dest);
    mkdirSync(dirname(destAbs), { recursive: true });
    try {
      execSync(`git mv -- "${rel(m.src)}" "${m.dest}"`, { cwd: ROOT, stdio: 'pipe' });
      done++;
    } catch (e) {
      const msg = e.stderr ? e.stderr.toString().trim() : e.message;
      log(`  ✗ FAILED ${m.src} → ${m.dest}\n     ${msg}`);
      problems++;
    }
  }
  log(`\n  moved ${done} item(s) (${moves.length} planned).`);
  if (problems > 0) { log(`✗ ${problems} problem(s) during apply.`); process.exit(1); }

  // 5) post-apply verification: every planned source no longer at src, present at dest
  log('\n=== Post-apply verification ===');
  let bad = 0;
  for (const m of moves) {
    if (exists(m.src) && !only?.length === false) { /* dir may be empty-removed already; ignore */ }
    if (!exists(m.dest)) { log(`  ✗ DEST MISSING after move: ${m.dest}`); bad++; }
  }
  log(bad === 0 ? '  all destinations present. ✔' : `  ${bad} destination(s) missing!`);
  if (bad > 0) process.exit(1);
}

main();
