// scripts/test/narration-controller.test.js
//
// Phase B behavioral tests for the narration controller (TTS Reliability
// workstream). Phase A's LEGACY CHARACTERIZATION tests (error skipping,
// cancellation without invalidation, concurrent chains) have been REPLACED —
// those defects are now repaired and their old assertions would pin behavior
// we no longer want.
//
// Session ownership model under test:
//   - one active narration session; monotonic session id;
//   - session + timers are invalidated BEFORE synth.cancel() (sync-cancel
//     events must be inert);
//   - every async callback (onstart/onend/onerror/timers/completion) guards
//     on BOTH session and run ownership before touching any state.
//
// All behavior is observed through injected mocks (synth, Utterance, timers,
// log, getters). Mocks do NOT model real Chrome cancellation-event behavior;
// they prove the controller is safe under whichever event a browser delivers.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';

import { createNarrator } from '../lib/narration-controller.mjs';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

function makeTimers() {
  let queue = [];
  let nextId = 1;
  const cancelledFns = [];
  return {
    setTimeout(fn, ms) {
      const id = nextId++;
      queue.push({ id, fn, ms });
      return id;
    },
    clearTimeout(id) {
      const gone = queue.find((t) => t.id === id);
      if (gone) cancelledFns.push(gone.fn); // retained for stale-callback tests
      queue = queue.filter((t) => t.id !== id);
    },
    pending() {
      return queue.map((t) => t.ms);
    },
    cancelledFns() {
      return cancelledFns.slice();
    },
    runNext() {
      assert.ok(queue.length > 0, 'runNext called with an empty timer queue');
      const t = queue.shift();
      t.fn();
      return t.ms;
    },
  };
}

// cancelFires: optionally deliver a cancellation event SYNCHRONOUSLY from
// inside cancel() — models the worst-case browser ordering where the event
// for the interrupted utterance arrives before cancel() returns.
function makeSynth({ cancelFires = null } = {}) {
  const spoken = [];
  const state = { cancelCalls: 0 };
  return {
    spoken,
    state,
    speak(utterance) {
      spoken.push(utterance);
    },
    cancel() {
      state.cancelCalls++;
      if (cancelFires && spoken.length > 0) {
        const u = spoken[spoken.length - 1];
        if (cancelFires === 'onend' && typeof u.onend === 'function') u.onend();
        if (cancelFires === 'onerror' && typeof u.onerror === 'function') {
          u.onerror({ error: 'interrupted' });
        }
      }
    },
  };
}

function MockUtterance(text) {
  this.text = text;
}

function harness(overrides = {}) {
  const timers = makeTimers();
  const synth = makeSynth(overrides.synthOptions || {});
  const logs = [];
  const states = [];
  const completions = [];
  const narrator = createNarrator({
    synth: 'synth' in overrides ? overrides.synth : synth,
    Utterance: overrides.Utterance || MockUtterance,
    timers,
    log: overrides.log || ((msg, level) => logs.push({ msg, level })),
    onStateChange: overrides.onStateChange || ((s) => states.push({ ...s })),
    getVoice: overrides.getVoice || (() => null),
    getRate: overrides.getRate || (() => 1.0),
    getPitch: overrides.getPitch || (() => 1.0),
  });
  return {
    narrator,
    timers,
    synth: 'synth' in overrides ? overrides.synth : synth,
    logs,
    states,
    completions,
    speak(sentences, token, extra = {}) {
      narrator.speak({
        token,
        sentences,
        onComplete: (payload) => completions.push(payload),
        ...extra,
      });
    },
    lastState() {
      return states[states.length - 1];
    },
    speechErrorLogs() {
      return logs.filter((l) => l.msg.startsWith('Speech error:'));
    },
  };
}

// ---------------------------------------------------------------------------
// Basic lifecycle
// ---------------------------------------------------------------------------

test('1: play starts at sentence zero with the legacy 220ms chain gap', () => {
  const h = harness();
  h.speak(['One.', 'Two.'], 3);

  assert.equal(h.synth.spoken.length, 1);
  assert.equal(h.synth.spoken[0].text, 'One.');
  assert.equal(h.narrator.getState().activeSentenceIndex, 0);
  assert.equal(h.narrator.getState().nextSentenceIndex, 1);
  assert.deepEqual(
    h.timers.pending(),
    [h.narrator.getState().watchdog.startupMs],
    'chain waits on utterance events (plus its startup watchdog)'
  );

  h.synth.spoken[0].onend();
  assert.deepEqual(h.timers.pending(), [220]);
  h.timers.runNext();
  assert.equal(h.synth.spoken[1].text, 'Two.');
});

test('8: natural completion fires exactly once and late duplicate events stay inert', () => {
  const h = harness();
  h.speak(['One.', 'Two.'], 0);

  h.synth.spoken[0].onstart();
  h.synth.spoken[0].onend();
  h.timers.runNext();
  h.synth.spoken[1].onstart();
  h.synth.spoken[1].onend();
  h.timers.runNext();

  assert.equal(h.completions.length, 1);
  assert.equal(h.completions[0].empty, false);
  assert.equal(h.narrator.getState().status, 'idle');
  assert.deepEqual(h.timers.pending(), []);

  // Duplicate/late onend after completion must not resurrect state or re-fire.
  h.synth.spoken[1].onend();
  assert.deepEqual(h.timers.pending(), [], 'no gap timer scheduled after completion');
  assert.equal(h.narrator.getState().status, 'idle');
  assert.equal(h.completions.length, 1, 'completion still fires exactly once');
});

