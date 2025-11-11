document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const markdownInput = document.getElementById('markdown-input');
    const uploadInput = document.getElementById('upload-input');
    const fileNameDisplay = document.getElementById('file-name');
    const previewWindow = document.getElementById('preview-window');
    const playButton = document.getElementById('play-button');
    const exportSingleButton = document.getElementById('export-single-button');
    // NEW: Base URL input
    const baseUrlInput = document.getElementById('base-url-input');

    let slides = [];
    let currentSlideIndex = 0;
    let isPlaying = false;

    // --- Input Handling ---

    markdownInput.addEventListener('input', processMarkdown);
    uploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                markdownInput.value = e.target.result;
                processMarkdown();
            };
            reader.readAsText(file);
            fileNameDisplay.textContent = file.name;
        }
    });

    // --- Core Logic ---

    // --- Speech / Voice Controls ---
    const voiceSelect = document.getElementById('voice-select');
    const rateInput = document.getElementById('rate-input');
    const pitchInput = document.getElementById('pitch-input');

    let availableVoices = [];
    let preferredVoice = null;

    function populateVoiceList() {
        availableVoices = speechSynthesis.getVoices() || [];
        // Clear existing
        voiceSelect.innerHTML = '';

        if (!availableVoices.length) {
            const opt = document.createElement('option');
            opt.textContent = 'No voices available';
            voiceSelect.appendChild(opt);
            return;
        }

        // Preferred voice name candidates (common desktop/browser voices)
        const preferredNames = [
            'Google US English',
            'Alloy',
            'Samantha',
            'Daniel',
            'Alex',
            'Microsoft Zira Desktop',
            'Microsoft David Desktop'
        ];

        // Try to pick a good en-US voice
        const usVoices = availableVoices.filter(v => /en(-|_)?us/i.test(v.lang) || /american/i.test(v.name));

        // Sort voices so preferred names appear first
        usVoices.sort((a, b) => {
            const aPref = preferredNames.indexOf(a.name) >= 0 ? preferredNames.indexOf(a.name) : Infinity;
            const bPref = preferredNames.indexOf(b.name) >= 0 ? preferredNames.indexOf(b.name) : Infinity;
            return aPref - bPref;
        });

        const listToShow = usVoices.length ? usVoices : availableVoices;

        listToShow.forEach((voice, i) => {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `${voice.name} — ${voice.lang}`;
            voiceSelect.appendChild(opt);
        });

        // Set preferred voice
        preferredVoice = listToShow[0] || availableVoices[0];
        voiceSelect.selectedIndex = 0;
    }

    // Some browsers load voices asynchronously
    populateVoiceList();
    if (typeof speechSynthesis !== 'undefined') {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }

    function processMarkdown() {
        const markdownText = markdownInput.value.trim();
        if (!markdownText) {
            slides = [];
            updateUI();
            return;
        }

        const html = marked.parse(markdownText);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        slides = [];
        let currentSlideContent = '';
        
        tempDiv.childNodes.forEach(node => {
            if (node.nodeName.startsWith('H') && (node.nodeName.length === 2) && currentSlideContent) {
                slides.push({ html: currentSlideContent.trim() });
                currentSlideContent = '';
            }
            currentSlideContent += node.outerHTML || node.textContent;
        });

        if (currentSlideContent) {
            slides.push({ html: currentSlideContent.trim() });
        }

        updateUI();
    }

    function updateUI() {
        const hasSlides = slides.length > 0;
        playButton.disabled = !hasSlides;
        if (exportSingleButton) exportSingleButton.disabled = !hasSlides;

        if (hasSlides) {
            previewWindow.innerHTML = slides[0].html;
        } else {
            previewWindow.innerHTML = '<p class="is-size-5">Your preview will appear here.</p>';
        }
    }

    // --- Presentation Player Logic ---

    playButton.addEventListener('click', () => {
        if (isPlaying) {
            stopPresentation();
        } else {
            startPresentation();
        }
    });
    
    function startPresentation() {
        isPlaying = true;
        playButton.innerHTML = `<span class="icon"><i class="fas fa-stop"></i></span><span>Stop</span>`;
        playButton.classList.remove('is-primary');
        playButton.classList.add('is-danger');
        currentSlideIndex = 0;
        playSlide(currentSlideIndex);
    }

    function stopPresentation() {
        isPlaying = false;
        speechSynthesis.cancel();
        playButton.innerHTML = `<span class="icon"><i class="fas fa-play"></i></span><span>Play Preview</span>`;
        playButton.classList.remove('is-danger');
        playButton.classList.add('is-primary');
        updateUI();
    }

    function playSlide(index) {
        if (!isPlaying || index >= slides.length) {
            stopPresentation();
            return;
        }
        
        const slide = slides[index];
        previewWindow.innerHTML = slide.html;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = slide.html;
        const textToSpeak = tempDiv.textContent || tempDiv.innerText || "";
        
        speakText(textToSpeak, () => {
            currentSlideIndex++;
            playSlide(currentSlideIndex);
        });
    }

    function speakText(text, onEndCallback) {
        if (!text.trim()) {
            setTimeout(onEndCallback, 3000);
            return;
        }
        // Break text into sentences to make the speech more natural and allow pauses
        const sentences = text.match(/[^\\.!?\\n]+[\\.!?]?/g) || [text];
        let i = 0;

        function speakNext() {
            if (i >= sentences.length) {
                onEndCallback();
                return;
            }
            const chunk = sentences[i].trim();
            i++;
            if (!chunk) {
                // small pause for empty chunks
                setTimeout(speakNext, 250);
                return;
            }

            const u = new SpeechSynthesisUtterance(chunk);
            // choose selected voice if available
            const selIndex = parseInt(voiceSelect.value, 10);
            const listToUse = (availableVoices.filter(v => /en(-|_)?us/i.test(v.lang) || /american/i.test(v.name))).length ? availableVoices.filter(v => /en(-|_)?us/i.test(v.lang) || /american/i.test(v.name)) : availableVoices;
            if (!isNaN(selIndex) && listToUse[selIndex]) {
                u.voice = listToUse[selIndex];
            } else if (preferredVoice) {
                u.voice = preferredVoice;
            }

            // Apply teacher-like defaults; user can tweak rate and pitch
            u.rate = parseFloat(rateInput ? rateInput.value : 0.95) || 0.95;
            u.pitch = parseFloat(pitchInput ? pitchInput.value : 1.0) || 1.0;

            u.onend = () => {
                // small natural pause between sentences
                setTimeout(speakNext, 220);
            };
            u.onerror = (e) => {
                console.error('Speech synthesis error', e);
                // continue to next chunk
                setTimeout(speakNext, 250);
            };
            speechSynthesis.speak(u);
        }

        // Start speaking the chain
        speakNext();
    }
    
    // --- Export Logic ---
    
    // Export a single HTML file with embedded slides and no external fetch
    exportSingleButton.addEventListener('click', async () => {
        const baseUrl = baseUrlInput.value.trim();
        let processedSlides = slides;

        // Prepend base URL to relative image paths if a base URL is provided
        if (baseUrl) {
            processedSlides = slides.map(slide => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = slide.html;
                
                const images = tempDiv.querySelectorAll('img');
                images.forEach(img => {
                    const src = img.getAttribute('src');
                    // Only modify relative paths, not absolute URLs
                    if (src && !src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('//')) {
                        // Using the URL constructor is a robust way to join paths
                        const absoluteUrl = new URL(src, baseUrl).href;
                        img.setAttribute('src', absoluteUrl);
                    }
                });
                
                return { html: tempDiv.innerHTML };
            });
        }

        const singleHtml = createSingleHTML(processedSlides);
        const blob = new Blob([singleHtml], { type: 'text/html;charset=utf-8' });
        saveAs(blob, 'presentation.html');
    });
    
    // Single-file HTML exporter with robust voice loading, error handling, and manual controls
    function createSingleHTML(slides) {
        // Escape </script> and other problematic content
        const safeSlidesJson = JSON.stringify(slides)
            .replace(/<\/script>/gi, '<\\/script>')
            .replace(/<script/gi, '<\\script');
        
        return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Lecture Presentation</title>
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
            background: rgba(0, 0, 0, 0.8);
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
        
        #pause-button.paused:hover {
            background: rgba(69, 160, 73, 1);
        }
        
        #pause-button.hidden {
            display: none;
        }
        
        /* Speed Control */
        .speed-control {
            background: rgba(0, 0, 0, 0.8);
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
                        <input id="rate" type="range" min="0.6" max="1.3" step="0.05" value="0.95">
                        <span id="rate-value">0.95x</span>
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
                <strong>Tip:</strong> Press <kbd>,</kbd> or <kbd>.</kbd> during playback to adjust speed
            </div>
        </div>
    </main>
    
    <div id="nav-controls">
        <div id="progress-indicator">Slide 1 of 1</div>
        <div id="speed-control" class="speed-control hidden">
            <label>
                Speed:
                <input id="speed-slider" type="range" min="0.6" max="1.3" step="0.05" value="0.95">
                <span id="speed-value">0.95x</span>
            </label>
        </div>
        <button id="pause-button" class="nav-button hidden">⏸ Pause</button>
        <button id="prev-button" class="nav-button">⬅ Previous</button>
        <button id="next-button" class="nav-button">Next ➡</button>
    </div>
    
    <script id="slides-data" type="application/json">${safeSlidesJson}</script>
    <script>
(function() {
    'use strict';
    
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
            if (theme === 'light') {
                root.setAttribute('data-theme', 'light');
                themeIcon.textContent = '🌙';
                themeText.textContent = 'Dark';
                localStorage.setItem('lecture-theme', 'light');
            } else {
                root.removeAttribute('data-theme');
                themeIcon.textContent = '☀️';
                themeText.textContent = 'Light';
                localStorage.setItem('lecture-theme', 'dark');
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
    var autoAdvance = true;
    var manualMode = false;
    var isPaused = false;
    var availableVoices = [];
    var selectedVoice = null;
    
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
    var spinner = document.querySelector('.spinner');
    var voiceControlsContainer = document.getElementById('voice-controls-container');
    var speedControl = document.getElementById('speed-control');
    var speedSlider = document.getElementById('speed-slider');
    var speedValue = document.getElementById('speed-value');
    
    // Update rate/pitch displays
    rateInput.addEventListener('input', function() {
        rateValue.textContent = parseFloat(rateInput.value).toFixed(2) + 'x';
    });
    pitchInput.addEventListener('input', function() {
        pitchValue.textContent = parseFloat(pitchInput.value).toFixed(1);
    });
    
    // Update speed display (nav controls)
    speedSlider.addEventListener('input', function() {
        speedValue.textContent = parseFloat(speedSlider.value).toFixed(2) + 'x';
    });
    
    // Setup mode selection
    function setupModeSelection() {
        var modeRadios = document.querySelectorAll('input[name="playback-mode"]');
        
        for (var i = 0; i < modeRadios.length; i++) {
            modeRadios[i].addEventListener('change', function(e) {
                manualMode = (e.target.value === 'manual');
                
                if (manualMode) {
                    // Hide voice controls
                    voiceControlsContainer.classList.add('hidden');
                    
                    // Update status and button
                    updateStatus('Manual mode selected - ready to start', 'success');
                    startButton.textContent = 'Start (Manual Navigation)';
                    startButton.disabled = false;
                    
                    // Hide spinner
                    spinner.style.display = 'none';
                    
                    log('Manual mode selected by user');
                } else {
                    // Show voice controls
                    voiceControlsContainer.classList.remove('hidden');
                    
                    // Check voice status
                    if (availableVoices.length > 0) {
                        updateStatus('Auto-play mode - ' + availableVoices.length + ' voices available', 'success');
                        startButton.textContent = 'Start Presentation';
                        startButton.disabled = false;
                        spinner.style.display = 'none';
                    } else {
                        updateStatus('Loading voices...', '');
                        startButton.textContent = 'Initializing...';
                        startButton.disabled = true;
                        spinner.style.display = 'block';
                        // Re-trigger voice loading
                        initializeVoiceLoading();
                    }
                    
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
    
    // Populate voice select
    function populateVoices() {
        try {
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
            
            // Select best voice
            selectedVoice = selectBestVoice(availableVoices);
            if (selectedVoice) {
                for (var k = 0; k < availableVoices.length; k++) {
                    if (availableVoices[k] === selectedVoice) {
                        voiceSelect.selectedIndex = k;
                        break;
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
    
    // Speak text with error handling
    function speakText(text, onComplete) {
        if (!text || !text.trim()) {
            log('Empty text, skipping speech');
            setTimeout(onComplete, 500);
            return;
        }
        
        if (!window.speechSynthesis) {
            log('Speech synthesis not available', 'warn');
            setTimeout(onComplete, 1000);
            return;
        }
        
        try {
            var sentences = splitIntoSentences(text);
            var index = 0;
            
            function speakNext() {
                if (index >= sentences.length) {
                    onComplete();
                    return;
                }
                
                var sentence = sentences[index++];
                if (!sentence.trim()) {
                    setTimeout(speakNext, 200);
                    return;
                }
                
                var utterance = new SpeechSynthesisUtterance(sentence);
                
                // Apply voice if available
                var voiceIndex = parseInt(voiceSelect.value, 10);
                if (!isNaN(voiceIndex) && availableVoices[voiceIndex]) {
                    utterance.voice = availableVoices[voiceIndex];
                } else if (selectedVoice) {
                    utterance.voice = selectedVoice;
                }
                
                // Use speed slider if available (nav controls), otherwise use rate from overlay
                utterance.rate = parseFloat(speedSlider ? speedSlider.value : (rateInput ? rateInput.value : 0.95));
                utterance.pitch = parseFloat(pitchInput.value) || 1.0;
                
                utterance.onend = function() {
                    setTimeout(speakNext, 220);
                };
                
                utterance.onerror = function(e) {
                    log('Speech error: ' + e.error, 'warn');
                    setTimeout(speakNext, 250);
                };
                
                window.speechSynthesis.speak(utterance);
            }
            
            speakNext();
        } catch (e) {
            log('Error in speakText: ' + e.message, 'error');
            setTimeout(onComplete, 500);
        }
    }
    
    // Display slide
    function displaySlide(index) {
        if (index < 0 || index >= slides.length) {
            log('Invalid slide index: ' + index, 'error');
            return;
        }
        
        currentSlide = index;
        var slide = slides[index];
        
        try {
            container.innerHTML = slide.html;
            progressIndicator.textContent = 'Slide ' + (index + 1) + ' of ' + slides.length;
            
            // Update navigation buttons
            prevButton.disabled = (index === 0);
            nextButton.disabled = (index === slides.length - 1);
            
            log('Displaying slide ' + (index + 1));
        } catch (e) {
            log('Error displaying slide: ' + e.message, 'error');
            container.innerHTML = '<h1>Error displaying slide</h1>';
        }
    }
    
    // Play slide with speech
    function playSlide(index) {
        if (index >= slides.length) {
            container.innerHTML = '<h1>End of Presentation</h1><p>Press Previous to review slides</p>';
            isPlaying = false;
            log('Presentation complete');
            return;
        }
        
        displaySlide(index);
        
        // In manual mode, just display slide and wait for user navigation
        if (manualMode) {
            log('Manual mode - waiting for user navigation (slide ' + (index + 1) + ')');
            return;
        }
        
        // Check if paused - wait for resume
        if (isPaused) {
            log('Paused - waiting for resume (slide ' + (index + 1) + ')');
            return;
        }
        
        // Extract text for speech (auto mode only)
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = slides[index].html;
        var text = tempDiv.textContent || tempDiv.innerText || '';
        
        if (autoAdvance) {
            speakText(text, function() {
                if (isPlaying && !isPaused) {
                    playSlide(index + 1);
                }
            });
        }
    }
    
    // Navigation handlers
    function nextSlide() {
        if (currentSlide < slides.length - 1) {
            if (!manualMode) {
                // In auto mode, disable auto-advance when manually overriding
                autoAdvance = false;
                window.speechSynthesis.cancel();
            }
            playSlide(currentSlide + 1);
        }
    }
    
    function prevSlide() {
        if (currentSlide > 0) {
            if (!manualMode) {
                // In auto mode, disable auto-advance when manually overriding
                autoAdvance = false;
                window.speechSynthesis.cancel();
            }
            playSlide(currentSlide - 1);
        }
    }
    
    // Adjust speed with keyboard shortcuts
    function adjustSpeed(delta) {
        if (manualMode) return; // No speed control in manual mode
        
        var currentSpeed = parseFloat(speedSlider.value);
        var newSpeed = Math.max(0.6, Math.min(1.3, currentSpeed + delta));
        
        speedSlider.value = newSpeed.toFixed(2);
        speedValue.textContent = newSpeed.toFixed(2) + 'x';
        
        log('Speed adjusted to ' + newSpeed.toFixed(2) + 'x');
        showSpeedToast(newSpeed);
    }
    
    // Show speed toast notification
    function showSpeedToast(speed) {
        var toast = document.getElementById('speed-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'speed-toast';
            document.body.appendChild(toast);
        }
        
        toast.textContent = 'Speed: ' + speed.toFixed(2) + 'x';
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
            if (manualMode) {
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
        else if (!manualMode) {
            if (e.key === '.' || e.key === '>') {
                e.preventDefault();
                adjustSpeed(0.1);
            } else if (e.key === ',' || e.key === '<') {
                e.preventDefault();
                adjustSpeed(-0.1);
            }
        }
    });
    
    // Start presentation
    function startPresentation() {
        log('Starting presentation in ' + (manualMode ? 'manual' : 'auto') + ' mode');
        startOverlay.style.display = 'none';
        navControls.classList.add('visible');
        isPlaying = true;
        isPaused = false;
        
        if (!manualMode) {
            // Auto mode: enable auto-advance and try voice one more time
            autoAdvance = true;
            populateVoices();
            
            // Sync speed slider to start overlay value
            if (rateInput && speedSlider) {
                speedSlider.value = rateInput.value;
                speedValue.textContent = parseFloat(rateInput.value).toFixed(2) + 'x';
                log('Synced speed: ' + rateInput.value + 'x');
            }
            
            // Show pause button and speed control in auto mode
            pauseButton.classList.remove('hidden');
            speedControl.classList.remove('hidden');
        } else {
            // Manual mode: no auto-advance, no voice needed
            autoAdvance = false;
            // Hide pause button and speed control in manual mode
            pauseButton.classList.add('hidden');
            speedControl.classList.add('hidden');
        }
        
        playSlide(0);
    }
    
    // Toggle pause/resume
    function togglePause() {
        if (manualMode) return; // No pause in manual mode
        
        isPaused = !isPaused;
        
        if (isPaused) {
            // Paused state
            window.speechSynthesis.cancel();
            pauseButton.textContent = '▶ Resume';
            pauseButton.classList.add('paused');
            log('Presentation paused');
        } else {
            // Resumed state
            pauseButton.textContent = '⏸ Pause';
            pauseButton.classList.remove('paused');
            log('Presentation resumed');
            // Resume playing current slide
            if (autoAdvance && currentSlide < slides.length) {
                playSlide(currentSlide);
            }
        }
    }
    
    // Button handlers
    startButton.addEventListener('click', startPresentation);
    nextButton.addEventListener('click', nextSlide);
    prevButton.addEventListener('click', prevSlide);
    pauseButton.addEventListener('click', togglePause);
    
    // Voice loading wrapper
    function initializeVoiceLoading() {
        if (manualMode) {
            log('Manual mode - skipping voice initialization');
            return;
        }
        
        if (!window.speechSynthesis) {
            log('Speech synthesis not supported', 'error');
            updateStatus('Text-to-speech not supported in this browser', 'warning');
            startButton.disabled = false;
            startButton.textContent = 'Start (Manual Mode)';
            spinner.style.display = 'none';
            return;
        }
        
        // Setup voice change listener
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = populateVoices;
        }
        
        // Wait for voices
        waitForVoices(function(success) {
            if (manualMode) return; // User switched to manual while loading
            
            spinner.style.display = 'none';
            if (success) {
                updateStatus('Ready! ' + availableVoices.length + ' voices available', 'success');
                startButton.textContent = 'Start Presentation';
            } else {
                updateStatus('Continuing with system default voice', 'warning');
                startButton.textContent = 'Start Anyway';
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

});