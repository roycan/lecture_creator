// scripts/build.js — CLI export builder (Phase 1 scaffold)
//
// Phase 2/3 will implement the real build: split slides, inline images as
// data URIs, bundle highlight.js (+ mermaid when used), and write a single
// offline HTML file to dist/<slug>.html via the shared core in scripts/lib.
//
// Usage:
//   npm run build -- <slug>   build one lecture → dist/<slug>.html
//   npm run build:all         build every lecture
const args = process.argv.slice(2);
const wantsAll = args.includes('--all');
const slug = args.find((a) => !a.startsWith('-'));

if (wantsAll) {
  console.log('build --all: not yet implemented (Phase 2/3).');
} else if (slug) {
  console.log(`build ${slug}: not yet implemented (Phase 2/3).`);
} else {
  console.log('Usage: npm run build -- <slug> | npm run build:all');
  console.log('(Implementation arrives in Phase 2/3.)');
}

process.exit(0);
