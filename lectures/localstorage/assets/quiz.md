# Quiz: LocalStorage — Saving Data in the Browser

## Maria wants to save a user's name in the browser so it's still there after they refresh the page. Which method should she use to store it?
* [ ] `localStorage.save("name", "Juan")`
* [x] `localStorage.setItem("name", "Juan")`
* [ ] `localStorage.store("name", "Juan")`
* [ ] `localStorage.push("name", "Juan")`

## What does this code output?
```javascript
localStorage.setItem("score", "100");
let result = localStorage.getItem("score");
console.log(typeof result);
```
* [ ] `number`
* [x] `string`
* [ ] `integer`
* [ ] `undefined`

## Carlo saved a list of products to localStorage but when he tries to read it back, he gets a long string instead of an array. What does he need to do?
* [ ] Use `localStorage.getArray()` instead
* [x] Use `JSON.stringify()` when saving and `JSON.parse()` when reading
* [ ] Save each product in a separate localStorage key
* [ ] localStorage cannot store arrays at all

## What does this code do?
```javascript
localStorage.removeItem("cart");
```
* [ ] Removes all data from localStorage
* [x] Deletes only the item with the key "cart" from localStorage
* [ ] Removes the cart element from the HTML page
* [ ] Clears the browser's cookies

## Liza wants to store a cart total of 250.50 in localStorage. She writes this code but when she reads it back, she gets unexpected results. What is the issue?
```javascript
localStorage.setItem("total", 250.50);
```
* [ ] `setItem` does not accept numbers
* [x] localStorage stores everything as strings, so she should convert it back with `Number()` or `parseFloat()` when reading
* [ ] The decimal point is not supported
* [ ] The key name "total" is a reserved word

## Unlike a server-side database, localStorage data is stored only in the ___ and disappears if the user clears their browser data.
Answer: browser
Answer: browser's memory

## What is the maximum amount of data typically stored in localStorage per domain?
* [ ] 1 MB
* [x] About 5 MB
* [ ] 100 MB
* [ ] Unlimited

## Juan wants to clear ALL saved data from localStorage for his app. Which method should he call?
* [ ] `localStorage.deleteAll()`
* [ ] `localStorage.empty()`
* [x] `localStorage.clear()`
* [ ] `localStorage.reset()`
