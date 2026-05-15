
-- Profiles
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles selectable by owner" on public.profiles
  for select using (auth.uid() = user_id);
create policy "Profiles insertable by owner" on public.profiles
  for insert with check (auth.uid() = user_id);
create policy "Profiles updatable by owner" on public.profiles
  for update using (auth.uid() = user_id);

-- Resumes
create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled Resume',
  template text not null default 'modern',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index resumes_user_id_idx on public.resumes(user_id);

alter table public.resumes enable row level security;

create policy "Resumes selectable by owner" on public.resumes
  for select using (auth.uid() = user_id);
create policy "Resumes insertable by owner" on public.resumes
  for insert with check (auth.uid() = user_id);
create policy "Resumes updatable by owner" on public.resumes
  for update using (auth.uid() = user_id);
create policy "Resumes deletable by owner" on public.resumes
  for delete using (auth.uid() = user_id);

-- Updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

create trigger update_resumes_updated_at
  before update on public.resumes
  for each row execute function public.update_updated_at_column();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
