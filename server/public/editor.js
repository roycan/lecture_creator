// server/public/editor.js — Lecture Creator editor client (Phase 4, decision A1).
//
// The server is the single source of truth for building (D5): both preview and
// export POST the current markdown to buildLecture and receive a fully
// self-contained HTML document (images inlined as data URIs, highlight.js +
// mermaid bundled). The preview <iframe> shows it verbatim — and because that
// built doc already embeds the full narrated deck player (auto/manual mode,
// voice selection, speed control), there is NO client-side voice/TTS code here.
// The dead github.io "base URL" field is gone (D6); buildLecture inlines images.

(function () {
  'use strict';

  const lectureSelect = document.getElementById('lecture-select');
  const markdownInput = document.getElementById('markdown-input');
  const refreshButton = document.getElementById('refresh-button');
  const exportButton = document.getElementById('export-button');
  const previewFrame = document.getElementById('preview-frame');
  const editorStatus = document.getElementById('editor-status');
  const buildStatus = document.getElementById('build-status');

  let currentSlug = null;

  function setStatus(el, msg, kind) {
    if (!el) return;
    el.textContent = msg || '';
    // kind → Bulma text color helper (info/success/danger)
    el.className = 'editor-status help' + (kind ? ' has-text-' + kind : '');
  }

  function payload() {
    return { slug: currentSlug, markdown: markdownInput.value };
  }

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

  // GET /api/lectures/:slug → prefill the textarea, then auto-refresh preview.
  async function loadLecture(slug) {
    currentSlug = slug;
    setStatus(editorStatus, 'Loading ' + slug + '…', 'info');
    try {
      const res = await fetch('/api/lectures/' + encodeURIComponent(slug));
      if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
      const data = await res.json();
      markdownInput.value = data.markdown || '';
      markdownInput.disabled = false;
      refreshButton.disabled = false;
      exportButton.disabled = false;
      setStatus(
        editorStatus,
        'Loaded ' + slug + ' (' + markdownInput.value.length + ' chars).',
        'success',
      );
      refreshPreview();
    } catch (err) {
      setStatus(editorStatus, 'Failed to load: ' + err.message, 'danger');
    }
  }

  // POST /preview {slug, markdown} → built HTML → iframe.srcdoc (WYSIWYG).
  async function refreshPreview() {
    if (!currentSlug) return;
    setStatus(buildStatus, 'Building preview…', 'info');
    try {
      const res = await postJson('/preview', payload());
      const html = await res.text();
      previewFrame.srcdoc = html;
      setStatus(
        buildStatus,
        'Preview ready. Click Start inside the preview to play with voice.',
        'success',
      );
    } catch (err) {
      setStatus(buildStatus, 'Preview failed: ' + err.message, 'danger');
    }
  }

  // POST /export {slug, markdown} → built HTML → browser download <slug>.html.
  async function exportLecture() {
    if (!currentSlug) return;
    setStatus(buildStatus, 'Building export…', 'info');
    try {
      const res = await postJson('/export', payload());
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

  lectureSelect.addEventListener('change', (e) => {
    const slug = e.target.value;
    if (slug) loadLecture(slug);
  });
  refreshButton.addEventListener('click', refreshPreview);
  exportButton.addEventListener('click', exportLecture);
})();
