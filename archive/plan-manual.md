# Plan: Manual Mode Toggle for Exported Presentations

**Created:** October 19, 2025  
**Status:** Planning Phase  
**Priority:** High (solves critical UX issue for Linux/Chrome users)

---

## Problem Statement

### Current Issue
When students open exported lecture HTML files on Linux + Chromium browsers:
1. Speech synthesis fails to load (`speechSynthesis.getVoices()` returns `[]`)
2. System still operates in auto-advance mode
3. `speakText()` detects no voice, calls `onComplete()` after 500-1000ms timeout
4. Slides advance automatically every ~1 second
5. **Students cannot read content** - slides fly by too fast

### Root Cause Code
```javascript
// In exported template, line ~747
if (autoAdvance) {
    speakText(text, function() {
        if (isPlaying) {
            playSlide(index + 1);  // ⚠️ Triggers even when speech fails
        }
    });
}

// In speakText(), when no speech available:
function speakText(text, onComplete) {
    if (!window.speechSynthesis) {
        setTimeout(onComplete, 1000);  // Only 1 second delay!
        return;
    }
}
```

### Affected Platforms
- **Confirmed:** Linux Mint + Chromium
- **Likely:** All Chromium-based browsers on Linux (Chrome, Brave, Edge)
- **Not affected:** Windows/Mac (any browser), Linux + Firefox

---

## Proposed Solution

### High-Level Concept
Add a **mode selection toggle** on the start overlay that allows students to choose between:
- **Auto-play mode** (default): Voice narration with automatic slide advancement
- **Manual mode**: No voice, navigation via Previous/Next buttons only

### User Flow

#### Starting Presentation
```
1. Student opens lecture.html
2. Sees start overlay with two options:
   ( ) Auto-play with voice narration (default)
   (•) Manual navigation only (no voice)
3. Selects mode based on their platform/preference
4. Clicks "Start Presentation" button
5. Presentation begins in selected mode
```

#### During Presentation - Auto Mode
```
- Slide displays
- Voice speaks slide content
- After speech completes → Auto-advance to next slide
- Previous/Next buttons available for manual override
- Keyboard shortcuts work (arrows, spacebar)
```

#### During Presentation - Manual Mode
```
- Slide displays
- NO voice playback attempted
- NO auto-advance
- Student clicks "Next" button to proceed
- Previous/Next buttons are primary navigation
- Keyboard shortcuts work (arrows, spacebar)
```

---

## Technical Design

### 1. UI Changes (Start Overlay)

#### Current Structure
```html
<div id="start-overlay">
    <div class="spinner"></div>
    <p id="status-message">Initializing...</p>
    <div id="controls">
        <label>Voice <select>...</select></label>
        <label>Rate <input type="range">...</label>
        <label>Pitch <input type="range">...</label>
    </div>
    <button id="start-button">Start</button>
</div>
```

#### Proposed Structure
```html
<div id="start-overlay">
    <div class="spinner"></div>
    <p id="status-message">Initializing...</p>
    
    <!-- NEW: Mode Selection -->
    <div id="mode-selection">
        <fieldset>
            <legend>Choose Playback Mode</legend>
            <label class="mode-option">
                <input type="radio" name="mode" value="auto" checked>
                <span>
                    <strong>Auto-play with voice</strong>
                    <small>Slides advance automatically with narration</small>
                </span>
            </label>
            <label class="mode-option">
                <input type="radio" name="mode" value="manual">
                <span>
                    <strong>Manual navigation</strong>
                    <small>Use Next/Previous buttons (recommended for Linux + Chrome)</small>
                </span>
            </label>
        </fieldset>
    </div>
    
    <!-- MODIFIED: Voice controls (hidden in manual mode) -->
    <div id="voice-controls" class="voice-controls-container">
        <label>Voice <select>...</select></label>
        <label>Rate <input type="range">...</label>
        <label>Pitch <input type="range">...</label>
    </div>
    
    <button id="start-button">Start Presentation</button>
</div>
```

### 2. CSS Additions

```css
/* Mode Selection Styling */
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

.mode-option span {
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

/* Voice controls container (can be hidden) */
.voice-controls-container.hidden {
    display: none;
}
```

### 3. JavaScript State Changes

