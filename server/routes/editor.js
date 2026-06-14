// server/routes/editor.js — the editor page (Phase 4).
//
// GET / → render the EJS editor with the sorted lecture list. The <select>
// options are server-rendered; the markdown itself is fetched per-lecture by
// the client (server/public/editor.js) so the page stays light on first paint.

import express from 'express';
import { listSlugs } from '../../scripts/lib/index.mjs';

const router = express.Router();

router.get('/', (_req, res) => {
  res.render('editor', { slugs: listSlugs() });
});

export default router;
