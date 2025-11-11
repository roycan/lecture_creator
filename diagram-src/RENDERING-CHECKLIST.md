# Diagram Rendering Checklist - Quick Commands

## 🎯 Purpose

This checklist provides **copy-paste commands** for rendering diagrams in various formats. Use this as a quick reference when you need to convert diagram source files to images.

## 📋 Pre-Flight Checklist

Before rendering, ensure you have the necessary tools installed:

- [ ] **Mermaid:** VS Code built-in OR Node.js package
- [ ] **PlantUML:** Java JRE + PlantUML JAR OR VS Code extension
- [ ] **Graphviz:** System package OR VS Code extension
- [ ] **D2:** CLI tool from d2lang.com

## 🔧 Installation Commands

### Mermaid (Node.js CLI)
```bash
npm install -g @mermaid-js/mermaid-cli
# or
yarn global add @mermaid-js/mermaid-cli
```

**Verify:**
```bash
mmdc --version
```

### PlantUML (System-wide)
```bash
# macOS (Homebrew)
brew install plantuml

# Ubuntu/Debian
sudo apt-get install plantuml

# Windows (Chocolatey)
choco install plantuml
```

**Verify:**
```bash
plantuml -version
```

### Graphviz (System-wide)
```bash
# macOS (Homebrew)
brew install graphviz

# Ubuntu/Debian
sudo apt-get install graphviz

# Windows (Chocolatey)
choco install graphviz
```

**Verify:**
```bash
dot -V
```

### D2 (CLI)
```bash
# macOS/Linux
curl -fsSL https://d2lang.com/install.sh | sh -s --

# Or download from GitHub releases
# https://github.com/terrastruct/d2/releases
```

**Verify:**
```bash
d2 --version
```

## 📦 VS Code Extensions (Recommended)

Install these for in-editor preview:

1. **Markdown Preview Mermaid Support** (built-in in newer VS Code)
2. **PlantUML** by jebbs (`jebbs.plantuml`)
3. **Graphviz Preview** by Stephan van Stekelenburg (`tintinweb.graphviz-interactive-preview`)
4. **D2** by Terrastruct (`terrastruct.d2`)

**Install all at once:**
```bash
code --install-extension jebbs.plantuml
code --install-extension tintinweb.graphviz-interactive-preview
code --install-extension terrastruct.d2
```

## 🖼️ Rendering Commands

### Extract Diagram from Markdown

All diagram files store the diagram code in a code block. Extract it first:

```bash
# Example: Extract Mermaid diagram from markdown
sed -n '/```mermaid/,/```/p' 01-flash-lifecycle-mermaid.md | sed '1d;$d' > temp.mmd

# Example: Extract PlantUML diagram
sed -n '/```plantuml/,/```/p' 01-flash-lifecycle-plantuml.md | sed '1d;$d' > temp.puml

# Example: Extract Graphviz diagram
sed -n '/```dot/,/```/p' 03-audit-log-graphviz.md | sed '1d;$d' > temp.dot

# Example: Extract D2 diagram
sed -n '/```d2/,/```/p' 01-flash-lifecycle-d2.md | sed '1d;$d' > temp.d2
```

**Or use this universal script:**
```bash
#!/bin/bash
# extract-diagram.sh
FILE=$1
TYPE=$2  # mermaid, plantuml, dot, d2

sed -n "/\`\`\`${TYPE}/,/\`\`\`/p" "$FILE" | sed '1d;$d' > "temp.${TYPE}"
echo "Extracted to temp.${TYPE}"
```

**Usage:**
```bash
chmod +x extract-diagram.sh
./extract-diagram.sh 01-flash-lifecycle-mermaid.md mermaid
```

### Mermaid → PNG/SVG

**PNG (default):**
```bash
mmdc -i temp.mmd -o output.png
```

**SVG (scalable):**
```bash
mmdc -i temp.mmd -o output.svg
```

**PDF (for print):**
```bash
mmdc -i temp.mmd -o output.pdf
```

**Custom size:**
```bash
mmdc -i temp.mmd -o output.png -w 1920 -H 1080
```

**Background color:**
```bash
mmdc -i temp.mmd -o output.png -b '#FFFFFF'
```

**Theme:**
```bash
mmdc -i temp.mmd -o output.png -t dark
# Options: default, dark, forest, neutral
```

### PlantUML → PNG/SVG

**PNG (default):**
```bash
plantuml temp.puml
# Creates temp.png
```

**SVG (scalable):**
```bash
plantuml -tsvg temp.puml
# Creates temp.svg
```

**PDF:**
```bash
plantuml -tpdf temp.puml
# Creates temp.pdf
```

**Custom DPI:**
```bash
plantuml -Sdpi=300 temp.puml
```

**Transparent background:**
```bash
plantuml -Sbgcolor=transparent temp.puml
```

### Graphviz → PNG/SVG

**PNG:**
```bash
dot -Tpng temp.dot -o output.png
```

