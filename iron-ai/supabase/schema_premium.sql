-- supabase/schema_premium.sql
--
-- INSTRUCCIONES: Ejecutar este SQL manualmente en el Supabase Dashboard:
--   https://supabase.com/dashboard/project/afukfanypnnsauxhfdmj/sql/new
--
-- Pega todo el contenido de este archivo y haz clic en "Run".

-- Usuarios premium (pago único)
create table if not exists premium_users (
  user_id        uuid references auth.users(id) on delete cascade primary key,
  purchased_at   timestamp default now(),
  payment_ref    text
);
alter table premium_users enable row level security;
create policy "read_own" on premium_users
  for select using (auth.uid() = user_id);

-- Seguimiento de peso
create table if not exists weight_logs (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade,
  logged_at  date not null default current_date,
  weight_kg  numeric(5,2) not null,
  note       text
);
alter table weight_logs enable row level security;
create policy "crud_own" on weight_logs
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Índice único para queries por usuario y soportar upsert onConflict
create unique index if not exists weight_logs_user_date
  on weight_logs (user_id, logged_at);
