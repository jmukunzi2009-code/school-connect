# 🎓 SchoolConnect 360

> **"One Platform. Every School. Connected for Success."**

SchoolConnect 360 is a commercial-grade, multi-tenant school management and education operations platform built with **Next.js (App Router)**, **React**, **Neon PostgreSQL**, and **Node.js**.

Designed with **34 distinct user roles** and **47 integrated modules**, SchoolConnect 360 breaks departmental data silos through **Connected Relational Loops**: a student registered once by the Registrar immediately becomes available for roll-call attendance, gradebook marks, library book checkouts, cafeteria meal planning, dormitory bed allocations, and bursar invoicing without repetitive data re-entry.

---

## 🎨 Brand Identity & Palette

- **Forest Green**: `#123B2A` (Primary institutional accent)
- **Deep Forest**: `#0B241B` (Sidebar & deep contrast surfaces)
- **Gold**: `#D6AD55` (Badges, primary buttons & key highlights)
- **White**: `#FFFFFF` (Surface cards & containers)
- **Off-White**: `#F7F8F5` (Clean background)
- **Charcoal**: `#202923` (Body typography)
- **Light Grey**: `#E8ECE8` (Dividers & borders)

---

## 🔄 The Connected Loop Architecture

In legacy systems, each department re-enters the same student profile into disconnected spreadsheets. SchoolConnect 360 utilizes a unified relational data flow:

```mermaid
graph TD
    A[Registrar / Admissions] -->|1. Registers Student & Guardian| B[(Neon PostgreSQL: students & enrollments)]
    B -->|2. Instant Enrollment Roster| C[Headteacher / Principal Directory]
    B -->|3. Daily Stream Roll Call| D[Class Teachers & Teachers]
    B -->|4. Pick Student from Class Roster| E[Librarian: Book Checkout]
    B -->|5. Auto-Generated Invoices| F[Bursar & Cashier: Payment Receipts]
    B -->|6. Health Log via Class Roster| G[Nurse: Confidential Infirmary Visits]
    B -->|7. Linked Child Dashboard| H[Parent & Student Portal]
```

---

## 👥 The 34 User Roles

SchoolConnect 360 structures operations across two administrative tiers:

### Level 1: Platform Administration
1. **Super Administrator (`super_admin`)**: Oversees multi-tenant school vetting, approves/rejects institutional applications, monitors active enterprise subscriptions, and audits system security logs.

### Level 2: School Leadership
2. **School Owner (`school_owner`)**: Reviews high-level school performance, tuition collections, and major policy approvals.
3. **Headteacher / Principal (`headteacher`)**: Whole-school student directory inspection, attendance compliance, exam reports, and staff leadership.
4. **Deputy Headteacher — Academics (`deputy_headteacher_academics`)**: Curriculum delivery, timetable management, and examination administration.
5. **Deputy Headteacher — Discipline (`deputy_headteacher_discipline`)**: Student conduct, attendance concerns, and disciplinary oversight.
6. **School Administrator (`school_admin`)**: School workspace configuration, class creation, department definitions, and user role provisioning.

### Academic Department
7. **Director of Studies (`director_of_studies`)**: Academic terms, curriculum tracks, and subject allocations.
8. **Subject Teacher (`teacher`)**: My assigned classes, timetable roll calls, assignment distribution, and grade entry.
9. **Class Teacher (`class_teacher`)**: Homeroom stream management, daily attendance verification, and report card remarks.
10. **Examination Officer (`examination_officer`)**: Examination scheduling, assessment weightings, and marks publication.
11. **Academic Records Officer (`academic_records_officer`)**: Official results verification, grade corrections, and transcripts.
12. **Registrar / Admissions (`registrar`)**: Primary student registration, guardian linkage, and class enrollment.

### Finance
13. **Bursar / Accountant (`bursar`)**: Fee structure schedules, tuition invoicing, reconciliation, and expense tracking.
14. **Cashier (`cashier`)**: Counter payments, receipt slip generation, and daily cash transactions.

### Health and Welfare (Confidentiality Protected)
15. **Nurse / Health Officer (`nurse`)**: Restricted student medical records, vitals logging, prescription dispensing, and hospital referrals.
16. **School Counsellor (`counsellor`)**: Strictly confidential emotional and psychological case notes.
17. **Safeguarding Officer (`safeguarding_officer`)**: Restricted child protection and safeguarding incident files.
18. **Discipline Officer (`discipline_officer`)**: Infraction logging, detentions, corrective measures, and parent notices.
19. **Student Affairs Officer (`student_affairs_officer`)**: Student welfare services and campus extracurricular requests.

