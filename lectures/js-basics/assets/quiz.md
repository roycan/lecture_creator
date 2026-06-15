# Quiz: JavaScript Basics

## Maria wants to declare a variable for the price of a product that will NOT change. Which keyword should she use?
* [ ] `let`
* [ ] `var`
* [x] `const`
* [ ] `fixed`

## What does this code output?
```javascript
let x = "5" + 3;
console.log(x);
```
* [ ] 8
* [x] "53"
* [ ] 53
* [ ] Error

## Carlo wrote this function to greet a user. But when he assigns its result to a variable, the variable is `undefined`. What is the bug?
```javascript
function greet(name) {
  console.log("Hello, " + name);
}
let result = greet("Maria");
console.log(result);
```
* [ ] The function name is misspelled
* [x] The function uses `console.log` instead of `return`, so it returns `undefined`
* [ ] You cannot assign a function call to a variable
* [ ] The parameter name is wrong

## What does this code output?
```javascript
let score = 75;
if (score >= 90) {
  console.log("A");
} else if (score >= 80) {
  console.log("B");
} else if (score >= 70) {
  console.log("C");
} else {
  console.log("F");
}
```
* [ ] B
* [x] C
* [ ] A
* [ ] F

## What does this code output?
```javascript
console.log(typeof true);
```
* [ ] `"true"`
* [ ] `string`
* [x] `boolean`
* [ ] `number`

## The three logical operators in JavaScript are `&&` (AND), `||` (OR), and `___` (NOT).
Answer: !
Answer: NOT

## Liza wants to run a block of code exactly 5 times. Which loop is best when you know the exact number of repetitions?
* [ ] `while`
* [x] `for`
* [ ] `repeat`
* [ ] `loop`

## What does this code output?
```javascript
let numbers = [10, 20, 30];
numbers.push(40);
console.log(numbers.length);
```
* [ ] 3
* [x] 4
* [ ] 40
* [ ] 100

## Juan wants to check if a variable `age` is 18 or older. Which condition is syntactically correct in JavaScript?
* [ ] `if age >= 18`
* [x] `if (age >= 18)`
* [ ] `if (age => 18)`
* [ ] `if age >= 18:`

## Ben sees `NaN` in his console after doing math. What does `NaN` stand for?
Answer: Not a Number
Answer: NaN
Answer: not a number
