# CSV Import with Validation (Mermaid)

## Purpose
Flowchart showing the complete CSV import validation pipeline with decision points for errors, warnings, and valid data.

## Rendering
**VS Code:** Install "Markdown Preview Mermaid Support" extension  
**Online:** Copy code to [mermaid.live](https://mermaid.live)  
**CLI:** `npx @mermaid-js/mermaid-cli -i 02-csv-import-validation-mermaid.md -o csv-import.png`

## Diagram

```mermaid
flowchart TD
    Start([User selects CSV file]) --> Upload[Click Upload & Import]
    Upload --> FormSubmit[Browser POSTs to /products/import]
    
    FormSubmit --> Multer{Multer: File received?}
    Multer -->|No file| NoFile[❌ HTTP 400 Error]
    Multer -->|File received| SaveTemp[Save to temp/ folder]
    
    NoFile --> FlashError1[req.flash error: No file uploaded]
    FlashError1 --> Redirect1[Redirect to /products/import]
    Redirect1 --> End1([End - Nothing imported])
    
    SaveTemp --> ReadFile[Read file content from temp/]
    ReadFile --> ParseCSV[Parse CSV to array of objects]
    
    ParseCSV --> InitArrays[Initialize:<br/>errors = []<br/>warnings = []<br/>validRows = []]
    
    InitArrays --> ValidationLoop[Start validation loop]
    
    ValidationLoop --> ForEach{For each row...}
    
    ForEach --> CalcRow[rowNum = index + 2]
    
    CalcRow --> CheckRequired{Required fields?<br/>name && price}
    CheckRequired -->|Missing| AddError1[errors.push:<br/>'Row X: Missing fields']
    CheckRequired -->|Present| CheckType{Valid data types?<br/>parseFloat price}
    
    AddError1 --> NextRow1[Continue to next row]
    
    CheckType -->|Invalid| AddError2[errors.push:<br/>'Row X: Invalid price']
    CheckType -->|Valid| CheckRange{Price in range?<br/>0 < price < 1M}
    
    AddError2 --> NextRow1
    
    CheckRange -->|Out of range| AddError3[errors.push:<br/>'Row X: Price out of range']
    CheckRange -->|In range| CheckStock{Stock valid?<br/>parseInt >= 0}
    
    AddError3 --> NextRow1
    
    CheckStock -->|Invalid| AddError4[errors.push:<br/>'Row X: Invalid stock']
    CheckStock -->|Valid| CheckDuplicate{Duplicate?<br/>Product name exists?}
    
    AddError4 --> NextRow1
    
    CheckDuplicate -->|Exists| AddWarning[warnings.push:<br/>'Row X: Already exists']
    CheckDuplicate -->|Unique| AddValid[validRows.push row]
    
    AddWarning --> NextRow1
    AddValid --> NextRow1
    
    NextRow1 --> MoreRows{More rows?}
    MoreRows -->|Yes| ForEach
    MoreRows -->|No| CheckErrors
    
    CheckErrors{errors.length > 0?}
    CheckErrors -->|Yes| BlockImport[❌ BLOCK entire import]
    CheckErrors -->|No| ProceedImport[✅ PROCEED with import]
    
    BlockImport --> DeleteTemp1[Delete temp file]
    DeleteTemp1 --> FlashError2[req.flash error with all errors]
    FlashError2 --> Redirect2[Redirect to /products/import]
    Redirect2 --> End2([End - Nothing imported])
    
    ProceedImport --> Transaction[Begin DB transaction]
    Transaction --> PrepareStmt[Prepare INSERT statement]
    PrepareStmt --> InsertLoop[For each validRow...]
    
    InsertLoop --> Insert[INSERT INTO products]
    Insert --> AuditLog[Log audit entry]
    AuditLog --> MoreInserts{More rows?}
    
    MoreInserts -->|Yes| InsertLoop
    MoreInserts -->|No| Commit[Commit transaction]
    
    Commit --> DeleteTemp2[Delete temp file]
    DeleteTemp2 --> CheckWarnings{warnings.length > 0?}
    
    CheckWarnings -->|Yes| FlashSuccessWarn[req.flash success:<br/>'Imported X products'<br/>+ warnings]
    CheckWarnings -->|No| FlashSuccess[req.flash success:<br/>'Imported X products']
    
    FlashSuccessWarn --> Redirect3[Redirect to /products]
    FlashSuccess --> Redirect3
    
    Redirect3 --> DisplayList[Display product list with message]
    DisplayList --> End3([End - Import complete!])
    
    style AddError1 fill:#FFB6C1
    style AddError2 fill:#FFB6C1
    style AddError3 fill:#FFB6C1
    style AddError4 fill:#FFB6C1
    style BlockImport fill:#FFB6C1
    style NoFile fill:#FFB6C1
    
    style AddWarning fill:#FFD700
    style CheckWarnings fill:#FFD700
    
    style AddValid fill:#90EE90
    style ProceedImport fill:#90EE90
    style Commit fill:#90EE90
    style End3 fill:#90EE90
    
    style Transaction fill:#87CEEB
    style Insert fill:#87CEEB
    style AuditLog fill:#87CEEB
```

## Key Insights

1. **Color coding system:**
   - 🔴 Red = Errors (block import)
   - 🟡 Yellow = Warnings (allow with notice)
   - 🟢 Green = Success (valid data imported)
   - 🔵 Blue = Processing (database operations)

2. **Critical decision point:** The `errors.length > 0?` check determines ALL or NOTHING

3. **Row numbering:** `index + 2` because:
   - CSV parsing starts at index 0
   - Row 1 is the header (name, price, stock)
   - First data row is row 2

4. **Validation hierarchy:**
   - Level 1: Required fields (absolute requirement)
   - Level 2: Data types (must be correct type)
   - Level 3: Data ranges (must be reasonable values)
   - Level 4: Business rules (duplicates = warning, not error)

## Code Mapping

**Validation loop implementation:**
```javascript
const errors = [];
const warnings = [];
const validRows = [];

records.forEach((row, index) => {
  const rowNum = index + 2;  // CSV row number for user-friendly errors
  
  // Level 1: Required fields
  if (!row.name || !row.price) {
    errors.push(`Row ${rowNum}: Missing required fields (name, price)`);
    return;  // Skip to next row
  }
  
  // Level 2: Data types
  const price = parseFloat(row.price);
  if (isNaN(price)) {
    errors.push(`Row ${rowNum}: Invalid price "${row.price}" (must be number)`);
    return;
  }
  
  // Level 3: Data ranges
  if (price <= 0 || price > 1000000) {
    errors.push(`Row ${rowNum}: Price ₱${price} out of range (0-1M)`);
    return;
  }
  
  const stock = parseInt(row.stock || 0);
  if (isNaN(stock) || stock < 0) {
    errors.push(`Row ${rowNum}: Invalid stock "${row.stock}" (must be non-negative integer)`);
    return;
  }
  
  // Level 4: Business rules (warnings)
  const exists = db.prepare('SELECT id FROM products WHERE name = ?').get(row.name);
  if (exists) {
    warnings.push(`Row ${rowNum}: Product "${row.name}" already exists (skipped)`);
    return;
  }
  
  // All checks passed!
  validRows.push({ name: row.name, price: price, stock: stock });
});

// Decision point: Block or proceed?
if (errors.length > 0) {
  // BLOCK: Don't import anything
  fs.unlinkSync(req.file.path);
  req.flash('error', `Import failed with ${errors.length} error(s): ${errors.join('; ')}`);
  return res.redirect('/products/import');
}

// PROCEED: Import all valid rows in transaction
const insertStmt = db.prepare('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)');
const insertMany = db.transaction((rows) => {
  for (const row of rows) {
    const result = insertStmt.run(row.name, row.price, row.stock);
    // Log audit entry
    logAudit(db, res.locals.user.id, 'CREATE', 'products', result.lastInsertRowid, null, row, req.ip);
  }
});
insertMany(validRows);

// Success message
fs.unlinkSync(req.file.path);
let message = `Successfully imported ${validRows.length} product(s)`;
if (warnings.length > 0) {
  message += `. ${warnings.length} warning(s): ${warnings.join('; ')}`;
}
req.flash('success', message);
res.redirect('/products');
```

## Common Mistakes

1. **Importing partial data on error:**
   ```javascript
   // ❌ WRONG: Inserts 50 rows, fails on row 51, database inconsistent
   records.forEach(row => {
     if (validate(row)) {
       db.prepare('INSERT...').run(...);  // No transaction!
     }
   });
   
   // ✅ CORRECT: All-or-nothing with transaction
   if (errors.length === 0) {
     const insertMany = db.transaction((rows) => {
       rows.forEach(row => insertStmt.run(...));
     });
     insertMany(validRows);
   }
   ```

2. **Confusing row numbers:**
   ```javascript
   // ❌ WRONG: "Error on row 0" (index-based)
   records.forEach((row, index) => {
     errors.push(`Row ${index}: ...`);
   });
   
   // ✅ CORRECT: "Error on row 2" (CSV file line number)
   records.forEach((row, index) => {
     const rowNum = index + 2;  // +2 for header and 1-based
     errors.push(`Row ${rowNum}: ...`);
   });
   ```

3. **Not distinguishing errors from warnings:**
   ```javascript
   // ❌ WRONG: Treats duplicate as error (blocks entire import)
   if (productExists) {
     errors.push('Duplicate product');
   }
   
   // ✅ CORRECT: Duplicate is warning (allows import to proceed)
   if (productExists) {
     warnings.push('Duplicate product (skipped)');
     return;  // Skip this row, continue with others
   }
   ```

4. **Forgetting to clean up temp files:**
   ```javascript
   // ❌ WRONG: Temp files accumulate
   if (errors.length > 0) {
     req.flash('error', ...);
     return res.redirect(...);  // ❌ Forgot to delete req.file.path
   }
   
   // ✅ CORRECT: Always clean up
   if (errors.length > 0) {
     fs.unlinkSync(req.file.path);  // ✅ Delete temp file
     req.flash('error', ...);
     return res.redirect(...);
   }
   ```

5. **No user feedback on success:**
   ```javascript
   // ❌ WRONG: Silent success (user doesn't know what happened)
   insertMany(validRows);
   res.redirect('/products');
   
   // ✅ CORRECT: Clear success message
   insertMany(validRows);
   req.flash('success', `Imported ${validRows.length} products`);
   res.redirect('/products');
   ```

## Related Concepts
- Web App Basics Part 2C: Section 3 (CSV Import)
- Multer multipart/form-data handling
- csv-parse synchronous parsing
- Database transactions (better-sqlite3)
- Input validation best practices
- Error handling strategies
