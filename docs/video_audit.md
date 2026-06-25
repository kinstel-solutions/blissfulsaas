# Video Consultation System Audit & Remaining Tasks

**Date:** June 20, 2026  
**Scope:** Video Consultation Implementation (Patient App, Therapist App, Backend)

---

## 1. Overview
An audit of the video consultation system (Agora WebRTC integration) was conducted to ensure alignment with industry best practices, security standards, and smooth user flows. The following highlights the completed security/privacy fixes, newly identified core issues, and the outstanding gaps.

---

## 2. Completed Security & Logic Fixes (Already Implemented) ✅

- **Deterministic UIDs (Prevention of Wildcard Join Vulnerability):**
  - **Issue:** The backend generated Agora tokens using `uid = 0` (wildcard), while the client used a custom numeric hash. Anyone with the token could join as any UID.
  - **Fix:** Enforced matching deterministic UID hashing logic on the backend to match the client.

- **Hardware-Level Privacy Policy (Webcam Light Behavior):**
  - **Issue:** Muting/unmuting local video tracks with `.setMuted()` kept the webcam powered on (causing the camera light to stay on).
  - **Fix:** Switched to `.setEnabled(true/false)` in both Patient and Therapist `VideoRoom.tsx` components, ensuring the webcam hardware is fully powered down and the camera light turns off.

- **Dynamic Token Expiry & Request Restrictions:**
  - **Issue:** Token expiration was hardcoded to 2 hours from token generation.
  - **Fix:** The backend now restricts token requests to 15 minutes before the session starts and dynamically calculates the expiry based on `scheduledAt + duration + buffer` (verified and resolved the `Math.max` override issue).

- **Enhanced Connection State UI & Permissions Error Handling:**
  - **Issue:** Users lacked feedback when microphone or camera permissions were blocked, or when connection drops occurred.
  - **Fix:** Added explicit connection state overlays (connecting, connected, retrying, offline) and user-friendly error banners for mic/camera access failures in `VideoRoom.tsx`.

- **Session Status Validation:**
  - **Issue:** Tokens could be generated for canceled or unconfirmed appointments.
  - **Fix:** Implemented strict backend validation to verify that the appointment is in a valid state (e.g., `CONFIRMED`) before returning an Agora token.

---

## 3. Key Findings & Business Logic Inconsistencies ⚠️

These represent logical gaps in the current implementation that need resolution to prevent degraded user experiences or broken data reporting:

### Point 1: Cron Job "Expired" vs. "Completed" Status Collision
- **Problem:** A backend cron job scans for sessions that have passed their end time and marks them as `EXPIRED`. If a therapist completes a session but forgets to click the "Complete and Close" button immediately, the cron job marks the session as `EXPIRED` instead of `COMPLETED`. This breaks analytics, session accounting, and payout logic.
- **Recommendation:** Track `actualStartedAt` on the session/appointment. If `actualStartedAt` is set, the cron job should not mark the session as `EXPIRED`. Alternatively, require explicit completion/cancellation or distinguish between "No-show" (never started) and "Unfinished" sessions.

### Point 2: Patient Left Stranded in the Room
- **Problem:** When the therapist completes the consultation and clicks "Complete and Close", they are redirected back to the dashboard, and the session status updates to `COMPLETED`. However, the patient remains in the video room indefinitely, seeing a blank screen or their own camera feed.
- **Recommendation:** Implement a real-time listener (e.g., via Supabase Realtime) in the patient's `VideoRoom.tsx` to watch for appointment status changes. When `status === 'COMPLETED'`, auto-redirect the patient to the feedback or dashboard page with a friendly completion message.

---

## 4. Pending Gap Analysis Items (Session Duration Control) 🔲 - done, to be tested

Based on the initial design specifications (`REMAINING_WORK.md`), the following items are still pending implementation:

| Task | Details | Priority |
|---|---|---|

| **Start/End Timestamps** | Add `actualStartedAt` and `actualEndedAt` columns to the database schema and track when participants join or leave. | P2 |
| **Auto-Complete Feature** | Warn participants and optionally auto-complete the session in the backend when the scheduled duration expires. | P2 |
