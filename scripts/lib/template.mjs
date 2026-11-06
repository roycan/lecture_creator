// scripts/lib/template.mjs
//
// Shared core — renders the self-contained presentation HTML shell.
//
// Faithful port of the original browser tool's createSingleHTML() (now archive/reorg-2026-06/app.js:270),
// moved into the Node shared core so the CLI build and the Express /export
// route share one source of truth (context.md §3 / D5).
//
// Changes vs. original:
//   - Renamed createSingleHTML -> renderPresentation.
//   - Title is now a parameter (was hard-coded "Lecture Presentation").
//   - The dead GitHub-Pages base-URL path (archive/reorg-2026-06/app.js:239-262) is NOT ported (D6):
//     images are inlined as data URIs (Phase 2b) instead.
//   - Phase 2c: when a `bundle` is supplied, highlight.js (always) + mermaid
//     (only when used) are INLINED from vendored UMD copies and NO CDN tags are
//     emitted. The theme toggle switches the two inlined hljs <style> sheets
//     via .sheet.disabled (no CDN href swap). Omitting `bundle` keeps the
//     original CDN tags verbatim (2a backward-compat path).

import { createNarrator } from './narration-controller.mjs';
import { safeInlineJs } from './bundle-libs.mjs';

/**
 * Render slides into a standalone presentation HTML document.
 *
 * @param {{ html: string, sentences?: string[] }[]} slides - output of splitSlides() (each item is
 *   `{ html }` where html is the rendered slide markup).
 * @param {{ title?: string, bundle?: object }} [opts] - `title`: document
 *   <title>. `bundle`: inline-ready lib strings from bundleLibs() (Phase 2c);
 *   when supplied the shell inlines vendored highlight.js + (optionally)
 *   mermaid and emits NO CDN tags. When omitted, the original CDN tags are used
 *   (Phase 2a behavior; keeps template.test.js green).
 * @returns {string} Complete HTML document string.
 */
// --- Phase 2c: vendored lib injection --------------------------------------
// The original CDN tags (verbatim) for the backward-compat path (template.test.js
// + any non-bundled caller). When a bundle is supplied, buildHeadLibs() inlines
// vendored highlight.js + (optionally) mermaid instead.
const CDN_HEAD_LIBS = `    <!-- Code Highlighting: Highlight.js -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css" id="hljs-theme">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <!-- Mermaid Diagram Rendering -->
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js"></script>`;

// Inlined lib block for the bundled (offline) shell. Light theme precedes dark
// in source order so the default-dark cascade is correct even before setTheme()
// runs; setTheme() then disables the inactive sheet via .sheet.disabled.
function buildHeadLibs({ hljsScript, hljsStyleDark, hljsStyleLight, mermaidScript }) {
  const mermaidTag = mermaidScript
    ? `\n    <!-- Mermaid Diagram Rendering (bundled offline) -->\n    <script>${mermaidScript}</script>`
    : `\n    <!-- Mermaid: not used by this lecture; bundle omitted for size -->`;
  return `    <!-- Code Highlighting: Highlight.js (bundled offline) -->
    <style id="hljs-style-light">${hljsStyleLight}</style>
    <style id="hljs-style-dark">${hljsStyleDark}</style>
    <script>${hljsScript}</script>${mermaidTag}`;
}

