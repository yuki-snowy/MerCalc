-- MerCalc: 自宅内資産管理の初期スキーマ
-- Supabase SQL Editor または `supabase db push` で適用してください。

create extension if not exists "pgcrypto";

create type public.asset_condition as enum (
  'new',
  'like_new',
  'good',
  'fair',
  'poor'
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  name text not null,
  category text not null default 'その他',
  brand text,
  purchase_price integer check (purchase_price is null or purchase_price >= 0),
  purchase_date date,
  market_price integer check (market_price is null or market_price >= 0),
  market_price_updated_at timestamptz,
  condition public.asset_condition not null default 'good',
  notes text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assets_user_id_idx on public.assets (user_id);
create index if not exists assets_category_idx on public.assets (category);
create index if not exists assets_created_at_idx on public.assets (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists assets_set_updated_at on public.assets;
create trigger assets_set_updated_at
before update on public.assets
for each row
execute function public.set_updated_at();

alter table public.assets enable row level security;

-- 個人利用向け: 認証済みユーザーは自分の行のみ操作可能
create policy "assets_select_own"
  on public.assets for select
  to authenticated
  using (auth.uid() = user_id);

create policy "assets_insert_own"
  on public.assets for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "assets_update_own"
  on public.assets for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "assets_delete_own"
  on public.assets for delete
  to authenticated
  using (auth.uid() = user_id);

-- デモ / 単一ユーザー運用向け（Auth なしでも anon から操作可能）
-- 本番で Auth を有効化する場合は、以下ポリシーを削除してください。
create policy "assets_anon_all_for_personal_use"
  on public.assets for all
  to anon
  using (true)
  with check (true);

insert into storage.buckets (id, name, public)
values ('asset-images', 'asset-images', true)
on conflict (id) do nothing;

create policy "asset_images_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'asset-images');

create policy "asset_images_authenticated_upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'asset-images');

create policy "asset_images_anon_upload_for_personal_use"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'asset-images');
