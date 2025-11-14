# JavaScript and the DOM — Make Web Pages Interactive

Welcome! 🎉

This lecture shows you how JavaScript makes web pages come alive. You'll go from writing code that only talks to the console, to building interactive pages that respond to clicks, forms, and user input. We'll use simple HTML files you can open locally from the `assets/` folder. No internet required.

Estimated length: 1500–1800 lines. Focus: hands‑on practice with clear examples and short explanations.

---

## Quick plan (what we'll cover)

- Introduction: what is the DOM, why it matters
- Selecting elements: `getElementById`, `querySelector`, `querySelectorAll`
- Reading & changing content: `.textContent`, `.innerHTML`, `.value`
- Styling: `.style` vs `.classList`
- Creating and removing elements: `createElement`, `appendChild`, `remove`
- Events: `addEventListener`, `click`, `input`, `submit` and basic event object
- Mini projects: Grade Calculator, To-do List, Sari‑Sari Store UI
- Final challenge: Student Management Dashboard (starter + solution)
- Troubleshooting, tips, and next steps (including a brief mention of frameworks)

---

## Introduction — From Console to Page

In the previous lectures you learned about data and logic. Now we will connect JavaScript to the web page itself. The browser loads an HTML page and builds a tree-like structure called the Document Object Model (DOM). Each HTML element becomes a node you can read or change with JavaScript.

Why is this cool?
- You can change text, style, and structure of pages instantly.
- You can respond to user actions (clicks, typing, form submission).
- You can build interactive apps: calculators, games, to-do lists, small business tools.

Quick demo idea: click a button and the heading changes. We'll build that exact demo in `assets/practice1.html`.

### 📁 Shared Stylesheet Reference

All practice files and projects use our shared stylesheet:

**File:** [`assets/styles.css`](assets/styles.css)

This CSS file provides utility classes you can use in any project:
- `.btn` / `.btn.secondary` — styled buttons
- `.card` — white container with shadow
- `.highlight` — yellow gradient background
- `.error` / `.success` — red/green text for messages
- `.hidden` — hide elements
- `.form-row` — flex row for form inputs
- `.table` — simple table styles

Open this file to see how the styles are written. You can copy these patterns into your own projects!

---

**Visual: The DOM Tree**

When the browser reads your HTML, it creates a tree structure. Each element becomes a "node" you can access with JavaScript:

![DOM Tree Structure](diagrams/dom-tree.png)

This diagram shows a simple sari-sari store page structure. Notice how every HTML tag becomes a node in the tree, with parent-child relationships matching your HTML nesting.

---

## Section 1 — Selecting Elements (Finding things on the page)

When you want to change something on the page, the first step is to find the element.

1) `document.getElementById('id')`
- Fast, simple, and reliable when you have an `id`.
- Returns a single element or `null`.

2) `document.querySelector('css-selector')`
- Very flexible: use any CSS selector (`.class`, `#id`, `div > p`, `input[name="name"]`).
- Returns the first match or `null`.

3) `document.querySelectorAll('css-selector')`
- Returns a NodeList of matching elements (like an array). Useful for loops.

Practice: open `assets/practice1.html` and complete the TODOs to find elements and change the heading.

Tip: Always check `console.log(element)` to confirm you found the right node.

**Decision guide: Which selector method should I use?**

![Element Selection Decision Tree](diagrams/element-selection.png)

This flowchart helps you pick the right method. Start with `getElementById` when you have a unique ID. Use `querySelector` for single elements with complex selectors. Use `querySelectorAll` when you need multiple elements (like all buttons or all product cards).

---

### 🎯 Try it yourself — Practice 1 (Selecting Elements)

- Open: `assets/practice1.html`
- How: Double-click the file to open in your browser (or right-click → Open with Live Server)

What to do:
1) Click the button and watch the heading change.
2) Add a second button that sets a different message.
3) Try using `querySelector('#main-heading')` instead of `getElementById`.

Snippet to study (from the file):

```javascript
const btn = document.getElementById('changeBtn');
const heading = document.getElementById('main-heading');
btn.addEventListener('click', function(){
	heading.textContent = 'You clicked the button — great!';
});
```

**Download:** [`practice1.html`](assets/practice1.html)

---

