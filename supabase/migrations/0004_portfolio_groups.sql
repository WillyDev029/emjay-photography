-- Add grouped portfolio support to portfolio_photos.
-- group_id: NULL = standalone photo (existing behavior), UUID = photos belong to the same post
-- position: order within a group, 0 = cover/primary image

alter table public.portfolio_photos
  add column if not exists group_id uuid,
  add column if not exists position int not null default 0;

create index if not exists idx_portfolio_photos_group_id on public.portfolio_photos (group_id);
