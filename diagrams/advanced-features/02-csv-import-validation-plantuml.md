# CSV Import with Validation (PlantUML)

## Purpose
Shows the complete CSV import pipeline with three-tier validation (errors, warnings, valid), emphasizing the all-or-nothing transaction pattern.

## Rendering
**VS Code:** Install "PlantUML" extension (requires Java)  
**Online:** Copy code to [plantuml.com/plantuml](https://plantuml.com/plantuml)  
**CLI:** `java -jar plantuml.jar 02-csv-import-validation-plantuml.md`

## Diagram

```plantuml
@startuml
title CSV Import with Three-Tier Validation

|User|
start
:Select CSV file from computer;

|#E0F7FA|Browser|
:User clicks "Upload & Import" button;
:Create FormData with file;
:POST /products/import\n(multipart/form-data);

|#87CEEB|Server (Multer)|
if (File received?) then (yes)
  :Save to temp/ folder;
  :Set req.file.path;
else (no)
  |#FFB6C1|Server|
  :Return HTTP 400;
  :req.flash('error', 'No file uploaded');
  :Redirect to /products/import;
  stop
endif

|#87CEEB|Server (Route Handler)|
:Read file from temp/;
:Parse CSV to array of objects;

note right
  csv-parse library:
  columns: true (first row = headers)
  skip_empty_lines: true
  trim: true
end note

:Initialize arrays:\nerrors = []\nwarnings = []\nvalidRows = [];

|#FFD700|Validation Loop|
partition "For each row..." {
  :rowNum = index + 2;
  
  note right
    +2 because:
    - index starts at 0
    - row 1 is headers
    So first data row is row 2
  end note
  
  if (Required fields present?\nname && price) then (no)
    |#FFB6C1|
    :errors.push(\n"Row {rowNum}: Missing required fields");
    :Continue to next row;
  elseif (Valid data types?\nparseFloat(price) is number) then (no)
    |#FFB6C1|
    :errors.push(\n"Row {rowNum}: Invalid price '{price}'");
    :Continue to next row;
  elseif (Price in valid range?\nprice > 0 && price < 1000000) then (no)
    |#FFB6C1|
    :errors.push(\n"Row {rowNum}: Price out of range");
    :Continue to next row;
  elseif (Stock is valid integer?) then (no)
    |#FFB6C1|
    :errors.push(\n"Row {rowNum}: Invalid stock '{stock}'");
    :Continue to next row;
  elseif (Duplicate check:\nProduct name already exists?) then (yes)
    |#FFA500|
    :warnings.push(\n"Row {rowNum}: '{name}' already exists (skipped)");
    :Continue to next row;
  else (all validations passed)
    |#90EE90|
    :validRows.push(row);
  endif
}

:Loop complete;

|#87CEEB|Decision Point|
if (errors.length > 0?) then (yes - BLOCK IMPORT)
  |#FFB6C1|
  :Delete temp file;
  :req.flash('error',\n'Import failed with {errors.length} errors:\n' + errors.join('; '));
  :Redirect to /products/import;
  stop
else (no errors - PROCEED)
  |#90EE90|
  note right
    All-or-nothing transaction:
    Either import ALL valid rows
    or import NOTHING
  end note
  
  :Begin database transaction;
  
  partition "Insert Loop" {
    :Prepare INSERT statement;
    while (For each validRow...) is (more rows)
      :insertStmt.run(\nrow.name,\nparseFloat(row.price),\nparseInt(row.stock || 0));
      :Log audit entry\n(user_id, 'CREATE', 'products', ...);
    endwhile (done)
  }
  
  :Commit transaction;
  :Delete temp file;
  
  if (warnings.length > 0?) then (yes)
    |#FFA500|
    :msg = "Imported {validRows.length} products.\nWarnings: " + warnings.join('; ');
  else (no)
    |#90EE90|
    :msg = "Successfully imported {validRows.length} products";
  endif
  
  :req.flash('success', msg);
  :Redirect to /products;
endif

|Browser|
:Display flash message;
:Show updated product list;

|User|
:Review imported products;
stop

@enduml
```

## Key Insights

1. **Three-tier validation:**
   - 🔴 **Errors:** Block entire import (missing fields, invalid types, range violations)
   - 🟡 **Warnings:** Allow import but notify (duplicates, data normalization)
   - 🟢 **Valid:** Ready for import

2. **All-or-nothing pattern:** If ANY errors exist, import NOTHING (preserves data integrity)

3. **Row numbering:** `index + 2` accounts for 0-based arrays and CSV header row

4. **Transaction safety:** Database transaction ensures atomic import (all succeed or all fail)

5. **Temporary file cleanup:** Always delete temp file (success or failure)

## Code Mapping

**Route setup:**
```javascript
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const fs = require('fs');

const upload = multer({ dest: 'temp/' });

app.post('/products/import', requireAdmin, upload.single('csvFile'), (req, res) => {
  try {
    // Check file exists
    if (!req.file) {
      req.flash('error', 'No file uploaded');
      return res.redirect('/products/import');
    }
    
    // Read and parse CSV
    const fileContent = fs.readFileSync(req.file.path, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    // Validation arrays
    const errors = [];
    const warnings = [];
    const validRows = [];
    
    // Validation loop
    records.forEach((row, index) => {
      const rowNum = index + 2;  // +2 for header and 1-based numbering
      
      // Check required fields
      if (!row.name || !row.price) {
        errors.push(`Row ${rowNum}: Missing required fields`);
        return;
      }
      
      // Check data types
      const price = parseFloat(row.price);
      if (isNaN(price)) {
        errors.push(`Row ${rowNum}: Invalid price "${row.price}"`);
        return;
      }
      
      // Check range
      if (price <= 0 || price > 1000000) {
        errors.push(`Row ${rowNum}: Price ${price} out of range`);
        return;
      }
      
      // Check stock
      const stock = parseInt(row.stock || 0);
      if (isNaN(stock) || stock < 0) {
        errors.push(`Row ${rowNum}: Invalid stock "${row.stock}"`);
        return;
      }
      
      // Check duplicates
      const exists = db.prepare('SELECT id FROM products WHERE name = ?').get(row.name);
      if (exists) {
        warnings.push(`Row ${rowNum}: "${row.name}" already exists (skipped)`);
        return;
      }
      
      // Valid row!
      validRows.push({ name: row.name, price: price, stock: stock });
    });
    
    // Decision point
    if (errors.length > 0) {
      fs.unlinkSync(req.file.path);
      req.flash('error', `Import failed: ${errors.join('; ')}`);
      return res.redirect('/products/import');
    }
    
    // Import valid rows (transaction)
    const insertStmt = db.prepare('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)');
    const insertMany = db.transaction((rows) => {
      for (const row of rows) {
        insertStmt.run(row.name, row.price, row.stock);
      }
    });
    insertMany(validRows);
    
    // Cleanup and redirect
    fs.unlinkSync(req.file.path);
    
    let message = `Successfully imported ${validRows.length} products`;
    if (warnings.length > 0) {
      message += `. Warnings: ${warnings.join('; ')}`;
    }
    req.flash('success', message);
    res.redirect('/products');
    
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    req.flash('error', 'Import failed: ' + error.message);
    res.redirect('/products/import');
  }
});
```

## Common Mistakes

1. **Importing invalid data:**
   ```javascript
   // ❌ No validation - imports garbage
   records.forEach(row => {
     db.prepare('INSERT...').run(row.name, row.price);  // What if price = "abc"?
   });
   ```

2. **Partial imports on error:**
   ```javascript
   // ❌ Imports 50 rows, then error on row 51 - database left inconsistent
   records.forEach(row => {
     if (valid(row)) {
       db.prepare('INSERT...').run(...);  // No transaction!
     }
   });
   ```

3. **Wrong row numbering:**
   ```javascript
   // ❌ Error says "Row 0" (confusing for users)
   records.forEach((row, index) => {
     errors.push(`Row ${index}: ...`);  // Should be index + 2
   });
   ```

4. **Not cleaning up temp files:**
   ```javascript
   // ❌ Temp files accumulate, fills disk
   app.post('/import', upload.single('csvFile'), (req, res) => {
     // ... process file ...
     res.redirect('/products');  // ❌ Forgot: fs.unlinkSync(req.file.path)
   });
   ```

5. **Silent failures:**
   ```javascript
   // ❌ Import succeeds but user doesn't know what happened
   db.prepare('INSERT...').run(...);
   res.redirect('/products');  // ❌ No flash message!
   ```

## Related Concepts
- Web App Basics Part 2C: Section 3 (CSV Import)
- Multer middleware for file uploads
- csv-parse library
- Database transactions (ACID properties)
- Data validation strategies
- Error vs warning distinction
