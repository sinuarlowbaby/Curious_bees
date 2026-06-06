# Documentation Audit Report

This report catalogs all documentation markdown files currently present in the repository, detailing their purpose and mapping their relocation to category subfolders within the `docs/` architecture.

---

## 🗺️ Documentation Mapping & Relocation

| Source File | Relocation Destination | Category | Purpose |
| :--- | :--- | :---: | :--- |
| `/README.md` | Keep at Root `/README.md` | Root | Primary quick-start and repository landing page. |
| `/CONTRIBUTING.md` | Keep at Root `/CONTRIBUTING.md` | Root | Branching strategy, commits, and review guides. |
| `/CHANGELOG.md` | Keep at Root `/CHANGELOG.md` | Root | Historical version release logs. |
| `/ARCHITECTURE.md` | `docs/architecture/ARCHITECTURE.md` | Architecture | High-level system design and monorepo structure. |
| `/PROJECT_OVERVIEW.md` | `docs/architecture/PROJECT_OVERVIEW.md` | Architecture | Business requirements, user journeys, and mock scopes. |
| `/DATABASE_ARCHITECTURE.md` | `docs/database/DATABASE_ARCHITECTURE.md` | Database | Schema entities, Prisma structures, and relations. |
| `/HEALTHCHECK.md` | `docs/development/HEALTHCHECK.md` | Development | Health check JSON specs and API diagnostics pings. |
| `/DEVELOPMENT_MODE_GUIDE.md` | `docs/guides/DEVELOPMENT_MODE_GUIDE.md` | Guides | Developer auth bypass modes and role switcher guide. |
| `/DEMO_USERS.md` | `docs/guides/DEMO_USERS.md` | Guides | Catalog of pre-seeded supervisor/scholar test profiles. |
| `/RELEASE_CHECKLIST.md` | `docs/guides/RELEASE_CHECKLIST.md` | Guides | Steps to transition from dev mode to production Firebase. |
| `/SECURITY_AUDIT.md` | `docs/audits/SECURITY_AUDIT.md` | Audits | Risk modeling, CSRF/CORS details, and rate limits. |
| `/CI_CD.md` | `docs/deployment/CI_CD.md` | Deployment | Pipeline builds and typecheck checks. |
| `/DEPLOYMENT_GUIDE.md` | `docs/deployment/DEPLOYMENT_GUIDE.md` | Deployment | General cloud release instructions. |
| `/TEAM_TESTING_DEPLOYMENT.md` | `docs/deployment/TEAM_TESTING_DEPLOYMENT.md` | Deployment | Deployment workflow for free-tier Supabase/Vercel/Railway. |
| `docs/audit_report_phase2.md` | `docs/audits/audit_report_phase2.md` | Audits | Historical engineering audit. |
| `docs/deployment_test_production.md` | `docs/deployment/deployment_test_production.md` | Deployment | Production deployment details. |
| `docs/development_mode.md` | `docs/development/development_mode.md` | Development | Bypass design concepts. |
| `docs/troubleshooting.md` | `docs/guides/troubleshooting.md` | Guides | Common developer troubleshooting. |
| `docs/setup/linux.md` | `docs/guides/setup-linux.md` | Guides | Linux environment installation guide. |
| `docs/setup/macos.md` | `docs/guides/setup-macos.md` | Guides | macOS environment installation guide. |
| `docs/setup/windows.md` | `docs/guides/setup-windows.md` | Guides | Windows environment installation guide. |
| `docs/assets/file-structure.md` | `docs/architecture/file-structure.md` | Architecture | Monorepo folder tree details. |
| `docs/assets/tech-stack.md` | `docs/architecture/tech-stack.md` | Architecture | Detailed description of selected libraries. |

---

## 🗑️ Stale / Obsolete Reports to Prune

These reports are legacy planning documents that are not part of the active documentation tree and can be deleted:

* `/CLEANUP_PLAN.md` (Obsolete cleanup plan)
* `/DEAD_CODE_REPORT.md` (Obsolete dead code log)
* `/FEATURE_ALIGNMENT_REPORT.md` (Obsolete feature mapping)
* `/POST_CLEANUP_REPORT.md` (Obsolete cleanup verify log)
* `/REPOSITORY_MAP.md` (Obsolete repository structure mapping)
* `/UPDATED_GITIGNORE.md` (Obsolete gitignore changes draft)
