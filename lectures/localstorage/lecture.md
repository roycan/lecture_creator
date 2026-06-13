# localStorage Lecture 

> Roy Canseco 


## User Interface

  <h2>Save a Note</h2>
  <form id="noteForm">
    <input id="name" placeholder="Your name" required>
    <input id="note" placeholder="Short note" required>
    <button type="submit">Save</button>
  </form>



## html head


```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Notes Demo</title>
  <style>
    body { font-family: Arial, sans-serif; max-width:700px; margin:20px; }
    input, button { padding:8px; margin:4px 0; }
    li { margin:6px 0; }
  </style>
</head>
```

## html body

```html    
<body>
  <h2>Save a Note</h2>
  <form id="noteForm">
    <input id="name" placeholder="Your name" required>
    <input id="note" placeholder="Short note" required>
    <button type="submit">Save</button>
  </form>

  <h3>Saved Notes</h3>
  <ul id="list"></ul>
```

## loadNotes script


```js
  <script>
    // Helpers for localStorage
    const KEY = 'notes';

    function loadNotes() {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    }
```

## saveNotes script 

```js
    function saveNotes(notes) {
      localStorage.setItem(KEY, JSON.stringify(notes));
    }
```

## render script

```js   

    // Render list to the page
    function render() {
      const notes = loadNotes();
      const list = document.getElementById('list');
      if (notes.length === 0) {
        list.innerHTML = '<li><em>No notes yet</em></li>';
        return;
      }
      list.innerHTML = notes.map((n, i) =>
        `<li>
           <strong>${escapeHtml(n.name)}</strong> (${n.time}) — ${escapeHtml(n.text)}
           <button data-i="${i}">Delete</button>
         </li>`
      ).join('');
    }
```

## escapeHtml script

```js
    // Simple HTML escape to avoid accidental HTML injection in demo
    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }
```

## form handling script

```js

    // Form handling: read values into an object and persist
    const form = document.getElementById('noteForm');
    form.onsubmit = e => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const text = document.getElementById('note').value.trim();
      if (!name || !text) return;

      const obj = {
        id: Date.now(),
        name,
        text,
        time: Date.now()
      };

      const notes = loadNotes();
      notes.push(obj);           // grow the array over time
      saveNotes(notes);          // store updated array in localStorage
      render();
      form.reset();
    };

```

## remove script

```js

    // Remove item from localStorage by index
    document.getElementById('list').onclick = e => {
      if (e.target.tagName !== 'BUTTON') return;
      const i = Number(e.target.dataset.i);
      const notes = loadNotes();
      notes.splice(i, 1);        // remove one item
      saveNotes(notes);
      render();
    };

```

## onload script

```html


    // Initial render on page load
    render();
  </script>
</body>
</html>
```


### Teaching tips & pitfalls

-   **Important:** _Always use_ `JSON.stringify` _to save objects/arrays and_ `JSON.parse` _to read them back._
    
-   **Demo offline:** open the HTML file locally so the demo doesn’t depend on internet. Use your hotspot only for the sign‑up form.
    
-   **Edge cases:** show what happens when `localStorage` is empty (use `|| []` pattern). Explain size limits briefly (browsers limit storage to a few MB).
    
-   **Security note:** localStorage is not secure for passwords or sensitive data—only use for simple app state.



### Exercise

Ask students to change the code so each note shows the **time saved** (use `new Date().toLocaleTimeString()`), then test adding two notes and deleting one.