## Section 2 — Reading and Changing Content

Once you have an element, here are the common ways to read or change what's inside it.

- `el.textContent` — read or replace the text inside an element (safe, no HTML parsing)
- `el.innerHTML` — read or set the HTML contents (powerful, but can be unsafe if used with untrusted input)
- `inputEl.value` — read or set the value of input, textarea, or select

Examples you'll practice:
- Change heading text
- Build a name tag generator that reads an input value and writes a greeting
- Replace innerHTML to show rich content (but we warn about XSS)

Activity: `assets/practice2.html` contains a small form — make the Submit button put a formatted message in a result card using `.textContent` and `.value`.

---

### 🎯 Try it yourself — Practice 2 (Reading & Changing Content)

- Open: `assets/practice2.html`
- How: Double-click to open in your browser

Tasks:
1) Submit the form with a name; show a greeting in the result area using `textContent`.
2) Add simple validation: if empty, show an error message with the `.error` class.

Key lines to focus on:

```javascript
form.addEventListener('submit', function(e){
	e.preventDefault();
	const name = nameInput.value.trim();
	if(!name){
		result.textContent = 'Please enter a name.';
		result.classList.add('error');
		return;
	}
	result.classList.remove('error');
	result.textContent = `Hello, ${name}! Welcome to the demo.`;
});
```

**Download:** [`practice2.html`](assets/practice2.html)

---

## Section 3 — Styling Elements

You can change how elements look in two ways.

1) Inline styles — `el.style.property = 'value'`
- Quick and fine-grained, e.g. `el.style.backgroundColor = 'yellow'`
- But mixing style with JS is harder to maintain

2) CSS classes — `el.classList.add('myClass')`, `.remove()`, `.toggle()`
- Recommended: write styles in `assets/styles.css` and toggle classes from JS
- Easier for theme changes and reuse

We'll provide a small `styles.css` with utility classes like `.hidden`, `.highlight`, `.error`, `.success`, `.card`, `.btn`.

Practice: `assets/practice3.html` — clicking a button toggles a `highlight` class on a paragraph.

**Visual: Inline Styles vs CSS Classes**

![Class Toggle Pattern](diagrams/class-toggle.png)

This comparison shows why toggling classes is better than writing inline styles. The left side shows messy inline style code. The right side shows clean class toggling with all styles in your CSS file. Much easier to maintain!

---

> Accessibility tip: Prefer toggling classes (with CSS in `assets/styles.css`) over writing many inline styles in JS. This keeps presentation and behavior separate and helps screen readers with consistent semantics.

### 🎯 Try it yourself — Practice 3 (Styling via classList)

- Open: `assets/practice3.html`
- How: Double-click to open in your browser

Tasks:
1) Click the button to toggle `.highlight` on the paragraph.
2) Add a second button to toggle `.hidden` on the same paragraph.

Starter snippet:

```javascript
const toggleBtn = document.getElementById('toggleBtn');
const text = document.getElementById('text');
toggleBtn.addEventListener('click', function(){
	text.classList.toggle('highlight');
});
```

**Download:** [`practice3.html`](assets/practice3.html)

---

## Section 4 — Creating & Removing Elements

Use JavaScript to build UI elements dynamically.

- `let node = document.createElement('div')`
- `node.textContent = 'Hello'`
- `parent.appendChild(node)` to add to the page
- `node.remove()` to delete an element

Use cases:
- Add new items to a to-do list
- Build product cards dynamically from an inventory array
- Remove items when they are completed/sold

Practice: We'll build the add/remove part of the To-Do project step-by-step in `assets/todo.html`.

**Visual: Element Creation Lifecycle**

![Element Creation Steps](diagrams/element-creation.png)

This diagram shows the correct order for creating elements. First `createElement`, then set properties (text, classes, id), optionally add event listeners, and finally `appendChild` to make it visible. Skipping `appendChild` is a common mistake—the element exists in memory but won't show up on the page!

---

### 🎯 Try it yourself — Mini Project: To‑Do (Create & Remove)

- Open: `assets/todo.html`
- How: Double-click to open in your browser

Goals:
1) Add tasks from the input; render them as rows.
2) Implement Done/Undo using a boolean flag and `classList`.
3) Implement Delete to remove by index.

