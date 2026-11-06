// scripts/test/template.test.js
//
// Unit tests for renderPresentation (Phase 2a) — the createSingleHTML() port.
//
// Phase B appends a player harness: it boots the RENDERED player script in a
// vm realm with fake DOM / timers / speech and exercises the narration
// lifecycle end-to-end at the presentation layer. Observations are
// behavior-only (what was spoken, when, in response to which user action).
// Controller unit tests live in narration-controller.test.js.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { renderPresentation } from '../lib/template.mjs';
import { createNarrator } from '../lib/narration-controller.mjs';
import { safeInlineJs } from '../lib/bundle-libs.mjs';

const SAMPLE = [
  { html: '<h1 id="title-slide">Title Slide</h1><p>hello world</p>' },
  { html: '<h2 id="section">Section</h2><p>content here</p>' },
];

function extractSlidesData(html) {
  const m = html.match(/ id="slides-data"[^>]*>([\s\S]*?)<\/script>/);
  assert.ok(m, '#slides-data script block should be present');
  return m[1];
}

test('returns a complete HTML document', () => {
  const html = renderPresentation(SAMPLE, { title: 'My Lecture' });
  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /<\/html>/);
});

test('injects the title into <title> (custom and default)', () => {
  assert.match(
    renderPresentation(SAMPLE, { title: 'My Lecture' }),
    /<title>My Lecture<\/title>/
  );
  assert.match(
    renderPresentation(SAMPLE),
    /<title>Lecture Presentation<\/title>/
  );
});

test('embeds slides as JSON in #slides-data and round-trips', () => {
  const html = renderPresentation(SAMPLE);
  const parsed = JSON.parse(extractSlidesData(html));
  assert.deepEqual(parsed, SAMPLE);
});

test('a </script> inside slide html is escaped and cannot break the data block', () => {
  const withCloseTag = [{ html: '<p>code example</p><pre>alert()</pre> ends </script> here' }];
  const html = renderPresentation(withCloseTag);
  const block = extractSlidesData(html);
  // The raw closing tag must be escaped (backslash form), not present literally.
  assert.ok(block.includes('<\\/script>'), 'closing tag should be escaped');
  assert.ok(!block.includes('ends </script> here'), 'no raw unescaped closing tag');
  // And it must still round-trip back to the original via JSON.parse.
  assert.deepEqual(JSON.parse(block), withCloseTag);
});

test('carries the runtime player + CDN libs (bundling deferred to Phase 2c)', () => {
  const html = renderPresentation(SAMPLE);
  assert.match(html, /\[Lecture Player\]/);
  assert.match(html, /highlight\.js/);
  assert.match(html, /mermaid/);
});

test('handles empty slide list without throwing', () => {
  const html = renderPresentation([], { title: 'Empty' });
  assert.match(html, /^<!doctype html>/i);
  // No slides -> empty JSON array embedded.
  assert.match(html, / id="slides-data"[^>]*>\[\]<\/script>/);
});

