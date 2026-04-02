create table workouts (
  id uuid default gen_random_uuid() primary key,
  goal text not null,
  level text not null,
  muscles jsonb not null,
  equip jsonb not null,
  duration integer not null,
  workout_data jsonb not null,
  created_at timestamp default now()
);

-- Índices para búsquedas rápidas
create index idx_workouts_goal on workouts(goal);
create index idx_workouts_level on workouts(level);

-- Acceso público de lectura (sin auth)
alter table workouts enable row level security;
create policy "Public read" on workouts for select using (true);
