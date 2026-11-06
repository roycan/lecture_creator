// scripts/stage-student-assets.mjs
//
// Stage the student-facing tree for the public site (g10-fullstack-lectures) and
// the offline lecture ZIP. Run AFTER `npm run build:all` has written the decks
// to dist/. For each dist/<slug>.html this script:
//
//   1. rewrites its in-deck `assets/...` links to `assets/<slug>/...` (never
//      touching `assets/_shared/...`);
//   2. (P1 / T4) rewrites cross-lecture prerequisite links `../<slug>/lecture.md`
//      to the collection's numbered canonical deck `NN-<slug>.html` (numbers
//      come from scripts/deck-manifest.json — collection-scoped, never global);
//   3. copies that lecture's assets/ (minus solutions/quizzes/tests/dotfiles)
//      to assets/<slug>/;
//   4. (P2) provisions shared/styles.css into assets/<slug>/ where the deck
//      references styles.css (context D7/D8 copy-on-build);
//   5. (P3) redirects any still-unresolved `assets/<slug>/<file>` link to
//      assets/_shared/challenges/<file> when that shared starter exists;
//   then writes the deck to web-lectures/full-stack-g10/NN-<slug>.html (the
//   canonical numbered publication URL) plus a lightweight redirect stub at
//   <slug>.html so already-shared unnumbered student URLs keep working. The
//   hand-authored index.html and curriculum files are never touched.
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

// Collection-scoped numbering manifest (this collection's teaching sequence).
const MANIFEST_PATH = new URL('./deck-manifest.json', import.meta.url);

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
  // Windows Mark-of-the-Web transfer metadata (…png:Zone.Identifier) — never
  // a teaching asset, regardless of which directory it rides in.
  if (name.endsWith(':Zone.Identifier')) return true;
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
 * the published deck. With the collection manifest's slug->numbered map the
 * target is the canonical `NN-<slug>.html`; a slug not in the map (e.g.
 * excluded from this collection) falls back to the unnumbered `<slug>.html`,
 * which resolves to a redirect stub when one is published.
 *
 * @param {string} html
 * @param {Record<string, string>} [slugToNumbered] - e.g. { html: '03-html.html' }
 * @returns {string}
 */
