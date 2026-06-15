# Quiz: The DOM (Document Object Model)

## Maria wants to select an HTML element by its ID to change its text. Which method should she use?
* [ ] `document.getElementByClassName("title")`
* [x] `document.getElementById("title")`
* [ ] `document.querySelector("#title")`
* [ ] Both B and C work

## What does this code do?
```javascript
document.getElementById("price").textContent = "₱50";
```
* [ ] Creates a new element with id "price"
* [x] Finds the element with id "price" and changes its text content to "₱50"
* [ ] Changes the HTML attribute of "price" to "₱50"
* [ ] Deletes the element with id "price"

## Carlo wants to change the background color of a button when the user clicks it. Which approach is correct?
* [ ] `button.style.background-color = "red"`
* [x] `button.style.backgroundColor = "red"`
* [ ] `button.css("background-color", "red")`
* [ ] `button.setAttribute("color", "red")`

## What does this code output?
```html
<button id="myBtn">Click me</button>
```
```javascript
let btn = document.getElementById("myBtn");
console.log(btn.textContent);
```
* [ ] `myBtn`
* [x] `Click me`
* [ ] `button`
* [ ] `null`

## Liza wants to run a function every time a user clicks a "Add to Cart" button. Which method should she use to listen for the click?
* [ ] `button.onClick(addToCart)`
* [x] `button.addEventListener("click", addToCart)`
* [ ] `button.listen("click", addToCart)`
* [ ] `button.attach("click", addToCart)`

## The DOM is a tree-like structure that represents the HTML page as ___ that JavaScript can select, change, add, or remove.
Answer: objects
Answer: nodes
Answer: elements

## What does this code do?
```javascript
let newDiv = document.createElement("div");
newDiv.textContent = "Hello";
document.body.appendChild(newDiv);
```
* [ ] Replaces the entire body with "Hello"
* [x] Creates a new `<div>` element with the text "Hello" and adds it to the end of the body
* [ ] Changes the body text to "Hello"
* [ ] Creates a div but does not add it to the page

## Juan wrote this code to hide an element, but it doesn't work. What is the bug?
```javascript
let box = document.getElementByID("notification");
box.style.display = "none";
```
* [ ] `display` is not a valid style property
* [x] The method name is `getElementById` (lowercase `d`), not `getElementByID`
* [ ] `style` should be `styles`
* [ ] `"none"` should be `"hidden"`
