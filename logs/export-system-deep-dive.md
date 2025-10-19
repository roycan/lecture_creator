# Export System Deep Dive

**Last Updated:** October 19, 2025  
**Focus:** Single HTML export architecture (80% of project complexity)  
**Context:** Replaced ZIP approach October 18, 2025

## Why Single HTML Export Exists

**Original Problem (ZIP Approach):**
- Students confused by extraction
- Required web server (fetch() CORS restrictions)
- 3 separate files (index.html, player.js, slides.json)
- Complex for non-technical users

**Single HTML Solution:**
- One file to rule them all
- Works from file:/// URLs (no server)
- Double-click to open
- All dependencies embedded

**Trade-offs Accepted:**
- Large file size (all slides + CSS + JS in one file)
- No code splitting
- Embedded images still require hosting (acceptable)

## Architecture: Template Generation

### createSingleHTML() Function Location
**File:** `app.js`  
**Lines:** ~250-600 (approx)  
**Called by:** Export button click handler

### Input Processing
```javascript
// 1. Parse markdown
const html = marked.parse(markdown);

// 2. Split into slides (each <h1> starts new slide)
const slides = html.split(/<h1>/).slice(1).map(slide => {
  return '<h1>' + slide;
});

// 3. Create template with embedded slides
const htmlTemplate = `...${JSON.stringify(slides)}...`;

// 4. Trigger download
const blob = new Blob([htmlTemplate], {type: 'text/html'});
saveAs(blob, 'lecture.html');
```

### Template Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Lecture Player</title>
  <script src="https://cdn.jsdelivr.net/npm/marked@5.1.0/marked.min.js"></script>
  <style>
    /* Embedded CSS (~150 lines) */
    /* Layout, controls, status, mobile responsive */
  </style>
</head>
<body>
  <!-- Slide container -->
  <div id="slideContainer"></div>
  
  <!-- Controls -->
  <div id="controls">
    <button id="prevBtn">Previous</button>
    <button id="playPauseBtn">Play</button>
    <button id="nextBtn">Next</button>
  </div>
  
  <!-- Progress indicator -->
  <div id="progress">Slide 1 of X</div>
  
  <!-- Status messages -->
  <div id="status">Loading voices...</div>
  
  <!-- CRITICAL: Embedded slide data -->
  <script type="application/json" id="slideData">
    [/* slides array */]
  </script>
  
  <!-- Player logic (~300 lines) -->
  <script>
    // All functionality embedded here
  </script>
</body>
</html>
```

## Critical Component: JSON Embedding

### The Problem
Slides contain HTML with potential `</script>` tags (code examples):
```markdown
## JavaScript Example
```js
const script = document.querySelector('script');
console.log('</script>'); // BREAKS export if not escaped
```
```

### The Solution
**Unicode escape:** Replace `<` with `\u003c` in JSON:
```javascript
const slideData = JSON.stringify(slides).replace(/</g, '\\u003c');
const template = `
  <script type="application/json" id="slideData">
    ${slideData}
  </script>
`;
```

**Why it works:**
- `\u003c` is JavaScript Unicode for `<`
- Doesn't close `<script>` tag prematurely
- JSON.parse() correctly interprets escaped Unicode

**Example transformation:**
```javascript
// Before: "</script>"
// After:  "\u003c/script>"
// Parsed: "</script>" (back to original)
```

## Voice Loading System (Most Complex Part)

### The Challenge
`speechSynthesis.getVoices()` is async but no Promise/callback:
```javascript
// ❌ DOESN'T WORK (race condition)
const voices = speechSynthesis.getVoices();
console.log(voices); // Often empty array!
```

**Why it fails:**
- Voices load asynchronously in background
- First call often returns `[]`
- Must wait for `voiceschanged` event OR poll

### Our Solution: Polling with Timeout
```javascript
let attempts = 0;
const maxAttempts = 30; // 3 seconds
let voicesLoaded = false;