test('embeds the narration controller source inline without the module import', () => {
  const html = renderPresentation(SAMPLE);
  // The Node-side import must NOT be serialized into the document; instead the
  // factory's function source is inlined so file:// stays self-contained.
  assert.ok(
    !html.includes('import { createNarrator'),
    'Node-side import must not leak into the output HTML'
  );
  assert.match(
    html,
    /var createNarrator = function createNarrator\s*\(/,
    'serialized controller source should be inlined at the top of the player'
  );
});

test('controller embedding goes through safeInlineJs (inline-script safety)', () => {
  const html = renderPresentation(SAMPLE);
  assert.ok(
    html.includes(safeInlineJs(createNarrator.toString())),
    'embedded source must be the safeInlineJs()-escaped serialization'
  );
  assert.ok(
    safeInlineJs('a </script> b').includes('<\\/script>'),
    'helper must escape a closing script tag'
  );
  // Documented gap: the end-to-end escaping path only becomes observable when
  // the controller source itself ever contains a closing script tag.
});

// ---------------------------------------------------------------------------
// Player harness — boots the rendered player in a vm realm.
// ---------------------------------------------------------------------------

const READY_VOICES = [{ name: 'Test Voice', lang: 'en-PH' }];
const THREE_SLIDES = [
  { html: '<p>One.</p>' },
  { html: '<p>Two.</p>' },
  { html: '<p>Three.</p>' },
];

function makeSynth(voices) {
  const synth = {
    spoken: [],
    cancelCalls: 0,
    voice: null,
    rate: 1,
    pitch: 1,
    onvoiceschanged: null,
    getVoices() { return (synth._voices === undefined ? voices : synth._voices).slice(); }, // _voices = late-arrival simulation
    speak(u) { synth.spoken.push(u); },
    cancel() { synth.cancelCalls += 1; },
  };
  return synth;
}

class MockUtterance {
  constructor(text) {
    this.text = String(text == null ? '' : text);
    this.rate = 1;
    this.pitch = 1;
    this.voice = null;
    this.onstart = null;
    this.onend = null;
    this.onerror = null;
  }
}

function makeElement(tag, selector) {
  const listeners = {};
  const classes = new Set();
  const attrs = new Map();
  const el = {
    __tag: tag,
    __selector: selector || '',
    tagName: String(tag || 'div').toUpperCase(), // keyboard handler reads activeElement.tagName
    style: {},
    dataset: {},
    disabled: false,
    value: '',
    selectedIndex: -1,
    href: '',
    sheet: { disabled: false },
    children: [],
    options: [],
    _html: '',
    _text: '',
    addEventListener(type, fn) {
      (listeners[type] || (listeners[type] = [])).push(fn);
    },
    removeEventListener() {},
    setAttribute(name, v) { attrs.set(name, String(v)); },
    getAttribute(name) { return attrs.has(name) ? attrs.get(name) : null; },
    removeAttribute(name) { attrs.delete(name); },
    hasAttribute(name) { return attrs.has(name); },
    toggleAttribute(name) { if (attrs.has(name)) attrs.delete(name); else attrs.set(name, ''); },
    dispatch(type, ev) {
      const e = ev || { target: el, preventDefault() {} };
      for (const fn of (listeners[type] || []).slice()) fn(e);
    },
    appendChild(c) { el.children.push(c); if (c && c.tagName === 'OPTION') el.options.push(c); return c; },
    insertAdjacentHTML() {},
    getContext() { return null; },
    focus() {},
    querySelector(sel) { return makeElement('div', sel); },
    querySelectorAll() { return []; },
    classList: {
      add(c) { classes.add(c); },
      remove(c) { classes.delete(c); },
      contains(c) { return classes.has(c); },
      toggle(c) { if (classes.has(c)) classes.delete(c); else classes.add(c); },
    },
    get innerHTML() { return el._html; },
    set innerHTML(v) {
      el._html = String(v);
      // crude text derivation so slide extraction via textContent works
      el._text = el._html.replace(/<[^>]*>/g, ' ');
      // <select> semantics: clearing innerHTML removes the option list.
      // Guarded on options.length so ordinary elements are unaffected.
      if (el.options.length) {
        el.children.length = 0;
        el.options.length = 0;
        el.selectedIndex = -1;
      }
    },
    get textContent() { return el._text; },
    set textContent(v) { el._text = String(v); el._html = String(v); },
  };
  return el;
}

function makeDocument() {
  const doc = {};
  const byId = new Map();
  const autoRadio = makeElement('input', '#auto-radio');
  autoRadio.value = 'auto';
  const manualRadio = makeElement('input', '#manual-radio');
  manualRadio.value = 'manual';
  byId.set('auto-radio', autoRadio);
  byId.set('manual-radio', manualRadio);

  doc.getElementById = (id) => {
    if (!byId.has(id)) {
      const el = makeElement('div', '#' + id);
      if (id === 'start-button') el.disabled = true; // mirrors markup `disabled`
      if (id === 'status-message') el.textContent = 'Loading voices...'; // markup initial text
      // Mirror markup-initial control state (Phase B harness lesson): the
      // player reads .value/.textContent from these at boot.
      if (id === 'rate' || id === 'speed-slider') el.value = '1';
      if (id === 'rate-value' || id === 'speed-value') el.textContent = '1.00x';
      if (id === 'pitch') el.value = '1.0';
      if (id === 'pitch-value') el.textContent = '1.0';
      if (id === 'voice-select') {
        // Minimal <select> semantics so voice-selection tests exercise the real
        // value/selectedIndex interplay the browser provides (value derives
        // from the selected option; selectedIndex drives everything).
        Object.defineProperty(el, 'value', {
          configurable: true,
          get() {
            const o = el.options[el.selectedIndex];
            return o === undefined ? '' : String(o.value);
          },
          set(v) {
            const i = el.options.findIndex((o) => String(o.value) === String(v));
            if (i >= 0) el.selectedIndex = i;
          },
        });
        Object.defineProperty(el, 'selectedOptions', {
          configurable: true,
          get() {
            return el.selectedIndex >= 0 && el.options[el.selectedIndex]
              ? [el.options[el.selectedIndex]]
              : [];
          },
        });
      }
      byId.set(id, el);
    }
    return byId.get(id);
  };
  doc.querySelectorAll = (sel) =>
    sel === 'input[name="playback-mode"]' ? [autoRadio, manualRadio] : [];
  doc.querySelector = (sel) => makeElement('div', sel);
  doc.createElement = (tag) => makeElement(tag);
  doc.__keydown = []; // Phase C: keyboard tests dispatch through this
  doc.addEventListener = (type, fn) => {
    if (type === 'keydown') doc.__keydown.push(fn);
  };
  doc.removeEventListener = () => {};
  doc.documentElement = makeElement('html');
  doc.head = makeElement('head');
  doc.body = makeElement('body');
  doc.activeElement = doc.body; // keyboard handler reads .tagName off this
  doc.__els = byId;
  doc.__radios = { auto: autoRadio, manual: manualRadio };
  return doc;
}

function makeTimers() {
  let now = 0;
  let seq = 1;
  let queue = [];
  const cancelled = []; // corrective patch: retain cancelled callbacks so tests can
  // fire them manually (queue behavior below is completely unchanged)
  return {
    setTimeout(fn, ms) {
      const id = seq++;
      queue.push({ id, fn, ms: Number(ms) || 0 });
      return id;
    },
    clearTimeout(id) {
      const gone = queue.find((t) => t.id === id);
      if (gone) cancelled.push(gone.fn); // retained for manual stale-fire tests
      queue = queue.filter((t) => t.id !== id);
    },
    size() { return queue.length; },
    runNext() {
      if (!queue.length) return false;
      const t = queue.shift();
      now += t.ms;
      t.fn();
      return true;
    },
    now() { return now; },
    pendingMs() { return queue.map((t) => t.ms); }, // Phase D: observe dwell delays
    cancelledCount() { return cancelled.length; },
    fireCancelled() {
      const fns = cancelled.splice(0, cancelled.length);
      for (const fn of fns) fn();
      return fns.length;
    },
  };
}

function bootPlayer({ slides = THREE_SLIDES, voices = READY_VOICES, speech = true, receiverCheck = false } = {}) {
  const html = renderPresentation(slides, { title: 'Narration Lifecycle' });
  const blocks = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const playerSrc = blocks.find((b) => b.includes('var createNarrator = '));
  assert.ok(playerSrc, 'rendered player script block should exist');

  const timers = makeTimers();
  const logs = [];
  const doc = makeDocument();
  doc.getElementById('slides-data').textContent = extractSlidesData(html);

  const synth = speech ? makeSynth(voices) : null;
  const windowObj = {
    speechSynthesis: synth,
    SpeechSynthesisUtterance: MockUtterance,
    addEventListener() {},
    removeEventListener() {},
    location: { href: 'file:///lecture.html', search: '' },
    matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
  };
  windowObj.window = windowObj;

  const store = new Map();
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };

  const fakeConsole = {
    log: (...a) => logs.push(a.join(' ')),
    warn: (...a) => logs.push(a.join(' ')),
    error: (...a) => logs.push(a.join(' ')),
  };

  const rawSetTimeout = timers.setTimeout;
  const rawClearTimeout = timers.clearTimeout;
  // WebIDL receiver discipline, as real Chrome enforces it: setTimeout /
  // clearTimeout accept the window (bind(window)) or a bare call (the sloppy
  // native coerces an undefined `this` to the global) — but ANY other explicit
  // receiver, e.g. the plain { setTimeout, clearTimeout } wrapper object the
  // page used to hand the controller, must throw "Illegal invocation".
  const legalTimerReceiver = (self) => self === undefined || self === windowObj;
  const checkedSetTimeout = function (fn, ms) {
    if (!legalTimerReceiver(this)) throw new TypeError('Illegal invocation: setTimeout');
    return rawSetTimeout(fn, ms);
  };
  const checkedClearTimeout = function (id) {
    if (!legalTimerReceiver(this)) throw new TypeError('Illegal invocation: clearTimeout');
    return rawClearTimeout(id);
  };

  const context = vm.createContext({
    window: windowObj,
    document: doc,
    localStorage,
    console: fakeConsole,
    setTimeout: receiverCheck ? checkedSetTimeout : rawSetTimeout,
    clearTimeout: receiverCheck ? checkedClearTimeout : rawClearTimeout,
    Date: { now: () => timers.now() }, // virtual clock for the 3s voice timeout
  });
  vm.runInContext(playerSrc, context, { filename: 'player-inline.js' });

  const harness = {
    html,
    timers,
    logs,
    doc,
    synth,
    window: windowObj,
    el: (id) => doc.getElementById(id),
    click(id) { doc.getElementById(id).dispatch('click'); },
    changeMode(mode) {
      const radio = mode === 'manual' ? doc.__radios.manual : doc.__radios.auto;
      radio.dispatch('change', { target: radio, preventDefault() {} });
    },
    pressKey(key) {
      const ev = { key, preventDefault() { ev.defaultPrevented = true; } };
      for (const fn of doc.__keydown) fn(ev);
      return ev;
    },
    statusText() { return doc.getElementById('narration-status').textContent; },
    statusIsError() { return doc.getElementById('narration-status').classList.contains('error'); },
    progressText() { return doc.getElementById('progress-indicator').textContent; },
    containerHTML() { return doc.getElementById('slide-container').innerHTML; },
    runAllTimers(max = 40) {
      for (let i = 0; i < max && timers.size() > 0; i++) timers.runNext();
    },
    // Follow the narration chain. Order matters for Phase C: fire any
    // not-yet-fired utterance event BEFORE running queued timers, so the
    // startup watchdog (a fixed 15s queue entry) never jumps ahead of the
    // utterance events the driver is responsible for delivering.
    driveCycle(maxSteps = 60) {
      const before = synth ? synth.spoken.length : 0;
      const list = synth ? synth.spoken : [];
      for (let i = 0; i < maxSteps; i++) {
        if (synth && synth.spoken.length > before) return synth.spoken.length - before;
        const u = list.find((x) => !x.__settled);
        if (u) {
          u.__settled = true;
          if (u.onstart) u.onstart();
          if (u.onend) u.onend();
          continue;
        }
        if (timers.size() > 0) { timers.runNext(); continue; }
        break; // chain idle
      }
      return (synth ? synth.spoken.length : 0) - before;
    },
  };
  return harness;
}