test('17: completion payload carries the correct token and current session', () => {
  const h = harness();
  h.speak(['Only.'], 7);

  h.synth.spoken[0].onstart();
  h.synth.spoken[0].onend();
  h.timers.runNext();

  assert.equal(h.completions.length, 1);
  assert.equal(h.completions[0].token, 7);
  // The presentation layer verifies payload.session === getState().session,
  // so a natural completion must report the CURRENT session.
  assert.equal(h.completions[0].session, h.narrator.getState().session);
});

test('9: empty content completes distinctly from successful speech', () => {
  const h = harness();
  h.speak([], 0);

  assert.deepEqual(h.timers.pending(), [500], 'legacy empty pacing retained');
  assert.equal(h.synth.spoken.length, 0, 'no utterance for empty content');
  assert.ok(h.logs.some((l) => l.msg === 'Empty text, skipping speech'));
  h.timers.runNext();

  assert.equal(h.completions.length, 1);
  assert.equal(h.completions[0].empty, true, 'empty completion is distinguishable');
  assert.equal(h.narrator.getState().status, 'idle');

  // Successful completion reports empty:false — the two are distinct (test 8).
  h.speak(['Real sentence.'], 1);
  h.synth.spoken[0].onstart();
  h.synth.spoken[0].onend();
  h.timers.runNext();
  assert.equal(h.completions[1].empty, false);
  assert.equal(
    h.synth.spoken.length,
    1,
    'total = 0 utterances from the empty run + 1 from the real run'
  );
});

// ---------------------------------------------------------------------------
// Settings at utterance construction (contract unchanged; Phase C owns values)
// ---------------------------------------------------------------------------

test('rate, pitch, and voice are read from the getters at each utterance construction', () => {
  const rates = [0.9, 1.1];
  const voice = { name: 'Mock Voice', voiceURI: 'mock-1' };
  const h = harness({
    getRate: () => rates.shift(),
    getPitch: () => 1.2,
    getVoice: () => voice,
  });
  h.speak(['A.', 'B.'], 0);

  assert.equal(h.synth.spoken[0].rate, 0.9);
  assert.equal(h.synth.spoken[0].pitch, 1.2);
  assert.equal(h.synth.spoken[0].voice, voice);

  h.synth.spoken[0].onstart();
  h.synth.spoken[0].onend();
  h.timers.runNext();
  assert.equal(h.synth.spoken[1].rate, 1.1, 're-read for the next sentence');
});

test('utterance.voice stays unset when the getter returns no usable voice', () => {
  const h = harness();
  h.speak(['A.'], 0);
  assert.ok(!('voice' in h.synth.spoken[0]));
});

test('blank sentence entries are skipped after the legacy 220ms + 200ms hops', () => {
  const h = harness();
  h.speak(['A.', '   ', 'B.'], 0);

  h.synth.spoken[0].onstart();
  h.synth.spoken[0].onend();
  assert.deepEqual(h.timers.pending(), [220]);
  h.timers.runNext();
  assert.equal(h.synth.spoken.length, 1, 'blank entry produced no utterance');
  assert.deepEqual(h.timers.pending(), [200], 'legacy blank-sentence hop');

  h.timers.runNext();
  assert.equal(h.synth.spoken[1].text, 'B.');
});

test('utterance-construction failure stops visibly instead of completing silently (Phase B change)', () => {
  // Phase A characterized the legacy behavior (log + complete via 500ms —
  // silently skipping the whole slide). Phase B routes it to the error state.
  function ThrowingUtterance() {
    throw new Error('boom');
  }
  const h = harness({ Utterance: ThrowingUtterance });
  h.speak(['A.'], 0);

  assert.ok(
    h.logs.some((l) => l.msg === 'Error in speakText: boom' && l.level === 'error'),
    'legacy log line preserved verbatim'
  );
  assert.equal(h.narrator.getState().status, 'error');
  assert.equal(h.completions.length, 0, 'no silent completion');
  assert.equal(h.synth.spoken.length, 0);
});

// ---------------------------------------------------------------------------
// Pause / resume — correct sentence position (spec §4)
// ---------------------------------------------------------------------------

test('2: pause during speech invalidates the session, cancels, and clears timers', () => {
  const h = harness();
  h.speak(['A.', 'B.'], 0);
  h.synth.spoken[0].onstart();
  assert.equal(h.narrator.getState().status, 'playing');
  const sessionBefore = h.narrator.getState().session;

  h.narrator.pause();

  assert.equal(h.synth.state.cancelCalls, 1, 'browser speech cancelled');
  assert.ok(h.narrator.getState().session > sessionBefore, 'session invalidated');
  assert.equal(h.narrator.getState().status, 'paused');
  assert.equal(h.narrator.getState().resumeIndex, 0, 'interrupted sentence remembered');
  assert.deepEqual(h.timers.pending(), [], 'no timers survive pause');
});

