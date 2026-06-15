# Quiz: API Testing

## Maria wants to test her API endpoint `GET /api/products` without building a full web page first. Which tool is commonly used to send HTTP requests and view responses?
* [ ] VS Code
* [x] Postman (or the browser console with `fetch()`)
* [ ] Microsoft Word
* [ ] Excel

## What does this `fetch` call return if the endpoint exists and returns data successfully?
```javascript
let result = await fetch("/api/products");
```
* [ ] The data directly as a JavaScript array
* [x] A Response object — she still needs to call `.json()` to extract the actual data
* [ ] `undefined`
* [ ] An error

## Carlo is testing his API and sends a POST request with this body:
```json
{ "name": "Rice", "price": 50 }
```
But the server responds with `400 Bad Request`. What is the most likely cause?
* [ ] The server is down
* [x] The request is missing a required header like `Content-Type: application/json`, or the data doesn't pass validation
* [ ] The URL has too many characters
* [ ] The price is too low

## When testing an API, what is the purpose of checking the HTTP status code in the response?
Answer: To know if the request succeeded, failed, or had an error
Answer: to verify the request was handled correctly
Answer: to check if it worked
Answer: to know if the request was successful

## Liza wants to test what happens when she sends invalid data to her `POST /api/students` endpoint (e.g., an empty name). What type of testing is this?
* [ ] Unit testing
* [x] Edge case / boundary testing — testing how the API handles bad or unexpected input
* [ ] Load testing
* [ ] Deployment testing

## What does the HTTP status code `500` indicate?
* [ ] Success
* [ ] The resource was not found
* [x] Internal server error — something went wrong on the server side (a bug or crash)
* [ ] The request was redirected

## True or False: You should test your API with both valid data and invalid data before deploying.
* [x] True — testing with invalid data reveals validation bugs and security issues
* [ ] False — you only need to test with valid data

## Juan tests his `DELETE /api/products/5` endpoint and it works. But when he checks the database, the product is still there. What should he check next?
* [ ] His internet connection
* [x] Whether the server's DELETE route handler is actually calling the correct SQL `DELETE` query and committing the change
* [ ] The CSS styling
* [ ] The HTML form
