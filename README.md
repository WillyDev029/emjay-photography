# Emjay Photography

A responsive photography studio website built with React, TypeScript, Vite and
Tailwind CSS, backed by Supabase and deployed on Render.

## Features

- Public pages: Home, Portfolio, Services, About, Booking, Contact, 404
- Online booking with live availability (confirmed/pending slots and blocked
  dates are hidden automatically)
- Full admin dashboard: portfolio, services, bookings, testimonials,
  calendar/blocked dates, contact-message inbox, and site settings
- Demo mode out of the box (localStorage) — no backend required to try it
- Supabase mode: auth, Postgres storage, RLS, and transactional emails via an
  edge function
- SEO: per-page meta/OG/twitter tags, canonical URLs, XML sitemap, JSON-LD

## Getting started

Prerequisites: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

The site runs in **demo mode** until you add Supabase credentials to a
`.env.local` file (see [`.env.example`](./.env.example)):

```bash
cp .env.example .env.local
```

Demo admin login (admin page: `/admin/login`): `admin@emjay.com` / `demo1234`

## Project structure

```
src/
  components/   reusable UI, layouts, page sections
  pages/        public pages + admin pages under pages/admin
  lib/          demo data/store, Supabase API layer, utils, validation
  context/      auth & settings providers
  hooks/        data-fetching and feature hooks
supabase/
  migrations/   production SQL schema (tables, RLS, storage)
  functions/    booking-emails edge function (Resend)
```

## Scripts

| Command            | Purpose                          |
| ------------------ | -------------------------------- |
| `npm run dev`      | Start the dev server             |
| `npm run build`    | Type-check and build to `dist/`  |
| `npm run preview`  | Preview the production build     |
| `npm run lint`     | Run oxlint                       |

## Going to production (Supabase + Render)

### 1. Supabase

1. Create a project, then run [`supabase/migrations/0001_initial.sql`](./supabase/migrations/0001_initial.sql) in the SQL Editor.
2. Create your admin user in **Authentication → Users**, then set their role to `admin` (see [`supabase/README.md`](./supabase/README.md)).
3. Add the `RESEND_API_KEY` and `EMAIL_FROM` secrets and deploy the edge function: `supabase functions deploy booking-emails`.

### 2. Render

1. Push the repo to GitHub.
2. In Render, create a **New → Static Site** pointed at the repo.
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add these environment variables (also see `.env.example`):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_URL` (e.g. `https://your-app.onrender.com`)
   - `VITE_SITE_URL`
4. After the first deploy, update [`public/sitemap.xml`](./public/sitemap.xml) and
   [`public/robots.txt`](./public/robots.txt) with your real URL.

SPA fallback is already handled by `public/_redirects` and `render.yaml`.
A `render.yaml` blueprint is included if you prefer deploying via the Blueprint
dashboard, but the manual steps above work identically.