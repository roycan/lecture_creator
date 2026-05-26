# 📅 Appointment Booking Test Plan - SOLUTION

**Developer:** Sample Solution  
**Client:** Dr. Santos Medical Clinic  
**Date:** November 2025

---

## 🎯 User Stories (5)

**Story 1:** As clinic staff, I want to book appointments quickly, so that patients don't wait on the phone.

**Story 2:** As a doctor, I want to see my daily schedule at a glance, so that I'm prepared for each patient.

**Story 3:** As clinic staff, I want to reschedule easily, so that I can accommodate patient changes.

**Story 4:** As a doctor, I want to avoid double-booking, so that I don't overload my schedule.

**Story 5:** As clinic staff, I want to see patient contact info, so that I can call them for reminders.

---

## ✅ Acceptance Criteria (12)

### Feature: Book Appointment

**Scenario 1: Book successfully (Happy Path)**  
GIVEN I'm logged in as staff  
AND time slot 10:00 AM tomorrow is available  
WHEN I select date, time, enter patient "Juan Cruz", contact "09171234567", type "Checkup", click "Book"  
THEN appointment appears in schedule, confirmation displays

**Scenario 2: Time slot taken (Error)**  
GIVEN 10:00 AM tomorrow already booked  
WHEN I try to book same time  
THEN error: "Time slot not available"

**Scenario 3: Past date (Edge Case)**  
WHEN I try to book for yesterday  
THEN error: "Cannot book past dates"

### Feature: View Schedule

**Scenario 4: View daily schedule**  
GIVEN 5 appointments today  
WHEN I view today's schedule  
THEN all 5 appointments display with names, times, types

**Scenario 5: Empty day**  
GIVEN no appointments today  
WHEN I view schedule  
THEN message: "No appointments scheduled"

### Feature: Reschedule

**Scenario 6: Reschedule successfully**  
GIVEN appointment at 10:00 AM  
AND 2:00 PM is available  
WHEN I change time to 2:00 PM  
THEN old slot freed, new slot reserved

**Scenario 7: Reschedule to taken slot**  
WHEN I try to move to occupied slot  
THEN error: "Time not available"

### Feature: Cancel Appointment

**Scenario 8: Cancel with reason**  
GIVEN appointment exists  
WHEN I cancel with reason "Patient request"  
THEN appointment removed, slot available

**Scenario 9: Cancel past appointment**  
GIVEN appointment was yesterday  
WHEN I try to cancel  
THEN warning: "This is a past appointment"

### Feature: Calendar View

**Scenario 10: Week view**  
WHEN I view week calendar  
THEN 7 days visible, appointments marked

**Scenario 11: Month view**  
WHEN I view month  
THEN 30 days, busy days highlighted

**Scenario 12: Available slots**  
WHEN I click a day  
THEN available time slots shown in green

---

## 💨 Smoke Test (3 minutes)

- [ ] Login works
- [ ] Today's schedule displays
- [ ] Calendar view loads
- [ ] Can select future date
- [ ] Can book appointment
- [ ] No console errors

---

## 🌐 E2E Tests (3)

### E2E-1: Complete Booking Workflow
**Duration:** 5 min  
1. Login → Dashboard  
2. Click "New Appointment" → Form appears  
3. Select tomorrow, 10:00 AM  
4. Enter: Maria Santos, 09181234567, Checkup  
5. Click "Book" → Success  
6. View schedule → Appointment listed  
**Success:** Booking confirmed, appears in schedule

### E2E-2: Reschedule Appointment
**Duration:** 5 min  
1. Login → Dashboard  
2. Find appointment (10:00 AM)  
3. Click "Reschedule" → Dialog opens  
4. Change to 2:00 PM → Confirm  
5. Check schedule → Shows at 2:00 PM  
6. Verify 10:00 AM now free  
**Success:** Time changed, slots updated

### E2E-3: Daily Operations
**Duration:** 7 min  
1. Login as doctor → View today  
2. See 5 appointments → Review details  
3. Patient calls to cancel → Cancel appointment  
4. Walk-in patient → Book urgent slot  
5. Check tomorrow's schedule → Plan ahead  
6. Export week schedule → PDF downloads  
**Success:** Full daily workflow functions

---

## 👥 UAT Form

```
FEATURE 1: Book Appointment
[ ] Select date and time
[ ] Enter patient details
[ ] Book successfully
[ ] Appears in schedule
STATUS: ___ NOTES: ___________

FEATURE 2: View Calendar
[ ] See week view
[ ] Navigate dates
[ ] Available slots clear
STATUS: ___ NOTES: ___________

FEATURE 3: Reschedule
[ ] Select appointment
[ ] Change time
[ ] Updates correctly
STATUS: ___ NOTES: ___________

FEATURE 4: Cancel
[ ] Cancel appointment
[ ] Slot becomes free
[ ] Reason recorded
STATUS: ___ NOTES: ___________
```

---

## 📚 Test Cases (15)

**TC-001:** Login valid  
**TC-002:** Login invalid  
**TC-010:** Book appointment (happy path)  
**TC-011:** Book (missing patient name)  
**TC-012:** Book (invalid phone)  
**TC-020:** View today's schedule  
**TC-030:** Reschedule (success)  
**TC-031:** Reschedule to taken slot  
**TC-040:** Cancel appointment  
**TC-041:** Cancel with reason  
**TC-050:** Calendar week view  
**TC-051:** Calendar month view  
**TC-060:** Search patient appointments  
**TC-070:** Prevent double-booking  
**TC-080:** Export schedule

---

## ⚡ Edge Cases

**Date/Time:**
- [ ] Past dates, future 1 year, Feb 29
- [ ] Same minute double-booking
- [ ] Midnight appointments (00:00)

**Patient Info:**
- [ ] Name: empty, 1 char, 200 chars
- [ ] Phone: 10 digits, 12 digits, letters

**Schedule:**
- [ ] 0 appointments, 50 appointments same day
- [ ] Book all slots (fully booked day)

---

## 🎬 Demo Prep

**3 Days Before:**
- [ ] E2E all workflows
- [ ] Test on iPad
- [ ] UAT with Dr. Santos

**1 Day Before:**
- [ ] Load realistic appointments
- [ ] Remove debug code
- [ ] Practice presentation

**30 Min Before:**
- [ ] Smoke test passes
- [ ] Calendar renders correctly
- [ ] Ready!

**Demo (15 min):**
[0-2] Intro: Appointment management  
[2-6] Book 2 appointments, show calendar  
[6-9] Reschedule one, cancel one  
[9-12] Show daily schedule, patient details  
[12-15] Q&A

---

**Status:** Professional delivery ready ✅
