# CSS Box Model Diagram (Mermaid)

```mermaid
graph TB
    subgraph "CSS Box Model"
        M[Margin - Transparent Space Outside]
        B[Border - Visible Outline]
        P[Padding - Space Inside Border]
        C[Content - Text/Images]
    end
    
    M -->|surrounds| B
    B -->|surrounds| P
    P -->|surrounds| C
    
    style M fill:#fff4e6,stroke:#ff9800,stroke-width:3px
    style B fill:#e3f2fd,stroke:#2196f3,stroke-width:3px
    style P fill:#f3e5f5,stroke:#9c27b0,stroke-width:3px
    style C fill:#e8f5e9,stroke:#4caf50,stroke-width:3px
```

---

# Box Model with Measurements (D2)

```d2
direction: down

box_model: CSS Box Model {
  margin: Margin {
    shape: rectangle
    style: {
      fill: "#fff4e6"
      stroke: "#ff9800"
      stroke-width: 3
    }
    
    border: Border {
      shape: rectangle
      style: {
        fill: "#e3f2fd"
        stroke: "#2196f3"
        stroke-width: 3
      }
      
      padding: Padding {
        shape: rectangle
        style: {
          fill: "#f3e5f5"
          stroke: "#9c27b0"
          stroke-width: 3
        }
        
        content: Content {
          shape: rectangle
          style: {
            fill: "#e8f5e9"
            stroke: "#4caf50"
            stroke-width: 3
          }
        }
      }
    }
  }
}

margin_label: "margin: 10px" {
  shape: text
}
border_label: "border: 2px solid black" {
  shape: text
}
padding_label: "padding: 20px" {
  shape: text
}
content_label: "width: 200px\nheight: 100px" {
  shape: text
}

box_model.margin -> margin_label: " "
box_model.margin.border -> border_label: " "
box_model.margin.border.padding -> padding_label: " "
box_model.margin.border.padding.content -> content_label: " "
```

---

# CSS Selector Types (Mermaid)

```mermaid
graph LR
    CSS[CSS Selectors]
    
    CSS --> Element[Element Selector]
    CSS --> Class[Class Selector]
    CSS --> ID[ID Selector]
    
    Element --> E1["p { color: blue; }"]
    Element --> E2[Styles ALL paragraphs]
    
    Class --> C1[".highlight { ... }"]
    Class --> C2[Can be used multiple times]
    Class --> C3["<p class='highlight'>"]
    
    ID --> I1["#header { ... }"]
    ID --> I2[Used ONCE per page]
    ID --> I3["<div id='header'>"]
    
    style CSS fill:#4caf50,stroke:#2e7d32,stroke-width:3px,color:#fff
    style Element fill:#2196f3,stroke:#1565c0,stroke-width:2px,color:#fff
    style Class fill:#ff9800,stroke:#e65100,stroke-width:2px,color:#fff
    style ID fill:#9c27b0,stroke:#6a1b9a,stroke-width:2px,color:#fff
```

---

# CSS Cascade Flow (Mermaid)

```mermaid
flowchart TD
    Start[Browser Default Styles] --> External[External CSS styles.css]
    External --> Internal[Internal CSS in style tag]
    Internal --> Inline[Inline CSS style attribute]
    Inline --> Final[Final Style Applied]
    
    Start -.->|lowest priority| Final
    External -.->|medium priority| Final
    Internal -.->|high priority| Final
    Inline -.->|highest priority| Final
    
    style Start fill:#e0e0e0,stroke:#757575
    style External fill:#4caf50,stroke:#2e7d32,stroke-width:2px
    style Internal fill:#ff9800,stroke:#e65100,stroke-width:2px
    style Inline fill:#f44336,stroke:#c62828,stroke-width:2px
    style Final fill:#2196f3,stroke:#1565c0,stroke-width:3px,color:#fff
```

---

# CSS Color Systems (Mermaid)

```mermaid
graph TB
    Color[CSS Color Values]
    
    Color --> Named[Named Colors]
    Color --> Hex[Hexadecimal]
    Color --> RGB[RGB/RGBA]
    
    Named --> N1["color: red;"]
    Named --> N2["140+ predefined names"]
    Named --> N3["Easy to remember"]
    
    Hex --> H1["color: #FF5733;"]
    Hex --> H2["# + 6 characters"]
    Hex --> H3["RRGGBB format"]
    
    RGB --> R1["rgb(255, 87, 51)"]
    RGB --> R2["Red, Green, Blue values"]
    RGB --> R3["rgba() adds transparency"]
    
    style Color fill:#4caf50,stroke:#2e7d32,stroke-width:3px,color:#fff
    style Named fill:#ff5733,stroke:#c62828,stroke-width:2px,color:#fff
    style Hex fill:#2196f3,stroke:#1565c0,stroke-width:2px,color:#fff
    style RGB fill:#9c27b0,stroke:#6a1b9a,stroke-width:2px,color:#fff
```

---

# CSS Application Methods (PlantUML)

```plantuml
@startuml
!define RECTANGLE class

skinparam backgroundColor #f5f5f5
skinparam roundcorner 10

title CSS Application Methods

package "Inline CSS" #FFE6E6 {
  [Single Element]
  [Highest Priority]
  note right: <p style="color: red;">
}

package "Internal CSS" #FFF4E6 {
  [Single Page]
  [Medium Priority]
  note right: <style>\n  p { color: blue; }\n</style>
}

package "External CSS" #E6F7FF {
  [Multiple Pages]
  [Lowest Priority]
  [Best Practice]
  note right: <link rel="stylesheet"\n  href="styles.css">
}

[Inline CSS] -down-> [Final Style]: Overrides
[Internal CSS] -down-> [Final Style]: Overrides
[External CSS] -down-> [Final Style]: Base

@enduml
```

