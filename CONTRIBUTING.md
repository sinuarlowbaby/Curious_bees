# Contributing to CuriousBees

Thank you for your interest in contributing to CuriousBees! This document provides guidelines for faculty and student contributors to safely and effectively enhance the platform.

## Code of Conduct
Please ensure all communications and code reviews are respectful and constructive, adhering to SRM IST's professional standards.

## Monorepo Architecture
This project is structured as a Monorepo using npm workspaces:
- `apps/web`: Frontend Next.js application
- `apps/api`: Backend NestJS application
- `packages/*`: Shared utilities, types, and UI components

## Getting Started

1. **Clone the repository.**
2. **Install dependencies:** Run `npm install` at the root. This links all workspaces automatically.
3. **Environment Setup:** Copy `.env.example` to `.env` inside `apps/web` and `apps/api`. Request Sandbox Firebase/Supabase credentials from the project lead.
4. **Run Locally:** `npm run dev` at the root will start both the frontend and backend.

## Development Workflow

1. **Branching Strategy:** 
   - Use `feature/your-feature-name` for new additions.
   - Use `fix/your-bug-fix` for bug patches.
2. **Commit Messages:**
   - Write clear, concise commit messages.
   - Prefix with the context: `[web] added new dashboard chart` or `[api] fixed approval endpoint`.
3. **Adding Shared Code:**
   - Do NOT duplicate utilities across `apps/web` and `apps/api`.
   - Place shared code in `packages/shared-utils`, run `npm run build` within that package, and import it via `@curiousbees/shared-utils`.
4. **Pull Requests:**
   - Submit PRs against the `main` branch.
   - Ensure `npm run lint` and `npx tsc --noEmit --workspaces` pass locally before submitting.

## Database Changes
If you need to change the database schema (`apps/api/prisma/schema.prisma`):
1. Make your changes in `schema.prisma`.
2. Run `npm run db:migrate` locally.
3. Update the shared types in `packages/types` if necessary.
4. Include the generated Prisma migration files in your PR.