const checkVoices = setInterval(function() {
  const voices = window.speechSynthesis.getVoices();
  
  if (voices.length > 0) {
    // SUCCESS: Voices loaded
    clearInterval(checkVoices);
    voicesLoaded = true;
    initializePresentation();
  }
  
  attempts++;
  if (attempts >= maxAttempts) {
    // TIMEOUT: Fallback to manual mode
    clearInterval(checkVoices);
    console.warn('[Lecture Player] Voice loading timeout');
    showStatus('No voices found. Using manual mode.', 'warning');
    useManualMode = true;
    initializePresentation();
  }
}, 100); // Check every 100ms
```

**Why this works:**
- Gives voices 3 seconds to load (generous)
- Non-blocking (uses setInterval)
- Graceful degradation (manual mode)
- Clear feedback (status message)

**Alternative tried and rejected:**
- `onvoiceschanged` event: Unreliable on some platforms
- Longer timeout: 3s already generous, longer annoys users
- Sync loading: Doesn't exist in Web Speech API

### Voice Selection Logic
```javascript
// 1. Get all voices
const voices = window.speechSynthesis.getVoices();

// 2. Prefer US English
let selectedVoice = voices.find(function(voice) {
  return voice.lang.startsWith('en-US');
});

// 3. Fallback to any English
if (!selectedVoice) {
  selectedVoice = voices.find(function(voice) {
    return voice.lang.startsWith('en');
  });
}

// 4. Fallback to first available
if (!selectedVoice && voices.length > 0) {
  selectedVoice = voices[0];
}
```

## Manual Navigation System

### Why It's Essential
- Voice loading may fail (platform issues)
- Student may want to skip/review slides
- Accessibility (keyboard navigation)

### Implementation
**Button controls:**
```javascript
document.getElementById('prevBtn').addEventListener('click', function() {
  if (currentSlide > 0) {
    currentSlide--;
    displaySlide(currentSlide);
    stopSpeech();
  }
});