test('3: resume after pausing mid-sentence repeats the interrupted sentence', () => {
  const h = harness();
  h.speak(['A.', 'B.'], 0);
  h.synth.spoken[0].onstart();
  h.narrator.pause();

  h.narrator.resume();

  assert.equal(h.synth.spoken.length, 2);
  assert.equal(h.synth.spoken[1].text, 'A.', 'interrupted sentence is repeated');
  assert.equal(h.narrator.getState().status, 'starting');

  // …and the chain continues normally from there.
  h.synth.spoken[1].onstart();
  h.synth.spoken[1].onend();
  h.timers.runNext();
  assert.equal(h.synth.spoken[2].text, 'B.');
});

test('4: pause during the inter-sentence gap resumes at the NEXT sentence', () => {
  const h = harness();
  h.speak(['A.', 'B.'], 0);
  h.synth.spoken[0].onstart();
  h.synth.spoken[0].onend();
  assert.equal(h.narrator.getState().status, 'awaiting-next');
  assert.deepEqual(h.timers.pending(), [220]);

  h.narrator.pause();
  assert.deepEqual(h.timers.pending(), [], 'gap timer cleared on pause');
  assert.equal(h.narrator.getState().resumeIndex, 1, 'completed sentence not repeated');

  h.narrator.resume();
  assert.equal(h.synth.spoken[1].text, 'B.', 'resumes at the next sentence');
});

test('4b: pause after a handoff repeats the NEW active sentence (spec table row 3)', () => {
  const h = harness();
  h.speak(['A.', 'B.'], 0);
  h.synth.spoken[0].onstart();
  h.synth.spoken[0].onend();
  h.timers.runNext(); // B dispatched
  h.synth.spoken[1].onstart(); // sentence 4 (B) has already started
  assert.equal(h.narrator.getState().activeSentenceIndex, 1);

  h.narrator.pause();
  assert.equal(h.narrator.getState().resumeIndex, 1);

  h.narrator.resume();
  assert.equal(h.synth.spoken[2].text, 'B.', 'repeats the active sentence, not A');
});

test('resume is a no-op unless the controller is paused with a retained run', () => {
  const h = harness();
  h.narrator.resume(); // idle: nothing to do
  assert.equal(h.narrator.getState().status, 'idle');
  assert.equal(h.synth.spoken.length, 0);
  assert.equal(h.completions.length, 0);
});

// ---------------------------------------------------------------------------
// Stop / replay foundations
// ---------------------------------------------------------------------------

test('5: stop cancels speech, returns to idle, and resets position', () => {
  const h = harness();
  h.speak(['A.', 'B.'], 4);
  h.synth.spoken[0].onstart();

  h.narrator.stop();

  assert.equal(h.synth.state.cancelCalls, 1);
  assert.equal(h.narrator.getState().status, 'idle');
  const s = h.narrator.getState();
  assert.equal(s.activeSentenceIndex, null);
  assert.equal(s.nextSentenceIndex, null);
  assert.equal(s.resumeIndex, null);
  assert.equal(s.token, null, 'run data cleared');
  assert.equal(s.sentenceCount, 0);
  assert.deepEqual(h.timers.pending(), [], 'all timers cleared');

  // Late events from the stopped session are inert.
  h.synth.spoken[0].onend();
  assert.deepEqual(h.timers.pending(), []);
  assert.equal(h.narrator.getState().status, 'idle');
  assert.equal(h.completions.length, 0, 'stop never completes');
});

test('6: a fresh speak after stop starts from sentence zero', () => {
  const h = harness();
  h.speak(['A.', 'B.'], 0);
  h.narrator.stop();

  h.speak(['A.', 'B.'], 0);
  assert.equal(h.synth.spoken[h.synth.spoken.length - 1].text, 'A.');
  assert.equal(h.narrator.getState().activeSentenceIndex, 0);
});

test('7: speak after natural completion establishes a fresh session from zero', () => {
  const h = harness();
  h.speak(['A.', 'B.'], 1);
  h.synth.spoken[0].onstart();
  h.synth.spoken[0].onend();
  h.timers.runNext();
  h.synth.spoken[1].onstart();
  h.synth.spoken[1].onend();
  h.timers.runNext();
  assert.equal(h.completions.length, 1);

  const sessionAfter = h.narrator.getState().session;
  h.speak(['A.', 'B.'], 1);
  assert.ok(h.narrator.getState().session > sessionAfter, 'replay gets a new session');
  assert.equal(h.synth.spoken[h.synth.spoken.length - 1].text, 'A.');
});

// ---------------------------------------------------------------------------
// Session ownership — stale callbacks must be inert
// ---------------------------------------------------------------------------

test('10: starting a new narration invalidates the previous session', () => {
  const h = harness();
  h.speak(['A1.', 'A2.'], 1);
  h.speak(['B1.'], 2);

  const s = h.narrator.getState();
  assert.equal(s.token, 2, 'state belongs to the newest session');
  assert.equal(s.sentenceCount, 1);
  assert.equal(s.session, 2);

  // The old chain's events change nothing.
  h.synth.spoken[0].onstart();
  h.synth.spoken[0].onend();
  assert.deepEqual(
    h.timers.pending(),
    [h.narrator.getState().watchdog.startupMs],
    'old chain cannot schedule — only the new session\'s startup watchdog is pending'
  );
  assert.equal(h.synth.spoken.length, 2, 'only the new session speaks');
  assert.equal(h.narrator.getState().status, 'starting');
  assert.equal(h.narrator.getState().token, 2);
});

