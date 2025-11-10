# Project Scoping Guide for MPA/SSR Web Applications

> **Purpose:** Help students confidently identify projects they can deliver with excellence using Multi-Page Application (MPA) and Server-Side Rendering (SSR) skills learned in Web App Basics Parts 1 & 2.

---

## 🎯 Your Competitive Advantage

You are trained in **simple, maintainable, production-ready web applications** that:
- ✅ Work without complex build tools
- ✅ Are easy to understand and modify
- ✅ Run reliably on affordable hosting ($5-10/month)
- ✅ Require minimal ongoing maintenance
- ✅ Can be handed off to other developers easily

**Target clients:** Small businesses, local government units, schools, non-profits, startups validating ideas

---

## ✅ IN-SCOPE: What You Can Confidently Build

### Core Capabilities

#### 1. Data Management (CRUD Operations)
- ✅ Create, Read, Update, Delete records
- ✅ Search and filter data
- ✅ Sort and paginate results (using DataTables.js)
- ✅ Export data to CSV
- ✅ Import data from CSV (bulk upload) *
- ✅ Backup/restore database (JSON export/import)
- ✅ Form validation (server-side)
- ✅ Flash messages for user feedback

**\* CSV Import Limitation:** Data fields must not contain commas. For example:
- ✅ Good: "Juan Dela Cruz", "Manila", "Teacher"
- ❌ Bad: "Dela Cruz, Juan", "Manila, Philippines", "Teacher, Grade 9"

**Workaround:** Remove commas from data before import, or use JSON backup/restore for complex data.

**Example projects:**
- Contact management system (CRM)
- Inventory management
- Student records system
- Appointment booking
- Asset tracking
- Product catalog

#### 2. User Authentication & Authorization
- ✅ User registration (email/password)
- ✅ Login/logout with sessions
- ✅ Password hashing (bcrypt)
- ✅ **Two-role system: Admin & User**
- ✅ Protected routes (login required)
- ✅ Role-based access (admin-only features)
- ✅ Admin-assisted password reset
- ✅ Force password change on first login
- ✅ Basic email validation (format checking only)

**Example projects:**
- Internal company portal
- School grading system (teachers + students)
- Barangay information system (officials + residents)
- Store POS system (manager + cashiers)

#### 3. Data Integrity & Audit
- ✅ Audit logging (who did what, when)
- ✅ Data validation (prevent bad data)
- ✅ Unique constraints (no duplicate usernames)
- ✅ Referential integrity (foreign keys)
- ✅ Transaction support (SQLite)
- ✅ Soft delete alternative (audit log)

**Example projects:**
- Financial transaction log
- Patient records (healthcare)
- Document management
- Equipment checkout system

#### 4. Reporting & Analytics
- ✅ Display aggregate data (counts, sums, averages)
- ✅ Filter by date range
- ✅ Generate printable reports (browser print CSS)
- ✅ Basic charts (Chart.js CDN)
- ✅ Export reports to CSV
- ✅ Summary dashboards

**Example projects:**
- Sales reports
- Attendance tracking
- Budget monitoring
- Inventory turnover reports

#### 5. Multi-Table Relationships
- ✅ One-to-many (customer → orders)
- ✅ Many-to-one (orders → customer)
- ✅ Join queries (display related data)
- ✅ Dropdown selects (foreign key selection)
- ✅ Nested displays (customer with all orders)

**Example projects:**
- Order management (customers + orders + items)
- Class enrollment (students + subjects + schedules)
- Library system (books + borrowers + loans)
- Project tracking (projects + tasks + assignees)

#### 6. External API Integration (Simple, No-Auth APIs)
- ✅ Read-only APIs (fetch data, display on page)
- ✅ QR code generation (for IDs, receipts, labels)
- ✅ Country/region data (flags, currencies, phone codes)
- ✅ Exchange rates (currency conversion)
- ✅ Public data APIs (weather, holidays, postal codes)
- ✅ Client-side fetch (data loads in browser)
- ✅ Basic error handling (show fallback if API fails)

**✅ Safe API Types (No Authentication Required):**
- QR Code generators (qrserver.com, goqr.me)
- REST Countries API (country info with flags)
- ExchangeRate-API (currency conversion)
- Free weather APIs (OpenWeatherMap free tier)
- Public holiday APIs (date.nager.at)
- IP geolocation (basic location from IP)

