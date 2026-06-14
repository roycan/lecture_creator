// server/routes/export.js — preview + export via the shared build core (Phase 4; Phase 5 factory).
//
// Mounted at /:
//   GET  /preview/:slug → build the committed lecture.md       → HTML (iframe)
//   POST /preview       → build the posted {slug, markdown}    → HTML (live edit)
//   POST /export        → same build, returned as a download attachment
//
// Every build calls the SAME buildLecture the CLI uses (D5 single source of
// truth). onMissing:'warn' lets the authoring loop tolerate drafts (a half-
// edited deck still builds); the strict ship-gate is `npm run check`
// (Phase 3 decision A). The CLI single-build stays fail-loud ('throw').

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { buildLecture } from '../../scripts/lib/index.mjs';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);

const SLUG_RE = /^[a-z0-9-]+$/;

function buildHtml({ slug, markdown, lecturesDir } = {}) {
  if (typeof slug !== 'string' || !SLUG_RE.test(slug)) {
    const err = new Error('invalid or missing slug');
    err.statusCode = 400;
    throw err;
  }
  // Resolve via lectureDir so images in the posted markdown resolve from the
  // owning lecture folder; pass `markdown` through to override lecture.md.
  return buildLecture({
    lectureDir: path.join(lecturesDir, slug),
    markdown,
    onMissing: 'warn',
  });
}

/**
 * Factory for the preview/export router (Phase 5: tests inject `lecturesDir`
 * via `createApp({ lecturesDir })`; production defaults to <repo>/lectures).
 *
 * @param {{ lecturesDir?: string }} opts
 * @returns {import('express').Router}
 */
export default function createExportRouter({
  lecturesDir = path.join(REPO_ROOT, 'lectures'),
} = {}) {
  const router = express.Router();

  // Live preview of the editor's current markdown.
  router.post('/preview', (req, res, next) => {
    try {
      res.type('html').send(buildHtml({ ...req.body, lecturesDir }));
    } catch (err) {
      next(err);
    }
  });

  // Preview the committed lecture.md (no edits). Handy for direct linking/tests.
  router.get('/preview/:slug', (req, res, next) => {
    try {
      res.type('html').send(buildHtml({ slug: req.params.slug, lecturesDir }));
    } catch (err) {
      next(err);
    }
  });

  // Export: same self-contained HTML, but as a downloadable attachment.
  router.post('/export', (req, res, next) => {
    try {
      const { slug } = req.body || {};
      const html = buildHtml({ ...req.body, lecturesDir });
      res.set('Content-Disposition', `attachment; filename="${slug}.html"`);
      res.type('html').send(html);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
