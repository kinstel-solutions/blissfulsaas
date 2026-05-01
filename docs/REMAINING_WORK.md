# 🔲 The Blissful Station — Remaining Work (Gap Analysis)

> Audit Date: May 1, 2026
> Scope Reference: Phase 1 — Hybrid Mental Health Consultation Platform

This document maps every feature in the Phase 1 scope that is **not yet implemented or only partially done**. Items are organized by priority tier.

---

## Priority Legend

| Tier | Meaning | Impact |
|------|---------|--------|
| **P0** | Critical — Platform cannot launch without this | Revenue & core UX |
| **P1** | High — Expected at launch, significant user impact | Trust & completeness |
| **P2** | Medium — Important for credibility, can soft-launch without | Polish & compliance |
| **P3** | Low — Nice-to-have for Phase 1, solid Phase 2 candidates | Scale & optimization |

---

## P0 — Critical (Must Have Before Launch)

### 1. Payment Processing 💳
**Scope Ref**: A.7 — Payment Processing

Currently **zero payment infrastructure** exists. Sessions are booked for free.

| Task | Details |
|------|---------|
| **Razorpay / Stripe Integration** | Server-side payment intent creation + frontend checkout |
| **Session-Based Payment Model** | Charge at booking time, not post-session |
| **Pre-Payment Flow** | Block booking confirmation until payment succeeds |
| **Payment Status on Appointment** | Add `paymentStatus` (PENDING/PAID/REFUNDED) and `paymentId` fields to `Appointment` schema |
| **Refund Logic** | Auto-refund or credit on cancellation (business rules TBD) |
| **Invoice / Receipt Generation** | PDF generation (or service like Resend/Razorpay receipts) |
| **Payment History (Patient)** | New section in patient dashboard showing payment records |

**Schema Changes Required:**
```prisma
model Appointment {
  // ... existing fields
  paymentStatus  PaymentStatus @default(UNPAID)
  paymentId      String?       // Razorpay/Stripe payment ID
  amountPaid     Float?
  paidAt         DateTime?
}

enum PaymentStatus {
  UNPAID
  PENDING
  PAID
  REFUNDED
}
```

**Backend Work:**
- New `payments` NestJS module (controller + service)
- Webhook handler for payment confirmations
- Link payment → appointment lifecycle

---

### 2. In-App Notifications 🔔
**Scope Ref**: A.8 — Notifications
**Status**: COMPLETED (April 28, 2026)

Email notifications replaced with a real-time in-app notification system using Supabase Realtime + a dedicated `Notification` table.

| Task | Details | Status |
|------|---------|--------|
| **`Notification` Prisma Model** | userId, type (enum), title, body, isRead, metadata (JSON), indexes | ✅ Done |
| **NestJS `notifications` module** | `GET /notifications`, `GET /notifications/unread/count`, `PATCH /:id/read`, `PATCH /read-all`, `DELETE /:id` | ✅ Done |
| **Booking Confirmation Notification** | Sent to patient + therapist on session book or payment verify | ✅ Done |
| **Cancellation Notification** | Notifies the other party when either side cancels | ✅ Done |
| **Session Completed Notification** | Patient receives notification when therapist marks complete | ✅ Done |
| **Payment Success Notification** | Patient receives ₹ amount + appointment details on payment | ✅ Done |
| **Therapist Approval Notification** | Fires `THERAPIST_APPROVED` when admin approves application | ✅ Done |
| **`NotificationBell` UI Component** | Bell icon in both dashboard headers, animated badge, dropdown panel | ✅ Done |
| **Real-time badge via Supabase** | INSERT subscription on `Notification` table filters by `userId` | ✅ Done |
| **Mark as read / mark all read** | Per-notification and bulk read actions in dropdown | ✅ Done |
| **Email Notifications** | Requires Resend/Postmark + real emails. Deferred until post-launch. | ❌ Deferred |
| **Scheduled Reminders (24h/1h)** | Requires cron or Supabase Edge Functions. Phase 2. | ❌ Phase 2 |

