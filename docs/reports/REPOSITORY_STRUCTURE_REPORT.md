# Repository Structure Report

This report documents the reorganized enterprise-grade folder structure for the **CuriousBees V2** monorepo.

---

## 📁 Clean Monorepo Target Layout

The repository has been structured to follow industry standard directory hierarchies for Next.js + NestJS workspaces, keeping the root clutter-free and consolidating all documentation under `docs/`.

```text
/
├── apps/                         # Workspace Applications
│   ├── api/                      # NestJS API Backend
│   │   ├── src/
│   │   │   ├── auth/             # Authentication Services & Guards
│   │   │   ├── config/           # App Configurations & Zod Schemas
│   │   │   ├── common/           # Common Cross-Cutting NestJS Logic
│   │   │   │   ├── guards/       # NestJS Guards (Approved, Roles)
│   │   │   │   ├── filters/      # NestJS Global Filters (Exceptions)
│   │   │   │   ├── middleware/   # NestJS Middlewares (Request Logging)
│   │   │   │   ├── interceptors/ # NestJS Interceptors
│   │   │   │   ├── decorators/   # NestJS Decorators
│   │   │   │   ├── dto/          # Data Transfer Objects
│   │   │   │   └── utils/        # Internal Backend Helpers
│   │   │   ├── prisma/           # Prisma Client Service Instance
│   │   │   ├── shared/           # Backend Shared Module
│   │   │   ├── app.controller.ts
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   └── prisma/               # Prisma Database Configurations
│   │       ├── schema.prisma     # DB Schema Definitive Source
│   │       └── seed.ts           # Seeding Script Logic
│   └── web/                      # Next.js Web Frontend
│       ├── src/
│       │   ├── app/              # Next.js App Router Pages
│       │   ├── components/       # Frontend UI Component Subfolders
│       │   │   ├── dashboard/    # Portal Main View Specific Widgets
│       │   │   ├── forms/        # Input Controls & Forms
│       │   │   ├── layouts/      # Sidebar & Navbar Layout Modules
│       │   │   ├── shared/       # Cross-Portal Shared Components
│       │   │   └── ui/           # Basic/Primitive Controls
│       │   ├── hooks/            # Custom React Hooks
│       │   ├── lib/              # Client API Interceptors & Firebase Configs
│       │   ├── store/            # State Management Stores (Zustand)
│       │   ├── styles/           # Styling Configuration Files
│       │   └── types/            # Frontend Custom Types
│       └── next.config.ts        # Next.js Config & Env Validation
├── packages/                     # Shared Workspace Packages
│   ├── constants/                # Global Constant Files
│   ├── shared-utils/             # Shared Validators & Validation Schemas
│   ├── types/                    # Common Type & Interface Definitions
│   └── ui/                       # Shared Component Workspaces
├── scripts/                      # Developer Tooling & Automation
│   ├── setup.js                  # Automated Setup Script
│   ├── doctor.js                 # Unified Environment Diagnostic script
│   ├── db-setup.js               # Synchronizes Database migrations
│   ├── health-check.js           # Pings Health Check Services
│   └── maintenance/              # Temporary or Maintenance Utilities
├── docs/                         # Repository Documentation Hub
│   ├── README.md                 # Master Documentation Navigation Homepage
│   ├── architecture/             # Structural & Architectural Blueprints
│   ├── development/              # Setup, Bypass, Local testing workflows
│   ├── deployment/               # Deployment instructions & hosting variables
│   ├── database/                 # Schema and migrations documentation
│   ├── audits/                   # Threat modeling and security reports
│   ├── reports/                  # Cleanup, structure, and dependency audits
│   ├── guides/                   # Quick start & troubleshooting guidelines
│   └── assets/                   # System assets & diagrams
├── .github/                      # CI/CD Workflows & PR Templates
│   ├── workflows/                # Github Actions pipelines
│   └── PULL_REQUEST_TEMPLATE.md
├── package.json                  # Monorepo Workspaces & Root Script Triggers
├── package-lock.json
├── .env.example                  # Consolidated Environment Variable Sample
└── .gitignore                    # Sorted Enterprise Git Ignore Configuration
```
