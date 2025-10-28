# Changelog

All notable changes to the Lecture Creator project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2.2.0] - October 28, 2025

### Added
- **Dynamic Speed Control** - Persistent speed slider in navigation controls (auto-play mode only)
- **Keyboard Shortcuts for Speed** - Press `+` or `-` to adjust playback speed by 0.1x increments
- **Visual Speed Feedback** - Toast notification appears when using keyboard shortcuts showing current speed
- **Speed Control Hint** - Small tip in start overlay teaching students about `+`/`-` shortcuts
- Speed control automatically syncs initial value from start overlay settings
- Speed control hidden in manual mode (not applicable without TTS)

### Changed
- Speed (rate) control moved from start overlay to persistent navigation bar
- Speed changes now apply dynamically during presentation (affects next sentence)
- Pitch control remains in start overlay for initial setup (rarely needs mid-presentation adjustment)

### Improved
- **Self-Paced Learning** - Students can adjust speed on-the-fly without restarting
- **Better Comprehension** - Slow down for complex topics (0.6x), speed up for review (1.3x)
- **Power User Features** - Keyboard shortcuts provide quick speed adjustments
- **Smart Visibility** - Speed control only shows when relevant (auto-play mode with TTS)
- **Discoverable Controls** - Speed slider always visible in nav bar, keyboard hint in overlay

