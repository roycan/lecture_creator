// scripts/reorg/move-manifest.mjs
//
// Declarative move map for the Phase 6 restructure (move-only).
// Source of truth: plans/reorg-inventory.md §1 + on-disk reference verification.
// Each lecture becomes lectures/<slug>/ with lecture.md (+ assets/ diagrams/ diagram-src/).
//
// Entry shape:
//   { slug, batch, md, docs?, diagrams?, assets?, diagramSrc?, extras? }
//     md         -> lectures/<slug>/lecture.md
//     docs[]     -> lectures/<slug>/<basename>            (extra .md companions)
//     diagrams[] -> lectures/<slug>/diagrams/<basename>   (file OR whole dir)
//     assets[]   -> lectures/<slug>/assets/<basename>
//     diagramSrc[] -> lectures/<slug>/diagram-src/<basename>
//     extras[]   -> lectures/<slug>/<basename>            (arbitrary, preserves dir)
//   NOTE: a bucket entry's SOURCE may live anywhere (e.g. css PNGs sourced from
//   assets/ but destined for the diagrams/ bucket per D9). Destination bucket is
//   determined by which array it is listed in; destination NAME = basename(src).
//
// `special` holds non-lecture relocations grouped by apply-batch key.

export const lectures = [
  // ───────────────────────── BATCH A ─────────────────────────
  {
    slug: 'html', batch: 'A',
    md: 'web-lectures/html-lecture.md',
    diagrams: ['diagrams/html'],
    assets: [
      'assets/html-structure.html', 'assets/barangay-semantic.html',
      'assets/text-practice.html', 'assets/links-images-practice.html',
      'assets/barangay-clearance-form.html', 'assets/price-list-table.html',
    ],
  },
  {
    // D9: CSS lecture PNGs currently live in assets/ (inconsistent) -> diagrams/.
    slug: 'css', batch: 'A',
    md: 'web-lectures/css-lecture.md',
    diagrams: [
      'assets/css-cascade-flow.png', 'assets/css-style-breakdown.png',
      'assets/css-application-methods.png', 'assets/css-selector-types.png',
      'assets/css-color-systems.png', 'assets/css-box-model-nested-structure.png',
      'assets/css-box-model.png', 'assets/css-specificity-hierarchy.png',
      'assets/simple-navigation-bar-structure.png',
    ],
  },
  {
    slug: 'responsive-bulma', batch: 'A',
    md: 'web-lectures/responsive-bulma-lecture.md',
    diagrams: ['diagrams/bulma'],
    assets: [
      'assets/bulma-grid-demo.html', 'assets/bulma-responsive-helpers.html',
      'assets/mobile-form.html', 'assets/gov-doc-starter.html',
    ],
  },
  {
    slug: 'js-basics', batch: 'A',
    md: 'web-lectures/js-lecture-part1.md',
    diagrams: [
      'diagrams/if-else.png', 'diagrams/discount-tiers.png',
      'diagrams/loop-lifecycle.png', 'diagrams/break-continue.png',
      'diagrams/nested-loops-grid.png', 'diagrams/function-anatomy.png',
    ],
    diagramSrc: ['diagram-src/js-basics'],
  },
  {
    slug: 'js-arrays-objects', batch: 'A',
    md: 'web-lectures/js-lecture-part2.md',
    diagrams: [
      'diagrams/array-indexing.png', 'diagrams/array-mutation.png',
      'diagrams/method-taxonomy.png', 'diagrams/array-pipeline.png',
      'diagrams/search-methods.png', 'diagrams/reduce-steps.png',
      'diagrams/sort-comparator.png', 'diagrams/object-anatomy.png',
      'diagrams/inventory-architecture.png', 'diagrams/category-filter.png',
      'diagrams/ranking-pipeline.png', 'diagrams/attendance-matrix.png',
    ],
    diagramSrc: ['diagram-src/js-arrays-objects'],
  },
  {
    slug: 'dom', batch: 'A',
    md: 'web-lectures/dom-lecture.md',
    diagrams: [
      'diagrams/dom-tree.png', 'diagrams/element-selection.png',
      'diagrams/class-toggle.png', 'diagrams/element-creation.png',
      'diagrams/event-flow-theory.png', 'diagrams/event-flow-practical.png',
      'diagrams/form-validation.png', 'diagrams/cart-architecture.png',
      'diagrams/event-delegation.png',
    ],
    assets: [
      'assets/practice1.html', 'assets/practice2.html', 'assets/practice3.html',
      'assets/todo.html', 'assets/calculator.html', 'assets/store.html',
    ],
    diagramSrc: ['diagram-src/dom'],
  },
  {
    slug: 'ajax-fetch', batch: 'A',
    md: 'web-lectures/ajax-fetch-lecture.md',
    diagrams: [
      'diagrams/promise-states.png', 'diagrams/fetch-lifecycle.png',
      'diagrams/async-await-comparison.png', 'diagrams/json-structure.png',
      'diagrams/error-flow.png', 'diagrams/loading-states.png',
      'diagrams/debounce-timeline.png',
      // ajax-topic outputs not embedded in the lecture (kept with the lecture):
      'diagrams/event-loop.png', 'diagrams/parallel-vs-sequential.png',
      'diagrams/cors-explanation.png',
    ],
    assets: [
      'assets/promise-basics.html', 'assets/fetch-demo.html',
      'assets/async-await-demo.html', 'assets/json-practice.html',
      'assets/error-handling.html', 'assets/search-demo.html',
      'assets/directory.html', 'assets/quiz.html',
      'assets/dashboard-school.html', 'assets/dashboard-store.html',
      'assets/dashboard-transport.html',
      'assets/weather.html', 'assets/weather-data.json',
      'assets/provinces.json', 'assets/students.json', 'assets/barangay-data.json',
      'assets/questions.json', 'assets/store-sales.json',
    ],
    diagramSrc: ['diagram-src/ajax-fetch-async'],
  },
  {
    slug: 'express-basics', batch: 'A',
    md: 'web-lectures/express-basics-lecture.md',
    diagrams: [
      'diagrams/folder-structure.png', 'diagrams/request-response-flow.png',
      'diagrams/request-response-flow-1.png', 'diagrams/ejs-rendering.png',
      'diagrams/deployment-flow.png', 'diagrams/json-vs-database.png',
      // web-server-basics topic outputs (kept with the lecture):
      'diagrams/express-routing.png', 'diagrams/form-submission.png',
      'diagrams/middleware-concept.png', 'diagrams/mvc-pattern.png',
      'diagrams/static-files.png',
    ],
    assets: [
      'assets/01-hello-express', 'assets/02-static-files', 'assets/03-ejs-basic',
      'assets/04-ejs-data', 'assets/05-json-read', 'assets/06-json-add',
      'assets/mini-project-barangay', 'assets/mini-project-students',
      'assets/mini-project-store', 'assets/railway-deployment-guide.md',
    ],
    diagramSrc: ['diagram-src/web-server-basics'],
  },

  // ───────────────────────── BATCH B ─────────────────────────
  {
    slug: 'database-sqlite', batch: 'B',
    md: 'database-sqlite-lecture.md', // ROOT stray -> becomes lecture.md
    docs: ['web-lectures/database-sqlite-migration-guide.md'],
    diagrams: ['diagrams/sql-operations.png', 'diagrams/database-basics'],
    assets: [
      'support-materials/sql-cheat-sheet.md', 'support-materials/sqlite-setup-guide.md',
      'support-materials/schema-templates',
      'practice-apps/07-sqlite-basics', 'practice-apps/08-crud-simple',
      'practice-apps/09-crud-validation', 'practice-apps/10-crud-relationships',
      'practice-apps/barangay-directory-v2', 'practice-apps/class-list-v2',
      'practice-apps/store-inventory-v2',
    ],
  },
  {
    slug: 'authentication-sessions', batch: 'B',
    md: 'web-lectures/authentication-sessions-lecture.md',
    docs: ['authentication-sessions-migration-guide.md'], // ROOT stray
    diagrams: ['diagrams/authentication', 'diagrams/supplementary/middleware-stack.png'],
  },
  {
    slug: 'csv-datatables-qr', batch: 'B',
    md: 'web-lectures/csv-datatables-qr-lecture.md',
    docs: ['advanced-features-migration-guide.md'], // ROOT stray (decision #3)
    diagrams: ['diagrams/advanced-features', 'diagrams/supplementary/datables-features.png'],
  },
  {
    // json-api-audit shares diagrams/advanced-features/* with csv (cross-lecture dep).
    slug: 'json-api-audit', batch: 'B',
    md: 'web-lectures/json-api-audit-lecture.md',
  },
  {
    slug: 'testing-quality', batch: 'B',
    md: 'web-lectures/testing-quality-lecture.md',
    diagrams: ['diagrams/testing-quality'],
    assets: [
      'assets/acceptance-criteria-generator.html', 'assets/smoke-test-checklist.html',
      'assets/bug-report-form.html', 'assets/e2e-test-script.html',
      'assets/test-case-template.html', 'assets/demo-prep-checklist.html',
    ],
    extras: ['mini-projects', 'challenges'],
  },
  {
    slug: 'git-github', batch: 'B',
    md: 'web-lectures/git-github-collaboration-lecture.md',
    diagrams: ['diagrams/git-github'],
    assets: ['assets/git-github'],
  },
  {
    slug: 'production-best-practices', batch: 'B',
    md: 'web-lectures/production-best-practices-lecture.md',
    diagrams: ['diagrams/production-best-practices'],
  },
  {
    slug: 'pwa-basics', batch: 'B',
    md: 'web-lectures/pwa-basics-lecture.md',
    diagrams: ['diagrams/pwa-basics'],
    assets: ['assets/pwa-basics'],
  },
  {
    // full-stack also references diagrams/api-testing/analogy.png (cross-lecture dep).
    slug: 'full-stack', batch: 'B',
    md: 'web-lectures/full-stack-handouts.md',
    docs: ['web-lectures/full-stack-showcase.md'],
    diagrams: ['diagrams/full-stack'],
  },
  {
    slug: 'api-testing', batch: 'B',
    md: 'web-lectures/api-testing-handouts.md',
    docs: ['web-lectures/api-testing-handouts-mermaid.md'],
    diagrams: ['diagrams/api-testing'],
  },
  {
    slug: 'localstorage', batch: 'B',
    md: 'web-lectures/localstorage.md',
  },
  {
    // D12 (revised): canonical = top-level web-lectures/tmc-eval360.md.
    // 8 PNGs physically at web-lectures/tmc-eval360/tmc-eval360/* -> assets/.
    slug: 'tmc-eval360', batch: 'B',
    md: 'web-lectures/tmc-eval360.md',
    assets: [
      'web-lectures/tmc-eval360/tmc-eval360/cycles360.png',
      'web-lectures/tmc-eval360/tmc-eval360/login360.png',
      'web-lectures/tmc-eval360/tmc-eval360/profile.png',
      'web-lectures/tmc-eval360/tmc-eval360/questions360.png',
      'web-lectures/tmc-eval360/tmc-eval360/ratings5.png',
      'web-lectures/tmc-eval360/tmc-eval360/report360.png',
      'web-lectures/tmc-eval360/tmc-eval360/set2024.png',
      'web-lectures/tmc-eval360/tmc-eval360/users360.png',
    ],
  },
];