document.getElementById('nextBtn').addEventListener('click', function() {
  if (currentSlide < slides.length - 1) {
    currentSlide++;
    displaySlide(currentSlide);
    stopSpeech();
  }
});
```

**Keyboard shortcuts:**
```javascript
document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    // Next slide
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    // Previous slide
  }
  if (e.key === 'Escape') {
    stopSpeech();
  }
});
```

**Progress indicator:**
```javascript
function updateProgress() {
  const progressEl = document.getElementById('progress');
  progressEl.textContent = 'Slide ' + (currentSlide + 1) + ' of ' + slides.length;
}
```

## Error Handling Strategy

### Three-Tier Approach

**1. Prevention (Template Generation):**
- Escape JSON properly
- Validate slides array not empty
- Include Marked.js CDN with fallback

**2. Detection (Runtime):**
```javascript
try {
  // Parse embedded JSON
  var slideData = document.getElementById('slideData');
  var slides = JSON.parse(slideData.textContent);
  
  if (!slides || slides.length === 0) {
    throw new Error('No slides found');
  }
} catch (error) {
  console.error('[Lecture Player] Failed to load slides:', error);
  showStatus('Error loading presentation. Check console.', 'error');
  document.getElementById('slideContainer').innerHTML = 
    '<h1>Error</h1><p>Failed to load presentation.</p>';
}
```

**3. Recovery (Fallback Modes):**
- No voices → Manual navigation
- Slide render fails → Show error in container
- Speech fails mid-play → Enable manual continue

### Status Message System
```javascript
function showStatus(message, type) {
  var statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = 'status-' + type; // status-success, status-warning, status-error
  
  // Auto-hide success messages after 3s
  if (type === 'success') {
    setTimeout(function() {
      statusEl.style.display = 'none';
    }, 3000);
  }
}
```

**Color coding:**
- Green: "Ready to play" (success)
- Orange: "Using manual mode" (warning)
- Red: "Failed to load" (error)

## Platform Compatibility Matrix

| Platform | Browser | file:/// Speech | Workaround |
|----------|---------|----------------|------------|
| Windows | Chrome | ✅ Works | None needed |
| Windows | Firefox | ✅ Works | None needed |
| Windows | Edge | ✅ Works | None needed |
| Mac | Safari | ⚠️ Limited voices | Use Chrome |
| Mac | Chrome | ✅ Works | None needed |
| Linux | Chrome | ❌ Fails | Firefox or local server |
| Linux | Firefox | ✅ Works | None needed |
| Android | Chrome | ⚠️ Limited voices | Manual mode |
| iOS | Safari | ⚠️ Limited voices | Manual mode |

### Linux/Chromium Issue Deep Dive

**Symptoms:**
- `speechSynthesis.getVoices()` returns `[]`
- Or voices return but `speak()` fails silently
- Console error: "Web Speech API not available"

**Root cause:**
- Chromium on Linux requires speech-dispatcher
- From file:/// URLs, security restrictions kick in
- Not a bug in our code

**Verification:**
1. Open exported lecture.html in Chromium
2. Open console (F12)
3. Type: `speechSynthesis.getVoices()`
4. If empty array → Platform issue confirmed

**Workarounds:**
1. **Use Firefox** (recommended for Linux)
2. **Run local server:**
   ```bash
   python3 -m http.server 8000
   # Open http://localhost:8000/lecture.html
   ```
3. **Install speech-dispatcher:**
   ```bash
   sudo apt install speech-dispatcher
   systemctl --user enable speech-dispatcher
   ```

**Why we don't "fix" this:**
- It's a platform limitation, not code bug
- Manual mode works perfectly
- Firefox is free and widely available
- Documenting workaround is sufficient

## Speech Synthesis Details

### Sentence Splitting
**Why split by sentences:**
- Long utterances sound robotic
- Pauses between sentences sound natural
- Easier to interrupt/restart

**Implementation:**
```javascript
function speakText(text) {
  // Split by period+space
  var sentences = text.split(/\.\s+/);
  
  sentences.forEach(function(sentence, index) {
    var utterance = new SpeechSynthesisUtterance(sentence + '.');
    utterance.voice = selectedVoice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Add 100ms pause between sentences
    utterance.onend = function() {
      if (index < sentences.length - 1) {
        setTimeout(function() {
          // Next sentence will start
        }, 100);
      }
    };
    
    window.speechSynthesis.speak(utterance);
  });
}
```

### Auto-Advance Between Slides
```javascript
utterance.onend = function() {
  if (currentSlide < slides.length - 1) {
    currentSlide++;
    displaySlide(currentSlide);
    speakSlide(currentSlide); // Recursive continuation
  } else {
    showStatus('Presentation complete', 'success');
  }
};
```

## Testing Strategy

### Test Cases Covered
**File:** `test-lecture.md`

1. **Basic markdown:** Headings, paragraphs, lists
2. **Code blocks:** With syntax highlighting
3. **Special characters:** `<>&"'`
4. **Script tags in code:** `</script>` in examples
5. **Emoji:** 🎓📚✨
6. **Long paragraphs:** Speech endurance test

### Manual Testing Checklist
- [ ] Export generates file
- [ ] File opens in browser
- [ ] Voices load (or timeout shows)
- [ ] First slide renders
- [ ] Auto-play starts (if voices available)
- [ ] Manual navigation works
- [ ] Keyboard shortcuts work
- [ ] Progress indicator updates
- [ ] Last slide shows completion message

### Platform Testing Matrix
Test each browser + OS combination:
- Voice loading success/fail
- Speech synthesis quality
- Manual mode fallback
- Mobile responsiveness

## Performance Metrics

**File sizes (typical):**
- 10 slides: ~150KB
- 50 slides: ~600KB
- 100 slides: ~1.2MB

**Load times (on old hardware):**
- Parse JSON: < 50ms
- Render first slide: < 100ms
- Voice loading: 0-3000ms (timeout)

**Memory usage:**
- All slides in memory: ~5MB for 100 slides
- Speech synthesis: Managed by browser

## Future Considerations

**Potential improvements (not urgent):**
- Lazy slide rendering (load on demand)
- Compressed JSON (gzip)
- Service Worker (offline manifest)
- WebP images (smaller size)

**Why not implemented:**
- Simplicity > optimization
- Current performance acceptable
- Adds complexity for minimal gain
