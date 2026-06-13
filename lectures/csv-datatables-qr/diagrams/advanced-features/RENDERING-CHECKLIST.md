# Quick Rendering Checklist - Advanced Features Diagrams

## 🚀 Render All Diagrams

### Mermaid Diagrams (6 files)

```bash
# Install mermaid-cli globally
npm install -g @mermaid-js/mermaid-cli

# Render all Mermaid diagrams
mmdc -i 01-datatables-flow.mermaid.md -o ../../diagrams/part2c-datatables-flow.png
mmdc -i 02-flash-message-lifecycle.mermaid.md -o ../../diagrams/part2c-flash-lifecycle.png
mmdc -i 03-csv-import-flow.mermaid.md -o ../../diagrams/part2c-csv-import-mermaid.png
mmdc -i 04-qr-code-generation.mermaid.md -o ../../diagrams/part2c-qr-generation-mermaid.png
mmdc -i 05-audit-log-flow.mermaid.md -o ../../diagrams/part2c-audit-log-mermaid.png
mmdc -i 06-system-architecture.mermaid.md -o ../../diagrams/part2c-architecture.png
```

### PlantUML Diagram (1 file)

```bash
# Install node-plantuml (requires Java)
npm install -g node-plantuml

# Render PlantUML diagram
puml generate 03-csv-import-flow.plantuml.md -o ../../diagrams/
# Output: part2c-csv-import-plantuml.png
```

### D2 Diagram (1 file)

```bash
# Install D2 (https://d2lang.com/tour/install)
curl -fsSL https://d2lang.com/install.sh | sh -s --

# Render D2 diagram
d2 04-qr-code-generation.d2.md ../../diagrams/part2c-qr-generation-d2.svg
```

### Graphviz Diagram (1 file)

```bash
# Install Graphviz
# Linux: sudo apt install graphviz
# macOS: brew install graphviz

# Render Graphviz diagram
dot -Tpng 05-audit-log-flow.graphviz.md -o ../../diagrams/part2c-audit-log-graphviz.png
```

---

## 🌐 Universal: Render with Kroki (All Formats)

```bash
# Mermaid
curl -X POST https://kroki.io/mermaid/svg --data-binary @01-datatables-flow.mermaid.md > ../../diagrams/part2c-datatables-flow.svg
curl -X POST https://kroki.io/mermaid/svg --data-binary @02-flash-message-lifecycle.mermaid.md > ../../diagrams/part2c-flash-lifecycle.svg
curl -X POST https://kroki.io/mermaid/svg --data-binary @03-csv-import-flow.mermaid.md > ../../diagrams/part2c-csv-import-mermaid.svg
curl -X POST https://kroki.io/mermaid/svg --data-binary @04-qr-code-generation.mermaid.md > ../../diagrams/part2c-qr-generation-mermaid.svg
curl -X POST https://kroki.io/mermaid/svg --data-binary @05-audit-log-flow.mermaid.md > ../../diagrams/part2c-audit-log-mermaid.svg
curl -X POST https://kroki.io/mermaid/svg --data-binary @06-system-architecture.mermaid.md > ../../diagrams/part2c-architecture.svg

# PlantUML
curl -X POST https://kroki.io/plantuml/png --data-binary @03-csv-import-flow.plantuml.md > ../../diagrams/part2c-csv-import-plantuml.png

# D2
curl -X POST https://kroki.io/d2/svg --data-binary @04-qr-code-generation.d2.md > ../../diagrams/part2c-qr-generation-d2.svg

# Graphviz
curl -X POST https://kroki.io/graphviz/png --data-binary @05-audit-log-flow.graphviz.md > ../../diagrams/part2c-audit-log-graphviz.png
```

---

## 📋 Expected Output Files

```
diagrams/
├── part2c-datatables-flow.png          (Mermaid)
├── part2c-flash-lifecycle.png          (Mermaid)
├── part2c-csv-import-mermaid.png       (Mermaid)
├── part2c-csv-import-plantuml.png      (PlantUML) ← Primary
├── part2c-qr-generation-mermaid.png    (Mermaid)
├── part2c-qr-generation-d2.svg         (D2) ← Primary
├── part2c-audit-log-mermaid.png        (Mermaid)
├── part2c-audit-log-graphviz.png       (Graphviz) ← Primary
└── part2c-architecture.png             (Mermaid)
```

**Total:** 9 files (6 primary + 3 alternates)

---

## ✅ Quick Verification

```bash
# Check all diagrams rendered
ls -lh ../../diagrams/part2c-*.{png,svg}

# Expected: 9 files, each > 10KB
```

---

## 🐛 Common Issues

**"mmdc: command not found"**
→ Run: `npm install -g @mermaid-js/mermaid-cli`

**"puml: command not found"**
→ Run: `npm install -g node-plantuml` (requires Java)

**"d2: command not found"**
→ Install: `curl -fsSL https://d2lang.com/install.sh | sh -s --`

**"dot: command not found"**
→ Install Graphviz: `sudo apt install graphviz` or `brew install graphviz`

**All fail?**
→ Use Kroki API (works without local installs)

---

**Last updated:** November 11, 2025