export function rewritePrereqLinks(html, slugToNumbered = {}) {
  return html.replace(
    /(href=\\?")\.\.\/([a-z0-9-]+)\/lecture\.md(\\?")/g,
    (m, pre, slug, post) => `${pre}${slugToNumbered[slug] ?? `${slug}.html`}${post}`,
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

/** Load a collection numbering manifest (defaults to this collection's). */
export function loadManifest(manifestPath = MANIFEST_PATH) {
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

/** Canonical publication filename: zero-padded `NN-<slug>.html`. */
export function buildNumberedName(number, slug) {
  return `${String(number).padStart(2, '0')}-${slug}.html`;
}

/**
 * Validate a manifest against the decks actually present in dist/.
 * Collects every problem into one thrown Error; returns decks sorted by number.
 *
 * Rules: decks[] non-empty; unique slugs; unique numbers forming contiguous
 * 1..N; slug format; every manifest slug has a built dist/ deck; every dist/
 * deck is either in decks[] or explicitly listed in excluded[] (typo guard);
 * no slug both included and excluded.
 *
 * @param {{ decks?: Array<{number: number, slug: string}>, excluded?: string[] }} manifest
 * @param {string[]} distSlugs
 * @returns {Array<{number: number, slug: string}>} sorted by number
 * @throws {Error} listing every violation
 */
export function validateManifest(manifest, distSlugs) {
  const problems = [];
  const decks = Array.isArray(manifest?.decks) ? manifest.decks : [];
  const excluded = Array.isArray(manifest?.excluded) ? manifest.excluded : [];
  const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

  if (!decks.length) problems.push('decks[] is empty');
  const seenSlugs = new Set();
  const seenNumbers = new Set();
  for (const d of decks) {
    if (!Number.isInteger(d?.number) || d.number < 1) {
      problems.push(`invalid number for slug "${d?.slug}"`);
    } else if (seenNumbers.has(d.number)) {
      problems.push(`duplicate number ${d.number}`);
    } else {
      seenNumbers.add(d.number);
    }
    if (!SLUG_RE.test(d?.slug ?? '')) {
      problems.push(`invalid slug "${d?.slug}"`);
    } else if (seenSlugs.has(d.slug)) {
      problems.push(`duplicate slug "${d.slug}"`);
    } else {
      seenSlugs.add(d.slug);
    }
  }
  const numbers = [...seenNumbers].sort((a, b) => a - b);
  if (numbers.length && numbers[numbers.length - 1] !== numbers.length) {
    problems.push(`numbers must be contiguous 1..N — got ${numbers.join(', ')}`);
  }

  const distSet = new Set(distSlugs);
  const excludedSet = new Set(excluded);
  for (const slug of seenSlugs) {
    if (!distSet.has(slug)) {
      problems.push(`manifest slug "${slug}" has no dist/${slug}.html (build not run?)`);
    }
  }
  for (const slug of distSet) {
    if (!seenSlugs.has(slug) && !excludedSet.has(slug)) {
      problems.push(
        `dist/${slug}.html is neither in decks[] nor in excluded[] — add it to deck-manifest.json`,
      );
    }
  }
  for (const slug of excluded) {
    if (!SLUG_RE.test(slug)) problems.push(`invalid excluded slug "${slug}"`);
    if (seenSlugs.has(slug)) problems.push(`"${slug}" is both in decks[] and excluded[]`);
  }

  if (problems.length) {
    throw new Error(`deck-manifest invalid:\n  - ${problems.join('\n  - ')}`);
  }
  return decks.slice().sort((a, b) => a.number - b.number);
}

/** { slug: 'NN-slug.html' } lookup consumed by rewritePrereqLinks. */
export function buildSlugToNumbered(decks) {
  const map = {};
  for (const { number, slug } of decks) map[slug] = buildNumberedName(number, slug);
  return map;
}

/**
 * Lightweight legacy-URL stub for `<slug>.html`: meta refresh to the numbered
 * canonical deck plus a visible fallback link. No JavaScript, relative URL —
 * works on GitHub Pages and via file:// alike. Contains no presentation HTML.
 *
 * @param {string} numberedName - e.g. '03-html.html'
 * @returns {string}
 */
export function redirectPage(numberedName) {
  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    `<meta http-equiv="refresh" content="0; url=${numberedName}">`,
    '<title>Redirecting…</title>',
    '</head>',
    '<body>',
    `<p><a href="${numberedName}">Continue to ${numberedName}</a></p>`,
    '</body>',
    '</html>',
    '',
  ].join('\n');
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
 * index.html and curriculum .md in stageDir untouched (only writes
 * NN-<slug>.html canonical decks, <slug>.html redirect stubs, and assets/).
 * Decks not listed in the manifest (and not excluded by it) are never staged.
 *
 * @param {{ distDir?: string, lecturesDir?: string, sharedDir?: string, stageDir?: string, manifest?: object }} [opts]
 * @returns {{ decks: number, redirects: number, assetFiles: number, slugs: string[], shared: number, stylesProvisioned: number }}
 * @throws if dist/ contains no *.html (build not run yet) or the manifest is invalid
 */
export function stageStudentAssets({
  distDir = path.join(REPO_ROOT, 'dist'),
  lecturesDir = path.join(REPO_ROOT, 'lectures'),
  sharedDir = path.join(REPO_ROOT, 'shared'),
  stageDir = path.join(REPO_ROOT, 'web-lectures', 'full-stack-g10'),
  manifest = loadManifest(),
} = {}) {
  const decks = listDecks(distDir);
  if (!decks.length) {
    throw new Error(
      `no *.html found in ${path.relative(REPO_ROOT, distDir) || 'dist'} — run "npm run build:all" first.`,
    );
  }
  const distSlugs = decks.map((f) => f.replace(/\.html$/, ''));
  const planned = validateManifest(manifest, distSlugs);
  const slugToNumbered = buildSlugToNumbered(planned);

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

  for (const { number, slug } of planned) {
    const file = `${slug}.html`;
    let html = fs.readFileSync(path.join(distDir, file), 'utf8');
    html = rewriteAssetsLinks(html, slug);
    html = rewritePrereqLinks(html, slugToNumbered);

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

    const numberedName = buildNumberedName(number, slug);
    fs.writeFileSync(path.join(stageDir, numberedName), html);
    // Legacy unnumbered URL -> lightweight redirect to the canonical deck.
    fs.writeFileSync(path.join(stageDir, file), redirectPage(numberedName));
    slugs.push(slug);
  }

  return {
    decks: slugs.length,
    redirects: slugs.length,
    assetFiles,
    slugs,
    shared,
    stylesProvisioned,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const res = stageStudentAssets();
    console.log(
      `stage: wrote ${res.decks} numbered decks + ${res.redirects} redirects ` +
        `+ ${res.assetFiles} asset files ` +
        `(${res.slugs.length} lectures) + ${res.shared} shared starters ` +
        `+ ${res.stylesProvisioned} styles.css`,
    );
    console.log('  -> web-lectures/full-stack-g10/NN-<slug>.html (+ <slug>.html stubs)');
  } catch (err) {
    console.error(`stage: ${err.message}`);
    process.exit(1);
  }
}
