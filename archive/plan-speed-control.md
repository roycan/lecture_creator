# Implementation Plan: Dynamic Speed Control (v2.2.0)

**Date:** October 28, 2025  
**Status:** Planning Phase  
**Complexity:** Medium  
**Estimated Time:** 2-3 hours

---

## Overview

Add persistent speed control to exported presentations, allowing students to adjust playback speed on-the-fly during auto-play mode. Includes visual slider control and keyboard shortcuts.

---

## Problem Statement

**Current Limitation:**
- Speed (rate) and pitch controls only available in start overlay
- Once presentation starts, controls disappear
- Students must restart to change speed
- Poor UX for content requiring different pacing (complex vs review)

**User Impact:**
- Students stuck with initial speed choice
- Can't slow down for difficult topics
- Can't speed up for familiar content
- Reduces effectiveness of self-paced learning

---

## Goals

1. ✅ **Persistent Speed Control** - Always visible during presentation (not just at start)
2. ✅ **Dynamic Adjustment** - Change speed while TTS is playing
3. ✅ **Keyboard Shortcuts** - Quick access via +/- keys
4. ✅ **Mode Awareness** - Hidden in manual mode (not applicable)
5. ✅ **Simple & Discoverable** - Clear visual design, intuitive placement

---

## Design Decisions

### What Gets Moved to Nav Controls?

**Include:**
- ✅ **Speed (Rate) slider** - Primary use case (0.6x - 1.3x)
  - Most students adjust speed, not pitch
  - Clear benefit: faster review, slower learning
  - Range: 0.6 - 1.3, step 0.05, default 0.95

**Exclude:**
- ❌ **Pitch slider** - Rarely needs mid-presentation adjustment
  - Keep in start overlay (set once before starting)
  - Reduces nav control clutter
  - Students can restart if pitch adjustment needed

**Exclude:**
- ❌ **Voice selector** - Cannot change mid-presentation
  - TTS engine doesn't support dynamic voice switching
  - Keep in start overlay only

### Layout Design

**Desktop (≥768px):**
```
┌─────────────────────────────────────────────────────────────┐
│ Slide 5 of 23                     Speed: [====|===] 1.0x    │
│                                                              │
│ ⏸ Pause        ⬅ Previous        Next ➡                     │
└─────────────────────────────────────────────────────────────┘
```

**Mobile (<768px):**
```
┌─────────────────────────────────┐
│ Slide 5 of 23                   │
│                                 │
│ Speed: [======|======] 1.0x     │
│                                 │
│ ⏸ Pause  ⬅ Prev  Next ➡        │
└─────────────────────────────────┘
```

