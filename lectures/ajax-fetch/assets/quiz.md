# Quiz: AJAX and Fetch API

## Maria wants her web page to load product data from a server WITHOUT refreshing the entire page. What technique should she use?
* [ ] A regular form submission
* [x] AJAX using the Fetch API
* [ ] `document.write()`
* [ ] `window.location.reload()`

## What does this code do?
```javascript
fetch("https://api.example.com/products")
  .then(response => response.json())
  .then(data => console.log(data));
```
* [ ] Downloads a file called "products"
* [x] Sends a GET request to the API, converts the response to JSON, and logs the data to the console
* [ ] Sends user data to the server
* [ ] Creates a new product on the server

## Carlo runs this code, but the server is down and returns a 500 error. What happens?
```javascript
fetch("https://api.example.com/products")
  .then(response => response.json())
  .then(data => console.log(data));
```
* [ ] The code crashes and stops execution
* [x] The `.then()` chain still runs — `fetch` only rejects on network errors, not HTTP error statuses. You need to check `response.ok` manually.
* [ ] The browser shows a popup alert
* [ ] `response.json()` automatically returns `null`

## How should Carlo handle errors in a `fetch` call?
* [ ] Use `try/catch` around the entire fetch
* [x] Add a `.catch()` at the end of the promise chain and also check `response.ok`
* [ ] Use `if (fetch.error)` to detect problems
* [ ] Errors are automatically handled by the browser

## The `fetch()` function returns a `___`, which represents a value that will be available in the future (either the response data or an error).
Answer: Promise
Answer: promise

## Liza wants to send data to a server using POST. Which option does she need to pass to `fetch()`?
* [ ] `fetch(url).post(data)`
* [x] `fetch(url, { method: "POST", body: JSON.stringify(data) })`
* [ ] `fetch(url, data, "POST")`
* [ ] `fetch.post(url, data)`

## When sending JSON data in a POST request with `fetch`, what header tells the server the data is JSON format?
* [ ] `Accept: application/json`
* [x] `Content-Type: application/json`
* [ ] `Data-Type: json`
* [ ] `Format: JSON`

## AJAX stands for Asynchronous JavaScript and ___. (Fill in the last word.)
Answer: XML
Answer: xml
