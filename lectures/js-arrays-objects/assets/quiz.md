# Quiz: JavaScript Arrays and Objects

## Maria has an array of product names in her sari-sari store app. She wants to access the first product. What index should she use?
```javascript
let products = ["Rice", "Canned Goods", "Soap"];
```
* [x] `products[0]`
* [ ] `products[1]`
* [ ] `products.first()`
* [ ] `products(0)`

## What does this code output?
```javascript
let student = {
  name: "Juan",
  grade: 10,
  section: "Einstein"
};
console.log(student.name);
```
* [ ] `undefined`
* [x] `Juan`
* [ ] `name`
* [ ] `["Juan", 10, "Einstein"]`

## Carlo wants to add "Shampoo" to the end of his products array. Which method should he use?
* [ ] `products.add("Shampoo")`
* [x] `products.push("Shampoo")`
* [ ] `products.append("Shampoo")`
* [ ] `products.insert("Shampoo")`

## What does this code output?
```javascript
let numbers = [5, 10, 15, 20];
let total = 0;
numbers.forEach(function(n) {
  total += n;
});
console.log(total);
```
* [ ] 15
* [ ] 20
* [x] 50
* [ ] 4

## Liza has an object representing a student. She wants to loop through all the keys and values. Which statement is best for this purpose?
* [ ] `for...of`
* [x] `for...in`
* [ ] `while`
* [ ] `switch`

## An ___ is an ordered list of values, while an ___ is a collection of key-value pairs. (Write the data type name for both.)
Answer: array, object
Answer: Array, Object

## What does this code output?
```javascript
let cart = {
  items: ["Rice", "Milk"],
  total: 250
};
cart.items.push("Coffee");
console.log(cart.items.length);
```
* [ ] 2
* [x] 3
* [ ] 1
* [ ] Error

## Juan's code crashes with `TypeError: products.forEach is not a function`. Looking at his code, what is the most likely cause?
```javascript
let products = {
  name: "Rice",
  price: 50
};
products.forEach(function(p) {
  console.log(p);
});
```
* [ ] The function is missing a return statement
* [x] `products` is an object, not an array — objects do not have a `forEach` method
* [ ] `forEach` should be capitalized as `ForEach`
* [ ] The callback function has too many parameters
