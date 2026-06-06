# CuriousBees V2 — Feature Gap Analysis Report

This document maps all frontend pages and API modules, auditing what is fully functional, partially implemented, mocked, or missing.

---

## 🧭 Page Audit Matrix

| Route | View Description | Status | Data Layer | Notes / Gaps |
| :--- | :--- | :---: | :--- | :--- |
| `/` | Landing Portal | `WORKING` | Static | Premium animated marketing landing page. |
| `/login` | SSO / Authenticator | `WORKING` | Mocked Bypass | Uses local storage role bypass switcher. |
| `/dashboard` | User Hub | `WORKING` | Dynamic DB | Dynamic stats, calendar, active workspaces list. |
| `/workspace` | Collaboration Index | `WORKING` | Dynamic DB | Lists active sandboxes and project cards. |
| `/workspace/[id]` | Sandbox Workspace | `WORKING` | Dynamic DB | Real-time file uploads list, milestones toggle, announcement board. |
| `/opportunities` | Vacancies Board | `WORKING` | Dynamic DB | View vacancies. Supervisors post; scholars apply. |
| `/threads` | Research Forum | `WORKING` | Dynamic DB | List research topics and author cards. |
| `/threads/[id]` | Thread Details | `WORKING` | Dynamic DB | Read full thread and submit comments in real-time. |
| `/reports` | Progress Logs | `WORKING` | Dynamic DB | Scholars log milestones. Supervisors grade. |
| `/publications` | Publications registry | `WORKING` | Dynamic DB | View logged journals, books, and DOIs. |
| `/profile` | Profile Settings | `WORKING` | Dynamic DB | Update user bio, department, and research interests. |
| `/my-scholars` | supervisor Scholar list | `WORKING` | Dynamic DB | Roster of assigned scholars. |
| `/admin/dashboard`| Admin Telemetry Hub | `WORKING` | Dynamic DB | Access admin modules and analytics graphs. |
| `/admin/users` | Profile Monitor | `WORKING` | Dynamic DB | Manage user accounts, role approvals, and status. |
| `/admin/departments`| Department Config | `WORKING` | Dynamic DB | List and add new SRMIST department options. |
| `/admin/analytics`| Citation Reports | `WORKING` | Dynamic DB | Chart analytics for SRM departments. |

---

## 🔍 Feature Implementation Breakdown

### 1. Fully Working Modules (`WORKING`)
* **Real-time Discussions (Threads & Comments)**: Fully connected to Prisma DB. Creating topics and submitting comments works instantly.
* **Workspace Management**: Uploading mock files, adding milestones, and broadcasting team notices are persisted and synced to the database.
* **Health & Telemetry**: `/api/health`, `/api/system`, and `/api/version` endpoints are active and output live stats.
* **Database Seeding**: The seeding script successfully populates all entities (Scholars, Supervisors, Workspaces, Announcements, Opportunities, etc.).

### 2. Mocked / Bypass Components (`PARTIAL`)
* **Authentication Bypass**: Firebase authentication checks are bypassed via `DEVELOPMENT_MODE=true` environment flags. Users are synced to a local mock profile.
* **Notifications Engine**: BullMQ background dispatchers process jobs locally via Redis alpine queueing. Standard alerts display inside the UI notification bell center.

### 3. Current Feature Gaps & Backlog
* **Authentic SSO integration**: Firebase Google Sign-In needs to be connected when moving away from active feature prototyping.
* **Push Notification Service Worker**: Requires registering client service workers on browsers to allow real desktop push alerts.