---

# Font Family Fallback Chain (Mermaid)

```mermaid
graph LR
    Start[Browser Checks] --> Font1{Arial available?}
    Font1 -->|Yes| UseFont1[Use Arial]
    Font1 -->|No| Font2{Helvetica available?}
    Font2 -->|Yes| UseFont2[Use Helvetica]
    Font2 -->|No| Font3[Use sans-serif default]
    
    UseFont1 --> Display[Display Text]
    UseFont2 --> Display
    Font3 --> Display
    
    style Start fill:#4caf50,stroke:#2e7d32,stroke-width:2px,color:#fff
    style Font1 fill:#2196f3,stroke:#1565c0
    style Font2 fill:#ff9800,stroke:#e65100
    style UseFont1 fill:#e8f5e9,stroke:#4caf50
    style UseFont2 fill:#fff3e0,stroke:#ff9800
    style Font3 fill:#fce4ec,stroke:#f06292
    style Display fill:#9c27b0,stroke:#6a1b9a,stroke-width:2px,color:#fff
```

---

# CSS Box Model Nested Structure (D2)

```d2
direction: down

explanation: "Visual Representation of CSS Box Model" {
  shape: text
  style.font-size: 20
  style.bold: true
}

box: {
  label: "Complete Element"
  
  margin_area: {
    label: "MARGIN (transparent)\nmargin: 20px"
    style.fill: "#fff4e6"
    style.stroke: "#ff9800"
    style.stroke-width: 4
    
    border_area: {
      label: "BORDER (visible)\nborder: 3px solid black"
      style.fill: "#e3f2fd"
      style.stroke: "#2196f3"
      style.stroke-width: 4
      
      padding_area: {
        label: "PADDING (inside space)\npadding: 15px"
        style.fill: "#f3e5f5"
        style.stroke: "#9c27b0"
        style.stroke-width: 4
        
        content_area: {
          label: "CONTENT\nwidth: 200px\nheight: 100px\n\nYour text/images here"
          style.fill: "#e8f5e9"
          style.stroke: "#4caf50"
          style.stroke-width: 4
        }
      }
    }
  }
}

note: "Total Width = margin + border + padding + content + padding + border + margin" {
  shape: text
  style.font-size: 14
}

box -> note
```

---

# CSS Specificity Hierarchy (Mermaid)

```mermaid
graph TD
    Title[CSS Specificity Hierarchy]
    
    Title --> Level4[!important - Nuclear Option]
    Title --> Level3[Inline Styles]
    Title --> Level2[IDs]
    Title --> Level1[Classes, Attributes, Pseudo-classes]
    Title --> Level0[Elements, Pseudo-elements]
    
    Level4 --> P4["color: red !important;\n⚠️ Use sparingly!"]
    Level3 --> P3["style='color: red;'\nSpecificity: 1,0,0,0"]
    Level2 --> P2["#header { color: red; }\nSpecificity: 0,1,0,0"]
    Level1 --> P1[".class { color: red; }\nSpecificity: 0,0,1,0"]
    Level0 --> P0["p { color: red; }\nSpecificity: 0,0,0,1"]
    
    style Title fill:#4caf50,stroke:#2e7d32,stroke-width:3px,color:#fff
    style Level4 fill:#f44336,stroke:#c62828,stroke-width:2px,color:#fff
    style Level3 fill:#ff9800,stroke:#e65100,stroke-width:2px,color:#fff
    style Level2 fill:#2196f3,stroke:#1565c0,stroke-width:2px,color:#fff
    style Level1 fill:#9c27b0,stroke:#6a1b9a,stroke-width:2px,color:#fff
    style Level0 fill:#757575,stroke:#424242,stroke-width:2px,color:#fff
```

---

# Simple Navigation Bar Structure (D2)

```d2
direction: right

nav: Navigation Bar {
  style.fill: "#333333"
  style.stroke: "#000000"
  style.stroke-width: 2
  
  home: Home {
    style.fill: "#ffffff"
    style.stroke: "#333333"
    style.font-color: "#333333"
  }
  
  about: About {
    style.fill: "#ffffff"
    style.stroke: "#333333"
    style.font-color: "#333333"
  }
  
  contact: Contact {
    style.fill: "#ffffff"
    style.stroke: "#333333"
    style.font-color: "#333333"
  }
}

hover_effect: "Hover Effect:\nLinks turn orange" {
  shape: text
  style.font-size: 14
}

css_code: "CSS:\nnav { background: #333; }\nnav a { color: white; }\nnav a:hover { color: orange; }" {
  shape: text
  style.font-size: 12
  style.font: mono
}

nav -> hover_effect
hover_effect -> css_code
```

---

# CSS Syntax Breakdown (Mermaid)

```mermaid
flowchart LR
    Syntax["h1 { color: blue; }"]
    
    Syntax --> Selector[Selector: h1]
    Syntax --> Property[Property: color]
    Syntax --> Value[Value: blue]
    
    Selector --> S1[What to style]
    Selector --> S2[Can be element, class, ID]
    
    Property --> P1[What aspect to change]
    Property --> P2[color, font-size, margin, etc.]
    
    Value --> V1[How to change it]
    Value --> V2[Specific setting or measurement]
    
    style Syntax fill:#4caf50,stroke:#2e7d32,stroke-width:3px,color:#fff
    style Selector fill:#2196f3,stroke:#1565c0,stroke-width:2px,color:#fff
    style Property fill:#ff9800,stroke:#e65100,stroke-width:2px,color:#fff
    style Value fill:#9c27b0,stroke:#6a1b9a,stroke-width:2px,color:#fff
```

Save this file and I'll provide instructions for which diagram to use where!
