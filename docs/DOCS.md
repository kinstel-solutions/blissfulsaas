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
15. [Notification Architecture](#15-notification-architecture-deep-dive)
16. [Clinical Messaging Policies](#16-clinical-messaging-policies)
17. [Deterministic Hydration & Compliance](#17-deterministic-hydration--compliance)
18. [Payment Architecture](#18-payment-architecture)
19. [Session Feedback System](#19-session-feedback-system)

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

The platform is a **multi-portal monorepo** with three independent Next.js 16 applications sharing a single Supabase project as the backend. Each app targets a specific user role:

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
│   │   │   │   │   ├── book/[id]/page.tsx  # Slot selection + payment flow
│   │   │   │   │   └── page.tsx            # Appointment history
│   │   │   │   ├── therapist/[id]/page.tsx # Therapist detail profile view
│   │   │   │   ├── messages/page.tsx       # Message History archive
│   │   │   │   ├── intake/page.tsx         # Clinical Intake Form
│   │   │   │   ├── discover/page.tsx       # Live therapist marketplace
│   │   │   │   ├── error.tsx               # Error boundary
│   │   │   │   ├── loading.tsx             # Breathing loader
│   │   │   │   └── page.tsx                # Redirects to /discover
│   │   │   ├── forgot/page.tsx             # Password reset request
│   │   │   ├── update-password/page.tsx    # New password entry
│   │   │   ├── api/feedback/              # Feedback proxy API route
│   │   │   ├── auth/                      # Auth callback + signout
│   │   ├── components/
│   │   │   ├── BreathingLoader.tsx         # Calming loading animation
│   │   │   ├── DashboardSidebar.tsx        # Real-time reactive sidebar
│   │   │   ├── MobileNav.tsx              # Fixed bottom nav (mobile)
│   │   │   ├── NotificationBell.tsx        # Real-time notification center
│   │   │   ├── ChatSidebar.tsx             # Real-time chat UI
│   │   │   ├── IntakeFormClient.tsx        # Multi-step patient intake UI
│   │   │   ├── FeedbackForm.tsx            # Post-session star rating form
│   │   │   ├── SessionFeedbackButton.tsx   # Contextual "Rate Session" CTA
│   │   │   ├── RealtimeAutoUpdater.tsx     # Auto-refresh on DB changes
│   │   │   ├── VideoRoom.tsx               # Agora conference logic
│   │   │   └── VideoRoomWrapper.tsx        # SSR safety wrapper
│   │   └── lib/
│   │       ├── api.ts                      # Backend API client (Browser)
│   │       ├── api-server.ts               # Backend API client (Server)
│   │       └── validations.ts              # Form validation schemas
│
├── therapist-app/            # Therapist-facing portal
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   │   ├── appointments/page.tsx   # Schedule + Clinical Workstation
│   │   │   │   ├── availability/page.tsx   # Slot management (Online + In-Clinic)
│   │   │   │   ├── patients/page.tsx       # Patient Roster (CRM)
│   │   │   │   ├── profile/page.tsx        # Therapist profile editor
│   │   │   │   ├── messages/page.tsx       # Message History archive
│   │   │   │   ├── sessions/[id]/call/     # Video room & chat
│   │   │   │   ├── error.tsx               # Error boundary
│   │   │   │   ├── loading.tsx             # Breathing loader
│   │   │   │   └── page.tsx                # Clinical overview dashboard
│   │   │   ├── forgot/page.tsx             # Password reset request
│   │   │   ├── update-password/page.tsx    # New password entry
│   │   │   ├── auth/                      # Auth callback + signout
│   │   ├── components/
│   │   │   ├── AppointmentActions.tsx      # State management buttons
│   │   │   ├── EnhancedAppointmentsList.tsx# 3-Column Clinical Workstation
│   │   │   ├── PatientDetailPanel.tsx      # Deep-dive patient info view
│   │   │   ├── PatientList.tsx             # Patient roster component
│   │   │   ├── ClinicalNotesPopover.tsx    # Quick notes overlay
│   │   │   ├── ImageUpload.tsx             # Profile photo upload (Supabase Storage)
│   │   │   ├── MobileNav.tsx              # Fixed bottom dock (mobile)
│   │   │   ├── DashboardSidebar.tsx        # Branded Clinical Sidebar (Desktop)
│   │   │   ├── NotificationBell.tsx        # Real-time notification center
│   │   │   ├── ChatSidebar.tsx             # In-call messaging UI
│   │   │   ├── NotesSidebar.tsx            # Private clinical notes
│   │   │   ├── RealtimeAutoUpdater.tsx     # Auto-refresh on DB changes
│   │   │   └── VideoRoomWrapper.tsx
│   │   └── lib/
│   │       ├── api.ts                      # Unified API service
│   │       ├── api-server.ts               # Server-side API client
│   │       └── validations.ts              # Form validation schemas
│
├── admin-panel/              # Administrative portal
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   │   ├── therapists/             # Provider network management
│   │   │   │   ├── appointments/page.tsx   # Platform-wide session oversight
│   │   │   │   ├── financials/page.tsx     # Revenue & payment tracking
│   │   │   │   ├── error.tsx               # Error boundary
│   │   │   │   ├── loading.tsx             # Breathing loader
│   │   │   │   └── page.tsx                # Platform stats overview
│   │   │   ├── auth/                      # Auth callback + signout
│   │   ├── components/
│   │   │   ├── MobileNav.tsx              # Admin mobile nav
│   │   │   └── SignOutButton.tsx
│   │   ├── middleware.ts                  # Auth session refresh
│
├── backend/                  # NestJS API (Primary Business Logic)
│   ├── prisma/
│   │   └── schema.prisma           # Database schema (source of truth)
│   └── src/
│       ├── auth/                   # RBAC & JWT validation
│       ├── availability/           # Slot generation & management
│       ├── feedback/               # Session ratings & reviews
│       ├── messages/               # Chat persistence & history
│       ├── notifications/          # In-app notification system
│       ├── patients/               # Intake forms & roster logic
│       ├── payments/               # Razorpay integration (mock + live)
│       ├── sessions/               # Appointment lifecycle & notes
│       └── therapists/             # Registry management
│
├── package.json              # Monorepo scripts (concurrently)
├── promote_admin.sql         # SQL script to promote user to admin
└── README.md
```

---

## 3. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 (App Router) | Server components, routing, SSR |
| **Styling** | Tailwind CSS v4 | Utility-first CSS with design tokens |
| **UI Components** | shadcn/ui (partial) | Button, Card, Input primitives |
| **Icons** | Lucide React | Consistent, lightweight icon set |
| **Auth** | Supabase Auth | Email/password authentication |
| **Database** | Supabase PostgreSQL | Managed Postgres with RLS |
| **ORM** | Prisma | Schema definition and migrations |
| **Backend API** | NestJS | Multi-module REST API with guards |
| **Rate Limiting** | @nestjs/throttler | 60 req/min per client |
| **Payments** | Razorpay (+ mock mode) | Pre-session payment with HMAC verification |
| **Video Platform** | Agora RTC | SDK for low-latency clinical video |
| **Real-time Engine** | Supabase Realtime | WebSocket-driven chat & notification delivery |
| **Storage** | Supabase Storage | Therapist profile image uploads |
| **Fonts** | Outfit + Cormorant | Modern sans-serif + high-end serif |
| **Currency** | INR (₹) | Standardized for all financial displays |
| **Encryption** | AES-256 / TLS 1.3 | Industry-standard security (Non-HIPAA) |

---

## 4. Database Schema

The database schema is defined in `backend/prisma/schema.prisma` and managed via Supabase PostgreSQL.

### Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o| Patient : "has profile"
    User ||--o| Therapist : "has profile"
    User ||--o| Admin : "has profile"
    User ||--o{ Message : "sends"
    User ||--o{ Notification : "receives"

    User {
        UUID id PK "Matches auth.users.id"
        String email UK
        Role role "PATIENT | THERAPIST | ADMIN"
        DateTime createdAt
        DateTime updatedAt
    }

    Patient {
        UUID id PK
        UUID userId FK UK
        String firstName
        String lastName
        String phone
        DateTime dateOfBirth
        Boolean intakeCompleted
        String reasonForSeeking
        String mentalHealthHistory
        String currentMedications
        Boolean previousTherapy
        String therapyGoals
        String emergencyContactName
        String emergencyContactPhone
        String[] primaryConcerns
    }

    Therapist ||--o{ AvailabilitySlot : "manages"
    Therapist ||--o{ SessionFeedback : "receives"
    AvailabilitySlot ||--o{ Appointment : "fills"
    Patient ||--o{ Appointment : "books"
    Appointment ||--o{ Message : "contains"
    Appointment ||--o| SessionFeedback : "rated by"

    Appointment {
        UUID id PK
        UUID patientId FK
        UUID therapistId FK
        UUID slotId FK
        DateTime scheduledAt
        Int duration
        AppointmentStatus status "PENDING | CONFIRMED | COMPLETED | CANCELLED | NO_SHOW"
        ConsultationMode mode "ONLINE | IN_CLINIC"
        String videoRoomId UK
        String patientNotes
        String therapistNotes
        PaymentStatus paymentStatus "UNPAID | PENDING | PAID | REFUNDED"
        String paymentId
        Float amountPaid
        DateTime paidAt
    }

    AvailabilitySlot {
        UUID id PK
        UUID therapistId FK
        Int dayOfWeek "0-6"
        String startTime "HH:mm"
        String endTime "HH:mm"
        ConsultationMode mode "ONLINE | IN_CLINIC"
        Boolean isActive
    }

    SessionFeedback {
        UUID id PK
        UUID appointmentId FK UK
        UUID therapistId FK
        Int rating "1-5"
        String comment
        Boolean isPublic
        DateTime createdAt
    }

    Notification {
        UUID id PK
        UUID userId FK
        NotificationType type
        String title
        String body
        Boolean isRead
        Json metadata
        DateTime createdAt
    }

    Message {
        UUID id PK
        UUID appointmentId FK
        UUID senderId FK
        String content
        Boolean isRead "Default: false"
        DateTime createdAt
    }

    Therapist {
        UUID id PK
        UUID userId FK UK
        String firstName
        String lastName
        String bio
        String qualifications
        String[] specialities
        String[] languages
        Int yearsOfExperience
        String videoUrl
        Float hourlyRate
        String clinicAddress
        String profileImageUrl
        Boolean isVerified
        String rejectionReason
        Json pendingFields
    }
```

### Key Design Decisions

- **1:1 Role Profiles**: Each `User` has exactly one profile (`Patient`, `Therapist`, or `Admin`). This is enforced by unique constraints on `userId`.
- **UUID Primary Keys**: All IDs use `gen_random_uuid()` and match Supabase's `auth.users.id` format.
- **Clinical Documentation**: Patient intake forms pre-fill `Patient` columns, while `Appointment` holds private `therapistNotes` per session.
- **Dual Consultation Modes**: `ConsultationMode` enum (`ONLINE | IN_CLINIC`) on both `AvailabilitySlot` and `Appointment`. Composite unique constraint allows the same time slot as both online and in-clinic.
- **Payment Lifecycle**: `PaymentStatus` enum (`UNPAID | PENDING | PAID | REFUNDED`) on `Appointment` with Razorpay `paymentId` for traceability.
- **Feedback System**: `SessionFeedback` is 1:1 with `Appointment` (unique constraint), denormalized `therapistId` for fast aggregate rating queries.
- **Notification Types**: `NotificationType` enum covers: `BOOKING_CONFIRMED`, `BOOKING_CANCELLED`, `SESSION_COMPLETED`, `PAYMENT_SUCCESS`, `THERAPIST_APPROVED`, `NEW_MESSAGE`, `FEEDBACK_REQUEST`, `GENERAL`.

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
| Forgot Password | `/forgot` | Password reset email request |
| Update Password | `/update-password` | New password entry after reset |
| Dashboard | `/dashboard` | Redirects to `/dashboard/discover` |
| Discover | `/dashboard/discover` | Browse therapist marketplace (Live API) |
| Therapist Profile | `/dashboard/therapist/[id]` | Detailed therapist view with slot selection |
| Book Session | `/dashboard/sessions/book/[id]` | Slot selection + Razorpay payment flow |
| My Sessions | `/dashboard/sessions` | Upcoming/past appointments + feedback buttons |
| My Messages | `/dashboard/messages` | Transcripts of past session chats |
| Account | `/dashboard/account` | Profile, settings, and sign-out |
| Intake Form | `/dashboard/intake` | Multi-step clinical pre-session data |

### 6.2 Therapist App (`:3001`)

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Provider-focused marketing page |
| Login | `/login` | Professional login |
| Signup | `/signup` | Application form → creates auth user + Therapist profile |
| Forgot Password | `/forgot` | Password reset email request |
| Update Password | `/update-password` | New password entry after reset |
| Dashboard | `/dashboard` | Protected provider workspace |
| Profile | `/dashboard/profile` | Edit bio, specialities, hourly rate, profile image |
| Availability | `/dashboard/availability` | Slot management (Online + In-Clinic modes) |
| Appointments | `/dashboard/appointments` | Clinical Workstation (Session Details, Intake, Notes) |
| Patient Roster | `/dashboard/patients` | Deduped CRM with session count & interaction history |
| Message Archive| `/dashboard/messages` | Secure transcripts of past session chats |
| Account | `/dashboard/account` | Profile, settings, and sign-out |
| Session Room | `/dashboard/sessions/[id]/call` | Professional video & chat workspace |

### 6.3 Admin Panel (`:3002`)

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Admin-only terminal login |
| Overview | `/dashboard` | Platform stats: total users, patients, therapists, pending |
| Account | `/dashboard/account` | Profile and global admin settings |
| Appointments | `/dashboard/appointments` | Platform-wide session oversight |
| Financials | `/dashboard/financials` | Revenue per therapist, payment tracking |
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
6. **Fixed Bottom Dock**: Mobile navigation uses a fixed bottom bar with rounded top corners and notification badges.
7. **Clinical Workstations**: The therapist portal treats data displays as full "workstations" (expandable table rows replacing older modal patterns).
8. **Breathing Loading Animation**: Calming "breathing in/out" animation for all loading states, improving perceived performance.
9. **Error Recovery UX**: Branded error boundaries with retry capability, matching the botanical design language.

---

## 10. Environment Variables

Each app requires a `.env.local` file in its root:

### Patient App
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxx
NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id
NEXT_PUBLIC_API_URL=http://localhost:5000    # Backend API base URL
```

### Therapist App
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxx
NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id
NEXT_PUBLIC_API_URL=http://localhost:5000
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...  # For profile creation (bypasses RLS)
```

### Admin Panel
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxx
NEXT_PUBLIC_API_URL=http://localhost:5000
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
MOCK_PAYMENT=true                            # Set to 'true' for local dev (skips Razorpay)
RAZORPAY_KEY_ID=rzp_test_xxxxx               # Required when MOCK_PAYMENT=false
RAZORPAY_KEY_SECRET=your_razorpay_secret      # Required when MOCK_PAYMENT=false
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

---

## 11. Running Locally

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/dethrtrns/blissfulsaas.git
cd blissfulsaas

# 2. Install ALL dependencies (monorepo script)
npm run install-all
# Or manually: npm install && npm install --prefix backend && npm install --prefix patient-app && ...

# 3. Create .env.local files in each app + .env in backend (see §10)

# 4. Start the backend
cd backend && npx prisma migrate deploy && npm run dev  # → http://localhost:5000

# 5. Start everything at once (from root)
npm run dev
# Or start individually in separate terminals:
# cd patient-app && npm run dev        # → http://localhost:3000
# cd therapist-app && npm run dev      # → http://localhost:3001  
# cd admin-panel && npm run dev        # → http://localhost:3002
```

---

## 12. Known Limitations & Future Work

### Current Limitations

| Limitation | Details | Impact |
|-----------|---------|--------|
| **Email Verification** | Supabase email confirmation not enforced | Users access dashboards immediately after signup |
| **Transactional Emails** | No email service (Resend/Postmark) integrated | No booking confirmations, reminders, or cancellation emails |
| **Session Duration Control** | No in-call timer or forced session end | No actual start/end timestamps tracked |
| **Document Sharing** | Chat is text-only | No file/image uploads within sessions |
| **Admin Analytics** | System Activity chart uses hardcoded data | Growth metrics are static placeholders |

### Planned Features (Roadmap)

**✅ Completed**
- [x] **Monorepo Scaffold**: Three Next.js portals + root monorepo scripts
- [x] **NestJS Backend**: REST API with Prisma ORM + rate limiting (`@nestjs/throttler`)
- [x] **Supabase Auth**: Email/password signup with DB triggers
- [x] **Booking System**: Slot-based availability with Online + In-Clinic modes
- [x] **Payment Processing**: Razorpay integration with mock mode for dev
- [x] **Video Consultations**: Agora SDK integration with token security
- [x] **Real-Time Chat**: Full real-time support with polling fallbacks
- [x] **Role Guards**: Layout-level CSR/SSR auth protection
- [x] **Clinical Messaging**: 7-day extended chat window after consultations
- [x] **In-App Notifications**: Real-time notification bell with Supabase Realtime subscription
- [x] **Notification Workspace**: Global unread badges in sidebars with real-time reactive sync
- [x] **Messaging Security**: Hard-block on communication for cancelled appointments
- [x] **Clinical Workstation**: Appointments view with Session Details, Patient Intake Form, and Private Clinical Notes
- [x] **Session Feedback**: Post-session star rating (1–5) + written review system
- [x] **Password Recovery**: `/forgot` + `/update-password` routes in patient-app and therapist-app
- [x] **Admin Panel**: Appointment oversight, financial tracking, therapist verification
- [x] **Profile Image Upload**: Supabase Storage integration for therapist photos
- [x] **Error Boundaries**: `error.tsx` in all three apps with retry capability
- [x] **Breathing Loading Animation**: Calming loading states across all portals

**🔲 Pending (by priority)**
- [ ] **Email Notifications**: Transactional emails via Resend/Postmark
- [ ] **Scheduled Reminders**: 24h/1h pre-session reminders (requires cron or Edge Functions)
- [ ] **Session Timer**: In-call countdown with actual start/end timestamps
- [ ] **Document & Media Sharing**: Chat attachments via Supabase Storage
- [ ] **Therapist Suspension**: Admin suspend/unsuspend toggle (beyond approve/reject)
- [ ] **Public/Institutional Pages**: Schools, Corporate, Universities program pages
- [ ] **Dynamic Pricing Packages**: Multi-session packages per therapist
- [ ] **Comprehensive RLS**: Fine-grained PostgreSQL policies
- [ ] **Email Verification**: Enforce Supabase email confirmation before dashboard access
- [ ] **Live Admin Analytics**: Real analytics charts replacing static data

---

## 13. Pre-Production Optimizations

> These are **not blockers** for feature development. They should be addressed before going live with real patient data.

| # | Optimization | Priority | Current State | Better Implementation |
|---|-------------|----------|---------------|----------------------|
| 1 | **JWT Custom Claims** | Performance | Portals query `public.User` table on every page load | Inject `role` into `auth.users.raw_app_meta_data` at signup |
| 2 | **Prisma RLS Passthrough** | Security | NestJS connects via direct Postgres URL | Implement Prisma Client Extension to inject JWT claims |
| 3 | **Notification Reliability** | Data Integrity | Complex relations causing stale unread counts | Switch from DB-level `groupBy` to Service-level manual aggregation |
| 4 | **PHI Audit Logging** | Compliance | Only basic timestamps exist | Create an immutable `AuditLog` table + triggers |

---

## 14. Audit Findings

> Code audit performed April 10, 2026. Updated May 14, 2026.

### 🔴 Bugs

| # | Bug | File | Impact | Status |
|---|-----|------|--------|-----|
| 1 | **`getSession()` used instead of `getUser()`** | `admin-panel/src/lib/api.ts` | Security issue (JWT forgery) | 🔴 OPEN |

### 🟡 Code Quality Issues

| Issue | Location | Severity | Status |
|-------|----------|----------|--------|
| `(therapist.user as any)?.email` type casting | Admin therapist pages | Low | 🟡 Open |
| `catch (err: any)` pattern | Multiple files | Low | 🟡 Open |
| Dashboard "Wellness Pulse" hardcoded score | `patient-app/dashboard/page.tsx` | Low | 🟡 Known |
| Admin System Activity chart static | `admin-panel/dashboard/page.tsx` | Low | 🟡 Known |
| ~~No loading state on login submit button~~ | ~~Patient + Therapist login pages~~ | ~~Low~~ | ✅ Fixed |
| ~~No error boundaries~~ | ~~All 3 Next.js apps~~ | ~~Low~~ | ✅ Fixed — `error.tsx` added to all apps |

---

## 15. Notification Architecture (Deep Dive)

The platform implements a **dual notification system**: unread message badges + a dedicated in-app notification center.

### In-App Notification System
- **Dedicated `Notification` Model**: Stores typed notifications with metadata (JSON) for deep-linking.
- **`NotificationType` Enum**: `BOOKING_CONFIRMED`, `BOOKING_CANCELLED`, `SESSION_COMPLETED`, `PAYMENT_SUCCESS`, `THERAPIST_APPROVED`, `NEW_MESSAGE`, `FEEDBACK_REQUEST`, `GENERAL`.
- **`NotificationBell` Component**: Header bell icon with animated unread count badge + dropdown panel. Present in both patient and therapist apps.
- **Real-time via Supabase Realtime**: INSERT subscription on `Notification` table filtered by `userId` for instant badge updates.
- **NestJS Module**: `notifications/` with endpoints: `GET /notifications`, `GET /notifications/unread/count`, `PATCH /:id/read`, `PATCH /read-all`, `DELETE /:id`.
- **Cross-service Integration**: `SessionsService`, `PaymentsService`, `FeedbackService`, and `TherapistsService` all inject `NotificationsService` to fire notifications automatically.

### Unread Message Badges
- **Manual Aggregation**: Backend `MessagesService` fetches unread message targets and aggregates counts in-memory (avoids Prisma `groupBy` quirks).
- **Endpoint**: `GET /messages/unread/counts` returns `{ [appointmentId]: count }`.
- **Global Multi-Portal Listening**: `DashboardSidebar` maintains a Supabase Realtime channel for pulsing badges.
- **Auto-Read Logic**: Messages marked as read via `POST /messages/:id/read` triggered automatically when a session is selected.

> **Manual Step Required**: Enable Realtime on the `Notification` table in Supabase Dashboard → Database → Replication → Tables.

---

## 16. Clinical Messaging Policies

The platform enforces strict clinical boundaries to ensure professional conduct and secure communication.

### 16.1 The 7-Day Extended Chat Window
To facilitate follow-up care without requiring additional bookings for minor questions, the clinical chat remains active for **7 days post-consultation**.
- **Logic**: `Chat Active = Now <= (ScheduledAt + Duration) + 7 Days`.
- **UI Feedback**: Both portals display a "Chat Active" pulse or a "Secure Clinical Archive — Read Only" notice based on this window.

### 16.2 Cancellation Blocks
Communication is strictly prohibited for appointments with a `CANCELLED` status.
- **Security**: The backend `sendMessage` operation explicitly rejects requests for cancelled IDs with a `403 Forbidden` error.
- **UI**: The chat input is hidden and replaced with a **Ban** icon and a clinical notice for cancelled sessions.


---

## 17. Deterministic Hydration & Compliance

### 17.1 Hydration Policy
To eliminate React hydration mismatches across different environments:
- **Locale Locking**: All date/time strings are formatted using the `en-US` locale explicitly.
- **Fixed Visual Attributes**: Derived attributes (like random avatar backgrounds) were removed and replaced with deterministic theme colors.
- **Breathing Loading Animation**: Implemented a calming "breathing" animation for all loading states to improve UX and prevent hydration flicker.
- **Component Suppression**: Used `suppressHydrationWarning` exclusively for dynamic time-of-day greetings.

### 17.2 Specialized Privacy Branding
The platform has undergone a full branding scrub to remove "HIPAA" and "Secured" descriptors. These have been replaced with:
- **"Private & Encrypted"**: For clinical data transmission.
- **"Confidential Consultation"**: For the video and messaging environment.
- **AES-256 / TLS 1.3**: Direct technical descriptions used in place of certification claims.

---

## 18. Payment Architecture

The platform implements a **Razorpay-powered payment system** with a mock mode for local development.

### 18.1 Payment Flow

```mermaid
sequenceDiagram
    actor Patient
    participant Frontend as Patient App
    participant Backend as NestJS API
    participant Razorpay as Razorpay API

    Patient->>Frontend: Select slot + click "Book & Pay"
    Frontend->>Backend: POST /payments/create-order
    Backend->>Razorpay: Create Razorpay Order (amount in paise)
    Razorpay-->>Backend: { orderId, amount, currency }
    Backend-->>Frontend: Order details + Razorpay key
    Frontend->>Razorpay: Open Razorpay Checkout modal
    Patient->>Razorpay: Complete payment
    Razorpay-->>Frontend: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
    Frontend->>Backend: POST /payments/verify
    Backend->>Backend: HMAC signature verification
    Backend->>Backend: Atomic $transaction (create Appointment + set PAID)
    Backend->>Backend: Fire notifications (patient + therapist)
    Backend-->>Frontend: Appointment record
```

### 18.2 Mock Mode
When `MOCK_PAYMENT=true`, the backend:
- Returns a fake `MOCK_ORDER_xxx` ID without calling Razorpay.
- Skips HMAC signature verification during `verifyAndBook`.
- Still creates real appointments with `PaymentStatus.PAID`.

### 18.3 Idempotency
The `verifyAndBook` method checks for an existing appointment with the same `paymentId` before creating a new one, preventing double-booking on client retries.

---

## 19. Session Feedback System

The platform includes a post-session feedback system with star ratings and optional written reviews.

### Components
- **Patient UI**: `SessionFeedbackButton.tsx` shows a "Rate Session" CTA on completed appointments. Clicking opens the `FeedbackForm.tsx` modal with 1–5 star rating + optional text review.
- **Backend**: `feedback/` NestJS module with endpoints:
  - `POST /feedback/:appointmentId` — Patient submits rating (1–5) + optional comment
  - `GET /feedback/appointment/:appointmentId` — Get feedback for an appointment
  - `GET /feedback/therapist/:therapistId/stats` — Public aggregate rating stats
  - `GET /feedback/admin/all` — Admin: all feedback
  - `PATCH /feedback/admin/:id/toggle` — Admin: toggle feedback visibility
- **Schema**: `SessionFeedback` model with 1:1 relation to `Appointment`, denormalized `therapistId`, and `isPublic` flag for admin moderation.
- **Integration**: Average ratings displayed on therapist cards in the patient marketplace.

---

*Documentation generated for The Blissful Station platform. Last updated: May 14, 2026.*
