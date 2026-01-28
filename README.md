# Mwero Tech Academy

A comprehensive online learning platform for tech education with AI-powered grading, instructor-led courses, and personalized learning paths.

## 🎯 Features

- **Authentication**: Email/password and Google OAuth via Supabase
- **Role-Based Access**: Learner, Instructor, and Admin dashboards
- **Course Management**: Self-paced and instructor-led courses
- **AI-Powered Grading**: Automated project marking with instructor override
- **Certificate Generation**: Automated certificate creation upon course completion
- **Real-time Chat**: Learner-instructor messaging and support tickets
- **Payment Integration**: Course payments and instructor payslips
- **Progress Tracking**: Detailed analytics and progress monitoring
- **Email Notifications**: Automated emails for sessions, payments, and updates

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
# Mwerotech Academy — Developer README

This repository contains the Mwerotech Academy web application built with Next.js (App Router), TypeScript, Tailwind CSS and Supabase for authentication and database.

This README documents how to set up, run, and develop the project locally, including important environment variables, database notes, admin features, and troubleshooting tips.

**Contents**
- Project overview
- Local development
- Environment variables
- Database setup
- Supabase service-role operations
- Important server endpoints & files
- Useful scripts
- Build & deployment
- Troubleshooting
- Contributing

**Project Overview**
- Tech stack: Next.js (App Router), TypeScript, Tailwind CSS, Supabase (Auth + Postgres), react-hot-toast, lucide-react icons.
- Structure highlights:
  - `src/app/` — Next.js app routes and pages (server/client components)
  - `src/components/` — Reusable UI components
  - `src/lib/supabase/` — Supabase helpers and generated DB types
  - `scripts/` — utility scripts
  - `supabase/schema.sql` — database schema / migrations (project reference)

**Local Development**
1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` in the repository root (copy from your secrets):

Required variables (minimum):

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-only, sensitive)
- `NEXT_PUBLIC_APP_URL` — App URL (e.g. http://localhost:3000)

Optional (email delivery):

- `SENDGRID_API_KEY` — SendGrid API key for invite emails (or other mail provider)

Example `.env.local` (DO NOT commit):

```
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
SENDGRID_API_KEY=your-sendgrid-key
```

3. Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

**Database Setup**
- The `supabase/schema.sql` file contains the canonical DB schema used by this project. Use Supabase Dashboard or CLI to apply the schema.
- The app expects tables such as `profiles`, `courses`, `course_modules`, `lessons`, `enrollments`, `progress_tracking`, `quiz_attempts`, `admin_audit_logs`, and others defined in `src/lib/supabase/database.types.ts`.

**Supabase Clients in Code**
- Browser client: `src/lib/supabase/client.ts` exports `supabase` and is used in client components.
- Server helpers: `src/lib/supabase/server.ts` provides a `createClient()` for server-side requests (reads session cookies).
- Service role admin client: `getSupabaseAdmin()` in `src/lib/supabase/client.ts` uses `SUPABASE_SERVICE_ROLE_KEY` and must only run on the server (API routes).

Important: Keep `SUPABASE_SERVICE_ROLE_KEY` secret. Never expose it to client bundles.

**Admin Features & Endpoints**
- Invite users: POST `/api/admin/invite` — creates auth user (service role), upserts `profiles`, optionally sends invite email. See `src/app/api/admin/invite/route.ts`.
- Manage users: PATCH/DELETE `/api/admin/users/[id]` — role changes and removals. Server-side admin checks added; audit logs stored in `admin_audit_logs`. See `src/app/api/admin/users/[id]/route.ts`.

Authorization: Admin endpoints require the caller to be authenticated and have `role === 'admin'` in the `profiles` table.

**Quiz Handling**
- Client quiz component: `src/components/courses/Quiz.tsx` — renders MCQ quizzes and posts attempts to the API.
- Submission endpoint: POST `/api/quizzes/attempt` — server now loads canonical quiz questions from `lessons.content` (expected JSON), computes correctness and score server-side, stores `quiz_attempts` with score and reviewed answers. See `src/app/api/quizzes/attempt/route.ts`.
- Lessons: quiz lessons are `content_type: 'quiz'` and should include a serialized JSON array of questions in `lessons.content`.

Question format expected (example):

```json
[
  {
    "id": "q1",
    "question": "What is 2+2?",
    "options": ["1","2","3","4"],
    "correctAnswer": 3,
    "explanation": "2+2=4"
  }
]
```

**Useful Scripts**
- `scripts/delete-supabase-users.js` — utility to find and optionally delete phantom users in Supabase Auth using `SUPABASE_SERVICE_ROLE_KEY` (dry-run default). Example:

```bash
node scripts/delete-supabase-users.js user1@example.com user2@example.com
# To actually delete:
node scripts/delete-supabase-users.js --yes user1@example.com
```

**Build & Production**
- Build for production:

```bash
npm run build
```

- Start production server:

```bash
npm start
# or
next start
```

**Troubleshooting & Notes**
- Turbopack / Next build parsing issues: keep JSX comments minimal in server components. If `next build` reports unexpected token around JSX comments, simplify the surrounding JSX.
- If you see TypeScript issues where Supabase query results infer `never`, the codebase sometimes uses `as any` casts for query results to avoid over-strict typing — consider improving generated types if you prefer stricter typing.
- If the dev server fails due to port or lock file, ensure no other instance is running or pick a different port: `PORT=3001 npm run dev`.
- .env pitfalls: ensure `.env.local` does not contain shell `export` lines — keys must be plain `KEY=value` pairs.

**Testing & Linting**
- There are no automated tests included by default. To add tests, consider Jest or Playwright for end-to-end behavior.

**Contribution & Workflow**
- Commit messages in this repository follow conventional-style prefixes (e.g., `feat(...)`, `fix(...)`, `chore(...)`).
- If you add or modify DB tables, update `supabase/schema.sql` and regenerate types if you use a typing tool.

**Files of Interest**
- App entry and routes: `src/app/`
- Quiz component: `src/components/courses/Quiz.tsx`
- Quiz API: `src/app/api/quizzes/attempt/route.ts`
- Admin users API: `src/app/api/admin/users/[id]/route.ts`
- Invite API: `src/app/api/admin/invite/route.ts`
- Supabase helpers and types: `src/lib/supabase/`
- Scripts: `scripts/delete-supabase-users.js`

**Next steps & recommendations**
- Configure an email provider (SendGrid or similar) for invite emails; when `SENDGRID_API_KEY` is unset the invite endpoint may return the temporary password in non-prod environments.
- Add server-side tests for admin endpoints and quiz scoring to prevent regressions.
- Consider stronger typing for Supabase responses or a small helper wrapper to normalize `select().single()` results.

If you want, I can:
- Commit this README to the repository.
- Add a short contributing guide or developer checklist.
- Add a simple unit/integration test that covers quiz submission.

---

README created by the development assistant; contact the repository owner for access to production Supabase keys and deployment credentials.
