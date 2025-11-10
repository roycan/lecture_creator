# 📁 Folder Structure Guide

**Purpose:** Explains the organizational pattern for the lecture_creator project.

**Last Updated:** November 10, 2025

---

## 🗂️ Directory Overview

```
lecture_creator/
├── diagram-src/          # Diagram source files (organized by lecture)
├── diagrams/             # PNG renders of diagrams (flat)
├── assets/               # HTML, CSS, JS, JSON (flat)
├── archive/              # Old planning docs and versions
├── logs/                 # Session documentation
├── *.md                  # Lecture markdown files (root level)
└── [other files]         # Config, git, etc.
```

---

## 📊 diagram-src/

**Purpose:** Source files for all diagrams

**Organization:** By lecture topic

**Structure:**
```
diagram-src/
├── dom/
│   ├── dom-tree.mmd
│   ├── event-flow.mmd
│   └── ...
├── ajax-fetch-async/
│   ├── promise-states.mmd
│   ├── promise-states.d2
│   ├── promise-states.puml
│   ├── fetch-lifecycle.mmd
│   └── ...
├── web-server-basics/          # Added: Nov 10, 2025
│   ├── 01-request-response-flow.md
│   ├── 02-folder-structure.md
│   ├── 03-express-routing.md
│   ├── 04-ejs-rendering.md
│   ├── 05-json-vs-database.md
│   ├── 06-form-submission.md
│   ├── 07-deployment-flow.md
│   ├── 08-middleware-concept.md
│   ├── 09-mvc-pattern.md
│   └── 10-static-files.md
├── css/
│   ├── box-model.mmd
│   └── ...
└── js-basics/
    └── ...
```

**File Types:**
- `.mmd` - Mermaid (primary format)
- `.d2` - D2 diagrams
- `.puml` - PlantUML
- `.txt` - Text-based visualizations
- `.md` - All-in-one markdown (Mermaid + D2 + ASCII + explanations)
- `.svg` - SVG sources (if any)

**Why Organized by Lecture:**
- Easy to find all diagrams for one lecture
- Simple to package a complete lecture
- Clear separation between topics
- Easy to archive or share

**Workflow:**
1. Create diagram source here
2. Export to PNG → `diagrams/`
3. Reference PNG in markdown lectures

---

## 🖼️ diagrams/

**Purpose:** PNG renders of diagrams for use in markdown

**Organization:** Flat with descriptive names

**Structure:**
```
diagrams/
├── promise-states.png
├── fetch-lifecycle.png
├── event-loop.png
├── dom-tree.png
├── css-box-model.png
├── async-await-comparison.png
└── ...
```

**Naming Convention:**
- Descriptive concept names
- Kebab-case (lowercase with hyphens)
- No topic prefixes needed
- Examples: `promise-states.png`, `event-loop.png`

**Why Flat Structure:**
- Simple markdown paths: `![](diagrams/promise-states.png)`
- No nested path management
- Easy to preview all diagrams
- Simpler to maintain

**Alternative Considered:**
- Mirroring `diagram-src/` organization was considered
- Rejected because it complicates markdown paths
- Current flat structure is simpler and scales well

---

## 🎨 assets/

**Purpose:** All HTML, CSS, JavaScript, and JSON files used by lectures

**Organization:** Flat with optional prefixing

**Structure:**
```
assets/
├── styles.css                    # Shared by ALL lectures
├── promise-basics.html
├── fetch-demo.html
├── weather.html
├── directory.html
├── provinces.json
├── students.json
├── dashboard-starter.html
└── ...
```

**File Types:**
- `.css` - Shared styles
- `.html` - Practice files, mini-projects, challenges
- `.json` - Mock data for exercises
- `.js` - Standalone JavaScript (if needed)

**Naming Convention:**
- Descriptive names based on content/purpose
- Optional topic prefixes if helpful (e.g., `dom-practice1.html`)
- JSON files: descriptive of data content (e.g., `provinces.json`, `students.json`)

**Special File: styles.css**
- ⚠️ **Shared by ALL lectures** - never duplicate
- Contains common classes: `.btn`, `.input`, `.card`, `.container`
- All HTML practice files link to: `<link rel="stylesheet" href="styles.css">`
- Maintains consistent look across all lectures

**Why Flat Structure:**
- Simple relative paths in HTML: `href="styles.css"`
- One shared CSS for consistency
- Easy to see all assets in one view
- No complex path management
- Scales well to dozens of files

**Alternative Considered:**
- Topic-based organization (e.g., `assets/dom/`, `assets/ajax/`)
- Rejected because it complicates relative paths
- Would require different CSS paths per lecture
- Current flat structure with optional prefixes works better

---

## 🗄️ archive/

**Purpose:** Storage for completed planning documents and old versions

**What Goes Here:**
- ✅ Completed planning documents (after implementation)
- ✅ Superseded file versions
- ✅ Old implementation logs (after summary)
- ✅ Feasibility studies (after decisions made)
- ✅ Experimental code (after finalizing)
- ❌ NOT active documentation
- ❌ NOT current implementations