// ---------------------------------------------------------------------------
// Phase B player lifecycle tests
// ---------------------------------------------------------------------------

test('markup: Play/Stop/Replay controls and a visible narration status element exist', () => {
  const html = renderPresentation(SAMPLE);
  assert.match(html, /id="play-button"[^>]*>▶ Play</);
  assert.match(html, /id="pause-button"/);
  assert.match(html, /id="stop-button"[^>]*>⏹ Stop</);
  assert.match(html, /id="replay-button"[^>]*>↻ Replay</);
  assert.match(html, /<div id="narration-status" role="status" aria-live="polite">/);
});

test('auto mode: narrates the slide, then advances exactly once per completion', () => {
  const h = bootPlayer();
  h.click('start-button');
  assert.equal(h.progressText(), 'Slide 1 of 3');
  assert.equal(h.synth.spoken.length, 1);
  assert.equal(h.synth.spoken[0].text.trim(), 'One.');

  h.driveCycle(); // finish slide 1 -> advance once + narrate slide 2
  assert.equal(h.progressText(), 'Slide 2 of 3');
  assert.equal(h.synth.spoken.length, 2);
  assert.equal(h.synth.spoken[1].text.trim(), 'Two.');

  h.driveCycle();
  assert.equal(h.progressText(), 'Slide 3 of 3');

  h.driveCycle(); // last slide completes -> no further advancement
  assert.equal(h.progressText(), 'Slide 3 of 3');
  assert.match(h.statusText(), /End of presentation/);
});

test('manual mode narrates the current slide and does not advance (D1)', () => {
  const h = bootPlayer();
  h.changeMode('manual');
  assert.ok(
    !h.el('voice-controls-container').classList.contains('hidden'),
    'voice controls stay available in manual mode (voices are needed to speak)'
  );
  h.click('start-button');
  assert.equal(h.synth.spoken.length, 1, 'manual mode speaks');
  assert.equal(h.synth.spoken[0].text.trim(), 'One.');
  h.driveCycle();
  assert.equal(h.progressText(), 'Slide 1 of 3', 'no auto-advance after completion');
  assert.equal(h.synth.spoken.length, 1, 'no further narration is chained');
});

