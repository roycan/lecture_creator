// scripts/stage-student-assets.mjs
//
// Stage the student-facing tree for the public site (g10-fullstack-lectures) and
// the offline lecture ZIP. Run AFTER `npm run build:all` has written the decks
// to dist/. For each dist/<slug>.html this script:
//
//   1. rewrites its in-deck `assets/...` links to `assets/<slug>/...` (never
//      touching `assets/_shared/...`);
//   2. (P1 / T4) rewrites cross-lecture prerequisite links `../<slug>/lecture.md`
//      to the published deck `<slug>.html`;
//   3. copies that lecture's assets/ (minus solutions/quizzes/tests/dotfiles)
//      to assets/<slug>/;
//   4. (P2) provisions shared/styles.css into assets/<slug>/ where the deck
//      references styles.css (context D7/D8 copy-on-build);
//   5. (P3) redirects any still-unresolved `assets/<slug>/<file>` link to
//      assets/_shared/challenges/<file> when that shared starter exists;
//   then writes the deck to web-lectures/full-stack-g10/<slug>.html.
//
// Why a SEPARATE script (not woven into scripts/build.js): build.js and its test
// suite stay untouched (single concern, no regression risk). See
// inceptions/starters-delivery-plan.md (Option A + Phase 2).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

// Excluded from every student bundle:
//   - `solution` anywhere in the name (answer keys / app.solution.js — anti-cheat)
//   - quiz.md            (assessment / calibration anchor — keep off public site)
//   - *.test.js          (test sources)
// Dotfiles (.gitkeep, .gitignore, .DS_Store) and node_modules/ are dropped
// separately in copyFiltered().
const EXCLUDE_RE = /solution|quiz\.md$|\.test\.js$/i;

/**
 * Should `name` (a basename) be omitted from student bundles?
 *
 * @param {string} name - file or directory basename
 * @returns {boolean}
 */
export function shouldExcludeAsset(name) {
  if (name.startsWith('.')) return true;
  if (name === 'node_modules') return true;
  return EXCLUDE_RE.test(name);
}

/**
 * Rewrite deck-internal `assets/...` links to `assets/<slug>/...` so they
 * resolve in the flat published tree. Matches ONLY the href attribute — in both
 * the JSON-escaped form `href=\"assets/` (how links appear inside the
 * #slides-data JSON blob) and the plain form `href="assets/"`. Never touches
 * `assets/_shared/...` (those are already correctly rooted) or `<code>` text.
 *
 * @param {string} html - built deck HTML
 * @param {string} slug - lecture slug (becomes the assets/<slug>/ prefix)
 * @returns {string}
 */
export function rewriteAssetsLinks(html, slug) {
  return html.replace(/(href=\\?")assets\/(?!_shared\/)/g, `$1assets/${slug}/`);
}

/**
 * (P1 / T4) Rewrite cross-lecture prerequisite links `../<slug>/lecture.md` to
 * the published deck `<slug>.html`, so "Prerequisite: [html]" resolves on the
 * student site instead of 404'ing to source markdown.
 *
 * @param {string} html
 * @returns {string}
 */
export function rewritePrereqLinks(html) {
  return html.replace(
    /(href=\\?")\.\.\/([a-z0-9-]+)\/lecture\.md(\\?")/g,
    `$1$2.html$3`,
  );
}

/**
 * (P3) For any `assets/<slug>/<rest>` link that does NOT resolve on disk under
 * `stageDir`, try to satisfy it from `assets/_shared/challenges/<basename>`.
 * Returns the html unchanged if the link already resolves or no shared fallback
 * exists. Only rewrites when the shared target actually exists (no false
 * positives). Run AFTER per-slug assets + styles.css are staged AND after
 * `_shared/` is staged.
 *
 * @param {string} html
 * @param {string} stageDir
 * @returns {string}
 */
export function resolveSharedFallback(html, stageDir) {
  const challengesDir = path.join(stageDir, 'assets', '_shared', 'challenges');
  return html.replace(
    /(href=\\?")(assets\/[^"\\]+)(\\?")/g,
    (m, pre, assetPath, post) => {
      if (fs.existsSync(path.join(stageDir, assetPath))) return m;
      const base = path.basename(assetPath);
      if (fs.existsSync(path.join(challengesDir, base))) {
        return `${pre}assets/_shared/challenges/${base}${post}`;
      }
      return m;
    },
  );
}

function listDecks(distDir) {
  try {
    return fs
      .readdirSync(distDir, { withFileTypes: true })
      .filter((d) => d.isFile() && d.name.endsWith('.html'))
      .map((d) => d.name)
      .sort();
  } catch {
    return [];
  }
}

// Recursive copy that skips excluded names. Returns the number of files copied.
function copyFiltered(src, dest) {
  let count = 0;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (shouldExcludeAsset(entry.name)) continue;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      count += copyFiltered(s, d);
    } else {
      fs.copyFileSync(s, d);
      count += 1;
    }
  }
  return count;
}

