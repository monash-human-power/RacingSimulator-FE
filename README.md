# Racing Simulator Frontend

Next.js frontend for the Racing Simulator product.

## Architecture Boundary

- Frontend (`RacingSimulator`): UI, client state, API consumption.
- Backend (`RacingSimulator-BE`): Supabase auth, PostgreSQL schema, business/data logic, and API routes.

This repository must not contain direct database logic or Supabase admin/business operations.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_API_BASE_URL` to your backend API (default `http://localhost:4000`).
3. Install dependencies:

```bash
npm install
```

4. Run frontend:

```bash
npm run dev
```

## Core Features Wired To Backend

- Sign up / sign in / sign out / password reset
- Rider CRUD
- Race setup persistence
- Session lifecycle + session history
- Session analysis persistence
- Leaderboard queries
- Preferences persistence
