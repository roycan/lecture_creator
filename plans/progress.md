# 📊 Progress Tracker — lecture_creator restructure

> **Living document.** Update at the end of every session. New sessions: read [`inceptions/context.md`](../inceptions/context.md) first, then find **▶ RESUME HERE** below.

**Last updated:** 2026-06-12 · **Overall:** Planning complete → ready for Phase 0.

---

## ▶ RESUME HERE

**Next action:** Phase 0 — archive stray root files into `archive/reorg-2026-06/` via `git mv`, then commit a clean baseline.
**Mode:** Code · **Confidence:** 96%
**Implementation order:** `0 → 1 → 6 → 2 → 3 → 7 → 4 → 5 → 8 → 9` (restructure right after scaffold so the linter validates it).

---

## Phase Status

| # | Phase | Confidence | Status | Session date |
|---|---|---|---|---|
| — | Planning (context, architecture, decisions, inventory) | — | ✅ Done | 2026-06-12 |
| 0 | Snapshot: archive stray root files (`git mv` → `archive/reorg-2026-06/`) | 96% | ⏳ Next | — |
| 1 | Scaffold: `package.json`, `server/`, `scripts/lib`, `shared/`, `dist/`, `.gitignore`, npm scripts | 95% | ⬜ Pending | — |
| 6 | Restructure: dry-run mover, then `git mv` lectures → `lectures/<slug>/`; `shared/styles.css`; de-dup tmc-eval360; relocate stray `database-sqlite-lecture.md` | 95% | ⬜ Pending | — |
| 2a | Core: `splitSlides` (marked.lexer) + port `createSingleHTML` template | 92% | ⬜ Pending | — |
| 2b | Core: data-URI image inlining (MIME png/svg/jpg, clear errors) | 93% | ⬜ Pending | — |
| 2c | Core: bundle highlight.js always; mermaid only when used | 91% | ⬜ Pending | — |
| 3 | CLI: `build.js` (`--slug`/`--all`) + `check.js` linter | 94% | ⬜ Pending | — |
| 7a | Rewire image/asset refs with valid target (fix 3 typos + repaths) | 97% | ⬜ Pending | — |
| 7b | Truly-missing images: render from sources or log TODO (non-blocking) | 85% | ⬜ Pending | — |
| 4 | Express+EJS editor: reuse `app.js` preview/TTS; list lectures; same-origin preview; `POST /export`; drop base-URL field | 92% | ⬜ Pending | — |
| 5 | Tests: unit + integration (zero external URLs) + routes (supertest); wire `check` | 93% | ⬜ Pending | — |
| 8 | Docs: update README, FOLDER-STRUCTURE, LECTURE-CREATION-PATTERN | 95% | ⬜ Pending | — |
| 9 | Verify acceptance: `npm test` green, `check` clean, zero external URLs, offline open OK, `npm start` round-trip | 92% | ⬜ Pending | — |

Legend: ✅ Done · ⏳ Next · 🔄 In progress · ⬜ Pending · ⚠️ Blocked

---

## Session Log

### Session 1 — 2026-06-12 (Planning)
- Read README + explored structure; diagnosed the github-pages hotlink mechanism and broken links.
- Locked direction: full restructure + offline Node data-URI build + Express/EJS SSR editor; bundle highlight.js + mermaid (conditional).
- Authored architecture, layered test strategy, confidence-scored phases.
- Generated [`plans/reorg-inventory.md`](reorg-inventory.md) (ownership map + broken-link worklist).
- Resolved 5 open decisions (D7–D11 in context doc).
- Created [`inceptions/context.md`](../inceptions/context.md) + this tracker.
- **Next:** Phase 0.

<!-- Append new sessions below using this template:
### Session N — YYYY-MM-DD (Phase X)
- Did: ...
- Decisions: ...
- Issues/TODOs: ...
- Commit(s): <sha>
- **Next:** ...
-->

---

## Decisions Log

See [`inceptions/context.md`](../inceptions/context.md) §6 (D1–D13) for the full locked-decisions table with rationale. Add new decisions here as they arise:

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-12 | D1–D13 | see context.md §6 |

---

## Open TODOs / Known Gaps (non-blocking)

- Content gaps to author later: `assets/weather.html`(+json), `user-story-template.html`, `debugging-practice.html`, `uat-form.html`, `support-materials/auth-patterns.md`, `support-materials/session-config-guide.md`, `practice-apps/*-v2/-v3`.
- Truly-missing PNGs to render from `.mmd`/`.d2`/`.txt` sources (Phase 7b): testing-quality ×6, responsive-bulma ×4, express-basics ×1, production-best-practices ×2.
- Verify tmc-eval360 image locations during Phase 6.

---

## Commit Hygiene

- One commit per phase (or logical sub-step).
- Use `git mv` for all relocations (preserve history).
- Never `rm` — move to `archive/reorg-2026-06/`.
- After each phase: update this file's status table + session log, then commit.