Helpful pattern:

```javascript
function render(){
	list.innerHTML = '';
	tasks.forEach((t, idx) => {
		const row = document.createElement('div');
		row.className = 'form-row';
		// ...create children, append, and wire events
		list.appendChild(row);
	});
}
```

**Download:** [`todo.html`](assets/todo.html)

---

## Section 5 — Events (React to user actions)

Event handling is the heart of interactive pages.

- `element.addEventListener('click', handler)` — run code when user clicks
- `element.addEventListener('input', handler)` — respond while user types
- `form.addEventListener('submit', handler)` — handle forms, use `event.preventDefault()` to stop page reload

Event handler receives an `event` object. Useful properties:
- `event.target` — the element that triggered the event
- `event.preventDefault()` — stop default browser behavior

Practice activities:
- Click counters
- Input live preview
- Form submission with validation

We'll show one good pattern: keep references to elements (don't query the DOM repeatedly inside loops), and use event delegation where many similar child elements exist.

**Visual: Event Flow (Theory)**

![Event Flow Phases](diagrams/event-flow-theory.png)

When you click a button, the event travels through three phases: 1) Capturing (window → target), 2) Target phase (the element you clicked), 3) Bubbling (target → window). Most event listeners use the bubble phase (default). This is why clicking a button inside a div can trigger handlers on both!

**Visual: Event Flow (Practical Example)**

![Event Flow in Sari-Sari Store](diagrams/event-flow-practical.png)

Here's a real example from our store project. When you click "Add to Cart" button, the event bubbles up through the product card to the grid container. This lets us use **event delegation**: one listener on the grid handles all buttons—even buttons added later!

---

> Accessibility tip: Use semantic elements for interactive controls (e.g., `<button>`) and handle both click and keyboard activation when appropriate. Avoid putting click handlers on non-interactive elements unless you also manage focus and key events.

### 🎯 Try it yourself — Events (Click Counter)

- Open: `assets/practice1.html` and add a simple counter.
- How: Double-click to open in your browser

Add this under the existing code:

```javascript
let count = 0;
const counter = document.createElement('p');
counter.className = 'small';
document.querySelector('.card').appendChild(counter);
btn.addEventListener('click', ()=>{
	count++;
	counter.textContent = `Clicked: ${count}`;
});
```

## Mini Project A — Grade Calculator (guided)

Goal: Create a simple Grade Calculator that:
- Accepts three scores as numbers
- Calculates average and shows PASS/FAIL (DepEd passing 75)
- Color-codes the result (green for pass, red for fail)
- Shows a short remark (Great job! / Review the lessons)

**Download:** [`calculator.html`](assets/calculator.html)

Files:
- `assets/calculator.html` — starter HTML & CSS
- `assets/styles.css` — shared styles

Steps we will provide in the lecture:
1. Get form elements with `getElementById` or `querySelector`
2. Listen for `submit` and prevent default
3. Read `.value` from inputs and convert to numbers
4. Calculate average using `reduce` or simple math
5. Display result with `.textContent` and `.classList.add('success'/'error')`
6. Bonus: store last result in `localStorage` (optional advanced)

Pedagogical notes: this project revisits arrays and methods from Part 2 but shows a UI-producing flow.

**Visual: Form Validation Flow**

![Form Validation Process](diagrams/form-validation.png)

This flowchart shows a typical validation pattern: prevent default, read values, check if empty, validate format (like email), then either show errors or process the data and show success. Always use `event.preventDefault()` on forms to stop the page from reloading!

---

## Mini Project B — To-Do List (guided)

Goal: Build a small to-do list app with:
- Input to add tasks
- Display tasks in a list
- Mark tasks completed (toggle class)
- Delete tasks
- Show remaining count

**Download:** [`todo.html`](assets/todo.html)

Files:
- `assets/todo.html` (starter + guided steps)

Key concepts: createElement, appendChild, event listeners for buttons, array of tasks in memory

Advanced extras: Save to `localStorage`, edit task text, reorder tasks

---

## Mini Project C — Sari‑Sari Store UI (guided)

Goal: Show a simple product grid built from an array of product objects. Each card shows name, price, and "Add to Cart" button. Clicking Add updates a cart sidebar and adjusts stock.

