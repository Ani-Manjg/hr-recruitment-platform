# TalentFlow HR frontend

React + TypeScript frontend for the TalentFlow recruitment API.

## Environment

Copy `.env.example` to `.env.local`:

```env
VITE_API_URL=http://localhost:3000
```

`VITE_API_URL` is the backend origin without the `/api` suffix. Never place JWT
secrets, database credentials, or AI provider keys in frontend environment
variables.

## Run locally

Start the completed backend in its repository using its documented command. It
must listen on `http://localhost:3000`.

Then run the frontend:

```powershell
npm install
npm run dev
```

Open `http://localhost:5173`.

## Connected features

- Register, sign in, session restoration, sign out, and protected routes
- In-memory access tokens, rotating HttpOnly-cookie refresh sessions, queued
  refresh retries, and session-scoped CSRF rotation
- Invitation registration and ADMIN-only invitation creation
- Forgot-password, reset-password, and authenticated password changes
- Editable user profiles with immediate authenticated-user updates
- Company settings with ADMIN-only editing
- User notification preferences
- Job listing, search, status filtering, creation, editing, and deletion
- Candidate server-side filters, sorting, pagination, creation, editing,
  shortlisting, rejection, ADMIN-only deletion and retention purge, notes,
  details, and comparison
- Multipart PDF/DOC/DOCX résumé analysis and analyzed-candidate saving
- Notifications and mark-read actions
- Dashboard statistics and pipeline charts
- Candidate search in the top navigation
- Upcoming interview listing, UTC scheduling, and confirmed deletion

## Production

Set `VITE_API_URL` in Vercel to the public HTTPS origin of the deployed backend,
then create a new production deployment. The backend must allow the production
Vercel origin through credentialed CORS and use secure production cookies.

## Scripts

- `npm run dev` - development server
- `npm run build` - strict TypeScript check and production build
- `npm run preview` - preview the production build

The project currently has no lint or test scripts.

## Backend

The deployable API is in [`backend`](backend). It includes the Supabase migration,
secure authentication, tenant-isolated business APIs, interview scheduling,
notifications, statistics, audit logging, and Gemini CV analysis. See
[`backend/README.md`](backend/README.md) for Supabase, local, and Render setup.