**Organization:**
- Can be organized or flat depending on volume
- Date prefixes helpful: `2025-11-10-old-planning.md`
- Consider adding `archive/README.md` if it grows large

**Example Contents:**
```
archive/
├── old-implementation-v1.md
├── feasibility-study-export-methods.md
├── planning-ajax-lecture-draft1.md
└── superseded-dashboard-v1.html
```

**When to Archive:**
- After completing an implementation phase
- When planning docs are finalized
- After major refactoring (keep old version)
- Before major reorganization

---

## 📝 logs/

**Purpose:** Documentation that survives chat summarizations

**Organization:** Focused markdown files

**Structure:**
```
logs/
├── SESSION-CONTEXT.md              # Patterns, conventions, examples
├── FOLDER-STRUCTURE.md             # This file
├── LECTURE-CREATION-PATTERN.md    # Step-by-step workflow
├── ajax-fetch-implementation-2025-11-10.md  # Dated logs
├── prompts.md                      # AI context restoration
├── project-overview.md             # What/why/who
├── technical-architecture.md       # How it's built
└── ...
```

**File Categories:**

### Core Pattern Files (permanent)
- `SESSION-CONTEXT.md` - Quick reference for patterns
- `FOLDER-STRUCTURE.md` - This file, folder organization
- `LECTURE-CREATION-PATTERN.md` - Workflow template
- `prompts.md` - AI context restoration guide

### Implementation Logs (dated)
- Format: `{topic}-implementation-{date}.md`
- Example: `ajax-fetch-implementation-2025-11-10.md`
- Documents specific lecture creation sessions
- Includes design decisions and file inventory

### Project Documentation (evolving)
- `project-overview.md` - Overall project purpose
- `technical-architecture.md` - System design
- `known-issues-and-workarounds.md` - Bug tracking
- Other project-specific docs

**Why These Files:**
- Survive chat summarizations
- Provide context restoration
- Document patterns and decisions
- Enable consistent future work

---

## 📄 Root Level Files

**Lecture Markdown Files:**
```
lecture_creator/
├── dom-lecture.md
├── ajax-fetch-lecture.md
├── js-lecture-part1.md
├── js-lecture-part2.md
└── css-lecture.md
```

**Why Root Level:**
- Main deliverables are highly visible
- Easy to find primary content
- No deep nesting to navigate
- Clear what the project produces

**Other Root Files:**
- `README.md` - Project overview
- `index.html` - Main application
- `app.js` - Application logic
- `style.css` - Application styles (not lecture assets)
- Git/config files

---

## 🎯 Design Principles

### Simplicity Over Organization
- Start flat where possible
- Organize only when it adds clear value
- Avoid premature abstraction

### Consistent Relative Paths
- Flat structures keep HTML paths simple
- `href="styles.css"` works everywhere
- `![](diagrams/image.png)` is easy to maintain

### Easy to Find
- Source files organized by topic
- Output files flat for quick access
- Descriptive naming over prefixes

### Scale Gradually
- Current structure handles dozens of lectures
- Can reorganize if it grows to hundreds
- Don't over-engineer for hypothetical scale

### Context Preservation
- Logs survive summarizations
- Patterns documented
- Decisions explained
- Examples referenced

---

## 🔄 Typical Workflow

### Creating a New Lecture

1. **Create main markdown** at root: `{topic}-lecture.md`
2. **Create practice HTMLs** in `assets/`: link to `styles.css`
3. **Create mock data JSONs** in `assets/`: descriptive names
4. **Create diagram sources** in `diagram-src/{topic}/`: multiple formats
5. **Export diagrams to PNGs** in `diagrams/`: flat, descriptive names
6. **Link everything** in the main markdown
7. **Document the work** in `logs/{topic}-implementation-{date}.md`

### Updating Existing Lecture

1. Edit files in place (markdown, assets, diagrams)
2. If major changes, archive old version first
3. Update implementation log if significant

### Adding New Diagrams

1. Create source in `diagram-src/{topic}/`
2. Export PNG to `diagrams/`
3. Reference in markdown: `![](diagrams/{name}.png)`

---

## 📋 Quick Reference

| Want to... | Look in... |
|------------|-----------|
| Find lecture content | Root level `*.md` files |
| Find practice HTML files | `assets/` folder |
| Find mock data | `assets/` folder (`.json` files) |
| Find diagram sources | `diagram-src/{topic}/` |
| Find diagram PNGs | `diagrams/` folder |
| Understand patterns | `logs/SESSION-CONTEXT.md` |
| Restore AI context | `logs/prompts.md` |
| Learn workflow | `logs/LECTURE-CREATION-PATTERN.md` |
| See old planning docs | `archive/` folder |

---

## 🚀 Benefits of This Structure

✅ **Simple paths** - No complex relative path management  
✅ **Easy to find** - Logical separation by purpose  
✅ **Scales well** - Handles dozens of lectures easily  
✅ **Context survives** - Logs preserve knowledge  
✅ **Easy to share** - Can package complete lectures  
✅ **Maintainable** - Clear where everything belongs  
✅ **Consistent** - One shared CSS, one pattern  

---

**Questions or suggestions?** Document them in logs/ or discuss with the team.
