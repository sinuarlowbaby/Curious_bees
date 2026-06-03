<h1 align="center">
  <br/>
  🔬 CuriousBees
  <br/>
</h1>

<h3 align="center">AI-Powered Academic Collaboration Platform for SRM Institute of Science & Technology</h3>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" />
  <img alt="NestJS" src="https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs" />
  <img alt="Gemini AI" src="https://img.shields.io/badge/Gemini-2.5_Flash-8E75B2?style=for-the-badge&logo=google" />
  <img alt="BullMQ" src="https://img.shields.io/badge/BullMQ-Queue-FF4081?style=for-the-badge" />
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase" />
  <img alt="Firebase" src="https://img.shields.io/badge/Firebase-Cloud_Messaging-FFCA28?style=for-the-badge&logo=firebase" />
</p>

---

## 📖 Overview

**CuriousBees** is an internal academic collaboration platform for SRM IST faculty and PhD scholars. It centralizes research collaboration in one place with:
- researcher discovery,
- discussion threads,
- research opportunity listings,
- AI-powered event ingestion from university email,
- and smart, interest-based notifications.

---

## 🧩 Tech Stack

### Frontend (`apps/web`)
- **Next.js 15** with App Router and React
- **TypeScript**
- **Tailwind CSS** for styling
- **Auth.js v5** for Google OAuth sign-in
- **Firebase Cloud Messaging** for browser/mobile notifications
- **Zustand** for application state management
- **FullCalendar** for event calendar display

### Backend (`apps/api`)
- **NestJS 10** REST API
- **Prisma 5** ORM
- **BullMQ** + **Redis** for queueing and background jobs
- **Google Gemini 2.5 Flash** for AI email parsing and event extraction
- **Gmail API** for email ingestion
- **Firebase Admin SDK** for push notifications
- **Supabase / PostgreSQL** for the primary database

### Infrastructure
- **Monorepo** with npm workspaces
- **Vercel** deployment for frontend and API
- **Supabase** for hosted PostgreSQL and data services
- **Redis** for BullMQ job queues

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Event Ingestion** | Parses university emails to extract event details and auto-populates the calendar. |
| 🔔 **Smart Notifications** | Sends notifications to users based on their research interests. |
| 🔐 **Google SSO** | Sign-in is restricted to approved `@srmist.edu.in` accounts. |
| 👥 **Researcher Directory** | Find faculty and PhD scholars by department and research interests. |
| 💬 **Discussion Threads** | Publish posts, tag topics, and comment in community discussions. |
| 📋 **Opportunities Board** | Post research opportunities and let scholars apply by domain. |
| 📅 **Events Calendar** | View AI-ingested academic events, seminars, and workshops. |

---

## 🏗️ Project Structure

```
CuriousBees/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── types/        # Shared TypeScript types
│   └── shared-utils/ # Shared utilities
└── package.json      # Root monorepo config
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Redis running locally (for BullMQ)
- Supabase/PostgreSQL credentials
- Google OAuth credentials
- Firebase config for FCM

### Install dependencies
```bash
npm install
```

### Run in development
```bash
npm run dev
```

This starts both frontend and backend locally.

---

## 📌 Notes
- The AI pipeline is designed to safely ingest events from the university mailbox and prevent duplicate event creation.
- The platform is built for SRM IST internal users and is intended for academic research collaboration.

---

<p align="center">Built for the SRM IST research community.</p>