export function renderPresentation(slides, { title, bundle } = {}) {
  const slidesArr = Array.isArray(slides) ? slides : [];
  // Escape </script> and opening <script so embedded JSON can't break out.
  const safeSlidesJson = JSON.stringify(slidesArr)
    .replace(/<\/script>/gi, '<\\/script>')
    .replace(/<script/gi, '<\\script');
  const pageTitle = title || 'Lecture Presentation';

  // --- Library asset injection (Phase 2c) --------------------------------
  // A `bundle` (from bundleLibs()) => inline vendored libs (fully offline, no
  // CDN tags). No bundle => original CDN tags (2a backward-compat). The same
  // switch rewires setTheme()'s hljs theme logic below.
  const useBundle = !!bundle;
  const headLibs = useBundle ? buildHeadLibs(bundle) : CDN_HEAD_LIBS;
  const hljsThemeInit = useBundle
    ? "var hljsDarkSheet = document.getElementById('hljs-style-dark');\n            var hljsLightSheet = document.getElementById('hljs-style-light');"
    : "var hljsThemeLink = document.getElementById('hljs-theme');";
  const hljsThemeLight = useBundle
    ? "if (hljsDarkSheet && hljsDarkSheet.sheet) { hljsDarkSheet.sheet.disabled = true; }\n            if (hljsLightSheet && hljsLightSheet.sheet) { hljsLightSheet.sheet.disabled = false; }"
    : "if (hljsThemeLink) {\n                hljsThemeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';\n            }";
  const hljsThemeDark = useBundle
    ? "if (hljsDarkSheet && hljsDarkSheet.sheet) { hljsDarkSheet.sheet.disabled = false; }\n            if (hljsLightSheet && hljsLightSheet.sheet) { hljsLightSheet.sheet.disabled = true; }"
    : "if (hljsThemeLink) {\n                hljsThemeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css';\n            }";

  return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${pageTitle}</title>
${headLibs}
    <style>
        /* Theme Variables */
        :root {
            --bg-color: #1a1a1a;
            --text-color: #fff;
            --text-shadow: rgba(0, 0, 0, 0.5);
            --code-bg: #333;
            --pre-bg: #2d2d2d;
            --overlay-bg: rgba(0, 0, 0, 0.95);
            --overlay-panel: rgba(255, 255, 255, 0.03);
            --border-color: #555;
            --input-bg: #2d2d2d;
            --subtle-bg: rgba(255, 255, 255, 0.05);
            --shadow-light: rgba(255, 255, 255, 0.2);
            --shadow-dark: rgba(0, 0, 0, 0.3);
            --progress-bg: rgba(0, 0, 0, 0.85);
        }
        
        :root[data-theme="light"] {
            --bg-color: #f5f5f5;
            --text-color: #1a1a1a;
            --text-shadow: rgba(255, 255, 255, 0.5);
            --code-bg: #e0e0e0;
            --pre-bg: #e8e8e8;
            --overlay-bg: rgba(245, 245, 245, 0.98);
            --overlay-panel: rgba(0, 0, 0, 0.03);
            --border-color: #ccc;
            --input-bg: #fff;
            --subtle-bg: rgba(0, 0, 0, 0.05);
            --shadow-light: rgba(0, 0, 0, 0.1);
            --shadow-dark: rgba(0, 0, 0, 0.2);
            --progress-bg: rgba(255, 255, 255, 0.90);
        }
        
        * { box-sizing: border-box; }
        body, html {
            height: 100%;
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: var(--bg-color);
            color: var(--text-color);
            transition: background-color 0.3s ease, color 0.3s ease;
        }
        
        #slide-container {
            width: 100%;
            min-height: 100vh;
            height: auto;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            text-align: center;
            padding: 3rem 2rem 200px 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        #slide-container h1 { font-size: 2.5em; margin: 0.5em 0; text-shadow: 2px 2px 4px var(--text-shadow); }
        #slide-container h2 { font-size: 2em; margin: 0.5em 0; text-shadow: 2px 2px 4px var(--text-shadow); }
        #slide-container h3 { font-size: 1.5em; margin: 0.5em 0; }
        #slide-container p { font-size: 1.2em; line-height: 1.6; max-width: 800px; margin: 0.5em auto; }
        #slide-container img { max-width: 100%; height: auto; border-radius: 8px; margin: 1.5rem 0; }
        #slide-container figure { margin: 1.5rem auto; width: fit-content; max-width: 100%; }
        /* Figure surfaces: theme-stable backdrops for contrast (figure patch).
           .light-surface: white panel behind dark-on-transparent figures.
           .dark-surface: neutral dark panel behind light-content figures. */
        #slide-container .light-surface { background: #fff; padding: 1rem; border-radius: 8px; }
        #slide-container .dark-surface {
            background: #2d2d2d;
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.12);
        }
        #slide-container ul, #slide-container ol { text-align: left; max-width: 600px; margin: 1em auto; font-size: 1.1em; }
        #slide-container code { background: var(--code-bg); padding: 0.2em 0.4em; border-radius: 3px; }
        #slide-container pre { 
            background: var(--pre-bg); 
            padding: 1em; 
            border-radius: 8px; 
            overflow-x: visible; 
            text-align: left;
            font-family: 'Courier New', Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
            font-size: 0.8em;
            line-height: 1.4;
            max-width: 100%;
            white-space: pre;
        }
        
        #slide-container pre code {
            font-family: inherit;
            font-size: inherit;
            background: transparent;
            padding: 0;
        }
        
        /* Start Overlay */
        #start-overlay {
            position: fixed;
            inset: 0;
            background: var(--overlay-bg);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 20px;
            z-index: 1000;
        }
        
        #status-message {
            font-size: 1.1em;
            color: #aaa;
            margin: 0;
            min-height: 1.5em;
        }
        
        #status-message.success { color: #4CAF50; }
        #status-message.warning { color: #FF9800; }
        #status-message.error { color: #f44336; }
        
        /* Mode Selection */
        #mode-selection {
            margin: 1.5em 0;
            width: 100%;
            max-width: 500px;
        }
        
        #mode-selection fieldset {
            border: 2px solid var(--border-color);
            border-radius: 8px;
            padding: 1em;
            background: var(--overlay-panel);
        }
        
        #mode-selection legend {
            padding: 0 0.5em;
            color: #4CAF50;
            font-weight: bold;
            font-size: 1.1em;
        }
        
        .mode-option {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 12px;
            margin: 8px 0;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.2s;
        }
        
        .mode-option:hover {
            background: var(--subtle-bg);
        }
        
        .mode-option input[type="radio"] {
            margin-top: 4px;
            width: 18px;
            height: 18px;
            cursor: pointer;
        }
        
        .mode-option-content {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .mode-option strong {
            font-size: 1.1em;
            color: var(--text-color);
        }
        
        .mode-option small {
            font-size: 0.85em;
            color: #aaa;
            line-height: 1.3;
        }
        
        #controls {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            align-items: center;
            justify-content: center;
            padding: 1em;
            background: var(--subtle-bg);
            border-radius: 8px;
        }
        
        #voice-controls-container.hidden {
            display: none;
        }
        
        #voice-select {
            min-width: 200px;
            padding: 0.5em;
            font-size: 1em;
            border-radius: 4px;
            border: 1px solid var(--border-color);
            background: var(--input-bg);
            color: var(--text-color);
        }
        
        label {
            display: flex;
            flex-direction: column;
            gap: 4px;
            font-size: 0.9em;
            color: #ccc;
        }
        
        input[type="range"] {
            width: 120px;
        }
        
        #start-button {
            font-size: 1.3em;
            padding: 0.8em 2em;
            border-radius: 8px;
            border: none;
            background: #4CAF50;
            color: white;
            cursor: pointer;
            transition: all 0.3s;
            font-weight: bold;
        }
        
        #start-button:hover:not(:disabled) {
            background: #45a049;
            transform: scale(1.05);
        }
        
        #start-button:disabled {
            background: #555;
            cursor: not-allowed;
            opacity: 0.6;
        }
        
        /* Navigation Controls */
        #nav-controls {
            position: fixed;
            bottom: 20px;
            right: 20px;
            display: none;
            flex-direction: column;
            gap: 10px;
            z-index: 100;
        }
        
        #nav-controls.visible { display: flex; }
        
        #progress-indicator {
            background: var(--progress-bg);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9em;
            text-align: center;
            border: 1px solid var(--border-color);
        }
        
        .nav-button {
            padding: 12px 20px;
            border: none;
            border-radius: 8px;
            background: rgba(76, 175, 80, 0.9);
            color: white;
            cursor: pointer;
            font-size: 1em;
            transition: all 0.3s;
            font-weight: bold;
        }
        
        .nav-button:hover { background: rgba(69, 160, 73, 1); transform: scale(1.05); }
        .nav-button:disabled { background: rgba(85, 85, 85, 0.5); cursor: not-allowed; }
        
        #pause-button {
            background: rgba(255, 152, 0, 0.9);
        }
        
        #pause-button:hover:not(:disabled) {
            background: rgba(245, 124, 0, 1);
        }
        
        #pause-button.paused {
            background: rgba(76, 175, 80, 0.9);
        }

        #narration-status {
            max-width: 260px;
            min-height: 1em;
            font-size: 0.9em;
            line-height: 1.35;
            text-align: right;
        }

        #narration-status.error {
            color: #f44336;
            font-weight: bold;
        }
        #pause-button.paused:hover {
            background: rgba(69, 160, 73, 1);
        }
        
        #pause-button.hidden {
            display: none;
        }
        
        /* Speed Control */
        .speed-control {
            background: var(--progress-bg);
            padding: 8px 16px;
            border-radius: 20px;
            border: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.9em;
        }
        
        .speed-control label {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0;
            cursor: default;
        }
        
        #speed-slider {
            width: 100px;
            height: 6px;
            cursor: pointer;
            background: var(--shadow-light);
            border-radius: 3px;
            outline: none;
            -webkit-appearance: none;
        }
        
        #speed-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            background: #4CAF50;
            border-radius: 50%;
            cursor: pointer;
        }
        
        #speed-slider::-moz-range-thumb {
            width: 16px;
            height: 16px;
            background: #4CAF50;
            border-radius: 50%;
            cursor: pointer;
            border: none;
        }
        
        #speed-value {
            font-weight: bold;
            min-width: 45px;
            text-align: right;
            color: #4CAF50;
        }
        
        .speed-control.hidden {
            display: none;
        }
        
        /* Keyboard Hint */
        .keyboard-hint {
            margin-top: 1rem;
            padding: 0.75rem;
            background: rgba(76, 175, 80, 0.1);
            border: 1px solid rgba(76, 175, 80, 0.3);
            border-radius: 6px;
            font-size: 0.85em;
            color: rgba(255, 255, 255, 0.8);
            text-align: center;
        }
        
        .keyboard-hint kbd {
            background: var(--shadow-dark);
            padding: 2px 6px;
            border-radius: 3px;
            border: 1px solid var(--shadow-light);
            font-family: monospace;
            font-size: 0.9em;
        }
        
        /* Theme Toggle Button */
        #theme-toggle {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 16px;
            border: none;
            border-radius: 8px;
            background: var(--subtle-bg);
            color: var(--text-color);
            cursor: pointer;
            font-size: 1.2em;
            transition: all 0.3s;
            z-index: 1001;
            border: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        #theme-toggle:hover {
            background: var(--code-bg);
            transform: scale(1.05);
        }
        
        #theme-toggle .theme-icon {
            font-size: 1.3em;
        }
        
        /* Speed Toast Notification */
        #speed-toast {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 1.5rem 3rem;
            border-radius: 12px;
            font-size: 1.8em;
            font-weight: bold;
            z-index: 10000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
            border: 2px solid #4CAF50;
        }
        
        /* Loading Spinner */
        .spinner {
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid #4CAF50;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
            #slide-container { padding: 2rem 1rem; }
            #slide-container h1 { font-size: 1.8em; }
            #slide-container h2 { font-size: 1.5em; }
            #slide-container p { font-size: 1em; }
            #controls { flex-direction: column; }
            #nav-controls { bottom: 10px; right: 10px; }
            
            #speed-slider {
                width: 150px;
            }
            
            .nav-button {
                padding: 10px 16px;
                font-size: 0.9em;
            }
            
            #speed-toast {
                font-size: 1.5em;
                padding: 1rem 2rem;
            }
            
            /* Mermaid Error Messages */
            .mermaid-error {
                background: rgba(244, 67, 54, 0.1);
                border-left: 4px solid #f44336;
                padding: 10px 15px;
                margin: 10px 0;
                border-radius: 4px;
                color: #f44336;
                font-size: 0.9em;
                text-align: left;
            }
            
            .mermaid-error::before {
                content: '⚠️ ';
                font-weight: bold;
            }
        }
    </style>
