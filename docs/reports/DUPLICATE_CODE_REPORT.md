# Duplicate Code Report

This report documents the audit for duplicate components, helpers, and utilities across the **CuriousBees V2** monorepo.

---

## 🔍 Code Duplication Audit Results

A monorepo-wide scan was conducted to check for overlapping modules, components, or helper functions.

### 1. UI Components Consolidation
* **Status Badge**: Replaced scattered local badge wrappers with the unified `StatusBadge` primitive.
* **Intranet Logo**: Verified a single centralized `Logo` component resides in [Logo.tsx](file:///Users/maddy/Current%20Project/CuriousBees_V2/apps/web/src/components/Logo.tsx) with no other custom vector definitions.
* **Shared UI Styles**: Standard Tailwind helpers (like `cn`) are exported directly from `@curiousbees/ui` and re-exported under [apps/web/src/lib/utils.ts](file:///Users/maddy/Current%20Project/CuriousBees_V2/apps/web/src/lib/utils.ts#L1), eliminating local classname-merging overrides.

### 2. Validation & Type Sharing
* Shared Zod schemas (such as `UpdateProfileSchema`, `CreateThreadSchema`, and `CreateOpportunitySchema`) are successfully imported from the shared workspace package `@curiousbees/shared-utils`, avoiding duplicating rules on the client and server.

### 3. Recommendation
No active file duplications were detected. The codebase is highly unified and maintains clean isolation of shared utilities and types.
