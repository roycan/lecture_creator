# 📋 Session Context - Quick Reference

**Purpose:** Key patterns, conventions, and examples to preserve across chat sessions and summarizations.

**Last Updated:** November 10, 2025

---

## 🎯 Project Mission

Creating **interactive markdown-based lectures** for Grade 9 Filipino students that are:
- Culturally relevant (Philippine context)
- Progressive in difficulty
- Interactive with live code examples
- Self-contained (no internet required for practice)

---

## 📁 Folder Structure Pattern

```
lecture_creator/
├── diagram-src/          Source files for diagrams (.mmd, .d2, .puml, .txt, .md)
│   ├── dom/             Organized by lecture topic
│   ├── ajax-fetch-async/
│   ├── web-server-basics/
│   └── css/
├── diagrams/            PNG renders (flat structure)
│   ├── promise-states.png
│   └── event-loop.png
├── assets/              HTML, CSS, JS, JSON for lectures (flat structure)
│   ├── styles.css       (shared by ALL lectures)
│   ├── promise-basics.html
│   └── provinces.json
├── practice-apps/       Node.js/Express practice applications (for web-server lectures)
├── mini-projects/       Complete Express apps (for web-server lectures)
├── support-materials/   Guides and templates (for web-server lectures)
├── archive/             Old planning docs and superseded versions
└── logs/                Session documentation and patterns
```

**Key Principles:**
- `diagram-src/`: Organized by lecture for easy packaging
- `diagrams/`: Flat with descriptive names for simple markdown paths
- `assets/`: Flat structure, one shared `styles.css`
- `archive/`: Completed planning docs, old versions
- `logs/`: Patterns and context that survive summarization

---

## 📝 Lecture Creation Pattern

### Standard Lecture Components

Every complete lecture includes:

1. **Main Markdown** (`{topic}-lecture.md`)
   - Introduction with relatable analogy
   - 5-7 progressive sections
   - Try-It blocks with clickable file links
   - Mini-projects (2-3)
   - Final challenge with starter + solutions
   - Troubleshooting section
   - What's Next section
   - Embedded diagram references

2. **Practice Files** (5-7 HTML files)
   - Progressive difficulty
   - Link to shared `styles.css`
   - Working examples of concepts
   - Interactive UI with buttons/forms

3. **Mini-Projects** (2-3 HTML files)
   - Combine multiple concepts
   - Real-world scenarios
   - More complex than practice files

4. **Final Challenge**
   - Starter template with TODOs
   - 3 complete solution variations
   - Different themes/contexts

5. **Mock Data** (5-10 JSON files)
   - Local data (no internet required)
   - Philippine context
   - Realistic examples

6. **Diagrams** (15-25 source files)
   - Multiple formats (Mermaid, D2, PlantUML)
   - Exported to PNG for markdown
   - Source kept in `diagram-src/{topic}/`

---

## 🇵🇭 Philippine Context Convention

**Always use Philippine examples:**
- Geography: Manila, Cebu, Davao, Quezon City, provinces
- Food: Jollibee, Goldilocks, sari-sari store, pandesal
- Schools: DepEd, Grade 9, sections (Einstein, Newton)
- Government: Barangay, Kagawad, SK Chairman
- Culture: Jeepney, tricycle, barangay officials

**Example themes:**
- Weather dashboard → Philippine cities
- Store analytics → Sari-sari store
- Directory → Barangay officials
- Transport → Metro Manila routes

---

## 🎓 Teaching Patterns

### Progressive Difficulty
1. Start with simplest concept (setTimeout)
2. Build up gradually (Promises → fetch → async/await)
3. Combine concepts (error handling + loading states)
4. Real-world patterns (debouncing, caching, parallel requests)

### Analogies
Use **food ordering** for complex concepts:
- Synchronous: "Stand and wait at counter"
- Asynchronous: "Get claim stub, do other things"
- Promise: "The claim stub itself"
- Callback: "They call your number"

### Try-It Blocks
```markdown
**🎯 Try It:** Basic Example
- Open `assets/practice-file.html` in your browser
- Click the button to see it work
- Try modifying the code and refresh
```

### Code Examples
- Always include complete working code
- Add comments explaining key lines
- Show before/after for refactoring
- Highlight common mistakes to avoid

