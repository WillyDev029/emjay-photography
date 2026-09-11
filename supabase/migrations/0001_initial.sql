-- ============================================================================
-- Emjay Photography — initial schema
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query) or via
-- `supabase db push`. Safe to re-run.
-- ============================================================================

-- Extensions ----------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ============================================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A user can read their own profile (used by the app to check the admin role).
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- WEBSITE SETTINGS (single row, id = 1)
-- ============================================================================
create table if not exists public.website_settings (
  id integer primary key check (id = 1),
  photographer_name text not null default 'Emjay',
  site_name text not null default 'Emjay Photography',
  tagline text not null default 'Capturing moments you want to remember forever.',
  logo_url text,
  profile_photo_url text,
  hero_image_url text,
  phone text not null default '',
  email text not null default '',
  location text not null default '',
  about_text text not null default '',
  intro text not null default '',
  facebook text,
  instagram text,
  twitter text,
  tiktok text,
  youtube text,
  whatsapp_number text not null default '',
  business_hours text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.website_settings enable row level security;

create policy "Settings are public"
  on public.website_settings for select
  using (true);

create policy "Admins manage settings"
  on public.website_settings for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

insert into public.website_settings (id) values (1) on conflict (id) do nothing;

-- ============================================================================
-- PORTFOLIO PHOTOS
-- ============================================================================
create type public.portfolio_category as enum
  ('weddings', 'portraits', 'events', 'fashion', 'products', 'lifestyle', 'other');

create table if not exists public.portfolio_photos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category public.portfolio_category not null default 'other',
  description text not null default '',
  date_taken date,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  image_url text not null,
  storage_path text,
  created_at timestamptz not null default now()
);

create index if not exists portfolio_photos_category_idx on public.portfolio_photos (category);
create index if not exists portfolio_photos_featured_idx on public.portfolio_photos (is_featured);

alter table public.portfolio_photos enable row level security;

create policy "Published photos are public"
  on public.portfolio_photos for select
  using (is_published = true);

create policy "Admins manage portfolio"
  on public.portfolio_photos for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ============================================================================
-- SERVICES
-- ============================================================================
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  image_url text not null default '',
  storage_path text,
  price numeric(10, 2),
  price_suffix text not null default 'per session',
  duration text not null default '',
  includes text[] not null default '{}',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.services enable row level security;

create policy "Active services are public"
  on public.services for select
  using (is_active = true);

create policy "Admins manage services"
  on public.services for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ============================================================================
-- BOOKINGS
-- ============================================================================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  client_name text not null,
  email text not null,
  phone text not null default '',
  service_id uuid references public.services(id) on delete set null,
  service_name text not null default '',
  preferred_date date not null,
  preferred_time text not null,
  location text not null default '',
  num_people integer not null default 1,
  message text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists bookings_date_idx on public.bookings (preferred_date);
create index if not exists bookings_status_idx on public.bookings (status);

alter table public.bookings enable row level security;

-- Visitors can submit bookings...
create policy "Anyone can submit bookings"
  on public.bookings for insert
  with check (true);

-- ...but only admins can read or manage them (keeps client details private).
create policy "Admins read bookings"
  on public.bookings for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admins update bookings"
  on public.bookings for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admins delete bookings"
  on public.bookings for delete
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ============================================================================
-- BOOKING AVAILABILITY (RPC — lets visitors check slots without exposing data)
-- ============================================================================
create or replace function public.get_unavailable_times(target_date date)
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(preferred_time), '{}'::text[])
  from public.bookings
  where preferred_date = target_date
    and status in ('pending', 'confirmed');
$$;

grant execute on function public.get_unavailable_times(date) to anon, authenticated;

-- ============================================================================
-- TESTIMONIALS
-- ============================================================================
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_photo text,
  rating integer not null default 5 check (rating between 1 and 5),
  review text not null,
  service_name text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;

create policy "Published testimonials are public"
  on public.testimonials for select
  using (is_published = true);

create policy "Admins manage testimonials"
  on public.testimonials for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ============================================================================
-- BLOCKED DATES (public visibility needed so the booking calendar hides them)
-- ============================================================================
create table if not exists public.blocked_dates (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  reason text not null default '',
  created_at timestamptz not null default now()
);

alter table public.blocked_dates enable row level security;

create policy "Blocked dates are public"
  on public.blocked_dates for select
  using (true);

create policy "Admins manage blocked dates"
  on public.blocked_dates for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ============================================================================
-- CONTACT MESSAGES
-- ============================================================================
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null default '',
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "Anyone can send a contact message"
  on public.contact_messages for insert
  with check (true);

create policy "Admins read contact messages"
  on public.contact_messages for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admins delete contact messages"
  on public.contact_messages for delete
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ============================================================================
-- STORAGE — 'photos' bucket (portfolio, services, logos, avatars, hero)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "Public can read photos"
  on storage.objects for select
  using (bucket_id = 'photos');

create policy "Admins can upload photos"
  on storage.objects for insert
  with check (
    bucket_id = 'photos'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins can update photos"
  on storage.objects for update
  using (
    bucket_id = 'photos'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins can delete photos"
  on storage.objects for delete
  using (
    bucket_id = 'photos'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );