<h1 align="center">
  <br/>
  🔬 ReCollab
  <br/>
</h1>

<h3 align="center">AI-Powered Academic Collaboration Platform for SRM Institute of Science & Technology</h3>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" />
  <img alt="NestJS" src="https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma" />
  <img alt="Vercel" src="https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel" />
</p>

---

## 📖 Overview

**ReCollab** is an internal academic collaboration platform built exclusively for SRM IST faculty and PhD scholars. It provides a centralised intranet space to discover research peers, share ideas via discussion threads, post and apply for research opportunities, track academic events, and manage researcher profiles — all with Google Workspace SSO.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Google SSO Auth** | Secure sign-in restricted to `@srmist.edu.in` accounts via Auth.js v5 |
| 👥 **Researcher Directory** | Browse faculty and PhD scholars filtered by department and research interests |
| 💬 **Discussion Threads** | Post, tag, and comment on research topics in a Reddit-style forum |
| 📋 **Opportunities Board** | Faculty can post research openings; scholars can explore them by domain |
| 📅 **Events Calendar** | Full-calendar view of academic events, seminars, and conferences |
| 🧑‍💼 **Profile Management** | Manage bio, department, role, and research interest tags |
| 🎉 **Gamification** | Confetti and engagement cues to encourage active participation |

---

## 🏗️ Architecture

ReCollab is a **monorepo** powered by npm workspaces, composed of:

```
ReCollab/
├── apps/
│   ├── web/          # Next.js 15 frontend (App Router)
│   └── api/          # NestJS 10 REST API (serverless-ready)
├── packages/
│   ├── types/        # Shared TypeScript types
│   └── shared-utils/ # Shared utility functions
├── docker-compose.yml
└── package.json      # Root monorepo config
```

### Tech Stack

**Frontend (`apps/web`)**
- [Next.js 15](https://nextjs.org/) with App Router & React 19
- [Auth.js v5 (NextAuth)](https://authjs.dev/) — Google OAuth
- [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/) for animations
- [Zustand](https://zustand-demo.pmnd.rs/) for state management
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) for forms & validation
- [FullCalendar](https://fullcalendar.io/) for the events view
- [Lucide React](https://lucide.dev/) for icons

**Backend (`apps/api`)**
- [NestJS 10](https://nestjs.com/) REST API
- [Prisma 5](https://www.prisma.io/) ORM with PostgreSQL
- Serverless-compatible — dual mode (local HTTP + Vercel handler)
- Modules: `auth`, `users`, `threads`, `comments`, `opportunities`, `events`

**Database**
- PostgreSQL 15 (Docker for local dev, managed DB for production)

**Infrastructure**
- Deployed on [Vercel](https://vercel.com/)
- Docker Compose for local PostgreSQL

---

## 🗄️ Database Schema

```
User          — Faculty / PhD Scholar profiles with Google auth
Thread        — Discussion posts with tags and nested comments
Comment       — Replies on threads
Opportunity   — Research openings posted by faculty
Event         — Academic events on the calendar
ResearchInterest — Tag taxonomy linked to users via UserInterest
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **Docker** (for local PostgreSQL)

### 1. Clone the repository

```bash
git clone https://github.com/matheshwaran-io/SRM_Recollab.git
cd SRM_Recollab
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for session signing |
| `NEXTAUTH_URL` | Base URL of the web app (e.g. `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID from GCP Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret from GCP Console |
| `PORT` | API port (default: `4000`) |

> **Tip:** Your Google OAuth consent screen should be set to **Internal** and restricted to the `@srmist.edu.in` domain.

### 4. Start the database

```bash
npm run docker:up
```

### 5. Run database migrations & seed

```bash
npm run db:migrate
npm run db:seed
```

### 6. Start the development servers

```bash
npm run dev
```

This starts both apps concurrently:
- 🌐 **Web** → [http://localhost:3000](http://localhost:3000)
- ⚙️ **API** → [http://localhost:4000](http://localhost:4000)

---

## 📜 Available Scripts

Run these from the **monorepo root**:

| Script | Description |
|---|---|
| `npm run dev` | Start both `web` and `api` in watch mode |
| `npm run build` | Build all workspaces |
| `npm run lint` | Lint all workspaces |
| `npm run docker:up` | Start local PostgreSQL container |
| `npm run docker:down` | Stop the PostgreSQL container |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed the database with sample data |
| `npm run clean` | Remove all `node_modules` |

---

## ☁️ Deployment

The project is configured for **Vercel** deployment.

- **Web** is deployed as a standard Next.js app.
- **API** is deployed as a serverless NestJS handler — no separate server required.

The API auto-detects whether it is running on Vercel (`VERCEL=1`) or as a local Node process and boots accordingly.

### CORS

The following origins are whitelisted by default:
- `http://localhost:3000`
- `https://srm-recollab.vercel.app`
- `https://recollab.vercel.app`
- Any `*.vercel.app` preview URL
- Custom origins via the `ALLOWED_ORIGINS` environment variable (comma-separated)

---

## 📁 Project Structure

```
apps/
  web/
    src/
      app/
        (portal)/         # Authenticated routes
          dashboard/      # Home dashboard
          threads/        # Discussion forum
          opportunities/  # Research openings board
          researchers/    # Researcher directory
          events/         # Events calendar
          profile/        # User profile
        login/            # Public login page
      components/         # Shared UI components
      store/              # Zustand state stores
  api/
    src/
      auth/               # Auth module
      users/              # Users CRUD
      threads/            # Threads & feed
      comments/           # Thread comments
      opportunities/      # Opportunities CRUD
      events/             # Events CRUD
      prisma/             # Prisma service
    prisma/
      schema.prisma       # Database schema
      seed.ts             # Seed script
packages/
  types/                  # Shared TS type definitions
  shared-utils/           # Shared helper utilities
```

---

## 🤝 Contributing

This is an internal SRM IST project. Contributions from team members are welcome via pull requests to the `main` branch.

1. Fork / branch from `main`
2. Make your changes
3. Run `npm run lint` and ensure no errors
4. Open a pull request with a clear description

---

## 📄 License

This project is private and intended exclusively for use within SRM Institute of Science and Technology. Unauthorized distribution is not permitted.

---

<p align="center">Built with ❤️ for the SRM IST Research Community</p>
