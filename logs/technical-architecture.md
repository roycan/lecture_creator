# Technical Architecture

**Last Updated:** October 19, 2025  
**Scope:** Code structure, dependencies, execution flow

## File Structure

```
lecture_creator/
├── index.html       # Teacher's editor UI
├── app.js           # Application logic + export generator
├── style.css        # Optional visual styling
├── test-lecture.md  # Test content
├── README.md        # User documentation
└── logs/            # AI context restoration
```

### index.html (Editor Interface)

**Purpose:** Where teachers write and preview lectures

**Key Sections:**
- Textarea: Markdown input
- Controls panel: Voice/rate/pitch selection
- Preview button: Test before export
- Export button: Generate student file
- Output container: Live preview area

**Dependencies (CDN):**
```html
<script src="https://cdn.jsdelivr.net/npm/marked@5.1.0/marked.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
```

**Event Bindings:**
- Preview button → `speakText(markdown)`
- Export button → `createSingleHTML(markdown)`
- Voice select → Updates `speechSynthesis` utterance voice
- Window load → `populateVoiceList()` (async voice loading)

### app.js (Core Logic)

**Total Size:** ~600 lines (after October 2025 refactor)

**Key Functions:**

1. **populateVoiceList()**
   - Purpose: Load available voices from browser
   - Async handling: `speechSynthesis.onvoiceschanged`
   - US English preference: Filters by `lang.startsWith('en-US')`
   - Called: On window load + 500ms delay (Firefox compatibility)

2. **speakText(markdown)**
   - Purpose: In-app preview narration
   - Process:
     1. Parse markdown → HTML (Marked.js)
     2. Split by `<h1>` tags (each = slide)
     3. Extract text content (strip HTML)
     4. Split into sentences (regex: `. `)
     5. Chain utterances with 100ms pause between sentences
   - Uses: Selected voice/rate/pitch from UI controls

3. **createSingleHTML(markdown)**
   - **Purpose:** Generate self-contained student file
   - **Size:** ~350 lines of template
   - **Architecture:** Single HTML with embedded JSON
   - **Key technique:** Escapes slide JSON for `<script type="application/json">` embedding
   - **Called:** When "Export for Students" clicked

### app.js Architecture Deep Dive: createSingleHTML()

**Template Structure:**
```javascript
const htmlTemplate = `<!DOCTYPE html>
<html>
<head>
  <!-- Marked.js CDN -->
  <!-- Embedded CSS -->
</head>
<body>
  <div id="slideContainer"></div>
  <div id="controls">
    <button id="prevBtn">Previous</button>
    <button id="playPauseBtn">Play</button>
    <button id="nextBtn">Next</button>
  </div>
  <div id="progress">Slide 1 of X</div>
  <div id="status">Loading voices...</div>
  
  <!-- CRITICAL: Embedded slide data -->
  <script type="application/json" id="slideData">
    ${JSON.stringify(slides).replace(/</g, '\\u003c')}
  </script>
  
  <!-- Player logic -->
  <script>
    // Voice loading (3s timeout)
    // Slide rendering
    // Auto-play logic
    // Manual navigation
    // Keyboard shortcuts
    // Error handling
  </script>
</body>
</html>`;
```

**Escape Strategy:**
- JSON slides embedded as `<script type="application/json">`
- Must escape `<` to prevent closing script tag early
- Uses `.replace(/</g, '\\u003c')` for safety
- Allows slides to contain HTML/code without breaking export

**Voice Loading in Export:**
```javascript
let attempts = 0;
const checkVoices = setInterval(() => {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    clearInterval(checkVoices);
    initializePresentation();
  }
  attempts++;
  if (attempts > 30) { // 3 seconds
    clearInterval(checkVoices);
    showStatus('No voices found. Using manual mode.', 'warning');
    useManualMode = true;
    initializePresentation();
  }
}, 100);
```

