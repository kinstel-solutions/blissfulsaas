# The Blissful Station - Implementation Plan

## Overview
A multi-role SaaS platform for an online mental health clinic with a patient app, therapist app, admin panel, and a central NestJS API backend.

## Tech Stack
- **Frontends**: Next.js 15 (App Router), Tailwind CSS, Shadcn UI
- **Backend**: NestJS, Prisma
- **Database / Auth**: Supabase (Postgres, Auth, RLS, Realtime, Storage)
- **External Services**: Agora (Video), Razorpay (Payments), Resend (Emails)
- **Deployment**: 
  - **Vercel**: Frontends (Patient, Therapist, Admin)
  - **Koyeb**: Backend API (Containerized via Docker)
  - **Oracle Cloud**: Potential future target for "Always Free" VPS hosting.

## Architecture
Monorepo-style structure:
- `patient-app/` (Next.js)
- `therapist-app/` (Next.js)
- `admin-panel/` (Next.js)
- `backend/` (NestJS)

## Current Status: Deployment & Hardening
The core features (Auth, Booking, Video, Chat, Admin Moderation) are implemented. We are currently:
- Standardizing environment variables across all apps.
- Containerizing the backend for portable hosting.
- Setting up the production infrastructure on Vercel/Render.

## Phase 1: Foundation (Completed)
- [x] Initialize Supabase project & Prisma schema.
- [x] Implement multi-role Auth (Patient, Therapist, Admin).
- [x] Scaffold all three frontend portals.
- [x] Implement Therapist Approval Workflow.

## Phase 2: Core Flows (Completed)
- [x] Appointment Booking & Scheduling.
- [x] Real-time Chat (Supabase Realtime).
- [x] Video Consultation (Agora).
- [x] Payments Integration (Razorpay).
- [x] Professional Clinical Workstation for Therapists.

## Phase 3: Production Readiness (Active)
- [ ] Containerize Backend (Dockerfile).
- [ ] Standardize Env Templates (.env.example).
- [ ] Configure Production CORS & Security.
- [ ] Deploy to Vercel/Render.
