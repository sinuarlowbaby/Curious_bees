# CuriousBees

CuriousBees is an internal academic collaboration platform for SRM Institute of Science & Technology. It helps faculty and PhD scholars discover collaborators, discuss research ideas, publish opportunities, manage academic events, and use local AI pipelines for event extraction, semantic search, analytics, and Copilot-style assistance.

## Project Snapshot

This repository is an npm-workspaces monorepo with two apps and shared packages:

```text
.
|-- apps/
|   |-- web/          # Next.js App Router frontend
|   `-- api/          # NestJS REST API and background workers
|-- packages/
|   |-- types/        # Shared TypeScript DTOs and app types
|   `-- shared-utils/ # Shared utility helpers
|-- supabase/         # Legacy/manual SQL bootstrap assets
|-- docker-compose.yml
`-- package.json
```

## Stack

### Frontend: `apps/web`

- Next.js 15 App Router with React 19 RC and TypeScript
- Tailwind CSS, Framer Motion, Lucide icons, Recharts, FullCalendar
- Firebase client authentication with Google sign-in
- Firebase Cloud Messaging for browser notifications
- Supabase client for storage/public client-side Supabase operations
- Zustand for client state

### Backend: `apps/api`

- NestJS 10 REST API
- Prisma 5 with PostgreSQL and pgvector-backed embedding fields
- Firebase Admin token verification and role/approval guards
- BullMQ workers backed by Redis
- Gmail API OAuth and unread email ingestion
- Local Ollama AI services:
  - `qwen2.5:7b` for event extraction and Copilot responses
  - `nomic-embed-text` for 768-dimensional semantic embeddings
- Analytics, clustering, observability, search, recommendations, notifications, and workspace modules

## Core Workflows

- Role-aware onboarding for faculty, PhD scholars, and admins
- Scholar approval through supervisors
- Researcher discovery by profile, department, and interests
- Discussion threads with comments and tags
- Research opportunities with collaboration requests
- Shared workspaces with files, milestones, and announcements
- Academic event calendar with review and publishing states
- Gmail ingestion that queues unread emails for AI classification and event extraction
- Semantic event search, related events, personalized recommendations, and trending topics
- Analytics dashboards for event volume, departments, engagement, clusters, and queue/system health
- Streaming Copilot chat over Server-Sent Events using retrieved event context
- Firebase Cloud Messaging device registration and notification preferences

## Prerequisites

- Node.js 18.18 or newer
- npm
- PostgreSQL, either local or hosted through Supabase
- Redis for BullMQ queues
- Ollama for AI extraction, embeddings, semantic search, clustering, and Copilot features
- Firebase project for client auth, Admin SDK verification, and FCM
- Google OAuth credentials if Gmail ingestion is enabled

The included `docker-compose.yml` starts a local PostgreSQL container only. Redis and Ollama must be started separately.

## Environment Variables

The API dynamically looks for `.env` in the current app, parent folders, and `apps/web/.env`. For clarity, keep backend/server secrets in a root `.env` or `apps/api/.env`, and frontend public values in `apps/web/.env.local`.

### API / server

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/srm_curiousbees_db"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/srm_curiousbees_db"

REDIS_HOST="localhost"
REDIS_PORT="6379"
PORT="4000"
ALLOWED_ORIGINS="http://localhost:3000"

FIREBASE_PROJECT_ID="..."
FIREBASE_CLIENT_EMAIL="..."
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

GMAIL_CLIENT_ID="..."
GMAIL_CLIENT_SECRET="..."
GMAIL_REDIRECT_URI="http://localhost:4000/api/events/gmail/callback"
```

`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` are also accepted as fallbacks for the Gmail OAuth variables.

### Web / public client

```bash
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."
NEXT_PUBLIC_FIREBASE_VAPID_KEY="..."

NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

Only `NEXT_PUBLIC_*` variables are exposed to the browser. Do not put service-role Supabase keys or Firebase Admin credentials in the web environment.

## Local Development

Install dependencies:

```bash
npm install
```

Start local PostgreSQL:

```bash
npm run docker:up
```

Start Redis separately, for example:

```bash
redis-server
```

Start Ollama and pull the models used by the API:

```bash
ollama pull qwen2.5:7b
ollama pull nomic-embed-text
```

Prepare the database:

```bash
npm run db:migrate
npm run db:seed
```

Run both apps:

```bash
npm run dev
```

By default:

- Web app: `http://localhost:3000`
- API: `http://localhost:4000`
- API routes: `http://localhost:4000/api/...`

During local development, Firebase auth can be bypassed from the login page with the mock role selector. The API accepts `mock-bypass-token-*` only outside production.

## Useful Scripts

```bash
npm run dev          # Run web and API concurrently
npm run build        # Build all workspaces with build scripts
npm run lint         # Run workspace lint scripts where present
npm run docker:up    # Start local PostgreSQL
npm run docker:down  # Stop local PostgreSQL
npm run db:migrate   # Run Prisma migrate dev in apps/api
npm run db:seed      # Seed sample users, interests, threads, opportunities, and events
```

API-specific scripts:

```bash
npm run dev --workspace=apps/api
npm run build --workspace=apps/api
npm run prisma:generate --workspace=apps/api
npm run prisma:migrate --workspace=apps/api
npm run prisma:seed --workspace=apps/api
```

Web-specific scripts:

```bash
npm run dev --workspace=apps/web
npm run build --workspace=apps/web
npm run start --workspace=apps/web
```

## API Modules

Most API modules are protected by Firebase authentication. Several also require an approved faculty/admin account or an approved scholar account.

| Module | Base path | Purpose |
| --- | --- | --- |
| Auth | `/api/auth` | Current authenticated user |
| Users | `/api/users` | Profiles, collaborators, interests, approvals, roles, audit logs |
| Threads | `/api/threads` | Research discussion threads |
| Comments | `/api/comments` | Thread comments |
| Opportunities | `/api/opportunities` | Research opportunities and collaboration requests |
| Events | `/api/events` | Calendar events, review queue, status changes, related events |
| Gmail ingestion | `/api/events/gmail` | Gmail OAuth, sync, mock email queueing |
| Notifications | `/api/notifications` | FCM device registration and preferences |
| Search | `/api/search` | Semantic search, recommendations, trending events |
| Analytics | `/api/analytics` | Overview, trends, clusters, engagement, observability, CSV export |
| Copilot | `/api/copilot` | Chat sessions and streaming SSE responses |
| Workspaces | `/api/workspaces` | Workspace files, milestones, and announcements |

## Database Notes

The current backend data model lives in `apps/api/prisma/schema.prisma`. It includes users, roles, profiles, interests, threads, comments, opportunities, collaboration requests, events, notification logs, AI processing logs, embeddings, analytics, Copilot sessions, workspaces, and audit logs.

If you use Supabase PostgreSQL, enable the `vector` extension before relying on embedding-backed features. The `supabase/schema.sql` file is an older manual bootstrap script and does not fully match the current Prisma schema.

## Deployment Notes

Both apps include Vercel configuration files. Before deploying the web app, update the API rewrite in `apps/web/next.config.js`; it currently routes `/api/*` to `http://localhost:4000` in all environments.

Production deployments need real Firebase Admin credentials, Firebase web config, database URLs, Redis, and an available Ollama-compatible model host or replacement AI service. Keep the mock auth bypass disabled by running with `NODE_ENV=production`.