---

## 🎨 Styling Conventions

**Shared CSS** (`assets/styles.css`):
- Used by ALL lecture practice files
- Consistent look and feel
- Classes: `.btn`, `.input`, `.card`, `.error`, `.success`, `.small`
- Never duplicate styles in individual HTML files

**HTML Structure:**
```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Descriptive Title</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <div class="card">
      <!-- Content here -->
    </div>
  </div>
  <script>
    // JavaScript here
  </script>
</body>
</html>
```

---

## 🔧 Technical Patterns

### Async Code
```javascript
// Loading states pattern
loading.classList.remove('hidden');
error.classList.add('hidden');
results.classList.add('hidden');

try {
  const response = await fetch('data.json');
  if (!response.ok) throw new Error('Failed to load');
  const data = await response.json();
  
  // Show results
  loading.classList.add('hidden');
  results.classList.remove('hidden');
} catch (err) {
  loading.classList.add('hidden');
  error.classList.remove('hidden');
  error.textContent = `Error: ${err.message}`;
}
```

### Debouncing
```javascript
let debounceTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(search, 500);
});
```

### Pagination
```javascript
const perPage = 5;
const start = (currentPage - 1) * perPage;
const end = start + perPage;
const pageItems = items.slice(start, end);
```

---

## 📊 Diagram Guidelines

### Preferred Formats
1. **Mermaid** (.mmd) - Primary, most compatible
2. **D2** (.d2) - Modern, clean aesthetics
3. **PlantUML** (.puml) - Complex diagrams
4. **Text** (.txt) - For timelines/comparisons

### Diagram Types by Concept
- **State diagrams**: Promise states, loading states
- **Sequence diagrams**: Fetch lifecycle, CORS
- **Flowcharts**: Error handling, event loop
- **Gantt/Timeline**: Debouncing, parallel vs sequential
- **Graph**: Comparisons, relationships

### Export Process
1. Create source in `diagram-src/{topic}/`
2. Export to PNG in `diagrams/`
3. Reference in markdown: `![Description](diagrams/filename.png)`

---

## 🗂️ Naming Conventions

### Files
- Markdown lectures: `{topic}-lecture.md`
- Practice files: `{concept}-demo.html`, `{concept}-practice.html`
- Mini-projects: `{project-name}.html`
- Dashboards: `dashboard-{theme}.html`
- Mock data: `{data-type}.json` (descriptive)
- Diagrams: `{concept-name}.png` (descriptive, no prefixes)

### Code Variables
- Clear, descriptive names
- camelCase for JavaScript
- Avoid single letters except loop counters

---

## ✅ Completion Checklist

Before marking a lecture complete:
- [ ] Main markdown has all sections
- [ ] All practice files link correctly
- [ ] All JSON data files load successfully
- [ ] Mini-projects are complete and working
- [ ] Final challenge has starter + 3 solutions
- [ ] All diagrams are created and exported
- [ ] All Try-It blocks reference existing files
- [ ] Shared styles.css is used consistently
- [ ] Philippine context throughout
- [ ] No internet required for practice
- [ ] All error states handled properly
- [ ] Code comments explain key concepts

---

## 🎬 Examples

### HTML Fundamentals Lecture (2025-11-12)

**Files Created:** 16 total
- 1 main lecture markdown (700+ lines, 13 sections)
- 6 practice HTML files (structure, semantic, text, links-images, forms, tables)
- 6 mini-project files (3 starter + 3 solutions: barangay profile, store catalog, contact form)
- 4 final challenge files (1 starter + 3 solutions: elementary, high school, vocational)

**Key Features:**
- Foundation lecture (no prerequisites, structure before style)
- "When to Use HTML" decision framework (unique to this lecture)
- Semantic HTML5 emphasis (header, nav, main, section, aside, footer)
- Philippine contexts: Barangay San Juan, Tindahan ni Aling Rosa, DepEd schools, TESDA training
- Progressive challenge variations: Elementary (K-6, playful) → High School (7-12, professional, SHS tracks) → Vocational (TESDA certifications, job placement)
- Accessibility patterns (labels, alt text, heading hierarchy)
- Forms with validation (required fields, proper input types)
- Tables for structured data

