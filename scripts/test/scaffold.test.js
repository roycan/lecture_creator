// scripts/test/scaffold.test.js — harness smoke test (Phase 1)
//
// Establishes the node --test harness so `npm test` is green from day one.
// Real unit/integration/route tests are added in Phases 2 and 5.
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('scaffold: node --test harness is wired', () => {
  assert.ok(true);
});