**Download:** [`store.html`](assets/store.html)

Files:
- `assets/store.html`

Key JS concepts: arrays of objects, mapping to DOM nodes, updating totals, disabling Add button when out-of-stock

Pedagogical tie-in: links to Part 2 topics (arrays, filter, reduce)

**Visual: Shopping Cart Architecture**

![Cart Data Flow](diagrams/cart-architecture.png)

This diagram shows how data flows in our store app. The UI layer (buttons, product cards, cart display) talks to the logic layer (functions like `addToCart` and `render`), which updates the data layer (products array and cart array). Clean separation makes debugging easier!

**Visual: Event Delegation Pattern**

![Event Delegation Before vs After](diagrams/event-delegation.png)

Compare these two approaches. On the left: attaching a listener to each button individually (memory-heavy, hard to maintain). On the right: one listener on the parent container that checks which button was clicked. Event delegation saves memory and automatically handles new buttons!

---

## Final Challenge — Student Management Dashboard (starter + hints)

Students pick a theme (Student roster, Store inventory, Game leaderboard). Starter `assets/dashboard-starter.html` will include the HTML scaffold and comments with tasks. We'll also provide a full `assets/dashboard-solution.html` for teachers.

**Downloads:**
- [`dashboard-starter.html`](assets/dashboard-starter.html) — For students (scaffold with TODOs)
- [`dashboard-solution.html`](assets/dashboard-solution.html) — For teachers (full working version)

Requirements (minimum):
- Add item with form
- List items in table/cards
- Edit item (inline or modal)
- Delete item
- Sort or filter items
- Show some statistics (avg score, total inventory value, top players)

Bonus: save to `localStorage`, search box, export CSV

---

## When to Use DOM Manipulation (vs Other Approaches)

### ✅ Use DOM When:

**1. Making Pages Interactive (Client-Side)**
```javascript
// Perfect for immediate user feedback
button.addEventListener('click', () => {
    counter++;
    display.textContent = counter;  // Updates instantly!
});
```
**Why:** No server needed, instant response, works offline

**Philippine Example:** Sari-sari store calculator - add items, see total immediately