### School Operations
20. **Librarian (`librarian`)**: Catalog tracking, ISBNs, and instant student book checkout/return.
21. **HR Manager (`hr_manager`)**: Staff employment records, clock-in attendance, and leave authorizations.
22. **Procurement Officer (`procurement_officer`)**: Requisition vetting, quotes, and supplier purchase orders.
23. **Storekeeper (`storekeeper`)**: Stock inventory, asset checkouts, and low-stock threshold alerts.
24. **Feeding Manager (`feeding_manager`)**: Daily meal menus, kitchen inventory, and nutritional planning.
25. **Transport Manager (`transport_manager`)**: School bus fleet, driver rosters, and student transit allocations.
26. **Boarding Manager (`boarding_manager`)**: Dormitory rooms, bed allocations, and boarding roll calls.

### Activities & Communication
27. **Sports Coordinator (`sports_coordinator`)**: Athletic teams, fixtures, tournaments, and achievements.
28. **Club Coordinator (`club_coordinator`)**: Student clubs, meeting venues, and club memberships.
29. **Communications Officer (`communications_officer`)**: Campus announcements, newsletters, and press updates.
30. **IT Administrator (`it_administrator`)**: Platform user support, account recovery, and system monitoring.
31. **Receptionist (`receptionist`)**: Front desk visitor registers, inquiries, and guardian appointments.

### School Community
32. **Parent / Guardian (`parent`)**: Real-time view of linked children's attendance, published marks, and fee balances.
33. **Student (`student`)**: Personal timetable, course assignments, attendance history, and exam grades.
34. **Alumni (`alumni`)**: Alumni directory, reunions, and institutional engagement.
35. **Supplier (`supplier`)**: Purchase orders received, delivery status, and payment acknowledgments.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19, JavaScript (ES6+), CSS Custom Properties
- **Icons**: Lucide React
- **Analytics Charts**: Recharts
- **Database**: Neon Serverless PostgreSQL (`pg` connection pool)
- **Authentication**: JWT stored in Secure HTTP-only cookies + bcryptjs password hashing
- **Package Manager**: npm

---

## 🚀 Getting Started (PowerShell Commands)

### 1. Clone & Install Dependencies

```powershell
git clone <repository-url>
cd schoolconnect360-next
npm install
```

### 2. Configure Environment Variables

Create `.env.local` based on `.env.example`:

```powershell
Copy-Item .env.example .env.local
```

Update your `.env.local` with your Neon database credentials:

```env
NODE_ENV=development
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require"
SUPER_ADMIN_EMAIL="admin@schoolconnect360.com"
SUPER_ADMIN_PASSWORD="YourSecurePassword2026!"
APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
JWT_SECRET="YOUR_RANDOM_LONG_SECRET_KEY"
```

### 3. Initialize & Bootstrap Database

Run the automated non-destructive schema runner. This creates all 47 relational tables, performance indexes, bootstraps the Super Admin, and seeds the demonstration school:

```powershell
node scripts/init-db.js
```

For databases initialized before the Rwanda fee demo amounts were updated, normalize only the five Kigali Heights demo invoices and their matching payments:

```powershell
node scripts/migrate-rwanda-demo-finance.js
```

For an existing demo database without assessment scores, populate the published Senior 1 English Literature marks:

```powershell
node scripts/seed-rwanda-demo-marks.js
```

### 4. Start Development Server

```powershell
npm run dev
```

Visit `http://localhost:3000` in your web browser.

---

## 🧪 Testing Credentials (Instant Demo Switcher)

On the login page (`/login`), you can click any role for one-click testing:

| Role | Email | Password | Scope |
|---|---|---|---|
| **Super Admin** | `jmukunzi2009@gmail.com` | `godson2009` | Platform Administration |
| **Headteacher** | `principal@kigaliheights.edu` | `School2026!` | Student Directory & Whole School |
| **School Admin** | `admin@kigaliheights.edu` | `School2026!` | Workspace Configuration |
| **Teacher** | `teacher@kigaliheights.edu` | `School2026!` | Attendance & Marks Entry |
| **Bursar** | `bursar@kigaliheights.edu` | `School2026!` | Tuition Invoices & Receipts |
| **Nurse** | `nurse@kigaliheights.edu` | `School2026!` | Restricted Infirmary Visits |
| **Librarian** | `librarian@kigaliheights.edu` | `School2026!` | Student Book Lending Loop |
| **Registrar** | `registrar@kigaliheights.edu` | `School2026!` | Student Admissions |

---

## ☁️ Vercel Deployment

1. Push your code to GitHub.
2. In the Vercel Dashboard, import the repository.
3. In **Environment Variables**, add:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `SUPER_ADMIN_EMAIL`
   - `SUPER_ADMIN_PASSWORD`
   - `APP_URL`
4. Click **Deploy**.

---

## 📄 License

Proprietary © 2026 SchoolConnect 360. All rights reserved.
