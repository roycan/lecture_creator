# Quiz: SQLite Databases & CRUD

## Maria's sari-sari store app stores products in a JSON file. Two cashiers add a product at the same time and one entry gets lost. What is the main advantage of switching to SQLite?
* [ ] SQLite makes the app faster to load
* [x] SQLite handles concurrent access safely — multiple users can write without overwriting each other's data
* [ ] SQLite stores data in smaller files
* [ ] SQLite is required by Express

## What does SQL stand for?
Answer: Structured Query Language
Answer: structured query language

## Carlo wants to create a "students" table in SQLite. Which SQL statement should he use?
* [ ] `ADD TABLE students (...)`
* [x] `CREATE TABLE students (...)`
* [ ] `NEW TABLE students (...)`
* [ ] `MAKE TABLE students (...)`

## What does this SQL query return?
```sql
SELECT name, grade FROM students WHERE grade >= 90;
```
* [ ] All students, showing only their name and grade
* [x] Only the name and grade of students whose grade is 90 or higher
* [ ] The names of students whose grade is exactly 90
* [ ] All columns for students with a grade

## Liza wants to insert a new product into her database. Which SQL statement is correct?
* [ ] `INSERT INTO products VALUES ("Rice", 50)`
* [x] `INSERT INTO products (name, price) VALUES (?, ?)` with prepared statements
* [ ] `ADD TO products ("Rice", 50)`
* [ ] `CREATE product IN products ("Rice", 50)`

## Carlo wrote this code to search for a student by name. Why is this DANGEROUS?
```javascript
const name = req.body.name;
const students = db.prepare(`SELECT * FROM students WHERE name = '${name}'`).all();
```
* [ ] It's too slow for large databases
* [x] It's vulnerable to SQL injection — a malicious user could input SQL code in `name` that damages the database
* [ ] Template literals don't work with SQL
* [ ] `db.prepare` doesn't accept string concatenation

## What is the SAFE way to write the same query?
* [ ] Use `db.escape(name)` before inserting
* [x] Use a prepared statement with `?` placeholders: `db.prepare('SELECT * FROM students WHERE name = ?').all(name)`
* [ ] Remove the `WHERE` clause entirely
* [ ] Switch to a different database

## What does this SQL query do?
```sql
UPDATE students SET grade = 95 WHERE id = 5;
```
* [ ] Creates a new student with id 5 and grade 95
* [x] Changes the grade to 95 for the student whose id is 5
* [ ] Deletes the student whose id is 5
* [ ] Adds 95 to the grade of every student

## In database design, a ___ key uniquely identifies each row in a table (often an auto-incrementing ID).
Answer: primary
Answer: primary key

## Juan has a "products" table and a "categories" table. Each product belongs to one category. Where should the foreign key go?
* [ ] In the "categories" table, referencing "products"
* [x] In the "products" table, referencing the "categories" table (the "many" side holds the foreign key)
* [ ] In a separate "link" table
* [ ] Foreign keys are not needed for this relationship

## What does this SQL constraint do?
```sql
CREATE TABLE products (
  price REAL CHECK (price >= 0)
);
```
* [ ] Sets the default price to 0
* [x] Rejects any attempt to insert or update a product with a negative price
* [ ] Rounds prices to the nearest whole number
* [ ] Makes the price column optional

## What does the "CRUD" acronym stand for in database operations?
Answer: Create, Read, Update, Delete
Answer: Create Read Update Delete
Answer: create read update delete
