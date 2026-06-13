# 📋 Mini-Project 1: Barangay Directory Test Plan

**Project:** Barangay San Juan Resident Directory  
**Developer:** [Your Name]  
**Date:** [Current Date]  
**Client:** Barangay Captain, Barangay Secretary

---

## 📖 Project Overview

The Barangay San Juan Resident Directory is a web-based system for managing resident information. Key features include:
- Add/edit/delete resident records
- Search residents by name
- View resident details
- Generate resident lists

---

## 🎯 User Stories

### Story 1: Register New Resident
**As a** Barangay Secretary  
**I want to** add new residents who just moved into the barangay  
**So that** we have up-to-date records of all residents

### Story 2: Search Residents
**As a** Barangay Official  
**I want to** search residents by last name  
**So that** I can quickly find their contact information

### Story 3: Update Resident Info
**As a** Barangay Secretary  
**I want to** update resident information when they move or change contact details  
**So that** our records stay accurate

### Story 4: View All Residents
**As a** Barangay Captain  
**I want to** view a list of all residents  
**So that** I can see the total population and demographics

### Story 5: Delete Resident
**As a** Barangay Secretary  
**I want to** remove residents who have moved out  
**So that** we don't have outdated records

---

## ✅ Acceptance Criteria

### Feature: Add New Resident

**Scenario 1: Add resident with complete information (Happy Path)**

**GIVEN** I am logged in as Barangay Secretary  
**AND** I am on the "Add Resident" page  
**AND** all fields are empty  

**WHEN** I enter:
- Last Name: "Santos"
- First Name: "Maria"
- Middle Name: "Cruz"
- Birthdate: "1990-05-15"
- Address: "Block 5 Lot 12"
- Contact: "09171234567"

**AND** I click "Save"

**THEN** success message appears: "Resident added successfully"  
**AND** Maria Santos appears in the residents list  
**AND** resident count increases by 1  
**AND** form fields are cleared (ready for next entry)

---

**Scenario 2: Add resident with missing required field (Error Case)**

**GIVEN** I am on the "Add Resident" page  

**WHEN** I leave "Last Name" field empty  
**AND** fill in all other fields  
**AND** click "Save"