test('manual slide navigation cancels narration; stale events are inert; future narration still works', () => {
  const h = bootPlayer();
  h.click('start-button');
  const stale = h.synth.spoken[0];
  h.click('next-button');
  assert.ok(h.synth.cancelCalls >= 1, 'navigation cancels active speech');
  assert.equal(h.progressText(), 'Slide 2 of 3');
  assert.ok(h.containerHTML().includes('Two'));

  stale.onend(); // browser delivering a cancellation-related event late
  assert.equal(h.timers.size(), 0, 'stale onend schedules nothing');
  h.driveCycle(); // settle anything stale
  assert.equal(h.progressText(), 'Slide 2 of 3', 'stale events must not advance');
  assert.equal(h.synth.spoken.length, 1, 'stale chain must not keep speaking');

  h.click('play-button'); // future narration is NOT disabled
  assert.equal(h.synth.spoken.length, 2);
  assert.equal(h.synth.spoken[1].text.trim(), 'Two.');
  h.driveCycle();
  assert.equal(h.progressText(), 'Slide 3 of 3', 'playback mode was untouched by navigation');
});

test('speech error stops visibly, never skips or advances; Play retries', () => {
  const h = bootPlayer();
  h.click('start-button');
  h.synth.spoken[0].onerror({ error: 'network' });
  assert.ok(h.statusText().includes('network'), 'error is visible in the status area');
  assert.ok(h.statusIsError(), 'status area uses the error style');
  assert.equal(h.progressText(), 'Slide 1 of 3', 'no advancement on error');
  h.driveCycle();
  assert.equal(h.synth.spoken.length, 1, 'failed sentence is not skipped past');

  h.click('play-button'); // explicit retry only (no automatic retry, D2)
  assert.equal(h.synth.spoken.length, 2, 'Play retries the current slide');
  assert.ok(!h.statusIsError(), 'error latch clears when a new attempt starts');
});

test('no usable voice list: discovery times out and explains the manual-reading fallback', () => {
  const h = bootPlayer({ voices: [] });
  h.runAllTimers(); // drive the 3s discovery timeout
  assert.ok(
    h.statusText().toLowerCase().includes('read the slide manually'),
    'visible manual-reading fallback explanation'
  );
  assert.ok(!h.el('start-button').disabled, 'the deck still opens');
  assert.ok(h.el('status-message').textContent.includes('system default'));
});

test('voice discovery still pending: start stays disabled and the status area stays quiet', () => {
  const h = bootPlayer({ voices: [] });
  assert.equal(h.el('start-button').disabled, true, 'start stays disabled until discovery settles');
  assert.ok(
    h.el('status-message').textContent.includes('Choose playback mode'),
    'status shows the boot message, not a premature voice verdict'
  );
  assert.equal(h.statusText(), '', 'no narration-status noise before narration exists');
});

test('missing speech support: visible fallback; start never claims narration is running', () => {
  const h = bootPlayer({ speech: false });
  assert.ok(h.statusText().toLowerCase().includes('not supported'));
  assert.ok(h.statusText().toLowerCase().includes('manually'));
  h.click('start-button');
  assert.equal(h.progressText(), 'Slide 1 of 3', 'deck opens for manual reading');
  h.driveCycle();
  assert.equal(h.progressText(), 'Slide 1 of 3', 'no silent advancement without speech');
  assert.ok(h.statusText().toLowerCase().includes('manually'), 'fallback stays visible');
});

test('Stop is visible and returns to idle; Play afterward narrates the current slide again', () => {
  const h = bootPlayer();
  h.click('start-button');
  h.click('stop-button');
  assert.ok(h.statusText().includes('Narration stopped'));
  assert.equal(h.timers.size(), 0);
  h.click('play-button');
  assert.equal(h.synth.spoken.length, 2, 'narrates the current slide from sentence zero');
  assert.equal(h.synth.spoken[1].text.trim(), 'One.');
});

test('pause/resume controls: label and status follow the controller state', () => {
  const h = bootPlayer();
  h.click('start-button');
  h.synth.spoken[0].onstart();
  h.click('pause-button');
  assert.equal(h.el('pause-button').textContent, '▶ Resume');
  assert.ok(h.statusText().includes('paused'), 'paused status is visible');
  h.click('pause-button'); // now resumes
  assert.equal(h.synth.spoken.length, 2, 'resume continues narrating the slide');
  assert.equal(h.el('pause-button').textContent, '⏸ Pause');
});

test('Phase C: default playback speed is exactly 1.0 in markup and labels', () => {
  const html = renderPresentation(SAMPLE);
  assert.match(html, /id="rate" type="range" min="0\.6" max="1\.3" step="0\.05" value="1"/);
  assert.match(html, /id="rate-value">1\.00x</);
  assert.match(html, /id="speed-slider" type="range" min="0\.6" max="1\.3" step="0\.05" value="1"/);
  assert.match(html, /id="speed-value">1\.00x</);
  assert.ok(!html.includes('0.95x'), 'no 0.95 default label remains');
  assert.ok(!/speed-slider[^>]*value="0\.95"/.test(html), 'slider default is not 0.95');
});

test('Phase C: Replay pressed while narration is active replaces the chain (rendered player)', () => {
  const h = bootPlayer();
  h.click('start-button');
  assert.equal(h.synth.spoken.length, 1);
  const statusBefore = h.progressText();

  h.click('replay-button'); // while the first utterance is still in flight

  assert.equal(h.synth.cancelCalls, 1, 'active narration was cancelled on replacement');
  assert.equal(h.synth.spoken.length, 2, 'replay dispatched a fresh utterance');
  assert.equal(h.synth.spoken[1].text.trim(), 'One.', 'restarts from sentence zero');
  assert.equal(h.progressText(), statusBefore, 'same slide');

  const timersBefore = h.timers.size();
  h.synth.spoken[0].onend(); // stale event from the replaced utterance
  assert.equal(h.timers.size(), timersBefore, 'stale onend schedules nothing');

  h.driveCycle(); // the replayed chain completes
  assert.equal(h.progressText(), 'Slide 2 of 3', 'exactly one advance from the replayed chain');
});

