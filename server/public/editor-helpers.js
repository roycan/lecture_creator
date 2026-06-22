// server/public/editor-helpers.js — pure, DOM-free editor helpers (Phase 6).
//
// These are the *logic* of the live-edit editor, extracted so it can be
// unit-tested with no browser (scripts/test/editor-helpers.test.js). The editor
// client (server/public/editor.js) imports them as an ES module.
//
// The safety-critical piece is decideReloadAction(): it encodes the
// "never auto-overwrite unsaved textarea edits" contract. Keeping it here (pure
// + side-effect-free) means that contract is locked by a test, not just a code
// comment — the highest-risk behavior in this phase has a regression net.

/** Inactivity window before a textarea edit triggers a preview rebuild (ms). */
export const DEBOUNCE_MS = 600;

/** How often the editor polls the on-disk lecture.md for changes (ms). */
export const POLL_MS = 2000;

/**
 * Trailing-edge debounce. The editor uses it so rapid typing triggers ONE
 * preview build after `delay` ms of quiet, not one build per keystroke.
 *
 * Returns the debounced function plus a `.cancel()` method (used to drop a
 * pending build when the teacher switches lectures or hits the manual Refresh).
 *
 * @param {(...args: unknown[]) => void} fn
 * @param {number} delay
 * @returns {{ (...args: unknown[]): void, cancel(): void }}
 */
export function debounce(fn, delay) {
  let timer = null;
  function debounced(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, delay);
  }
  debounced.cancel = function cancel() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };
  return debounced;
}

/**
 * True when the textarea holds edits that have not been reflected on disk
 * (it diverges from the last content read from disk). This is the
 * clobber-protection notion of "dirty" — distinct from "preview is stale".
 *
 * @param {string} editorContent - current textarea value.
 * @param {string} diskBaseline - content as last read from disk.
 * @returns {boolean}
 */
export function isUnsaved(editorContent, diskBaseline) {
  return editorContent !== diskBaseline;
}

/**
 * The safety-critical decision: given the freshly-fetched disk content and the
 * editor's state, what should the disk-change poll do? Pure and side-effect-free
 * so the non-clobbering contract is locked by a unit test.
 *
 * Returns one of:
 *   'none'   — disk content is unchanged since the last known state; no-op.
 *   'sync'   — disk changed, but the editor already matches the new disk
 *              content (e.g. the teacher typed the very same save); just
 *              refresh the baseline, no rebuild, no banner.
 *   'reload' — disk changed and the editor had NO unsaved edits; safe to
 *              silently reload (the VS-Code-save → browser-updates path).
 *   'banner' — disk changed but the editor has unsaved edits that differ from
 *              BOTH the old and the new disk content; DO NOT clobber — surface
 *              a non-blocking "changed on disk — Reload" banner and let the
 *              teacher decide. This branch is the only thing standing between
 *              a save-in-VS-Code and the loss of in-browser edits.
 *
 * Note: the textarea is only ever overwritten on the 'reload' branch, and that
 * branch is provably unreachable when the editor diverges from diskBaseline
 * (those cases route to 'sync' or 'banner').
 *
 * @param {{ diskContent: string, diskBaseline: string, editorContent: string }} state
 * @returns {'none' | 'sync' | 'reload' | 'banner'}
 */
export function decideReloadAction({ diskContent, diskBaseline, editorContent }) {
  if (diskContent === diskBaseline) return 'none';
  if (editorContent === diskContent) return 'sync';
  if (editorContent !== diskBaseline) return 'banner';
  return 'reload';
}