test('11: a stale onend cannot speak another sentence', () => {
  const h = harness();
  h.speak(['A1.', 'A2.'], 1);
  const stale = h.synth.spoken[0];
  h.speak(['B1.', 'B2.'], 2);

  stale.onend();
  assert.deepEqual(
    h.timers.pending(),
    [h.narrator.getState().watchdog.startupMs],
    'stale onend adds nothing beyond the new session\'s startup watchdog'
  );
  assert.equal(h.synth.spoken.length, 2, 'no sentence spoken by the stale chain');
});

test('12: a stale onerror cannot overwrite state or emit an error', () => {
  const h = harness();
  h.speak(['A1.'], 1);
  const stale = h.synth.spoken[0];
  h.speak(['B1.'], 2);

  stale.onerror({ error: 'interrupted' });

  assert.equal(h.speechErrorLogs().length, 0, 'stale error is not even logged');
  assert.equal(h.narrator.getState().status, 'starting', 'current session state untouched');
  assert.equal(h.completions.length, 0);
  assert.deepEqual(
    h.timers.pending(),
    [h.narrator.getState().watchdog.startupMs],
    'stale onerror adds no timer of its own'
  );
});

test('13: stale timers are cleared on invalidation, not merely guarded', () => {
  const h = harness();
  h.speak(['A1.', 'A2.'], 1);
  h.synth.spoken[0].onstart();
  h.synth.spoken[0].onend();
  assert.equal(h.timers.pending().length, 1, 'gap timer scheduled by old chain');

  h.speak(['B1.'], 2);
  assert.deepEqual(
    h.timers.pending(),
    [h.narrator.getState().watchdog.startupMs],
    'old gap timer cleared; only the new session\'s startup watchdog remains'
  );
});

test('14: stale callbacks cannot overwrite active/next indexes, token, status, or count', () => {
  const h = harness();
  h.speak(['A1.', 'A2.'], 1);
  h.synth.spoken[0].onstart();
  h.synth.spoken[0].onend();
  h.timers.runNext(); // A2 dispatched: active 1, next 2

  h.speak(['B1.'], 2); // replaces: active 0, next 1, token 2, count 1, starting
  const before = h.narrator.getState();

  h.synth.spoken[0].onstart();
  h.synth.spoken[0].onend();
  h.synth.spoken[0].onerror({ error: 'x' });
  h.synth.spoken[1].onstart();
  h.synth.spoken[1].onerror({ error: 'y' }); // A2 (stale) events
  const after = h.narrator.getState();

  assert.deepEqual(after, before, 'every exposed field is unchanged by stale events');
  assert.equal(after.activeSentenceIndex, 0);
  assert.equal(after.nextSentenceIndex, 1);
  assert.equal(after.token, 2);
  assert.equal(after.sentenceCount, 1);
  assert.equal(after.status, 'starting');
  assert.equal(h.speechErrorLogs().length, 0);
});

test('15: cancellation invalidates BEFORE the synthesis cancellation event can fire', () => {
  // Sync-cancel synth: cancel() delivers the interrupted utterance's event
  // before returning — the exact ordering hazard called out in the brief.
  for (const fires of ['onend', 'onerror']) {
    const h = harness({ synthOptions: { cancelFires: fires } });
    h.speak(['A.', 'B.'], 0);
    h.synth.spoken[0].onstart();

    h.narrator.pause();

    assert.equal(h.narrator.getState().status, 'paused', `status survives sync ${fires}`);
    assert.deepEqual(h.timers.pending(), [], `sync ${fires} cannot schedule a timer`);
    assert.equal(h.synth.spoken.length, 1, `sync ${fires} cannot speak`);
    assert.equal(h.speechErrorLogs().length, 0, 'sync onerror cannot emit an error');
    assert.equal(h.completions.length, 0);
    assert.equal(h.synth.state.cancelCalls, 1);
  }
});

test('16: rapid Play/Pause/Stop/Play leaves exactly one active session', () => {
  const h = harness();
  h.speak(['A1.', 'A2.'], 1); // session 1
  h.narrator.pause(); // 2
  h.narrator.stop(); // 3
  h.speak(['C1.'], 3); // 4 — single sentence so one completion pass suffices
  const s1 = h.synth.spoken[0]; // from the first session

  assert.equal(h.narrator.getState().session, 4, 'monotonic session id');
  assert.equal(h.narrator.getState().token, 3);
  assert.equal(h.narrator.getState().status, 'starting');
  assert.deepEqual(h.timers.pending(), [h.narrator.getState().watchdog.startupMs]);

  s1.onstart();
  s1.onend();
  assert.deepEqual(
    h.timers.pending(),
    [h.narrator.getState().watchdog.startupMs],
    'no interleaved chain resurfaces'
  );
  assert.equal(h.synth.spoken.length, 2, 'only the latest session is speaking');

  // The live session still completes normally.
  h.synth.spoken[1].onstart();
  h.synth.spoken[1].onend();
  h.timers.runNext();
  assert.equal(h.completions.length, 1);
  assert.equal(h.completions[0].token, 3);
  assert.equal(h.narrator.getState().status, 'idle');
});

