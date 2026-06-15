# Quiz: Debugging with DevTools

## Maria's JavaScript code is not working but she doesn't see any error message on the page. Which DevTools tab should she open FIRST to look for JavaScript errors?
* [ ] Elements
* [x] Console
* [ ] Network
* [ ] Performance

## Carlo sees this error in his Console: `Uncaught TypeError: Cannot read properties of null (reading 'value')`. What is the most likely cause?
* [ ] He misspelled a variable name
* [x] He tried to access `.value` on an element that `getElementById` did not find (returned `null`)
* [ ] His internet connection is down
* [ ] He forgot to link his CSS file

## What does the DevTools "Elements" tab let you do?
* [ ] Run JavaScript commands
* [x] Inspect and temporarily edit the HTML and CSS of the page in real time
* [ ] View network requests
* [ ] Check your website's loading speed

## Liza's form submits but the data doesn't save. She wants to check whether the browser is actually sending the POST request to the server. Which DevTools tab should she use?
* [ ] Console
* [ ] Elements
* [x] Network
* [ ] Application

## What is the first step in the debugging cycle?
* [ ] Fix the bug
* [ ] Ask a classmate for help
* [x] Reproduce the bug (make it happen reliably)
* [ ] Rewrite the entire function

## The technique of explaining your code line-by-line to a rubber duck (or a friend) to find the bug yourself is called ___ ___.
Answer: rubber ducking
Answer: rubber duck debugging
Answer: rubber duck

## Juan's code has a bug. He suspects the problem is in one of 50 lines. Instead of reading all 50 lines, he comments out half and tests. If the bug disappears, he knows it's in that half. This technique is called:
* [ ] Rubber ducking
* [x] Divide and conquer
* [ ] Console logging
* [ ] Binary search tree

## Ana's console shows this error. What type of error is it?
```javascript
Uncaught ReferenceError: product is not defined
```
* [ ] A syntax error — she used wrong punctuation
* [x] A reference error — she used a variable name that does not exist in that scope
* [ ] A type error — she used the wrong data type
* [ ] A network error — the server is down
