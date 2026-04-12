# 📖 The Blissful Station — Technical Documentation

> A multi-portal SaaS platform for mental wellness, connecting patients with verified therapists through a curated, admin-managed marketplace.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Monorepo Structure](#2-monorepo-structure)
3. [Technology Stack](#3-technology-stack)
4. [Database Schema](#4-database-schema)
5. [Authentication System](#5-authentication-system)
6. [The Three Portals](#6-the-three-portals)
7. [Admin Verification Workflow](#7-admin-verification-workflow)
8. [Supabase Client Strategy](#8-supabase-client-strategy)
9. [Design System](#9-design-system)
10. [Environment Variables](#10-environment-variables)
11. [Running Locally](#11-running-locally)
12. [Known Limitations & Future Work](#12-known-limitations--future-work)
13. [Pre-Production Optimizations](#13-pre-production-optimizations)
14. [Audit Findings](#14-audit-findings)

---

## 1. Architecture Overview

┌─────────────────────────────────────────────────────────────────┐
│                      Supabase (Cloud BaaS)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  Auth Service │  │  PostgreSQL  │  │  Row Level Security    │ │
│  │  (ES256 JWKS) │  │ (Prisma 7 DB) │  │  (RLS Policies)        │ │
│  └──────┬───────┘  └──────┬───────┘  └────────────────────────┘ │
└─────────┼──────────────────┼────────────────────────────────────┘
          │                  │
          ▼                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Backend (NestJS) — Port :5000                 │
│  Passport (ES256) • RolesGuard (RBAC) • Prisma 7 Service        │
│  (Centralized API relay for high-privileged operations)          │
└─────────┬──────────────────┬──────────────────┬──────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Patient App  │  │ Therapist App│  │ Admin Panel  │
│  :3000       │  │  :3001       │  │  :3002       │
│  Next.js 16  │  │  Next.js 16  │  │  Next.js 16  │
│  (App Router)│  │  (App Router)│  │  (App Router)│
└──────────────┘  └──────────────┘  └──────────────┘

The platform is a **multi-portal monorepo** with three independent Next.js 15 applications sharing a single Supabase project as the backend. Each app targets a specific user role:

| Portal | Port | Target User | Key Feature |
|--------|------|-------------|-------------|
| `patient-app` | 3000 | Patients | Browse therapists, book sessions, intake forms |
| `therapist-app` | 3001 | Therapists | Manage practice, clinical notes, patient roster |
| `admin-panel` | 3002 | Admins | Verify therapists, platform analytics |

---

## 2. Monorepo Structure

```
blissfulsaas/
├── patient-app/              # Patient-facing portal
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   │   ├── sessions/
│   │   │   │   │   ├── [id]/call/page.tsx  # Video consultation room
│   │   │   │   │   ├── book/[id]/page.tsx  # Slot selection flow
│   │   │   │   │   └── page.tsx            # Appointment history
│   │   │   │   ├── messages/page.tsx       # Message History archive
│   │   │   │   ├── intake/page.tsx         # Clinical Intake Form
│   │   │   │   ├── discover/page.tsx       # Live therapist marketplace
│   │   │   │   └── page.tsx                # Dashboard summary
│   │   │   ├── middleware.ts               # Auth session refresh
│   │   ├── components/
│   │   │   ├── ChatSidebar.tsx             # Real-time chat UI
│   │   │   ├── IntakeFormClient.tsx        # Multi-step patient intake UI
│   │   │   ├── VideoRoom.tsx               # Agora conference logic
│   │   │   └── VideoRoomWrapper.tsx        # SSR safety wrapper
│   │   └── lib/
│   │       ├── api.ts                      # Backend API client (Browser)
│   │       └── api-server.ts               # Backend API client (Server)
│
├── therapist-app/            # Therapist-facing portal
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   │   ├── appointments/page.tsx   # Schedule + Clinical Workstation
│   │   │   │   ├── availability/page.tsx   # Slot management
│   │   │   │   ├── patients/page.tsx       # Patient Roster (CRM)
│   │   │   │   ├── messages/page.tsx       # Message History archive
│   │   │   │   ├── sessions/[id]/call/page.tsx # Video room & chat
│   │   │   │   └── page.tsx                # Clinical overview
│   │   │   ├── middleware.ts               # Auth session refresh
│   │   ├── components/
│   │   │   ├── AppointmentActions.tsx      # State management buttons
│   │   │   ├── EnhancedAppointmentsList.tsx# 3-Column Clinical Workstation
│   │   │   ├── ChatSidebar.tsx             # In-call messaging UI
│   │   │   ├── NotesSidebar.tsx            # Private clinical notes
│   │   │   └── VideoRoomWrapper.tsx
│   │   └── lib/
│   │       └── api.ts                      # Unified API service
│
├── backend/                  # NestJS API (Primary Business Logic)
│   ├── prisma/
│   │   └── schema.prisma           # Database schema (source of truth)
│   └── src/
│       ├── availability/           # Slot generation & management
│       ├── messages/               # Chat persistence & history
│       ├── sessions/               # Appointment lifecycle & notes
│       ├── patients/               # Intake forms & roster logic
│       ├── auth/                   # RBAC & JWT validation
│       └── therapists/             # Registry management
│
├── promote_admin.sql         # SQL script to promote user to admin
└── README.md
```

---

## 3. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 (App Router) | Server components, routing, SSR |
| **Styling** | Tailwind CSS v4 | Utility-first CSS with design tokens |
| **UI Components** | shadcn/ui (partial) | Button, Card, Input primitives |
| **Icons** | Lucide React | Consistent, lightweight icon set |
| **Auth** | Supabase Auth | Email/password authentication |
| **Database** | Supabase PostgreSQL | Managed Postgres with RLS |
| **ORM** | Prisma | Schema definition and migrations |
| **Backend API** | NestJS | Multi-module REST API with guards |
| **Video Platform** | Agora RTC | SDK for low-latency clinical video |
| **Real-time Engine** | Supabase Realtime | WebSocket-driven chat delivery |
| **Fonts** | Inter + Manrope | System sans-serif + display heading |

---

## 4. Database Schema

The database schema is defined in `backend/prisma/schema.prisma` and managed via Supabase PostgreSQL.

### Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o| Patient : "has profile"
    User ||--o| Therapist : "has profile"
    User ||--o| Admin : "has profile"

    User {
        UUID id PK "Matches auth.users.id"
        String email UK
        Role role "PATIENT | THERAPIST | ADMIN"
        DateTime createdAt
    }

    Patient {
        UUID id PK
        UUID userId FK UK
        String firstName
        String lastName
        String phone
        Boolean intakeCompleted
        String reasonForSeeking
        String[] primaryConcerns
        String mentalHealthHistory
        String currentMedications
        Boolean previousTherapy
        String therapyGoals
        String emergencyContactName
        String emergencyContactPhone
    }

    Therapist ||--o{ Slot : "manages"
    Slot ||--o| Appointment : "fills"
    Patient ||--o{ Appointment : "books"
    Appointment ||--o{ Message : "contains"

    Appointment {
        UUID id PK
        UUID patientId FK
        UUID therapistId FK
        UUID slotId FK UK
        String status "UPCOMING | COMPLETED | CANCELLED"
        String patientNotes
        String therapistNotes
        DateTime scheduledAt
    }

    Slot {
        UUID id PK
        UUID therapistId FK
        DateTime startTime
        DateTime endTime
        Boolean isBooked
        Boolean isActive
    }

    Message {
        UUID id PK
        UUID appointmentId FK
        UUID senderId FK
        String content
        DateTime createdAt
    }

    Therapist {
        UUID id PK
        UUID userId FK UK
        String firstName
        String lastName
        String bio
        String[] specialities
        Float hourlyRate
        Boolean isVerified
    }
```

### Key Design Decisions

- **1:1 Role Profiles**: Each `User` has exactly one profile (`Patient`, `Therapist`, or `Admin`). This is enforced by unique constraints on `userId`.
- **UUID Primary Keys**: All IDs use `gen_random_uuid()` and match Supabase's `auth.users.id` format.
- **Clinical Documentation (Phase 5)**: Patient intake forms pre-fill `Patient` columns, while `Appointment` holds private `therapistNotes` per session. This ensures continuity of care across multiple appointments with different therapists if needed.

---

## 5. Authentication System

### 5.1 Auth Provider

All authentication is handled by **Supabase Auth**. For high security, the platform uses **ES256 Asymmetric Signing**. Frontend portals communicate with the **NestJS Backend** using JWTs, which the backend verifies using Supabase's public **JWKS endpoint** (`/.well-known/jwks.json`).

### 5.2 Auth Flow Diagram

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant NextJS as Next.js App
    participant Supabase as Supabase Auth
    participant DB as PostgreSQL

    User->>Browser: Fill signup form
    Browser->>NextJS: Submit (email, password, role, name)
    NextJS->>Supabase: auth.signUp({ email, password, data: { role } })
    Supabase->>DB: INSERT into auth.users
    DB->>DB: TRIGGER: handle_new_user()
    Note over DB: Creates public.User record<br/>Creates Patient profile if role=PATIENT
    Supabase-->>NextJS: { user, session }
    NextJS->>Browser: Set auth cookie, redirect to /dashboard
```

### 5.3 Database Trigger — `handle_new_user()`

Located in `backend/supabase_triggers.sql`, this PostgreSQL trigger fires on every new `auth.users` insertion:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- 1. Always create a public.User record
  INSERT INTO public."User" (id, email, role)
  VALUES (
    new.id,
    new.email,
    CAST(COALESCE(new.raw_app_meta_data->>'role', 'PATIENT') AS public."Role")
  );

  -- 2. If the role is PATIENT, also create a Patient profile
  IF COALESCE(new.raw_app_meta_data->>'role', 'PATIENT') = 'PATIENT' THEN
    INSERT INTO public."Patient" ("userId", "firstName", "lastName")
    VALUES (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name');
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

> **Important**: The trigger only auto-creates `Patient` profiles. Therapist profiles are created explicitly via a **Server Action** (see §5.5 below).

### 5.4 Role-Based Access Control (RBAC)

Each portal enforces access at the **layout level** (Server Components):

| Portal | Guard Location | How It Works |
|--------|---------------|--------------|
| **Patient App** | `dashboard/layout.tsx` | Calls `supabase.auth.getUser()`. Redirects to `/login` if no session. |
| **Therapist App** | `dashboard/layout.tsx` | Same as Patient. |
| **Admin Panel** | `dashboard/layout.tsx` | **Dashboard Guard**: Calls `auth.getUser()`, initiates an `Admin Client` to query `public.User`. If `role !== ADMIN`, forces a sign-out and redirects to login with an error. |

### 5.5 Backend API Authorization

For requests hitting the **NestJS Backend**, security is enforced via the `JwtAuthGuard` and `RolesGuard`:

1.  **Token Validation**: The backend fetches public keys from Supabase (JWKS) to verify the token signature.
2.  **Role Extraction**: The `JwtStrategy` extracts the `app_metadata.role` from the JWT.
3.  **Endpoint Locking**: Controllers use the `@Roles('ADMIN')` decorator to restrict access.

### 5.5 Therapist Signup — Server Action Pattern

Because Supabase RLS blocks new users from inserting into the `Therapist` table (no policy exists yet), the therapist signup uses a **Next.js Server Action** that bypasses RLS:

```
therapist-app/src/app/signup/
├── page.tsx        ← Client Component (form UI)
└── actions.ts      ← Server Action (uses Service Role key)
```

**Flow:**
1. `page.tsx` collects form data and calls `signUpTherapist()` (Server Action).
2. `actions.ts` uses the **regular client** for `auth.signUp()` (creates auth user + triggers `User` record).
3. `actions.ts` then uses the **Admin client** (Service Role) to `INSERT` into `Therapist` table (bypasses RLS).

### 5.6 Sign-Out Mechanism

Each app has a dedicated API route for sign-out:

```
/auth/signout    (POST)
```

The `SignOutButton` (Client Component) sends a `POST` fetch to this route. The route handler calls `supabase.auth.signOut()` server-side and redirects to `/login`.

This pattern avoids cookie persistence issues that occur when signing out client-side only.

### 5.7 Cookie Isolation

Since all three apps run on `localhost`, they would normally fight over the same Supabase auth cookie. To prevent session conflicts, each app uses a **unique cookie name**:

| App | Cookie Name |
|-----|------------|
| Patient App | `sb-patient-auth-token` |
| Therapist App | `sb-therapist-auth-token` |
| Admin Panel | `sb-admin-auth-token` |

### 5.8 Admin Promotion

Admins cannot self-register. An existing user must be manually promoted via SQL:

```sql
-- promote_admin.sql
UPDATE public."User" SET role = 'ADMIN' WHERE id = '<user-uuid>';
INSERT INTO public."Admin" ("userId") VALUES ('<user-uuid>') ON CONFLICT DO NOTHING;
DELETE FROM public."Patient" WHERE "userId" = '<user-uuid>';
DELETE FROM public."Therapist" WHERE "userId" = '<user-uuid>';
```

---

## 6. The Three Portals

### 6.1 Patient App (`:3000`)

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Marketing page with hero, features, CTAs |
| Login | `/login` | Email/password login |
| Signup | `/signup` | Patient registration with name fields |
| Dashboard | `/dashboard` | Protected patient home |
| Discover | `/dashboard/discover` | Browse therapist marketplace (currently static data) |
| Book Session | `/dashboard/sessions/book` | Live therapist availability & slot booking |
| My Sessions | `/dashboard/sessions` | Upcoming and past appointments |
| My Messages | `/dashboard/messages` | Transcripts of past session chats |
| Intake Form | `/dashboard/intake` | Multi-step clinical pre-session data |

### 6.2 Therapist App (`:3001`)

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Provider-focused marketing page |
| Login | `/login` | Professional login |
| Signup | `/signup` | Application form → creates auth user + Therapist profile |
| Dashboard | `/dashboard` | Protected provider workspace |
| Availability | `/dashboard/availability` | Drag-and-drop 3-week slot generation |
| Appointments | `/dashboard/appointments` | Schedule management & Clinical Workstation (Intake + Notes) |
| Patient Roster | `/dashboard/patients` | Deduped CRM viewer of past patients and interaction history |
| Message Archive| `/dashboard/messages` | Secure transcripts of past session chats |
| Session Room | `/dashboard/sessions/[id]/call` | Professional video & chat workspace |

### 6.3 Admin Panel (`:3002`)

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Admin-only terminal login |
| Overview | `/dashboard` | Platform stats: total users, patients, therapists, pending |
| Provider Network | `/dashboard/therapists` | Table of all therapist applications |
| Therapist Detail | `/dashboard/therapists/[id]` | Deep-dive into individual practitioner |
| **Backend** | `PATCH /therapists/:id/verify` | Master endpoint for verification |

---

## 7. Admin Verification Workflow

```mermaid
flowchart TD
    A[Therapist submits application<br/>via therapist-app/signup] --> B[Server Action creates<br/>auth user + Therapist profile]
    B --> C[Therapist appears in<br/>Admin Panel with status: PENDING]
    C --> D{Admin reviews<br/>credentials}
    D -->|Approve| E[PATCH /api/therapists/id/approve<br/>Sets isVerified = true]
    D -->|Reject| F[DELETE /api/therapists/id/reject<br/>Deletes Therapist record]
    E --> G[Therapist appears in<br/>Patient discovery marketplace]
    F --> H[Application permanently removed]
```

---

## 8. Supabase Client Strategy

Each app maintains **two server-side clients** and **one browser client**:

### Browser Client (`lib/supabase.ts`)
- Used in `"use client"` components (login forms, signout buttons).
- Uses the **anon (publishable) key**.
- Configures a unique cookie name per app.

### Server Client (`lib/supabase/server.ts` → `createClient()`)
- Used in Server Components and API routes.
- Uses the **anon key** with cookie-based session management.
- Respects RLS policies.

### Admin Client (`lib/supabase/server.ts` → `createAdminClient()`)
- Used exclusively by Admins and backend jobs.
- Uses the **Service Role key** (⚠️ NEVER exposed to the browser).
- Used to bypass RLS for critical system operations until granular PostgREST policies are fully fleshed out.

---

## 9. Design System

The platform uses the **"Blissful Botanical"** design system — a muted dark-green palette inspired by botanical wellness spaces.

### Color Tokens (defined in `globals.css`)

| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | `#053628` | Deep botanical green — headings, buttons, accents |
| `--primary-foreground` | `#ffffff` | Text on primary backgrounds |
| `--primary-container` | `#214d3e` | Lighter green container |
| `--surface` | `#fbf9f9` | Main background |
| `--surface-container-low` | `#f5f3f3` | Card/input backgrounds |
| `--surface-container-lowest` | `#ffffff` | Elevated cards |
| `--destructive` | `#ba1a1a` | Error states, danger actions |
| `--muted-foreground` | `#414944` | Secondary text |

### Design Principles

1. **"No-Line" Architecture**: Minimal use of visible borders. Separation achieved through color contrast and subtle shadows.
2. **Glassmorphism**: Backdrop blur effects on headers and overlays (`backdrop-blur-md`).
3. **Micro-Animations**: Hover states with `translate-y`, `scale`, and `rotate` transforms on interactive elements.
4. **Editorial Typography**: Oversized headings (`text-4xl`+), ultra-wide tracking (`tracking-widest`), uppercase labels.
5. **Super-rounding**: Cards use `rounded-[2.5rem]` to `rounded-[3rem]` for a premium organic feel.
6. **Clinical Workstations**: The therapist portal treats data displays as full "workstations" (expandable table rows replacing older modal patterns).

---

## 10. Environment Variables

Each app requires a `.env.local` file in its root:

### Patient App & Therapist App
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxx
NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id
```

### Therapist App (additional)
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...  # For profile creation
```

### Admin Panel
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...  # For admin operations
```

### Backend (NestJS)
```env
DATABASE_URL="postgres://postgres.xxx:password@aws-0-xx.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgres://postgres.xxx:password@aws-0-xx.pooler.supabase.com:5432/postgres"
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_JWT_SECRET=your_jwt_secret
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_cert
```

---

## 11. Running Locally

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/dethrtrns/blissfulsaas.git
cd blissfulsaas

# 2. Install dependencies for each app & backend
cd patient-app && npm install && cd ..
cd therapist-app && npm install && cd ..
cd admin-panel && npm install && cd ..
cd backend && npm install && cd ..

# 3. Create .env.local files in each app (see §10)

# 4. Start the backend
cd backend && npx prisma migrate deploy && npm run dev  # → http://localhost:5000

# 5. Start all three portals (in separate terminals)
cd patient-app && npm run dev        # → http://localhost:3000
cd therapist-app && npm run dev      # → http://localhost:3001  
cd admin-panel && npm run dev        # → http://localhost:3002
```

---

## 12. Known Limitations & Future Work

### Current Limitations

| Area | Issue | Workaround |
|------|-------|-----------|
| **Email Verification** | Supabase email confirmation not enforced | Users access dashboards immediately after signup |
| **Password Recovery** | `/forgot` route linked in login pages but pages don't exist | No self-service password reset available |
| **Payments** | No payment integration | — |
| **Emails** | No transactional emails (confirmations, reminders) | — |
| **Dashboard Metrics** | Hardcoded "fake" growth metrics on main dashboards | Dashboards pending real data integration |

### Planned Features (Roadmap)

**✅ Completed**
- [x] **Monorepo Scaffold**: Three Next.js portals
- [x] **NestJS Backend**: REST API with Prisma ORM
- [x] **Supabase Auth**: Email/password signup with DB triggers
- [x] **Booking System**: Slot-based availability & patient flow
- [x] **Video Consultations**: Agora SDK integration with token security
- [x] **Real-Time Chat**: Full real-time support with polling fallbacks
- [x] **Role Guards**: Layout-level CSR/SSR auth protection
- [x] **Message History**: Unified messaging archive for patients and therapists
- [x] **Patient Roster**: Therapist dashboard view of unique patients and interaction history
- [x] **Clinical Workstation**: Appointments view with Session Details, Patient Intake Form, and Private Clinical Notes

**🔲 Pending (by priority)**
- [ ] **Admin Panel & Analytics**: Revenue tracking, platform stats, management
- [ ] **Payments (Razorpay)**: Session-based payment & invoicing
- [ ] **Email Notifications**: Transactional emails via Resend
- [ ] **Password Recovery**: `/forgot` + `/update-password` routes
- [ ] **Public/Institutional Pages**: Schools, Corporate, Universities program pages
- [ ] **Storage**: Supabase Storage for profiles/docs
- [ ] **Comprehensive RLS**: Fine-grained PostgreSQL policies

---

## 13. Pre-Production Optimizations

> These are **not blockers** for feature development. They should be addressed before going live with real patient data.

| # | Optimization | Priority | Current State | Better Implementation |
|---|-------------|----------|---------------|----------------------|
| 1 | **JWT Custom Claims** | Performance | Portals query `public.User` table on every page load | Inject `role` into `auth.users.raw_app_meta_data` at signup |
| 2 | **Prisma RLS Passthrough** | Security | NestJS connects via direct Postgres URL | Implement Prisma Client Extension to inject JWT claims |
| 3 | **PHI Audit Logging** | Compliance | Only basic timestamps exist | Create an immutable `AuditLog` table + triggers |

---

## 14. Audit Findings

> Code audit performed April 10, 2026. These are bugs and quality issues found during a full review of all source files.

### 🔴 Bugs

| # | Bug | File | Impact | Status |
|---|-----|------|--------|-----|
| 1 | **`getSession()` used instead of `getUser()`** | `admin-panel/src/lib/api.ts` | Security issue (JWT forgery) | 🔴 PENDING |
| 2 | **Fake growth metric "+12% this month"** | `admin-panel/dashboard/page.tsx` | Misleading dashboard data | 🔴 PENDING |
| 3 | **Discover page maps static therapist lists** | `patient-app/dashboard/discover/page.tsx` | UI doesn't match API data | 🔴 PENDING |

### 🟡 Code Quality Issues

| Issue | Location | Severity |
|-------|----------|----------|
| `(therapist.user as any)?.email` type casting | Admin therapist pages | Low — should use Supabase generated types |
| `catch (err: any)` pattern | Multiple files | Low |
| No loading state on login submit button | Patient + Therapist login pages | Low |
| No error boundaries | All 3 Next.js apps | Low — unhandled fetch errors crash the page |
| Unused imports (`Filter`, `MoreHorizontal`) | Admin therapists list page | Trivial |
| Patient + Therapist dashboards are fully hardcoded | Dashboard home pages | Low — expected at this stage, will be replaced with live data |

---

*Documentation generated for The Blissful Station platform. Last updated: April 12, 2026.*