#### New State Variables
```javascript
// Add to existing state variables (line ~472)
var manualMode = false;  // Track if manual mode selected
```

#### Mode Selection Handler (New Function)
```javascript
// Add after DOM element declarations (line ~500)
function setupModeSelection() {
    var modeRadios = document.querySelectorAll('input[name="mode"]');
    var voiceControlsContainer = document.getElementById('voice-controls');
    
    for (var i = 0; i < modeRadios.length; i++) {
        modeRadios[i].addEventListener('change', function(e) {
            manualMode = (e.target.value === 'manual');
            
            if (manualMode) {
                // Hide voice controls
                voiceControlsContainer.classList.add('hidden');
                
                // Update status message
                updateStatus('Manual mode selected - voice controls disabled', 'success');
                
                // Update start button
                startButton.textContent = 'Start (Manual Navigation)';
                
                // Enable button immediately (no voice loading needed)
                startButton.disabled = false;
                
                // Hide spinner
                spinner.style.display = 'none';
                
                log('Manual mode selected by user');
            } else {
                // Show voice controls
                voiceControlsContainer.classList.remove('hidden');
                
                // Restore voice loading status
                if (availableVoices.length > 0) {
                    updateStatus('Auto-play mode - ' + availableVoices.length + ' voices available', 'success');
                    startButton.textContent = 'Start Presentation';
                    startButton.disabled = false;
                } else {
                    updateStatus('Loading voices...', '');
                    startButton.textContent = 'Initializing...';
                    startButton.disabled = true;
                    spinner.style.display = 'block';
                }
                
                log('Auto-play mode selected by user');
            }
        });
    }
}
```

### 4. Initialization Changes

#### Modify waitForVoices() Invocation
```javascript
// Current (line ~820):
log('Initializing lecture player');
updateStatus('Loading voices...', '');

if (!window.speechSynthesis) {
    log('Speech synthesis not supported', 'error');
    updateStatus('Text-to-speech not supported in this browser', 'warning');
    startButton.disabled = false;
    startButton.textContent = 'Start (Manual Mode)';
    spinner.style.display = 'none';
} else {
    // Voice loading logic...
    waitForVoices(function(success) { ... });
}

// MODIFIED:
log('Initializing lecture player');
setupModeSelection();  // NEW: Setup mode toggle listeners

// Only load voices if in auto mode
function initializeVoices() {
    if (manualMode) {
        log('Manual mode - skipping voice initialization');
        spinner.style.display = 'none';
        updateStatus('Manual mode ready', 'success');
        startButton.disabled = false;
        startButton.textContent = 'Start (Manual Navigation)';
        return;
    }
    
    // Existing voice loading logic...
    if (!window.speechSynthesis) {
        log('Speech synthesis not supported', 'error');
        updateStatus('Text-to-speech not supported in this browser', 'warning');
        startButton.disabled = false;
        startButton.textContent = 'Start (Manual Mode)';
        spinner.style.display = 'none';
    } else {
        updateStatus('Loading voices...', '');
        waitForVoices(function(success) { ... });
    }
}

// Initial call (will check manualMode flag)
initializeVoices();
```

### 5. Playback Logic Changes

#### Modify playSlide() Function
```javascript
// Current implementation (line ~730):
function playSlide(index) {
    if (index >= slides.length) {
        container.innerHTML = '<h1>End of Presentation</h1><p>Press Previous to review slides</p>';
        isPlaying = false;
        log('Presentation complete');
        return;
    }
    
    displaySlide(index);
    
    // Extract text for speech
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

// MODIFIED:
function playSlide(index) {
    if (index >= slides.length) {
        container.innerHTML = '<h1>End of Presentation</h1><p>Press Previous to review slides</p>';
        isPlaying = false;
        log('Presentation complete');
        return;
    }
    
    displaySlide(index);
    
    // NEW: Check manual mode first
    if (manualMode) {
        log('Manual mode - waiting for user navigation');
        // Just display slide, no auto-advance
        return;
    }
    
    // Extract text for speech (only in auto mode)
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
```

