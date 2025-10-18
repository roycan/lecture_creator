# Lecture Creator - Student-Friendly HTML Presentation Exporter

A simple tool to convert Markdown lectures into self-contained HTML presentations with text-to-speech narration.

## Recent Improvements (October 2025)

### What Changed
- **Removed ZIP Export**: Simplified to single HTML file export only
- **Robust Voice Loading**: Better handling of browser voice initialization
- **Manual Controls**: Students can now navigate slides manually with buttons or keyboard
- **Progress Indicator**: Shows current slide number (e.g., "Slide 3 of 10")
- **Error Handling**: Clear status messages and graceful fallbacks
- **Better UI**: Loading spinner, status messages, improved mobile support

### Why These Changes
The previous ZIP export required students to:
1. Extract the ZIP file
2. Run a local web server (or deal with CORS errors)
3. Have specific browser permissions enabled

The new single HTML export is much simpler:
- ✅ Students just double-click the HTML file
- ✅ Works offline from file:/// URLs
- ✅ No server or special setup needed
- ✅ Works even if text-to-speech is unavailable

## How to Use

### For Teachers (Creating Lectures)

1. **Open `index.html` in a web browser**

2. **Write or paste your Markdown lecture**
   - Use `#` for titles (these create new slides)
   - Use `##` and `###` for subtitles
   - Include lists, code blocks, images, etc.
   - See `test-lecture.md` for examples

3. **Preview the lecture**
   - Click "Play Preview" to test the narration
   - Adjust voice, rate, and pitch as desired

4. **Export for students**
   - Click "Export for Students"
   - Save the `presentation.html` file
   - Share this single file with your students

### For Students (Viewing Lectures)

1. **Download the HTML file** your teacher shared

2. **Double-click to open** in any modern web browser
   - Chrome, Firefox, Edge, Safari all work

3. **Wait for initialization** (a few seconds)
   - The page will show "Ready!" when voices are loaded
   - If voices don't load, you can still use manual mode

4. **Click "Start Presentation"**
   - Slides will advance automatically with narration
   - Or use the navigation buttons / keyboard

5. **Navigation Options**:
   - **Next button** (bottom-right): Skip to next slide
   - **Previous button**: Go back to review
   - **Spacebar** or **→ arrow**: Next slide
   - **← arrow**: Previous slide

## Markdown Format Guide

### Creating Slides

Each heading level 1 (`#`) or level 2 (`##`) creates a new slide:

```markdown
# Introduction
Welcome to the lecture!

## Main Topic
This becomes slide 2

### Subtopic
This is still part of slide 2

## Another Topic
This becomes slide 3
```

### Formatting Options

```markdown
**Bold text** for emphasis
*Italic text* for subtle emphasis
`inline code` for technical terms

- Bullet point 1
- Bullet point 2

1. Numbered item
2. Another item

![Image description](image-url.jpg)

```

### Code Blocks

Use triple backticks for code:

````markdown
```python
def hello():
    print("Hello, students!")
```
````

## Voice Customization

### In the Editor
- **Voice**: Select your preferred narration voice
- **Rate**: Adjust speed (0.6 = slower, 1.3 = faster)
  - Recommended: 0.9-1.0 for teaching
- **Pitch**: Adjust tone (usually leave at 1.0)

### In Exported Files
Students can also adjust these settings before starting the presentation.

## Troubleshooting

### "Loading voices..." never completes
- **Solution**: Wait 3-5 seconds, then click "Start Anyway"
- The browser will use its default voice
- This is normal on some Linux systems or older browsers

### Speech doesn't work
- **Check**: Is your system volume on?
- **Check**: Does your browser support text-to-speech?
- **Fallback**: Use the Next/Previous buttons for manual navigation

### Exported file shows blank page
- **Check**: Make sure you opened the HTML file in a browser
- **Try**: Right-click → Open With → Browser name
- **Check**: Browser console for errors (F12 → Console tab)

### File:/// URL restrictions
Modern browsers should work fine with file:/// URLs for this tool. If you encounter issues:
- Try a different browser (Chrome/Firefox recommended)
- Or serve via a simple HTTP server

## Technical Details

### Browser Compatibility
- **Chrome/Chromium**: ✅ Excellent support
- **Firefox**: ✅ Excellent support
- **Safari**: ✅ Good support
- **Edge**: ✅ Excellent support
- **Mobile browsers**: ⚠️ Limited voice selection

### File Size
- Small lecture (10 slides): ~50-100 KB
- Medium lecture (30 slides): ~150-300 KB
- Large lecture (100 slides): ~500KB-1MB

Images are NOT embedded, only referenced by URL.

### Privacy & Offline Use
- ✅ Works completely offline
- ✅ No external dependencies after export
- ✅ No tracking or analytics
- ✅ No internet connection required

### Voice API
Uses the Web Speech API (speechSynthesis) built into modern browsers:
- Free and built-in
- Quality depends on your operating system
- Windows/Mac have excellent voices
- Linux voices may be more robotic

## Development Notes

### Architecture
- **Frontend only**: No backend server needed
- **ES5 compatible**: Works in older browsers
- **No build step**: Plain HTML/CSS/JS
- **Self-contained exports**: Everything in one file

### Key Files
- `index.html`: Main application interface
- `app.js`: Application logic and export functionality
- `style.css`: (Optional) Additional styling
- `test-lecture.md`: Example lecture for testing

### Dependencies
- [Marked.js](https://marked.js.org/): Markdown parsing
- [FileSaver.js](https://github.com/eligrey/FileSaver.js): File download

### Recent Code Changes
See `plan-export-fix.md` for the detailed implementation plan.

## Future Enhancements

Possible improvements:
- [ ] Pause/Resume button during playback
- [ ] Jump to specific slide
- [ ] Embedded images (base64 encoding)
- [ ] PDF export option
- [ ] Slide notes (visible to teacher only)
- [ ] Timer/duration estimates

## License

This project is free to use for educational purposes.

## Support

If students or teachers encounter issues:
1. Check the Troubleshooting section above
2. Try the `test-lecture.md` example
3. Test in a different browser
4. Check browser console for error messages (F12)

---

**Version**: 2.0 (October 2025)  
**Status**: Production ready  
**Tested on**: Chrome 119, Firefox 120, Edge 119 (Linux/Windows)
