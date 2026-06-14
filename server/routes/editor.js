// server/routes/editor.js — the editor page (Phase 4; Phase 5 factory).
//
// GET / → render the EJS editor with the sorted lecture list. The <select>
// options are server-rendered; the markdown itself is fetched per-lecture by
// the client (server/public/editor.js) so the page stays light on first paint.

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listSlugs } from '../../scripts/lib/index.mjs';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);

/**
 * Factory for the editor page router (Phase 5: tests inject `lecturesDir` via
 * `createApp({ lecturesDir })`; production defaults to <repo>/lectures).
 *
 * @param {{ lecturesDir?: string }} opts
 * @returns {import('express').Router}
 */
export default function createEditorRouter({
  lecturesDir = path.join(REPO_ROOT, 'lectures'),
} = {}) {
  const router = express.Router();

  router.get('/', (_req, res) => {
    res.render('editor', { slugs: listSlugs({ lecturesDir }) });
  });

  return router;
}
