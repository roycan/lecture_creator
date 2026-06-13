// scripts/lib/index.mjs
//
// Shared core barrel — single import surface for the CLI build (scripts/build.js),
// the integrity linter (scripts/check.js), and the Express /export route
// (server/). Keeping one import path means there is never a second copy of the
// export logic (context.md §3 / D5).
//
// Phase 2a exposes the slide splitter + presentation template. Later phases add
// image inlining (2b) and lib bundling (2c) here.

export { splitSlides } from './split-slides.mjs';
export { renderPresentation } from './template.mjs';
