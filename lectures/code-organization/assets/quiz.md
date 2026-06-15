# Quiz: Code Organization

## Maria's Express app has grown to 500 lines of code in a single `app.js` file, mixing routes, database queries, and EJS template logic. What is the main problem with this?
* [ ] The file is too large for the server to read
* [x] It violates separation of concerns — the code is hard to read, debug, and maintain because everything is mixed together
* [ ] JavaScript does not support files longer than 400 lines
* [ ] The app will run slower

## Carlo is following a "Model-View-Controller" (MVC-lite) pattern. In his Express app, what does the "View" represent?
* [ ] The database queries
* [x] The EJS templates that render the HTML the user sees
* [ ] The route handlers
* [ ] The CSS styling

## What does "separation of concerns" mean?
Answer: Each part of the code should have one clear responsibility
Answer: splitting code into separate files by responsibility
Answer: each module does one thing
Answer: each file/function has one job

## Liza has a function called `doStuff()` that handles form validation, database saves, and sends the email — all in one function. What should she do to improve it?
* [ ] Rename it to `doMoreStuff()`
* [x] Split it into smaller, single-purpose functions like `validateForm()`, `saveToDatabase()`, and `sendEmail()`
* [ ] Delete the function and start over
* [ ] Add more comments

## Juan is naming his variables. Which naming convention follows JavaScript best practices?
* [ ] `var x1 = 50;`
* [ ] `var a = "Rice";`
* [x] `const productPrice = 50;`
* [ ] `var PRDPRC = 50;`

## What is the purpose of a `README.md` file in a project?
* [ ] It is the main JavaScript file that runs the server
* [x] It documents what the project is, how to set it up, and how to run it — so anyone (including your future self) can understand the codebase
* [ ] It stores environment variables like passwords
* [ ] It is required by Express to start the server

## True or False: "Spaghetti code" refers to code that is well-organized, modular, and easy to follow.
* [ ] True
* [x] False — spaghetti code is tangled, disorganized code that is hard to read and maintain

## Ana inherits a classmate's project. The file is 800 lines with variables like `x`, `temp`, `data2`, and `flag`. What is the most practical first step to improve maintainability?
* [ ] Rewrite the entire project from scratch
* [x] Rename the variables to descriptive names and extract sections into well-named functions
* [ ] Add more comments without changing the code
* [ ] Delete the confusing parts
