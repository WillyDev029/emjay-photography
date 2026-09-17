-- ============================================================================
-- Emjay Photography — dynamic portfolio categories
--
-- Curriculum: adds a public.categories table (admin-managed) and converts the
-- portfolio_photos.category column from a Postgres enum to plain text so
-- categories can be added AND removed at runtime (PG enums cannot drop values).
-- Safe to re-run.
-- ============================================================================

-- Categories table (source of truth for the admin-managed list) -------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Categories are public"
  on public.categories for select
  using (true);

create policy "Admins manage categories"
  on public.categories for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Seed the original fixed categories (idempotent).
insert into public.categories (name, slug, sort_order) values
  ('Weddings', 'weddings', 0),
  ('Portraits', 'portraits', 1),
  ('Events', 'events', 2),
  ('Fashion', 'fashion', 3),
  ('Products', 'products', 4),
  ('Lifestyle', 'lifestyle', 5),
  ('Other', 'other', 6)
on conflict (slug) do update
  set name = excluded.name,
      sort_order = excluded.sort_order;

-- Convert portfolio_photos.category from enum to text -------------------------
alter table public.portfolio_photos
  alter column category drop default;

alter table public.portfolio_photos
  alter column category type text
  using category::text;

alter table public.portfolio_photos
  alter column category set default 'other';

-- The enum is no longer used anywhere.
drop type if exists public.portfolio_category;

-- Keep the existing index on category (now text).
create index if not exists portfolio_photos_category_idx
  on public.portfolio_photos (category);