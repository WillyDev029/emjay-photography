alter table public.services
  add column if not exists currency text not null default 'NGN'
  check (currency in ('NGN', 'USD'));