# Testing Checklist: Manual Mode Toggle Feature

**Version:** 2.1.0  
**Feature:** Manual Mode Toggle  
**Date:** October 19, 2025  
**Status:** Ready for Testing

---

## Pre-Testing Setup

### ✅ Prerequisites
- [ ] Code changes saved in `app.js`
- [ ] No syntax errors in editor
- [ ] Browser available (Chrome/Chromium/Firefox)
- [ ] `test-lecture.md` available for export

---

## Phase 1: Basic Functionality Testing

### Test 1.1: Export Generation
**Objective:** Verify export creates valid HTML file

- [ ] Open `index.html` in browser
- [ ] Load or paste content from `test-lecture.md`
- [ ] Click "Export for Students"
- [ ] File downloads as `presentation.html`
- [ ] File size reasonable (~50-200KB depending on content)

**Expected:** ✅ Export completes successfully  
**Actual:** _________________  
**Status:** ⬜ Pass / ⬜ Fail

---

### Test 1.2: File Opens Correctly
**Objective:** Verify exported file opens in browser

- [ ] Locate downloaded `presentation.html`
- [ ] Double-click to open in browser
- [ ] Page loads (not blank)
- [ ] Start overlay visible
- [ ] No JavaScript errors in console (F12)

**Expected:** ✅ Page loads with start overlay  
**Actual:** _________________  
**Status:** ⬜ Pass / ⬜ Fail

---

## Phase 2: Manual Mode Testing

### Test 2.1: Mode Selection UI Visible
**Objective:** Verify mode selection appears correctly

- [ ] "Choose Playback Mode" fieldset visible
- [ ] Two radio buttons present:
  - [ ] "Auto-play with voice" (checked by default)
  - [ ] "Manual navigation"
- [ ] Descriptive text visible for both options
- [ ] Voice controls visible (auto mode default)
- [ ] UI looks good on screen (not broken layout)

**Expected:** ✅ Mode selection UI renders correctly  
**Actual:** _________________  
**Status:** ⬜ Pass / ⬜ Fail

---

### Test 2.2: Switch to Manual Mode
**Objective:** Verify manual mode selection updates UI

- [ ] Click "Manual navigation" radio button
- [ ] Radio button becomes selected
- [ ] Voice controls **disappear** (hidden)
- [ ] Status message updates to "Manual mode selected - ready to start"
- [ ] Start button text changes to "Start (Manual Navigation)"
- [ ] Start button becomes enabled (not grayed out)
- [ ] Spinner disappears

**Expected:** ✅ UI updates correctly for manual mode  
**Actual:** _________________  
**Status:** ⬜ Pass / ⬜ Fail

---

### Test 2.3: Start Manual Mode Presentation
**Objective:** Verify manual mode starts correctly

- [ ] Click "Start (Manual Navigation)" button
- [ ] Start overlay disappears
- [ ] First slide displays
- [ ] Navigation controls visible (bottom-right):
  - [ ] Progress indicator shows "Slide 1 of 7"
  - [ ] Previous button (disabled on first slide)
  - [ ] Next button (enabled)
- [ ] **No auto-advance** - slide stays on screen
- [ ] **No voice playback** - silent

**Expected:** ✅ Presentation starts in manual mode, no auto-advance  
**Actual:** _________________  
**Status:** ⬜ Pass / ⬜ Fail

---

### Test 2.4: Manual Navigation - Next Button
**Objective:** Verify Next button advances slides

- [ ] Click "Next" button
- [ ] Slide advances to slide 2
- [ ] Progress updates to "Slide 2 of 7"
- [ ] Previous button now enabled
- [ ] **No auto-advance** - slide waits for user
- [ ] Click Next again → advances to slide 3
- [ ] Click Next 4 more times → reaches slide 7
- [ ] Next button **disabled** on last slide

**Expected:** ✅ Next button advances slides, no auto-advance  
**Actual:** _________________  
**Status:** ⬜ Pass / ⬜ Fail

---