</head>
<body>
    <!-- Theme Toggle Button -->
    <button id="theme-toggle" title="Toggle light/dark theme">
        <span class="theme-icon">☀️</span>
        <span class="theme-text">Light</span>
    </button>
    
    <main id="slide-container">
        <div id="start-overlay">
            <div class="spinner"></div>
            <p id="status-message">Initializing presentation...</p>
            
            <div id="mode-selection">
                <fieldset>
                    <legend>Choose Playback Mode</legend>
                    <label class="mode-option">
                        <input type="radio" name="playback-mode" value="auto" checked>
                        <span class="mode-option-content">
                            <strong>Auto-play with voice</strong>
                            <small>Slides advance automatically with narration</small>
                        </span>
                    </label>
                    <label class="mode-option">
                        <input type="radio" name="playback-mode" value="manual">
                        <span class="mode-option-content">
                            <strong>Manual navigation</strong>
                            <small>Use Next/Previous buttons to control pace (recommended for Linux + Chrome)</small>
                        </span>
                    </label>
                </fieldset>
            </div>
            
            <div id="voice-controls-container">
                <div id="controls">
                    <label>
                        Voice
                        <select id="voice-select">
                            <option>Loading voices...</option>
                        </select>
                    </label>
                    <label>
                        Rate
                        <input id="rate" type="range" min="0.6" max="1.3" step="0.05" value="1">
                        <span id="rate-value">1.00x</span>
                    </label>
                    <label>
                        Pitch
                        <input id="pitch" type="range" min="0.6" max="1.5" step="0.05" value="1.0">
                        <span id="pitch-value">1.0</span>
                    </label>
                </div>
            </div>
            
            <button id="start-button" disabled>Initializing...</button>
            
            <div class="keyboard-hint">
                <strong>Tip:</strong> Press <kbd>,</kbd> or <kbd>.</kbd> during playback to adjust speed (automatic mode only)
            </div>
        </div>
    </main>
    
    <div id="nav-controls">
        <div id="progress-indicator">Slide 1 of 1</div>
        <div id="speed-control" class="speed-control hidden">
            <label>
                Speed:
                <input id="speed-slider" type="range" min="0.6" max="1.3" step="0.05" value="1">
                <span id="speed-value">1.00x</span>
            </label>
        </div>
        <button id="play-button" class="nav-button">▶ Play</button>
        <button id="pause-button" class="nav-button hidden">⏸ Pause</button>
        <button id="stop-button" class="nav-button">⏹ Stop</button>
        <button id="replay-button" class="nav-button">↻ Replay</button>
        <button id="prev-button" class="nav-button">⬅ Previous</button>
        <button id="next-button" class="nav-button">Next ➡</button>
        <div id="narration-status" role="status" aria-live="polite"></div>
    </div>
    
    <script id="slides-data" type="application/json">${safeSlidesJson}</script>
    <script>