**2. Form Validation (Before Submitting)**
```javascript
// Check inputs before sending to server
submitBtn.addEventListener('click', () => {
    if (nameInput.value.trim() === '') {
        errorMsg.textContent = 'Pangalan ay kailangan!';
        errorMsg.style.display = 'block';
        return;  // Don't submit
    }
});
```
**Why:** Saves data costs (don't send invalid requests)

**3. Dynamic UI Updates (Without Page Reload)**
```javascript
// Show/hide sections without reloading
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => {
        s.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}
```
**Philippine Context:** Works during brownouts, no server needed

**4. Simple Client-Side Calculations**
```javascript
// Grade calculator - all calculations in browser
function calculateAverage(grades) {
    const sum = grades.reduce((a, b) => a + b, 0);
    return (sum / grades.length).toFixed(2);
}
```
**Why:** Free, instant, works offline

---

### ❌ Don't Use DOM When:

**1. Data Needs to Persist (Use Server/Database)**
```javascript
// ❌ BAD: Refreshing page loses data
let students = [];  // Lost on refresh!

// ✅ BETTER: Save to server
fetch('/api/students', {
    method: 'POST',
    body: JSON.stringify(student)
});
```
**Philippine Example:** Barangay records must be saved permanently (use database)

**2. Multiple Users Need Same Data (Use Server)**
```javascript
// ❌ BAD: Each user has their own copy
localStorage.setItem('inventory', JSON.stringify(items));

// ✅ BETTER: Shared server database
// Multiple store branches see same inventory
```

**3. Secure/Sensitive Operations (Use Server)**
```javascript
// ❌ NEVER: Password checking in browser
if (password === 'secret123') {  // Visible in source code!
    allow Access();
}

// ✅ ALWAYS: Check on server
// Server validates, never trust client
```

**4. Heavy Computations (Use Server)**
```javascript
// ❌ BAD: Processing 10,000 records in browser
// Freezes browser, crashes on budget phones

// ✅ BETTER: Server processes, sends results
// Browser just displays the data
```

---

### 🤔 DOM vs Alternatives: Decision Framework

| Need | Use DOM | Use Server | Use Both |
|------|---------|------------|----------|
| Instant feedback on click | ✅ Yes | ❌ Too slow | - |
| Save data permanently | ❌ No | ✅ Yes | - |
| Form validation | ✅ Yes (client) | ✅ Yes (server) | ✅ Both! |
| Password checking | ❌ Never | ✅ Always | - |
| Shopping cart | ✅ Yes (display) | ✅ Yes (save) | ✅ Both! |
| Animations/transitions | ✅ Yes (CSS better) | ❌ No | - |
| Calculate totals | ✅ Yes (simple) | ✅ Yes (complex) | Depends |
| Multi-user collaboration | ❌ No | ✅ Yes | - |

---

### 📱 Philippine Context Examples

**Sari-Sari Store Calculator (DOM Only):**
```javascript
// Perfect for DOM - instant calculations, works offline
let total = 0;

function addItem(name, price) {
    total += price;
    updateDisplay();  // Instant update!
}
```
**Why DOM:** No internet needed, instant feedback, works during brownouts

**Barangay Clearance System (DOM + Server):**
```javascript
// DOM for form validation
if (!validateForm()) {
    showError('Please fill all fields');
    return;
}

// Server for saving
fetch('/api/clearance', {
    method: 'POST',
    body: JSON.stringify(formData)
});
```
**Why Both:** Validate fast (DOM), save permanently (server)

**Student Grade Portal (Server > DOM):**
```javascript
// Server provides grades (secure, persistent)
fetch('/api/grades')
    .then(res => res.json())
    .then(grades => {
        // DOM displays grades (fast, interactive)
        displayGrades(grades);
    });
```
**Why Both:** Server stores grades securely, DOM makes viewing interactive

---

### 💡 Quick Decision Guide

**Ask yourself:**

1. **Does data need to survive page refresh?**
   - No → DOM only (e.g., calculator)
   - Yes → Need server/localStorage

2. **Will multiple users access same data?**
   - No → DOM + localStorage okay
   - Yes → Must use server

3. **Is it sensitive (passwords, payments)?**
   - Yes → Server only, never trust client
   - No → DOM is fine

4. **Does it need internet?**
   - No → DOM perfect (works offline)
   - Yes → Server needed

5. **Is it a slow operation?**
   - No (<100ms) → DOM is fine
   - Yes (seconds+) → Consider server

---

### 🎯 Philippine-Specific Considerations

**Limited Internet (DOM Advantages):**
```javascript
// Calculator works without internet
// No data costs
// Works during brownouts
// Instant results
```

**Shared Devices (Server Advantages):**
```javascript
// Computer shop scenario
// Multiple students use same PC
// Each needs their own saved data
// Must use server + authentication
```

**Budget Phones (Keep DOM Light):**
```javascript
// ✅ Good: Simple DOM operations
document.getElementById('result').textContent = total;

// ❌ Bad: Heavy DOM operations
for (let i = 0; i < 10000; i++) {
    div.appendChild(document.createElement('p'));
}
// Crashes phone!
```

---

### ✅ Best Practices Summary

**DO:**
- Use DOM for instant, client-side interactions
- Validate forms with DOM before sending to server
- Use DOM for offline-capable features
- Keep DOM operations simple (budget phones!)
- Combine DOM + server for best experience

**DON'T:**
- Store sensitive data in DOM/localStorage
- Trust client-side validation alone (also validate on server)
- Process huge datasets in browser (use server)
- Forget about users with old phones (test performance!)

---

## Troubleshooting & Tips (for class handout)

- If nothing happens: check console (F12) for errors
- Make sure `<script>` is either at bottom of `<body>` or uses `defer` in `<head>`
- IDs are case-sensitive — double-check spelling
- Use `console.log()` to inspect variables and elements

Common errors:
- `Cannot read property 'addEventListener' of null` → element not found (wrong ID or script ran too early)
- `NaN` in calculations → parse input values with `Number()` or `parseFloat()`

---

## What comes after DOM? A brief roadmap

- Fetching remote data (AJAX / fetch API)
- Asynchronous JavaScript (Promises, async/await)
- Frameworks (React/Vue/Svelte) — optional next step after mastering DOM

---


