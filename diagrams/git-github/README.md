# Git & GitHub Collaboration Diagrams

This folder contains Mermaid diagram source files for the Git & GitHub Collaboration lecture.

## Diagrams

### 1. Git Basic Workflow (`01-git-workflow.mmd`)
**Purpose:** Illustrates the fundamental Git workflow: init → add → commit → push → pull

**Shows:**
- Creating a new repository
- Working directory, staging area, local repository, remote repository
- Basic commands and their effects
- Clone and pull for collaboration

**Use in lecture:** Section 2 (Git Basics), Section 4 (GitHub Setup)

---

### 2. Branching Strategy (`02-branching-strategy.mmd`)
**Purpose:** Demonstrates parallel development with feature branches

**Shows:**
- Main branch timeline
- Feature branches splitting off
- Work happening in parallel
- Merging branches back to main
- Version tags

**Use in lecture:** Section 6 (Branches)

---

### 3. GitHub Collaboration Flow (`03-github-flow.mmd`)
**Purpose:** Complete open source contribution workflow

**Shows:**
- Forking a repository
- Cloning to local machine
- Creating feature branch
- Making changes and committing
- Pushing to your fork
- Creating pull request
- Code review process
- Merging to original
- Keeping fork synced

**Use in lecture:** Section 5 (Cloning and Pulling), Section 8 (Pull Requests), Section 9 (Software Maintenance)

---

### 4. Merge Conflicts (`04-merge-conflicts.mmd`)
**Purpose:** Step-by-step conflict resolution process

**Shows:**
- Two developers editing same file
- Conflict occurrence
- Conflict markers in code
- Resolution options (current/incoming/both/manual)
- Staging and committing resolution

**Use in lecture:** Section 7 (Merge Conflicts)

---

### 5. Team Collaboration (`05-team-collaboration.mmd`)
**Purpose:** Multi-developer team workflow

**Shows:**
- Three developers working on different features
- Each with their own branch
- Pull requests from each developer
- Code review process
- Merging to main
- Pulling updates to stay synced

**Use in lecture:** Section 8 (Pull Requests), Section 9 (Software Maintenance)

---

### 6. Three-Tree Architecture (`06-three-tree-architecture.mmd`)
**Purpose:** Git's internal architecture

**Shows:**
- Working Directory (your files)
- Staging Area (index)
- Local Repository (.git)
- Remote Repository (GitHub)
- Commands that move data between them

**Use in lecture:** Section 2 (Git Basics)

---

### 7. Pull Request Review Process (`07-pull-request-review.mmd`)
**Purpose:** Detailed PR workflow from creation to merge

**Shows:**
- Creating PR with template
- Requesting reviewers
- Automated checks (tests, build, conflicts)
- Code review process
- Requesting changes and responding
- Approval workflow
- Merge strategies (squash, merge commit, rebase)
- Cleanup after merge

**Use in lecture:** Section 8 (Pull Requests)

---

## Exporting to PNG

### Using Mermaid CLI

1. **Install mermaid-cli:**
   ```bash
   npm install -g @mermaid-js/mermaid-cli
   ```

2. **Export single diagram:**
   ```bash
   mmdc -i 01-git-workflow.mmd -o ../../diagrams/git-workflow.png -b transparent
   ```

3. **Export all diagrams:**
   ```bash
   # From diagram-src/git-github/ folder
   for file in *.mmd; do
       name="${file%.mmd}"
       mmdc -i "$file" -o "../../diagrams/${name}.png" -b transparent
   done
   ```

### Using Mermaid Live Editor

1. Go to https://mermaid.live/
2. Copy diagram code from .mmd file
3. Paste into editor
4. Click "Actions" → "PNG" or "SVG"
5. Save to `diagrams/` folder

### Using VS Code Extension

1. Install "Markdown Preview Mermaid Support" extension
2. Open .mmd file
3. Right-click diagram → Export as PNG
4. Save to `diagrams/` folder

---

## File Naming Convention

Format: `##-descriptive-name.mmd`

Where:
- `##` = Two-digit number (01, 02, etc.)
- `descriptive-name` = Lowercase with hyphens
- `.mmd` = Mermaid file extension

Examples:
- `01-git-workflow.mmd`
- `02-branching-strategy.mmd`
- `07-pull-request-review.mmd`

---

## Color Scheme

Diagrams use consistent colors:
- **Blue** (`#e3f2fd`) - Working areas, local actions
- **Yellow** (`#fff9e6`) - Staging, preparation
- **Green** (`#e8f5e9`) - Local repository, success states
- **Pink** (`#fce4ec`) - Remote repository, GitHub
- **Orange** (`#fff3e0`) - Commands, actions
- **Red** (`#ffebee`) - Conflicts, errors
- **Purple** (`#e1bee7`) - Pull requests, reviews

---

## D2 Alternative Versions

Some diagrams include commented D2 syntax as an alternative rendering option.

**To use D2:**

1. Install D2: https://d2lang.com/tour/install
2. Create `.d2` file with the D2 syntax from comments
3. Render: `d2 diagram.d2 output.png`

---

## Maintenance

When updating diagrams:
- Keep consistent styling across all diagrams
- Use clear, simple labels
- Include Filipino context where appropriate
- Export to PNG at 2x resolution for clarity
- Update this README if adding new diagrams

---

## License

These diagrams are part of the Lecture Creator project and follow the same license.

**Last updated:** November 13, 2025
