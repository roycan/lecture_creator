// scripts/lib/narration-controller.mjs
//
// Phase B: narration lifecycle controller for the player in template.mjs
// (TTS Reliability workstream). Phase A extracted the legacy chain verbatim;
// Phase B REPAIRS it:
//   - single active session: monotonic session id; every replacement,
//     pause, stop, and failure invalidates the previous session;
//   - cancellation ordering: session + timers are invalidated BEFORE
//     synth.cancel(), so a synchronous cancellation event is already stale;
//   - every async callback (onstart/onend/onerror/timers/completion) guards
//     on session + run ownership before touching ANY state;
//   - speech errors stop visibly (status 'error') and never skip content;
//   - pause/resume remember the sentence position, including the
//     inter-sentence gap ('awaiting-next' resumes at the NEXT sentence);
//   - natural completion notifies exactly once with { token, session, empty }.
//
// Phase C adds playback-reliability watchdogs (thresholds below) and makes
// natural completion callbacks exception-safe:
//   - startup watchdog: dispatch -> onstart must arrive within startupMs;
//     a never-starting utterance stops visibly instead of hanging the chain.
//   - speaking watchdog: onstart -> onend/onerror must arrive within an
//     allowance scaled by sentence length and the playback rate actually set
//     on the utterance; a stalled utterance stops visibly, never skips.
//   - both are session-owned (captured `s` + alive() guard) and cleared on
//     every lifecycle transition: onstart / onend / onerror / pause / resume /
//     stop / replacement / failure / natural completion. Late watchdog
//     callbacks are inert on a replacement session, and neither natural
//     completion nor ordinary speech errors can be mistaken for a timeout.
//   - timeouts route through fail(): invalidate (session + timers + watchdogs)
//     BEFORE synth.cancel(); no automatic retry (D2).
// Threshold rationale: startup 15s (warm Chrome dispatches in well under 1s,
// local voice cold-loads take seconds; ~5-15x headroom, adjustable via
// deps.watchdogs for field tuning); speaking = base 5s + length/(8 chars/s x
// rate), capped at 120s (8 cps at rate 1.0 ≈ 90-100 wpm is slower than the
// ~13-16 cps typical of TTS engines, so the margin is generous and scales
// down for slow rates).
//
// SELF-CONTAINMENT RULE: createNarrator's body must not reference module
// scope, imports, or any globals it does not receive through `deps`.
// template.mjs serializes it with Function.prototype.toString() (through
// safeInlineJs) and inlines it into the generated single-file HTML — no
// browser-side module import. VM round-trip tests in
// scripts/test/narration-controller.test.js enforce this on the happy path
// and on the cancellation/error/no-synth paths.
//
// Injected dependencies:
//   synth         SpeechSynthesis-like object ({ speak, cancel }); falsy when
//                 the browser has no speech support (speak() then fails
//                 visibly instead of completing).
//   Utterance     SpeechSynthesisUtterance-compatible constructor.
//   timers        { setTimeout, clearTimeout } — injectable for tests.
//   log           Console logger (msg, level); legacy message text preserved
//                 where it still describes the event.
//   getVoice / getRate / getPitch
//                 Read current control values at utterance-construction time
//                 (Phase C owns the values/defaults; the pull contract stays).
//                 getVoice returning null leaves utterance.voice untouched.
//   onStateChange Optional state observer (status transitions, error text).
//                 Defaults to a no-op.
//
// Public API (small by design; presentation policy lives in the player):
//   speak({ token, sentences, fromIndex = 0, onComplete })
//     Start (or replace) narration of one slide's sentences.
//   pause()    Cancel safely; remember resume position; status 'paused'.
//   resume()   Continue at resumeIndex (repeats an interrupted sentence;
//              skips a completed one); begins a NEW session.
//   stop()     Invalidate + cancel + clear timers + reset; status 'idle'.
//              Used by the Stop button AND by slide navigation.
//   getState() Introspection snapshot (below).
//
// State model:
//   status: 'idle' | 'starting' | 'playing' | 'awaiting-next' | 'paused' | 'error'
//     starting       — utterance dispatched, onstart not yet observed
//     playing        — onstart observed (speech actually begun)
//     awaiting-next  — sentence finished, inter-sentence gap timer pending
//     paused         — user paused; resumeIndex recorded
//     error          — terminal until the next speak()/stop()
//   session       — monotonic id; bumped by speak/pause/resume/stop/failure
//   run           — { token, sentences, onComplete } of the ACTIVE session
//   activeSentenceIndex   — sentence in flight (null during the gap)
//   nextSentenceIndex     — next sentence to dispatch (chain cursor)
//   resumeIndex   — set only while paused
//   errorCode / errorMessage — set only in 'error'
//
// The controller NEVER advances slides and NEVER owns mode policy: it reports
// natural completion; the player verifies token/session/mode before acting.

