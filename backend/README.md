# TalentFlow API

TypeScript/Express API for the TalentFlow frontend. It uses Supabase PostgreSQL,
opaque rotating refresh cookies, short-lived access JWTs, CSRF-bound refresh and
logout operations, company isolation, role checks, and Gemini resume analysis.

## Supabase

Open the Supabase SQL editor and run:

```text
supabase/migrations/001_initial_schema.sql
```

The server uses the service-role key and applies tenant restrictions in every
business query. Browser clients must never receive that key. RLS is enabled and
all direct `anon` and `authenticated` table access is revoked.

Public registration creates a `RECRUITER`, following the frontend contract. To
bootstrap the first administrator, register normally and run this once in the
Supabase SQL editor:

```sql
update public.users
set role = 'ADMIN'
where email = 'your-email@example.com';
```

The administrator can then create ADMIN or RECRUITER invitation links.

## Local development

Copy `.env.example` to `.env`, replace every placeholder, then run:

```text
npm install
npm run dev
```

The frontend `.env.local` should contain:

```text
VITE_API_URL=http://localhost:3000
```

## Render

The repository-level `render.yaml` configures this folder as a Render web
service. For manual configuration use:

```text
Root Directory: backend
Build Command: npm ci --include=dev && npm run build
Start Command: npm start
Health Check Path: /health
```

Set `FRONTEND_ORIGIN` to the exact Vercel production origin. After deployment,
set Vercel's `VITE_API_URL` to the Render origin without `/api`, then redeploy.
