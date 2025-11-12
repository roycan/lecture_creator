# 🏘️ Barangay Directory Test Plan - SOLUTION

**Developer:** Sample Solution  
**Client:** Barangay San Juan  
**Date:** November 2025

---

## 🎯 User Stories (5)

**Story 1:** As barangay secretary, I want to register new residents quickly, so that we keep records updated.

**Story 2:** As barangay captain, I want to search residents by name, so that I can find contact info fast.

**Story 3:** As kagawad, I want to view resident details, so that I can verify information for documents.

**Story 4:** As barangay secretary, I want to update resident info, so that records stay accurate when people move.

**Story 5:** As barangay captain, I want to generate resident reports, so that I can submit to city hall.

---

## ✅ Acceptance Criteria (12)

### Feature: Add Resident

**Scenario 1: Add successfully (Happy Path)**  
GIVEN I'm logged in as secretary  
WHEN I enter Santos, Maria, Cruz, 1990-05-15, Block 5 Lot 12, 09171234567, click "Save"  
THEN success message, Maria Santos in list, count increases

**Scenario 2: Missing last name (Error)**  
WHEN I leave last name empty, fill others, click "Save"  
THEN error: "Last name is required"

**Scenario 3: Invalid phone (Edge Case)**  
WHEN I enter phone "123" (too short)  
THEN error: "Enter valid 11-digit number"

### Feature: Search Residents

**Scenario 4: Search existing**  
GIVEN 100+ residents, 10 named "Santos"  
WHEN I search "Santos"  
THEN 10 results display

**Scenario 5: Search not found**  
WHEN I search "Reyes" (doesn't exist)  
THEN "No residents found" message

**Scenario 6: Empty search**  
WHEN I search with empty field  
THEN all residents display

### Feature: View Details

**Scenario 7: View resident**  
GIVEN resident Maria Santos exists  
WHEN I click her name  
THEN details page shows all info correctly

**Scenario 8: View deleted resident**  
GIVEN resident was deleted  
WHEN I try to view (old link)  
THEN error: "Resident not found"

### Feature: Update Resident

**Scenario 9: Update successfully**  
GIVEN resident exists  
WHEN I change contact number, click "Save"  
THEN success, new number displays

**Scenario 10: Update to invalid data**  
WHEN I change birthdate to future  
THEN error: "Birthdate cannot be in future"

### Feature: Delete Resident

**Scenario 11: Delete successfully**  
GIVEN resident exists  
WHEN I delete with confirmation  
THEN resident removed, count decreases

**Scenario 12: Generate report**  
GIVEN 150 residents  
WHEN I generate report  
THEN PDF with all 150 downloads

---

## 💨 Smoke Test (3 minutes)

- [ ] Login works (secretary/pass123)
- [ ] Resident list displays (100+ residents)
- [ ] Can search ("Santos")
- [ ] Can add resident (test data)
- [ ] Can view resident details
- [ ] No console errors

---

## 🌐 E2E Tests (3)

### E2E-1: Register New Resident
**Duration:** 5 min  
1. Login as secretary → Dashboard  
2. Click "Add Resident" → Form  
3. Enter: Santos, Juan, Reyes, 1985-03-20, Block 3 Lot 5, 09181234567  
4. Click "Save" → Success  
5. Search "Santos" → Juan appears  
6. Click Juan → Details correct  
**Success:** Resident registered, searchable, details accurate

### E2E-2: Update Contact Info
**Duration:** 5 min  
1. Login → Search "Maria Santos"  
2. Click Maria → Details page  
3. Click "Edit" → Edit form  
4. Change contact to 09189876543  
5. Save → Success  
6. Verify in list → New number shows  
**Success:** Contact updated everywhere

### E2E-3: Monthly Report Generation
**Duration:** 5 min  
1. Login as captain → Dashboard  
2. Click "Reports" → Report page  
3. Select "Monthly Resident Report"  
4. Choose month: November  
5. Click "Generate" → Processing  
6. PDF downloads → Open, verify data  
**Success:** Accurate report generated

---

## 👥 UAT Form

```
FEATURE 1: Add Resident
[ ] Fill all fields
[ ] Save successfully
[ ] Appears in list
STATUS: ___ NOTES: ___________

FEATURE 2: Search Residents
[ ] Search by last name
[ ] Results accurate
[ ] Fast search
STATUS: ___ NOTES: ___________

FEATURE 3: View Details
[ ] Click resident
[ ] All info displays
[ ] Can edit/delete
STATUS: ___ NOTES: ___________

FEATURE 4: Update Info
[ ] Edit resident
[ ] Changes save
[ ] Updates everywhere
STATUS: ___ NOTES: ___________

FEATURE 5: Reports
[ ] Generate report
[ ] Data accurate
[ ] Export works
STATUS: ___ NOTES: ___________
```

---

## 📚 Test Cases (15)

**TC-001:** Login valid  
**TC-002:** Login invalid  
**TC-010:** Add resident (happy path)  
**TC-011:** Add (missing required field)  
**TC-012:** Add (invalid phone)  
**TC-020:** View resident list  
**TC-021:** View details  
**TC-030:** Update resident (success)  
**TC-031:** Update (invalid data)  
**TC-040:** Delete resident  
**TC-041:** Delete (confirmation)  
**TC-050:** Search existing  
**TC-051:** Search not found  
**TC-060:** Generate PDF report  
**TC-070:** Export to Excel  
**TC-080:** Pagination (100+ residents)

---

## ⚡ Edge Cases

**Text Inputs:**
- [ ] Name: "", "A", 500 chars, "O'Brien", "José"
- [ ] Address: empty, 1000 chars

**Dates:**
- [ ] Birthdate: future, 1800-01-01, Feb 29

**Phone:**
- [ ] 10 digits, 12 digits, letters, empty

**List:**
- [ ] 0 residents, 1 resident, 1000+ residents
- [ ] Pagination at 99, 100, 101

---

## 🎬 Demo Prep

**3 Days Before:**
- [ ] E2E all workflows
- [ ] Edge case testing
- [ ] UAT with secretary

**1 Day Before:**
- [ ] Load 100+ realistic residents
- [ ] Clean code
- [ ] Prepare demo script

**30 Min Before:**
- [ ] Smoke test
- [ ] No errors
- [ ] Professional appearance

**Demo (15 min):**
[0-2] Intro: Resident management  
[2-5] Add new resident, show in list  
[5-8] Search demo, view details  
[8-11] Update info, verify change  
[11-13] Generate report, export  
[13-15] Q&A

---

**Status:** Professional delivery ready ✅