### Test 2.5: Manual Navigation - Previous Button
**Objective:** Verify Previous button goes back

- [ ] From last slide, click "Previous" button
- [ ] Slide goes back to slide 6
- [ ] Progress updates to "Slide 6 of 7"
- [ ] Next button re-enabled
- [ ] Click Previous multiple times → reaches slide 1
- [ ] Previous button **disabled** on first slide

**Expected:** ✅ Previous button navigates backwards  
**Actual:** _________________  
**Status:** ⬜ Pass / ⬜ Fail

---

### Test 2.6: Keyboard Shortcuts - Manual Mode
**Objective:** Verify keyboard navigation works in manual mode

- [ ] Press **→ (right arrow)** → advances to next slide
- [ ] Press **← (left arrow)** → goes to previous slide
- [ ] Press **Spacebar** → advances to next slide
- [ ] Press **Esc** → (no effect expected, no speech to stop)
- [ ] Keyboard shortcuts work throughout presentation

**Expected:** ✅ Keyboard shortcuts work in manual mode  
**Actual:** _________________  
**Status:** ⬜ Pass / ⬜ Fail

---

### Test 2.7: Console Logs - Manual Mode
**Objective:** Verify proper logging in manual mode

- [ ] Open browser console (F12 → Console tab)
- [ ] Look for logs with `[Lecture Player]` prefix
- [ ] Should see:
  - [ ] "Manual mode selected by user"
  - [ ] "Starting presentation in manual mode"
  - [ ] "Manual mode - waiting for user navigation (slide X)"
- [ ] **No errors** in console
- [ ] **No warnings** about speech synthesis

**Expected:** ✅ Clean console logs, no errors  
**Actual:** _________________  
**Status:** ⬜ Pass / ⬜ Fail

---

## Phase 3: Auto Mode Testing (Regression)

### Test 3.1: Switch Back to Auto Mode
**Objective:** Verify toggling from manual to auto works

- [ ] Refresh page (F5)
- [ ] Auto mode selected by default (radio button checked)
- [ ] Voice controls **visible**
- [ ] Status shows "Loading voices..." or "Ready!"
- [ ] Spinner may appear briefly
- [ ] Start button text: "Start Presentation" or "Start Anyway"

**Expected:** ✅ Auto mode UI displays correctly  
**Actual:** _________________  
**Status:** ⬜ Pass / ⬜ Fail

---

### Test 3.2: Voice Loading in Auto Mode
**Objective:** Verify voice loading works (or times out gracefully)

**If voices load successfully:**
- [ ] Status shows "Ready! X voices available"
- [ ] Voice dropdown populated with voices
- [ ] Start button enabled
- [ ] Spinner gone

**If voices timeout:**
- [ ] Status shows "Continuing with system default voice"
- [ ] Start button shows "Start Anyway"
- [ ] Start button enabled after ~3 seconds

**Expected:** ✅ Voice loading completes or times out gracefully  
**Actual:** _________________  
**Status:** ⬜ Pass / ⬜ Fail

---

### Test 3.3: Start Auto Mode Presentation
**Objective:** Verify auto mode starts and plays

- [ ] Click "Start Presentation" button
- [ ] Start overlay disappears
- [ ] First slide displays
- [ ] **Voice narration starts** (if voices available)
- [ ] **Slides auto-advance** after speech completes
- [ ] Or **manual control works** if voices unavailable

**Expected:** ✅ Auto mode works as before (v2.0 behavior)  
**Actual:** _________________  
**Status:** ⬜ Pass / ⬜ Fail

---

### Test 3.4: Manual Override in Auto Mode
**Objective:** Verify manual controls work during auto-play

- [ ] While presentation playing, click "Next" button
- [ ] **Speech stops** immediately
- [ ] Slide advances
- [ ] **Auto-advance disabled** (no more auto-play)
- [ ] Must use buttons/keyboard for rest of presentation

**Expected:** ✅ Manual override works in auto mode  
**Actual:** _________________  
**Status:** ⬜ Pass / ⬜ Fail

