# CuriousBees Architecture

This document describes the architectural flows and operational workflows for the CuriousBees V2 platform.

## Request Flow

1. **Client Interface**: Users interact via the Next.js React frontend.
2. **Edge Middleware**: Next.js middleware intercepts requests to protected routes, validating the `cb-role` cookie to quickly allow or deny access before rendering.
3. **API Invocation**: Client-side logic uses `apiFetch` (from `@curiousbees/shared-utils`/`api-client`) which automatically attaches the active Firebase ID token.
4. **Backend Gateway**: Requests arrive at the NestJS API.
5. **Guards & Validation**: `FirebaseAuthGuard` validates the Firebase token against the Firebase Admin SDK.
6. **Controller Logic**: Controllers orchestrate business logic.
7. **Database Interaction**: Prisma queries the Supabase PostgreSQL database.

## User Login Flow

```text
User clicks "Login with Google"
        |
        v
Firebase Client SDK popup opens
        |
        v
User authenticates (must be @srmist.edu.in in prod)
        |
        v
Firebase returns User Object + ID Token
        |
        v
Next.js POSTs ID Token to NestJS `/api/auth/me`
        |
        v
NestJS verifies token -> creates/updates User in Prisma
        |
        v
NestJS returns User Profile (Role, Approval Status)
        |
        v
Next.js sets Role Cookie & Redirects to Dashboard
```

## Notification Flow (FCM)

1. Client logs in -> Request FCM Permission -> Service Worker registers.
2. Token is POSTed to `/api/notifications/register-token`.
3. An event occurs (e.g. Scholar submits approval request).
4. `NotificationsService` drops a job into `BullMQ` (Redis).
5. `NotificationProcessor` consumes job -> Queries Prisma for device tokens.
6. Dispatch to Firebase Admin SDK -> Push delivered to browser.

## Supervisor Approval Workflow

1. Scholar signs up via Google -> Profile synced -> Status `approved: false`.
2. Scholar selects a Faculty Supervisor from a dropdown list.
3. System creates a `CollaborationRequest` and triggers FCM notification to the Supervisor.
4. Supervisor sees request in Dashboard -> Approves.
5. Backend updates Scholar to `approved: true` -> triggers FCM notification to Scholar.
6. Scholar gains full platform access.

## Research Collaboration Workflow

1. **Thread Creation**: Researchers create discussion threads on topics.
2. **Commenting**: Researchers comment on threads.
3. **Workspaces**: Approved groups create collaborative Workspaces.
4. **File Sharing**: Resources are linked/uploaded within the Workspace context.
5. **Milestones**: Workspaces track progress against defined milestones.