**THEN** error message appears: "Last Name is required"  
**AND** resident is NOT saved  
**AND** form data is preserved (don't lose what I typed)

---

**Scenario 3: Add resident with invalid phone number (Error Case)**

**GIVEN** I am on the "Add Resident" page  

**WHEN** I enter contact number: "123" (too short)  
**AND** fill in all other required fields  
**AND** click "Save"

**THEN** error message appears: "Please enter valid 11-digit phone number"  
**AND** resident is NOT saved

---

### Feature: Search Residents

**Scenario 1: Search existing resident**

**GIVEN** database has 50+ residents  
**AND** at least 5 residents have last name "Santos"  
**AND** I am on the search page  

**WHEN** I enter search term: "Santos"  
**AND** click "Search"

**THEN** I see 5 results  
**AND** all results have "Santos" in their name  
**AND** results show: name, address, contact

---

**Scenario 2: Search non-existent resident**

**GIVEN** database has residents  
**AND** no resident named "Reyes"  

**WHEN** I search for "Reyes"  
**AND** click "Search"

**THEN** message displays: "No residents found matching 'Reyes'"  
**AND** no results table appears

---

## 💨 Smoke Test Checklist (2 Minutes)

**Run before every client demo:**

- [ ] **Site loads** - Open barangay-directory.html, page displays within 3 seconds
- [ ] **Login works** - Username: secretary, Password: pass123, redirects to dashboard
- [ ] **View residents** - List displays 50+ residents with names and addresses
- [ ] **Add resident** - Click "Add New", form appears, can type in fields
- [ ] **Search works** - Search "Santos", see results
- [ ] **No errors** - Open console (F12), no red error messages

**Result:**  
✅ All Pass → Safe to demo  
❌ Any Fail → Fix before showing client

---

## 🌐 E2E Test Scripts

### E2E Test 1: Complete Add Resident Workflow

```
═══════════════════════════════════════════════
TEST: Add New Resident - Complete Workflow
ROLE: Barangay Secretary
GOAL: Register a new resident who just moved in
DURATION: 5 minutes
═══════════════════════════════════════════════

STEPS:

1. Login as secretary
   Expected: Dashboard displays

2. Click "Add New Resident" button
   Expected: Add resident form appears

3. Fill in resident details:
   - Last Name: Santos
   - First Name: Maria
   - Middle Name: Cruz
   - Birthdate: 1990-05-15
   - Address: Block 5 Lot 12
   - Contact: 09171234567
   Expected: All fields accept input

4. Click "Save" button
   Expected: Success message "Resident added successfully"

5. Go to "Residents List"
   Expected: Maria Santos appears in list

6. Search for "Santos"
   Expected: Maria Santos appears in search results

SUCCESS CRITERIA:
✅ Resident count increased by 1
✅ Maria Santos in database
✅ Can find her via search
✅ All information accurate
✅ No error messages appeared

TEST RESULT: [ ] PASS  [ ] FAIL
TESTED BY: _______________
DATE: _______________
═══════════════════════════════════════════════
```

### E2E Test 2: Update Resident Information

```
═══════════════════════════════════════════════
TEST: Update Resident Contact Number
ROLE: Barangay Secretary
GOAL: Update resident's contact when they get new phone
DURATION: 5 minutes
═══════════════════════════════════════════════

STEPS:

1. Login as secretary
   Expected: Dashboard displays

2. Search for resident "Maria Santos"
   Expected: Search results show Maria Santos

3. Click on "Maria Santos" record
   Expected: Resident details page displays

4. Click "Edit" button
   Expected: Edit form appears with current data

5. Change contact number from 09171234567 to 09189876543
   Expected: Field accepts new number

6. Click "Save Changes"
   Expected: Success message displays

7. View resident details again
   Expected: New contact number 09189876543 displays

8. Verify in residents list
   Expected: List shows updated contact

SUCCESS CRITERIA:
✅ Contact number updated successfully
✅ Changes visible in details page
✅ Changes visible in list page
✅ Old number no longer shows
✅ No error messages

TEST RESULT: [ ] PASS  [ ] FAIL
═══════════════════════════════════════════════
```

### E2E Test 3: Delete Resident (Moved Out)

```
═══════════════════════════════════════════════
TEST: Remove Resident Who Moved Out
ROLE: Barangay Secretary
GOAL: Delete resident record for someone who moved away
DURATION: 3 minutes
═══════════════════════════════════════════════

STEPS:

1. Login as secretary
   Expected: Dashboard

2. Search for resident to delete
   Expected: Resident found

3. Click on resident record
   Expected: Details page

4. Click "Delete" button
   Expected: Confirmation dialog: "Are you sure?"

5. Click "Confirm"
   Expected: Success message "Resident deleted"

6. Go to residents list
   Expected: Resident no longer appears

7. Search for deleted resident
   Expected: "No results found"

SUCCESS CRITERIA:
✅ Resident removed from database
✅ Resident count decreased by 1
✅ Cannot find via search
✅ No broken links or errors

TEST RESULT: [ ] PASS  [ ] FAIL
═══════════════════════════════════════════════
```

---

## 👥 UAT Form

```
═══════════════════════════════════════════════
USER ACCEPTANCE TESTING (UAT) FORM
═══════════════════════════════════════════════

PROJECT: Barangay San Juan Resident Directory
UAT SESSION DATE: ______________
TESTED BY: ______________

═══════════════════════════════════════════════

INSTRUCTIONS:
Please test each feature. Mark:
  ✅ Works as expected
  ⚠️ Works but needs improvement
  ❌ Doesn't work or confusing

We will fix all ❌ issues before final delivery.

═══════════════════════════════════════════════

FEATURE 1: View Residents List
───────────────────────────────────────────────
[ ] Login to system
[ ] See list of residents
[ ] List shows names clearly
[ ] Can see addresses and contact numbers

STATUS: ___  NOTES: _________________________

───────────────────────────────────────────────

FEATURE 2: Add New Resident
───────────────────────────────────────────────
[ ] Click "Add New Resident"
[ ] Fill in: Santos, Juan, Reyes
[ ] Birthdate: 1985-03-20
[ ] Address: Block 3 Lot 5
[ ] Contact: 09171234567
[ ] Click "Save"
[ ] Success message appears
[ ] Juan Santos in residents list

STATUS: ___  NOTES: _________________________

───────────────────────────────────────────────

FEATURE 3: Search Residents
───────────────────────────────────────────────
[ ] Go to search page
[ ] Enter: "Santos"
[ ] Click search
[ ] See matching results
[ ] Results show correct information

STATUS: ___  NOTES: _________________________

───────────────────────────────────────────────

FEATURE 4: Update Resident
───────────────────────────────────────────────
[ ] Find resident Juan Santos
[ ] Click "Edit"
[ ] Change contact to: 09189876543
[ ] Save changes
[ ] New contact number shows in list

STATUS: ___  NOTES: _________________________

───────────────────────────────────────────────

FEATURE 5: Delete Resident
───────────────────────────────────────────────
[ ] Select resident to delete
[ ] Click "Delete"
[ ] Confirm deletion
[ ] Resident removed from list

STATUS: ___  NOTES: _________________________

═══════════════════════════════════════════════
OVERALL FEEDBACK
═══════════════════════════════════════════════

What do you LIKE? 
_____________________________________________________

What MUST be fixed?
_____________________________________________________

What would be NICE to have?
_____________________________________________________

═══════════════════════════════════════════════
FINAL DECISION: [ ] ACCEPT  [ ] NEEDS FIXES
═══════════════════════════════════════════════
```

---

## 📚 Test Case Library

### TC-001: Valid Login
**FEATURE:** User Login  
**PRECONDITIONS:** User account exists (username: secretary, password: pass123)

**STEPS:**
1. Navigate to login page
2. Enter username: secretary
3. Enter password: pass123
4. Click "Login"

**EXPECTED:** User redirected to dashboard, welcome message displays

**TEST DATA:** Username: secretary, Password: pass123

---

### TC-010: Add Resident (Happy Path)
**FEATURE:** Add New Resident  
**PRECONDITIONS:** Logged in as secretary

**STEPS:**
1. Click "Add New Resident"
2. Fill all required fields with valid data
3. Click "Save"

**EXPECTED:** Success message, resident in list

**TEST DATA:**  
Name: Santos, Maria, Cruz  
Birthdate: 1990-05-15  
Address: Block 5 Lot 12  
Contact: 09171234567

---

### TC-011: Add Resident (Missing Required Field)
**FEATURE:** Add New Resident - Validation  
**PRECONDITIONS:** On Add Resident form

**STEPS:**
1. Leave "Last Name" empty
2. Fill other fields
3. Click "Save"

**EXPECTED:** Error "Last Name is required", not saved

---

### TC-020: View Resident Details
**FEATURE:** View Resident  
**PRECONDITIONS:** At least 1 resident exists

**STEPS:**
1. Go to residents list
2. Click on a resident

**EXPECTED:** Details page shows all information

---

### TC-030: Update Resident Contact
**FEATURE:** Edit Resident  
**PRECONDITIONS:** Resident exists

**STEPS:**
1. Open resident details
2. Click "Edit"
3. Change contact number
4. Click "Save"

**EXPECTED:** Success message, changes visible

---

### TC-040: Delete Resident
**FEATURE:** Delete Resident  
**PRECONDITIONS:** Resident exists

**STEPS:**
1. Open resident
2. Click "Delete"
3. Confirm

**EXPECTED:** Resident removed, count decreased by 1

---

### TC-050: Search Existing Resident
**FEATURE:** Search  
**PRECONDITIONS:** 10+ residents in database

**STEPS:**
1. Enter search term that exists
2. Click "Search"

**EXPECTED:** Matching residents display

---

### TC-051: Search Non-Existent
**FEATURE:** Search  
**PRECONDITIONS:** Residents in database

**STEPS:**
1. Enter term that doesn't exist
2. Click "Search"

**EXPECTED:** "No results found" message

---

## ⚡ Edge Cases to Test

### Text Input Edge Cases
- [ ] First name: "A" (one letter) - Should it be allowed?
- [ ] Last name: "" (empty) - Should show error
- [ ] Address: [500 characters] - Should have max length
- [ ] Name: "123456" (numbers) - Should only allow letters
- [ ] Name: "O'Brien" (apostrophe) - Should be allowed
- [ ] Name: "José" (accented character) - Should be allowed

### Date Edge Cases
- [ ] Birthdate: Future date (2030-01-01) - Should show error
- [ ] Birthdate: Very old (1800-01-01) - Reasonable?
- [ ] Birthdate: Feb 29 non-leap year - Should validate

### Phone Number Edge Cases
- [ ] Contact: "" (empty) - Required or optional?
- [ ] Contact: "123" (too short) - Should show error
- [ ] Contact: "091712345678901" (too long) - Max 11 digits
- [ ] Contact: "abcdefghijk" (letters) - Should only allow numbers

### List/Pagination Edge Cases
- [ ] 0 residents - Empty state message?
- [ ] 1 resident - Should display correctly
- [ ] 100+ residents - Pagination needed?
- [ ] 101 residents (if page size = 100) - 2 pages?

---

## 🎬 Demo Preparation

### 3 Days Before
- [ ] Run all 3 E2E tests
- [ ] Test all edge cases
- [ ] Document bugs, fix critical ones
- [ ] Re-test after fixes
- [ ] Schedule UAT with Barangay Secretary

### 1 Day Before
- [ ] Load 50+ realistic residents (not "test test")
- [ ] Remove debug code
- [ ] Test on demo device
- [ ] Prepare demo script
- [ ] Practice demo 3 times

### 30 Minutes Before
- [ ] Run smoke test (all 6 items pass?)
- [ ] No console errors?
- [ ] Professional appearance?
- [ ] Ready!

---

**Completion Checklist:**

- [ ] 5 user stories written
- [ ] 10 acceptance criteria documented
- [ ] Smoke test checklist (2 minutes)
- [ ] 3 E2E test scripts
- [ ] UAT form prepared
- [ ] 8 test cases in library
- [ ] Edge cases listed
- [ ] Demo prep checklist

**Status:** Ready for professional delivery ✅
