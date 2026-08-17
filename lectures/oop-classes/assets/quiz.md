# OOP I Self-Quiz

Test your understanding of classes, instances, `this`, and the has-a relationship. Pick the best answer for each question — this quiz is for calibration, not grades.

---

## 1. Which keyword defines a blueprint for objects, and which creates one object from it?

* [ ] `object` defines it; `make` creates one
* [x] `class` defines it; `new` creates one
* [ ] `constructor` defines it; `class` creates one
* [ ] `blueprint` defines it; `instance` creates one

---

## 2. What does the expression `new Product(1, "Sardinas", 20, 24)` evaluate to?

* [ ] The `Product` class itself, with the values attached to it
* [x] A newly created object whose fields were set by running the constructor with `this` pointing at that new object
* [ ] `undefined` — constructors only run code, they return nothing
* [ ] `true` if the construction succeeded, `false` otherwise

---

## 3. Inside a method, what does `this` refer to?

* [ ] The class where the method is defined
* [ ] Whatever object the method was copied from
* [x] The instance that received the method call (the object on the left of the dot)
* [ ] The most recently created instance of the class

---

## 4. "Stock can never go negative." Where should that rule live so it is actually enforced?

* [ ] In a comment at the top of the file, so programmers remember
* [ ] In the UI code, checked right before rendering the table
* [ ] In every function that touches any product, copied for safety
* [x] Inside the `Product` class — the constructor refuses bad starting stock, and `sell()` refuses overdraws

---

## 5. Read the code. What does the last line print?

```javascript
class Product {
  constructor(id, name, price, stock) {
    this.id = id; this.name = name; this.price = price; this.stock = stock;
  }
  sell(qty) {
    if (qty > this.stock) return false;
    this.stock -= qty;
    return true;
  }
}
const p = new Product(1, "Sardinas 155g", 20, 10);
p.sell(4);
p.sell(9);
console.log(p.stock);
```

* [ ] `-3` — the second sell drops stock below zero
* [ ] `10` — selling doesn't change stock, only `restock` does
* [x] `6` — the first sell succeeds (10−4), the second is refused (9 > 6)
* [ ] `0` — a refused sell sets stock to zero

---

## 6. "A `Store` has a collection of `Product`s." What is this relationship called?

* [ ] Inheritance — the Store is a kind of Product
* [x] Composition (has-a) — the Store contains Product instances
* [ ] Delegation — the Products build the Store
* [ ] Instantiation — the Store creates the Product class

---

## 7. Scenario: your app needs ONE settings object (`{ theme: "light", currency: "₱" }`) that will never have a second copy, has no rules to protect, and no methods beyond a simple read. What's the right tool?

* [ ] A class — always wrap data in a class for safety
* [x] A plain object literal — one object with no rules to guard is exactly what literals are for; a blueprint for one house is a drawing of that house
* [ ] A class with a private constructor pattern
* [ ] An array of settings, indexed by name

---

## 8. Fill in the blank: Instances of a class are created with the `___` keyword.

Instances of a class are created with the `___` keyword, which builds a fresh object, runs the `___`, and returns the finished object.

Answer: new; constructor
