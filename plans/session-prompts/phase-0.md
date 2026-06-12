# Phase 0 — Session Kickoff Prompt

> Copy everything inside the fence below and paste it as the **first message** of a new session.
> **Start the new session in Code mode.**

---

```text
We are continuing the "lecture_creator" restructure project. This session implements PHASE 0 only.

BOOTSTRAP — do this first, before any action:
1. Read inceptions/context.md  (project "second brain": identity, problem, locked decisions D1–D13, target architecture, conventions)
2. Read plans/progress.md       (find the "▶ RESUME HERE" pointer and the phase table)
3. Skim plans/reorg-inventory.md §6 (Duplicates/Misplacements) for the exact file lists

CONTEXT IN ONE PARAGRAPH:
A public-high-school CS teacher (Grade 10, Philippines) builds narrated Markdown→HTML
lecture slides. GitHub Pages hotlinking for images is no longer allowed, the repo is
cluttered with temp files, and some image links are broken. We are doing a FULL
RESTRUCTURE into per-lecture folders (lectures/<slug>/) plus a Node/Express+EJS app that
exports fully-offline single-file presentations (images as data URIs; highlight.js +
mermaid bundled). This session is just the safety snapshot — Phase 0.

PHASE 0 SCOPE — archive stray TEMP/SUMMARY/DUPLICATE/TEST files only.
Create archive/reorg-2026-06/ and `git mv` these root files into it:
  - SESSION_2_SUMMARY.md
  - session-2-summary.md   (duplicate of the above)
  - session-3-summary.md
  - plan-part2.md
  - plan-polish.md
  - QUICK-TEST-GUIDE.md
  - DOCUMENTATION-UPDATE-2025-11-10.md
  - CURRICULUM-COMPLETE.md
  - WEB-APP-PART1-PROGRESS.md
  - THEME-TOGGLE-IMPLEMENTATION.md
  - TESTING-CHECKLIST.md
  - TESTING-CHECKLIST-v2.1.2.md
  - test-lecture.md
  - test-code-highlighting-mermaid.md
  - AJAX_FETCH_ASSETS.md

DO NOT archive these (they are referenced and get RELOCATED in Phase 6, not archived):
  - database-sqlite-lecture.md
  - authentication-sessions-migration-guide.md
  - advanced-features-migration-guide.md
KEEP at root: README.md, CHANGELOG.md, app.js, index.html, style.css (moved in later phases).

RULES:
- Use `git mv` for every move (preserve history). Never `rm`/delete — archive only.
- One commit for this phase, e.g.: "chore: archive stray temp/summary/test files (Phase 0)".
- Before moving, confirm the list matches plans/reorg-inventory.md §6; ask me if unsure about any file.

DONE WHEN:
- archive/reorg-2026-06/ contains exactly the 15 files above.
- `git status` is clean after commit; root no longer has those temp files.
- plans/progress.md is updated: Phase 0 → ✅, session log appended, "▶ RESUME HERE" points to Phase 1.
- Report what you moved and the commit hash, then STOP (do not start Phase 1 — I review between phases).
```