### Technical Details
- Speed slider: 100px wide on desktop, 150px on mobile (better touch target)
- Range: 0.6x - 1.3x, step 0.05, default 0.95x
- Toast notification: 800ms display, center screen, auto-fade
- Keyboard shortcuts check focus (don't trigger while typing in inputs)
- Speed value updates in real-time as slider moves
- ES5 compliant code (browser compatibility)

---

## [2.1.4] - October 20, 2025

### Changed
- **Enhanced Image Display** - Images now display up to 25% larger for improved readability
- Changed image `max-width` from `80%` to `100%` of slide container (up to 1200px on desktop)
- Replaced `max-height: 50vh` constraint with `height: auto` for natural aspect ratio preservation
- Images now benefit from natural vertical flow introduced in v2.1.3

### Improved
- **Diagram Readability** - Text in educational diagrams (flowcharts, box models, etc.) now significantly more readable
- **Natural Sizing** - Images display at their natural dimensions without artificial height constraints
- **Consistent with v2.1.3** - Aligns with natural vertical flow philosophy (no viewport constraints)
- **Responsive Design** - Images scale appropriately on all devices while maximizing available space

### Technical Details
- Images can now occupy full slide container width (1200px max on desktop)
- Aspect ratios maintained perfectly with `height: auto`
- Border radius (8px) and margins (1.5rem vertical) preserved for professional appearance
- No breaking changes to existing functionality
- Recommended image resolution: 1200-1600px wide for optimal display quality

---

## [2.1.3] - October 20, 2025

### Changed
- **Natural Vertical Flow** - Slides now extend vertically with page-level scrolling instead of being constrained to viewport height
- Slide container uses `min-height: 100vh` and `height: auto` to allow content to grow naturally
- Vertical alignment changed from `center` to `flex-start` (top-aligned)
- Removed internal scrolling (`overflow-y`) from slide container - uses natural page scroll instead
- Added `max-width: 1200px` to slide container for optimal readability
- Increased bottom padding to 200px to accommodate fixed navigation buttons

### Fixed
- **ASCII Art Display (Definitive Fix)** - Code blocks now display ASCII art perfectly without scrolling
- Changed `white-space` from `pre-wrap` to `pre` (strict spacing preservation)
- Removed `word-break: break-all` that was destroying ASCII character alignment
- Changed `overflow-x` from `auto` to `visible` (no internal horizontal scrolling)
- Reduced font size to 0.8em for better fit while maintaining readability
- Added `pre code` specific styling to ensure proper inheritance

### Improved
- **User Experience** - Single scrollbar (page-level) instead of multiple nested scrollbars
- **Self-Paced Learning** - Students can pause and scroll through long slides at their own pace
- **Code Readability** - Full code examples visible without internal scrolling
- **Mobile Friendly** - Natural vertical scroll works perfectly on touch devices
- **Accessibility** - Natural document flow improves screen reader navigation

### Technical Details
- Slide container now acts like a webpage section rather than a fixed viewport
- Works seamlessly with pause/resume feature (v2.1.2)
- Navigation buttons remain fixed and always visible
- Short slides still look like traditional presentation slides
- Long slides with code/ASCII art display fully with page scroll
- Content constrained to readable width (1200px max)

---

## [2.1.2] - October 20, 2025

### Added
- **Pause/Resume Button** - Orange pause button appears in auto-play mode navigation controls
- **Spacebar Pause Shortcut** - In auto mode, spacebar pauses/resumes presentation; in manual mode, spacebar advances slides
- Pause button changes to green "▶ Resume" when paused
- Pause button hidden in manual mode (not needed)
- Visual feedback with color changes (orange = pause, green = resume)

### Fixed
- **ASCII Art Display** - Code blocks now render correctly with proper monospace fonts
- Pre-formatted text blocks now use proper font stack: 'Courier New', Consolas, Monaco, etc.
- Reduced font size to 0.85em for better fit in presentation slides
- Added `white-space: pre-wrap` to allow wrapping of long code lines while preserving formatting
- Box-drawing characters (└ ┌ │ ─) now display correctly without horizontal scrolling
- Maximum width constraint ensures code blocks fit within slide container

### Technical Details
- Added `isPaused` state variable to track pause status
- Modified `playSlide()` to check pause state before advancing
- Speech synthesis canceled when paused, resumed when unpaused
- Keyboard handler differentiates between auto and manual modes for spacebar behavior
- CSS improvements for `<pre>` blocks: monospace fonts, line-height 1.4, word-break support

---

## [2.1.1] - October 20, 2025

### Fixed
- **Critical:** Images not displaying in exported presentations
- Base URL functionality now properly implemented in export logic
- Image paths are converted from relative to absolute URLs during export when base URL is provided
- Exported presentations can now load images from GitHub Pages or any hosted location

### Technical Details
- Added image path processing in export button click handler
- Relative paths (e.g., `assets/image.png`) are converted to absolute URLs using the base URL input
- Absolute URLs and protocol-relative URLs are preserved unchanged
- Preview window continues to use relative paths (works with local files)
- Implementation matches the archive version that was previously working

---

## [2.1.0] - October 19, 2025

### Added
- **Manual Mode Toggle** - Students can now choose between auto-play and manual navigation on the exported presentation start screen
- Mode selection UI with clear radio button options:
  - "Auto-play with voice" - Default behavior with automatic slide advancement
  - "Manual navigation" - Disables auto-play, allows full control via Previous/Next buttons
- Voice controls automatically hide when manual mode is selected
- Faster startup in manual mode (skips voice loading entirely)
- Enhanced status messages that update based on selected mode
- Platform-specific recommendation hint for Linux + Chrome users

### Fixed
- **Critical:** Slides advancing too fast on Linux/Chromium when speech synthesis is unavailable
- Students on platforms without working speech synthesis can now control presentation pace effectively
- Manual mode prevents auto-advance when speech fails, giving students time to read content

### Changed
- Start overlay now includes mode selection before voice controls
- Voice loading only occurs in auto-play mode (optimization)
- Navigation functions now respect manual mode (don't cancel speech if none is playing)
- Start button text updates dynamically based on selected mode
- Initialization sequence adapted to support both playback modes

### Technical Details
- Added `manualMode` state variable to track user preference
- Modified `playSlide()` to skip speech synthesis in manual mode
- Enhanced `setupModeSelection()` function to handle mode toggle events
- Updated `initializeVoiceLoading()` to skip when manual mode selected
- Improved CSS with mode selection styling (~60 lines)
- Added HTML structure for mode selection fieldset (~30 lines)
- Total code addition: ~145 lines (template within `createSingleHTML()`)

---

## [2.0.0] - October 18, 2025

### Changed
- **Breaking:** Removed ZIP export functionality
- Replaced multi-file ZIP exports with single self-contained HTML files
- Slides now embedded as JSON within `<script type="application/json">` tag

### Added
- Single HTML export that works from `file:///` URLs (no server required)
- Robust voice loading system with 3-second timeout and fallback
- Manual navigation controls (Previous/Next buttons)
- Keyboard shortcuts for navigation (arrows, spacebar, escape)
- Progress indicator showing "Slide X of Y"
- Loading spinner and status messages
- Comprehensive error handling and console logging

### Removed
- ZIP export button and related code
- JSZip dependency
- Separate player.js and slides.json files
- Web server requirement for students

### Fixed
- CORS errors when opening exported files locally
- Student confusion from file extraction process
- Regex syntax errors in exported HTML (template escaping)

---

## [1.0.0] - October 2025 (Initial Release)

### Added
- Markdown to HTML presentation converter
- Text-to-speech narration using Web Speech API
- Voice selection dropdown with US English preference
- Rate and pitch controls for speech customization
- In-app preview functionality
- Sentence-splitting for natural speech cadence
- Mobile-responsive design
- Dark theme presentation player

### Features
- Teachers create lectures in markdown format
- Headings (`# Title`) create new slides
- Support for lists, code blocks, images, and formatting
- Live preview before export
- Offline-capable exports for students

---

## Future Considerations

### Under Discussion
- Local image bundling (embed as base64 data URLs)
- Slide thumbnails navigation
- Custom themes/color schemes
- Presentation notes (teacher-only view)
- Slide transitions and animations
- Export as PDF option
- Service Worker for true offline PWA

### Known Limitations
- Linux/Chromium speech synthesis from `file:///` URLs (platform limitation)
- Images must use absolute URLs or online hosting
- Large presentations create large single-file exports
- Mobile devices have limited voice selection
- No slide editing after export (by design - simplicity)

---

**Note:** Version numbers follow [Semantic Versioning](https://semver.org/):
- **Major** (X.0.0): Breaking changes or major rewrites
- **Minor** (0.X.0): New features, backward compatible
- **Patch** (0.0.X): Bug fixes, backward compatible
