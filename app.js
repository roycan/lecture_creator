document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const markdownInput = document.getElementById('markdown-input');
    const uploadInput = document.getElementById('upload-input');
    const fileNameDisplay = document.getElementById('file-name');
    const previewWindow = document.getElementById('preview-window');
    const playButton = document.getElementById('play-button');
    const exportButton = document.getElementById('export-button');
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
        exportButton.disabled = !hasSlides;

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
        const sentences = text.match(/[^\.!?\n]+[\.!?]?/g) || [text];
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
    
    // --- Export Logic (MODIFIED) ---
    
    exportButton.addEventListener('click', async () => {
        const baseUrl = baseUrlInput.value.trim();
        let processedSlides = slides;

        // NEW: Prepend base URL to relative image paths if a base URL is provided
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
        // END OF NEW LOGIC

        const zip = new JSZip();

        // 1. Create slides.json using the (potentially modified) slide data
        zip.file("slides.json", JSON.stringify(processedSlides, null, 2));

        // 2. Create index.html (the player)
        zip.file("index.html", createPlayerHTML());

        // 3. Create style.css for the player
        zip.file("style.css", createPlayerCSS());

        // 4. Generate and download the zip
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "slideshow-presentation.zip");
    });
    
    function createPlayerHTML() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presentation</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <main id="slide-container">
        <div id="start-overlay">
            <button id="start-button">Click to Start</button>
        </div>
    </main>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // Voice UI inside exported player
            const overlay = document.getElementById('start-overlay');
            const startButton = document.getElementById('start-button');
            const voiceContainer = document.createElement('div');
            voiceContainer.style.margin = '12px 0';
            voiceContainer.innerHTML = '<label style="display:block;margin-bottom:6px;">Voice</label><select id="export-voice-select"></select><div style="display:flex;gap:8px;margin-top:8px;"><label style="flex:1">Rate<input id="export-rate" type="range" min="0.6" max="1.3" step="0.05" value="0.95" style="width:100%"></label><label style="flex:1">Pitch<input id="export-pitch" type="range" min="0.6" max="1.5" step="0.05" value="1.0" style="width:100%"></label></div>';
            overlay.querySelector('#start-button').insertAdjacentElement('afterend', voiceContainer);

            const container = document.getElementById('slide-container');
            const startOverlay = document.getElementById('start-overlay');
            let slides = [];
            let currentSlideIndex = 0;

            // Populate voices for exported player
            const exportVoiceSelect = document.getElementById('export-voice-select');
            const exportRate = document.getElementById('export-rate');
            const exportPitch = document.getElementById('export-pitch');

            function populateExportVoices() {
                const voices = speechSynthesis.getVoices() || [];
                exportVoiceSelect.innerHTML = '';
                if (!voices.length) {
                    const o = document.createElement('option');
                    o.textContent = 'No voices available';
                    exportVoiceSelect.appendChild(o);
                    return;
                }
                const us = voices.filter(v => /en(-|_)?us/i.test(v.lang) || /american/i.test(v.name));
                const list = us.length ? us : voices;
                list.forEach((v,i) => {
                    const opt = document.createElement('option');
                    opt.value = i;
                    opt.textContent = '\${v.name} — \${v.lang}';
                    exportVoiceSelect.appendChild(opt);
                });
            }
            populateExportVoices();
            if (typeof speechSynthesis !== 'undefined') speechSynthesis.onvoiceschanged = populateExportVoices;

            async function loadSlides() {
                const response = await fetch('slides.json');
                slides = await response.json();
                startButton.disabled = false;
                startButton.textContent = 'Click to Start Presentation';
            }

            function playSlide(index) {
                if (index >= slides.length) {
                    container.innerHTML = '<h1>End of Presentation</h1>';
                    return;
                }
                const slide = slides[index];
                container.innerHTML = slide.html;

                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = slide.html;
                const textToSpeak = tempDiv.textContent || "";
                
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
                const sentences = text.match(/[^\.!?\n]+[\.!?]?/g) || [text];
                let i = 0;
                function speakNext() {
                    if (i >= sentences.length) {
                        onEndCallback();
                        return;
                    }
                    const chunk = sentences[i++].trim();
                    if (!chunk) { setTimeout(speakNext, 200); return; }
                    const u = new SpeechSynthesisUtterance(chunk);
                    const voices = speechSynthesis.getVoices() || [];
                    const us = voices.filter(v => /en(-|_)?us/i.test(v.lang) || /american/i.test(v.name));
                    const list = us.length ? us : voices;
                    const sel = parseInt(exportVoiceSelect.value, 10);
                    if (!isNaN(sel) && list[sel]) u.voice = list[sel];
                    u.rate = parseFloat(exportRate.value) || 0.95;
                    u.pitch = parseFloat(exportPitch.value) || 1.0;
                    u.onend = () => setTimeout(speakNext, 220);
                    u.onerror = () => setTimeout(speakNext, 250);
                    speechSynthesis.speak(u);
                }
                speakNext();
            }

            startButton.addEventListener('click', () => {
                startOverlay.style.display = 'none';
                playSlide(0);
            });

            loadSlides();
        });
    <\/script>
</body>
</html>`;
    }

    function createPlayerCSS() {
        return `body, html { margin: 0; padding: 0; width: 100%; height: 100%; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
#slide-container { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background-color: #222; color: white; padding: 2rem; box-sizing: border-box; overflow: auto; }
#slide-container h1, #slide-container h2 { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
#slide-container img { max-width: 80%; max-height: 40vh; margin-top: 1rem; border-radius: 8px; }
#start-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 10; }
#start-button { font-size: 2rem; padding: 1rem 2rem; cursor: pointer; border-radius: 10px; border: none; }`;
    }

});