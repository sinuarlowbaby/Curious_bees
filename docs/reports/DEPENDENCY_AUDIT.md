# Dependency Audit Report

This report documents the state of package dependencies across the root monorepo and individual workspaces, ensuring there is no pollution, duplication, or incorrect package ownership.

---

## 🛠️ Root devDependencies Status

The root `package.json` has been hardened to only contain multi-workspace management tools and cross-platform utilities, ensuring that the monorepo parent stays clean.

* **`concurrently`**: Used to parallel-boot both Next.js and NestJS dev servers in a single terminal.
* **`cross-env`**: Standardizes setting environment variables across Windows, macOS, and Linux.
* **`rimraf`**: Provides platform-independent directory deletions (`clean` script).
* **`typescript`**: Enforces strict compile checks across all workspaces.
* **`prisma`**: Handles database generation and schema sync commands from the root.

All application-specific dependencies (such as `@nestjs/*`, `firebase`, `next`, `react`, etc.) are isolated inside their respective workspaces (`apps/web` or `apps/api`), preventing dependency pollution at the monorepo parent layer.

---

## 🧑‍💻 Workspace Dependency Status

### apps/web (Frontend)
- Dependencies are isolated to UI and React frameworks: `next`, `react`, `react-dom`, `@tanstack/react-query`, `framer-motion`, `zustand`, `lucide-react`, and `@fullcalendar/*`.
- Developer tools (like `tailwindcss`, `eslint`, `postcss`) are placed under `devDependencies`.

### apps/api (Backend)
- Dependencies are isolated to NestJS utilities and server-side components: `@nestjs/core`, `@nestjs/common`, `@nestjs/bullmq`, `@prisma/client`, `ioredis`, `helmet`, and `compression`.
- Developer tools (like `@nestjs/cli`, `prisma`, `ts-node`) are isolated under `devDependencies`.

---

## 🔄 Shared Packages Verification

All local packages under `packages/` maintain isolated dependency rosters matching their compilation targets:
* `@curiousbees/types` -> Dev-only dependencies on `typescript`.
* `@curiousbees/constants` -> Dev-only dependencies on `typescript`.
* `@curiousbees/shared-utils` -> Dependencies on `zod`, dev-dependency on `@curiousbees/types`.
* `@curiousbees/ui` -> Dependencies on `lucide-react`, `clsx`, `tailwind-merge` with peerDependencies on `react` and `react-dom`.
