// server/app.js — Express + EJS SSR editor (Phase 1 scaffold)
//
// Bootable skeleton only. The real editor UI, lecture/asset routes, and
// POST /export arrive in Phase 4. The shared export core (splitSlides,
// inlineImages, bundleLibs, assemblePresentation) will live in scripts/lib
// (Phase 2) and is reused by both this server and the CLI build (D5).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', fileURLToPath(new URL('./views', import.meta.url)));

// --- Stub routes (Phase 4 replaces these) ---------------------------------
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', phase: 'scaffold' });
});

app.get('/', (_req, res) => {
  // TODO(Phase 4): list lectures under lectures/ and render the editor.
  res
    .type('text/plain')
    .send('lecture_creator — scaffold (Phase 1). Editor lands in Phase 4.');
});

// Listen only when run directly (not when imported by tests — Phase 5).
const __filename = fileURLToPath(import.meta.url);
if (path.resolve(process.argv[1]) === __filename) {
  app.listen(PORT, () => {
    console.log(`lecture_creator editor (scaffold) → http://localhost:${PORT}`);
  });
}

export default app;
