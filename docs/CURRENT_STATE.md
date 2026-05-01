# 📋 The Blissful Station — Current Project State

> Audit Date: May 1, 2026
> Scope Reference: Phase 1 — Hybrid Mental Health Consultation Platform

---

## Architecture Summary

The platform is a **multi-portal monorepo** with the following structure:

| Component | Technology | Port | Status |
|-----------|-----------|------|--------|
| Patient App | Next.js 16 (App Router) | `:3000` | ✅ Active |
| Therapist App | Next.js 16 (App Router) | `:3001` | ✅ Active |
| Admin Panel | Next.js 16 (App Router) | `:3002` | ✅ Active |
| Backend API | NestJS + Prisma 7 | `:5000` | ✅ Active |
| Database | Supabase PostgreSQL | Cloud | ✅ Active |
| Auth | Supabase Auth (ES256) | Cloud | ✅ Active |
| Real-time | Supabase Realtime (WebSockets) | Cloud | ✅ Active |
| Video | Agora RTC SDK | Cloud | ✅ Active |

---

## A. Patient Interface — Current State

### 1. Authentication ✅ DONE
- [x] Secure Email/Password Signup at `/signup`
- [x] Secure Email/Password Login at `/login`
- [x] Role-based access — patients are redirected to `/dashboard`; layout-level guard via `supabase.auth.getUser()`
- [x] Cookie isolation (`sb-patient-auth-token`) prevents session conflicts across portals
- [x] Sign-out via server-side API route (`/auth/signout`)

### 2. Therapist Discovery ✅ DONE
- [x] Live therapist marketplace at `/dashboard/discover` — fetches verified therapists via `GET /therapists/verified`
- [x] Therapist cards display: name, qualifications, languages, years of experience, hourly rate, and real average rating
- [x] **Search is functional** — filters by name, specialty, or bio keywords client-side
- [x] Filter button UI exists (present in DOM)
- [x] **Static "AI Match" removed** — marketplace now shows live data from API
- [ ] **Therapist type classification missing** — no Clinical Psychologist / Psychologist / School Psychologist distinction
- [x] Individual therapist profile page at `/dashboard/therapist/[id]` — detail view with slot selection

### 3. Booking System ✅ DONE (Online & In-Clinic)

**Online Consultation:**
- [x] Slot-based booking flow at `/dashboard/sessions/book/[id]`
- [x] Backend slot conflict detection (prevents double-booking)
- [x] Transactional booking via `POST /sessions/book` inside `$transaction`
- [x] Patient notes field at booking time
- [x] Appointment status lifecycle: `PENDING → CONFIRMED → COMPLETED / CANCELLED`

**In-Clinic Appointment:**
- [x] Consultation mode selection (Online vs. In-Clinic)
- [x] Dynamic slot filtering based on mode
- [x] Clinic address display in summary and session list

**Pricing & Payments:**
- [x] Hourly rate is displayed on therapist cards and profiles
- [ ] **No dynamic pricing packages** — only single hourly rate
- [ ] **No pre-payment flow** — booking is currently free (no payment gateway)

### 4. Patient Intake Form ✅ DONE
- [x] Multi-step intake form at `/dashboard/intake` via `IntakeFormClient.tsx` (15KB component)
- [x] Captures: demographics (name, phone, DOB), primary concerns, reason for seeking, mental health history, current medications, previous therapy, therapy goals, emergency contact
- [x] Saves to `Patient` table via `PATCH /patients/intake`
- [x] `intakeCompleted` boolean flag tracks completion status

### 5. Custom In-Platform Consultation ✅ DONE
- [x] Secure video room at `/dashboard/sessions/[id]/call` via `VideoRoom.tsx`
- [x] Agora RTC SDK integration — no 3rd-party redirection
- [x] Custom UI with no 3rd-party branding
- [x] Server-side Agora token generation via `GET /sessions/:id/token` with participation verification
- [x] Token expiration set to 2 hours
- [x] Video + Audio channel support
- [x] `VideoRoomWrapper.tsx` provides SSR safety boundary
- [ ] **Session duration control** — no timer/countdown or forced session end
- [ ] **Complete session data access** — only `scheduledAt` and `duration` tracked, no actual start/end timestamps
- [ ] **Consultation-Feedback form** — not implemented

### 6. Custom Chat System ✅ DONE
- [x] In-platform communication via `ChatSidebar.tsx` (integrated into video room)
- [x] Real-time delivery via Supabase Realtime WebSocket channels
- [x] Polling fallback for reliability
- [x] Messages tied to specific appointments (`appointmentId` FK)
- [x] 7-day post-consultation extended chat window
- [x] Cancellation block — `403 Forbidden` for cancelled appointments
- [x] "Secure Clinical Archive — Read Only" UI for expired chat windows
- [x] Message History archive at `/dashboard/messages` via `MessageHistoryClient.tsx`
- [ ] **Document & Media sharing** — not implemented (text-only)
- [ ] **No read-pressure design** — not specifically implemented for therapist side (message content is visible in notifications)