function createNarrator(deps) {
  var synth = deps.synth;
  var Utterance = deps.Utterance;
  var timers = deps.timers;
  var log = deps.log || function () {};
  var emit = deps.onStateChange || function () {};
  var getVoice = deps.getVoice;
  var getRate = deps.getRate;
  var getPitch = deps.getPitch;

  // Phase C watchdog thresholds (ms unless noted). Conservative defaults,
  // overridable per instance via deps.watchdogs = { startupMs,
  // speakingBaseMs, charsPerSec, maxMs } so real Windows/Chrome field tests
  // can retune without code changes.
  var wd = {
    startupMs: 15000,
    speakingBaseMs: 5000,
    charsPerSec: 8,
    maxMs: 120000,
  };
  if (deps.watchdogs && typeof deps.watchdogs === 'object') {
    for (var wdKey in deps.watchdogs) {
      if (Object.prototype.hasOwnProperty.call(deps.watchdogs, wdKey) && deps.watchdogs[wdKey] > 0) {
        wd[wdKey] = deps.watchdogs[wdKey];
      }
    }
  }

  var session = 0;
  var status = 'idle';
  var run = null; // { token, sentences, onComplete } — active run only
  var currentToken = null;
  var activeSentenceIndex = null;
  var nextSentenceIndex = null;
  var resumeIndex = null;
  var sentenceCount = 0;
  var errorCode = null;
  var errorMessage = null;
  var pendingTimer = null; // at most ONE pending timer (single active run)
  var startupTimer = null; // Phase C: dispatch -> onstart watchdog
  var speakingTimer = null; // Phase C: onstart -> onend/onerror watchdog
  var speakingAllowanceMs = null; // allowance of the armed speaking watchdog

  function getState() {
    return {
      status: status,
      session: session,
      token: currentToken,
      activeSentenceIndex: activeSentenceIndex,
      nextSentenceIndex: nextSentenceIndex,
      resumeIndex: resumeIndex,
      sentenceCount: sentenceCount,
      errorCode: errorCode,
      errorMessage: errorMessage,
      watchdog: {
        armed: startupTimer !== null ? 'startup' : speakingTimer !== null ? 'speaking' : null,
        startupMs: wd.startupMs,
        speakingAllowanceMs: speakingAllowanceMs,
      },
    };
  }

  function clearTimer() {
    if (pendingTimer !== null && timers && typeof timers.clearTimeout === 'function') {
      timers.clearTimeout(pendingTimer);
    }
    pendingTimer = null;
  }

  // Phase C: watchdog handles are session-owned by the `s` captured when
  // armed plus the alive() guard inside each fire callback; this function is
  // called from every lifecycle transition (invalidate covers speak/pause/
  // resume/stop/fail; onstart/onend/onerror/complete clear explicitly).
  function clearWatchdogs() {
    if (startupTimer !== null && timers && typeof timers.clearTimeout === 'function') {
      timers.clearTimeout(startupTimer);
    }
    if (speakingTimer !== null && timers && typeof timers.clearTimeout === 'function') {
      timers.clearTimeout(speakingTimer);
    }
    startupTimer = null;
    speakingTimer = null;
    speakingAllowanceMs = null;
  }

  function armStartup(s) {
    clearWatchdogs();
    var timer = timers.setTimeout(function () {
      // Identity guard: a stale, already-cleared callback firing late must not
      // clobber the handle of a NEWER timer armed in the meantime.
      if (startupTimer === timer) startupTimer = null;
      if (!alive(s) || status !== 'starting') return; // late/stale — inert
      fail(
        'startup-timeout',
        'Narration could not start speech (no response within ' + wd.startupMs / 1000 +
          's). Nothing was skipped — Press Play to restart this slide from the beginning, or read the slide manually.',
        s
      );
    }, wd.startupMs);
    startupTimer = timer;
  }

  function armSpeaking(s, allowanceMs) {
    clearWatchdogs();
    speakingAllowanceMs = allowanceMs;
    var timer = timers.setTimeout(function () {
      if (speakingTimer === timer) speakingTimer = null;
      if (!alive(s) || status !== 'playing') return; // late/stale — inert
      fail(
        'speaking-timeout',
        'Speech stalled: a sentence did not finish within ' + Math.round(allowanceMs / 1000) +
          's at the current speed. Nothing was skipped — Press Play to restart this slide from the beginning, or read the slide manually.',
        s
      );
    }, allowanceMs);
    speakingTimer = timer;
  }

  // Single scheduling helper: replaces any pending timer (only one chain can
  // own it) and re-checks session ownership when the callback fires.
  function schedule(s, fn, ms) {
    clearTimer();
    pendingTimer = timers.setTimeout(function () {
      if (s !== session) return; // stale (cancelled/replaced) — drop
      pendingTimer = null;
      fn();
    }, ms);
  }

  // Invalidate FIRST (session + timers), THEN cancel browser speech — so any
  // cancellation event, synchronous or asynchronous, is already stale.
  function invalidate() {
    session = session + 1;
    clearTimer();
    clearWatchdogs();
  }

  function safeCancel() {
    if (synth && typeof synth.cancel === 'function') {
      try {
        synth.cancel();
      } catch (e) {
        log('Speech cancel failed: ' + e.message, 'warn');
      }
    }
  }

  // Alive guard for utterance callbacks and chain steps: must belong to the
  // current session AND the run must still exist (completion nulls `run`
  // without bumping the session, so late events after completion hit !run).
  function alive(s) {
    return s === session && run !== null;
  }

  function fail(code, message, s) {
    if (s !== undefined && s !== session) return; // stale failure — ignore
    invalidate();
    safeCancel();
    run = null;
    activeSentenceIndex = null;
    nextSentenceIndex = null;
    resumeIndex = null;
    errorCode = code;
    errorMessage = message;
    status = 'error';
    emit(getState());
    // NOTE: natural completion is NOT invoked — no advancement on failure.
  }

  function complete(s, empty) {
    if (!alive(s)) return;
    clearWatchdogs(); // a natural finish is never a watchdog timeout
    var payload = { token: run.token, session: s, empty: !!empty };
    var cb = run.onComplete;
    run = null;
    activeSentenceIndex = null;
    nextSentenceIndex = null;
    resumeIndex = null;
    errorCode = null;
    errorMessage = null;
    status = 'idle';
    emit(getState());
    if (cb) {
      try {
        cb(payload); // exactly once; session NOT bumped (payload must
      } catch (e) {
        // Phase C: a throwing completion handler must not escape into a timer
        // callback or corrupt controller state — completion already happened.
        log('Error in completion handler: ' + e.message, 'error');
      }
    }
  }

  function dispatch(s, idx) {
    activeSentenceIndex = idx;
    nextSentenceIndex = idx + 1;
    if (status !== 'starting') {
      status = 'starting';
      emit(getState());
    }

    var utterance = new Utterance(run.sentences[idx]);

    if (typeof getVoice === 'function') {
      var voice = getVoice();
      if (voice) utterance.voice = voice;
    }
    if (typeof getRate === 'function') utterance.rate = getRate();
    if (typeof getPitch === 'function') utterance.pitch = getPitch();
    var utteranceRate = typeof utterance.rate === 'number' && utterance.rate > 0 ? utterance.rate : 1;
    var utteranceText = run.sentences[idx];

    utterance.onstart = function () {
      if (!alive(s)) return;
      clearWatchdogs(); // startup watchdog done — speech actually began
      if (status === 'starting') {
        status = 'playing'; // only now is speech actually underway
        emit(getState());
      }
      // Speaking watchdog: generous, length- and rate-scaled allowance.
      armSpeaking(
        s,
        Math.min(
          wd.maxMs,
          Math.round(
            wd.speakingBaseMs + (utteranceText.length / (wd.charsPerSec * utteranceRate)) * 1000
          )
        )
      );
    };
    utterance.onend = function () {
      if (!alive(s)) return;
      clearWatchdogs(); // ordinary end is never a timeout
      activeSentenceIndex = null; // sentence finished; nothing in flight
      status = 'awaiting-next';
      emit(getState());
      schedule(s, function () {
        step(s);
      }, 220); // legacy inter-sentence gap
    };
    utterance.onerror = function (e) {
      if (!alive(s)) return;
      clearWatchdogs(); // ordinary error is never a timeout
      var detail = e && e.error ? e.error : 'unknown';
      log('Speech error: ' + detail, 'warn'); // legacy console line
      fail(
        'speech-error',
        'Speech failed while reading a sentence (' + detail +
          '). Nothing was skipped — Press Play to restart this slide from the beginning, or read the slide manually.',
        s
      );
    };

    armStartup(s); // BEFORE speak(): a synchronous error event must find it
    // armed so fail()'s invalidate clears it (keeps error paths timer-clean).
    synth.speak(utterance);
  }

  function step(s) {
    if (!alive(s)) return;
    try {
      var idx = nextSentenceIndex;
      if (idx >= run.sentences.length) {
        complete(s, false);
        return;
      }
      var sentence = run.sentences[idx];
      if (!sentence || !sentence.trim()) {
        nextSentenceIndex = idx + 1; // blank entry: consume and hop
        schedule(s, function () {
          step(s);
        }, 200);
        return;
      }
      dispatch(s, idx);
    } catch (e) {
      log('Error in speakText: ' + e.message, 'error'); // legacy console line
      fail('internal-error', 'Narration failed: ' + e.message, s);
    }
  }

  function speak(invocation) {
    var sentences = (invocation && invocation.sentences) || [];
    var fromIndex = (invocation && invocation.fromIndex) || 0;
    if (fromIndex < 0) fromIndex = 0;
    var token = invocation ? invocation.token : null;
    var onComplete = (invocation && invocation.onComplete) || null;

    // Replace semantics: cancel browser speech ONLY if an utterance could
    // actually be sounding — a fresh idle speak must not fire a pointless
    // cancel() (cancellation events stay exceptional, not routine).
    var wasActive = status === 'starting' || status === 'playing';
    invalidate(); // replaces any previous session…
    if (wasActive) safeCancel(); // …and its browser speech, in that order

    run = { token: token, sentences: sentences, onComplete: onComplete };
    currentToken = token;
    sentenceCount = sentences.length;
    resumeIndex = null;
    activeSentenceIndex = null;
    nextSentenceIndex = fromIndex;
    errorCode = null; // a fresh attempt clears any previous error
    errorMessage = null;

    var s = session;

    // Content check (equivalent to the legacy pre-split blank-text check for
    // any sentences produced by splitIntoSentences()).
    var hasContent = false;
    for (var i = 0; i < sentences.length; i++) {
      if (sentences[i] && sentences[i].trim()) {
        hasContent = true;
        break;
      }
    }
    if (!hasContent || fromIndex >= sentences.length) {
      if (!hasContent) log('Empty text, skipping speech');
      status = 'idle'; // nothing is narrating — do not claim otherwise
      schedule(s, function () {
        complete(s, true);
      }, 500); // legacy pacing; completion flagged empty:true
      return;
    }

    if (!synth) {
      log('Speech synthesis not available', 'warn'); // legacy console line
      fail(
        'synthesis-unsupported',
        'Speech synthesis is not available in this browser. Read the slide manually.',
        s
      );
      return;
    }

    status = 'starting';
    emit(getState());
    step(s);
  }

  function pause() {
    if (status !== 'starting' && status !== 'playing' && status !== 'awaiting-next') {
      return; // idle/paused/error: nothing to pause
    }
    // Position rule (spec §4): mid-utterance ('starting'/'playing') repeats
    // the interrupted sentence; the inter-sentence gap continues at the next.
    resumeIndex =
      status === 'awaiting-next'
        ? nextSentenceIndex
        : activeSentenceIndex !== null
          ? activeSentenceIndex
          : 0;
    invalidate(); // session + gap timer die BEFORE cancel can emit anything
    safeCancel();
    status = 'paused';
    emit(getState());
    // `run` is retained for resume().
  }

  function resume() {
    if (status !== 'paused' || run === null) return;
    var idx = resumeIndex !== null ? resumeIndex : 0;
    invalidate(); // resume begins a NEW session
    resumeIndex = null;
    activeSentenceIndex = null;
    nextSentenceIndex = idx;
    status = 'starting';
    emit(getState());
    step(session);
  }

  function stop() {
    invalidate();
    safeCancel();
    run = null;
    currentToken = null;
    activeSentenceIndex = null;
    nextSentenceIndex = null;
    resumeIndex = null;
    sentenceCount = 0;
    errorCode = null;
    errorMessage = null;
    status = 'idle';
    emit(getState());
  }

  return {
    speak: speak,
    pause: pause,
    resume: resume,
    stop: stop,
    getState: getState,
  };
}

export { createNarrator };
export default createNarrator;