# CuriousBees

CuriousBees is an AI-powered Academic Collaboration Platform designed for modern university research ecosystems. It facilitates seamless collaboration, progress tracking, and administrative oversight between Research Scholars, Supervisors, and Institutional Admins.

## Architecture Diagram

```text
    +-------------------+       +-------------------+       +-------------------+
    |   User Browser    |       |   Mobile Native   |       |  External APIs    |
    |  (Next.js App)    |<----->|  (Future Scope)   |       | (Semantic Search) |
    +-------------------+       +-------------------+       +-------------------+
             |                            |                           |
             |  HTTPS / WSS (WebSockets)  |                           |
             v                            v                           |
    +---------------------------------------------------+             |
    |                  CuriousBees API                  |<------------+
    |             (NestJS + Prisma + BullMQ)            |
    +---------------------------------------------------+
             |                   |                  |
             v                   v                  v
    +----------------+  +----------------+  +-------------------+
    |  PostgreSQL    |  |     Redis      |  |   Firebase Auth   |
    |   (Supabase)   |  | (Message Queue)|  |       & FCM       |
    +----------------+  +----------------+  +-------------------+
```

## Folder Structure (Monorepo)

```text
/
├── apps/
│   ├── web/                # Next.js Frontend Application
│   └── api/                # NestJS Backend API
├── packages/
│   ├── types/              # Shared TypeScript definitions
│   ├── shared-utils/       # Shared utility functions
│   ├── ui/                 # Shared React/Tailwind UI components
│   ├── constants/          # Shared system constants
│   └── config/             # Shared ESLint/Prettier configurations
├── docs/                   # Extensive System Documentation
│   ├── architecture/       # Architecture breakdowns
│   ├── deployment/         # Deployment strategies (Vercel, Render)
│   ├── database/           # Database schema & design
│   ├── authentication/     # Auth flows
│   └── workflows/          # Role-based workflows
├── scripts/                # Utility and automation scripts
└── .github/workflows/      # CI/CD pipelines
```

## Tech Stack

**Frontend:**
- Next.js (App Router)
- React & Tailwind CSS
- TypeScript
- Firebase (Client Auth)
- Zustand (State Management)

**Backend:**
- NestJS
- Prisma ORM
- BullMQ (Job Queues)
- Firebase Admin SDK

**Infrastructure:**
- Database: PostgreSQL (managed by Supabase)
- Queues/Cache: Redis
- Authentication: Firebase Google Auth
- Push Notifications: Firebase Cloud Messaging (FCM)
- Hosting: Vercel (Frontend), Render/Docker (Backend)

## Core Flows

### Authentication Flow
We use a secure hybrid authentication model:
1. Client authenticates directly via Firebase Google SSO.
2. Client sends the Firebase JWT to the NestJS Backend.
3. Backend validates the JWT, syncs the user profile with Supabase, and returns role-based routing instructions.
4. Edge middleware protects routes using role cookies.

### Role Flow
- **RESEARCH_SCHOLAR**: Standard users who must be approved by a supervisor.
- **RESEARCH_SUPERVISOR**: Faculty guides who manage scholars and approve requests.
- **INSTITUTION_ADMIN**: Global administrators with analytical oversight.

## Development Commands

Run the entire stack locally:
```bash
npm run dev
```
*(This concurrently starts both `apps/web` on port 3000 and `apps/api` on port 4000).*

Manage Database:
```bash
npm run db:migrate  # Push schema changes
npm run db:seed     # Seed initial data
```

## Deployment Commands

**Frontend (Vercel):**
```bash
vercel deploy --prod
```

**Backend (Docker):**
```bash
docker compose up -d --build
```

## Environment Setup
Copy `.env.example` to `.env` in both `apps/web` and `apps/api` and populate the necessary Firebase, Supabase, and Redis credentials.

## Contribution Guidelines
Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines on how to contribute to this repository.
