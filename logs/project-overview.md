# Project Overview

**Last Updated:** October 19, 2025  
**Status:** Production ready with known platform limitations  
**Version:** 2.0 (Single HTML Export)

## What It Is

Markdown-to-HTML presentation converter with text-to-speech narration. Teachers create lectures in markdown; students get self-contained HTML files that play automatically with voice narration.

## Problem It Solves

**Context:** Philippines, heavy rains cause school absences  
**Challenge:** Students miss lectures, fall behind  
**Solution:** Teachers create audio-visual presentations students can view offline at home

## Target Users

**Primary (Teachers):**
- Write lectures in markdown (familiar format)
- Preview with voice before sharing
- Export single HTML file to distribute

**Secondary (Students):**
- Download HTML file
- Double-click to open (no installation)
- Listen to narrated presentation offline
- Navigate manually if needed

## Core Features

### Current (v2.0)
- Markdown parsing (headings create slides)
- In-app preview with voice
- **Single HTML export** (October 2025 update)
  - Self-contained (embedded slides)
  - Works from file:/// URLs
  - No server required
  - Manual navigation fallback
- Voice/rate/pitch controls
- Progress indicator
- Keyboard shortcuts

### Removed
- ZIP export (October 18, 2025)
  - Reason: Students confused by extraction
  - Reason: Required web server (CORS issues)
  - Replaced with single HTML

## Key Design Decisions

**Philosophy:** Simplicity over features
- One file beats multiple files
- Offline beats online-required
- Manual fallback beats feature-only
- Clear errors beat silent failures

**Trade-offs Accepted:**
- Voice quality depends on OS (acceptable)
- Images must be hosted online (acceptable)
- Large presentations = large files (rare issue)

## Technical Stack

**Frontend Only:**
- Plain HTML/CSS/JavaScript
- No build process
- No backend server
- No external APIs (except CDN dependencies in editor)

**Dependencies:**
- Marked.js: Markdown parsing
- FileSaver.js: File download
- Web Speech API: Text-to-speech (browser built-in)

## Current Status

**Working:**
- ✅ Markdown parsing and preview
- ✅ Voice narration in editor
- ✅ Single HTML export
- ✅ Manual navigation
- ✅ Error handling and logging

**Known Issues:**
- ⚠️ Linux/Chromium: Poor speech synthesis from file:/// URLs
- ⚠️ Mobile: Limited voice selection
- ⚠️ Images: Must use absolute URLs or online hosting

**Workarounds Available:**
- Use Firefox on Linux (better TTS)
- Run local server (fixes speech)
- Use manual navigation (always works)

## Success Metrics

**For Teachers:**
- Can create lecture in < 15 minutes
- Preview works reliably
- Export is one-click simple

**For Students:**
- Can open file without help
- Presentation plays automatically (or manual option clear)
- Works on common platforms (Windows/Mac/Linux)

## File Locations

**Main Application:**
- `index.html` - Editor interface
- `app.js` - Core logic + export functionality
- `style.css` - Optional styling

**Documentation:**
- `README.md` - User guide
- `plan-export-fix.md` - Implementation plan (October 2025)
- `IMPLEMENTATION.md` - Change summary (October 2025)
- `logs/` - This folder (AI context restoration)

**Testing:**
- `test-lecture.md` - Example content with edge cases

## Next Session Quick Start

**What AI needs to know:**
1. This is an educational tool for Philippines context
2. Main feature is single HTML export with embedded TTS
3. Platform issues (Linux/Chromium) are known and acceptable
4. Code is production-ready but has documented limitations
5. Focus is on simplicity and reliability over features

**Common tasks:**
- Improving voice loading reliability
- Adding student-friendly error messages
- Platform-specific workarounds
- Export enhancements