**Example use cases:**
- **QR Codes:** Appointment confirmations, product labels, student IDs, asset tags
- **Country Data:** Registration forms, contact management, international customers
- **Exchange Rates:** Store pricing in multiple currencies, expense tracking
- **Weather:** Event planning, appointment scheduling, dashboard widgets
- **Public Data:** Business hours based on holidays, location-aware features

**What makes these APIs "safe" for students:**
- 🟢 No API key required (or free tier with simple signup)
- 🟢 Stable, well-documented endpoints
- 🟢 Predictable JSON responses
- 🟢 High uptime (reliable services)
- 🟢 No credit card required
- 🟢 Generous free tier limits (1000+ requests/day)
- 🟢 CORS-enabled (work from browser)
- 🟢 Read-only (no POST/PUT/DELETE complexity)

**Teaching moment:** "You already learned `fetch()` and `async/await` in the AJAX lecture. Now we're applying those skills to real external APIs!"

---

## ❌ OUT-OF-SCOPE: Features to Defer or Decline

### Not Included (Requires Additional Training/Tools)

#### 1. File Uploads
- ❌ Profile pictures
- ❌ Document attachments
- ❌ Image galleries
- ❌ PDF generation (complex reports)

**Why:** Railway has ephemeral filesystem; requires cloud storage (S3, Cloudinary) - covered in Part 3

**Alternative:** Store URLs to externally hosted files, or defer feature to later phase

#### 2. Email Features
- ❌ Email verification on signup
- ❌ Automated password reset emails
- ❌ Email notifications
- ❌ Newsletter sending

**Why:** Requires email service (SendGrid, Mailgun), API keys, and additional error handling

**Alternative:** Admin-assisted password reset, in-app notifications

#### 3. Complex Role Systems
- ❌ 3+ roles (admin/moderator/editor/user)
- ❌ Permission matrices
- ❌ Custom role creation
- ❌ Role hierarchies
- ❌ Team/group permissions

**Why:** Requires complex authorization logic and permission management

**Alternative:** Stick to 2 roles (admin/user) - covers 90% of use cases

#### 4. Real-Time Features
- ❌ Live chat
- ❌ Real-time notifications
- ❌ Live dashboards (auto-updating)
- ❌ Collaborative editing
- ❌ WebSockets

**Why:** Requires WebSocket technology, not covered in this course

**Alternative:** Manual refresh, periodic polling if absolutely needed

#### 5. Payment Processing
- ❌ Credit card payments
- ❌ PayPal integration
- ❌ Subscription billing
- ❌ Invoicing automation

**Why:** Requires PCI compliance, payment gateway integration, complex security

**Alternative:** Manual payment tracking (admin marks as "paid"), defer to payment specialists

#### 6. Complex External APIs (Authentication Required)
- ❌ Google Maps integration (API key + billing)
- ❌ Social media login (OAuth flow complexity)
- ❌ SMS sending (Twilio, Semaphore - paid APIs)
- ❌ Email sending (SendGrid, Mailgun - setup complexity)
- ❌ Shipping calculators (LBC, JRS API)
- ❌ Payment gateways (PayMongo, Paymaya)
- ❌ Cloud storage (S3, Cloudinary for uploads)

**Why:** Requires API authentication, rate limiting, billing setup, complex error handling, security concerns

**What's the difference from "in-scope" APIs?**
- Require OAuth or API key management
- Often need credit card even for free tier
- Have complex authentication flows
- May charge per request
- Require webhook handling (callbacks)
- Need production security considerations

**Alternative:** 
- Use simple read-only APIs instead (see in-scope section)
- Defer to Phase 2 of project
- Partner with developer experienced in that specific API
- For learning: covered in Part 3 (advanced integrations)

#### 7. Advanced Features
- ❌ Multi-language/internationalization
- ❌ Advanced search (full-text, fuzzy matching)
- ❌ Complex scheduling (recurring events)
- ❌ Workflow automation
- ❌ Mobile app (native iOS/Android)

**Why:** Requires specialized knowledge and additional frameworks

**Alternative:** Focus on core features first, expand later if needed