**Key Difference from Other Lectures:**
- **No CSS styling** - Pure HTML structure focus
- **No JavaScript** - Static pages only
- **Embedded CSS** - For final challenge only, minimal styling to demonstrate sections
- **Foundation skill** - Required before CSS/Responsive lectures
- **Three school variations** - Shows adaptation skill (different audiences, contexts, tones)

**See:** `logs/html-lecture-implementation-2025-11-12.md` for full details

---

### AJAX/Fetch Lecture (2025-11-10)

**Files Created:** 44 total
- 1 main lecture markdown (762 lines)
- 6 practice HTML files
- 3 mini-project HTML files
- 4 final challenge files (1 starter + 3 solutions)
- 7 mock JSON data files
- 23 diagram source files

**Key Features:**
- Jollibee ordering analogy for async concepts
- Progressive: setTimeout → Promises → fetch → async/await
- Philippine cities for weather, barangay for directory
- Debouncing, pagination, parallel requests
- All files work offline with local JSON

**See:** `logs/ajax-fetch-implementation-2025-11-10.md` for full details

---

### Web App Basics Part 1 (2025-11-10)

**Files Created:** 121 total
- 1 main lecture markdown (~5000 lines)
- 6 practice Express apps (progressive: routing → EJS → Bulma → JSON read/write)
- 3 mini-projects (barangay-directory, class-list, store-inventory)
- 4 support files (command line cheat sheet, Railway guide, templates)
- 10 diagram sources (all-in-one .md format with Mermaid + D2 + ASCII + explanations)

**Key Features:**
- Command line → Express → EJS → Bulma → JSON → Railway deployment
- Philippine context (barangay officials, Filipino names, sari-sari store)
- Read-first, write-later approach (separate apps for JSON read vs write)
- MVC pattern introduction
- Complete deployment workflow

**Key Difference from Frontend Lectures:**
- **Node.js/Express apps** (not static HTML)
- **Diagram format:** All-in-one .md files (Mermaid + D2 + ASCII + explanations) instead of separate format files
- **Practice structure:** Multi-file Express apps with package.json, views/, public/, data/
- **Mini-projects:** Complete web applications with forms and JSON storage
- **Deployment focus:** Railway platform integration

**See:** `logs/express-basics-implementation-2025-01-10.md` for full details

### Example 3: HTML Fundamentals Lecture (Foundation)

**File:** `html-lecture.md` (~700 lines, 13 sections)  
**Created:** November 12, 2025  
**Status:** ✅ Complete with practice files, mini-projects, final challenge, diagrams

**Teaching Approach:**
- Structure-first philosophy (HTML only, no CSS/JS)
- Semantic HTML5 emphasis (header, nav, main, aside, footer)
- Accessibility focus (labels, alt text, heading hierarchy)
- Real-world forms (contact forms, enrollment, registration)
- Proper table structure (thead/tbody, rowspan/colspan)
- Three school website variations (elementary, high school, vocational)

**Philippine Context Examples:**
- San Juan Elementary School
- Philippine Science High School
- TESDA Training Center
- Barangay San Juan (government context)
- Tindahan ni Aling Rosa (sari-sari store)
- Filipino names, DepEd curriculum, TESDA certifications

**Practice Files (6):**
- Basic structure, semantic tags, text content, links, forms, tables

**Mini-Projects (3 pairs: starters + solutions):**
- Elementary school website (simple)
- High school website (intermediate, with SHS tracks)
- Vocational training center (advanced, TESDA context)

**Final Challenge (1 starter + 3 solutions):**
- Elementary, high school, and vocational school variations
- Tests adaptation skills with same core concepts

**Diagrams (7 in diagram-src/html/):**
- Document structure (Mermaid), semantic layout, heading hierarchy
- Form structure, table structure, link types, attribute syntax

**Key Features:**
- "When to Use HTML" decision framework section
- Pure HTML (no styling) - foundation for CSS lectures
- Complete accessibility patterns demonstrated
- All practice files work offline
- Progressive difficulty: simple tags → complex forms/tables
- Zero prerequisites (true foundation lecture)

**Builds Toward:** `responsive-bulma-lecture.md` (adds CSS styling)

**See:** `logs/html-lecture-implementation-2025-11-12.md` for full details

### Example 4: Responsive Bulma Lecture (CSS Framework)

