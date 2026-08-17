# OOP III Self-Quiz

Test your understanding of prototypes, the chain, `new`, and `Object.create`. Pick the best answer for each question — this quiz is for calibration, not grades.

---

## 1. You write `class Tricycle` with a `fare(km)` method and create `unit01` and `unit02`. Where does the single `fare` function actually live?

* [ ] Copied into `unit01` and again into `unit02` — one private copy each
* [x] On `Tricycle.prototype` — one shared copy, reached by each instance's hidden link
* [ ] Inside the `class` block itself, unavailable to instances
* [ ] In the global scope, next to `fare` declarations everywhere

---

## 2. `Object.getPrototypeOf(unit01)` returns:

* [ ] The string `"Tricycle"`
* [ ] A brand-new empty object each time you call it
* [x] The object `unit01`'s hidden link points at — the same object as `Tricycle.prototype`
* [ ] `null` — prototypes are invisible to code

---

## 3. Which lists the four steps of `new Tricycle(...)` in order?

* [ ] run constructor → create object → return → link prototype
* [ ] link prototype → return → create object → run constructor
* [x] create a fresh empty object → link it to `Tricycle.prototype` → run the constructor with `this` = fresh object → return the object
* [ ] copy the class methods into the object → run constructor → verify types → freeze the object

---

## 4. What sits at the very end of every prototype chain?

* [ ] `Object.prototype`
* [ ] `undefined`
* [x] `null` — the chain's hard stop
* [ ] The class constructor

---

## 5. Read the code. What happens?

```javascript
function Tricycle(plate, driver, baseFare) {
  this.plate = plate; this.driver = driver; this.baseFare = baseFare;
}
Tricycle.prototype.fare = function (km) { return this.baseFare + Math.ceil(km) * 8; };

const unitA = new Tricycle("TSK-142", "Kuya Ronnie", 25);

Tricycle.prototype.honk = function () { return `${this.plate}: brrrrp!`; };

console.log(unitA.honk());
```

* [ ] TypeError — `unitA` was created before `honk` existed, so it can never see it
* [ ] It prints `brrrrp!` but without the plate, since `this` is lost
* [x] It prints `TSK-142: brrrrp!` — instances link to the shared prototype object, so changes to it are visible immediately
* [ ] It prints `undefined` — methods added later return nothing

---

## 6. What does `Object.create(routeProto)` return?

* [ ] A copy of `routeProto`, fields and all
* [x] A fresh, empty object whose hidden link points at `routeProto` — so it can use `routeProto`'s methods
* [ ] A new class based on `routeProto`
* [ ] `routeProto` itself — there is still only one object

---

## 7. `unitA.fare` comes from the prototype; `unitA.baseFare` was set in the constructor. Which is stored as an OWN property of `unitA`?

* [ ] Both — everything reachable from an object is its own property
* [ ] Neither — own properties don't exist for prototype-linked objects
* [ ] `fare` — methods are always own properties
* [x] `baseFare` — own properties are set on the instance; `fare` lives up the chain (that's why `hasOwnProperty("fare")` is `false`)

---

## 8. Fill in the blank: `class` syntax is `___` over the prototype system — it de-sugars to constructor functions plus `___` assignments.

`class` syntax is `___` over the prototype system — a class method is really assigned to `___`, one shared copy per class.

Answer: syntactic sugar; X.prototype (the class's prototype object)
