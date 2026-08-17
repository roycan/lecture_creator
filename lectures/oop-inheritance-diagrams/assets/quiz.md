# OOP II Self-Quiz

Test your understanding of inheritance, overriding, and UML class diagrams. Pick the best answer for each question — this quiz is for calibration, not grades.

---

## 1. What does `class PerishableProduct extends Product` establish?

* [ ] That `Product` receives all the fields and methods of `PerishableProduct`
* [ ] That the two classes share no code, only a naming convention
* [x] An is-a relationship — a `PerishableProduct` IS A `Product`, so it inherits all its fields and methods and can be used anywhere a `Product` is expected
* [ ] A has-a relationship — each `PerishableProduct` contains a `Product` inside it

---

## 2. What does `super(id, name, price, stock)` do inside a child constructor?

* [ ] Creates a second, independent `Product` object and returns it
* [ ] Nothing — it is just a comment-style reminder to the reader
* [x] Calls the parent class's constructor so the inherited fields are set up — and it must run before `this` is touched
* [ ] Deletes the parent's constructor so the child can replace it

---

## 3. Read the code. What does the last line print?

```javascript
class Product {
  describe() { return `₱${this.price} · ${this.name}`; }
}
class PerishableProduct extends Product {
  describe() { return super.describe() + ` (expiry: ${this.expiryDate})`; }
}
const bread = new PerishableProduct(4, "Tasty Bread", 35, 10, "2026-08-20");
// assume price/name/expiryDate are assigned correctly
console.log(bread.describe());
```

* [ ] `₱35 · Tasty Bread` — the parent's version always wins
* [ ] ` (expiry: 2026-08-20)` — super.describe() is replaced, not called
* [x] `₱35 · Tasty Bread (expiry: 2026-08-20)` — the override calls the parent's version first, then appends
* [ ] An error — you cannot call `super.describe()` inside an override

---

## 4. On a UML class diagram, what does the hollow-triangle arrow (`--▷`) mean?

* [x] Inheritance — the child is a kind of the parent; the triangle points at the parent
* [ ] Composition — one class contains instances of the other
* [ ] Association — one class references or uses the other
* [ ] Instantiation — one class creates objects of the other

---

## 5. On a UML class diagram, what does the filled diamond (`◆--`) mean, and which end is it drawn on?

* [ ] Inheritance, drawn on the child end
* [x] Composition (has-a, whole-part), drawn on the WHOLE — e.g., on the `Store` end of `Store ◆-- Product`
* [ ] Composition, drawn on the part end — e.g., on the `Product` end
* [ ] A public field — anything reachable by the diamond is public

---

## 6. Read the multiplicity aloud: `Store "1" ◆-- "0..*" Product`

* [ ] One product has zero or more stores
* [ ] A store's products are numbered 0 through star
* [x] ONE store has ZERO-OR-MORE products — each number describes the far end of the line
* [ ] Exactly one product per store, unless starred

---

## 7. "A `Sale` references `Product`s in its line items, but a sale is not a product." Which relationship is this?

* [ ] Inheritance — the sale extends the product
* [ ] Composition — the sale owns the products
* [x] Association — the sale points at products without owning them (the store owns the inventory)
* [ ] No relationship — classes cannot reference each other

---

## 8. Fill in the blank: When unsure between is-a and has-a, prefer `___` — it is flexible where inheritance is rigid.

When unsure between is-a and has-a, prefer `___`. Inherit only when the is-a sentence is plainly `___`.

Answer: composition (has-a); true
