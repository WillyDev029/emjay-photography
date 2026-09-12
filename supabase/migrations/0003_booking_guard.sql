-- ============================================================================
-- Emjay Photography — bookings insert guard
-- Hardens the public "Anyone can submit bookings" policy.
-- Run this once in the Supabase SQL editor or via `supabase db push`.
-- Safe to re-run.
-- ============================================================================

-- Forces a server-generated reference, pins status to 'pending' and trims
-- every client-supplied field, so visitors cannot spoof confirmed/completed
-- bookings, fake references, or stash oversized payloads. Blocking a date/time
-- still requires a real insert per slot, but each one can no longer bypass the
-- pending state or inject arbitrary reference text.
create or replace function public.guard_booking_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.reference := 'BK-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  new.status := 'pending';
  new.client_name := left(trim(new.client_name), 80);
  new.email := lower(trim(new.email));
  new.phone := left(trim(new.phone), 40);
  new.service_name := left(trim(new.service_name), 120);
  new.preferred_time := left(trim(new.preferred_time), 10);
  new.location := left(trim(new.location), 120);
  new.message := left(new.message, 2000);
  if new.num_people is null or new.num_people < 1 then
    new.num_people := 1;
  elsif new.num_people > 200 then
    new.num_people := 200;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_booking_insert_on_bookings on public.bookings;
create trigger guard_booking_insert_on_bookings
  before insert on public.bookings
  for each row execute procedure public.guard_booking_insert();