---

## Phase 4: Platform-Specific Testing

### Test 4.1: Linux + Chromium (Problem Platform)
**Objective:** Verify manual mode solves the original issue

**Setup:** Open `presentation.html` on Linux with Chromium

**Manual Mode:**
- [ ] Select "Manual navigation"
- [ ] Start presentation
- [ ] Slides **DO NOT** advance automatically
- [ ] Can read each slide at own pace
- [ ] Next button advances when ready
- [ ] **Problem solved!** ✅

**Auto Mode (for comparison):**
- [ ] Select "Auto-play with voice"
- [ ] Voice loading likely **fails** (expected)
- [ ] If slides advance too fast → confirms original problem exists
- [ ] But manual mode is now available as solution

**Expected:** ✅ Manual mode fixes fast-advancing slides issue  
**Actual:** _________________  
**Status:** ⬜ Pass / ⬜ Fail

---

### Test 4.2: Windows/Mac + Chrome (Baseline)
**Objective:** Verify both modes work on functioning platform

**Auto Mode:**
- [ ] Voice loading succeeds
- [ ] Speech plays correctly
- [ ] Slides auto-advance after narration
- [ ] Manual override works

**Manual Mode:**
- [ ] Voice controls hidden
- [ ] No auto-advance
- [ ] Button navigation works
- [ ] Keyboard shortcuts work

**Expected:** ✅ Both modes work perfectly on Windows/Mac  
**Actual:** _________________  
**Status:** ⬜ Pass / ⬜ Fail

---

### Test 4.3: Firefox on Linux (Comparison)
**Objective:** Verify Firefox handles both modes well

**Auto Mode:**
- [ ] Voice loading succeeds (Firefox has good Linux TTS)
- [ ] Speech plays
- [ ] Auto-advance works
- [ ] Better than Chromium on Linux

**Manual Mode:**
- [ ] Works same as other browsers
- [ ] Clean fallback option

**Expected:** ✅ Firefox works well in both modes on Linux  
**Actual:** _________________  
**Status:** ⬜ Pass / ⬜ Fail

---

## Phase 5: Edge Cases & Stress Testing

### Test 5.1: Toggle Mode Multiple Times Before Start
**Objective:** Verify mode toggle is robust

- [ ] Select manual → UI updates
- [ ] Select auto → UI reverts
- [ ] Select manual → UI updates again
- [ ] Select auto → UI reverts again
- [ ] Repeat 5 times → no errors, no glitches
- [ ] Final selection (auto or manual) → starts correctly

**Expected:** ✅ Toggle handles multiple switches smoothly  
**Actual:** _________________  
**Status:** ⬜ Pass / ⬜ Fail

---

### Test 5.2: Large Presentation (Many Slides)
**Objective:** Verify manual mode handles large slide count

- [ ] Create/export lecture with 50+ slides
- [ ] Open in manual mode
- [ ] Navigate through multiple slides with Next
- [ ] Progress indicator updates correctly (Slide 25 of 50, etc.)
- [ ] No performance degradation
- [ ] Can reach last slide

**Expected:** ✅ Handles large presentations smoothly  
**Actual:** _________________  
**Status:** ⬜ Pass / ⬜ Fail

---

### Test 5.3: Special Content Rendering
**Objective:** Verify manual mode doesn't affect content display

- [ ] Slides with code blocks render correctly
- [ ] Slides with special characters display properly
- [ ] Emoji render correctly
- [ ] Lists format properly
- [ ] Long paragraphs display fully

**Expected:** ✅ Content renders same in both modes  
**Actual:** _________________  
**Status:** ⬜ Pass / ⬜ Fail

---

### Test 5.4: Browser Refresh Mid-Presentation
**Objective:** Verify clean restart behavior

- [ ] Start presentation in manual mode
- [ ] Navigate to slide 5
- [ ] Refresh page (F5)
- [ ] Presentation resets to start overlay
- [ ] Mode selection back to default (auto)
- [ ] Can select mode again and restart