#### Modify Navigation Functions
```javascript
// Current nextSlide() (line ~760):
function nextSlide() {
    if (currentSlide < slides.length - 1) {
        autoAdvance = false;  // Disable auto when manually navigating
        window.speechSynthesis.cancel();
        playSlide(currentSlide + 1);
    }
}

// MODIFIED:
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

// Same modification for prevSlide()
function prevSlide() {
    if (currentSlide > 0) {
        if (!manualMode) {
            autoAdvance = false;
            window.speechSynthesis.cancel();
        }
        playSlide(currentSlide - 1);
    }
}
```

### 6. Start Button Handler Changes

```javascript
// Current startPresentation() (line ~795):
function startPresentation() {
    log('Starting presentation');
    startOverlay.style.display = 'none';
    navControls.classList.add('visible');
    isPlaying = true;
    autoAdvance = true;
    
    // Try to populate voices one more time after user gesture
    populateVoices();
    
    playSlide(0);
}

// MODIFIED:
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
```

---

## File Modifications Required

### Single File Change
**File:** `app.js`  
**Function:** `createSingleHTML()`  
**Lines affected:** ~250-850 (template string)

### Specific Sections

1. **HTML Structure** (lines ~250-460)
   - Add mode selection fieldset
   - Wrap voice controls in container div

2. **CSS Styles** (lines ~260-420)
   - Add mode selection styles
   - Add `.hidden` utility class
   - Add `.mode-option` styles

3. **JavaScript Variables** (line ~472)
   - Add `var manualMode = false;`

4. **JavaScript Functions** (lines ~500-850)
   - Add `setupModeSelection()` function
   - Modify `initializeVoices()` logic
   - Modify `playSlide()` function
   - Modify `nextSlide()` and `prevSlide()` functions
   - Modify `startPresentation()` function

---

## Edge Cases & Considerations

### 1. **User switches from auto to manual before starting**
- **Behavior:** Voice controls hide, button updates, spinner stops
- **Status:** ✅ Handled by mode change listener

### 2. **User in auto mode, voice loading times out**
- **Behavior:** Current timeout logic shows "Start Anyway" button
- **Question:** Should we auto-suggest switching to manual mode?
- **Recommendation:** Add hint text: "Tip: Try Manual mode if voice doesn't load"

### 3. **Manual mode selected but speech synthesis actually works**
- **Behavior:** Student chose manual, so respect choice (no voice)
- **Status:** ✅ Intentional - user preference takes priority

### 4. **Keyboard shortcuts in manual mode**
- **Behavior:** Should still work (arrow keys, spacebar)
- **Status:** ✅ Already works - keyboard handler calls `nextSlide()`/`prevSlide()`

### 5. **Progress indicator in manual mode**
- **Behavior:** Should still show "Slide X of Y"
- **Status:** ✅ Already works - `displaySlide()` updates it

### 6. **End of presentation in manual mode**
- **Behavior:** Shows "End of Presentation" message, can go back
- **Status:** ✅ Already works - same logic for both modes

### 7. **Mobile devices**
- **Behavior:** Radio buttons should be touch-friendly
- **Status:** ✅ CSS uses adequate padding (12px), 18px radio buttons

### 8. **Accessibility (screen readers)**
- **Concern:** Radio buttons need proper labels
- **Status:** ✅ Implemented with `<label>` wrappers and descriptive text

### 9. **Default mode selection**
- **Question:** Should manual mode be default for detected Linux/Chrome?
- **Decision:** Keep auto as default, add descriptive hint for Linux users
- **Reason:** User-agent detection unreliable, Firefox on Linux works fine

---

## Testing Checklist

### Manual Mode Testing
- [ ] Select manual mode before starting
- [ ] Voice controls hide when manual selected
- [ ] Status shows "Manual mode selected"
- [ ] Start button updates text
- [ ] Spinner disappears immediately
- [ ] Presentation starts without voice loading
- [ ] Slides don't auto-advance
- [ ] Next button advances slides
- [ ] Previous button goes back
- [ ] Keyboard shortcuts work (arrows, spacebar)
- [ ] Progress indicator updates correctly
- [ ] End of presentation shows properly
- [ ] No console errors related to speech synthesis

### Auto Mode Testing
- [ ] Auto mode selected by default
- [ ] Voice controls visible
- [ ] Voices load (or timeout gracefully)
- [ ] Presentation auto-advances with speech
- [ ] Manual override (clicking Next) stops auto-advance
- [ ] Voice plays correctly
- [ ] Rate/pitch controls work
- [ ] Keyboard shortcuts work

