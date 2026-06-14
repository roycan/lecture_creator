// server/routes/lectures.js — read-only lecture data API (Phase 4).
//
// Mounted at /api/lectures:
//   GET /api/lectures        → { slugs: [...] }   (sorted lecture folder names)
//   GET /api/lectures/:slug  → { slug, markdown } (the lecture.md source text)
//
// Markdown is returned as-is for the editor textarea; the building/inlining
// happens in the preview/export routes via buildLecture (D5).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { listSlugs } from '../../scripts/lib/index.mjs';

const router = express.Router();

// server/routes/*.js → two '..' reaches the repo root.
const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);
const LECTURES_DIR = path.join(REPO_ROOT, 'lectures');

// Restrict slugs to kebab-case-ish names so :slug can never escape lectures/.
const SLUG_RE = /^[a-z0-9-]+$/;

function lectureFile(slug) {
  if (!SLUG_RE.test(slug)) return null;
  const dir = path.join(LECTURES_DIR, slug);
  const file = path.join(dir, 'lecture.md');
  if (!fs.existsSync(dir) || !fs.existsSync(file)) return null;
  return file;
}

router.get('/', (_req, res) => {
  res.json({ slugs: listSlugs({ lecturesDir: LECTURES_DIR }) });
});

router.get('/:slug', (req, res) => {
  const slug = req.params.slug;
  const file = lectureFile(slug);
  if (!file) {
    return res.status(404).json({ error: 'lecture not found', slug });
  }
  const markdown = fs.readFileSync(file, 'utf8');
  res.json({ slug, markdown });
});

export default router;
