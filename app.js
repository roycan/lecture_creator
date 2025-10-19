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
        const singleHtml = createSingleHTML(slides);
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
        * { box-sizing: border-box; }
        body, html {
            height: 100%;
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #1a1a1a;
            color: #fff;
        }
        
        #slide-container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 3rem 2rem;
            overflow-y: auto;
        }
        
        #slide-container h1 { font-size: 2.5em; margin: 0.5em 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
        #slide-container h2 { font-size: 2em; margin: 0.5em 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
        #slide-container h3 { font-size: 1.5em; margin: 0.5em 0; }
        #slide-container p { font-size: 1.2em; line-height: 1.6; max-width: 800px; margin: 0.5em auto; }
        #slide-container img { max-width: 80%; max-height: 50vh; border-radius: 8px; margin: 1.5rem 0; }
        #slide-container ul, #slide-container ol { text-align: left; max-width: 600px; margin: 1em auto; font-size: 1.1em; }
        #slide-container code { background: #333; padding: 0.2em 0.4em; border-radius: 3px; }
        #slide-container pre { background: #2d2d2d; padding: 1em; border-radius: 8px; overflow-x: auto; text-align: left; }
        
        /* Start Overlay */
        #start-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.95);
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
            border: 2px solid #555;
            border-radius: 8px;
            padding: 1em;
            background: rgba(255, 255, 255, 0.03);
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
            background: rgba(255, 255, 255, 0.05);
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
            color: #fff;
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
            background: rgba(255, 255, 255, 0.05);
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
            border: 1px solid #555;
            background: #2d2d2d;
            color: #fff;
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
            border: 1px solid #555;
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
        }
    </style>
</head>
<body>
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
        </div>
    </main>
    
    <div id="nav-controls">
        <div id="progress-indicator">Slide 1 of 1</div>
        <button id="prev-button" class="nav-button">⬅ Previous</button>
        <button id="next-button" class="nav-button">Next ➡</button>
    </div>
    
    <script id="slides-data" type="application/json">${safeSlidesJson}</script>
    <script>
(function() {
    'use strict';
    
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
    var spinner = document.querySelector('.spinner');
    var voiceControlsContainer = document.getElementById('voice-controls-container');
    
    // Update rate/pitch displays
    rateInput.addEventListener('input', function() {
        rateValue.textContent = parseFloat(rateInput.value).toFixed(2) + 'x';
    });
    pitchInput.addEventListener('input', function() {
        pitchValue.textContent = parseFloat(pitchInput.value).toFixed(1);
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
                
                utterance.rate = parseFloat(rateInput.value) || 0.95;
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
        
        // Extract text for speech (auto mode only)
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = slides[index].html;
        var text = tempDiv.textContent || tempDiv.innerText || '';
        
        if (autoAdvance) {
            speakText(text, function() {
                if (isPlaying) {
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
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!isPlaying) return;
        
        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            nextSlide();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevSlide();
        }
    });
    
    // Start presentation
    function startPresentation() {
        log('Starting presentation in ' + (manualMode ? 'manual' : 'auto') + ' mode');
        startOverlay.style.display = 'none';
        navControls.classList.add('visible');
        isPlaying = true;
        
        if (!manualMode) {
            // Auto mode: enable auto-advance and try voice one more time
            autoAdvance = true;
            populateVoices();
        } else {
            // Manual mode: no auto-advance, no voice needed
            autoAdvance = false;
        }
        
        playSlide(0);
    }
    
    // Button handlers
    startButton.addEventListener('click', startPresentation);
    nextButton.addEventListener('click', nextSlide);
    prevButton.addEventListener('click', prevSlide);
    
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