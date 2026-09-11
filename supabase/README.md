# Supabase setup

This folder contains everything needed to give the website its production
backend. Nothing here runs until you deploy it to your Supabase project.

## 1. Create the database schema

1. Create a Supabase project at https://supabase.com/dashboard.
2. Open **SQL Editor** → **New query**.
3. Paste the contents of [`migrations/0001_initial.sql`](./migrations/0001_initial.sql).
4. Run it. It is idempotent (safe to re-run).

This creates all tables (`profiles`, `website_settings`, `portfolio_photos`,
`services`, `bookings`, `testimonials`, `blocked_dates`, `contact_messages`),
row-level security policies, the `photos` storage bucket, and a singleton
settings row.

## 2. Create your admin account

1. In **Authentication → Users → Add user**, create your admin email + password.
2. The schema auto-creates a `profiles` row for the new user.
3. In the **SQL Editor**, set that user's role to admin:

```sql
update public.profiles
set role = 'admin'
where lower(email) = lower('you@example.com');
```

> Online booking availability is checked through a read-only RPC
> (`get_unavailable_times`) so visitor details in the `bookings` table are
> never exposed to the public.

## 3. Deploy the email edge function

The website already calls `booking-emails` for new bookings, booking status
changes, and contact form messages.

1. Install the Supabase CLI: https://supabase.com/docs/guides/cli
2. Link the project: `supabase link --project-ref <project-ref>`
3. Add secrets (Edge Functions → Secrets, or CLI):
   - `RESEND_API_KEY` — from https://resend.com/api-keys (free tier available)
   - `EMAIL_FROM` — optional, e.g. `Emjay Photography <onboarding@resend.dev>`
4. Deploy:

```bash
supabase functions deploy booking-emails
```

> The function sends to the address you set in **Admin → Settings → Email**, so
> make sure that field is filled in on the site.

## 4. Project API keys

Copy from **Project Settings → API** into your app's environment:

- `VITE_SUPABASE_URL` — the `https://xxxx.supabase.co` URL
- `VITE_SUPABASE_ANON_KEY` — the **anon/public** key (never the service role key)

## Recap

Go to **Admin → Settings** on the site to add your details, hero image, social
links and WhatsApp number, then start adding portfolio photos and services.