> [!IMPORTANT]
> **One manual step required**: Enable Realtime on the `Notification` table in the Supabase Dashboard.
> Go to **Database → Replication → Tables** and toggle **Notification** to ON.
> Without this, the live badge update won't work (initial fetch still works).

**Backend Work:**
- `notifications` NestJS module at `backend/src/notifications/`
- `NotificationType` enum: BOOKING_CONFIRMED, BOOKING_CANCELLED, SESSION_COMPLETED, PAYMENT_SUCCESS, THERAPIST_APPROVED, NEW_MESSAGE, GENERAL
- SessionsService, PaymentsService, TherapistsService all inject NotificationsService

---

### 3. Password Recovery 🔐
**Scope Ref**: A.1 — Authentication (implicit)

Login pages link to `/forgot` but the route doesn't exist.

| Task | Details |
|------|---------|
| **Forgot Password Page** | `/forgot` route in patient-app + therapist-app |
| **Reset Password Page** | `/update-password` route to handle reset tokens |
| **Supabase `resetPasswordForEmail`** | Backend integration with Supabase Auth |
| **Email Template** | Password reset email with secure link |

---

## P1 — High Priority (Expected at Launch)

### 4. Admin Panel — Appointment Oversight 📊 ✅
**Status**: COMPLETED (April 20, 2026)

| Task | Details |
|------|---------|
| **Appointment List Page** | Added `/dashboard/appointments` in admin-panel |
| **Complete Booking Visibility** | Table shows patient name, therapist name, date, status, payment |
| **Backend Work** | Added `GET /sessions/admin/all` |
| **Feedback Review Panel** | *Deferred pending Consultation Feedback Form (P2.11)* |

---

### 5. Admin Panel — Financial Tracking 💰 ✅
**Status**: COMPLETED (April 20, 2026)

| Task | Details |
|------|---------|
| **Revenue Per Therapist** | Displayed in `/dashboard/financials` |
| **Session Tracking Dashboard** | Total sessions, completion rate, cancellation rate |
| **Backend Work** | Added `GET /sessions/admin/stats` |

---

### 6. Therapist Discovery — Functional Search & Filters 🔍 007
**Scope Ref**: A.2 — Therapist Discovery

Search bar and filter buttons exist in the UI but are non-functional.

| Task | Details |
|------|---------|
| **Search Implementation** | Functional: Filter by name, speciality, or bio keyword | ✅ Done |
| **Category-Based Filtering** | Pending: Anxiety, Depression, Trauma, etc. | 🟡 Partial |
| **Featured Therapist System** | Pending: Admin-controlled `isFeatured` flag | ❌ Pending |
| **Remove Static "AI Match" Section** | Completed: Marketplace now shows real data | ✅ Done |

**Schema Changes Required:**
```prisma
model Therapist {
  // ... existing fields
  therapistType   TherapistType?
  isFeatured      Boolean @default(false)
}

enum TherapistType {
  CLINICAL_PSYCHOLOGIST
  PSYCHOLOGIST
  SCHOOL_PSYCHOLOGIST
  COUNSELOR
}
```

---

### 7. In-Clinic Booking Mode 🏥 ✅
**Status**: COMPLETED (April 20, 2026)

| Task | Details |
|------|---------|
| **Consultation Mode Field** | Added `mode` to Appointment and AvailabilitySlot (`ONLINE` or `IN_CLINIC`) |
| **Clinic Slot Management** | Therapist manages separate in-clinic availability |
| **Clinic Booking UI** | Patient selects Online vs In-Clinic at booking time |
| **Location Display** | Show clinic address for in-clinic appointments |

---

## P2 — Medium Priority (Important for Credibility)

### 8. Document & Media Sharing 📎 007
**Scope Ref**: A.6 — Custom Chat System

Chat is text-only. No file upload capability.

| Task | Details |
|------|---------|
| **Supabase Storage Setup** | Create storage buckets for clinical documents |
| **Chat Media Attachments** | Upload images/PDFs within chat sidebar |
| **Patient Document Uploads** | Section in patient dashboard for uploading documents |
| **Therapist Clinical Attachments** | Attach files to session notes |
| **RLS on Storage Buckets** | Ensure only participants can access session files |