**SVG:**
```bash
dot -Tsvg temp.dot -o output.svg
```

**PDF:**
```bash
dot -Tpdf temp.dot -o output.pdf
```

**Custom size (points):**
```bash
dot -Tpng -Gsize=10,8 -Gdpi=300 temp.dot -o output.png
```

**Different layout engines:**
```bash
dot -Tpng temp.dot -o output.png      # Hierarchical
neato -Tpng temp.dot -o output.png    # Spring model
fdp -Tpng temp.dot -o output.png      # Force-directed
circo -Tpng temp.dot -o output.png    # Circular
```

### D2 → PNG/SVG

**PNG:**
```bash
d2 temp.d2 output.png
```

**SVG:**
```bash
d2 temp.d2 output.svg
```

**PDF:**
```bash
d2 temp.d2 output.pdf
```

**Custom theme:**
```bash
d2 --theme=0 temp.d2 output.png
# Themes: 0-7 (Neutral, Dark, etc.)
```

**Layout engine:**
```bash
d2 --layout=elk temp.d2 output.png
# Options: dagre (default), elk
```

**Padding:**
```bash
d2 --pad=50 temp.d2 output.png
```

## 🚀 Batch Rendering Scripts

### Render All Mermaid Diagrams

```bash
#!/bin/bash
# render-all-mermaid.sh

for file in **/*-mermaid.md; do
    echo "Rendering $file..."
    base=$(basename "$file" .md)
    
    # Extract diagram
    sed -n '/```mermaid/,/```/p' "$file" | sed '1d;$d' > "temp.mmd"
    
    # Render
    mmdc -i temp.mmd -o "output/${base}.png" -w 1920 -H 1080
    
    # Cleanup
    rm temp.mmd
done

echo "✅ All Mermaid diagrams rendered to output/"
```

### Render All PlantUML Diagrams

```bash
#!/bin/bash
# render-all-plantuml.sh

for file in **/*-plantuml.md; do
    echo "Rendering $file..."
    base=$(basename "$file" .md)
    
    # Extract diagram
    sed -n '/```plantuml/,/```/p' "$file" | sed '1d;$d' > "temp.puml"
    
    # Render
    plantuml -o "../output" temp.puml
    mv output/temp.png "output/${base}.png"
    
    # Cleanup
    rm temp.puml
done

echo "✅ All PlantUML diagrams rendered to output/"
```

### Render All Graphviz Diagrams

```bash
#!/bin/bash
# render-all-graphviz.sh

for file in **/*-graphviz.md; do
    echo "Rendering $file..."
    base=$(basename "$file" .md)
    
    # Extract diagram
    sed -n '/```dot/,/```/p' "$file" | sed '1d;$d' > "temp.dot"
    
    # Render
    dot -Tpng -Gdpi=300 temp.dot -o "output/${base}.png"
    
    # Cleanup
    rm temp.dot
done

echo "✅ All Graphviz diagrams rendered to output/"
```

### Render All D2 Diagrams

```bash
#!/bin/bash
# render-all-d2.sh

for file in **/*-d2.md; do
    echo "Rendering $file..."
    base=$(basename "$file" .md)
    
    # Extract diagram
    sed -n '/```d2/,/```/p' "$file" | sed '1d;$d' > "temp.d2"
    
    # Render
    d2 temp.d2 "output/${base}.png"
    
    # Cleanup
    rm temp.d2
done

echo "✅ All D2 diagrams rendered to output/"
```

### Master Batch Render (All Formats)

```bash
#!/bin/bash
# render-all.sh

mkdir -p output

echo "🚀 Rendering all diagrams..."

./render-all-mermaid.sh
./render-all-plantuml.sh
./render-all-graphviz.sh
./render-all-d2.sh

echo "✅ All diagrams rendered!"
echo "📂 Check output/ directory"
```

## 🌐 Online Rendering (No Installation)

### Mermaid Live Editor
**URL:** https://mermaid.live

**Steps:**
1. Copy diagram code from `.md` file (without ` ```mermaid ` markers)
2. Paste into editor
3. Download PNG/SVG from menu

### PlantUML Online
**URL:** http://www.plantuml.com/plantuml

**Steps:**
1. Copy diagram code from `.md` file (without ` ```plantuml ` markers)
2. Paste into text area
3. Click "Submit"
4. Download PNG/SVG

### Graphviz Online
**URL:** https://dreampuf.github.io/GraphvizOnline

**Steps:**
1. Copy diagram code from `.md` file (without ` ```dot ` markers)
2. Paste into editor
3. View live preview
4. Right-click SVG to save

### D2 Playground
**URL:** https://play.d2lang.com

**Steps:**
1. Copy diagram code from `.md` file (without ` ```d2 ` markers)
2. Paste into editor
3. View live preview
4. Export PNG/SVG from menu

## 🔍 Troubleshooting

### Issue: "Command not found"
**Solution:** Tool not installed or not in PATH

```bash
# Check if installed
which mmdc
which plantuml
which dot
which d2

# If not found, install (see Installation Commands above)
```