test('Phase C: keyboard shortcuts — mode-dependent space, speed steps with effect-timing toast', () => {
  const h = bootPlayer();
  h.click('start-button');

  // speed up in auto mode while narrating
  h.pressKey('.');
  assert.equal(h.el('speed-slider').value, '1.05', '0.05 grid step from the 1.00 default');
  assert.equal(h.el('speed-value').textContent, '1.05x', 'display synced to the rate source');
  assert.equal(
    h.el('speed-toast').textContent,
    'Speed: 1.05x — applies from the next sentence',
    'toast states WHEN the change takes effect'
  );

  h.pressKey('.');
  assert.equal(h.el('speed-value').textContent, '1.10x');
  h.pressKey(',');
  assert.equal(h.el('speed-value').textContent, '1.05x', 'comma steps back');

  // space toggles pause/resume in auto mode
  h.pressKey(' ');
  assert.equal(h.el('pause-button').textContent, '▶ Resume', 'space paused in auto mode');
  assert.ok(h.statusText().includes('paused'));
  h.pressKey(' ');
  assert.equal(h.synth.spoken.length, 2, 'space resumed narration');

  // arrows navigate
  h.pressKey('ArrowRight');
  assert.equal(h.progressText(), 'Slide 2 of 3');

  // manual mode: space advances, speed keys are ignored
  const m = bootPlayer();
  m.changeMode('manual');
  m.click('start-button');
  assert.equal(m.el('speed-value').textContent, '1.00x', 'overlay rate imported at start (manual too)');
  m.pressKey('.');
  assert.equal(m.el('speed-value').textContent, '1.00x', 'speed keys inert in manual mode');
  m.pressKey(' ');
  assert.equal(m.progressText(), 'Slide 2 of 3', 'space advances slides in manual mode');
});

test('Phase C: voiceschanged moves voice discovery from pending to ready', () => {
  const h = bootPlayer({ voices: [] });
  assert.equal(h.el('start-button').disabled, true, 'pending: start gated');
  assert.equal(h.statusText(), '', 'pending: status area quiet');

  // late voice arrival (Chromium pattern)
  h.synth._voices = [{ name: 'Late Voice', lang: 'en-PH' }];
  h.synth.onvoiceschanged();
  h.runAllTimers(); // the 200ms discovery poll observes the arrival

  assert.equal(h.el('start-button').disabled, false, 'ready: start enabled');
  assert.ok(
    h.el('status-message').textContent.includes('Ready! 1 voices available'),
    'ready: visible status'
  );
  assert.equal(h.el('start-button').textContent, 'Start Presentation');
  assert.ok(h.el('voice-select').children.length >= 1, 'voice dropdown populated');
  assert.equal(h.statusText(), '', 'no fallback warning once ready');
});

// ---------------------------------------------------------------------------
// Phase D player tests: build-time sentences, empty-slide dwell, wording
// ---------------------------------------------------------------------------

const DECK_WITH_SENTENCES = [
  {
    html: '<pre><code>CODE_NOT_SPOKEN</code></pre><p>Html visible text.</p>',
    sentences: ['Build sentence alpha.', 'Build sentence beta.'],
  },
  { html: '<p>Two.</p>', sentences: ['Next slide spoken.'] },
];

const EMPTY_DECK = [
  { html: '<div class="empty-slide"></div>', sentences: [] },
  { html: '<p>Second slide.</p>', sentences: ['Second slide speaks now.'] },
];

const LEGACY_DECK = [
  { html: '<p>Fallback prose here.</p>' }, // no sentences field: older decks
  { html: '<p>Second legacy.</p>' },
];

test('Phase D: narration speaks slide.sentences, never the html textContent', () => {
  const h = bootPlayer({ slides: DECK_WITH_SENTENCES });
  h.click('start-button');
  h.driveCycle(); // finish slide 1 sentences, advance
  h.driveCycle(); // slide 2 utterance arrives

  const spoken = h.synth.spoken.map((u) => u.text.trim());
  assert.deepEqual(spoken, ['Build sentence alpha.', 'Build sentence beta.', 'Next slide spoken.']);
  assert.ok(!spoken.join(' ').includes('CODE_NOT_SPOKEN'), 'code html is never spoken');
  assert.ok(!spoken.join(' ').includes('Html visible text'), 'raw html textContent is never spoken');
  assert.equal(h.progressText(), 'Slide 2 of 2', 'auto mode still advanced exactly once');
});

test('Phase D: legacy fallback still extracts narration from html when sentences is absent', () => {
  const h = bootPlayer({ slides: LEGACY_DECK });
  assert.ok(!('sentences' in LEGACY_DECK[0]), 'fixture really lacks the field');
  h.click('start-button');
  assert.equal(h.synth.spoken[0].text.trim(), 'Fallback prose here.');
  h.driveCycle();
  assert.equal(h.progressText(), 'Slide 2 of 2', 'legacy slides still advance');
});

test('Phase D: empty slide in manual mode shows the message and stays (no error, no dwell)', () => {
  const h = bootPlayer({ slides: EMPTY_DECK });
  h.changeMode('manual');
  h.click('start-button');
  assert.deepEqual(h.timers.pendingMs(), [500], 'controller empty pacing');
  h.timers.runNext(); // empty completion

  assert.match(h.statusText(), /No narration text on this slide — review the content manually\./);
  assert.ok(!h.statusIsError(), 'an empty slide is never a speech failure');
  assert.equal(h.progressText(), 'Slide 1 of 2', 'remains on the slide');
  assert.deepEqual(h.timers.pendingMs(), [], 'manual mode schedules no dwell');
  h.runAllTimers();
  assert.equal(h.progressText(), 'Slide 1 of 2', 'still no advance over time');
});

