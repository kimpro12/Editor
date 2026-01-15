# Ingestion Frontend (Mock BFF)

This repo is a standalone **Next.js App Router** frontend that can run **without a backend** using built-in BFF mocks under `/api/ingestion`.

## Prereqs
- Node.js 20+ (recommended 22)
- pnpm

## Install
```bash
pnpm i
```

## Run (dev)
```bash
pnpm dev
```

Open: http://localhost:3000

## Auth modes

### Dev Auth (default if Supabase env not set)
If you don't set Supabase env vars, the app uses **Dev Auth**:
- Login page sets `dev_user` cookie
- Middleware protects app routes based on that cookie

### Supabase Auth (optional)
Set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`

Then `/login` will show Supabase Auth UI and middleware will validate session server-side.

## API base URL

By default the app uses built-in mock API:
- Base URL: `/api/ingestion`
- Endpoints (mock):
  - `GET /v1/health`
  - `GET /v1/datasets`
  - `POST /v1/datasets`
  - `GET /v1/datasets/:id`
  - `POST /v1/uploads/presign`
  - `POST /v1/uploads/complete`
  - `POST /v1/downloads/presign`
  - `POST /v1/datasets/:id/finalize`

If you later have a real backend, set:
- `NEXT_PUBLIC_INGESTION_API_BASE=http://localhost:8000` (example)
or override in **Settings** page.

## Mock upload storage
Mocks return `put_url` and `get_url` that point to internal routes:
- `PUT /api/ingestion/mock-storage/put?key=...`
- `GET /api/ingestion/mock-storage/get?key=...`

So the upload → preview → finalize flow works end-to-end on localhost.

## Self-check scripts
You can run structural checks (no install required, but intended after install):
```bash
pnpm selfcheck:all
```
