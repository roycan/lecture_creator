# Authentication Diagrams - Source Files

This directory contains source files for authentication diagrams used in **authentication-sessions-lecture.md**.

---

## 📁 Diagram Inventory

### Must-Have Diagrams (3 concepts, 2 versions each)

#### 1. Middleware Execution Flow
Shows how middleware chain executes for protected routes (requireLogin → requireAdmin → route handler).

- **Primary:** `01-middleware-flow.graphviz.md` (Graphviz/DOT)
- **Alternate:** `01-middleware-flow.mermaid.md` (Mermaid)
- **Output:** `../../diagrams/authentication/middleware-flow.png`
- **Used in:** Section 6 - Protecting Routes with Middleware

---

#### 2. Admin Password Reset Sequence
Shows multi-actor flow: User → Admin → System → Database with in-person verification.

- **Primary:** `02-password-reset-sequence.plantuml.md` (PlantUML)
- **Alternate:** `02-password-reset-sequence.mermaid.md` (Mermaid)
- **Output:** `../../diagrams/authentication/password-reset-sequence.png`
- **Used in:** Section 8 - Admin-Assisted Password Reset

---

#### 3. Force Password Change Flow
Shows middleware trap mechanism that redirects users until password is changed.

- **Primary:** `03-force-password-change.d2.md` (D2)
- **Alternate:** `03-force-password-change.mermaid.md` (Mermaid)
- **Output:** `../../diagrams/authentication/force-password-change.png`
- **Used in:** Section 8 - Force Password Change

---

### Should-Have Diagrams (2 concepts, 2 versions each)

#### 4. Password Hashing Flow
Side-by-side comparison of registration (hash) vs login (verify) using bcrypt.

- **Primary:** `04-password-hashing-flow.plantuml.md` (PlantUML)
- **Alternate:** `04-password-hashing-flow.mermaid.md` (Mermaid)
- **Output:** `../../diagrams/authentication/password-hashing-flow.png`
- **Used in:** Section 2 - Password Security Basics

---

#### 5. Authentication vs Authorization
Decision tree showing distinction between "who you are" vs "what you can do".

- **Primary:** `05-auth-vs-authz.graphviz.md` (Graphviz/DOT)
- **Alternate:** `05-auth-vs-authz.mermaid.md` (Mermaid)
- **Output:** `../../diagrams/authentication/auth-vs-authz.png`
- **Used in:** Section 1 - Understanding Authentication vs Authorization

---

### Nice-to-Have Diagrams (1 concept)

#### 6. System Architecture Overview
Complete component diagram showing Browser → Express (middleware, routes, helpers) → Database.

- **Primary:** `06-system-architecture.mermaid.md` (Mermaid)
- **Output:** `../../diagrams/authentication/system-architecture.png`
- **Used in:** Section 10 - Real-World Example - Complete Auth System

---

## 🛠️ Rendering Instructions

### Graphviz (DOT)
```bash
dot -Tpng input.dot -o output.png
```

### Mermaid
```bash
mmdc -i input.mmd -o output.png
```

### PlantUML
```bash
java -jar plantuml.jar input.puml
```

### D2
```bash
d2 input.d2 output.png
```

### Using Kroki (Universal)
```bash
# Graphviz
curl -X POST https://kroki.io/graphviz/png -d @input.dot > output.png

# Mermaid
curl -X POST https://kroki.io/mermaid/png -d @input.mmd > output.png

# PlantUML
curl -X POST https://kroki.io/plantuml/png -d @input.puml > output.png

# D2
curl -X POST https://kroki.io/d2/png -d @input.d2 > output.png
```

---

## 📊 Tool Selection Rationale

| Diagram Type | Best Tool | Why |
|--------------|-----------|-----|
| Flowcharts | Graphviz or Mermaid | Clean layout, easy decisions |
| Sequence Diagrams | PlantUML | Industry standard, clear actors |
| Decision Trees | Graphviz or D2 | Precise control, beautiful styling |
| Architecture | Mermaid | Flexible, component relationships |

**Mermaid alternates provided for all diagrams** - simplest syntax, widest support (GitHub, GitLab, VS Code auto-render).

---

## 🎨 Design Principles

All diagrams follow these guidelines:
- **Color coding:** Green = success, Red = failure, Yellow = auth, Cyan = authz
- **Filipino context:** Examples use Juan Dela Cruz, Barangay officials
- **Grade 9 appropriate:** Clear labels, emoji icons, simple language
- **Consistent style:** Rounded boxes, diamond decisions, clear flow direction

---

## 📦 Output Location

All rendered PNG files should be saved to:
```
../../diagrams/authentication/
```

Expected files:
- `middleware-flow.png`
- `password-reset-sequence.png`
- `force-password-change.png`
- `password-hashing-flow.png`
- `auth-vs-authz.png`
- `system-architecture.png`

---

## 🔄 Maintenance Notes

**When updating diagrams:**
1. Edit source file in this directory
2. Re-render to PNG using tool of choice
3. Verify PNG appears correctly in lecture
4. Commit both source and PNG to Git

**Choosing between primary/alternate:**
- Test both renders
- Pick the clearer visualization
- Update lecture reference if needed

---

## 📝 File Naming Convention

Format: `##-description.tool.md`

- `##` = Two-digit number (display order)
- `description` = Kebab-case short name
- `tool` = graphviz, mermaid, plantuml, d2, etc.
- `.md` = Markdown wrapper for documentation

Examples:
- `01-middleware-flow.graphviz.md`
- `02-password-reset-sequence.plantuml.md`
- `03-force-password-change.d2.md`

---

## ✅ Completion Status

- [x] 01 - Middleware Flow (Graphviz + Mermaid)
- [x] 02 - Password Reset Sequence (PlantUML + Mermaid)
- [x] 03 - Force Password Change (D2 + Mermaid)
- [x] 04 - Password Hashing Flow (PlantUML + Mermaid)
- [x] 05 - Auth vs Authz (Graphviz + Mermaid)
- [x] 06 - System Architecture (Mermaid)
- [x] Lecture file updated with diagram references

**Total: 11 source files covering 6 unique concepts**

---

*Last updated: November 11, 2025*