---

## 💼 Attractive Project Examples (In-Scope)

### Small Business

#### 1. **Sari-Sari Store Inventory System**
**Features:**
- Product catalog (name, price, stock, category)
- **QR code for product labels** (for easy scanning) ⭐
- Sales recording (who sold what, when)
- Low stock alerts (displays items below threshold)
- Sales reports (daily/weekly/monthly)
- **Optional: Currency converter** (PHP to USD for imported goods) ⭐
- Admin: manage products, view all sales
- User (Cashier): record sales only

**Why clients love it:**
- Replace messy notebooks
- Track what sells best
- Know when to restock
- See profit trends

**Build time:** 2-3 weeks

---

#### 2. **Appointment Booking System**
**Features:**
- Service catalog (haircut, massage, consultation)
- Available time slots (admin sets schedule)
- Book appointments (customers or staff)
- Appointment list (today, upcoming, past)
- Confirmation status (pending/confirmed/cancelled)
- **QR code confirmation** (customer scans on arrival) ⭐
- Admin: manage schedule, view all bookings
- User (Customer): view own appointments only

**Use cases:**
- Barbershop
- Dental clinic
- Consultation services
- Beauty salon

**Build time:** 2-3 weeks

---

#### 3. **Simple HR/Employee Portal**
**Features:**
- Employee directory (name, position, department, contact)
- **Country selector with flags** (for international employees) ⭐
- Leave requests (date, type, reason, status)
- Announcement board (admin posts, employees view)
- Attendance logging (clock in/out)
- Leave balance tracking
- Admin: approve/deny leaves, manage employees
- User (Employee): request leaves, view own records

**Why clients love it:**
- Paperless leave requests
- Centralized employee info
- Leave history always available

**Build time:** 3-4 weeks

---

### Education

#### 4. **Class Records Management**
**Features:**
- Student roster (name, student number, section)
- **Country dropdown for international students** (with flags) ⭐
- Grade recording (subject, grading period, score)
- Attendance tracking (date, present/absent)
- Grade computation (weighted average)
- Report card generation (printable)
- **QR code student IDs** (for scanning attendance) ⭐
- Admin (Teacher): full access
- User (Student): view own grades only

**Build time:** 3-4 weeks

---

#### 5. **School Library System**
**Features:**
- Book catalog (title, author, ISBN, copies available)
- Borrower records (students/teachers)
- Borrowing transactions (who borrowed what, when, due date)
- Overdue tracking
- Return processing
- Search books (title, author, subject)
- Admin (Librarian): manage books, process loans
- User (Student): search catalog, view own loans

**Build time:** 3-4 weeks

---

### Government/Community

#### 6. **Barangay Information System**
**Features:**
- Resident directory (name, address, birthday, contact)
- Household grouping (family members)
- Barangay clearance requests (resident submits, admin approves)
- **QR code for resident IDs** (for verification) ⭐
- Certificate issuance log (what was issued, when)
- Blotter/incident reports
- Admin (Barangay Official): full access
- User (Resident): view own records, request certificates

**Build time:** 4-5 weeks

---

#### 7. **Equipment/Asset Tracking**
**Features:**
- Asset inventory (item, serial number, location, condition)
- **QR code labels for assets** (scan to view details) ⭐
- Checkout system (who borrowed what, when)
- Maintenance log (service date, what was done)
- Transfer history (moved from office A to office B)
- Asset depreciation tracking
- Search and filter assets
- Admin: manage assets
- User (Employee): request checkout, view assigned assets

**Use cases:**
- Government offices
- Schools (lab equipment)
- NGOs

**Build time:** 3-4 weeks

---

### Service Business

#### 8. **Customer Relationship Management (Simple CRM)**
**Features:**
- Customer directory (name, company, contact, industry)
- **Country selector with flags** (for international clients) ⭐
- Interaction log (calls, meetings, emails - manually logged)
- Deal pipeline (prospect, negotiation, closed, lost)
- Follow-up reminders (next contact date)
- Customer notes (preferences, history)
- Sales dashboard (deals by status, revenue forecast)
- Admin (Sales Manager): view all
- User (Sales Rep): view assigned customers only

