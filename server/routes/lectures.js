// server/routes/lectures.js — read-only lecture data API (Phase 4; Phase 5 factory).
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

// server/routes/*.js → two '..' reaches the repo root.
const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);

// Restrict slugs to kebab-case-ish names so :slug can never escape lectures/.
const SLUG_RE = /^[a-z0-9-]+$/;

function lectureFile(slug, lecturesDir) {
  if (!SLUG_RE.test(slug)) return null;
  const dir = path.join(lecturesDir, slug);
  const file = path.join(dir, 'lecture.md');
  if (!fs.existsSync(dir) || !fs.existsSync(file)) return null;
  return file;
}

/**
 * Factory for the lectures data API router (Phase 5: tests inject `lecturesDir`
 * via `createApp({ lecturesDir })`; production defaults to <repo>/lectures).
 *
 * @param {{ lecturesDir?: string }} opts
 * @returns {import('express').Router}
 */
export default function createLecturesRouter({
  lecturesDir = path.join(REPO_ROOT, 'lectures'),
} = {}) {
  const router = express.Router();

  router.get('/', (_req, res) => {
    res.json({ slugs: listSlugs({ lecturesDir }) });
  });

  router.get('/:slug', (req, res) => {
    const slug = req.params.slug;
    const file = lectureFile(slug, lecturesDir);
    if (!file) {
      return res.status(404).json({ error: 'lecture not found', slug });
    }
    const markdown = fs.readFileSync(file, 'utf8');
    res.json({ slug, markdown });
  });

  return router;
}
