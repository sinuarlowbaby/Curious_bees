# Unused Files Report

This report catalogs all orphaned, temporary, or redundant files and empty folders detected across the **CuriousBees V2** monorepo that are safe to delete.

---

## 🗑️ Redundant Root Documentation Files

These reports are temporary logs, duplicate drafts, or legacy notes that can be deleted once their relevant content is integrated or consolidated.

| File Path | Description | Status |
| :--- | :--- | :---: |
| `/CLEANUP_PLAN.md` | Legacy phase-1 cleanup planning notes. | **Safe to Delete** |
| `/DEAD_CODE_REPORT.md` | Legacy checklist for dead code. | **Safe to Delete** |
| `/FEATURE_ALIGNMENT_REPORT.md` | Legacy alignment audit notes. | **Safe to Delete** |
| `/POST_CLEANUP_REPORT.md` | Legacy phase-1 post-cleanup logs. | **Safe to Delete** |
| `/REPOSITORY_MAP.md` | Initial structural audit mapping. | **Safe to Delete** |
| `/UPDATED_GITIGNORE.md` | Draft revision notes for Git ignore rules. | **Safe to Delete** |
| `/DEPENDENCY_AUDIT.md` | Outdated dependency listing. | **Safe to Delete** |

---

## 📂 Empty Documentation Directories

The following subdirectories inside `docs/` contain zero files and are cleanups from historical development iterations:

* `docs/api/` (Empty)
* `docs/authentication/` (Empty)
* `docs/workflows/` (Empty)
* `docs/database/` (Empty)
* `docs/architecture/` (Empty - will be repopulated with consolidated documents)

---

## 🧑‍💻 Code Elements Verification

A recursive scan of `apps/web/src` and `apps/api/src` confirms that all page routes, NestJS module files, and database schemas are actively referenced or serve as canonical entry points. No orphan controllers or dead Next.js route folders were discovered.