---

### 9. Therapist Profile Enhancements ✅
**Status**: COMPLETED (April 15, 2026)

| Task | Details |
|------|---------|
| **Qualifications Field** | Dedicated section for degrees, certifications, licenses |
| **Languages & Experience** | Field-specific tracking for spoken languages and clinical tenure |
| **Quick-Select Marketplace Tags** | Predefined tags for Specialities and Languages added to Profile Editor |
| **YouTube Video Integration** | Uncommented and activated the video URL embed in profile page |
| **Profile Card UI** | Credentials now visible on Discovery, Booking, and Detail cards |

---

### 10. Hydration & Platform Stability 🛠️
**Status**: COMPLETED (April 15, 2026)

| Task | Details |
|------|---------|
| **Locale Lock (en-US)** | Standardized all `toLocaleDateString` and `toLocaleTimeString` calls to prevent hydration mismatches |
| **Greeting Hydration** | Used `suppressHydrationWarning` on time-of-day greetings |
| **Visual Stability** | Fixed UI Avatar backgrounds to prevent random color drift during SSR |
| **HIPAA Cleanup** | Removed outdated HIPAA terminology to align with "Private & Encrypted" branding |

---

### 10. Admin — Therapist Suspension 🚫
**Scope Ref**: C.1 — Therapist Verification Workflow

Only approve/reject exists. No ability to suspend an already-approved therapist.

| Task | Details |
|------|---------|
| **Suspend Endpoint** | `PATCH /therapists/:id/suspend` — sets `isVerified = false` (or new `isSuspended` field) |
| **Unsuspend Endpoint** | `PATCH /therapists/:id/unsuspend` |
| **Admin UI Controls** | Toggle button in therapist detail page |
| **Patient-Side Impact** | Suspended therapists hidden from discovery |

---

### 11. Consultation Feedback Form ⭐ 007
**Scope Ref**: A.5 — Custom In-Platform Consultation

No post-session feedback mechanism exists.

| Task | Details |
|------|---------|
| **Feedback Schema** | New `SessionFeedback` model (rating, comments, appointmentId) |
| **Patient Feedback Form** | Post-session form shown after video call ends or on session completion |
| **Feedback Tied to Appointment** | One feedback per appointment per patient |
| **Admin Feedback Review** | Visible in admin panel (feeds into C.3 — Appointment Oversight) |

---

### 12. No-Read-Pressure Design for Therapists 🔕
**Scope Ref**: A.6 — Custom Chat System

The scope specifically requires that therapist notifications **hide message content and sender information** to prevent read-pressure.

| Task | Details |
|------|---------|
| **Anonymous Notification Badges** | Sidebar shows "1 new message" without revealing content or patient name |
| **Content Hidden Until Opened** | Message preview in notification should be obscured |
| **Therapist Retains Discretion** | Clear UI indication that responding is optional |

---

### 13. Session Duration Control ⏱️
**Scope Ref**: A.5 — Custom In-Platform Consultation

| Task | Details |
|------|---------|
| **Session Timer** | Countdown timer visible during video call |
| **Actual Start/End Timestamps** | Track `actualStartedAt` and `actualEndedAt` on Appointment |
| **Auto-Complete Option** | Optional: warn and auto-complete when time expires |

---

## P3 — Low Priority (Phase 2 Candidates)

### 14. Public-Facing Mental Health Programs Pages 🎓
**Scope Ref**: D.1 — Mental Health Programs

| Task | Details |
|------|---------|
| **Schools Program Page** | Static content page for school partnerships |
| **Corporate Wellness Page** | Content page for corporate mental health programs |
| **Universities Program Page** | Content page for university partnerships |
| **Shared Layout** | Consistent program page template |

---

### 15. Institutional Collaboration Page 🤝
**Scope Ref**: D.2 — Institutional Collaboration Page

| Task | Details |
|------|---------|
| **Lead Capture Form** | Contact form for B2B institutional partnerships |
| **Form Submission Storage** | Save leads to database or send email notification |
| **CTA Integration** | Link from landing pages |

---

### 16. Dynamic Pricing Packages 💎
**Scope Ref**: A.3 — Booking System (Online Consultation)

