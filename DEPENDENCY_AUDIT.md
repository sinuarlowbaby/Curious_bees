# CuriousBees V2 — Dependency Audit

This report reviews the package dependencies across the monorepo workspaces, identifying polluted, unused, or duplicate packages that can be safely pruned.

---

## 📦 1. Workspaces Dependency Audit Table

| Package Name | Target Workspace | Purpose / Usage | Safe to Remove? | Reason for Action |
| :--- | :--- | :--- | :---: | :--- |
| **`next`** | `apps/api` (Backend) | Frontend Next.js SSR package. | **Yes** | The backend is a NestJS REST API. Next.js is completely unused on the backend. |
| **`nodemailer`** | `apps/api` (Backend) | Mail sending utility. | **Yes** | Listed in backend dependencies, but never imported or used anywhere in backend code. |
| **`axios`** | `apps/api` (Backend) | HTTP client request wrapper. | **Yes** | Backend does not perform outbound HTTP calls. Axios is never imported. |
| **`@nestjs/cli`** | `apps/web` (Frontend) | Backend framework CLI launcher. | **Yes** | Frontend does not run NestJS compilation commands. It is a backend dev tool. |
| **`packages/config`** | Root Monorepo | Shared workspace package. | **Yes** | Package contains only an empty `package.json` structure, representing no active config files. |

---

## 🌐 2. Root `package.json` Dependency Pollution

The root [package.json](file:///Users/maddy/Current%20Project/CuriousBees_V2/package.json) contains several dependencies that are already defined and isolated within their respective workspaces:

| Package | Current Location | Recommended Cleanup Location | Safe to Remove from Root? | Reason |
| :--- | :--- | :--- | :---: | :--- |
| **`firebase`** | Root dependencies | Already isolated in `apps/web` | **Yes** | Firebase client calls are only made by the Next.js frontend app. |
| **`next`** | Root dependencies | Already isolated in `apps/web` | **Yes** | Next.js is the frontend runtime, not a monorepo-level compiler. |
| **`@nestjs/cli`** | Root dependencies | Already isolated in `apps/api` | **Yes** | Nest command runner should stay within the backend API project. |
| **`@nestjs/common`** | Root dependencies | Already isolated in `apps/api` | **Yes** | Core NestJS library, only imported in the backend API. |
| **`@nestjs/core`** | Root dependencies | Already isolated in `apps/api` | **Yes** | Core NestJS library, only imported in the backend API. |
| **`@nestjs/schedule`** | Root dependencies | Already isolated in `apps/api` | **Yes** | Nest scheduling module, only used for backend cron tasks. |
| **`@prisma/client`** | Root dependencies | Already isolated in `apps/api` & `apps/web` | **Yes** | Schema clients are imported in respective applications. |
| **`dotenv`** | Root dependencies | Already isolated in workspaces | **Yes** | Environmental variable loaders are handled at compilation level. |

---

## 🛠️ 3. Recommended Root DevDependencies

To keep the monorepo parent workspace clean and focused, it should only manage orchestrators and multi-platform compilation tools. The recommended parent packages are:

1. **`concurrently`**: To launch the web and API dev servers in a single terminal.
2. **`cross-env`**: For platform-agnostic environment variable setting.
3. **`rimraf`**: For cross-platform file/directory deletions (`clean` script).
4. **`typescript`**: Shared compiler check tools.
5. **`prisma`**: Dev dependency to run migrations from root scripts if needed.