**Execution Flow in Exported File:**
1. Page loads → Start voice polling (100ms intervals)
2. Voices found OR 3s timeout → `initializePresentation()`
3. Parse `#slideData` script tag → Get slides array
4. Render first slide
5. If voices available: Auto-play with "Play" button
6. If no voices: Show "Manual mode" warning, disable auto-play
7. Keyboard/button navigation always available

## Dependencies

### Marked.js v5
**Purpose:** Markdown → HTML conversion  
**Usage:**
- Editor: `marked.parse(markdown)`
- Export: Included via CDN in template
**Config:** None (defaults used)

### FileSaver.js
**Purpose:** Trigger browser download  
**Usage:** `saveAs(blob, 'lecture.html')`  
**Alternative:** Could use `<a download>` but FileSaver handles edge cases

### Web Speech API
**Purpose:** Text-to-speech  
**Browser API:** `window.speechSynthesis`  
**Challenges:**
- Async voice loading (race conditions)
- Platform-dependent quality
- file:/// URL restrictions (Linux/Chromium)
**Our handling:**
- Generous timeout (3s)
- Fallback to default voice
- Manual mode if all fails

### Removed Dependencies
- **JSZip** (removed October 18, 2025)
  - Previously: Created ZIP with HTML/CSS/slides.json
  - Reason: Complexity, CORS issues, extraction confusion

## Data Flow

### Teacher Workflow
```
1. Type markdown in textarea
2. Click "Preview" → speakText(markdown)
   - Marked.js parses → HTML
   - Text extracted, split, spoken
3. Adjust voice/rate/pitch controls
4. Click "Export" → createSingleHTML(markdown)
   - Marked.js parses → HTML
   - Split by <h1> → slides array
   - Generate HTML template
   - Embed slides as JSON
   - FileSaver.js downloads
```

### Student Workflow
```
1. Download lecture.html
2. Double-click file
3. Browser opens file:/// URL
4. JavaScript executes:
   - Load voices (3s max)
   - Parse embedded JSON
   - Render slide 1
   - Auto-play OR manual mode
5. Student listens/navigates
```

## Browser Compatibility

**Tested:**
- ✅ Chrome/Chromium (Windows/Mac): Full functionality
- ⚠️ Chrome/Chromium (Linux): Speech fails from file:/// URLs
- ✅ Firefox (all platforms): Full functionality
- ✅ Edge (Windows): Full functionality
- ⚠️ Safari (iOS/Mac): Limited voice selection

**Requirements:**
- ES5+ JavaScript (no transpilation)
- Web Speech API support
- Blob/download support

## Code Style

**Conventions:**
- Editor code (app.js): ES6 syntax OK
- Exported code: ES5 for compatibility
  - `var` instead of `const/let`
  - Function declarations, not arrows
  - No template strings

**Error Handling:**
```javascript
try {
  // Risky operation
} catch (error) {
  console.error('[Lecture Player] Operation failed:', error);
  showStatus('Error: ' + error.message, 'error');
}
```

**Logging Prefix:** `[Lecture Player]` for easy console filtering

## Performance Considerations

**Large Presentations:**
- All slides embedded in HTML (memory trade-off)
- 50+ slides may create large file (5MB+)
- No lazy loading (simplicity over optimization)

**Voice Loading:**
- 100ms polling acceptable (short lifecycle)
- 3s timeout prevents infinite hang

**Speech Synthesis:**
- Utterance queue managed by browser
- Sentence-splitting prevents single long utterance
- 100ms pause between sentences for breath

## Security Considerations

**Client-Side Only:**
- No user data sent to server
- No external APIs (except CDN for libraries)
- Markdown trusted (teacher-created)

**XSS Risk:**
- Marked.js sanitizes by default
- JSON embedding uses Unicode escape (`\u003c`)

**File System Access:**
- Downloads use FileSaver.js (user triggers)
- No arbitrary file read/write
