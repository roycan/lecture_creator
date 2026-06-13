// scripts/check.js — integrity linter (Phase 1 scaffold)
//
// Phase 3 will scan every lectures/<slug>/ and FAIL on any missing ![]()
// image or Try-It asset reference (CI gate). For now it confirms the
// lectures/ source dir exists and reports the lecture count, so the gate is
// wired and green from day one.
import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const lecturesDir = fileURLToPath(new URL('../lectures', import.meta.url));

let slugs = [];
try {
  slugs = (await readdir(lecturesDir, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
} catch {
  console.error(`check: lectures/ not found at ${lecturesDir}`);
  process.exit(1);
}

console.log(`check: ${slugs.length} lecture(s) — ${slugs.join(', ') || 'none yet'}`);
console.log('check: full integrity scan arrives in Phase 3 (scaffold OK).');
process.exit(0);