**Build time:** 3-4 weeks
- Follow-up reminders (next contact date)
- Customer notes (preferences, history)
- Sales dashboard (deals by status, revenue forecast)
- Admin (Sales Manager): view all
- User (Sales Rep): view assigned customers only

**Build time:** 3-4 weeks

---

#### 9. **Maintenance Request Tracking**
**Features:**
- Request submission (location, issue, priority)
- Assignment to technician
- Status tracking (pending, in-progress, completed)
- Work log (what was done, parts used, time spent)
- Request history
- Admin (Supervisor): assign, view all
- User (Technician): view assigned requests, update status

**Use cases:**
- Property management
- School maintenance
- Office facilities

**Build time:** 2-3 weeks

---

#### 10. **Event Registration System**
**Features:**
- Event catalog (name, date, venue, slots available)
- Registration form (attendee info)
- Attendee list (searchable)
- Check-in system (mark attended)
- Registration reports (by event, by date)
- Certificate of attendance list
- Admin: manage events, view registrations
- User: register for events, view own registrations

**Use cases:**
- Seminars/workshops
- Community events
- School activities

**Build time:** 2-3 weeks

---

## 🎓 How to Use This Guide

### When Evaluating Projects

**Step 1: List all features the client wants**

**Step 2: Categorize each feature:**
- ✅ In-scope: You can build confidently
- ⚠️ Borderline: May need research, but possible
- ❌ Out-of-scope: Requires tools/knowledge not yet learned

**Step 3: Calculate scope:**
- **80%+ in-scope:** ✅ Accept project
- **60-80% in-scope:** ⚠️ Accept, but negotiate timeline for learning
- **<60% in-scope:** ❌ Decline or defer out-of-scope features to Phase 2

**Step 4: Set expectations:**
- "I can deliver X, Y, Z confidently"
- "Feature A requires additional tools, we can add in Phase 2"
- "Feature B is out of my current scope, I recommend specialist Z"

---

## 💬 Sample Client Conversations

### ✅ Good Fit Project

**Client:** "We need a system to track our inventory and sales for our hardware store."

**You:** "Perfect! I can build that. We'll have:
- Product catalog with stock levels
- Sales recording for each transaction
- Low stock alerts
- Daily/monthly sales reports
- Export to CSV for accounting

I can deliver this in 3-4 weeks. The system will run on reliable cloud hosting ($10/month) and you'll be able to add products and track sales immediately."

---

### ⚠️ Needs Scope Adjustment

**Client:** "We need a booking system with payment processing and SMS reminders."

**You:** "Great! I can definitely build the booking system with:
- Service catalog
- Appointment scheduling
- Booking confirmation
- Admin dashboard

For payment processing and SMS, those require specialized integrations. I recommend we:
- **Phase 1** (3 weeks): Build the booking system, track payments manually (admin marks as 'paid')
- **Phase 2** (future): Add automated payment and SMS when you have PayPal/GCash business account

This way you can start using the system quickly and add automation later."

---

### ❌ Not a Good Fit (Yet)

**Client:** "We need a mobile app with real-time chat and GPS tracking."

**You:** "That's a great project! However, it requires native mobile development (iOS/Android) and real-time technology that's outside my current specialization.

What I *can* offer is a web-based version that works on phones through the browser, but without real-time chat or GPS. 

For the full mobile app, I recommend reaching out to [Mobile Developer Name]. If you'd like to start with a simpler web version first to validate the concept, I'm happy to help with that!"

---

## 🚀 Your Unique Selling Points

When pitching to clients, emphasize:

### 1. **Simplicity = Reliability**
"My apps are built with proven, simple technology. No complex frameworks that break with updates. Easy for any developer to maintain."

### 2. **Fast Delivery**
"Most projects done in 2-4 weeks, not months. You see working features every week."

### 3. **Affordable**
"Hosting costs $5-10/month. No expensive cloud bills. No ongoing framework license fees."

### 4. **Easy to Modify**
"When your needs change, updates are straightforward. You're not locked into my services - any web developer can help."

### 5. **Professional Features**
"Built-in audit logs, data export, user management, search/filter, QR code generation, and external API integration. Everything a business needs."

### 6. **Modern Integration**
"I can integrate simple external APIs like QR codes for labels, country data with flags, and currency conversion. Your app feels modern without complex overhead."

