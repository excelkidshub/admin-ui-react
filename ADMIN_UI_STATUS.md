# Admin UI Status

## Workspace

Parent workspace:
- `website/`
- `phonics-app/`
- `admin-ui/`
- `phonics-backend/`

Backend source of truth:
- `phonics-backend/setup.md`
- current Spring Boot controllers, DTOs, and services
- do not trust `phonics-backend/src/main/resources/openapi.yaml` unless verified against current code

## What Has Been Done

### Backend
- Spring Boot backend is already available in `phonics-backend`
- Local CORS support for React admin UI was added earlier in backend config so `http://localhost:5173` can call the API
- Current backend modules confirmed:
  - dashboard
  - enquiries
  - students
  - batches
  - teachers
  - payments
  - expenses
  - admin notifications

### Admin UI
Scaffolded under `admin-ui/`:
- React + TypeScript + Vite structure
- `src/lib/api.ts` now contains API methods for:
  - dashboard
  - enquiries
  - students
  - batches
  - teachers
  - payments
  - expenses
  - notifications
- `src/types.ts` contains frontend models mapped to backend DTOs
- `src/App.tsx` was expanded from a dashboard-only screen into a multi-module admin UI shell with screens for:
  - Dashboard
  - Enquiries
  - Students
  - Batches
  - Teachers
  - Payments
  - Expenses
  - Notifications
- `src/styles.css` was updated to support the full admin layout and module styling

## Important Notes

- Node.js is now installed and the admin UI dependencies were installed successfully
- Frontend production build now passes with `npm run build`
- There was a frontend type mismatch around `portalLoginEmail`; this was fixed in `src/types.ts`

## Likely Next Steps

1. Install Node.js locally if not already available in the new workspace environment
2. From `admin-ui/`, run:
   - `npm install`
   - `npm run dev`
3. From `phonics-backend/`, run:
   - `set SPRING_PROFILES_ACTIVE=local` or PowerShell equivalent
   - `./mvnw.cmd spring-boot:run`
4. Verify each admin module against live backend responses
5. Fix any TypeScript or UI integration issues discovered during first browser run
6. Refactor `src/App.tsx` into feature-based components once the first end-to-end run is stable

## Expected Follow-Up Work

The next session should focus on:
- verifying the current admin UI actually runs
- fixing TypeScript/runtime issues if any
- polishing forms and validation UX
- breaking the large `App.tsx` into smaller files such as:
  - `features/dashboard/*`
  - `features/enquiries/*`
  - `features/students/*`
  - `features/batches/*`
  - `features/teachers/*`
  - `features/payments/*`
  - `features/expenses/*`
  - `features/notifications/*`

## Recommended Prompt For Next Session

Use this prompt next time:

```text
We are working in the parent workspace:
- website/
- phonics-app/
- admin-ui/
- phonics-backend/

First read:
- `phonics-backend/setup.md`
- `ADMIN_UI_STATUS.md`

Use the current backend code as the source of truth.
Do not assume `phonics-backend/src/main/resources/openapi.yaml` is up to date unless verified.

Continue admin-ui development from the current scaffold.
First inspect and validate:
- `admin-ui/src/App.tsx`
- `admin-ui/src/lib/api.ts`
- `admin-ui/src/types.ts`
- `admin-ui/src/styles.css`

Our immediate goal is to get the admin UI running cleanly against the live backend, fix any compile/runtime issues, and then continue module polish and component refactoring.
```