// ---------------------------------------------------------------------------
// Errors and missing synthesis
// ---------------------------------------------------------------------------

test('25: a speech error stops visibly, skips nothing, and ignores late events', () => {
  const h = harness();
  h.speak(['Bad.', 'Good.'], 0);
  h.synth.spoken[0].onstart();

  h.synth.spoken[0].onerror({ error: 'network' });

  const s = h.narrator.getState();
  assert.equal(s.status, 'error');
  assert.ok(s.errorMessage.includes('network'), 'useful detail preserved');
  assert.ok(
    s.errorMessage.includes('Press Play to restart this slide from the beginning'),
    'speech errors carry the corrected recovery wording too'
  );
  assert.equal(s.errorCode, 'speech-error');
  assert.ok(
    h.speechErrorLogs().some((l) => l.msg === 'Speech error: network' && l.level === 'warn')
  );
  assert.equal(h.completions.length, 0, 'error never completes (no auto-advance)');
  assert.equal(
    h.synth.spoken.length,
    1,
    'the failed sentence was NOT skipped — Good never spoken'
  );
  assert.equal(h.synth.state.cancelCalls, 1, 'speech cancelled safely after invalidation');
  assert.deepEqual(h.timers.pending(), []);

  // Late cancellation-related events from the failed session are ignored (26).
  h.synth.spoken[0].onend();
  h.synth.spoken[0].onerror({ error: 'interrupted' });
  assert.equal(h.narrator.getState().status, 'error', 'late events cannot un-error or re-error');
  assert.equal(h.speechErrorLogs().length, 1, 'no duplicate error emission');
  assert.equal(h.completions.length, 0);
});

test('27: missing synthesis support fails visibly and never completes; stop() stays safe', () => {
  const h = harness({ synth: null });
  h.speak(['A.'], 0);

  const s = h.narrator.getState();
  assert.equal(s.status, 'error');
  assert.equal(s.errorCode, 'synthesis-unsupported');
  assert.ok(s.errorMessage.toLowerCase().includes('read the slide manually'));
  assert.equal(h.completions.length, 0, 'no silent burn-through completion');
  assert.equal(h.states[h.states.length - 1].status, 'error');

  assert.doesNotThrow(() => h.narrator.stop());
  assert.equal(h.narrator.getState().status, 'idle', 'stop() from error returns to idle');
});

test('30-foundation: a fresh speak after a recoverable error retries cleanly', () => {
  const h = harness();
  h.speak(['A.'], 0);
  h.synth.spoken[0].onerror({ error: 'network' });
  assert.equal(h.narrator.getState().status, 'error');

  h.speak(['A.', 'B.'], 0); // retry (e.g. Play pressed again)
  assert.equal(h.narrator.getState().status, 'starting');
  assert.equal(h.narrator.getState().errorCode, null, 'error state cleared on retry');
  assert.equal(h.synth.spoken.length, 2, 'new attempt actually speaks');
});

// ---------------------------------------------------------------------------
// State notifications and introspection
// ---------------------------------------------------------------------------

test('onStateChange observes starting → playing → awaiting-next → idle', () => {
  const h = harness();
  h.speak(['A.'], 0);
  assert.equal(h.states[0].status, 'starting', 'no premature "playing" claim');

  h.synth.spoken[0].onstart();
  assert.equal(h.lastState().status, 'playing', 'playing only after onstart');

  h.synth.spoken[0].onend();
  assert.equal(h.lastState().status, 'awaiting-next');

  h.timers.runNext();
  assert.equal(h.lastState().status, 'idle');
});

test('getState reports structural status, position, session, resume and error fields', () => {
  const h = harness();
  let s = h.narrator.getState();
  assert.equal(s.status, 'idle');
  assert.equal(s.session, 0);
  assert.equal(s.token, null);
  assert.equal(s.resumeIndex, null);

  h.speak(['A.', 'B.'], 5);
  s = h.narrator.getState();
  assert.equal(s.session, 1);
  assert.equal(s.token, 5);
  assert.equal(s.activeSentenceIndex, 0);
  assert.equal(s.nextSentenceIndex, 1);
  assert.equal(s.sentenceCount, 2);
  assert.equal(s.resumeIndex, null);

  h.synth.spoken[0].onstart();
  h.synth.spoken[0].onend();
  h.narrator.pause();
  s = h.narrator.getState();
  assert.equal(s.status, 'paused');
  assert.equal(s.resumeIndex, 1);
  assert.equal(s.activeSentenceIndex, null, 'nothing in flight during the gap');

  h.narrator.resume();
  assert.equal(
    h.narrator.getState().session,
    3,
    'pause and resume each begin a new session (speak=1, pause=2, resume=3)'
  );
  h.synth.spoken[1].onstart();
  h.synth.spoken[1].onend();
  h.timers.runNext();
  s = h.narrator.getState();
  assert.equal(s.status, 'idle');
  assert.equal(s.activeSentenceIndex, null);
  assert.equal(s.token, 5, 'token retained after natural completion for introspection');
});

