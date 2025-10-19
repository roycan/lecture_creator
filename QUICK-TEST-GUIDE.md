# Quick Test Guide - Image Base URL Fix

## Test Setup (30 seconds)

1. Open `index.html` in browser
2. Load `test-lecture-2.md` (Upload button or paste content)
3. You should see 7 images in the preview
4. Enter base URL: `https://roycan.github.io/lecture_creator/`
5. Click "Export for Students"

---

## Test Scenarios

### ✅ Scenario 1: Images Load Successfully
**Steps:**
1. Open exported `presentation.html` in browser
2. Select either mode (auto or manual)
3. Start presentation
4. Navigate through slides

**Expected Results:**
- Slide 4: CSS Syntax Breakdown diagram appears
- Slide 5: CSS Application Methods diagram appears
- Slide 6: CSS Selector Types diagram appears
- Slide 8: CSS Color Systems diagram appears
- Slide 11: CSS Box Model Nested Structure diagram appears
- Slide 20: Simple Navigation Bar Structure diagram appears
- Slide 3: CSS Cascade Flow diagram appears

**Success Criteria:** All 7 images load without 404 errors

---

### ✅ Scenario 2: Verify Image URLs
**Steps:**
1. Open exported `presentation.html` in text editor
2. Search for `<img` tags
3. Examine `src` attributes

**Expected Results:**
All image paths should be absolute:
```html
<img src="https://roycan.github.io/lecture_creator/assets/css-style-breakdown.png" alt="CSS Syntax Breakdown">
<img src="https://roycan.github.io/lecture_creator/assets/css-application-methods.png" alt="CSS Application Methods">
<!-- etc. -->
```

**Success Criteria:** No relative paths like `assets/...` remain

---

### ✅ Scenario 3: Empty Base URL
**Steps:**
1. Clear the base URL input field (leave empty)
2. Export presentation
3. Open in browser

**Expected Results:**
- Images use relative paths in exported HTML
- Images will NOT load (expected behavior - no base URL provided)
- Console shows 404 errors for `assets/...` paths

**Success Criteria:** Behavior matches expectation (relative paths preserved)

---

### ✅ Scenario 4: Preview Unaffected
**Steps:**
1. Load markdown with images
2. Enter any base URL
3. Click "Play Preview" (not Export)

**Expected Results:**
- Images display correctly in preview window
- Preview uses local relative paths
- No network requests for images

**Success Criteria:** Preview works as before (unchanged behavior)

---

## Quick Validation Commands

### Check Browser Console
```
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for image loading errors
4. Should see no 404 errors if base URL is correct
```

### Inspect Network Tab
```
1. Open Developer Tools (F12)
2. Go to Network tab
3. Filter by "Img"
4. Refresh page or start presentation
5. Verify images load from correct URLs
```

---

## Common Issues & Solutions

### Issue: Images still don't load
**Check:**
- Base URL ends with `/`? (e.g., `.../lecture_creator/` not `.../lecture_creator`)
- Images actually exist at that URL? (test in browser address bar)
- GitHub Pages is enabled for your repository?
- Correct repository name in URL?

### Issue: Some images load, others don't
**Check:**
- File names match exactly (case-sensitive on Linux/GitHub)
- All images uploaded to GitHub?
- Browser cache (try hard refresh: Ctrl+Shift+R)

### Issue: Console shows mixed content warnings
**Check:**
- Using HTTPS for base URL (not HTTP)?
- All images served over HTTPS?

---

## Success Indicators

✅ **Working Correctly:**
- All 7 diagrams visible in exported presentation
- No console errors
- Images load quickly
- File names in URLs match actual files

❌ **Not Working:**
- Blank spaces where images should be
- 404 errors in console
- Relative paths still in HTML source
- Images only work locally, not when shared

---

## Next Steps

### If Tests Pass:
1. Share exported presentation with students
2. Confirm images load on their devices
3. Mark fix as verified and complete

### If Tests Fail:
1. Share specific error messages
2. Check which images fail (all or specific ones?)
3. Verify GitHub Pages configuration
4. Confirm base URL is accessible in browser

---

## Test Result Template

Copy and share your results:

```
## Test Results - Image Base URL Fix

**Date:** [Date]
**Browser:** [Chrome/Firefox/Safari/Edge] [Version]
**OS:** [Linux/Windows/Mac]

### Scenario 1: Image Loading
- [ ] Pass / [ ] Fail
- Notes: 

### Scenario 2: URL Verification
- [ ] Pass / [ ] Fail
- Notes: 

### Scenario 3: Empty Base URL
- [ ] Pass / [ ] Fail
- Notes: 

### Scenario 4: Preview Behavior
- [ ] Pass / [ ] Fail
- Notes: 

### Overall Status
- [ ] Ready for production
- [ ] Needs adjustments
- [ ] Critical issues found

Additional comments:
```

---

**Estimated Test Time:** 5-10 minutes  
**Required:** Browser, text editor, test-lecture-2.md  
**Optional:** GitHub Pages setup for full end-to-end test
