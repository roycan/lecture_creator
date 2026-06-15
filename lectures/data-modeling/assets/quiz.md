# Quiz: Data Modeling

## Maria is building a barangay clearance application. Before writing any code, she should decide what data to store and how it relates. What is this process called?
* [ ] Wireframing
* [x] Data modeling
* [ ] Debugging
* [ ] Deployment

## Carlo has a "sales" table where each sale records a product name, price, and quantity. He notices the same product name is typed differently across rows (e.g., "Rice", "rice", "Bigas"). What is the main problem?
* [ ] The table is too small
* [x] The product data is not normalized — product information should be in its own "products" table, and "sales" should reference it by foreign key
* [ ] He needs to use uppercase letters
* [ ] SQLite doesn't support text comparison

## In a one-to-many relationship between "barangays" and "residents" (many residents live in one barangay), where does the foreign key go?
* [ ] In the "barangays" table
* [x] In the "residents" table, as a `barangay_id` column that points to the barangay
* [ ] In both tables
* [ ] In a separate table

## What data type should you use in SQLite for storing the price of a product (e.g., 49.50)?
* [ ] `INTEGER`
* [x] `REAL`
* [ ] `TEXT`
* [ ] `BOOLEAN`

## Liza creates a table for students. She wants the database to automatically assign a unique, increasing ID number to each new student. What should she use?
* [ ] `id TEXT UNIQUE`
* [x] `id INTEGER PRIMARY KEY AUTOINCREMENT`
* [ ] `id AUTO`
* [ ] `id NUMBER RANDOM`

## A ___ key is a column in one table that references the primary key of another table, creating a link between the two.
Answer: foreign
Answer: foreign key

## Juan wants to visualize how his tables relate before he writes any SQL. He draws boxes for each table, lists the columns inside, and draws lines between connected columns. What is this called?
* [ ] A wireframe
* [ ] A flowchart
* [x] A schema diagram (or entity-relationship diagram)
* [ ] A class diagram

## True or False: It is a good practice to store all your application data in one giant table with many columns, rather than splitting it into multiple related tables.
* [ ] True
* [x] False — splitting into related tables (normalization) reduces duplication and makes the data easier to maintain