**Expected:** ✅ Refresh resets cleanly  
**Actual:** _________________  
**Status:** ⬜ Pass / ⬜ Fail

---

## Phase 6: Mobile/Responsive Testing (Optional)

### Test 6.1: Mobile Browser - Manual Mode
**Objective:** Verify manual mode works on mobile

- [ ] Open `presentation.html` on mobile device
- [ ] Mode selection UI displays correctly (not cut off)
- [ ] Radio buttons large enough to tap
- [ ] Select manual mode → UI updates
- [ ] Start presentation
- [ ] Next/Previous buttons large enough to tap
- [ ] Slides display properly on small screen

**Expected:** ✅ Manual mode works on mobile  
**Actual:** _________________  
**Status:** ⬜ Pass / ⬜ Fail

---

### Test 6.2: Tablet Browser
**Objective:** Verify responsive layout on medium screens

- [ ] Mode selection looks good
- [ ] Voice controls don't overflow
- [ ] Navigation buttons positioned well
- [ ] Text readable without zooming

**Expected:** ✅ Works well on tablets  
**Actual:** _________________  
**Status:** ⬜ Pass / ⬜ Fail

---

## Phase 7: Accessibility Testing

### Test 7.1: Screen Reader Compatibility
**Objective:** Verify accessible for visually impaired users

- [ ] Use screen reader (NVDA/JAWS/VoiceOver)
- [ ] Fieldset announces as "Choose Playback Mode"
- [ ] Radio buttons announce with labels
- [ ] Descriptive text read aloud
- [ ] Start button announces correctly
- [ ] Can navigate and select mode with keyboard only

**Expected:** ✅ Fully accessible to screen readers  
**Actual:** _________________  
**Status:** ⬜ Pass / ⬜ Fail

---

### Test 7.2: High Contrast Mode
**Objective:** Verify visibility in high contrast

- [ ] Enable OS high contrast mode
- [ ] Radio buttons visible
- [ ] Text readable
- [ ] Fieldset border visible
- [ ] Start button clear

**Expected:** ✅ Readable in high contrast mode  
**Actual:** _________________  
**Status:** ⬜ Pass / ⬜ Fail

---

## Summary Checklist

### Critical Tests (Must Pass)
- [ ] Manual mode prevents auto-advance
- [ ] Manual mode hides voice controls
- [ ] Next/Previous buttons work in manual mode
- [ ] Auto mode still works (regression test)
- [ ] Linux + Chromium manual mode solves speed issue
- [ ] No console errors in either mode

### Important Tests (Should Pass)
- [ ] Keyboard shortcuts work in both modes
- [ ] Mode toggle updates UI correctly
- [ ] Status messages accurate
- [ ] Progress indicator works
- [ ] Large presentations handle well

### Nice-to-Have Tests (Can Defer)
- [ ] Mobile responsive
- [ ] Screen reader accessible
- [ ] High contrast mode
- [ ] Tablet layout

---

## Test Results Summary

**Date Tested:** _________________  
**Tester:** _________________  
**Browser:** _________________  
**OS:** _________________  

**Total Tests:** 30+  
**Passed:** _____ / _____  
**Failed:** _____ / _____  
**Skipped:** _____ / _____  

**Critical Issues Found:** _________________  
**Minor Issues Found:** _________________  

**Overall Status:** ⬜ Ready for Production / ⬜ Needs Fixes

---

## Issue Tracking Template

### Issue #1
**Test:** _________________  
**Severity:** ⬜ Critical / ⬜ High / ⬜ Medium / ⬜ Low  
**Description:** _________________  
**Steps to Reproduce:**
1. _________________
2. _________________
3. _________________

**Expected:** _________________  
**Actual:** _________________  
**Fix Required:** _________________

---

## Sign-Off

**Tested By:** _________________  
**Date:** _________________  
**Recommendation:** ⬜ Approve for Production / ⬜ Needs Revision  

**Notes:**
_________________
_________________
_________________