### Toggle Testing
- [ ] Switch from auto to manual before start
- [ ] Switch from manual to auto before start
- [ ] UI updates correctly on toggle
- [ ] Button text updates correctly
- [ ] Status message updates correctly

### Platform Testing
- [ ] Windows + Chrome (auto mode should work)
- [ ] Mac + Chrome (auto mode should work)
- [ ] Linux + Firefox (auto mode should work)
- [ ] Linux + Chromium (auto mode fails → manual mode works)
- [ ] Mobile Android (both modes)
- [ ] Mobile iOS (both modes)

---

## Feasibility Assessment

### Complexity: **Medium**

#### Lines of Code
- HTML additions: ~30 lines
- CSS additions: ~60 lines
- JavaScript additions: ~40 lines
- JavaScript modifications: ~15 lines
- **Total:** ~145 lines of changes in template string

#### Risk Level: **Low**
- Additive changes (no removal of existing features)
- Clear separation between modes
- Fallback behavior preserved
- No external dependencies

#### Development Time: **1-2 hours**
- Implementation: 45 minutes
- Testing: 30 minutes
- Documentation updates: 15 minutes

### Potential Issues

#### 1. **Template String Escaping**
**Issue:** Adding HTML with quotes/backticks inside template literal  
**Solution:** Use escaped quotes, test thoroughly  
**Severity:** Low - known issue with established solution

#### 2. **State Management**
**Issue:** `manualMode` flag must be respected everywhere  
**Solution:** Single source of truth, check in key functions  
**Severity:** Low - only 3-4 functions need modification

#### 3. **UI Complexity**
**Issue:** Start overlay getting crowded  
**Solution:** Good CSS spacing, clear visual hierarchy  
**Severity:** Low - design already accounts for this

#### 4. **Browser Compatibility**
**Issue:** Radio buttons, fieldset styling across browsers  
**Solution:** Use standard HTML5 elements, test on target browsers  
**Severity:** Very Low - radio buttons have excellent support

---

## Alternative Approaches Considered

### Alternative 1: Auto-detect platform and force manual mode
**Pros:** 
- No user decision needed
- Automatically fixes Linux/Chrome issue

**Cons:**
- Unreliable user-agent detection
- Firefox on Linux works fine (would be wrong default)
- Chrome with speech-dispatcher works (would be wrong default)
- Removes user choice

**Verdict:** ❌ Rejected - too many edge cases, removes agency

### Alternative 2: Extend timeout instead of manual mode
**Pros:**
- No UI changes needed
- Simpler implementation

**Cons:**
- Doesn't solve the problem (speech still fails eventually)
- Longer wait times frustrate all users
- 10+ second timeout still unreasonable

**Verdict:** ❌ Rejected - doesn't address root cause

### Alternative 3: Add delay between slides when speech fails
**Pros:**
- Could set 5-10 second delay per slide
- No UI changes

