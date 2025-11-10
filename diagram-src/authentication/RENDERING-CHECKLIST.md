# Diagram Rendering Checklist

Quick reference for rendering all authentication diagrams.

---

## 🎯 Quick Render Commands

### Option 1: Render Primary Diagrams (Recommended to try first)

```bash
# Navigate to diagram-src/authentication/
cd diagram-src/authentication/

# 1. Middleware Flow (Graphviz)
dot -Tpng 01-middleware-flow.graphviz.md -o ../../diagrams/authentication/middleware-flow.png

# 2. Password Reset (PlantUML)
java -jar plantuml.jar 02-password-reset-sequence.plantuml.md -o ../../diagrams/authentication/

# 3. Force Password Change (D2)
d2 03-force-password-change.d2.md ../../diagrams/authentication/force-password-change.png

# 4. Password Hashing (PlantUML)
java -jar plantuml.jar 04-password-hashing-flow.plantuml.md -o ../../diagrams/authentication/

# 5. Auth vs Authz (Graphviz)
dot -Tpng 05-auth-vs-authz.graphviz.md -o ../../diagrams/authentication/auth-vs-authz.png

# 6. System Architecture (Mermaid)
mmdc -i 06-system-architecture.mermaid.md -o ../../diagrams/authentication/system-architecture.png
```

---

### Option 2: Render Alternate Diagrams (If primaries fail or look worse)

```bash
# 1. Middleware Flow (Mermaid)
mmdc -i 01-middleware-flow.mermaid.md -o ../../diagrams/authentication/middleware-flow.png

# 2. Password Reset (Mermaid)
mmdc -i 02-password-reset-sequence.mermaid.md -o ../../diagrams/authentication/password-reset-sequence.png

# 3. Force Password Change (Mermaid)
mmdc -i 03-force-password-change.mermaid.md -o ../../diagrams/authentication/force-password-change.png

# 4. Password Hashing (Mermaid)
mmdc -i 04-password-hashing-flow.mermaid.md -o ../../diagrams/authentication/password-hashing-flow.png

# 5. Auth vs Authz (Mermaid)
mmdc -i 05-auth-vs-authz.mermaid.md -o ../../diagrams/authentication/auth-vs-authz.png

# 6. System Architecture (Mermaid - same as primary)
mmdc -i 06-system-architecture.mermaid.md -o ../../diagrams/authentication/system-architecture.png
```

---

## 🌐 Using Kroki (Universal, No Local Tools Required)

Kroki supports all diagram types via HTTP API.

### Extract code blocks first:
```bash
# Extract just the code (remove markdown wrapper)
sed -n '/^```/,/^```/p' 01-middleware-flow.graphviz.md | sed '1d;$d' > temp.dot
```

### Then render:
```bash
# Graphviz
curl -X POST https://kroki.io/graphviz/png -d @temp.dot > ../../diagrams/authentication/middleware-flow.png

# PlantUML
curl -X POST https://kroki.io/plantuml/png -d @temp.puml > ../../diagrams/authentication/password-reset-sequence.png

# D2
curl -X POST https://kroki.io/d2/png -d @temp.d2 > ../../diagrams/authentication/force-password-change.png

# Mermaid
curl -X POST https://kroki.io/mermaid/png -d @temp.mmd > ../../diagrams/authentication/auth-vs-authz.png
```

---

## 📋 Verification Checklist

After rendering, check:

- [ ] All 6 PNG files exist in `diagrams/authentication/`
- [ ] Images display correctly when viewing lecture in Markdown preview
- [ ] File sizes reasonable (typically 50-200 KB)
- [ ] No rendering errors or garbled text
- [ ] Colors match design (green=success, red=failure, yellow=auth, cyan=authz)
- [ ] Text is readable at normal zoom levels

---

## 🎨 Which Version to Use?

| Diagram | Try First (Primary) | Fallback (Alternate) |
|---------|---------------------|----------------------|
| Middleware Flow | Graphviz | Mermaid |
| Password Reset | PlantUML | Mermaid |
| Force Password Change | D2 | Mermaid |
| Password Hashing | PlantUML | Mermaid |
| Auth vs Authz | Graphviz | Mermaid |
| System Architecture | Mermaid | *(only version)* |

**Decision criteria:**
- Clearer layout
- Better text formatting
- More visually appealing
- Easier to maintain

---

## 🛠️ Tool Installation (If Needed)

### Graphviz
```bash
# Ubuntu/Debian
sudo apt install graphviz

# macOS
brew install graphviz
```

### Mermaid CLI
```bash
npm install -g @mermaid-js/mermaid-cli
```

### PlantUML
```bash
# Download JAR
wget https://sourceforge.net/projects/plantuml/files/plantuml.jar/download -O plantuml.jar

# Or via package manager
sudo apt install plantuml  # Ubuntu
brew install plantuml      # macOS
```

### D2
```bash
# Install via script
curl -fsSL https://d2lang.com/install.sh | sh -s --

# Or via homebrew
brew install d2
```

---

## 🚨 Common Issues

**Issue:** "Command not found"
- **Solution:** Install the tool (see above) or use Kroki

**Issue:** "Cannot find input file"
- **Solution:** Make sure you're in `diagram-src/authentication/` directory

**Issue:** "Output directory doesn't exist"
- **Solution:** Create it first: `mkdir -p ../../diagrams/authentication/`

**Issue:** Mermaid renders with weird spacing
- **Solution:** Try adjusting `-w` (width) parameter: `mmdc -i input.mmd -o output.png -w 1200`

**Issue:** PlantUML text is too small
- **Solution:** Add `skinparam defaultFontSize 14` to PlantUML code

---

*Last updated: November 11, 2025*