/**
 * Stage the student tree. Idempotent: safe to re-run. Leaves the hand-authored
 * index.html and curriculum .md in stageDir untouched (only writes <slug>.html
 * and assets/).
 *
 * @param {{ distDir?: string, lecturesDir?: string, sharedDir?: string, stageDir?: string }} [opts]
 * @returns {{ decks: number, assetFiles: number, slugs: string[], shared: number, stylesProvisioned: number }}
 * @throws if dist/ contains no *.html (build not run yet)
 */
export function stageStudentAssets({
  distDir = path.join(REPO_ROOT, 'dist'),
  lecturesDir = path.join(REPO_ROOT, 'lectures'),
  sharedDir = path.join(REPO_ROOT, 'shared'),
  stageDir = path.join(REPO_ROOT, 'web-lectures', 'full-stack-g10'),
} = {}) {
  const decks = listDecks(distDir);
  if (!decks.length) {
    throw new Error(
      `no *.html found in ${path.relative(REPO_ROOT, distDir) || 'dist'} — run "npm run build:all" first.`,
    );
  }

  fs.mkdirSync(stageDir, { recursive: true });
  const assetsRoot = path.join(stageDir, 'assets');
  fs.mkdirSync(assetsRoot, { recursive: true });

  // Stage shared starters FIRST so resolveSharedFallback() can see them.
  let shared = 0;
  for (const group of ['gates', 'challenges']) {
    const src = path.join(sharedDir, group);
    if (fs.existsSync(src)) {
      shared += copyFiltered(src, path.join(assetsRoot, '_shared', group));
    }
  }

  const sharedStyles = path.join(sharedDir, 'styles.css');
  let assetFiles = 0;
  let stylesProvisioned = 0;
  const slugs = [];

  for (const file of decks) {
    const slug = file.replace(/\.html$/, '');
    let html = fs.readFileSync(path.join(distDir, file), 'utf8');
    html = rewriteAssetsLinks(html, slug);
    html = rewritePrereqLinks(html);

    const slugAssets = path.join(assetsRoot, slug);
    const lectureAssets = path.join(lecturesDir, slug, 'assets');
    if (fs.existsSync(lectureAssets)) {
      assetFiles += copyFiltered(lectureAssets, slugAssets);
    }

    // (P2) Provision shared/styles.css where the deck references styles.css
    // (the D7/D8 copy-on-build step that was never wired into the build).
    if (fs.existsSync(sharedStyles) && html.includes(`assets/${slug}/styles.css`)) {
      fs.mkdirSync(slugAssets, { recursive: true });
      fs.copyFileSync(sharedStyles, path.join(slugAssets, 'styles.css'));
      stylesProvisioned += 1;
    }

    // (P3) Redirect unresolved assets/<slug>/<file> to assets/_shared/challenges.
    html = resolveSharedFallback(html, stageDir);

    fs.writeFileSync(path.join(stageDir, file), html);
    slugs.push(slug);
  }

  return { decks: slugs.length, assetFiles, slugs, shared, stylesProvisioned };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const res = stageStudentAssets();
    console.log(
      `stage: wrote ${res.decks} decks + ${res.assetFiles} asset files ` +
        `(${res.slugs.length} lectures) + ${res.shared} shared starters ` +
        `+ ${res.stylesProvisioned} styles.css`,
    );
    console.log('  -> web-lectures/full-stack-g10/  (and .../assets/<slug>/)');
  } catch (err) {
    console.error(`stage: ${err.message}`);
    process.exit(1);
  }
}