test('Phase D: empty slide in auto mode shows the message, dwells ~1.8s, then advances once', () => {
  const h = bootPlayer({ slides: EMPTY_DECK });
  h.click('start-button');
  assert.deepEqual(h.timers.pendingMs(), [500]);
  h.timers.runNext(); // empty completion

  assert.match(h.statusText(), /No narration text on this slide/);
  assert.ok(!h.statusIsError());
  assert.deepEqual(h.timers.pendingMs(), [1800], 'single dwell timer at the provisional delay');
  assert.equal(h.progressText(), 'Slide 1 of 2');

  h.timers.runNext(); // dwell elapses
  assert.equal(h.progressText(), 'Slide 2 of 2', 'advanced exactly once');
  assert.equal(h.synth.spoken.length, 1, 'next slide narrated once');
  assert.deepEqual(h.timers.pendingMs(), [15000], 'startup watchdog armed for the new utterance');
  h.driveCycle();
  assert.equal(h.synth.spoken[0].text.trim(), 'Second slide speaks now.');
  assert.match(h.statusText(), /End of presentation\./, 'deck ends cleanly after narration');
  assert.deepEqual(h.timers.pendingMs(), [], 'everything settles with no timers behind');
});

test('Phase D: pause clears the empty dwell; resume restarts the FULL dwell period', () => {
  const h = bootPlayer({ slides: EMPTY_DECK });
  h.click('start-button');
  h.timers.runNext(); // empty completion -> dwell
  assert.deepEqual(h.timers.pendingMs(), [1800]);

  h.click('pause-button'); // controller idle -> dwell pause branch
  assert.deepEqual(h.timers.pendingMs(), [], 'pause clears the dwell timer');
  assert.equal(h.el('pause-button').textContent, '▶ Resume');
  assert.match(h.statusText(), /Narration paused/);
  h.timers.runNext(); // nothing can fire
  h.runAllTimers();
  assert.equal(h.progressText(), 'Slide 1 of 2', 'a paused presentation never advances');

  h.click('pause-button'); // resume
  assert.deepEqual(h.timers.pendingMs(), [1800], 'resume restarts a full dwell');
  assert.match(h.statusText(), /No narration text on this slide/);
  assert.equal(h.el('pause-button').textContent, '⏸ Pause');
  h.timers.runNext();
  assert.equal(h.progressText(), 'Slide 2 of 2', 'dwell completes after resume');
});

test('Phase D: navigation during the dwell clears it — no double advancement', () => {
  const h = bootPlayer({ slides: EMPTY_DECK });
  h.click('start-button');
  h.timers.runNext(); // empty completion -> dwell
  assert.deepEqual(h.timers.pendingMs(), [1800]);

  h.pressKey('ArrowRight');
  assert.deepEqual(h.timers.pendingMs(), [], 'navigation clears the dwell');
  assert.equal(h.progressText(), 'Slide 2 of 2', 'one manual advance');
  h.runAllTimers();
  assert.equal(h.progressText(), 'Slide 2 of 2', 'the cleared dwell can never fire');
  assert.equal(h.synth.spoken.length, 0, 'navigation does not narrate (existing behavior)');
});

test('Phase D: a stale completion cannot start a dwell', () => {
  const h = bootPlayer({ slides: EMPTY_DECK });
  h.click('start-button');
  assert.deepEqual(h.timers.pendingMs(), [500], 'empty delay pending');

  h.pressKey('ArrowRight'); // stop() invalidates the session and clears the delay
  assert.deepEqual(h.timers.pendingMs(), [], 'controller delay cleared by navigation');
  h.runAllTimers();
  assert.ok(!h.statusText().includes('No narration text'), 'stale completion never landed');
  assert.deepEqual(h.timers.pendingMs(), [], 'stale completion cannot schedule a dwell');
  assert.equal(h.progressText(), 'Slide 2 of 2');
});

test('Phase D: replay during the empty delay replaces the run — one completion, one dwell', () => {
  const h = bootPlayer({ slides: EMPTY_DECK });
  h.click('start-button');
  assert.deepEqual(h.timers.pendingMs(), [500], 'empty delay pending');

  // Replay re-speaks: session bump + old delay cleared + a fresh delay.
  // (The empty run's status is deliberately 'idle' — nothing is speaking —
  // so controller pause is a no-op here by Phase B design; replay is the
  // real session-replacement path.)
  h.click('replay-button');
  assert.deepEqual(h.timers.pendingMs(), [500], 'exactly one delay: the stale one was cleared');
  h.timers.runNext(); // completion under the CURRENT session
  assert.match(h.statusText(), /No narration text on this slide/);
  assert.deepEqual(h.timers.pendingMs(), [1800], 'exactly one dwell — no double scheduling');
  h.runAllTimers();
  assert.equal(h.progressText(), 'Slide 2 of 2', 'single advance after the replaced run');
});

test('Phase D: empty slide on the FINAL slide shows the end state, no dwell, no chain', () => {
  const h = bootPlayer({ slides: [{ html: '<div class="e"></div>', sentences: [] }] });
  h.click('start-button');
  h.timers.runNext(); // empty completion

  assert.match(h.statusText(), /End of presentation\./);
  assert.deepEqual(h.timers.pendingMs(), [], 'final slide schedules no dwell');
  h.runAllTimers();
  assert.equal(h.progressText(), 'Slide 1 of 1', 'no endless chain');
  assert.ok(!h.statusIsError());
});

test('Phase D: keyboard hint states that speed shortcuts apply in automatic mode only', () => {
  const html = renderPresentation(SAMPLE);
  assert.match(html, /during playback to adjust speed \(automatic mode only\)/);
});

// ---------------------------------------------------------------------------
// Phase D corrective patch: dwell generation/identity guard regression tests
// ---------------------------------------------------------------------------