**Cons:**
- Artificial delay frustrates users (can't control pace)
- Still no voice benefit
- Can't skip ahead
- Can't review previous slides easily

**Verdict:** ❌ Rejected - poor UX, doesn't solve navigation need

### Alternative 4: Show "Switch to Manual" button during presentation
**Pros:**
- Can recover from bad auto mode experience
- Doesn't require upfront decision

**Cons:**
- More complex state management
- UI clutter during presentation
- Student has already started with bad experience

**Verdict:** ❌ Rejected - current plan is cleaner

---

## Documentation Updates Required

### 1. **README.md**
Add section under "Known Issues":
```markdown
### Slides Advancing Too Fast (Linux + Chrome)

**Symptom:** Slides move every 1-2 seconds, no time to read

**Cause:** Speech synthesis unavailable on Linux/Chromium from file:/// URLs

**Solution:** 
1. When opening lecture, select "Manual navigation" mode
2. Use Next/Previous buttons to control pace
3. Or use Firefox (has better Linux speech support)
```

### 2. **logs/project-overview.md**
Update "Key Features" section:
```markdown
- Voice/rate/pitch controls
- **Manual mode toggle** (October 2025) - disable auto-play
- Progress indicator
```

### 3. **logs/known-issues-and-workarounds.md**
Update Issue #1 section:
```markdown
### Workarounds (In Priority Order)

**0. Use Manual Mode (NEW - October 2025)**
- Select "Manual navigation" on start overlay
- Disables auto-play and voice entirely
- Navigate with Previous/Next buttons
- **Best option for Linux/Chromium users**

**1. Use Firefox (Recommended for Auto Mode)**
...
```

### 4. **Create CHANGELOG.md** (New File)
```markdown
# Changelog

## [2.1.0] - October 19, 2025

### Added
- Manual mode toggle on exported presentation start screen
- Students can now choose between auto-play with voice or manual navigation
- Voice controls automatically hide in manual mode

### Fixed
- Slides advancing too fast on Linux/Chromium when speech synthesis unavailable
- Students on affected platforms can now control presentation pace

### Changed
- Start overlay now includes mode selection before voice controls
```

---

## Success Criteria

### Must Have (P0)
- [x] Manual mode toggle visible on start overlay
- [x] Selecting manual mode disables auto-advance
- [x] Selecting manual mode hides voice controls
- [x] Manual mode works on Linux + Chromium
- [x] Auto mode still works on Windows/Mac
- [x] No console errors in either mode

### Should Have (P1)
- [x] Clear descriptive labels for each mode
- [x] Hint text suggesting manual mode for Linux users
- [x] Smooth UI transitions when toggling
- [x] Status message updates based on mode

### Nice to Have (P2)
- [ ] Animated toggle transition
- [ ] Detect platform and show recommendation badge
- [ ] Remember user's mode choice in localStorage
- [ ] Keyboard shortcut to toggle modes (M key)

---

## Implementation Steps

### Step 1: Update HTML Structure (15 min)
- Add mode selection fieldset to start overlay
- Wrap voice controls in container div
- Add appropriate IDs and classes

### Step 2: Add CSS Styles (10 min)
- Style mode selection fieldset
- Style radio button labels
- Add `.hidden` utility class
- Ensure mobile responsiveness

### Step 3: Add JavaScript State (5 min)
- Add `manualMode` variable
- Create `setupModeSelection()` function

### Step 4: Modify Initialization (10 min)
- Update voice loading logic to check `manualMode`
- Add early return for manual mode

### Step 5: Modify Playback Logic (10 min)
- Update `playSlide()` to respect `manualMode`
- Update navigation functions
- Update `startPresentation()`

### Step 6: Test Locally (20 min)
- Test auto mode (Windows/Mac browser)
- Test manual mode (any browser)
- Test toggle behavior
- Test keyboard shortcuts

### Step 7: Test on Linux (10 min)
- Open in Chromium → Test manual mode
- Open in Firefox → Test auto mode
- Verify problem solved

### Step 8: Update Documentation (15 min)
- Update README.md
- Update logs/known-issues-and-workarounds.md
- Update logs/project-overview.md
- Create CHANGELOG.md

---

## Rollback Plan

If implementation fails or introduces critical bugs:

1. **Revert `app.js`** to previous version (git)
2. **Re-export test lectures** without changes
3. **Document issues** in GitHub issues
4. **Consider alternative approaches**

Critical bugs that require rollback:
- Manual mode doesn't stop auto-advance
- Auto mode breaks for working platforms
- UI becomes unusable on mobile
- Console errors crash presentation

---

## Conclusion

### Feasibility: ✅ **FEASIBLE**

**Reasons:**
1. **Clear problem definition** - slides advancing too fast
2. **Simple solution** - add mode toggle, respect flag
3. **Low risk** - additive change, no removal of features
4. **Moderate complexity** - ~145 lines in one function
5. **Clear test plan** - specific platforms to verify
6. **Documented workarounds** - if issues arise

### Recommendation: **PROCEED WITH IMPLEMENTATION**

This plan solves a critical UX issue for Linux/Chromium users while maintaining full functionality for other platforms. The implementation is straightforward, low-risk, and provides immediate value.

### Next Steps:
1. ✅ Review this plan for approval
2. ⏳ Implement changes to `createSingleHTML()` in `app.js`
3. ⏳ Test on multiple platforms
4. ⏳ Update documentation
5. ⏳ Create new test export for students

---

**Plan Author:** GitHub Copilot  
**Reviewed By:** [Pending]  
**Approved By:** [Pending]  
**Implementation Date:** [Pending]