**Key Design Principles:**
- Speed control on same visual "row" as progress indicator
- Aligned to right side (doesn't interfere with slide number)
- Compact design (doesn't dominate nav area)
- Clear label + value display
- Touch-friendly on mobile (adequate tap target)

---

## Technical Implementation

### Part 1: Move Speed Control to Nav Controls

**File:** `app.js` → `createSingleHTML()` function

**Current Structure:**
```javascript
// Start overlay contains:
<div id="voice-controls-container">
  <label>Voice: <select>...</select></label>
  <label>Rate: <input type="range">...</label>    // ← MOVE THIS
  <label>Pitch: <input type="range">...</label>   // ← KEEP HERE
</div>
```

**New Structure:**
```javascript
// Start overlay keeps:
<div id="voice-controls-container">
  <label>Voice: <select>...</select></label>
  <label>Pitch: <input type="range">...</label>   // Keep for initial setup
</div>

// Nav controls gain:
<div id="nav-controls">
  <div id="progress-indicator">Slide X of Y</div>
  
  <!-- NEW: Speed control (shown only in auto mode) -->
  <div id="speed-control" class="speed-control hidden">
    <label>
      Speed:
      <input id="speed-slider" type="range" min="0.6" max="1.3" step="0.05" value="0.95">
      <span id="speed-value">0.95x</span>
    </label>
  </div>
  
  <button id="pause-button">⏸ Pause</button>
  <button id="prev-button">⬅ Previous</button>
  <button id="next-button">Next ➡</button>
</div>
```

**Code Changes (~40 lines):**

1. **Add HTML for speed control in nav** (~10 lines)
2. **Update CSS for layout** (~15 lines)
   - Flexbox positioning
   - Media query for mobile
   - Hide/show based on mode
3. **Add DOM references** (~5 lines)
   ```javascript
   var speedControl = document.getElementById('speed-control');
   var speedSlider = document.getElementById('speed-slider');
   var speedValue = document.getElementById('speed-value');
   ```
4. **Add event listener for slider** (~10 lines)
   ```javascript
   speedSlider.addEventListener('input', function() {
     speedValue.textContent = parseFloat(speedSlider.value).toFixed(2) + 'x';
     // Value automatically used by next utterance
   });
   ```

---

### Part 2: Show/Hide Based on Mode

**Logic:**
- Manual mode: Hide speed control (no TTS = not applicable)
- Auto mode: Show speed control

**Implementation (~10 lines):**

```javascript
// In startPresentation() function
function startPresentation() {
  // ... existing code ...
  
  if (manualMode) {
    // Hide speed control
    speedControl.classList.add('hidden');
    pauseButton.classList.add('hidden');
  } else {
    // Show speed control
    speedControl.classList.remove('hidden');
    pauseButton.classList.remove('hidden');
  }
  
  // ... rest of function ...
}
```

**Edge Case Handling:**
- If no voices available → Auto mode disabled → Speed control hidden
- Mode selection changed → Update speed control visibility

---

### Part 3: Dynamic Speed Application

**Current Behavior (Already Works!):**
```javascript
// In speakText() function (line ~887)
utterance.rate = parseFloat(rateInput.value) || 0.95;
```

**Key Insight:**
- Each utterance reads current slider value
- Speed changes apply to **next sentence**
- No code change needed for dynamic application! ✨

**User Experience:**
```
1. Student listening to slide
2. Realizes content is easy, wants to speed up
3. Moves slider from 0.95x → 1.2x
4. Current sentence finishes at 0.95x
5. Next sentence starts at 1.2x ✅
```

**Implementation:** (~5 lines)

```javascript
// Update existing reference to read from new location
// BEFORE: var rateInput = document.getElementById('rate'); (in start overlay)
// AFTER: var rateInput = document.getElementById('speed-slider'); (in nav controls)

// OR use same ID 'rate' for consistency:
<input id="rate" type="range" ...>  // in nav controls
// Then no code change needed!
```

**Decision:** Use ID `rate` for speed slider in nav controls to minimize code changes.

---

### Part 4: Keyboard Shortcuts

**Shortcuts:**
- **`+` or `=` key** → Increase speed by 0.1x (max 1.3x)
- **`-` or `_` key** → Decrease speed by 0.1x (min 0.6x)
- **Visual feedback** → Brief toast notification

**Implementation (~50 lines):**

```javascript
// Add to existing keyboard handler
document.addEventListener('keydown', function(e) {
  // Existing shortcuts...
  
  // Speed shortcuts (only in auto mode)
  if (!manualMode && !isPaused) {
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      adjustSpeed(0.1);
    } else if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      adjustSpeed(-0.1);
    }
  }
});

// New function: Adjust speed with bounds checking
function adjustSpeed(delta) {
  var currentSpeed = parseFloat(speedSlider.value);
  var newSpeed = Math.max(0.6, Math.min(1.3, currentSpeed + delta));
  
  speedSlider.value = newSpeed.toFixed(2);
  speedValue.textContent = newSpeed.toFixed(2) + 'x';
  
  // Show toast notification
  showSpeedToast(newSpeed);
}

// New function: Show brief feedback
function showSpeedToast(speed) {
  var toast = document.getElementById('speed-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'speed-toast';
    toast.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); ' +
                          'background:rgba(0,0,0,0.8); color:white; padding:1rem 2rem; ' +
                          'border-radius:8px; font-size:1.5em; z-index:10000; ' +
                          'pointer-events:none; opacity:0; transition:opacity 0.3s;';
    document.body.appendChild(toast);
  }
  
  toast.textContent = 'Speed: ' + speed.toFixed(2) + 'x';
  toast.style.opacity = '1';
  
  // Fade out after 800ms
  setTimeout(function() {
    toast.style.opacity = '0';
  }, 800);
}
```

**Toast Design:**
```
┌──────────────────┐
│  Speed: 1.10x    │  ← Appears center screen
└──────────────────┘  ← Fades after 0.8s
```

---

### Part 5: CSS Styling

**Add to exported HTML `<style>` section (~30 lines):**

```css
/* Speed control in nav */
.speed-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9em;
    color: white;
}

.speed-control label {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    margin: 0;
}

#speed-slider {
    width: 100px;
    height: 4px;
    cursor: pointer;
}

#speed-value {
    font-weight: bold;
    min-width: 40px;
    text-align: right;
}

/* Update nav-controls layout */
#nav-controls {
    /* existing styles... */
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

/* Progress and speed on top row */
#progress-indicator {
    order: 1;
}

.speed-control {
    order: 2;
    margin-left: auto; /* Push to right */
}

/* Buttons on bottom row */
#nav-controls button {
    order: 3;
}

/* Mobile responsive */
@media (max-width: 768px) {
    .speed-control {
        order: 2;
        width: 100%;
        justify-content: center;
        margin: 0.5rem 0;
    }
    
    #speed-slider {
        width: 150px; /* Wider on mobile for easier touch */
    }
    
    #nav-controls button {
        order: 3;
        flex: 1;
        min-width: 80px;
    }
}
```

---

## User Flows

### Flow 1: Student Adjusts Speed via Slider

```
1. Student opens lecture.html
2. Selects "Auto-play mode"
3. Sets initial speed (e.g., 1.0x) in overlay
4. Clicks "Start Presentation"
5. Slide 1 plays at 1.0x
6. Student notices speed control in nav bar
7. Slide 2 starts - topic is easy
8. Student drags slider to 1.2x
9. Next sentence plays at 1.2x ✅
10. Student continues adjusting as needed
```

### Flow 2: Student Uses Keyboard Shortcuts

```
1. Presentation playing at 0.95x (default)
2. Slide 7 - Box Model topic (complex)
3. Student presses `-` key twice
4. Toast shows: "Speed: 0.75x"
5. Next sentence plays slower ✅
6. Student understands better
7. Slide 8 - review content
8. Student presses `+` key three times
9. Toast shows: "Speed: 1.05x"
10. Presentation continues faster
```

### Flow 3: Manual Mode (No Speed Control)

```
1. Student opens lecture.html
2. Selects "Manual mode"
3. Clicks "Start Presentation"
4. Speed control NOT visible ✅
5. Pause button NOT visible ✅
6. Only navigation buttons shown
7. Student clicks through at own pace
```

---

## Edge Cases & Error Handling

### Edge Case 1: Speed Changed During Sentence
**Scenario:** Student moves slider while TTS speaking  
**Behavior:** Current sentence finishes at old speed, next uses new speed  
**Handling:** Working as designed (Web Speech API limitation)

### Edge Case 2: Speed at Minimum/Maximum
**Scenario:** Student tries to go below 0.6x or above 1.3x  
**Behavior:** Slider stops at bounds, keyboard shortcuts clamp value  
**Implementation:** `Math.max(0.6, Math.min(1.3, newValue))`

### Edge Case 3: Manual Mode with Speed Control Visible
**Scenario:** Bug causes speed control to show in manual mode  
**Behavior:** Control visible but non-functional (no TTS)  
**Prevention:** Explicit hide/show logic in mode selection

### Edge Case 4: No Voices Available
**Scenario:** System has no TTS voices → Falls back to manual mode  
**Behavior:** Speed control hidden (not applicable)  
**Implementation:** Same logic as manual mode

### Edge Case 5: Paused Presentation
**Scenario:** Student adjusts speed while paused  
**Behavior:** New speed applies when resumed  
**Implementation:** Already works (reads slider value on each utterance)

### Edge Case 6: Keyboard Shortcut While Typing
**Scenario:** Student in search box, presses +/-  
**Behavior:** Should NOT adjust speed (focus in input)  
**Prevention:** Check `document.activeElement.tagName !== 'INPUT'`

---

## Testing Checklist

### Visual Testing
- [ ] Speed control visible in auto mode
- [ ] Speed control hidden in manual mode
- [ ] Speed control hidden when no voices
- [ ] Layout looks good on desktop (≥768px)
- [ ] Layout looks good on mobile (<768px)
- [ ] Slider and value display aligned properly
- [ ] Toast notification appears centered
- [ ] Toast fades smoothly

### Functional Testing
- [ ] Slider adjusts speed (0.6 - 1.3x)
- [ ] Value display updates in real-time
- [ ] Speed changes apply to next sentence
- [ ] `+` key increases speed by 0.1x
- [ ] `-` key decreases speed by 0.1x
- [ ] Keyboard shortcuts respect min/max bounds
- [ ] Toast shows correct speed value
- [ ] Toast times out after ~1 second
- [ ] Speed persists across slides
- [ ] Initial speed from overlay carries over

### Mode Testing
- [ ] Auto mode: Speed control visible
- [ ] Manual mode: Speed control hidden
- [ ] Mode switch updates visibility
- [ ] No voices: Speed control hidden

### Edge Case Testing
- [ ] Speed change during speech (next sentence affected)
- [ ] Multiple rapid slider adjustments (no crashes)
- [ ] Multiple rapid keyboard presses (no crashes)
- [ ] Keyboard shortcuts while paused (works on resume)
- [ ] Keyboard shortcuts don't fire in input fields

### Cross-Browser Testing
- [ ] Chrome/Chromium (Windows, Mac, Linux)
- [ ] Firefox (all platforms)
- [ ] Edge (Windows)
- [ ] Safari (Mac/iOS)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

---

## Rollback Plan

**If issues occur:**

1. **Revert speed control to start overlay:**
   - Move `<input id="rate">` back to voice-controls-container
   - Remove speed control from nav-controls
   - Remove keyboard shortcuts
   - Keep existing pause functionality (v2.1.2)

2. **Minimal viable fallback:**
   - Keep speed in start overlay
   - Add note: "To change speed, restart presentation"
   - Low user satisfaction but functional

**Revert Complexity:** Low (mostly HTML/CSS changes)

---

## Documentation Updates

### Files to Update:

1. **CHANGELOG.md** - Add v2.2.0 entry
   ```markdown
   ## [2.2.0] - October 28, 2025
   
   ### Added
   - Dynamic speed control in navigation bar (auto-play mode)
   - Keyboard shortcuts: +/- to adjust playback speed
   - Visual toast notifications for speed changes
   
   ### Changed
   - Speed control moved from start overlay to persistent nav controls
   - Pitch control remains in start overlay (one-time setup)
   
   ### Improved
   - Students can adjust speed on-the-fly during presentation
   - Better self-paced learning (slow for complex, fast for review)
   - Clear visual feedback via toast notifications
   ```

2. **README.md** - Update features section
   - Add "Dynamic speed control during playback"
   - Document keyboard shortcuts (+/-)

3. **logs/project-overview.md** - Update current features
   - Add v2.2.0 to feature list

4. **logs/technical-architecture.md** - Update if significant changes
   - Document speed control placement
   - Document keyboard shortcuts

---

## Success Metrics

### For Students:
- ✅ Can adjust speed without restarting
- ✅ Speed changes take effect quickly (next sentence)
- ✅ Control is discoverable (visible in nav)
- ✅ Keyboard shortcuts provide fast access
- ✅ Works smoothly on mobile devices

### For Teachers:
- ✅ No additional setup required
- ✅ Feature is automatic in exported files
- ✅ Reduces "too fast/slow" complaints

### Technical:
- ✅ No performance degradation
- ✅ No breaking changes to existing features
- ✅ Works across all supported browsers
- ✅ Responsive design maintained

---

## Dependencies & Constraints

### External Dependencies:
- ✅ Web Speech API (already in use)
- ✅ No new libraries required

### Browser Constraints:
- ⚠️ Speed adjustment applies to next utterance (API limitation)
- ⚠️ Cannot change speed mid-sentence (acceptable)

### Code Constraints:
- ✅ Must maintain ES5 syntax in exported HTML (compatibility)
- ✅ Must not break pause feature (v2.1.2)
- ✅ Must not break natural vertical flow (v2.1.3)
- ✅ Must not break enhanced images (v2.1.4)

---

## Implementation Order

1. **Phase 1: HTML/CSS** (30 min)
   - Add speed control to nav HTML
   - Update CSS layout
   - Test responsive design

2. **Phase 2: JavaScript Core** (45 min)
   - Update DOM references
   - Add slider event listener
   - Implement show/hide logic

3. **Phase 3: Keyboard Shortcuts** (45 min)
   - Extend keyboard handler
   - Add adjustSpeed() function
   - Implement toast notification

4. **Phase 4: Testing** (30 min)
   - Visual testing (desktop + mobile)
   - Functional testing (all scenarios)
   - Cross-browser testing

5. **Phase 5: Documentation** (30 min)
   - Update CHANGELOG.md
   - Update README.md
   - Update logs/

**Total Time: ~3 hours**

---

## Risk Assessment

### Low Risk ✅
- Speed control already exists (just relocating)
- Web Speech API supports dynamic rate
- Similar to pause button implementation (proven pattern)
- No breaking changes to existing code
- Easy rollback (mostly HTML/CSS)

### Medium Risk ⚠️
- Mobile layout complexity (two-row design)
- Keyboard shortcuts might conflict with browser shortcuts
- Toast notification might be distracting

### Mitigation:
- Test mobile layout early
- Use preventDefault() for keyboard shortcuts
- Make toast subtle and brief (0.8s timeout)

**Overall Risk Level:** 🟢 **Low Risk**

---

## Feasibility Assessment

### Technical Feasibility: 98% ✅

**Why highly feasible:**
- ✅ Speed control mechanism already exists
- ✅ Just needs relocation and styling
- ✅ Web Speech API fully supports dynamic rate
- ✅ Similar pattern to pause button (v2.1.2)
- ✅ No new external dependencies
- ✅ Well-defined scope

**Minor concerns:**
- ⚠️ Mobile responsive layout (solvable with flexbox)
- ⚠️ Toast notification timing (needs user testing)

### UX Feasibility: 95% ✅

**Why good UX:**
- ✅ Control in expected location (with other nav controls)
- ✅ Keyboard shortcuts familiar (like video players)
- ✅ Immediate visual feedback (slider + toast)
- ✅ Hidden when not applicable (manual mode)
- ✅ Simple mental model (adjust speed = next sentence affected)

**Minor concerns:**
- ⚠️ Students might not discover keyboard shortcuts (document in start overlay?)
- ⚠️ Slider might be small on mobile (mitigated with wider slider)

### Implementation Feasibility: 95% ✅

**Why achievable:**
- ✅ Clear implementation plan
- ✅ Estimated 3 hours total
- ✅ Incremental phases
- ✅ Extensive testing checklist
- ✅ Easy rollback plan

**Minor concerns:**
- ⚠️ Needs careful testing on multiple devices
- ⚠️ Toast notification CSS might need tweaking

---

## Conclusion

**Recommendation:** ✅ **PROCEED WITH IMPLEMENTATION**

**Confidence Level:** 97%

**Reasoning:**
1. Clear user benefit (better self-paced learning)
2. Low technical risk (relocating existing feature)
3. Proven pattern (similar to pause button v2.1.2)
4. Well-defined scope and implementation plan
5. Easy rollback if issues arise
6. Aligns with project philosophy (student empowerment)

**Next Steps:**
1. Get user approval on plan
2. Begin Phase 1 (HTML/CSS)
3. Test incrementally after each phase
4. Document thoroughly in CHANGELOG

---

**Ready to implement when approved!** 🚀
