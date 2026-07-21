# Quiz: Testing & Quality Assurance

## Maria manually clicks through every page of her app after each change to make sure nothing is broken. What is the drawback of this approach?
* [ ] It's too fast
* [x] It's slow, repetitive, and easy to miss edge cases — automated tests can check the same things instantly and reliably every time
* [ ] Manual testing is never useful
* [ ] It damages the keyboard

## What does this test do?
```javascript
test("add() returns the sum of two numbers", () => {
  assert.strictEqual(add(2, 3), 5);
});
```
* [ ] It deploys the app
* [x] It checks that the `add()` function returns 5 when given 2 and 3 — if it doesn't, the test fails
* [ ] It adds two numbers and prints the result
* [ ] It creates a new database table

## Carlo wants to test that his `POST /api/products` route correctly saves a new product. What type of test is this?
* [ ] Unit test
* [x] Integration test — it tests how multiple parts (route handler + database) work together
* [ ] CSS test
* [ ] Load test

## What is a bug that returns after previously working correctly, usually because a new change broke something,  in software development?
Answer: regression
Answer: Regression

## Liza writes a function called `calculateTotal(items)`. She wants to test edge cases. Which of these is the BEST set of test inputs?
* [ ] Test only with `[100, 200, 300]`
* [x] Test with normal values `[100, 200]`, an empty array `[]`, a single item `[50]`, and invalid input like `null`
* [ ] Test with one input and hope for the best
* [ ] Test only after deploying

## True or False: Writing tests takes extra time upfront but saves time in the long run by catching bugs early before they reach users.
* [x] True
* [ ] False

##  Manual testing is done by a person clicking through the app; _________ uses code or scripts to check behavior and run repeatedly?
Answer: automated testing
Answer: Automated Testing
Answer: Automated testing
Answer: automated tests

## Juan's app has a login form. Which test scenario would catch the MOST potential bugs?
* [ ] Test login with correct credentials only
* [x] Test login with correct credentials, wrong password, empty fields, and special characters in the password
* [ ] Test only the CSS styling
* [ ] Test only once after deployment
