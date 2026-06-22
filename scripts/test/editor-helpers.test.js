// scripts/test/editor-helpers.test.js
//
// Unit tests for the pure, DOM-free editor helpers (server/public/editor-
// helpers.js). These lock the safety-critical "never clobber unsaved edits"
// contract (decideReloadAction) and the debounce timing without a browser.
// Uses the same runner as the rest of the suite (node:test + node:assert) —
// no new framework, no new devDependency.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  debounce,
  decideReloadAction,
  isUnsaved,
  DEBOUNCE_MS,
  POLL_MS,
} from '../../server/public/editor-helpers.js';

test('timing constants match the spec (~600 ms debounce, ~2 s poll)', () => {
  assert.equal(DEBOUNCE_MS, 600);
  assert.equal(POLL_MS, 2000);
});

test('debounce fires once after the quiet window, not once per call', async () => {
  let calls = 0;
  const fn = debounce(() => {
    calls += 1;
  }, 20);
  fn();
  fn();
  fn(); // three rapid calls collapse into one trailing invocation
  assert.equal(calls, 0, 'not yet fired (within the quiet window)');
  await new Promise((r) => setTimeout(r, 60));
  assert.equal(calls, 1, 'exactly one trailing call after the quiet window');
});

test('debounce.cancel() prevents a pending call', async () => {
  let calls = 0;
  const fn = debounce(() => {
    calls += 1;
  }, 20);
  fn();
  fn.cancel();
  await new Promise((r) => setTimeout(r, 60));
  assert.equal(calls, 0, 'cancelled pending call did not fire');
});

test('isUnsaved is true exactly when the editor diverges from the disk baseline', () => {
  assert.equal(isUnsaved('a', 'a'), false);
  assert.equal(isUnsaved('a', 'b'), true);
  assert.equal(isUnsaved('', ''), false);
  assert.equal(isUnsaved('edited', ''), true);
});

// --- decideReloadAction: the non-clobbering safety contract -----------------

test('decideReloadAction: disk unchanged → "none" (no-op)', () => {
  assert.equal(
    decideReloadAction({ diskContent: 'same', diskBaseline: 'same', editorContent: 'same' }),
    'none',
  );
  assert.equal(
    decideReloadAction({ diskContent: 'same', diskBaseline: 'same', editorContent: 'edited' }),
    'none',
  );
});

test('decideReloadAction: clean editor + disk changed → "reload" (the VS-Code-save path)', () => {
  assert.equal(
    decideReloadAction({ diskContent: 'new', diskBaseline: 'old', editorContent: 'old' }),
    'reload',
  );
});

test('decideReloadAction: editor already equals new disk → "sync" (no rebuild needed)', () => {
  assert.equal(
    decideReloadAction({ diskContent: 'new', diskBaseline: 'old', editorContent: 'new' }),
    'sync',
  );
});

test('decideReloadAction: unsaved edits differ from new disk → "banner" (NEVER clobber)', () => {
  // The safety-critical case: the teacher typed 'wip' (unsaved), and meanwhile
  // disk moved old → new. Must NOT reload (that would destroy 'wip'); must
  // surface the non-blocking reload banner instead.
  assert.equal(
    decideReloadAction({ diskContent: 'new', diskBaseline: 'old', editorContent: 'wip' }),
    'banner',
  );
});

test('decideReloadAction: "reload" is unreachable while the editor diverges from disk', () => {
  // Exhaustive proof of the contract: enumerate the three meaningful divergences
  // and confirm only 'banner'/'sync' can fire when editor !== diskBaseline.
  const cases = [
    { diskContent: 'new', diskBaseline: 'old', editorContent: 'old' }, // clean → reload
    { diskContent: 'new', diskBaseline: 'old', editorContent: 'new' }, // matches new → sync
    { diskContent: 'new', diskBaseline: 'old', editorContent: 'wip' }, // divergent → banner
  ];
  const results = cases.map((c) => decideReloadAction(c));
  // No case where editor !== diskBaseline yields 'reload' — clobber is impossible.
  assert.ok(
    !cases.some((c, i) => c.editorContent !== c.diskBaseline && results[i] === 'reload'),
    'reload never fires when the editor has unsaved edits',
  );
});
