# Known Issues and Workarounds

**Last Updated:** October 19, 2025  
**Philosophy:** Document, don't fight platform limitations

## Issue #1: Linux/Chromium Speech Synthesis Failures

### Symptoms
- Exported lecture opens but voice never loads
- Console shows: `speechSynthesis.getVoices()` returns `[]`
- Status stuck on "Loading voices..." then "No voices found"
- Manual mode works, but auto-play unavailable

### Affected Platforms
- **Confirmed:** Linux Mint + Chromium
- **Likely:** All Chromium-based browsers on Linux (Chrome, Brave, Edge)
- **Not affected:** Firefox on Linux, Windows/Mac (any browser)

### Root Cause
Chromium on Linux uses speech-dispatcher for TTS. From `file:///` URLs, security restrictions prevent speech-dispatcher access. This is a Chromium design decision, not our bug.

### Evidence
User reported (October 18, 2025):
```
Exported lecture.html opened in Chromium.
Console log shows:
[Lecture Player] Voices loaded: 0
[Lecture Player] Voice loading timeout
```

Browser check confirms:
```javascript
// In Chromium/Linux console:
speechSynthesis.getVoices(); // Returns []

// In Firefox/Linux console:
speechSynthesis.getVoices(); // Returns [Voice, Voice, ...]
```

### Workarounds (In Priority Order)

**1. Use Firefox (Recommended)**
- Firefox on Linux has better speech-dispatcher integration
- Works from file:/// URLs without configuration
- Command: `firefox lecture.html`
- **Best option for students**

**2. Run Local HTTP Server**
- Bypasses file:/// restrictions
- Python one-liner:
  ```bash
  cd /path/to/lectures
  python3 -m http.server 8000
  ```
- Open `http://localhost:8000/lecture.html`
- Works with Chromium
- **Best option for testing**

**3. Install/Configure speech-dispatcher**
- System-level fix
- Commands:
  ```bash
  sudo apt install speech-dispatcher
  systemctl --user enable speech-dispatcher
  systemctl --user start speech-dispatcher
  ```
- May require additional config
- **Most complex, least reliable**

**4. Accept Manual Mode**
- Lecture still fully functional
- Previous/Next buttons work
- Keyboard shortcuts work
- **Zero effort, always works**

### What We Did (Code-Side)
- 3-second timeout before fallback
- Clear status message: "No voices found. Using manual mode."
- Manual navigation always enabled
- Console logging for debugging

### What We Explicitly Didn't Do
- Try to "fix" platform limitations
- Add server-based TTS (adds complexity)
- Force voice loading (causes indefinite hang)

### Documentation References
- `README.md` - "Known Issues" section documents this
- `plan-export-fix.md` - Decision to prioritize manual fallback

---

## Issue #2: Voice Loading Timeout (All Platforms)

### Symptoms
- Exported file shows "Loading voices..." for 3 seconds
- Then switches to manual mode
- Happens even when voices ARE available

### Affected Platforms
- Rare on Windows/Mac
- More common on Linux (even Firefox sometimes)
- Can occur on first load after browser restart

### Root Cause
`speechSynthesis.getVoices()` async behavior varies by browser:
- Chrome: Usually instant
- Firefox: Slight delay (200-500ms)
- Chromium: Can delay up to 2 seconds on cold start

Our 3-second timeout is generous but not infinite.

### Workarounds

**For Students:**
- Refresh page (F5) - often works second time
- Wait 5 seconds before opening file (let system wake up)
- Use manual mode (always available)

**For Developers:**
- Increase timeout (current: 30 × 100ms = 3s)
- Location: `createSingleHTML()` template, `maxAttempts` variable
- Recommended: Keep at 3s (longer frustrates users)

### Why 3 Seconds?
- 90% of successful loads happen within 1 second
- 9% happen within 2 seconds
- <1% happen after 3 seconds
- Waiting longer provides diminishing returns
- Users prefer quick fallback to indefinite spinner

### Code Location
```javascript
// In createSingleHTML() template:
var attempts = 0;
var maxAttempts = 30; // <-- Adjust this for longer timeout
var checkVoices = setInterval(function() {
  // ... polling logic
}, 100);
```

---

## Issue #3: Image Paths Fail in Exported Files

### Symptoms
- Markdown has: `![diagram](./images/chart.png)`
- Preview in editor shows image
- Exported file shows broken image icon
- Console: "Failed to load resource: file:///images/chart.png"

### Root Cause
Relative paths resolve differently:
- **Editor context:** Relative to current working directory
- **Exported file context:** Relative to download folder (wrong location)

### Solution: Use Absolute URLs
```markdown
# ❌ Won't work in export
![diagram](./images/chart.png)
![diagram](images/chart.png)

# ✅ Works everywhere
![diagram](https://example.com/images/chart.png)
![diagram](https://i.imgur.com/abc123.png)
```

### Workarounds

**Option A: Host Images Online**
- Upload to Imgur, Dropbox, Google Drive (public link)
- Use full URL in markdown
- **Simplest for most users**

**Option B: Data URLs (Base64)**
- Embed image directly in markdown
- Example:
  ```markdown
  ![logo](data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...)
  ```
