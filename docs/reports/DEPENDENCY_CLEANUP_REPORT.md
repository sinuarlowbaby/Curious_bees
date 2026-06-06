# Dependency Cleanup Report

This report documents the cleanup, version standardization, and workspace checks conducted on dependencies across the CuriousBees V2 monorepo.

---

## 🔍 Dependency Audit Findings

All workspaces were checked for unused packages, duplicate installations, version mismatches, and root-level package pollution.

### 1. Root `package.json` devDependencies
* Root contains only global DX utilities: `concurrently`, `cross-env`, `prisma`, `rimraf`, `typescript`.
* **Action**: Confirmed clean. No application-specific packages pollute the root.

### 2. Frontend `apps/web/package.json`
* Dependencies are strictly limited to Next.js and frontend UI packages: `next`, `react`, `react-dom`, `@tanstack/react-query`, `framer-motion`, `zustand`, etc.
* **Action**: Verified. No backend-specific packages (such as `@nestjs/*` or `firebase-admin`) are present.

### 3. Backend `apps/api/package.json`
* Dependencies are isolated to NestJS utilities and server-side components: `@nestjs/core`, `@nestjs/common`, `@nestjs/bullmq`, `@prisma/client`, `ioredis`, `helmet`, and `compression`.
* **Action**: Verified. No frontend-specific packages (such as `next`, `framer-motion`, etc.) are present.

### 4. Shared Packages (`packages/*`)
* Shared packages have minimal dependency rosters target-compiled for Next.js/NestJS consumption.
* **Action**: Verified. Package peerDependencies and devDependencies are correctly isolated.

---

## 🚀 Pruning Summary

No active dependencies were pruned because all listed packages are actively imported and verified in the source code. The monorepo utilizes npm workspaces successfully with clean package separation.