(function() {
    'use strict';
    
    // Phase A: narration lifecycle extracted to createNarrator
    // (scripts/lib/narration-controller.mjs), serialized here at render time
    // so the export stays a single self-contained offline document with no
    // browser-side module import.
    var createNarrator = ${safeInlineJs(createNarrator.toString())};
    
    // Theme Toggle Functionality
    (function initTheme() {
        var themeToggle = document.getElementById('theme-toggle');
        var themeIcon = themeToggle.querySelector('.theme-icon');
        var themeText = themeToggle.querySelector('.theme-text');
        var root = document.documentElement;
        
        // Load saved theme or default to dark
        var savedTheme = localStorage.getItem('lecture-theme') || 'dark';
        setTheme(savedTheme);
        
        function setTheme(theme) {
            ${hljsThemeInit}
            if (theme === 'light') {
                root.setAttribute('data-theme', 'light');
                themeIcon.textContent = '🌙';
                themeText.textContent = 'Dark';
                localStorage.setItem('lecture-theme', 'light');
                // Switch to light theme for code highlighting
                ${hljsThemeLight}
            } else {
                root.removeAttribute('data-theme');
                themeIcon.textContent = '☀️';
                themeText.textContent = 'Light';
                localStorage.setItem('lecture-theme', 'dark');
                // Switch to dark theme for code highlighting
                ${hljsThemeDark}
            }
        }
        
        themeToggle.addEventListener('click', function() {
            var currentTheme = root.getAttribute('data-theme');
            setTheme(currentTheme === 'light' ? 'dark' : 'light');
        });
    })();
    
    // Console logging helper
    function log(msg, level) {
        var prefix = '[Lecture Player] ';
        if (level === 'error') console.error(prefix + msg);
        else if (level === 'warn') console.warn(prefix + msg);
        else console.log(prefix + msg);
    }
    
    // State
    var slides = [];
    var currentSlide = 0;
    var isPlaying = false;
    var playbackMode = 'auto'; // 'auto' = narrate + advance once | 'manual' = narrate only
    var emptyDwellTimer = null; // Phase D: single player-owned empty-slide dwell
    var dwellPaused = false; // Phase D: dwell paused while waiting on an empty slide
    var emptyDwellGeneration = 0; // Phase D corrective: identity guard vs stale callbacks
    var EMPTY_DWELL_MS = 1800; // provisional: auto-advance delay on empty slides
    var voiceDiscoveryState = 'pending'; // 'pending' | 'ready' | 'empty'
    var errorLatched = false; // keeps an unread narration error visible
    var availableVoices = [];
    var selectedVoice = null;
    var userPreferredVoiceURI = null; // last voice the learner explicitly chose
    
    // DOM Elements
    var container = document.getElementById('slide-container');
    var startOverlay = document.getElementById('start-overlay');
    var startButton = document.getElementById('start-button');
    var statusMessage = document.getElementById('status-message');
    var voiceSelect = document.getElementById('voice-select');
    var rateInput = document.getElementById('rate');
    var pitchInput = document.getElementById('pitch');
    var rateValue = document.getElementById('rate-value');
    var pitchValue = document.getElementById('pitch-value');
    var navControls = document.getElementById('nav-controls');
    var progressIndicator = document.getElementById('progress-indicator');
    var prevButton = document.getElementById('prev-button');
    var nextButton = document.getElementById('next-button');
    var pauseButton = document.getElementById('pause-button');
    var playButton = document.getElementById('play-button');
    var stopButton = document.getElementById('stop-button');
    var replayButton = document.getElementById('replay-button');
    var narrationStatus = document.getElementById('narration-status');
    var spinner = document.querySelector('.spinner');
    var voiceControlsContainer = document.getElementById('voice-controls-container');
    var speedControl = document.getElementById('speed-control');
    var speedSlider = document.getElementById('speed-slider');
    var speedValue = document.getElementById('speed-value');
    
    // Phase A: the narrator owns the speech chain. The getters below preserve
    // the legacy construction-time reads of the DOM controls.
    var narrator = createNarrator({
        synth: window.speechSynthesis,
        Utterance: window.SpeechSynthesisUtterance,
        timers: { setTimeout: setTimeout.bind(window), clearTimeout: clearTimeout.bind(window) },
        log: log,
        getVoice: function() {
            var voiceIndex = parseInt(voiceSelect.value, 10);
            if (!isNaN(voiceIndex) && availableVoices[voiceIndex]) {
                return availableVoices[voiceIndex];
            }
            if (selectedVoice) {
                return selectedVoice;
            }
            return null;
        },
        getRate: function() {
            // Phase C: the nav speed slider is the single source of truth for
            // utterance rate; NaN-safe with a default of exactly 1.0.
            var v = parseFloat(speedSlider ? speedSlider.value : (rateInput ? rateInput.value : ''));
            return v > 0 ? v : 1.0;
        },
        getPitch: function() {
            return parseFloat(pitchInput.value) || 1.0;
        },
        onStateChange: handleNarratorState
    });
    
    // Update rate/pitch displays
    rateInput.addEventListener('input', function() {
        rateValue.textContent = parseFloat(rateInput.value).toFixed(2) + 'x';
    });
    pitchInput.addEventListener('input', function() {
        pitchValue.textContent = parseFloat(pitchInput.value).toFixed(1);
    });

    // Remember an explicit learner choice by voice identity, so populateVoices
    // refreshes can restore it. getVoice() still reads the live index on every
    // utterance, so a change during playback applies to the NEXT sentence.
    voiceSelect.addEventListener('change', function() {
        var idx = parseInt(voiceSelect.value, 10);
        var voice = !isNaN(idx) ? availableVoices[idx] : null;
        if (voice) {
            userPreferredVoiceURI = voiceIdentity(voice);
            selectedVoice = voice;
        }
    });
    
    // Update speed display (nav controls)
    speedSlider.addEventListener('input', function() {
        speedValue.textContent = parseFloat(speedSlider.value).toFixed(2) + 'x';
        showSpeedToast(parseFloat(speedSlider.value)); // Phase C: say when it applies
    });
    
    // Setup mode selection
    function setupModeSelection() {
        var modeRadios = document.querySelectorAll('input[name="playback-mode"]');
        
        for (var i = 0; i < modeRadios.length; i++) {
            modeRadios[i].addEventListener('change', function(e) {
                playbackMode = (e.target.value === 'manual') ? 'manual' : 'auto';

                // Voice/pitch controls remain in the startup overlay for BOTH
                // modes (D4): manual mode narrates too (D1), so voices matter.
                voiceControlsContainer.classList.remove('hidden');

                if (playbackMode === 'manual') {
                    updateStatus('Manual narration selected - slides will not advance automatically', 'success');
                    startButton.textContent = 'Start (Manual Navigation)';
                    startButton.disabled = false;
                    spinner.style.display = 'none';
                    log('Manual mode selected by user');
                } else if (voiceDiscoveryState === 'ready') {
                    updateStatus('Auto-play mode - ' + availableVoices.length + ' voices available', 'success');
                    startButton.textContent = 'Start Presentation';
                    startButton.disabled = false;
                    spinner.style.display = 'none';
                    log('Auto-play mode selected by user');
                } else if (voiceDiscoveryState === 'empty') {
                    updateStatus('Continuing with system default voice', 'warning');
                    startButton.textContent = 'Start Anyway';
                    startButton.disabled = false;
                    spinner.style.display = 'none';
                    log('Auto-play mode selected by user');
                } else {
                    // Discovery still pending: hold the button — an empty
                    // first getVoices() is NOT evidence of "no voice".
                    updateStatus('Loading voices...', '');
                    startButton.textContent = 'Initializing...';
                    startButton.disabled = true;
                    spinner.style.display = 'block';
                    log('Auto-play mode selected by user');
                }
            });
        }
    }
    
    // Load slides
    try {
        var slidesData = document.getElementById('slides-data');
        if (!slidesData) {
            throw new Error('Slides data not found');
        }
        slides = JSON.parse(slidesData.textContent || '[]');
        if (!slides || slides.length === 0) {
            throw new Error('No slides found');
        }
        log('Loaded ' + slides.length + ' slides');
    } catch (e) {
        log('Failed to load slides: ' + e.message, 'error');
        updateStatus('Failed to load presentation', 'error');
        startButton.textContent = 'Error: No Slides';
        return;
    }
    
    // Initialize Code Highlighting (Highlight.js)
    if (typeof hljs !== 'undefined') {
        hljs.highlightAll();
        log('Code highlighting initialized', 'success');
    } else {
        log('Highlight.js not loaded - code blocks will not be highlighted', 'warn');
    }
    
    // Initialize Mermaid Diagram Rendering with feature flag
    var mermaidEnabled = true; // Feature flag for safe rollout
    if (typeof mermaid !== 'undefined') {
        try {
            mermaid.initialize({
                startOnLoad: false,  // We'll trigger manually
                theme: 'default',
                securityLevel: 'loose',  // Allow more flexibility
                themeVariables: {
                    darkMode: true,
                    background: '#1a1a1a',
                    primaryColor: '#4CAF50',
                    primaryTextColor: '#fff',
                    primaryBorderColor: '#4CAF50',
                    lineColor: '#666',
                    secondaryColor: '#ff9900',
                    tertiaryColor: '#f0f0f0'
                }
            });
            log('Mermaid initialized successfully', 'success');
        } catch (error) {
            log('Mermaid initialization error: ' + error.message, 'error');
            mermaidEnabled = false; // Disable mermaid if init fails
        }
    } else {
        log('Mermaid.js not loaded - diagrams will show as code blocks', 'warn');
        mermaidEnabled = false;
    }
    
    // Update status message
    function updateStatus(msg, type) {
        statusMessage.textContent = msg;
        statusMessage.className = type || '';
    }
    
    // Split text into sentences
    function splitIntoSentences(text) {
        var sentences = [];
        var buffer = '';
        for (var i = 0; i < text.length; i++) {
            var ch = text[i];
            buffer += ch;
            if (ch === '.' || ch === '!' || ch === '?' || ch === '\\n') {
                var trimmed = buffer.trim();
                if (trimmed) sentences.push(trimmed);
                buffer = '';
            }
        }
        var remaining = buffer.trim();
        if (remaining) sentences.push(remaining);
        return sentences.length > 0 ? sentences : [text];
    }
    
    // Select best voice
    function selectBestVoice(voices) {
        if (!voices || voices.length === 0) return null;
        
        // Try US English first
        for (var i = 0; i < voices.length; i++) {
            if (/en-us/i.test(voices[i].lang)) {
                log('Selected US English voice: ' + voices[i].name);
                return voices[i];
            }
        }
        
        // Try any English
        for (var j = 0; j < voices.length; j++) {
            if (/^en/i.test(voices[j].lang)) {
                log('Selected English voice: ' + voices[j].name);
                return voices[j];
            }
        }
        
        // Use first available
        log('Using first available voice: ' + voices[0].name);
        return voices[0];
    }
    
    // Stable identity for a voice across getVoices() calls: voiceURI per spec,
    // name as the fallback for hosts and test doubles without voiceURI.
    function voiceIdentity(voice) {
        return voice ? (voice.voiceURI || voice.name) : null;
    }

    // Populate voice select
    function populateVoices() {
        try {
            // Remember the current choice by VOICE IDENTITY, not by dropdown
            // index: indexes shift whenever a different getVoices() list comes
            // back (late loading, voiceschanged refreshes).
            var previousIdentity = null;
            var previousIndex = parseInt(voiceSelect.value, 10);
            if (!isNaN(previousIndex) && availableVoices[previousIndex]) {
                previousIdentity = voiceIdentity(availableVoices[previousIndex]);
            }
            var wantedIdentity = userPreferredVoiceURI || previousIdentity;

            availableVoices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
            voiceSelect.innerHTML = '';
            
            if (!availableVoices || availableVoices.length === 0) {
                var opt = document.createElement('option');
                opt.textContent = 'System default voice';
                voiceSelect.appendChild(opt);
                log('No voices available, using system default', 'warn');
                return false;
            }
            
            // Populate dropdown
            for (var i = 0; i < availableVoices.length; i++) {
                var voice = availableVoices[i];
                var option = document.createElement('option');
                option.value = i;
                option.textContent = voice.name + ' (' + voice.lang + ')';
                voiceSelect.appendChild(option);
            }
            
            // Restore the learner's voice when it is still in Chrome's list;
            // otherwise (first run, or the voice vanished) fall back to the
            // preferred default — first en-US, then any English, then the first.
            var restored = -1;
            if (wantedIdentity) {
                for (var r = 0; r < availableVoices.length; r++) {
                    if (voiceIdentity(availableVoices[r]) === wantedIdentity) {
                        restored = r;
                        break;
                    }
                }
            }
            if (restored >= 0) {
                voiceSelect.selectedIndex = restored;
                selectedVoice = availableVoices[restored];
            } else {
                selectedVoice = selectBestVoice(availableVoices);
                if (selectedVoice) {
                    for (var k = 0; k < availableVoices.length; k++) {
                        if (availableVoices[k] === selectedVoice) {
                            voiceSelect.selectedIndex = k;
                            break;
                        }
                    }
                }
            }
            
            log('Populated ' + availableVoices.length + ' voices');
            return true;
        } catch (e) {
            log('Error populating voices: ' + e.message, 'error');
            return false;
        }
    }
    
    // Wait for voices with timeout
    function waitForVoices(callback) {
        var startTime = Date.now();
        var maxWait = 3000; // 3 seconds
        
        function check() {
            var hasVoices = populateVoices();
            if (hasVoices) {
                log('Voices loaded successfully');
                callback(true);
                return;
            }
            
            if (Date.now() - startTime > maxWait) {
                log('Voice loading timeout, continuing with defaults', 'warn');
                callback(false);
                return;
            }
            
            setTimeout(check, 200);
        }
        
        check();
    }
    
    // Display slide
    function displaySlide(index) {
        if (index < 0 || index >= slides.length) {
            log('Invalid slide index: ' + index, 'error');
            return;
        }
        clearEmptyDwell(); // slide replacement never inherits a pending dwell

        currentSlide = index;
        var slide = slides[index];
        
        try {
            container.innerHTML = slide.html;
            progressIndicator.textContent = 'Slide ' + (index + 1) + ' of ' + slides.length;
            
            // Render mermaid diagrams in the current slide with graceful degradation
            if (mermaidEnabled && typeof mermaid !== 'undefined') {
                // Marked.js creates <pre><code class="language-mermaid"> for mermaid blocks
                // Look for both patterns to handle different markdown parsers
                var mermaidBlocks = container.querySelectorAll('pre.mermaid, div.mermaid, pre code.language-mermaid, div code.language-mermaid');
                if (mermaidBlocks.length > 0) {
                    mermaid.run({
                        nodes: mermaidBlocks
                    }).then(function() {
                        log('Mermaid diagrams rendered for slide ' + index, 'success');
                    }).catch(function(error) {
                        // Graceful degradation: Show error and keep code block
                        log('Mermaid render error: ' + error.message, 'error');
                        // Add error message above failed diagram
                        for (var i = 0; i < mermaidBlocks.length; i++) {
                            mermaidBlocks[i].insertAdjacentHTML('beforebegin',
                                '<div class="mermaid-error">⚠️ Diagram could not be rendered. Showing code instead.</div>');
                        }
                    });
                }
            }
            
            // Update navigation buttons
            prevButton.disabled = (index === 0);
            nextButton.disabled = (index === slides.length - 1);
            
            log('Displaying slide ' + (index + 1));
        } catch (e) {
            log('Error displaying slide: ' + e.message, 'error');
            container.innerHTML = '<h1>Error displaying slide</h1>';
        }
    }
    
    // Extract speakable sentences for a slide. Phase D: prefer the build-time
    // narration (slide.sentences, extracted from Markdown tokens); fall back
    // to legacy HTML textContent extraction when the field is absent so
    // older fixtures/decks remain functional.
    function getSlideSentences(index) {
        var slide = slides[index];
        if (!slide) return [];
        if (Array.isArray(slide.sentences)) return slide.sentences;
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = slide.html;
        var text = tempDiv.textContent || tempDiv.innerText || '';
        return splitIntoSentences(text);
    }

    // Single presentation-side narration helper — BOTH modes speak (D1);
    // only the completion policy differs.
    function narrateCurrentSlide() {
        if (!isPlaying) return;
        clearEmptyDwell(); // new narration supersedes any pending empty dwell
        if (!window.speechSynthesis) {
            showNarrationStatus('Narration is not supported in this browser. Read the slide manually and use Next/Previous to continue.', true);
            return; // never start (and never complete) without synthesis
        }
        narrator.speak({
            token: currentSlide,
            sentences: getSlideSentences(currentSlide),
            onComplete: handleNarrationComplete
        });
    }

    // Defense in depth: the controller already gates stale completions;
    // verify token/session/mode here before the presentation may advance.
    // Phase D: player-owned empty-slide dwell. Ownership mirrors the
    // controller's session discipline: ONE timer variable, cleared at every
    // narration/navigation/pause entry point, and every fire re-checks a
    // generation identity guard FIRST, then playback mode, presentation
    // state, pause state, slide token and narration session before advancing
    // exactly once.
    function clearEmptyDwell() {
        emptyDwellGeneration++; // invalidate every previously scheduled callback
        if (emptyDwellTimer !== null) {
            clearTimeout(emptyDwellTimer);
            emptyDwellTimer = null;
        }
        dwellPaused = false;
    }

    function startEmptyDwell(payload) {
        emptyDwellGeneration++; // replacement invalidates previous-generation callbacks
        if (emptyDwellTimer !== null) clearTimeout(emptyDwellTimer); // never two dwells
        emptyDwellTimer = null;
        dwellPaused = false;
        var token = payload.token;
        var session = payload.session;
        var generation = emptyDwellGeneration; // ownership captured at schedule time
        emptyDwellTimer = setTimeout(function() {
            // Identity guard FIRST — before nulling or touching the handle:
            // a stale callback may neither advance the slide nor orphan the
            // live timer (Phase D corrective; do not rely on clearTimeout
            // semantics alone).
            if (generation !== emptyDwellGeneration) return;
            emptyDwellTimer = null;
            if (playbackMode !== 'auto') return; // mode guard
            if (!isPlaying) return; // presentation-state guard
            if (dwellPaused) return; // never advance a paused presentation
            if (token !== currentSlide) return; // slide-token guard
            if (session !== narrator.getState().session) return; // session guard
            if (currentSlide >= slides.length - 1) {
                showNarrationStatus('End of presentation.', false);
                log('Presentation complete');
                return;
            }
            displaySlide(currentSlide + 1); // advance exactly once
            narrateCurrentSlide();
        }, EMPTY_DWELL_MS);
    }

    function handleNarrationComplete(payload) {
        if (!payload) return;
        if (payload.token !== currentSlide) return; // completion for another slide
        if (payload.session !== narrator.getState().session) return; // stale session
        if (payload.empty) {
            // Phase D: empty slide — visible message, never a speech failure.
            log('Nothing narratable on slide ' + (currentSlide + 1));
            showNarrationStatus('No narration text on this slide — review the content manually.', false);
            if (playbackMode !== 'auto') return; // manual: remain on this slide (D1)
            if (currentSlide >= slides.length - 1) {
                showNarrationStatus('End of presentation.', false); // final slide: existing end state
                log('Presentation complete');
                return;
            }
            startEmptyDwell(payload); // auto: dwell, then advance exactly once
            return;
        }
        if (playbackMode !== 'auto') return; // manual: narrate, then stop (D1)
        if (currentSlide >= slides.length - 1) {
            showNarrationStatus('End of presentation.', false);
            log('Presentation complete');
            return;
        }
        displaySlide(currentSlide + 1); // advance exactly once
        narrateCurrentSlide();
    }
    
    // Navigation handlers — manual navigation cancels narration IMMEDIATELY
    // (both modes narrate now) and never touches the selected mode, so
    // future narration keeps working exactly as chosen.
    function nextSlide() {
        if (currentSlide < slides.length - 1) {
            clearEmptyDwell(); // navigation cancels any pending empty dwell
            narrator.stop();
            displaySlide(currentSlide + 1);
        }
    }

    function prevSlide() {
        if (currentSlide > 0) {
            clearEmptyDwell(); // navigation cancels any pending empty dwell
            narrator.stop();
            displaySlide(currentSlide - 1);
        }
    }
    
    // Adjust speed with keyboard shortcuts (Phase C: steps snap to the 0.05
    // slider grid so 1.00 is reachable from ANY starting value, and the
    // displayed value is exactly what getRate() hands the next utterance).
    function adjustSpeed(delta) {
        if (playbackMode === 'manual') return; // No speed control in manual mode

        var currentSpeed = parseFloat(speedSlider.value);
        if (isNaN(currentSpeed)) currentSpeed = 1.0;
        var newSpeed = Math.max(0.6, Math.min(1.3, Math.round((currentSpeed + delta) * 20) / 20));

        speedSlider.value = newSpeed.toFixed(2);
        speedValue.textContent = newSpeed.toFixed(2) + 'x';

        log('Speed adjusted to ' + newSpeed.toFixed(2) + 'x');
        showSpeedToast(newSpeed);
    }

    // Show speed toast notification (Phase C: state exactly WHEN it applies —
    // a speed change never interrupts the sentence currently being spoken).
    function showSpeedToast(speed) {
        var toast = document.getElementById('speed-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'speed-toast';
            document.body.appendChild(toast);
        }

        var st = narrator ? narrator.getState().status : 'idle';
        var narrating = st === 'starting' || st === 'playing' || st === 'awaiting-next';
        toast.textContent =
            'Speed: ' + speed.toFixed(2) + 'x' + (narrating ? ' — applies from the next sentence' : '');
        toast.style.opacity = '1';
        
        // Fade out after 800ms
        setTimeout(function() {
            toast.style.opacity = '0';
        }, 800);
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!isPlaying) return;
        
        // Don't handle shortcuts while typing in input fields
        var activeTag = document.activeElement.tagName;
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') {
            return;
        }
        
        if (e.key === ' ') {
            e.preventDefault();
            if (playbackMode === 'manual') {
                // In manual mode, spacebar advances slide
                nextSlide();
            } else {
                // In auto mode, spacebar toggles pause/resume
                togglePause();
            }
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextSlide();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevSlide();
        }
        // Speed shortcuts (only in auto mode)
        else if (playbackMode === 'auto') {
            if (e.key === '.' || e.key === '>') {
                e.preventDefault();
                adjustSpeed(0.05); // Phase C: slider-grid step so 1.00 stays reachable
            } else if (e.key === ',' || e.key === '<') {
                e.preventDefault();
                adjustSpeed(-0.05);
            }
        }
    });
    
    // Start presentation — BOTH modes narrate (D1); the completion policy
    // (advance once vs stop after the slide) lives in handleNarrationComplete.
    function startPresentation() {
        log('Starting presentation in ' + playbackMode + ' mode');
        startOverlay.style.display = 'none';
        navControls.classList.add('visible');
        isPlaying = true;

        populateVoices(); // refresh discovery (manual mode narrates too now)

        // Phase C: import the overlay's chosen rate into the slider (the
        // controller's rate source) in BOTH modes — manual narrates too.
        if (rateInput && speedSlider && rateInput.value) {
            speedSlider.value = rateInput.value;
            speedValue.textContent = parseFloat(rateInput.value).toFixed(2) + 'x';
            log('Synced speed: ' + parseFloat(rateInput.value).toFixed(2) + 'x');
        }

        if (playbackMode === 'auto') {
            speedControl.classList.remove('hidden');
        } else {
            speedControl.classList.add('hidden'); // legacy visibility, unchanged
        }
        // Narration controls are available in BOTH modes now:
        pauseButton.classList.remove('hidden');

        displaySlide(0);
        narrateCurrentSlide();
    }
    
    // Toggle pause/resume — delegates to the controller; button label and
    // status text sync through handleNarratorState (controller state only).
    function togglePause() {
        var st = narrator.getState().status;
        if (st === 'paused') {
            narrator.resume();
            log('Narration resumed');
        } else if (st === 'starting' || st === 'playing' || st === 'awaiting-next') {
            narrator.pause();
            log('Narration paused');
        } else if (emptyDwellTimer !== null) {
            // Phase D: the controller is idle during an empty-slide dwell —
            // pause the DWELL itself (clearing the timer means it can never
            // advance a paused presentation).
            clearEmptyDwell();
            dwellPaused = true;
            pauseButton.textContent = '▶ Resume';
            pauseButton.classList.add('paused');
            showNarrationStatus('Narration paused', false);
            log('Empty-slide dwell paused');
        } else if (dwellPaused) {
            // Resume on the same empty slide restarts the FULL dwell period.
            if (playbackMode === 'auto' && isPlaying && getSlideSentences(currentSlide).length === 0) {
                startEmptyDwell({ token: currentSlide, session: narrator.getState().session });
                pauseButton.textContent = '⏸ Pause';
                pauseButton.classList.remove('paused');
                showNarrationStatus('No narration text on this slide — review the content manually.', false);
                log('Empty-slide dwell resumed');
            } else {
                dwellPaused = false; // stale pause state; mode/slide moved on
            }
        }
        // idle / error: pause is a no-op — Play retries instead.
    }

    function onPlayPressed() {
        clearEmptyDwell(); // Play clears any pending empty dwell
        var st = narrator.getState().status;
        if (st === 'paused') {
            narrator.resume();
        } else if (st === 'idle' || st === 'error') {
            narrateCurrentSlide(); // from sentence zero; also the error retry
        }
        // already narrating: no-op
    }

    function onStopPressed() {
        clearEmptyDwell(); // Stop clears any pending empty dwell
        narrator.stop();
        if (!errorLatched) {
            showNarrationStatus('Narration stopped.', false);
        }
    }

    function onReplayPressed() {
        clearEmptyDwell(); // Replay clears any pending empty dwell
        narrateCurrentSlide(); // always from sentence zero; speak() replaces
    }

    // Player-initiated status messages (controller-driven updates use
    // handleNarratorState below).
    function showNarrationStatus(msg, isError) {
        if (!narrationStatus) return;
        narrationStatus.textContent = msg;
        if (isError) {
            narrationStatus.classList.add('error');
            errorLatched = true;
        } else {
            narrationStatus.classList.remove('error');
            errorLatched = false;
        }
    }

    // Controller state → status area + pause button. Errors latch until the
    // next narration attempt so they are never immediately overwritten by an
    // idle message.
    function handleNarratorState(s) {
        if (s.status === 'paused') {
            clearEmptyDwell(); // a paused presentation never keeps a dwell alive
            pauseButton.textContent = '▶ Resume';
            pauseButton.classList.add('paused');
        } else {
            pauseButton.textContent = '⏸ Pause';
            pauseButton.classList.remove('paused');
        }
        if (!narrationStatus) return;
        if (s.status === 'error') {
            errorLatched = true;
            narrationStatus.classList.add('error');
            narrationStatus.textContent = s.errorMessage || 'Narration failed.';
            return;
        }
        if (s.status === 'starting') {
            errorLatched = false;
            narrationStatus.classList.remove('error');
            narrationStatus.textContent = 'Starting narration...';
            return;
        }
        if (s.status === 'playing' || s.status === 'awaiting-next') {
            errorLatched = false;
            narrationStatus.classList.remove('error');
            narrationStatus.textContent = 'Narrating slide ' + (currentSlide + 1) + ' of ' + slides.length + '...';
            return;
        }
        if (s.status === 'paused') {
            errorLatched = false;
            narrationStatus.classList.remove('error');
            narrationStatus.textContent = 'Narration paused' +
                (typeof s.resumeIndex === 'number' ? ' at sentence ' + (s.resumeIndex + 1) : '') + '.';
            return;
        }
        // idle: keep an unread error visible; otherwise clear the area.
        if (errorLatched) return;
        narrationStatus.classList.remove('error');
        narrationStatus.textContent = '';
    }

    // Button handlers
    startButton.addEventListener('click', startPresentation);
    playButton.addEventListener('click', onPlayPressed);
    pauseButton.addEventListener('click', togglePause);
    stopButton.addEventListener('click', onStopPressed);
    replayButton.addEventListener('click', onReplayPressed);
    nextButton.addEventListener('click', nextSlide);
    prevButton.addEventListener('click', prevSlide);
    
    // Voice loading wrapper
    function initializeVoiceLoading() {
        // Voice discovery runs for BOTH modes (D1: manual narrates too).
        if (!window.speechSynthesis) {
            log('Speech synthesis not supported', 'error');
            updateStatus('Text-to-speech not supported in this browser', 'warning');
            voiceDiscoveryState = 'empty';
            startButton.disabled = false;
            startButton.textContent = 'Start (Manual Mode)';
            spinner.style.display = 'none';
            showNarrationStatus('Narration is not supported in this browser. Read each slide manually and use Next/Previous to continue.', true);
            return;
        }

        // Late voice arrivals flip a pending/empty discovery to 'ready'.
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = function() {
                if (populateVoices()) {
                    voiceDiscoveryState = 'ready';
                }
            };
        }

        // Wait for voices: an initially EMPTY getVoices() is not treated as
        // "no usable voice" — that verdict only lands on discovery timeout.
        waitForVoices(function(success) {
            voiceDiscoveryState = success ? 'ready' : 'empty';
            spinner.style.display = 'none';
            if (success) {
                updateStatus('Ready! ' + availableVoices.length + ' voices available', 'success');
                startButton.textContent = (playbackMode === 'manual')
                    ? 'Start (Manual Navigation)'
                    : 'Start Presentation';
            } else {
                updateStatus('Continuing with system default voice', 'warning');
                startButton.textContent = 'Start Anyway';
                showNarrationStatus('No usable voice list was found. Narration will try the browser default voice - if you hear nothing, read the slide manually.', false);
            }
            startButton.disabled = false;
        });
    }
    
    // Initialize
    log('Initializing lecture player');
    setupModeSelection();
    updateStatus('Choose playback mode above', '');
    
    // Start voice loading for auto mode (default)
    initializeVoiceLoading();
    
    log('Initialization complete');
})();
    </script>
</body>
</html>`;
}

export default renderPresentation;