export const special = {
  // Batch "shared": D7 styles.css + D8 shared challenge sets (canonical, copy-on-build).
  shared: [
    { src: 'assets/styles.css', dest: 'shared/styles.css' }, // D7
    // D8 — reusable starter/solution challenge sets referenced across lectures:
    { src: 'assets/dashboard-starter.html', dest: 'shared/challenges/dashboard-starter.html' },
    { src: 'assets/dashboard-solution.html', dest: 'shared/challenges/dashboard-solution.html' },
    { src: 'assets/store-catalog-starter.html', dest: 'shared/challenges/store-catalog-starter.html' },
    { src: 'assets/store-catalog-solution.html', dest: 'shared/challenges/store-catalog-solution.html' },
    { src: 'assets/barangay-clearance-starter.html', dest: 'shared/challenges/barangay-clearance-starter.html' },
    { src: 'assets/barangay-clearance-solution.html', dest: 'shared/challenges/barangay-clearance-solution.html' },
    { src: 'assets/contact-form-starter.html', dest: 'shared/challenges/contact-form-starter.html' },
    { src: 'assets/contact-form-solution.html', dest: 'shared/challenges/contact-form-solution.html' },
    { src: 'assets/school-website-starter.html', dest: 'shared/challenges/school-website-starter.html' },
    { src: 'assets/school-website-elementary.html', dest: 'shared/challenges/school-website-elementary.html' },
    { src: 'assets/school-website-highschool.html', dest: 'shared/challenges/school-website-highschool.html' },
    { src: 'assets/school-website-vocational.html', dest: 'shared/challenges/school-website-vocational.html' },
    { src: 'assets/barangay-profile-starter.html', dest: 'shared/challenges/barangay-profile-starter.html' },
    { src: 'assets/barangay-profile-solution.html', dest: 'shared/challenges/barangay-profile-solution.html' },
  ],
  // Batch "relocate": tmc-eval360 duplicate markdown archived (D13 — never delete).
  relocate: [
    { src: 'web-lectures/tmc-eval360/tmc-eval360.md', dest: 'archive/reorg-2026-06/tmc-eval360-duplicate.md' },
  ],
};