// ---------------------------------------------------------------------------
// Serialization round-trip (factory is inlined into the offline HTML)
// ---------------------------------------------------------------------------

function vmFactory() {
  const src = createNarrator.toString();
  assert.ok(
    src.startsWith('function createNarrator'),
    'toString must yield standalone function source (no export keyword)'
  );
  const context = vm.createContext({});
  return vm.runInContext(`(${src}\n)`, context, {
    filename: 'narration-controller.serialized.js',
  });
}

test('31: serialized createNarrator runs a full speak/pause/resume/complete cycle in a clean VM', () => {
  const factory = vmFactory();
  const timers = makeTimers();
  const synth = makeSynth();
  const completions = [];
  const narrator = factory({
    synth,
    Utterance: MockUtterance,
    timers,
    log: () => {},
    getVoice: () => null,
    getRate: () => 1.0,
    getPitch: () => 1.0,
  });

  narrator.speak({
    token: 9,
    sentences: ['Hi.', 'Bye.'],
    onComplete: (p) => completions.push(p),
  });
  assert.equal(synth.spoken[0].text, 'Hi.');
  synth.spoken[0].onstart();
  assert.equal(narrator.getState().status, 'playing');

  narrator.pause();
  assert.equal(narrator.getState().status, 'paused');
  narrator.resume();
  assert.equal(synth.spoken[1].text, 'Hi.', 'repeat after pause, in-VM');

  synth.spoken[1].onstart();
  synth.spoken[1].onend();
  timers.runNext();
  assert.equal(synth.spoken[2].text, 'Bye.');
  synth.spoken[2].onstart();
  synth.spoken[2].onend();
  timers.runNext();

  assert.equal(completions.length, 1);
  assert.equal(completions[0].token, 9);
  assert.equal(completions[0].session, narrator.getState().session);
  assert.equal(completions[0].empty, false);
});

test('32: cancellation, error, and no-synth paths also work in the VM context', () => {
  // (a) stop/cancel delegation
  {
    const factory = vmFactory();
    const timers = makeTimers();
    const synth = makeSynth();
    const narrator = factory({
      synth, Utterance: MockUtterance, timers, log: () => {},
      getRate: () => 1.0, getPitch: () => 1.0,
    });
    narrator.speak({ token: 1, sentences: ['A.'], onComplete: () => {} });
    narrator.stop();
    assert.equal(synth.state.cancelCalls, 1, 'cancel works in-VM');
    assert.equal(narrator.getState().status, 'idle');
    assert.equal(timers.pending().length, 0, 'timers cleared in-VM');
  }
  // (b) speech error → visible error state, no completion
  {
    const factory = vmFactory();
    const timers = makeTimers();
    const synth = makeSynth();
    let completed = 0;
    const narrator = factory({
      synth, Utterance: MockUtterance, timers, log: () => {},
      getRate: () => 1.0, getPitch: () => 1.0,
    });
    narrator.speak({ token: 1, sentences: ['A.'], onComplete: () => completed++ });
    synth.spoken[0].onerror({ error: 'synthesis-unavailable' });
    assert.equal(narrator.getState().status, 'error');
    assert.equal(completed, 0, 'error does not complete in-VM');
    assert.ok(narrator.getState().errorMessage.includes('synthesis-unavailable'));
  }
  // (c) no synth → error, no completion, stop safe
  {
    const factory = vmFactory();
    const timers = makeTimers();
    let completed = 0;
    const narrator = factory({
      synth: null, Utterance: MockUtterance, timers, log: () => {},
      getRate: () => 1.0, getPitch: () => 1.0,
    });
    narrator.speak({ token: 1, sentences: ['A.'], onComplete: () => completed++ });
    assert.equal(narrator.getState().status, 'error');
    assert.equal(completed, 0);
    assert.doesNotThrow(() => narrator.stop());
  }
});

// ---------------------------------------------------------------------------
// Phase C: playback-reliability watchdogs, fromIndex, boundary regressions
// ---------------------------------------------------------------------------

test('C1: startup watchdog stops visibly when an utterance never starts', () => {
  const h = harness();
  h.speak(['A.', 'B.'], 0);
  const w = h.narrator.getState().watchdog;
  assert.equal(w.armed, 'startup', 'startup watchdog armed at dispatch');
  assert.equal(w.startupMs, 15000, 'conservative default threshold');
  assert.deepEqual(h.timers.pending(), [15000]);

  h.timers.runNext(); // threshold elapses with no onstart/onend/onerror

  const s = h.narrator.getState();
  assert.equal(s.status, 'error');
  assert.equal(s.errorCode, 'startup-timeout');
  assert.ok(s.errorMessage.includes('no response within 15s'), 'understandable error');
  assert.ok(s.errorMessage.includes('Press Play to restart this slide from the beginning'));
  assert.equal(s.watchdog.armed, null, 'failure path clears watchdogs');
  assert.equal(h.completions.length, 0, 'a timeout never completes (no advancement)');
  assert.equal(h.synth.spoken.length, 1, 'no further sentences dispatched');
  assert.equal(h.synth.state.cancelCalls, 1, 'speech cancelled after invalidation');
  assert.deepEqual(h.timers.pending(), [], 'failure leaves no timers behind');

  h.synth.spoken[0].onstart(); // late event from the dead session
  assert.equal(h.narrator.getState().status, 'error', 'late onstart cannot un-error');
});