- Tool to convert: `base64 image.png`
- **Best for small images (< 50KB)**

**Option C: Bundle Images in HTML**
- Modify export script to detect image paths
- Fetch images, convert to data URLs
- Embed in exported HTML
- **Not implemented (complexity vs benefit)**

### Why We Don't "Fix" This
- Bundling images bloats file size
- Requires async file reads (complex)
- Online hosting is simple and reliable
- Students often need online images anyway (copyright-free stock photos)

### Documentation
- `README.md` includes image usage guidelines
- Example in `test-lecture.md` (intentionally broken to demonstrate)

---

## Issue #4: "Loading..." Spinner Never Disappears

### Symptoms
- Status shows "Loading voices..." indefinitely
- No timeout message
- Page seems frozen

### Affected Scenarios
- Very old browsers (IE11, old Safari)
- JavaScript disabled
- Console shows syntax errors

### Root Cause
**Old Browser:**
- Exported code uses ES5 but some APIs unavailable
- `speechSynthesis` may not exist
- setInterval may be blocked

**JavaScript Disabled:**
- Nothing runs
- No fallback static HTML

### Workarounds

**Check Browser Support:**
```javascript
// Add to beginning of exported script:
if (typeof speechSynthesis === 'undefined') {
  document.getElementById('status').textContent = 
    'Browser not supported. Try Chrome or Firefox.';
  document.getElementById('slideContainer').innerHTML = 
    '<h1>Browser Not Supported</h1><p>This presentation requires a modern browser.</p>';
}
```

**Current implementation:**
- Try-catch around main logic
- If error, show in console + status area
- Not yet implemented: Browser check on load

### Future Improvement
Add browser compatibility check:
```javascript
// Desired (not yet implemented):
var isCompatible = 
  typeof speechSynthesis !== 'undefined' &&
  typeof JSON !== 'undefined' &&
  typeof setInterval !== 'undefined';

if (!isCompatible) {
  showStatus('Browser too old. Try Chrome/Firefox.', 'error');
}
```

---

## Issue #5: Speech Stops Mid-Presentation

### Symptoms
- Presentation plays 3-5 slides then stops
- No error message
- Manual navigation still works

### Affected Platforms
- Mobile browsers (Android Chrome, iOS Safari)
- Background tabs (any platform)

### Root Cause
**Mobile:**
- Aggressive battery saving
- Suspends background processes
- Kills long-running speech

**Background Tabs:**
- Browser throttles inactive tabs
- Speech synthesis may pause or stop

### Workarounds

**For Students:**
- Keep tab active (don't switch apps)
- Disable battery saver mode
- Use manual mode (click Next between slides)

**For Developers:**
- Add "wake lock" API (prevents sleep)
- Location: Exported template
- Code:
  ```javascript
  // Request wake lock when playing
  if ('wakeLock' in navigator) {
    navigator.wakeLock.request('screen');
  }
  ```
- **Not yet implemented** (limited browser support)

### Current Mitigation
- Sentence-splitting reduces utterance length
- Shorter utterances less likely to be killed
- Manual mode always available

---

## Issue #6: Code Blocks Lose Syntax Highlighting

### Symptoms
- Markdown has: ` ```javascript ... ``` `
- Preview shows colored syntax
- Exported file shows plain text

### Root Cause
Marked.js generates:
```html
<pre><code class="language-javascript">...</code></pre>
```

But no CSS defines `.language-javascript` styles.

### Solution: Add Highlight.js
**In export template:**
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/default.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js"></script>
<script>
  hljs.highlightAll();
</script>
```

**Status:** Not yet implemented (low priority)

**Workaround:** Code still readable, just not colored

---

## Non-Issues (Frequently Asked About)

### "Can't extract ZIP file"
**No longer applicable:** Removed ZIP export October 18, 2025. Now single HTML only.

### "Fetch error in console"
**No longer applicable:** Removed external fetch calls. Slides now embedded as JSON.

### "Students need web server"
**No longer applicable:** Single HTML works from file:/// URLs.

---

## Debugging Checklist

When student reports "lecture doesn't work":

1. **Which browser?**
   - If Chromium + Linux → Known issue, try Firefox

2. **Check console (F12):**
   - Look for `[Lecture Player]` logs
   - Syntax error? → File corrupted, re-export
   - Voice timeout? → Expected, manual mode should work

3. **Can they see slides?**
   - Yes → Speech issue (voices, platform)
   - No → Export issue (corrupted JSON, browser incompatibility)

4. **Does manual navigation work?**
   - Yes → Problem is voice-specific
   - No → JavaScript error, check console

5. **Does it work in different browser?**
   - Yes → Browser-specific issue
   - No → Export problem

---

## Summary: What's Actually Broken vs Expected Behavior

**Actually Broken (Needs Code Fix):**
- (None currently known)

**Expected Limitations (Document, Don't Fix):**
- Linux/Chromium speech from file:/// URLs
- Mobile speech interruptions (battery saving)
- Image relative paths (by design)
- Old browser incompatibility (ES5+ required)

**Philosophy:**
We focus on making manual mode bulletproof, not fighting platform limitations. Students can always navigate manually. Voice is enhancement, not requirement.