test('corrective: a stale cancelled dwell callback cannot advance or orphan the live timer', () => {
  const h = bootPlayer({ slides: EMPTY_DECK });
  h.click('start-button');
  h.timers.runNext(); // empty completion -> dwell #1 scheduled at 1800
  assert.deepEqual(h.timers.pendingMs(), [1800]);

  // 3. pause cancels the first dwell (harness retains its callback)
  h.click('pause-button');
  assert.deepEqual(h.timers.pendingMs(), [], 'pause cancelled dwell #1');
  assert.equal(h.timers.cancelledCount(), 1, 'dwell #1 callback retained for manual firing');
  assert.equal(h.el('pause-button').textContent, '▶ Resume');

  // 4. resume creates a fresh full-duration dwell
  h.click('pause-button');
  assert.deepEqual(h.timers.pendingMs(), [1800], 'resume schedules a fresh 1800ms dwell');
  assert.equal(h.progressText(), 'Slide 1 of 2');

  // 5. manually invoke the OLD cancelled callback
  assert.equal(h.timers.fireCancelled(), 1, 'exactly the stale callback fired');

  // 6. no advancement from the stale callback
  assert.equal(h.progressText(), 'Slide 1 of 2', 'stale callback must NOT advance');
  assert.equal(h.synth.spoken.length, 0, 'stale callback must NOT narrate');

  // 7. the NEW timer is still OWNED: pause can find and cancel its handle
  //    (a stale null would have orphaned it and this would stay queued)
  assert.deepEqual(h.timers.pendingMs(), [1800], 'live timer still queued after stale fire');
  h.click('pause-button');
  assert.deepEqual(h.timers.pendingMs(), [], 'ownership intact: pause cancels the live timer');
  h.click('pause-button'); // resume again -> another full dwell
  assert.deepEqual(h.timers.pendingMs(), [1800]);

  // 8-9. fire the live timer: exactly one advance, one narration
  h.timers.runNext();
  assert.equal(h.progressText(), 'Slide 2 of 2', 'exactly one slide advancement');
  assert.equal(h.synth.spoken.length, 1, 'next slide narrated exactly once');
  h.driveCycle();
  assert.deepEqual(h.synth.spoken.map((u) => u.text.trim()), ['Second slide speaks now.']);
});

test('corrective: an obsolete callback after navigation cannot affect the replacement slide', () => {
  const h = bootPlayer({ slides: EMPTY_DECK });
  h.click('start-button');
  h.timers.runNext(); // dwell #1 on slide 1
  assert.deepEqual(h.timers.pendingMs(), [1800]);

  h.pressKey('ArrowRight'); // navigation clears the dwell (retained by harness)
  assert.deepEqual(h.timers.pendingMs(), [], 'navigation cancelled the dwell');
  assert.equal(h.progressText(), 'Slide 2 of 2');

  assert.equal(h.timers.fireCancelled(), 1, 'obsolete callback fires late');
  assert.equal(h.progressText(), 'Slide 2 of 2', 'obsolete callback cannot move the slide');
  assert.ok(!h.statusText().includes('End of presentation'), 'cannot trigger the end state either');
  assert.deepEqual(h.timers.pendingMs(), [], 'cannot resurrect a timer');

  // the replacement slide is unaffected: Play narrates it normally
  h.click('play-button');
  assert.equal(h.synth.spoken.length, 1);
  h.driveCycle();
  assert.equal(h.synth.spoken[0].text.trim(), 'Second slide speaks now.');
  assert.equal(h.progressText(), 'Slide 2 of 2');
});

// ---------------------------------------------------------------------------
// Figure contrast patch: surface classes in CSS + wrapped-figure player path
// ---------------------------------------------------------------------------

const FIGURE_SLIDES = [
  {
    html: '<figure class="light-surface"><p><img src="x.png" alt="Wrapped alt text."></p></figure>',
    sentences: ['Wrapped alt text.', 'More slide text.'],
  },
  {
    html: '<figure class="dark-surface"><p><img src="y.png" alt="Dark alt text."></p></figure>',
    sentences: ['Dark alt text.'],
  },
];