test('C2: speaking watchdog scales with sentence length and rate, then stops visibly', () => {
  const longText =
    'This is a deliberately long test sentence used to prove the allowance formula.';
  const at1 = Math.min(120000, Math.round(5000 + (longText.length / (8 * 1.0)) * 1000));
  const at06 = Math.min(120000, Math.round(5000 + (longText.length / (8 * 0.6)) * 1000));

  const fast = harness({ getRate: () => 1.0 });
  fast.speak([longText, 'Next.'], 0);
  fast.synth.spoken[0].onstart();
  let w = fast.narrator.getState().watchdog;
  assert.equal(w.armed, 'speaking');
  assert.equal(w.speakingAllowanceMs, at1, 'length-scaled allowance at rate 1.0');

  const slow = harness({ getRate: () => 0.6 });
  slow.speak([longText, 'Next.'], 0);
  slow.synth.spoken[0].onstart();
  w = slow.narrator.getState().watchdog;
  assert.equal(w.speakingAllowanceMs, at06, 'slow rate gets a longer allowance');
  assert.ok(w.speakingAllowanceMs > at1);

  const short = harness({ getRate: () => 1.0 });
  short.speak(['Hi.', 'Next.'], 0);
  short.synth.spoken[0].onstart();
  assert.ok(
    short.narrator.getState().watchdog.speakingAllowanceMs < at1,
    'short sentence gets a shorter allowance'
  );

  const huge = harness({ getRate: () => 0.6 });
  huge.speak(['x'.repeat(4000), 'Next.'], 0);
  huge.synth.spoken[0].onstart();
  assert.equal(huge.narrator.getState().watchdog.speakingAllowanceMs, 120000, 'capped at maxMs');

  // Timeout behavior: visible stop, no skip, no retry (D2).
  fast.timers.runNext();
  const s = fast.narrator.getState();
  assert.equal(s.status, 'error');
  assert.equal(s.errorCode, 'speaking-timeout');
  assert.ok(s.errorMessage.includes('stalled'), 'understandable error');
  assert.ok(s.errorMessage.includes('at the current speed'));
  assert.ok(
    s.errorMessage.includes('Press Play to restart this slide from the beginning'),
    'recovery wording matches the actual Play behavior (restart the slide)'
  );
  assert.equal(fast.synth.spoken.length, 1, 'the stalled sentence is NOT skipped past');
  assert.equal(fast.completions.length, 0);
  assert.deepEqual(fast.timers.pending(), []);
  assert.equal(fast.synth.state.cancelCalls, 1);
});

test('C3: watchdogs are cleared and re-scoped by every lifecycle transition', () => {
  const h = harness();

  h.speak(['A.', 'B.'], 0);
  assert.equal(h.narrator.getState().watchdog.armed, 'startup', 'dispatch -> startup');

  h.synth.spoken[0].onstart();
  assert.equal(h.narrator.getState().watchdog.armed, 'speaking', 'onstart -> speaking');

  h.narrator.pause();
  assert.equal(h.narrator.getState().watchdog.armed, null, 'pause -> cleared');
  assert.deepEqual(h.timers.pending(), []);
  const sessionAfterPause = h.narrator.getState().session;

  h.narrator.resume();
  let s = h.narrator.getState();
  assert.equal(s.watchdog.armed, 'startup', 'resume -> fresh startup watchdog');
  assert.ok(s.session > sessionAfterPause, 're-scoped to the new session');
  assert.deepEqual(h.timers.pending(), [s.watchdog.startupMs]);

  h.speak(['C.'], 1); // replacement
  assert.equal(h.narrator.getState().watchdog.armed, 'startup', 'replacement -> re-armed');

  h.narrator.stop();
  assert.equal(h.narrator.getState().watchdog.armed, null, 'stop -> cleared');
  assert.deepEqual(h.timers.pending(), []);

  // natural completion -> cleared
  const h2 = harness();
  h2.speak(['Done.'], 0);
  h2.synth.spoken[0].onstart();
  assert.equal(h2.narrator.getState().watchdog.armed, 'speaking');
  h2.synth.spoken[0].onend();
  h2.timers.runNext(); // 220ms gap -> complete
  assert.equal(h2.completions.length, 1);
  assert.equal(h2.narrator.getState().watchdog.armed, null, 'natural completion -> cleared');
  assert.deepEqual(h2.timers.pending(), []);

  // ordinary speech error -> cleared
  const h3 = harness();
  h3.speak(['Bad.'], 0);
  h3.synth.spoken[0].onstart();
  h3.synth.spoken[0].onerror({ error: 'network' });
  assert.equal(h3.narrator.getState().watchdog.armed, null, 'speech error -> cleared');
  assert.deepEqual(h3.timers.pending(), []);

  // empty content -> never armed
  const h4 = harness();
  h4.speak([], 0);
  assert.equal(h4.narrator.getState().watchdog.armed, null, 'empty content -> never armed');
  assert.deepEqual(h4.timers.pending(), [500]);
});

