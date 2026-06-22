// server/public/editor.js — Lecture Creator editor client (Phase 4; Phase 6 live-edit).
//
// Loaded as an ES module (<script type="module">) so it can import the pure,
// DOM-free helpers from ./editor-helpers.js — those helpers (especially
// decideReloadAction, the "never clobber unsaved edits" contract) are unit-
// tested in scripts/test/editor-helpers.test.js with no browser.
//
// Live-edit behaviour added this phase (the teacher's real workflow is: author
// in VS Code, then glance at this browser preview/export):
//   • Debounced auto-refresh — typing rebuilds the preview after DEBOUNCE_MS of
//     inactivity (one build per pause, not one per keystroke). The manual
//     "Refresh Preview" button stays as an explicit force-rebuild.
//   • On-disk change detection — while a lecture is loaded, the client polls
//     GET /api/lectures/:slug/mtime (stat-only, cheap) every POLL_MS. On a
//     change it applies decideReloadAction(): silent reload when the textarea
//     is clean, or a non-blocking "changed on disk — Reload" banner when there
//     are unsaved browser edits (NEVER auto-overwrites them).
//   • "unsaved" cue — a tag shows while the textarea diverges from the last
//     preview build and clears after a rebuild.
//
// The server stays the single source of truth for building (D5): preview and
// export POST {slug, markdown}, and buildLecture derives lectureDir from the
// slug — which is why Phase 2's diagram pre-render runs in the preview pane
// (no client-side change was needed for that; confirmed by a hermetic test).

import {
  debounce,
  decideReloadAction,
  DEBOUNCE_MS,
  POLL_MS,
} from './editor-helpers.js';

const lectureSelect = document.getElementById('lecture-select');
const markdownInput = document.getElementById('markdown-input');
const refreshButton = document.getElementById('refresh-button');
const exportButton = document.getElementById('export-button');
const reloadFromDiskButton = document.getElementById('reload-from-disk-button');
const previewFrame = document.getElementById('preview-frame');
const editorStatus = document.getElementById('editor-status');
const buildStatus = document.getElementById('build-status');
const dirtyIndicator = document.getElementById('dirty-indicator');
const diskChangeBanner = document.getElementById('disk-change-banner');

// --- editor state -----------------------------------------------------------
let currentSlug = null;
let knownMtime = null;     // last-seen on-disk mtime (ms) for currentSlug
let diskBaseline = '';     // lecture.md content as last read from disk
let previewBaseline = '';  // content most recently built into the preview
let pollTimer = null;      // setInterval handle for disk-change polling
let buildGen = 0;          // monotonically increasing preview-build generation

// One debounced rebuild shared by all typing. .cancel() is called on lecture
// switch and on manual Refresh so neither fires a stale build for old content.
const debouncedRefresh = debounce(() => {
  refreshPreview();
}, DEBOUNCE_MS);

// --- small DOM helpers ------------------------------------------------------

function setStatus(el, msg, kind) {
  if (!el) return;
  el.textContent = msg || '';
  // kind → Bulma text color helper (info/success/danger)
  el.className = 'editor-status help' + (kind ? ' has-text-' + kind : '');
}

function setDirty(visible) {
  if (dirtyIndicator) dirtyIndicator.classList.toggle('is-hidden', !visible);
}

function updateDirtyIndicator() {
  // "unsaved" = the textarea has diverged from the last preview build.
  setDirty(currentSlug != null && markdownInput.value !== previewBaseline);
}

function showDiskChangeBanner() {
  if (diskChangeBanner) diskChangeBanner.classList.remove('is-hidden');
}

function hideDiskChangeBanner() {
  if (diskChangeBanner) diskChangeBanner.classList.add('is-hidden');
}

// --- networking -------------------------------------------------------------

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(res.status + ' ' + res.statusText + (text ? ' — ' + text : ''));
  }
  return res;
}

// --- preview / export -------------------------------------------------------

// POST /preview {slug, markdown} → built HTML → iframe.srcdoc (WYSIWYG).
// buildGen guards against a slow earlier build clobbering a newer one.
async function refreshPreview() {
  if (!currentSlug) return;
  const gen = ++buildGen;
  const sent = markdownInput.value; // capture before await so baseline is exact
  setStatus(buildStatus, 'Building preview…', 'info');
  try {
    const res = await postJson('/preview', { slug: currentSlug, markdown: sent });
    if (gen !== buildGen) return; // a newer build superseded this one
    const html = await res.text();
    previewFrame.srcdoc = html;
    previewBaseline = sent; // preview now reflects exactly this content
    updateDirtyIndicator(); // "unsaved" cue clears
    setStatus(
      buildStatus,
      'Preview ready. Click Start inside the preview to play with voice.',
      'success',
    );
  } catch (err) {
    if (gen !== buildGen) return;
    setStatus(buildStatus, 'Preview failed: ' + err.message, 'danger');
  }
}