test('figure patch: both surface classes render in the CSS and both global theme modes remain', () => {
  const html = renderPresentation(FIGURE_SLIDES, { title: 'Figures' });
  assert.match(html, /#slide-container \.light-surface \{ background: #fff; padding: 1rem; border-radius: 8px; \}/);
  assert.match(html, /#slide-container \.dark-surface \{/);
  assert.match(html, /border: 1px solid rgba\(255, 255, 255, 0\.12\);/, 'dark surface keeps its subtle border');
  assert.match(html, /#slide-container figure \{ margin: 1\.5rem auto; width: fit-content; max-width: 100%; \}/);
  const parsed = JSON.parse(extractSlidesData(html));
  assert.match(parsed[0].html, /<figure class="light-surface">/, 'wrapper survives into slides-data');
  assert.match(parsed[1].html, /<figure class="dark-surface">/, 'wrapper survives into slides-data');
  // both theme modes untouched by the patch
  assert.match(html, /:root \{\s*\n\s*--bg-color: #1a1a1a;/, 'dark default remains');
  assert.match(html, /:root\[data-theme="light"\] \{\s*\n\s*--bg-color: #f5f5f5;/, 'light override remains');
});

test('figure patch: wrapped-figure sentences are spoken by the rendered player', () => {
  const h = bootPlayer({ slides: FIGURE_SLIDES });
  h.click('start-button');
  assert.equal(h.synth.spoken[0].text.trim(), 'Wrapped alt text.', 'alt text narrated from the wrapped figure');
  h.driveCycle(); // finish slide 1 -> slide 2
  h.driveCycle();
  const spoken = h.synth.spoken.map((u) => u.text.trim());
  assert.deepEqual(spoken, ['Wrapped alt text.', 'More slide text.', 'Dark alt text.']);
  assert.equal(h.progressText(), 'Slide 2 of 2');
});

test('regression: generated timer wiring uses window receivers — scheduling and cancellation survive Illegal-invocation checks', () => {
  const h = bootPlayer({ receiverCheck: true });

  // SCHEDULE: Start begins narration, whose first act is armStartup() calling
  // timers.setTimeout. With receiver checking on, a plain-object receiver
  // (the pre-fix template wiring) throws Illegal invocation, lands in the
  // controller's internal-error path, and never dispatches speech.
  h.click('start-button');
  assert.ok(
    !h.logs.some((l) => l.includes('Illegal invocation')),
    'scheduling must not throw Illegal invocation; logs: ' + h.logs.join(' | ')
  );
  assert.ok(!h.statusIsError(), 'no error state after scheduling: ' + h.statusText());
  assert.equal(h.synth.spoken.length, 1, 'speech dispatched (startup watchdog scheduled legally)');
  assert.ok(h.timers.size() >= 1, 'watchdog actually queued through the wiring');

  // CANCEL: Stop clears the pending startup/speaking watchdogs through
  // timers.clearTimeout — same receiver discipline, exercised end-to-end
  // through the generated deps object.
  h.click('stop-button');
  assert.ok(h.timers.cancelledCount() >= 1, 'clearTimeout ran through the generated wiring');
  assert.ok(
    !h.logs.some((l) => l.includes('Illegal invocation')),
    'cancellation must not throw Illegal invocation; logs: ' + h.logs.join(' | ')
  );
  assert.ok(!h.statusIsError(), 'still no error after stop: ' + h.statusText());
});

// --------- Voice selection: the learner's choice must survive refreshes ---------

const VOICE_SET = [
  { name: 'Alpha Voice', lang: 'en-US', voiceURI: 'urn:test:alpha' }, // first en-US = default
  { name: 'Beta Voice', lang: 'en-GB', voiceURI: 'urn:test:beta' },
  { name: 'Gamma Voice', lang: 'en-US', voiceURI: 'urn:test:gamma' },
];

function selectedVoiceText(h) {
  const sel = h.el('voice-select');
  return sel.selectedOptions[0] ? sel.selectedOptions[0].textContent : '';
}

test('voice: first initialization selects the preferred default (first en-US) and voices the first utterance', () => {
  const h = bootPlayer({ voices: VOICE_SET });
  assert.equal(h.el('voice-select').selectedIndex, 0, 'default = first en-US voice');
  assert.ok(selectedVoiceText(h).includes('Alpha Voice'), 'dropdown shows the default');
  h.click('start-button');
  assert.equal(h.synth.spoken[0].voice.name, 'Alpha Voice', 'first utterance carries the default voice');
});

test('voice: an explicit selection survives Start (populateVoices must not reset it)', () => {
  const h = bootPlayer({ voices: VOICE_SET });
  const sel = h.el('voice-select');
  sel.value = '1'; // learner picks Beta Voice
  sel.dispatch('change'); // the browser fires change on a user selection
  assert.ok(selectedVoiceText(h).includes('Beta Voice'), 'selection shown before Start');
  h.click('start-button'); // startPresentation() re-runs populateVoices()
  assert.ok(selectedVoiceText(h).includes('Beta Voice'), 'selection survives Start');
  assert.equal(h.synth.spoken[0].voice.name, 'Beta Voice', 'first utterance uses the chosen voice');
});

test('voice: an explicit selection survives a subsequent voiceschanged refresh', () => {
  const h = bootPlayer({ voices: VOICE_SET });
  const sel = h.el('voice-select');
  sel.value = '1';
  sel.dispatch('change');
  h.click('start-button');
  h.synth.onvoiceschanged(); // Chrome re-fires during/after loading
  assert.ok(selectedVoiceText(h).includes('Beta Voice'), 'selection survives voiceschanged');
  h.driveCycle(); // the chain constructs a fresh utterance for the next sentence
  const last = h.synth.spoken[h.synth.spoken.length - 1];
  assert.equal(last.voice.name, 'Beta Voice', 'new utterance keeps the chosen voice');
});

test('voice: a change during playback applies to the next sentence, not the current one', () => {
  const h = bootPlayer({ voices: VOICE_SET });
  h.click('start-button');
  const first = h.synth.spoken[0];
  assert.equal(first.voice.name, 'Alpha Voice', 'starts on the default');
  const sel = h.el('voice-select');
  sel.value = '2'; // pick Gamma mid-sentence
  sel.dispatch('change');
  assert.equal(first.voice.name, 'Alpha Voice', 'current utterance keeps its voice (not interrupted)');
  h.driveCycle(); // constructs the next utterance
  const second = h.synth.spoken[1];
  assert.ok(second, 'next sentence was dispatched');
  assert.equal(second.voice.name, 'Gamma Voice', 'new utterance picks up the change');
});

test('voice: fallback when the selected voice disappears from Chrome\'s list', () => {
  const h = bootPlayer({ voices: VOICE_SET });
  const sel = h.el('voice-select');
  sel.value = '1'; // Beta Voice
  sel.dispatch('change');
  h.click('start-button');
  assert.equal(h.synth.spoken[0].voice.name, 'Beta Voice');
  // Chrome's list changes: Beta no longer exists
  h.synth._voices = [
    { name: 'Delta Voice', lang: 'en-US', voiceURI: 'urn:test:delta' },
    { name: 'Epsilon Voice', lang: 'en-GB', voiceURI: 'urn:test:epsilon' },
  ];
  h.synth.onvoiceschanged();
  // sensible fallback = preferred default of the NEW list (first en-US)
  assert.ok(selectedVoiceText(h).includes('Delta Voice'), 'falls back to the new list default');
  h.driveCycle(); // next utterance
  const last = h.synth.spoken[h.synth.spoken.length - 1];
  assert.equal(last.voice.name, 'Delta Voice', 'utterance uses a valid fallback voice');
});

