<h1 align="center">
  <br/>
  🔬 ReCollab
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

**ReCollab** is an internal academic collaboration platform built exclusively for SRM IST faculty and PhD scholars. It provides a centralised intranet space to discover research peers, share ideas via discussion threads, post and apply for research opportunities, and features a state-of-the-art **AI-Automated Events Ingestion Pipeline** that reads university emails and populates a campus-wide calendar.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Event Ingestion** | Emails sent to `recollab@srmist.edu.in` are parsed by **Gemini 2.5 Flash** to extract event details and auto-populate the campus calendar. |
| 🔔 **Smart Push Notifications** | **Firebase Cloud Messaging (FCM)** pushes instant alerts to researchers whose interests match newly ingested AI events. |
| 🔐 **Google SSO Auth** | Secure sign-in restricted to `@srmist.edu.in` accounts via Auth.js v5. |
| 👥 **Researcher Directory** | Browse faculty and PhD scholars filtered by department and research interests. |
| 💬 **Discussion Threads** | Post, tag, and comment on research topics in a Reddit-style forum. |
| 📋 **Opportunities Board** | Faculty can post research openings; scholars can explore them by domain. |
| 📅 **Events Calendar** | Full-calendar view of academic events, seminars, and conferences managed purely by AI. |

---

## 🏗️ Architecture

ReCollab is a **monorepo** powered by npm workspaces, composed of:

```
ReCollab/
├── apps/
│   ├── web/          # Next.js 15 frontend (App Router)
│   └── api/          # NestJS 10 REST API (BullMQ Workers & AI Pipeline)
├── packages/
│   ├── types/        # Shared TypeScript types
│   └── shared-utils/ # Shared utility functions
└── package.json      # Root monorepo config
```

### Tech Stack

**Frontend (`apps/web`)**
- [Next.js 15](https://nextjs.org/) with App Router & React 19
- [Auth.js v5 (NextAuth)](https://authjs.dev/) — Google OAuth
- [Firebase Cloud Messaging](https://firebase.google.com/) for client-side push notifications
- [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- [Zustand](https://zustand-demo.pmnd.rs/) for state management
- [FullCalendar](https://fullcalendar.io/) for the AI events view

**Backend (`apps/api`)**
- [NestJS 10](https://nestjs.com/) REST API
- [Google Gen AI SDK](https://github.com/google/genai-js) (Gemini 2.5 Flash) for NLP extraction
- [Gmail API](https://developers.google.com/gmail/api) for polling authorized inboxes
- [BullMQ](https://docs.bullmq.io/) & Redis for robust queuing, rate-limiting, and exponential backoffs
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) for targeted push notifications
- [Prisma 5](https://www.prisma.io/) ORM

**Database & Infrastructure**
- **Database:** Hosted on [Supabase](https://supabase.com/) (PostgreSQL 15)
- **Deployment:** [Vercel](https://vercel.com/)
- **Queue/Cache:** Redis

---

## ⚙️ AI Ingestion Pipeline

ReCollab uses a sophisticated background pipeline to automate calendar management:
1. **Cron Polling**: The NestJS backend polls an authorized Gmail account for unread emails.
2. **Heuristic Filtering**: Emails are pre-filtered using RegEx keywords (e.g., "workshop", "seminar") to drop non-events early.
3. **Queueing (BullMQ)**: Valid emails are added to a Redis-backed queue. Rate limiting (4 requests/min) ensures the Gemini free-tier quota is respected.
4. **AI Extraction**: **Gemini 2.5 Flash** reads the email body and outputs a structured JSON object containing the Title, Venue, Date, Time, Category, and Tags.
5. **Validation & De-duplication**: The pipeline cross-references existing events to prevent duplicates.
6. **Smart Broadcasting**: Upon success, **Firebase Admin SDK** pushes a notification directly to the devices of users whose `ResearchInterests` match the event's tags.

---

## 🗄️ Database Schema

```
User              — Faculty / PhD Scholar profiles with Google auth
Thread            — Discussion posts with tags and nested comments
Comment           — Replies on threads
Opportunity       — Research openings posted by faculty
Event             — Academic events extracted via Gemini AI
AIProcessingLog   — Telemetry tracking the state (QUEUED -> AI_PROCESSING -> SUCCESS)
ResearchInterest  — Tag taxonomy linked to users via UserInterest
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **Redis** server running locally (for BullMQ)

### 1. Clone the repository
```bash
git clone https://github.com/matheshwaran-io/SRM_Recollab.git
cd SRM_Recollab
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
The monorepo requires `.env` files in both `apps/web` and `apps/api`. 
Copy the example files and populate your keys:
- **Supabase** Database & Direct URLs
- **Google OAuth** Client IDs
- **Gemini API Key** (`GEMINI_API_KEY`)
- **Firebase** Client & Admin credentials
- **Redis** Host and Port

### 4. Run database migrations
```bash
npm run db:migrate
```

### 5. Start the development servers
Make sure your local Redis server is running, then execute:
```bash
npm run dev
```

This starts both apps concurrently:
- 🌐 **Web** → [http://localhost:3000](http://localhost:3000)
- ⚙️ **API** → [http://localhost:4000](http://localhost:4000)

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start both `web` and `api` in watch mode |
| `npm run build` | Build all workspaces |
| `npm run lint` | Lint all workspaces |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed the database with sample data |

---

## 🤝 Contributing
This is an internal SRM IST project. Contributions from team members are welcome via pull requests to the `main` branch.

---

<p align="center">Built with ❤️ for the SRM IST Research Community</p>