Currently only single hourly rate. Scope mentions "dynamic pricing packages."

| Task | Details |
|------|---------|
| **Package Schema** | New `PricingPackage` model (name, sessions, price, therapistId) |
| **Package Management UI (Therapist)** | Create/edit packages in profile |
| **Package Selection (Patient)** | Choose package at booking time |

---

### 17. Comprehensive RLS Policies 🔒
**Scope Ref**: Platform Security

Currently RLS is minimal; the backend uses Service Role key for critical operations.

| Task | Details |
|------|---------|
| **Patient RLS** | Patients can only read/write their own records |
| **Therapist RLS** | Therapists can only read their own patients and appointments |
| **Message RLS** | Messages accessible only to appointment participants |
| **Admin RLS** | Admins have full read access |

---

### 18. Email Verification 📬
| Task | Details |
|------|---------|
| **Enforce Supabase Email Confirmation** | Block dashboard access until email is verified |
| **Resend Verification Email** | UI for re-sending confirmation |

---

### 19. Error Boundaries & Loading States 🛡️
| Task | Details |
|------|---------|
| **Global Error Boundaries** | Add `error.tsx` to all 3 Next.js apps |
| **Login Button Loading State** | Disable + spinner on submit |
| **Not Found Pages** | Custom `not-found.tsx` pages |

---

## Summary Scoreboard

| Scope Section | Total Items | Done | Partial | Not Started |
|---------------|:-----------:|:----:|:-------:|:-----------:|
| **A. Patient Interface** | | | | |
| A.1 Authentication | 2 | 2 | 0 | 0 |
| A.2 Therapist Discovery | 4 | 3 | 1 | 0 |
| A.3 Booking System | 5 | 5 | 0 | 0 |
| A.4 Patient Intake Form | 3 | 3 | 0 | 0 |
| A.5 In-Platform Consultation | 7 | 4 | 0 | 3 |
| A.6 Custom Chat System | 6 | 4 | 0 | 2 |
| A.7 Payment Processing | 3 | 0 | 0 | 3 |
| A.8 Notifications | 3 | 3 | 0 | 0 |
| A.9 Patient Dashboard | 5 | 5 | 0 | 0 |
| **Stability & Polish** | 4 | 4 | 0 | 0 |
| **B. Therapist Interface** | | | | |
| B.1 Auth & Onboarding | 4 | 4 | 0 | 0 |
| B.2 Profile Management | 4 | 4 | 0 | 0 |
| B.3 Appointment Management | 5 | 5 | 0 | 0 |
| B.4 Therapist Dashboard | 8 | 8 | 0 | 0 |
| B.5 Clinical Documentation | 4 | 4 | 0 | 0 |
| **C. Administrative Panel** | | | | |
| C.1 Verification Workflow | 3 | 2 | 0 | 1 |
| C.2 Therapist Management | 3 | 1 | 0 | 2 |
| C.3 Appointment Oversight | 3 | 2 | 0 | 1 |
| C.4 Financial Tracking | 3 | 3 | 0 | 0 |
| **D. Public Pages** | | | | |
| D.1 Mental Health Programs | 1 | 0 | 0 | 1 |
| D.2 Institutional Collaboration | 1 | 0 | 0 | 1 |

---

## Estimated Effort Breakdown

| Priority | Item Count | Rough Estimate |
|----------|:----------:|:--------------:|
| **P0 — Critical** | 3 features | 3–4 weeks |
| **P1 — High** | 3 features | 2–3 weeks |
| **P2 — Medium** | 6 features | 3–4 weeks |
| **P3 — Low** | 6 features | 2–3 weeks |
| **Total** | **18 features** | **~10–14 weeks** |

> [!IMPORTANT]
> P0 items (Payments, Email, Password Recovery) are **launch blockers**. No real sessions can be monetized until the payment pipeline is complete.

> [!TIP]
> P1 items (Admin Analytics, Search/Filters, In-Clinic Mode) define whether the platform feels "complete" to users. These should follow immediately after P0.

---

*Generated for The Blissful Station platform. May 1, 2026.*
