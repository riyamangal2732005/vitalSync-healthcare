# prodesk-capstone-vitalsync
A professional healthcare dashboard for patient management and appointment scheduling.

# VitalSync | Enterprise Healthcare Patient Dashboard

## 1. Project Overview
VitalSync is a specialized hospital management interface designed for the "ProDesk Capstone." The goal is to provide a seamless experience for patients to track their medical journey and for doctors to manage their daily schedules.

## 2. Track & Tech Stack
- **Track:** Frontend Intern
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand (Global Store)
- **Component Library:** Lucide React (Icons) & Radix UI / Shadcn

## 3. Core Features
### Phase 1: Patient Experience
- **Personalized Dashboard:** A high-level view of upcoming appointments and health vitals.
- **Medical History Timeline:** A vertical scroll showing past visits, diagnoses, and test results.
- **Prescription Viewer:** A clean list of current medications with dosage instructions.

### Phase 2: Scheduling & Management
- **Doctor Availability:** Real-time lookup for available time slots.
- **Appointment Booking:** A multi-step form to book consultations.
- **Role-Based Access:** Different views for "Doctor" vs. "Patient" users.

## 4. Proposed State Structure (Zustand)
We will manage the following global slices:
- `authStore`: Handles user login state and roles.
- `appointmentDataStore`: Manages the list of booked and pending visits.
- `patientRecordStore`: Stores the medical records currently being viewed.

## 5. UI/UX Plan
- **Primary Color:** Medical Blue (#0052FF)
- **Secondary Color:** Slate Gray (#64748B) for text clarity.
- **Typography:** Inter or Geist Sans for a modern, tech-forward feel.