### 7. Payment Processing ❌ NOT STARTED
- [ ] No payment gateway integration (Razorpay, Stripe, etc.)
- [ ] No session-based payment model
- [ ] No invoice/receipt generation

### 8. Notifications ✅ DONE
- [x] Real-time in-app notification system with dedicated `Notification` table
- [x] Pulsing notification bell in header with dropdown panel
- [x] Real-time unread message badges in sidebar (`DashboardSidebar.tsx`)
- [x] Global unread counts via `GET /messages/unread/counts`
- [x] Auto-read logic when session is selected
- [ ] **No email confirmations** — no transactional email service
- [ ] **No booking reminders** — no scheduled notification system
- [ ] **No cancellation email updates**

### 9. Patient Dashboard ✅ DONE
- [x] Dashboard home at `/dashboard` — shows welcome message, real upcoming session count, and unread message badges
- [x] Upcoming sessions list with "Join Room" CTA for online sessions
- [x] Past sessions accessible via `/dashboard/sessions`
- [x] Message history via `/dashboard/messages`
- [ ] **Payment history** — not implemented (no payments)
- [ ] **Uploaded documents** — not implemented (no document management)
- [x] "Wellness Pulse" widget exists but displays hardcoded score ("92")

---

## B. Therapist Interface — Current State

### 1. Authentication & Onboarding ✅ DONE
- [x] Separate signup flow at `/signup` with Server Action pattern
- [x] Collects: first name, last name, email, password, specialities
- [x] Creates auth user + `User` record (via trigger) + `Therapist` profile (via Service Role key to bypass RLS)
- [x] Admin approval workflow — `isVerified: false` by default
- [x] **Improved Onboarding**: New therapists redirected to dashboard with prominent "Set Availability" guidance
- [ ] **Credential submission** — no document upload for licenses/certifications (just text fields)

### 2. Profile Management ✅ DONE
- [x] Profile editing at `/dashboard/profile`
- [x] Editable fields: first name, last name, bio, hourly rate, specialities (tag-based input)
- [x] Saves via `PATCH /therapists/profile`
- [x] Video URL field exists in schema (`videoUrl`) and in form code (currently commented out in UI)
- [ ] **"Therapist Introduction" video integration** — YouTube embed UI is commented out, not active
- [x] **Qualifications field** — Fully integrated with specialized rendering on profile cards.
- [x] **Languages & Experience** — Dedicated fields for clinical tenure and multi-lingual support.
- [x] **Quick-Select Tags** — Predefined lists for Specialities and Languages active in Profile Editor.

### 3. Appointment Management ✅ DONE
- [x] Centralized session viewing at `/dashboard/appointments` via `EnhancedAppointmentsList.tsx` (28KB — full Clinical Workstation)
- [x] 3-column expandable layout: Booking list → Session Details → Patient Intake + Clinical Notes
- [x] Status management: Confirm, Cancel, Complete actions via `AppointmentActions.tsx`
- [x] Booking tracking with patient info, scheduled time, status indicators
- [x] Availability management at `/dashboard/availability` — slot creation/deletion by day-of-week and time
- [x] **Separate Online vs Clinic availability** — mode toggle in availability form and grouped list view

### 4. Therapist Dashboard ✅ DONE
- [x] Dashboard home at `/dashboard` — clinical overview with **real-time metrics**
- [x] Practice Insights: Real counts for Total Patients, Sessions Completed, and Average Rating
- [x] View bookings (upcoming + all sessions)
- [x] Manage availability (link to `/dashboard/availability`)
- [x] View assigned patients at `/dashboard/patients` — deduplicated CRM with session count and latest interaction
- [x] Chat interface integrated into video room
- [x] Session history via all sessions endpoint
- [x] Patient profiles viewable in Clinical Workstation (intake data + session notes)
- [x] Notification center — sidebar badge + header pulsing bell with real-time unread counts
- [x] Mobile Floating Dock navigation (`MobileNav.tsx`) with notification badges
- [ ] **Earnings overview** — no financial data displayed (no payment system)

### 5. Clinical Documentation ✅ DONE
- [x] Session-by-session therapist notes via `NotesSidebar.tsx` + `GET/PATCH /sessions/:id/notes`
- [x] Notes stored in `Appointment.therapistNotes` column
- [x] Notes accessible per-session in Clinical Workstation
- [x] Progress tracking possible via the patient roster (sessionCount, latestSession data)
- [x] Internal use only — notes isolated to therapist; patients cannot view `therapistNotes`
- [ ] **Attachments** — not implemented (no file storage integration)

---

## C. Administrative Panel — Current State

### 1. Therapist Verification Workflow ✅ DONE
- [x] Pending therapists list via `GET /therapists/pending` (Admin-only endpoint)
- [x] Approve: `PATCH /therapists/:id/verify` — sets `isVerified = true`
- [x] Reject: `DELETE /therapists/:id` — permanently deletes Therapist record
- [ ] **Suspension capability** — no suspend/unsuspend toggle (only approve or delete)

