# Quiz: Express.js Basics

## Maria wants to create a route that displays a list of students when a user visits the home page. Which Express method should she use?
* [ ] `app.post("/", ...)`
* [x] `app.get("/", ...)`
* [ ] `app.render("/", ...)`
* [ ] `app.send("/", ...)`

## What does this code do?
```javascript
app.use(express.urlencoded({ extended: true }));
```
* [ ] Compresses the server's responses for faster loading
* [x] Parses data submitted from HTML forms so it becomes available in `req.body`
* [ ] Encodes URLs for security
* [ ] Connects Express to a database

## Carlo built a form to add a product. When he submits it, `req.body` is `undefined`. What did he forget to add?
* [ ] A `name` attribute on the `<form>` tag
* [x] The `express.urlencoded()` middleware (so Express can parse form data)
* [ ] A `method="GET"` on the form
* [ ] A `<script>` tag linking to Express

## What does this code output when a user visits `http://localhost:3000`?
```javascript
app.get("/", (req, res) => {
  res.send("Hello, World!");
});
```
* [ ] It renders an HTML file called "Hello, World!"
* [x] It sends the text "Hello, World!" to the browser
* [ ] It redirects to another page
* [ ] It throws an error

## Liza uses EJS templates in her Express app. What method does she use to render an EJS view and send it to the browser?
* [ ] `res.send()`
* [ ] `res.view()`
* [x] `res.render()`
* [ ] `res.template()`

## In EJS, which syntax outputs a variable's value into the HTML?
* [ ] `{= variable }`
* [ ] `{{ variable }}`
* [x] `<%= variable %>`
* [ ] `[variable]`

## Juan's route handles form submissions but products are being saved even when the name field is empty. Looking at his code, what is missing?
```javascript
app.post("/add", (req, res) => {
  const products = getProducts();
  products.push({ name: req.body.name, price: req.body.price });
  saveProducts(products);
  res.redirect("/");
});
```
* [ ] A `name` attribute on the form
* [x] Server-side validation to check if `req.body.name` is not empty before saving
* [ ] Changing `app.post` to `app.get`
* [ ] Adding `express.json()` middleware

## In web server routes, ___ retrieves/shows data, unlike the other method which submits/creates data
Answer: GET
Answer: get

## In Express, the three parameters in a route handler are `req`, `res`, and sometimes `___` (for middleware chaining).
Answer: next
Answer: next()

## What does this Express code do?
```javascript
app.use(express.static("public"));
```
* [ ] Starts the server on a public port
* [x] Serves static files (CSS, images, JavaScript) from the "public" folder so the browser can access them
* [ ] Makes the app publicly accessible on the internet
* [ ] Imports public modules from npm
