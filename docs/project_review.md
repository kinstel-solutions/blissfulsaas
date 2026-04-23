# BlissfulSaaS — Project Review

> **Reviewer:** Antigravity AI  
> **Date:** 2026-04-20  
> **Scope:** Full codebase — backend (NestJS), patient-app, therapist-app, admin-panel (Next.js 15)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Backend — Security & Auth](#2-backend--security--auth)
3. [Backend — Business Logic & Services](#3-backend--business-logic--services)
4. [Backend — Database Schema (Prisma)](#4-backend--database-schema-prisma)
5. [Frontend — Patient App](#5-frontend--patient-app)
6. [Frontend — Therapist App](#6-frontend--therapist-app)
7. [Frontend — Admin Panel](#7-frontend--admin-panel)
8. [Cross-Cutting Concerns](#8-cross-cutting-concerns)
9. [Performance](#9-performance)
10. [Missing Features / Gaps](#10-missing-features--gaps)
11. [Priority Action List](#11-priority-action-list)

---

## 1. Executive Summary

The platform is in a solid mid-stage state. Core flows (auth, booking, payments, video, messaging, feedback) are implemented and wired end-to-end. The architecture is sensible — Supabase for auth/realtime, NestJS for business logic, Prisma for ORM, three separate Next.js portals. However there are meaningful security gaps, missing input validation layers, several UX bugs, and a number of optimization opportunities documented below.

---

## 2. Backend — Security & Auth

### 2.1 Hardcoded Secrets in `.env` Committed to Repo

**File:** `backend/.env`

```
DATABASE_URL="postgresql://postgres.dhkzxjijiqapmdcgqtxs:xmG3YE0NrLOVUpir@..."
AGORA_APP_ID=c27e8ac525d54357a353dbdf70b612fe
AGORA_APP_CERTIFICATE=f2c11fac56c744c28f3dcaf6f26d47f1
```

**Issue (CRITICAL):** Real credentials — including the Supabase database URL (with password), Agora App Certificate, and Supabase URL — are committed directly to the repository in `.env`. This file is **not listed** in the root `.gitignore` (only `*/.env.local` patterns are typically covered for the frontend apps).

**Fix:**
- Add `backend/.env` to `.gitignore` immediately.
- Rotate the Supabase DB password, Agora Certificate, and any other exposed secrets.
- Use a `.env.example` file with placeholder values for documentation.

---

### 2.2 No Global Validation Pipe (No DTO Validation)

**File:** `backend/src/main.ts`

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ ... });
  // ← No ValidationPipe registered here
  await app.listen(port);
}
```

**Issue (HIGH):** NestJS ships with `class-validator` support but no `ValidationPipe` is applied globally. Controllers accept raw `@Body() data: any` (e.g., `therapists.controller.ts` `updateProfile`, `payments.controller.ts`). This means:
- Arbitrary fields can be injected into Prisma `update()` calls (mass assignment risk).
- Rating values, dates, UUIDs are not validated at the transport layer — only partially in service logic.
- No `maxLength` enforcement on free-text fields (bio, notes, etc.).

**Fix:**
```typescript
// main.ts
import { ValidationPipe } from '@nestjs/common';
app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
```
Then replace `any` body types with proper DTOs decorated with `class-validator`.

---

### 2.3 JWT Strategy Uses Env Variable Named `NEXT_PUBLIC_SUPABASE_URL`

**File:** `backend/src/auth/jwt.strategy.ts` line 14

```typescript
const supabaseUrl = config.getOrThrow<string>('NEXT_PUBLIC_SUPABASE_URL');
```

**Issue (LOW):** The `NEXT_PUBLIC_` prefix is a Next.js browser-bundle convention that signals the variable is safe to expose publicly. Using it in the backend is not a bug per se, but it is semantically misleading and could cause confusion. A backend env var should be named `SUPABASE_URL`.

---

### 2.4 CORS Allows a Hardcoded Local IP

**File:** `backend/src/main.ts` lines 13–15

```typescript
'http://192.168.1.34:3000',
'http://192.168.1.34:3001',
'http://192.168.1.34:3002',
```

**Issue (LOW):** A developer's private LAN IP is hardcoded. This will break for any other developer or in any deployment. Move allowed origins to an env variable.

---

### 2.5 `updateProfile` Allows Mass Assignment

**File:** `backend/src/therapists/therapists.service.ts` lines 53–71

```typescript
async updateProfile(userId: string, data: any) {
  return this.prisma.therapist.update({
    where: { id: profile.id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      ...
      clinicAddress: data.clinicAddress,
    },
  });
}
```

**Issue (MEDIUM):** `isVerified` is not in this list, which is good, but `data` is typed as `any`. If someone adds `isVerified` to `data` destructuring by accident in future, a therapist could self-verify. A whitelist DTO is the right fix.

---

### 2.6 Therapist Rejection Deletes Record — No Soft Delete / Audit Trail

**File:** `backend/src/therapists/therapists.service.ts` lines 118–130

```typescript
async reject(id: string) {
  return this.prisma.therapist.delete({ where: { id } });
}
```

**Issue (MEDIUM):** Rejecting a therapist hard-deletes the `Therapist` record and cascades. There's no rejection reason stored, no audit log, and the associated `User` record in Supabase auth is untouched — leaving an orphaned auth account. Consider adding a `rejectionReason` field and `isRejected` flag instead of deleting.

---

### 2.7 No Rate Limiting on Any Endpoint

**Issue (HIGH):** There is no `@nestjs/throttler` or equivalent configured. All endpoints — including auth-related ones like booking, payment verification, and feedback submission — are open to brute-force/flooding.

---

## 3. Backend — Business Logic & Services

### 3.1 `getAdminStats` Loads All Appointments Into Memory

**File:** `backend/src/sessions/sessions.service.ts` lines 169–227

```typescript
const appointments = await this.prisma.appointment.findMany({
  include: { therapist: { include: { user: ... } } }
});
// then iterates in JS
```

**Issue (MEDIUM):** As the platform scales, fetching every appointment in memory to compute aggregates (revenue, completion rate) will become a performance bottleneck and could exhaust memory. This should use Prisma `groupBy` or raw SQL aggregation (`COUNT`, `SUM`).

---

### 3.2 Chat Window Enforcement Has a Bug — `appointment.duration` May Be 0

**File:** `backend/src/messages/messages.service.ts` lines 38–42

```typescript
const sessionEndTime = new Date(appointment.scheduledAt).getTime() + (appointment.duration * 60000);
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
if (Date.now() > sessionEndTime + SEVEN_DAYS_MS) {
  throw new ForbiddenException('Chat window has closed');
}
```

**Issue (LOW):** If `appointment.duration` is `null` or `0` for any reason (e.g., legacy records before default was set), `sessionEndTime` equals `scheduledAt`. This would make the 7-day window start from the session start time rather than end time — a minor but real edge case. Add a null guard: `(appointment.duration ?? 60) * 60000`.

---

### 3.3 `getMyPatients` — Inefficient In-Memory De-duplication

**File:** `backend/src/therapists/therapists.service.ts` lines 132–169

```typescript
const appointments = await this.prisma.appointment.findMany({ where: { therapistId: therapist.id }, include: { patient: ... } });
const patientMap = new Map();
appointments.forEach(appt => { ... });
```

**Issue (LOW):** This fetches all appointments (all time) just to get a unique patient list with session counts. A `groupBy` query or a distinct patient query with aggregation would be far more efficient.

---

### 3.4 `setImmediate` Fire-and-Forget Notifications — Errors Are Silently Swallowed

Throughout `sessions.service.ts`, `payments.service.ts`, `feedback.service.ts`:

```typescript
setImmediate(() => {
  this.notifications.create({ ... }).catch(console.error);
});
```

**Issue (LOW):** `console.error` is the only failure handling. In production, failed notifications should be logged to a structured logging service (or at minimum use NestJS `Logger`). Consider a retry queue or at minimum structured logging.

---

### 3.5 Agora Token: Both Participants Get UID `0` — Potential Ghost User Issue

**File:** `backend/src/sessions/sessions.service.ts` lines 364

```typescript
const uid = 0; // Use 0 to let Agora assign a UID
```

**Issue (MEDIUM):** When `uid=0`, Agora assigns a random UID. But the frontend (`patient-app/src/lib/utils.ts`) uses `uuidToUid(currentUserId)` to generate a deterministic UID — which means the backend token is generated for uid=0 while the frontend joins with a different UID. The token will be **invalid** for that specific UID unless you're using a wildcard token (`uid=0` in the token is actually the wildcard in Agora, so it works). This is technically okay with Agora's wildcard UID behavior but is confusing and should be documented clearly.

---

### 3.6 Payment `verifyAndBook` — No Idempotency Guard After Signature Verification

**File:** `backend/src/payments/payments.service.ts`

**Issue (MEDIUM):** After a successful Razorpay payment, if the frontend retries `/payments/verify` (e.g., network timeout), the second call will fail with "Slot already booked" — but the user sees an error even though payment went through. The `razorpay_payment_id` should be checked for uniqueness before the transaction to return a graceful "already booked" success response rather than an error.

---

### 3.7 `getTherapistRatingStats` — Only Counts `isPublic: true` Reviews But Therapist Dashboard Shows All

**File:** `backend/src/feedback/feedback.service.ts` line 104

```typescript
where: { therapistId, isPublic: true },
```

**Issue (LOW):** The public stats endpoint only returns public reviews (correct for patient-facing). However, the therapist's own dashboard (`/dashboard`) fetches this same endpoint to show the therapist their own rating. A therapist should see all their own reviews (including admin-hidden ones) in their private dashboard for transparency.

---

## 4. Backend — Database Schema (Prisma)

### 4.1 `SessionFeedback` Has No Foreign Key to `Therapist` Model

**File:** `backend/prisma/schema.prisma` lines 152–164

```prisma
model SessionFeedback {
  therapistId   String  @db.Uuid   // denormalised for fast aggregate queries
  // ← No @relation here
}
```

**Issue (MEDIUM):** `therapistId` is denormalized but has no `@relation` decorator, so Prisma won't enforce referential integrity on it. If a therapist is deleted (cascade from `Appointment`), the `SessionFeedback.therapistId` will point to a non-existent record. Add a proper relation or ensure the `onDelete` cascade flows correctly.

---

### 4.2 No Pagination on Any List Query

**Issue (MEDIUM):** `getAll`, `getAllSessions`, `getMessages`, `getNotifications (take: 50)` — most list queries have no cursor-based pagination. The notifications service has a hard `take: 50` cap which helps, but messages and sessions have no limits at all.

---

### 4.3 `AvailabilitySlot` Has No `updatedAt` Tracking on Deactivation

Minor — when a slot is deactivated, the `updatedAt` is updated correctly by Prisma `@updatedAt`. This is fine.

---

### 4.4 `Appointment.videoRoomId` Is `@unique` But Shared Between Participants

**File:** schema.prisma line 132

```prisma
videoRoomId   String  @unique @default(dbgenerated("gen_random_uuid()"))
```

This is correct — one channel per appointment. ✅

---

## 5. Frontend — Patient App

### 5.1 Middleware Does Not Enforce Route Protection

**File:** `patient-app/src/middleware.ts`

```typescript
export async function middleware(request: NextRequest) {
  return await updateSession(request)  // ← only refreshes token, no redirect logic
}
```

**Issue (HIGH):** The middleware only refreshes the Supabase session cookie. It does **not** redirect unauthenticated users away from `/dashboard/**` routes. Auth is enforced inside the layout server component (`dashboard/layout.tsx`), which means:
- A split-second flash of the dashboard can occur before the redirect fires.
- Static/edge-cached responses could theoretically serve protected pages.

**Fix:** Add redirect logic in middleware:
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
  return NextResponse.redirect(new URL('/login', request.url));
}
```

Same issue exists in `therapist-app` and `admin-panel` middlewares.

---

### 5.2 `FeedbackForm.tsx` — BACKEND_URL Is Hardcoded as a Fallback in Component

**File:** `patient-app/src/components/FeedbackForm.tsx` line 26

```typescript
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
```

**Issue (LOW):** This variable is declared but never actually used — the form calls `/api/feedback/${appointmentId}` (a Next.js API route), not the backend directly. Dead code — remove it.

---

### 5.3 `sessions/page.tsx` Line 103 — Template Literal Not Interpolated

**File:** `patient-app/src/app/dashboard/sessions/page.tsx` line 103

```tsx
"{session.feedback.comment}"
```

**Issue (BUG):** This is a plain string `"{session.feedback.comment}"` — not a JSX expression. The curly braces are inside a string literal, so the comment text is never displayed; users see the literal text `{session.feedback.comment}`. 

**Fix:**
```tsx
"{session.feedback.comment}"  // ← WRONG
`"${session.feedback.comment}"`  // or:
<>"{session.feedback.comment}"</>
```

---

### 5.4 `NotificationBell.tsx` — Debug `console.log` Left in Production

**File:** `patient-app/src/components/NotificationBell.tsx` lines 59–62

```typescript
console.log("[NotificationBell] Fetching notifications...");
console.log("[NotificationBell] Received notifications:", data);
```

**Issue (LOW):** Debug logs left in production code. Remove or replace with conditional `process.env.NODE_ENV === 'development'` guards.

---

### 5.5 `DiscoverPage` — Search Bar Is Non-Functional (UI Only)

**File:** `patient-app/src/app/dashboard/discover/page.tsx` lines 52–65

```tsx
<input type="text" placeholder="Search by specialty, name, or concern..." />
<button>Filters</button>
<button>Search</button>
```

**Issue (MEDIUM):** The search input, filters button, and search button have no event handlers. The therapist grid is loaded once on mount and never filtered. This is a significant UX gap for a discovery page.

---

### 5.6 `DiscoverPage` — Hardcoded Fake Rating "4.9"

**File:** `patient-app/src/app/dashboard/discover/page.tsx` line 79

```tsx
<Star className="w-3 h-3 fill-primary" /> 4.9
```

**Issue (MEDIUM):** Every therapist card shows "4.9" as a hardcoded star rating regardless of actual feedback data. The `SessionFeedback` system is fully built — the discover page should call `/feedback/therapist/:id/stats` or include aggregate rating in the `getAllVerified` response.

---

### 5.7 `ChatSidebar.tsx` — Polling + Realtime Both Active Simultaneously

**File:** `patient-app/src/components/ChatSidebar.tsx` lines 74–76

```typescript
// Fallback polling every 5s if Realtime is unreliable
const poll = setInterval(loadHistory, 5000);
```

**Issue (LOW):** The 5-second polling is always active, even when the Supabase realtime channel is `SUBSCRIBED`. This doubles the load unnecessarily. The poll should only activate if `status !== 'connected'`, or be removed entirely in favor of trusting realtime + a single initial fetch.

---

### 5.8 `VideoRoom.tsx` — Shared Agora Client Instance (Module-Level Singleton)

**File:** `patient-app/src/components/VideoRoom.tsx` line 19

```typescript
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
```

**Issue (MEDIUM):** The Agora RTC client is created at module level (singleton). If the component is unmounted and remounted (e.g., navigating away and back), the stale client may not be properly cleaned up, leading to ghost tracks or duplicate subscriptions. The client should be created inside the component or managed with `useMemo`.

---

### 5.9 `api.ts` — `user` Object Fetched But Never Used

**File:** `patient-app/src/lib/api.ts` lines 7–8

```typescript
const { data: { user } } = await supabase.auth.getUser();
const { data: { session } } = await supabase.auth.getSession();
```

**Issue (LOW):** `user` is destructured but never used — only `session` is needed for the token. This makes an extra Supabase call on every authenticated request. Remove the `getUser()` call.

---

## 6. Frontend — Therapist App

### 6.1 `EnhancedAppointmentsList.tsx` — `React` Imported at Bottom of File

**File:** `therapist-app/src/components/EnhancedAppointmentsList.tsx` line 489

```typescript
import React from "react";  // ← line 489, at the BOTTOM
```

**Issue (LOW):** `React` is imported at the very bottom of the file after all JSX usage. While this works due to hoisting in module systems, it's a clear code quality issue and will confuse developers. Move it to line 1.

---

### 6.2 Therapist Dashboard — "Launch Virtual Room" Links to In-Clinic Session

**File:** `therapist-app/src/app/dashboard/page.tsx` lines 53–58

```tsx
{nextSession && (
  <Link href={`/dashboard/sessions/${nextSession.id}/call`}>
    <button>Launch Virtual Room</button>
  </Link>
)}
```

**Issue (MEDIUM):** The "Launch Virtual Room" button appears for any upcoming session, including `IN_CLINIC` mode sessions. A therapist clicking this for an in-clinic appointment would be navigated to the video call page unnecessarily. Add a mode check:
```tsx
{nextSession && nextSession.mode !== 'IN_CLINIC' && (
  <Link href={...}>Launch Virtual Room</Link>
)}
```

---

### 6.3 Therapist Dashboard — "Video Session" Hardcoded in Next Session Card

**File:** `therapist-app/src/app/dashboard/page.tsx` line 101

```tsx
<span className="text-[10px] font-medium text-muted-foreground">• Video Session</span>
```

**Issue (LOW):** This label is hardcoded as "Video Session" and doesn't reflect `IN_CLINIC` mode. Should be dynamic based on `nextSession.mode`.

---

### 6.4 `EnhancedAppointmentsList` — Note Save Has No Input Sanitization / Length Cap

**File:** `therapist-app/src/components/EnhancedAppointmentsList.tsx` — `saveNotes` function

The textarea has no `maxLength` attribute. Combined with the lack of backend `ValidationPipe`, a therapist could theoretically submit extremely large strings to `therapistNotes`. Add `maxLength={5000}` to the textarea and validate on the backend.

---

### 6.5 `PatientDetailPanel` Not Reviewed Yet

Will review in a follow-up pass.

---

## 7. Frontend — Admin Panel

### 7.1 Admin Dashboard — System Activity Chart Uses Hardcoded Fake Data (RESOLVED)

**File:** `admin-panel/src/app/dashboard/page.tsx` lines 71–82

```tsx
{[45, 67, 43, 89, 56, 78, 92, 65, 45, 87, 65, 34, 56, 88].map((height, i) => (
  <div style={{ height: `${height}%` }} />
))}
```

**Issue (MEDIUM):** The "System Activity" bar chart shows completely fabricated data with a fake date range "March 25 → Today". This should either be connected to real data (registration events, appointments over time) or be clearly labelled as a placeholder. Shipping fake analytics to a production admin is a data integrity concern.

---

### 7.2 Admin Dashboard — "Launch Review Terminal" Button Has No Action (RESOLVED)

**File:** `admin-panel/src/app/dashboard/page.tsx` line 119

```tsx
<button className="...">Launch Review Terminal</button>
```

**Issue (LOW):** This button has no `onClick` or `href`. It's a dead UI element.

---

### 7.3 Admin Dashboard — Pending Queue Shows Count But Not Individual Applications (RESOLVED)

The pending queue panel shows only a count badge, not the actual pending therapists. The full list is only in `/dashboard/therapists`. The dashboard widget could be more useful by showing the first 3 pending names with a link to each.

---

### 7.4 Admin Panel — No Financial Data on Dashboard (RESOLVED)

**Issue (MEDIUM):** The financial dashboard lives at `/dashboard/financials` but the main overview page has no financial KPIs (total revenue, sessions completed, etc.). These are already computed in `getAdminStats()` on the backend — they should be surfaced on the main dashboard page.

---

## 8. Cross-Cutting Concerns

### 8.1 No Error Boundaries in Any Frontend App

None of the three Next.js apps define `error.tsx` or `global-error.tsx` files. Any unhandled error in a server component or client component will show a generic Next.js error page instead of a branded, user-friendly recovery screen.

**Fix:** Add `error.tsx` files at the dashboard layout level for each app.

---

### 8.2 No `loading.tsx` Files for Suspense Loading States

Related to 8.1 — no `loading.tsx` files are present for any route segment. Server component data fetching will block render without any loading indicator.

---

### 8.3 Dates Are Rendered Without Timezone Awareness

Throughout all apps, dates are formatted with `new Date(x).toLocaleString()` or `toLocaleDateString()` — these use the **browser's** local timezone. Since `scheduledAt` is stored as UTC in Postgres, a patient in Mumbai (IST) and a therapist in a different timezone could see different times for the same appointment. The system needs explicit timezone handling (store timezone preference, or display in UTC with offset).

---

### 8.4 `NEXT_PUBLIC_SUPABASE_ANON_KEY` Is Actually a Publishable Key

**File:** `backend/.env` line 4

```
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_...
```

The variable name in `.env` doesn't match what the frontend apps use (`NEXT_PUBLIC_SUPABASE_ANON_KEY`). This means the backend `.env` has a key that is never consumed, and the frontend `.env.local` files must have the correctly named key. This is a documentation inconsistency but worth noting.

---

### 8.5 No Structured Logging — All Errors Use `console.error`

The entire backend uses `console.error` / `console.log`. NestJS has a built-in `Logger` service that supports log levels, context tags, and can be swapped for Winston/Pino in production. Replace all raw `console.*` calls with `new Logger(ClassName)`.

---

### 8.6 No Health Check Endpoint

**Issue (LOW):** The backend has no `/health` or `/status` endpoint. This makes it impossible to integrate with load balancers, uptime monitors, or container orchestration (Kubernetes liveness probes).

**Fix:** Add a simple controller:
```typescript
@Get('health')
health() { return { status: 'ok', timestamp: new Date() }; }
```

---

## 9. Performance

### 9.1 `getAllSessions` (Admin) Fetches All Records — No Pagination

The admin appointments page at `/sessions/admin/all` returns every appointment ever created with full relations. This will become extremely slow at scale.

### 9.2 Supabase Realtime Filter on Frontend Is Client-Side Filtered

**File:** `patient-app/src/components/ChatSidebar.tsx` lines 57–61

```typescript
{ event: "INSERT", schema: "public", table: "Message" },
// then filters in the callback:
if (msg.appointmentId !== appointmentId) return;
```

The Supabase realtime subscription has no server-side filter (`filter: \`appointmentId=eq.${appointmentId}\``). Every new message in the system is delivered to every open chat sidebar, which then discards irrelevant ones client-side. This wastes bandwidth.

**Fix:**
```typescript
{ event: "INSERT", schema: "public", table: "Message", filter: `appointmentId=eq.${appointmentId}` }
```

### 9.3 `discover/page.tsx` — No Memoization / Re-render Optimization

The discover page re-renders the entire therapist list on any state change. With 50+ therapists this could cause performance issues. Use `useMemo` for filtering logic once search is implemented.

---

## 10. Missing Features / Gaps

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Search/Filter on Discover page | ❌ UI only, no logic | High priority UX |
| 2 | Real therapist ratings on Discover cards | ❌ Hardcoded 4.9 | API exists, just not called |
| 3 | Middleware route protection | ❌ Layout-only | Security gap |
| 4 | Global `ValidationPipe` + DTOs | ❌ Missing | Security gap |
| 5 | Rate limiting (`@nestjs/throttler`) | ❌ Missing | Security gap |
| 6 | Error boundaries (`error.tsx`) | ❌ Missing | UX gap |
| 7 | Loading states (`loading.tsx`) | ❌ Missing | UX gap |
| 8 | Timezone-aware date display | ❌ Browser-local only | Data accuracy |
| 9 | Admin stats on main dashboard | ❌ Separate page only | UX gap |
| 10 | Health check endpoint | ❌ Missing | DevOps gap |
| 11 | Soft-delete for rejected therapists | ❌ Hard delete | Data/audit gap |
| 12 | Pagination on list endpoints | ❌ Missing | Scalability |
| 13 | Structured logging (NestJS Logger) | ❌ console.* only | Observability |
| 14 | `NO_SHOW` status handling in frontend | ❌ Schema has it, no UI | Functional gap |

---

## 11. Priority Action List

### 🔴 Critical (Fix Before Any Production Deploy)

1. **Rotate all secrets** — the `backend/.env` has real DB credentials, Agora keys committed to the repo. Add it to `.gitignore`, rotate everything.
2. **Add `ValidationPipe` globally** — prevents mass assignment and raw input attacks.
3. **Add middleware route protection** — currently only layout-level, not edge-enforced.

### 🟠 High Priority

4. **Fix the feedback comment bug** (`"{session.feedback.comment}"` literal string in sessions page).
5. **Add rate limiting** with `@nestjs/throttler`.
6. **Fix `getAdminStats` performance** — use DB aggregations instead of in-memory.
7. **Fix Realtime chat subscription filter** — add server-side `filter` to Supabase channel.
8. **Make Discover page search functional** — wire up the existing UI.
9. **Fix "Launch Virtual Room" for in-clinic sessions** — wrong UX for therapists.

### 🟡 Medium Priority

10. **Connect real ratings to Discover page** (API already exists).
11. **Add `error.tsx` and `loading.tsx`** at dashboard route levels.
12. **Add `SessionFeedback → Therapist` relation** in Prisma schema.
13. **Add health check endpoint** to backend.
14. **Remove debug `console.log`** from `NotificationBell.tsx`.
15. **Remove unused `user` fetch** from `api.ts`.
16. **Move Agora client** out of module scope in `VideoRoom.tsx`.
17. **Add therapist soft-delete** (rejection with reason, not hard delete).

### 🟢 Low Priority / Nice to Have

18. Extract CORS origins to env variable.
19. Rename `NEXT_PUBLIC_SUPABASE_URL` to `SUPABASE_URL` in backend env.
20. Fix `React` import at bottom of `EnhancedAppointmentsList.tsx`.
21. Add pagination to all list endpoints.
22. Add timezone-aware date rendering.
23. Replace `console.*` with NestJS `Logger` throughout backend.
24. Add `maxLength` to clinical notes textarea.
25. Disable polling in `ChatSidebar` when realtime is connected.
26. Fix `appointment.duration` null guard in `messages.service.ts`.
27. Add idempotency guard in `payments.service.ts verifyAndBook`.
28. Remove dead `BACKEND_URL` constant in `FeedbackForm.tsx`.
29. Remove hardcoded fake admin chart data or connect to real stats.

---

*Review in progress — additional files may be added as the review continues.*
