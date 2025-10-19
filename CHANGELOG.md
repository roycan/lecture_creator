# Changelog

All notable changes to the Lecture Creator project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
