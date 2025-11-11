# Force Password Change Flow (D2)

**Diagram Type:** Flowchart with Decision Logic  
**Tool:** D2  
**Purpose:** Show how middleware traps users until password is changed  
**Used in:** Section 8 - Force Password Change

---

## D2 Code

```d2
direction: right

title: Force Password Change Middleware Flow {
  near: top-center
  shape: text
  style.font-size: 20
  style.bold: true
}

request: Every Request {
  shape: oval
  style.fill: "#e1f5ff"
}

check_path: {
  label: "Path is /login,\n/logout, or\n/change-password?"
  shape: diamond
  style.fill: "#f0f0f0"
}

allow_exempt: Allow Request ✓ {
  shape: rectangle
  style.fill: "#ccffcc"
  style.stroke: "#00aa00"
}

check_logged_in: {
  label: "User\nlogged in?"
  shape: diamond
  style.fill: "#f0f0f0"
}

continue: Continue to Route {
  shape: rectangle
  style.fill: "#ccffcc"
  style.stroke: "#00aa00"
}

check_must_change: {
  label: "must_change_password\n= 1?"
  shape: diamond
  style.fill: "#f0f0f0"
}

redirect_change: {
  label: "Redirect to\n/change-password"
  shape: rectangle
  style.fill: "#ffcccc"
  style.stroke: "#cc0000"
}

trapped: {
  label: "User trapped here\nuntil password changed"
  shape: hexagon
  style.fill: "#fff9e6"
  style.stroke: "#ff9900"
}

# Flow connections
request -> check_path

check_path -> allow_exempt: {
  label: "Yes"
  style.stroke: "#00aa00"
}

check_path -> check_logged_in: {
  label: "No"
  style.stroke: "#0066cc"
}

check_logged_in -> continue: {
  label: "No"
  style.stroke: "#00aa00"
}

check_logged_in -> check_must_change: {
  label: "Yes"
  style.stroke: "#0066cc"
}

check_must_change -> continue: {
  label: "No (= 0)"
  style.stroke: "#00aa00"
}

check_must_change -> redirect_change: {
  label: "Yes (= 1)"
  style.stroke: "#cc0000"
}

redirect_change -> trapped

# Annotations
note1: {
  label: "These routes are\nEXEMPT from check:\n• /login\n• /logout\n• /change-password"
  shape: page
  style.fill: "#ffffcc"
  near: check_path
}

note2: {
  label: "Every request redirects\nto /change-password\nuntil flag = 0"
  shape: page
  style.fill: "#ffffcc"
  near: trapped
}
