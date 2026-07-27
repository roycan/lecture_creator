# htmx Self-Quiz

Test your understanding before attempting the G4/G3 Integration Gate. Pick the best answer for each question.

---

## 1. What htmx attribute replaces `fetch()` for GET requests?

* [x] `hx-get`
* [ ] `hx-post`
* [ ] `hx-fetch`
* [ ] `hx-load`

---

## 2. Where does htmx place the server's response by default?

* [x] Inside the element that triggered the request (replacing its `innerHTML`)
* [ ] At the very bottom of `<body>`
* [ ] Inside a new `<div>` appended after the triggering element
* [ ] htmx does not place the response; you must write a callback

---

## 3. What does `hx-target="#results"` do?

* [x] It directs the server's HTML response to replace the element with `id="results"`
* [ ] It replaces the button that triggered the request
* [ ] It changes the URL of the current page to `#results`
* [ ] It sends the `#results` element to the server as part of the request body

---

## 4. Which `hx-swap` value appends content to the **end** of a list (inside the target)?

* [x] `beforeend`
* [ ] `innerHTML`
* [ ] `outerHTML`
* [ ] `afterend`

---

## 5. What does the `HX-Trigger` response header do?

* [x] It tells htmx to fire a custom JavaScript event on one or more elements after the response is swapped
* [ ] It triggers a full page reload
* [ ] It forces the browser to re-fetch the same URL
* [ ] It sets the HTTP method to TRIGGER instead of GET

---

## 6. Which HTTP method does `hx-post` send?

* [x] POST
* [ ] GET
* [ ] PUT
* [ ] PATCH

---

## 7. What should your Express route return when an htmx request hits it — JSON or HTML?

* [x] HTML (a page fragment, like a partial or a set of `<tr>` rows)
* [ ] JSON (a structured JavaScript object)
* [ ] Plain text only
* [ ] Either JSON or HTML; htmx auto-detects the format

---

## 8. True or False: htmx requires `npm install` and a build step before you can use it.

* [x] False — htmx is a single JavaScript file; you can include it via a `<script>` tag from a CDN with zero build tools
* [ ] True — you must `npm install htmx` and run a bundler like Webpack or Vite

---

## 9. **Scenario:** You have a table of barangay officials and a form to add a new one. You want the new row to appear at the bottom of the table **without a full page reload**. Which TWO htmx attributes must be combined on the form?

```html
<form hx-post="/officials" hx-target="#officials-table-body" hx-swap="beforeend">
  <input name="name" placeholder="Full Name">
  <input name="position" placeholder="Position">
  <button type="submit">Add Official</button>
</form>

<table>
  <thead><tr><th>Name</th><th>Position</th></tr></thead>
  <tbody id="officials-table-body">
    <!-- Existing rows here -->
  </tbody>
</table>
```

* [x] `hx-post` (or `hx-get`) plus `hx-swap="beforeend"` — the first sends the data, the second appends the response
* [ ] `hx-get` plus `hx-swap="outerHTML"` — GET replaces the entire table
* [ ] `hx-post` plus `hx-push-url="true"` — pushing a URL is what inserts the row
* [ ] `hx-trigger="submit"` plus `hx-replace` — these are the only two attributes htmx supports for forms

---

## 10. **Scenario:** You are building a barangay directory CRUD page. Your server already renders rows via EJS templates (e.g., `<%- include('_row', { official }) %>`). Why would you choose htmx over writing manual `fetch()` calls?

* [x] The server already knows how to render HTML fragments via EJS; htmx lets you reuse those same templates for AJAX responses instead of duplicating rendering logic in JavaScript
* [ ] htmx makes network requests faster than `fetch()` due to a built-in caching layer
* [ ] htmx works offline without any server, while `fetch()` always requires a backend
* [ ] htmx is the only way to make AJAX requests without jQuery