### 2. Therapist Management 🟡 PARTIAL
- [x] Therapist list at `/dashboard/therapists` — table view of all therapists
- [x] Detail view at `/dashboard/therapists/[id]`
- [x] Verify/Reject actions from the detail page
- [ ] **Featured control** — no toggle to feature/unfeature therapists in the patient marketplace
- [ ] **Profile moderation** — no ability to edit therapist profiles from admin side

### 3. Appointment Oversight 🟡 PARTIAL
- [x] Complete booking visibility from admin panel at `/dashboard/appointments`
- [x] Session reporting with payment and status visibility
- [ ] No feedback review panel (dependent on Feedback Form)

### 4. Financial Tracking ✅ DONE
- [x] Revenue per therapist tracked
- [x] Session tracking (from admin perspective)
- [x] Financial tracking dashboard at `/dashboard/financials`

### Admin Dashboard ✅ DONE (with limitations)
- [x] Overview at `/dashboard` — 4 stat cards (Total Users, Patients, Therapists, Pending Verifications)
- [x] Real counts from Supabase queries
- [x] Pending Approval Queue card with count
- [x] "Launch Review Terminal" CTA button
- [ ] System Activity chart is **hardcoded static data** (not connected to real analytics)
- [ ] Growth metrics "+12% this month" are **hardcoded/fake**

---

## D. Additional Sections (Public-Facing Pages) — Current State

### 1. Mental Health Programs ❌ NOT STARTED
- [ ] No Schools program page
- [ ] No Corporate program page
- [ ] No Universities program page

### 2. Institutional Collaboration Page ❌ NOT STARTED
- [ ] No lead capture for institutional partnerships
- [ ] No B2B contact form

### Public Landing Pages ✅ DONE
- [x] Patient landing page at `/` — hero section, feature gallery, trust section, footer
- [x] Therapist landing page at therapist-app `/` — provider-focused marketing

---

## E. Shared Infrastructure — Current State

### Database Schema ✅ SOLID
```
Models: User, Patient, Therapist, Admin, AvailabilitySlot, Appointment, Message
Enums:  Role (PATIENT/THERAPIST/ADMIN), AppointmentStatus (PENDING/CONFIRMED/COMPLETED/CANCELLED/NO_SHOW)
```
- [x] Full relational schema with FK constraints and cascade deletes
- [x] UUID primary keys matching Supabase's `auth.users.id`
- [x] Composite unique constraints (prevent duplicate slots)
- [x] Performance indexes on `(patientId, scheduledAt)` and `(therapistId, scheduledAt)`

### Backend API ✅ SOLID
| Module | Endpoints | Status |
|--------|-----------|--------|
| **Auth** | JWT validation (ES256 via JWKS), RBAC guard | ✅ |
| **Sessions** | book, upcoming, all, cancel, complete, token, notes | ✅ |
| **Availability** | create, list, delete, getByTherapist | ✅ |
| **Therapists** | pending, verified, profile, update, verify, reject, myPatients | ✅ |
| **Patients** | getIntake, updateIntake | ✅ |
| **Messages** | send, getForAppointment, markRead, unreadCounts | ✅ |

### Design System ✅ PREMIUM
- "Blissful Botanical" design language
- No-Line Architecture, Glassmorphism, Micro-Animations
- Super-rounding (2.5rem–3rem)
- **Breathing Loading Animation**: Calming "breathing in/out" animation for all loading states
- Floating Dock mobile nav (fixed bottom bar)
- Clinical Workstation pattern for data-dense views

---

## Known Bugs (Open)

| # | Bug | File | Status |
|---|-----|------|--------|
| 1 | `getSession()` used instead of `getUser()` | `admin-panel/src/lib/api.ts` | 🔴 Open |
| 2 | Dashboard "Wellness Pulse" hardcoded | `patient-app/dashboard/page.tsx` | 🟡 Known |
| 3 | Admin System Activity chart static | `admin-panel/dashboard/page.tsx` | 🟡 Known |

## F. Compliance & Technical Policies

### 17. Deterministic Hydration
To eliminate React hydration mismatches across different environments:
- **Locale Locking**: All date/time strings are formatted using the `en-US` locale explicitly in `toLocaleDateString` and `toLocaleTimeString`.
- **Fixed Visual Attributes**: Random attributes (like random avatar color generation) have been removed in favor of deterministic mappings.
- **Component Suppression**: Used `suppressHydrationWarning` exclusively for dynamic time-of-day greetings.

### 18. Specialized Privacy Branding
The platform uses specialized descriptors in place of certification claims:
- **"Private & Encrypted"**: For all clinical data transmission.
- **"Confidential Consultation"**: For the video and messaging environment.
- **Standards**: AES-256 (Encryption at rest) and TLS 1.3 (Encryption in transit).
