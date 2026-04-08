# The Blissful Station - Implementation Plan

## Overview
A multi-role SaaS platform for an online mental health clinic with a patient app, therapist app, admin panel, and a central NestJS API backend.

## Tech Stack
- **Frontends**: Next.js (App Router), Tailwind CSS, Shadcn UI
- **Backend**: NestJS, Prisma
- **Database / Auth**: Supabase (Postgres, Auth, RLS, Storage)
- **External Services**: Agora (Video), Socket.io (Chat), Razorpay (Payments), Resend (Emails), AWS S3 (Session Recordings)
- **Deployment**: Vercel (Frontends), Railway (Backend API)

## Architecture Setup
Since this is a multi-frontend architecture, we'll organize the workspace using a monorepo style (or just related folders):
- `patient-app/` (Next.js)
- `therapist-app/` (Next.js)
- `admin-panel/` (Next.js)
- `backend/` (NestJS)

## Phase 1: Authentication & Database Foundation (Current Focus)
- [ ] Initialize Supabase project (Needs to be created on supabase.com).
- [ ] Initialize the `backend` NestJS API.
- [ ] Initialize Prisma in backend out to Supabase Postgres.
- [ ] Define the Database Schema (Users, Roles, Therapists, Patients).
- [ ] Set up Supabase Auth triggers to automatically create/sync User rows in the public schema on signup.
- [ ] Implement JWT Guards in NestJS to validate multi-role Auth (Patient, Therapist, Admin).
- [ ] Establish Supabase RLS policies for Data Isolation.
- [ ] Scaffold the `patient-app` and implement the Patient Sign Up / Login flow.
- [ ] Scaffold the `therapist-app` and implement Therapist Sign Up / Login flow.
- [ ] Scaffold the `admin-panel` and implement Admin Login + Therapist Approval Workflow.

## Proceeding with Phase 1
We will begin by scaffolding the Next.js apps and NestJS backend projects structure, followed by the Prisma database schema.