**File:** `responsive-bulma-lecture.md` (~2,400 lines, 9 sections)  
**Created:** November 12, 2025  
**Status:** ✅ Complete with practice files, mini-projects, final challenge, diagrams

**Teaching Approach:**
- Mobile-first design (Philippine 70% mobile reality)
- Bulma CSS framework via CDN (no local setup)
- Viewport meta tag critical importance
- Responsive grid system (columns, breakpoints)
- Print styles as KILLER FEATURE (@media print for government forms)
- Progressive enhancement workflow
- Testing on real devices (budget Android phones)

**Philippine Context (100%):**
- Budget Android phones (Samsung A, OPPO, Realme, Xiaomi Redmi)
- Government forms (barangay clearance, business permits, certificates)
- Sari-sari store product catalogs (responsive grids)
- Barangay San Juan government offices
- Skills training programs (TESDA context)
- Ink cost savings (black & white printing)
- Slow internet considerations (3G/4G, outdoor usage)

**Practice Files (6):**
- Bulma grid demo, responsive helpers, mobile-friendly forms
- Product catalog (2→3→4 column progression)
- Responsive dashboard, printable clearance form

**Mini-Projects (3 pairs: starters + solutions):**
- Barangay clearance (printable government form)
- Responsive store catalog (sari-sari store, grid mastery)
- Certificate template (landscape print orientation)

**Final Challenge (1 starter + 3 solutions):**
- Business permit application (form sections, auto-numbers)
- Barangay certificate of residency (dynamic text generation)
- School enrollment form (compact layout, parent info)
- All combine responsive + printable features

**Diagrams (8 in diagram-src/bulma/):**
- Grid system, breakpoints (with PH device examples)
- Responsive helpers (show/hide matrix)
- Print workflow (complete @media print guide) ← KILLER FEATURE
- Mobile-first approach, viewport meta tag
- Media query syntax, column sizing reference

**Key Features:**
- **Print Styles Emphasis** - Government forms that print clean (black & white, one-page)
- Mobile-first workflow (start with phone, enhance for desktop)
- Bulma CDN setup (no npm/build tools needed)
- Responsive testing guide (Chrome DevTools + real devices)
- @media query fundamentals
- "When to Use Bulma" decision framework
- 70% of files demonstrate print styles

**Unique Feature:** Print styles as primary use case (not just "bonus feature")
- Real-world problem: Philippine government offices need printable forms
- Cost savings: Black & white printing saves expensive ink
- Practical skill: Students can create barangay clearance, certificates, permits
- Universal need: Schools, businesses, government all need printable documents

**Prerequisites:** HTML lecture (builds on semantic HTML foundation)

**Builds Toward:** CSS custom styling, JavaScript interactivity

**See:** `logs/responsive-bulma-implementation-2025-11-12.md` for full details

---

## 💡 Common Patterns to Reuse

### Weather Dashboard Pattern
- City selector buttons
- Mock JSON data for fallback
- Loading/success/error states
- Refresh functionality

### Directory/Search Pattern
- Debounced search input
- Filter dropdowns
- Pagination with page buttons
- Result count display

### Quiz Pattern
- Load questions from JSON
- Track current question index
- Calculate and display score
- Retry functionality

### Dashboard Pattern
- Load data button
- Stats cards in grid
- Detailed table/view
- Refresh button
- Loading/error states

---

## 🚫 Things to Avoid

- ❌ Requiring internet for practice files
- ❌ Duplicating styles in individual HTML files
- ❌ Western-only examples (use Philippine context)
- ❌ Complex nested folder structures
- ❌ Incomplete error handling
- ❌ Missing loading states on async operations
- ❌ Hardcoded data instead of JSON files
- ❌ Single-format diagrams (provide alternatives)

---

## 📚 Reference Examples

**Best complete lecture:** `ajax-fetch-lecture.md`
**Best practice file:** `assets/search-demo.html` (debouncing)
**Best mini-project:** `assets/directory.html` (search + filter + pagination)
**Best dashboard:** `assets/dashboard-transport.html` (stats + table + filter)
**Best diagram source:** `diagram-src/ajax-fetch-async/` (multiple formats)

---

**Note:** This file is designed to survive chat summarizations and provide quick context restoration for AI assistants working on this project.