test('C4: stale watchdog callbacks from a replaced session are inert', () => {
  const h = harness();
  h.speak(['A.', 'B.'], 1); // session 1: startup armed
  h.synth.spoken[0].onstart(); // startup cleared, speaking armed
  assert.equal(h.timers.cancelledFns().length, 1, "session 1's startup watchdog cleared on onstart");

  h.speak(['B1.'], 2); // replacement clears session 1's speaking watchdog
  const staleFns = h.timers.cancelledFns();
  assert.equal(staleFns.length, 2, 'session 1 speaking watchdog cleared by replacement');

  const before = h.narrator.getState();
  const pendingBefore = h.timers.pending();
  for (const fn of staleFns) fn(); // fire every cleared watchdog directly

  const st = h.narrator.getState();
  assert.equal(st.status, before.status, 'stale watchdogs cannot change status');
  assert.equal(st.session, before.session, 'stale watchdogs cannot change session');
  assert.equal(st.errorCode, null, 'stale watchdogs cannot raise an error');
  assert.equal(h.completions.length, 0);
  assert.deepEqual(h.timers.pending(), pendingBefore, 'stale watchdogs schedule nothing');

  // the live session still completes normally
  h.synth.spoken[1].onstart();
  h.synth.spoken[1].onend();
  h.timers.runNext();
  assert.equal(h.completions.length, 1);
  assert.equal(h.completions[0].token, 2, 'completion belongs to the replacement run');
});

test('C5: fromIndex > 0 starts narration at that sentence', () => {
  const h = harness();
  h.speak(['A.', 'B.', 'C.'], 0, { fromIndex: 1 });

  assert.equal(h.synth.spoken.length, 1);
  assert.equal(h.synth.spoken[0].text, 'B.', 'starts at fromIndex');
  assert.equal(h.narrator.getState().activeSentenceIndex, 1);
  assert.equal(h.narrator.getState().nextSentenceIndex, 2);
  assert.equal(h.narrator.getState().sentenceCount, 3);

  h.synth.spoken[0].onstart();
  h.synth.spoken[0].onend();
  h.timers.runNext(); // -> C.
  assert.equal(h.synth.spoken[1].text, 'C.');
  h.synth.spoken[1].onstart();
  h.synth.spoken[1].onend();
  h.timers.runNext(); // -> complete
  assert.equal(h.completions.length, 1);
  assert.equal(h.completions[0].empty, false);
  assert.equal(h.narrator.getState().status, 'idle');
});

test('C6: stale utterance events across a pause -> resume boundary cannot disturb the fresh chain', () => {
  const h = harness();
  h.speak(['A.', 'B.'], 5);
  h.synth.spoken[0].onstart();
  h.narrator.pause();
  h.narrator.resume();
  assert.equal(h.synth.spoken.length, 2, 'resume re-speaks the interrupted sentence');
  assert.equal(h.narrator.getState().status, 'starting');

  const pendingNow = h.timers.pending();
  h.synth.spoken[0].onstart(); // pre-pause utterance events
  h.synth.spoken[0].onend();
  assert.deepEqual(h.timers.pending(), pendingNow, 'pre-pause events schedule nothing');
  assert.equal(h.narrator.getState().status, 'starting', 'state untouched by pre-pause events');
  assert.equal(h.completions.length, 0);

  // the fresh chain continues to completion
  h.synth.spoken[1].onstart();
  assert.equal(h.narrator.getState().watchdog.armed, 'speaking', 'fresh watchdog re-scoped');
  h.synth.spoken[1].onend();
  h.timers.runNext();
  assert.equal(h.synth.spoken[2].text, 'B.');
  h.synth.spoken[2].onstart();
  h.synth.spoken[2].onend();
  h.timers.runNext();
  assert.equal(h.completions.length, 1);
  assert.equal(h.completions[0].session, h.narrator.getState().session);
});

test('C7: a throwing onComplete is contained — completion stays exactly-once and idle', () => {
  const h = harness();
  h.speak(['Only.'], 9, {
    onComplete: () => {
      throw new Error('boom-cb');
    },
  });

  assert.doesNotThrow(() => {
    h.synth.spoken[0].onstart();
    h.synth.spoken[0].onend();
    h.timers.runNext(); // 220ms gap -> complete -> handler throws inside
  });

  const s = h.narrator.getState();
  assert.equal(s.status, 'idle', 'controller state settled despite the throw');
  assert.equal(s.watchdog.armed, null);
  assert.deepEqual(h.timers.pending(), []);
  const logged = h.logs.filter((l) => l.msg === 'Error in completion handler: boom-cb');
  assert.equal(logged.length, 1, 'throw is logged once, not swallowed silently');

  h.synth.spoken[0].onend(); // late duplicate after the throwing completion
  assert.deepEqual(h.timers.pending(), []);
  assert.equal(
    h.logs.filter((l) => l.msg === 'Error in completion handler: boom-cb').length,
    1,
    'no second completion attempt'
  );
});