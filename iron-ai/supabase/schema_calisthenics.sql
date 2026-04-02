create table calisthenics_skills (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  name_es text not null,
  category text not null,
  steps jsonb not null,
  sort_order integer default 0,
  created_at timestamp default now()
);

create index idx_cali_category on calisthenics_skills(category);

alter table calisthenics_skills enable row level security;
create policy "Public read" on calisthenics_skills for select using (true);

create table user_calisthenics_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id uuid not null references calisthenics_skills(id) on delete cascade,
  current_step integer not null default 1,
  updated_at timestamp default now(),
  unique(user_id, skill_id)
);

create index idx_ucprog_user on user_calisthenics_progress(user_id);

alter table user_calisthenics_progress enable row level security;
create policy "Users read own progress" on user_calisthenics_progress
  for select using (auth.uid() = user_id);
create policy "Users write own progress" on user_calisthenics_progress
  for all using (auth.uid() = user_id);
