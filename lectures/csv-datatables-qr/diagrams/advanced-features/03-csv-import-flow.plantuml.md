# CSV Import Flow Diagram (PlantUML)

## Purpose
Show the complete process of importing CSV data, including validation and error handling strategies.

## Rendering
Use PlantUML online server (plantuml.com/plantuml) or VS Code PlantUML extension.

## Diagram

```plantuml
@startuml
title CSV Import Flow with Validation

|User|
start
:Select CSV file;
:Click "Upload";

|Browser|
:Create FormData with file;
:POST /import (multipart/form-data);

|Server (Multer)|
:Receive file upload;
if (File exists?) then (yes)
  :Save to temp/ folder;
  :Set req.file.path;
else (no)
  :Set req.file = undefined;
  #FFB6C1:Return error 400\n"No file uploaded";
  stop
endif

|Server (Route Handler)|
:Read file from temp/;
:Parse CSV into array of objects;

partition "Validation Loop" {
  :For each row...;
  if (Required fields present?) then (no)
    #FFB6C1:Add to errors array\n"Row 5: Missing name";
    :Continue to next row;
  elseif (Data types valid?) then (no)
    #FFB6C1:Add to errors array\n"Row 7: Invalid price '3O' (not number)";
    :Continue to next row;
  elseif (Duplicate check?) then (duplicate found)
    #FFA500:Add to warnings array\n"Row 10: Product 'Skyflakes' already exists";
    :Skip or update existing;
  else (all valid)
    #90EE90:Add to validRows array;
  endif
}

if (Any errors?) then (yes)
  #FFB6C1:req.flash('error', errors)\nDo NOT import any rows;
  :Delete temp file;
  :Redirect back to form;
  stop
else (no errors)
  :Begin database transaction;
  partition "Database Insert" {
    :For each valid row...;
    :Prepare INSERT statement;
    :Execute with row data;
    :Log audit entry;
  }
  :Commit transaction;
  #90EE90:req.flash('success', 'Imported 47 products')\nShow warnings if any;
  :Delete temp file;
  :Redirect to product list;
endif

|Browser|
:Display flash message;
:Show imported products;

|User|
:Review imported data;
stop

@enduml
```

## Validation Strategy

**Three categories:**

1. **Errors (⛔ Block import):**
   - Missing required fields
   - Invalid data types (text where number expected)
   - Foreign key violations (category_id doesn't exist)
   - If ANY errors, import NOTHING (all-or-nothing)

2. **Warnings (⚠️ Allow with notice):**
   - Duplicates (skip or update)
   - Data normalized (trimmed whitespace)
   - Default values applied
   - Import continues, but show warnings

3. **Success (✅):**
   - All rows valid
   - Transaction committed
   - Audit log recorded
   - Flash success message

## Code Pattern

```javascript
const errors = [];
const warnings = [];
const validRows = [];

rows.forEach((row, index) => {
  const rowNumber = index + 2; // +2 for header and 1-based

  // Check required fields
  if (!row.name || !row.price) {
    errors.push(`Row ${rowNumber}: Missing required fields`);
    return; // Skip to next row
  }

  // Check data types
  if (isNaN(parseFloat(row.price))) {
    errors.push(`Row ${rowNumber}: Invalid price "${row.price}"`);
    return;
  }

  // Check duplicates
  const exists = db.prepare('SELECT id FROM products WHERE name = ?').get(row.name);
  if (exists) {
    warnings.push(`Row ${rowNumber}: Product "${row.name}" already exists (skipped)`);
    return;
  }

  // Valid row!
  validRows.push(row);
});

// Decision point
if (errors.length > 0) {
  req.flash('error', `Import failed: ${errors.join(', ')}`);
  return res.redirect('/import');
}

// Proceed with import
const insertStmt = db.prepare('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)');
validRows.forEach(row => {
  insertStmt.run(row.name, parseFloat(row.price), parseInt(row.stock || 0));
});

let message = `Successfully imported ${validRows.length} products`;
if (warnings.length > 0) {
  message += `. Warnings: ${warnings.join(', ')}`;
}
req.flash('success', message);
```

## Common CSV Issues

| Issue | Example | Solution |
|-------|---------|----------|
| Missing quotes | `Choc-Nut, PHP 5.50` | Use csv-parse with `relax_quotes: true` |
| Different delimiter | `Skyflakes;35.50;100` | Set `delimiter: ';'` |
| Extra spaces | `"  Lucky Me  "` | Use `trim: true` option |
| Wrong encoding | `Ã±` (ñ) | Set `encoding: 'utf8'` |
| Excel dates | `44927` (2023-01-15) | Parse with Excel date formula |

## Related Concepts
- Web App Basics Part 2C: Section 3 (CSV Import)
- Multer middleware for file uploads
- Database transactions (all-or-nothing)
- Data validation strategies