### Issue: Mermaid renders with errors
**Common causes:**
- Syntax error in diagram code
- Unsupported Mermaid version

**Debug:**
```bash
mmdc -i temp.mmd -o output.png --debug
```

**Check syntax online:** https://mermaid.live

### Issue: PlantUML "Cannot read file"
**Common causes:**
- File encoding issue (not UTF-8)
- Special characters in path

**Solution:**
```bash
# Convert to UTF-8
iconv -f ISO-8859-1 -t UTF-8 temp.puml > temp-utf8.puml
plantuml temp-utf8.puml
```

### Issue: Graphviz output is tiny
**Common causes:**
- Graph too large for default size
- DPI too low

**Solution:**
```bash
dot -Tpng -Gsize=20,15 -Gdpi=300 temp.dot -o output.png
```

### Issue: D2 layout is messy
**Common causes:**
- Too many nodes for auto-layout
- Wrong layout engine

**Solutions:**
```bash
# Try different layout engine
d2 --layout=elk temp.d2 output.png

# Increase padding
d2 --pad=100 temp.d2 output.png

# Use different theme
d2 --theme=1 temp.d2 output.png
```

### Issue: Extract script not working
**Common causes:**
- BSD sed (macOS) vs GNU sed (Linux)
- Different line endings (CRLF vs LF)

**Solution (macOS):**
```bash
# Install GNU sed
brew install gnu-sed

# Use gsed instead of sed
gsed -n '/```mermaid/,/```/p' file.md | gsed '1d;$d' > temp.mmd
```

## 📊 Quality Settings

### For Lecture Slides (1920x1080)
```bash
# Mermaid
mmdc -i temp.mmd -o output.png -w 1920 -H 1080 -b '#FFFFFF'

# PlantUML
plantuml -Sdpi=150 temp.puml

# Graphviz
dot -Tpng -Gsize=16,9 -Gdpi=150 temp.dot -o output.png

# D2
d2 --pad=50 temp.d2 output.png
```

### For Print (High DPI)
```bash
# Mermaid (use SVG for best quality)
mmdc -i temp.mmd -o output.svg

# PlantUML
plantuml -Sdpi=300 temp.puml

# Graphviz
dot -Tpng -Gdpi=300 temp.dot -o output.png

# D2 (use SVG)
d2 temp.d2 output.svg
```

### For Web (Optimized)
```bash
# Mermaid
mmdc -i temp.mmd -o output.png -w 1200 -H 800

# PlantUML
plantuml -Sdpi=96 temp.puml

# Graphviz
dot -Tsvg temp.dot -o output.svg

# D2
d2 temp.d2 output.svg
```

## ✅ Pre-Rendering Checklist

Before rendering all diagrams for a lecture:

- [ ] **Syntax check:** Preview each diagram in VS Code
- [ ] **Output directory:** Create `output/` folder
- [ ] **Batch scripts:** Ensure scripts are executable (`chmod +x *.sh`)
- [ ] **Tools installed:** Verify all tools with `--version` commands
- [ ] **Format decision:** Choose PNG (slides) or SVG (web/print)
- [ ] **Quality settings:** Set appropriate DPI/size for use case
- [ ] **Naming convention:** Ensure output files match diagram sources

## 🎯 Quick Reference Table

| Format | Extract Command | Render Command | Best For |
|--------|----------------|----------------|----------|
| Mermaid | `sed -n '/```mermaid/,/```/p' file.md \| sed '1d;$d' > temp.mmd` | `mmdc -i temp.mmd -o output.png` | Sequences, flowcharts |
| PlantUML | `sed -n '/```plantuml/,/```/p' file.md \| sed '1d;$d' > temp.puml` | `plantuml temp.puml` | UML diagrams |
| Graphviz | `sed -n '/```dot/,/```/p' file.md \| sed '1d;$d' > temp.dot` | `dot -Tpng temp.dot -o output.png` | Decision trees |
| D2 | `sed -n '/```d2/,/```/p' file.md \| sed '1d;$d' > temp.d2` | `d2 temp.d2 output.png` | Modern visuals |

## 📞 Support Resources

### Mermaid
- **Docs:** https://mermaid.js.org/
- **Live Editor:** https://mermaid.live
- **GitHub:** https://github.com/mermaid-js/mermaid

### PlantUML
- **Docs:** https://plantuml.com/
- **Online:** http://www.plantuml.com/plantuml
- **GitHub:** https://github.com/plantuml/plantuml

### Graphviz
- **Docs:** https://graphviz.org/documentation/
- **Gallery:** https://graphviz.org/gallery/
- **Online:** https://dreampuf.github.io/GraphvizOnline/

### D2
- **Docs:** https://d2lang.com/tour/intro
- **Playground:** https://play.d2lang.com
- **GitHub:** https://github.com/terrastruct/d2

---

**Pro Tip:** Save your batch scripts and run them before each lecture to ensure all diagrams are up-to-date!

