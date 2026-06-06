# CuriousBees V2 — Production Release Checklist

This checklist details the steps required to transition the CuriousBees V2 monorepo from the **Developer Bypass Sandbox** (`AUTH_MODE=bypass`) to a fully secured **Production Deployment** (`AUTH_MODE=firebase`) utilizing Google Single Sign-On.

---

## 🔒 1. Toggle Authentication Modes

To disable the local developer bypass widget, update the unified root `.env` file (or configure environment variables in your cloud hosting provider):

```env
# Disable development bypass guards
DEVELOPMENT_MODE=false
NEXT_PUBLIC_DEVELOPMENT_MODE=false

# Enable Firebase Google SSO Authentication
AUTH_MODE=firebase
NEXT_PUBLIC_AUTH_MODE=firebase
```

---

## 🔑 2. Configure Production Secrets

Ensure that all required external credentials are set. The NestJS backend and Next.js frontend will validate these on boot:

### A. Database Credentials
* [ ] `DATABASE_URL`: Set to your production Supabase transaction pooler URL (Port `6543`, containing `?pgbouncer=true`).
* [ ] `DIRECT_URL`: Set to your direct Supabase connection URL (Port `5432`).

### B. Firebase Frontend client (Next.js)
* [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
* [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
* [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
* [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
* [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
* [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`

### C. Firebase Admin SDK Backend (NestJS)
* [ ] `FIREBASE_PROJECT_ID`
* [ ] `FIREBASE_CLIENT_EMAIL`
* [ ] `FIREBASE_PRIVATE_KEY`: Private key from your Google Cloud Console Service Account credentials. Ensure that newlines (`\n`) are escaped correctly.

---

## 🏗️ 3. Verification & Deployment Steps

Before pushing to your production branch:

1. **Verify Environment Configurations**:
   Run the diagnostics tool to confirm all credentials and configurations are correctly set:
   ```bash
   npm run doctor
   ```
2. **Execute Database Migrations**:
   Deploy database schema tables to your production Supabase instance:
   ```bash
   npm run db:migrate
   ```
3. **Purge Test Data / Add Initial Admins**:
   Ensure that a default admin account exists in your user database table that matches the `MAIN_ADMIN_EMAIL` environment variable:
   ```env
   MAIN_ADMIN_EMAIL="admin@srmist.edu.in"
   ```
4. **Compile Production Bundles**:
   Ensure that the monorepo builds with zero type warnings or compile errors:
   ```bash
   npm run build
   ```
