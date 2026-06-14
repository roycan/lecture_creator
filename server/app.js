// server/app.js — Express + EJS SSR editor (Phase 4; Phase 5 createApp factory).
//
// The editor is a localhost authoring tool (D3): same-origin, so the preview
// <iframe> can show a self-contained build with data-URI images and inlined
// libs — no file:// CORS problem. Both preview and export call the SAME
// buildLecture the CLI uses (D5 single source of truth); the dead github.io
// base-URL mechanism is gone (D6).
//
// Routes (modular routers under server/routes/, mounted here):
//   GET  /                 editor page (lists lectures)            — editor.js
//   GET  /api/lectures     { slugs }                               — lectures.js
//   GET  /api/lectures/:s  { slug, markdown }                      — lectures.js
//   GET  /preview/:s       built deck HTML                         — export.js
//   POST /preview          built deck HTML for posted markdown     — export.js
//   POST /export           built deck HTML as a download attachment— export.js
//   GET  /health           { status } (smoke / Phase 5 tests)
//
// Listens only when run directly (npm start); importing `app` (supertest in
// Phase 5) never binds a port.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

import createEditorRouter from './routes/editor.js';
import createLecturesRouter from './routes/lectures.js';
import createExportRouter from './routes/export.js';

const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Build an Express app. Phase 5: tests inject `lecturesDir` to point at a
 * throwaway fixture tree; production (npm start) calls createApp() with no
 * args, so each router factory falls back to <repo>/lectures.
 *
 * @param {{ lecturesDir?: string }} opts
 * @returns {import('express').Express}
 */
export function createApp({ lecturesDir } = {}) {
  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  // Editor client assets (server/public/editor.js).
  app.use('/static', express.static(path.join(__dirname, 'public')));

  // Parse JSON bodies for POST /preview and POST /export (the posted markdown).
  app.use(express.json({ limit: '20mb' }));

  // Health probe (kept from the Phase-1 scaffold; handy for smokes + Phase 5).
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', phase: 'editor' });
  });

  // Routes.
  app.use('/', createEditorRouter({ lecturesDir }));
  app.use('/api/lectures', createLecturesRouter({ lecturesDir }));
  app.use('/', createExportRouter({ lecturesDir }));

  // 404 — nothing matched.
  app.use((_req, res) => {
    res.status(404).type('text').send('404 — not found');
  });

  // Error handler (route handlers `next(err)` with err.statusCode).
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    const status = err.statusCode || 500;
    if (status >= 500) console.error(err);
    res.status(status).type('text').send(`${status} — ${err.message}`);
  });

  return app;
}

// Default app for `npm start`; supertest imports `createApp` for hermetic tests.
const app = createApp();

// Listen only when run directly (not when imported by tests — Phase 5).
// The `process.argv[1]` guard is null-checked: under `node -e` / `node --test`
// argv[1] can be undefined, and path.resolve(undefined) would throw.
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  app.listen(PORT, () => {
    console.log(`lecture_creator editor → http://localhost:${PORT}`);
  });
}

export default app;