### 7. **Local Context**
"I understand Philippine business needs - barangay systems, sari-sari stores, small schools. My examples are relevant to your world."

---

## � Quick Reference: API Integration Guide

### ✅ APIs You Can Use Confidently

| API | Use Case | API Key? | Difficulty | Cost |
|-----|----------|----------|------------|------|
| **QR Server** | QR codes for IDs, receipts, labels | ❌ No | 🟢 Easy | Free |
| **REST Countries** | Country dropdowns with flags | ❌ No | 🟢 Easy | Free |
| **ExchangeRate-API** | Currency conversion | ❌ No* | 🟢 Easy | Free tier |
| **Open Library** | Book data (ISBN lookup) | ❌ No | 🟢 Easy | Free |
| **Public Holidays** | Date calculations | ❌ No | 🟢 Easy | Free |

*May require simple email signup for higher limits

### ❌ APIs to Avoid (Too Complex for Now)

| API | Why Avoid | Alternative |
|-----|-----------|-------------|
| Google Maps | Billing required, complex setup | Show address text, link to Google Maps |
| Twilio SMS | Paid per message, phone verification needed | Admin notifies via in-person/email |
| SendGrid Email | Email service setup, deliverability issues | Admin sends emails manually |
| PayMongo/Stripe | PCI compliance, webhooks, testing complexity | Manual payment tracking |
| OAuth Login | Complex flow, app registration needed | Simple username/password |

### 🔗 Recommended APIs to Learn

**Copy-paste ready examples:**

```javascript
// QR Code (no JavaScript needed!)
<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${bookingId}" />

// REST Countries (client-side)
fetch('https://restcountries.com/v3.1/all')
  .then(response => response.json())
  .then(countries => {
    // Display country dropdown with flags
    countries.forEach(country => {
      console.log(country.name.common, country.flag);
    });
  });

// Exchange Rate
fetch('https://api.exchangerate-api.com/v4/latest/PHP')
  .then(response => response.json())
  .then(data => {
    const usdRate = data.rates.USD;
    console.log(`1 PHP = ${usdRate} USD`);
  });
```

---

## �📊 Project Complexity Reference

| Project Type | Duration | In-Scope Features | Good First Project? |
|--------------|----------|-------------------|---------------------|
| Simple CRUD app | 1-2 weeks | List, Add, Edit, Delete | ✅ Yes |
| CRUD + Auth | 2-3 weeks | Above + Login, User roles | ✅ Yes |
| CRUD + Auth + Reports | 3-4 weeks | Above + CSV export, Basic charts | ⚠️ Maybe (if comfortable with auth) |
| CRUD + Auth + APIs | 3-4 weeks | Above + QR codes, Country data | ⚠️ Second project recommended |
| Multi-table relational | 3-4 weeks | Complex joins, Foreign keys | ⚠️ Second project recommended |
| Full business system | 4-6 weeks | Everything above + Audit logs | ❌ Third project+ |

---

## ✨ Final Tips

1. **Start small:** Your first paid project should be simple (inventory, contact list, appointment log)
2. **Set boundaries:** Use this guide to confidently say "That's Phase 2"
3. **Underpromise, overdeliver:** If you think 3 weeks, say 4 weeks
4. **Show examples:** Use your mini-projects (barangay, students, store) as portfolio
5. **Be honest:** "I haven't done X yet" builds trust more than pretending
6. **Keep learning:** After delivering 2-3 projects, revisit out-of-scope features and learn them
7. **APIs are easy!** QR codes and country data add professional polish with minimal effort

---

## 📚 Related Documents

- `support-materials/railway-deployment-guide.md` - How to deploy your projects
- `web-app-basics-part1-lecture.md` - Foundation concepts
- `web-app-basics-part2a-lecture.md` - Database and CRUD (coming soon)
- `web-app-basics-part2b-lecture.md` - Authentication (coming soon)
- `web-app-basics-part2c-lecture.md` - Advanced features (coming soon)

---

**Remember:** Your competitive advantage is delivering **simple, maintainable, production-ready** systems that small businesses actually need. Don't try to compete with enterprise developers on complexity. Compete on clarity, speed, and value for small organizations. 🎯
