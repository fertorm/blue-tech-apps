create table cardio_exercises (
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

create index idx_cardio_type on cardio_exercises(type);
create index idx_cardio_intensity on cardio_exercises(intensity);
create index idx_cardio_type_intensity on cardio_exercises(type, intensity);

alter table cardio_exercises enable row level security;
create policy "Public read" on cardio_exercises for select using (true);
