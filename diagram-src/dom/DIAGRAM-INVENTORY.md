# DOM Lecture Diagram Inventory

This file tracks all diagram sources created for `dom-lecture.md`.

## Tier A Diagrams (Critical — 3 formats each)

### 1. DOM Tree Structure
- `dom-tree-mermaid.mmd` — Mermaid graph (primary)
- `dom-tree-d2.d2` — D2 hierarchical diagram
- `dom-tree-plantuml.puml` — PlantUML component diagram
- **Context:** Sari-sari store HTML structure showing parent-child node relationships

### 2. Element Selection Decision Tree
- `element-selection-mermaid.mmd` — Mermaid flowchart (primary)
- `element-selection-plantuml.puml` — PlantUML activity diagram
- `element-selection-d2.d2` — D2 decision flow
- **Context:** Helps students choose getElementById vs querySelector vs querySelectorAll

### 3. Event Flow Theory (Abstract)
- `event-flow-theory-mermaid.mmd` — Mermaid sequence diagram (primary)
- `event-flow-theory-plantuml.puml` — PlantUML sequence diagram
- `event-flow-theory-actdiag.diag` — Actdiag phase flow
- **Context:** Capture → Target → Bubble phases explained

### 4. Event Flow Practical (Real Example)
- `event-flow-practical-mermaid.mmd` — Mermaid sequence (primary)
- `event-flow-practical-plantuml.puml` — PlantUML sequence
- `event-flow-practical-d2.d2` — D2 containment + flow
- **Context:** Sari-sari store "Add to Cart" button click with event delegation

### 5. Element Creation Lifecycle
- `element-creation-mermaid.mmd` — Mermaid flowchart (primary)
- `element-creation-actdiag.diag` — Actdiag process steps
- `element-creation-d2.d2` — D2 step-by-step flow
- **Context:** createElement → set properties → appendChild workflow

---

## Tier B Diagrams (Supportive — 2 formats each)

### 6. Class Toggle Pattern (Comparison)
- `class-toggle-mermaid.mmd` — Mermaid side-by-side comparison (primary)
- `class-toggle-svgbob.bob` — Svgbob sketch-style comparison
- **Context:** Inline styles (bad) vs CSS classes (good)

### 7. Form Validation Flow
- `form-validation-mermaid.mmd` — Mermaid flowchart (primary)
- `form-validation-actdiag.diag` — Actdiag decision flow
- **Context:** Submit → prevent default → validate → show error/success

### 8. Shopping Cart Architecture
- `cart-architecture-d2.d2` — D2 layered architecture (primary)
- `cart-architecture-mermaid.mmd` — Mermaid component diagram
- **Context:** UI layer, data layer (arrays), logic layer (functions) for store project

### 9. Event Delegation Pattern (Before/After)
- `event-delegation-d2.d2` — D2 before/after comparison (primary)
- `event-delegation-mermaid.mmd` — Mermaid architectural comparison
- **Context:** Many listeners (bad) vs one delegated listener (good)

---

## Total Count
- **23 diagram source files**
- Tier A: 15 files (5 concepts × 3 formats)
- Tier B: 8 files (4 concepts × 2 formats)

## Format Distribution
- Mermaid: 9 files (primary for all)
- D2: 6 files (architecture & structure)
- PlantUML: 4 files (sequence & activity)
- Actdiag: 3 files (process flow)
- Svgbob: 1 file (sketch comparison)

## Conversion Instructions

Once you run your PNG converter on these sources, place the output in:
```
diagrams/
  dom-tree.png
  element-selection.png
  event-flow-theory.png
  event-flow-practical.png
  element-creation.png
  class-toggle.png
  form-validation.png
  cart-architecture.png
  event-delegation.png
```

The markdown already references these PNG filenames. If your converter produces format-suffixed names (e.g., `dom-tree-mermaid.png`), you'll need to either:
1. Rename them to the simplified names above, OR
2. Update the markdown image references to match your converter's output pattern

## Philippine Context Integration
- **DOM Tree:** Sari-sari store product grid structure
- **Event Flow Practical:** Store "Add to Cart" button with ₱ prices
- **Cart Architecture:** Philippine peso (₱) in price examples
- **Element Selection & Others:** Generic/universal (intentionally kept abstract for clarity)

## Next Steps
1. Run your diagram converter on `diagram-src/dom/` directory
2. Verify PNGs are placed in `diagrams/` folder
3. Open `dom-lecture.md` and verify all 9 diagram images render correctly
4. If images don't show, check filename match between markdown and actual PNG files