// POST /export {slug, markdown} → built HTML → browser download <slug>.html.
async function exportLecture() {
  if (!currentSlug) return;
  setStatus(buildStatus, 'Building export…', 'info');
  try {
    const res = await postJson('/export', { slug: currentSlug, markdown: markdownInput.value });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentSlug + '.html';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus(
      buildStatus,
      'Exported ' + currentSlug + '.html (' + blob.size + ' bytes).',
      'success',
    );
  } catch (err) {
    setStatus(buildStatus, 'Export failed: ' + err.message, 'danger');
  }
}

// --- disk-change detection (the VS-Code-save → browser-updates path) --------

function startPolling() {
  stopPolling();
  pollTimer = setInterval(pollDiskChange, POLL_MS);
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

// Cheap stat-only poll. Only when the mtime actually changes do we pay for a
// full read. Any network/server failure is swallowed so a down server never
// spams the UI — it just retries on the next interval (graceful degradation).
async function pollDiskChange() {
  if (!currentSlug) return;
  let mtime;
  try {
    const res = await fetch('/api/lectures/' + encodeURIComponent(currentSlug) + '/mtime');
    if (!res.ok) return;
    mtime = (await res.json()).mtime;
  } catch {
    return; // server unreachable → silent, retry on the next interval
  }
  if (mtime == null || mtime === knownMtime) return;

  // mtime changed → fetch the new content and decide what to do with it.
  let data;
  try {
    const res = await fetch('/api/lectures/' + encodeURIComponent(currentSlug));
    if (!res.ok) return;
    data = await res.json();
  } catch {
    return; // silent
  }
  applyDiskChange(data.mtime, data.markdown || '');
}

// Applies the pure decideReloadAction() to live DOM/state. The ONLY branch that
// can overwrite the textarea is 'reload' — and that branch is unreachable while
// the teacher has unsaved edits (those route to 'banner' instead, so they are
// never silently clobbered).
function applyDiskChange(diskMtime, diskContent) {
  if (diskMtime != null) knownMtime = diskMtime;
  const action = decideReloadAction({
    diskContent,
    diskBaseline,
    editorContent: markdownInput.value,
  });
  if (action === 'none') return;
  if (action === 'sync') {
    diskBaseline = diskContent;
    hideDiskChangeBanner();
    updateDirtyIndicator();
    return;
  }
  if (action === 'banner') {
    showDiskChangeBanner();
    return;
  }
  // 'reload' — textarea matched the old disk content, safe to pull the new one.
  diskBaseline = diskContent;
  markdownInput.value = diskContent;
  hideDiskChangeBanner();
  updateDirtyIndicator();
  refreshPreview();
}

// Teacher clicked the banner's "Reload": pull disk content, replacing edits.
async function reloadFromDisk() {
  if (!currentSlug) return;
  setStatus(editorStatus, 'Reloading ' + currentSlug + ' from disk…', 'info');
  try {
    const res = await fetch('/api/lectures/' + encodeURIComponent(currentSlug));
    if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
    const data = await res.json();
    const md = data.markdown || '';
    diskBaseline = md;
    markdownInput.value = md;
    if (data.mtime != null) knownMtime = data.mtime;
    hideDiskChangeBanner();
    updateDirtyIndicator();
    setStatus(editorStatus, 'Reloaded ' + currentSlug + ' from disk.', 'success');
    refreshPreview();
  } catch (err) {
    setStatus(editorStatus, 'Reload failed: ' + err.message, 'danger');
  }
}

// --- lecture lifecycle ------------------------------------------------------

// GET /api/lectures/:slug → prefill the textarea, build once, then start polling.
async function loadLecture(slug) {
  // Reset everything for the previous lecture FIRST so no stale build/poll
  // fires against the new slug.
  stopPolling();
  debouncedRefresh.cancel();

  currentSlug = slug;
  hideDiskChangeBanner();
  setStatus(editorStatus, 'Loading ' + slug + '…', 'info');
  try {
    const res = await fetch('/api/lectures/' + encodeURIComponent(slug));
    if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
    const data = await res.json();
    const md = data.markdown || '';
    markdownInput.value = md;
    markdownInput.disabled = false;
    refreshButton.disabled = false;
    exportButton.disabled = false;
    diskBaseline = md;
    previewBaseline = md;
    knownMtime = data.mtime != null ? data.mtime : null;
    setStatus(
      editorStatus,
      'Loaded ' + slug + ' (' + md.length + ' chars).',
      'success',
    );
    updateDirtyIndicator();
    refreshPreview();
    startPolling();
  } catch (err) {
    setStatus(editorStatus, 'Failed to load: ' + err.message, 'danger');
  }
}

// --- wire up the DOM --------------------------------------------------------

lectureSelect.addEventListener('change', (e) => {
  const slug = e.target.value;
  if (slug) loadLecture(slug);
});

// Debounced auto-refresh on edit; flips the "unsaved" cue immediately.
markdownInput.addEventListener('input', () => {
  updateDirtyIndicator();
  debouncedRefresh();
});

// Manual force-rebuild (bypasses/overrides the debounce).
refreshButton.addEventListener('click', () => {
  debouncedRefresh.cancel();
  refreshPreview();
});

exportButton.addEventListener('click', exportLecture);

if (reloadFromDiskButton) {
  reloadFromDiskButton.addEventListener('click', reloadFromDisk);
}
