# Quick Testing Checklist - v2.1.2

## 🎯 Quick Tests (5 minutes)

### ✅ Test 1: Pause Button Visibility
- [ ] Export presentation
- [ ] Start in **auto mode**
- [ ] Orange pause button visible? ✓
- [ ] Start in **manual mode**
- [ ] Pause button hidden? ✓

### ✅ Test 2: Pause/Resume Functionality
- [ ] Start auto mode presentation
- [ ] Click orange "⏸ Pause" button
- [ ] Speech stops? ✓
- [ ] Button turns green "▶ Resume"? ✓
- [ ] Click green resume button
- [ ] Speech continues? ✓
- [ ] Button returns to orange? ✓

### ✅ Test 3: Spacebar Shortcut (Auto Mode)
- [ ] Start auto mode
- [ ] Press spacebar
- [ ] Presentation pauses? ✓
- [ ] Press spacebar again
- [ ] Presentation resumes? ✓

### ✅ Test 4: Spacebar in Manual Mode
- [ ] Start manual mode
- [ ] Press spacebar
- [ ] Advances to next slide? ✓
- [ ] (Should NOT pause)

### ✅ Test 5: ASCII Art Display
- [ ] Navigate to slide 11 ("The Box Model")
- [ ] Image loads? ✓
- [ ] ASCII art box model visible below image? ✓
- [ ] Box characters (└ ┌ │ ─) render correctly? ✓
- [ ] No horizontal scrolling? ✓
- [ ] Text fits in container? ✓

### ✅ Test 6: Code Block Display
- [ ] Navigate to any slide with code (e.g., CSS examples)
- [ ] Monospace font used? ✓
- [ ] Readable size? ✓
- [ ] No horizontal overflow? ✓

---

## 🔍 Detailed Inspection (Optional)

### Browser Console Check
```
1. Press F12
2. Go to Console tab
3. Look for log messages:
   - "Presentation paused"
   - "Presentation resumed"
4. No errors? ✓
```

### Element Inspection
```
1. Press F12
2. Go to Elements tab
3. Find pause button:
   <button id="pause-button" class="nav-button">
4. Check classes change when clicked:
   - Playing: no "paused" class
   - Paused: has "paused" class
```

### CSS Inspection
```
1. Inspect a <pre> block
2. Computed styles should show:
   - font-family: 'Courier New', Consolas, Monaco...
   - font-size: 0.85em
   - white-space: pre-wrap
   - max-width: 100%
```

---

## 📋 Test Results Template

```
## v2.1.2 Test Results

**Date:** ___________
**Browser:** ___________
**OS:** ___________

### Pause Button
- Visibility (auto mode): [ ] Pass / [ ] Fail
- Visibility (manual mode): [ ] Pass / [ ] Fail
- Pause functionality: [ ] Pass / [ ] Fail
- Resume functionality: [ ] Pass / [ ] Fail

### Spacebar Shortcut
- Auto mode pause/resume: [ ] Pass / [ ] Fail
- Manual mode advance: [ ] Pass / [ ] Fail

### ASCII Art Display
- Box model visible: [ ] Pass / [ ] Fail
- Characters render correctly: [ ] Pass / [ ] Fail
- No horizontal scroll: [ ] Pass / [ ] Fail

### Code Blocks
- Monospace font: [ ] Pass / [ ] Fail
- Readable size: [ ] Pass / [ ] Fail
- Proper wrapping: [ ] Pass / [ ] Fail

### Overall Status
[ ] All tests passed - Ready for production
[ ] Minor issues found
[ ] Critical issues found

Notes:
_________________________________
```

---

## 🚀 Expected Results Summary

| Test | Expected Result |
|------|----------------|
| Pause button (auto) | Visible, orange color |
| Pause button (manual) | Hidden |
| Click pause | Speech stops, button turns green |
| Click resume | Speech continues, button orange |
| Spacebar (auto) | Pauses/resumes presentation |
| Spacebar (manual) | Advances slide |
| ASCII art | Displays without scrolling |
| Code blocks | Monospace font, readable |

---

## ⚠️ Troubleshooting

### Issue: Pause button not visible in auto mode
**Check:** Did you start presentation? Button only shows after clicking "Start Presentation"

### Issue: Spacebar not pausing
**Check:** Are you in auto mode? Manual mode uses spacebar to advance

### Issue: ASCII art still scrolling
**Check:** Export again with latest code. Old exports won't have the fix

### Issue: Code blocks too small
**Solution:** Font size is 0.85em. Can adjust in CSS if needed

---

**Estimated Testing Time:** 5 minutes  
**All tests should pass:** ✅
