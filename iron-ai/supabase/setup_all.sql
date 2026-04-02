-- Ejecutar en: Supabase Dashboard → SQL Editor → New query

-- ── cardio_exercises ──────────────────────────────────────────────────────────
create table if not exists cardio_exercises (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  name_es text not null,
  type text not null,
  intensity text not null,
  work_time integer not null,
  rest_time integer not null,
  rounds integer not null,
  total_minutes numeric(4,1) not null,
  instructions text,
  tip text,
  image_url text,
  created_at timestamp default now()
);
create index if not exists idx_cardio_type_intensity on cardio_exercises(type, intensity);
alter table cardio_exercises enable row level security;
create policy "Public read cardio" on cardio_exercises for select using (true);

-- ── calisthenics_skills ───────────────────────────────────────────────────────
create table if not exists calisthenics_skills (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  name_es text not null,
  category text not null,
  steps jsonb not null,
  sort_order integer default 0,
  created_at timestamp default now()
);
create index if not exists idx_cali_category on calisthenics_skills(category);
alter table calisthenics_skills enable row level security;
create policy "Public read cali" on calisthenics_skills for select using (true);

-- ── user_calisthenics_progress ────────────────────────────────────────────────
create table if not exists user_calisthenics_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id uuid not null references calisthenics_skills(id) on delete cascade,
  current_step integer not null default 1,
  updated_at timestamp default now(),
  unique(user_id, skill_id)
);
create index if not exists idx_ucprog_user on user_calisthenics_progress(user_id);
alter table user_calisthenics_progress enable row level security;
create policy "Users own progress select" on user_calisthenics_progress
  for select using (auth.uid() = user_id);
create policy "Users own progress all" on user_calisthenics_progress
  for all using (auth.uid() = user_id);
