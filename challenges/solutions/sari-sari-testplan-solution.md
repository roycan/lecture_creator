# 🏪 Sari-sari Store Test Plan - SOLUTION

**Developer:** Sample Solution  
**Client:** Aling Rosa's Sari-sari Store  
**Date:** November 2025

---

## 🎯 User Stories (5)

**Story 1:** As a cashier, I want to record sales quickly, so that customers don't wait long.

**Story 2:** As a store owner, I want to see daily sales reports, so that I know how much profit I made.

**Story 3:** As a cashier, I want low stock alerts, so that I can reorder before running out.

**Story 4:** As a store owner, I want to track which products sell best, so that I stock more of them.

**Story 5:** As a cashier, I want to search products quickly, so that I can serve customers faster.

---

## ✅ Acceptance Criteria (12)

### Feature: Record Sale

**Scenario 1: Record sale successfully (Happy Path)**  
GIVEN I am logged in as cashier  
AND product "Lucky Me" has 50 units in stock  
WHEN I select "Lucky Me", enter quantity 5, click "Record Sale"  
THEN stock decreases to 45, sale appears in today's sales, total updates

**Scenario 2: Insufficient stock (Error)**  
GIVEN product "Coke" has 2 units  
WHEN I try to sell 5 units  
THEN error displays: "Only 2 units available"

**Scenario 3: Zero quantity (Edge Case)**  
GIVEN I'm recording a sale  
WHEN I enter quantity 0  
THEN error displays: "Quantity must be at least 1"

### Feature: Add Product

**Scenario 4: Add new product (Happy Path)**  
GIVEN I'm on "Add Product" page  
WHEN I enter name "Tide 24g", price 8, stock 50, click "Save"  
THEN product appears in list, inventory count increases

**Scenario 5: Duplicate product (Error)**  
GIVEN product "Lucky Me" already exists  
WHEN I try to add another "Lucky Me"  
THEN error: "Product already exists"

### Feature: View Sales Report

**Scenario 6: View daily report (Happy Path)**  
GIVEN 10 sales recorded today  
WHEN I click "Daily Report"  
THEN I see all 10 sales, correct total

**Scenario 7: No sales today (Edge Case)**  
GIVEN zero sales today  
WHEN I view daily report  
THEN message: "No sales recorded today"

### Feature: Low Stock Alert

**Scenario 8: Alert when stock below 10**  
GIVEN product has 9 units  
WHEN I view inventory  
THEN red alert badge appears: "Low Stock"

**Scenario 9: Out of stock**  
GIVEN product has 0 units  
WHEN cashier searches product  
THEN "Out of stock" message displays

### Feature: Search Products

**Scenario 10: Search existing product**  
GIVEN 50+ products in inventory  
WHEN I search "Lucky"  
THEN "Lucky Me" appears in results

**Scenario 11: Search non-existent**  
WHEN I search "xyz123"  
THEN "No products found" displays

**Scenario 12: Empty search**  
WHEN I search with empty field  
THEN all products display

---

## 💨 Smoke Test (3 minutes)

- [ ] Login works (cashier/pass123)
- [ ] Product list displays (50+ items)
- [ ] Can search product ("Lucky")
- [ ] Can record sale (any product, qty 1)
- [ ] Today's sales shows transactions
- [ ] No console errors

---

## 🌐 E2E Tests (3)

### E2E-1: Complete Sale Workflow
**Duration:** 5 min  
1. Login as cashier → Dashboard displays  
2. Search "Lucky Me" → Product found  
3. Enter qty 5 → Calculates ₱60  
4. Click "Record Sale" → Success message  
5. Check inventory → Stock decreased by 5  
6. View today's sales → Sale listed  
**Success:** Sale recorded, stock updated, appears in report

### E2E-2: Restock Low Inventory
**Duration:** 5 min  
1. Login as owner → Dashboard  
2. View inventory → See low stock alerts  
3. Click product with low stock → Details page  
4. Click "Restock" → Enter quantity 50  
5. Save → Stock updated  
6. Verify → No more low stock alert  
**Success:** Stock replenished, alert removed

### E2E-3: End-of-Day Report
**Duration:** 5 min  
1. Login as owner → Dashboard  
2. Click "Daily Sales Report" → Report displays  
3. See total sales, transaction count  
4. View top-selling products → Sorted by quantity  
5. Export to Excel → File downloads  
**Success:** Accurate report, export works

---

## 👥 UAT Form

```
FEATURE 1: Record Sale
[ ] Search product
[ ] Select quantity
[ ] Record sale
[ ] Stock updates
[ ] Sale in report
STATUS: ___ NOTES: ___________

FEATURE 2: View Products
[ ] See all products
[ ] Low stock alerts visible
[ ] Prices accurate
STATUS: ___ NOTES: ___________

FEATURE 3: Daily Report
[ ] View today's sales
[ ] Total is correct
[ ] Can export
STATUS: ___ NOTES: ___________
```

---

## 📚 Test Cases (15)

**TC-001:** Login valid credentials  
**TC-002:** Login invalid password  
**TC-010:** Add product (happy path)  
**TC-011:** Add product (missing price)  
**TC-020:** Record sale (happy path)  
**TC-021:** Record sale (insufficient stock)  
**TC-030:** Update product price  
**TC-040:** Delete product  
**TC-050:** Search product (exists)  
**TC-051:** Search product (not found)  
**TC-060:** View daily report  
**TC-061:** View weekly report  
**TC-070:** Low stock alert triggers  
**TC-071:** Out of stock handling  
**TC-080:** Export sales to Excel

---

## ⚡ Edge Cases

**Numeric Inputs:**
- [ ] Quantity: 0, -1, 9999, 1.5, "abc"
- [ ] Price: 0, -10, 999999, 0.5

**Text Inputs:**
- [ ] Product name: "", "A", 500 chars, special chars

**Stock Levels:**
- [ ] 0 units, 1 unit, 9 units (low), 10000 units

**Dates:**
- [ ] View report for future date
- [ ] View report with no data

---

## 🎬 Demo Prep

**3 Days Before:**
- [ ] E2E test all 3 workflows
- [ ] Fix bugs
- [ ] UAT with Aling Rosa

**1 Day Before:**
- [ ] Load 50+ real products
- [ ] Clean code
- [ ] Practice demo

**30 Min Before:**
- [ ] Smoke test
- [ ] No errors
- [ ] Ready!

**Demo Script (15 min):**
[0-2] Intro: "This system tracks inventory and sales"  
[2-5] Record 3 sales, show stock updates  
[5-8] View daily report, top products  
[8-10] Show low stock alerts  
[10-12] Demo restock feature  
[12-15] Q&A, closing

---

**Status:** Professional delivery ready ✅
