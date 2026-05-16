-- Enable PostGIS for geographic queries (optional but useful)
-- create extension if not exists postgis;

-- =====================
-- PROFILES
-- =====================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  full_name   text,
  avatar_url  text,
  bio         text,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================
-- COURTS
-- =====================
create table if not exists public.courts (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text,
  lat         double precision not null,
  lng         double precision not null,
  surface     text check (surface in ('hard', 'clay', 'grass', 'carpet')),
  num_courts  integer,
  is_indoor   boolean not null default false,
  is_public   boolean not null default true,
  added_by    uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table public.courts enable row level security;

create policy "Courts are viewable by everyone"
  on public.courts for select using (true);

create policy "Authenticated users can add courts"
  on public.courts for insert with check (auth.uid() is not null);

-- =====================
-- CHECK-INS
-- =====================
create table if not exists public.check_ins (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  court_id      uuid not null references public.courts(id) on delete cascade,
  checked_in_at timestamptz not null default now()
);

alter table public.check_ins enable row level security;

create policy "Check-ins are viewable by everyone"
  on public.check_ins for select using (true);

create policy "Users can check in"
  on public.check_ins for insert with check (auth.uid() = user_id);

-- =====================
-- ACTIVITIES
-- =====================
create table if not exists public.activities (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  court_id        uuid references public.courts(id) on delete set null,
  activity_type   text not null check (activity_type in ('checkin', 'match', 'practice')),
  description     text,
  score           text,
  opponent_name   text,
  played_at       timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

alter table public.activities enable row level security;

create policy "Activities are viewable by everyone"
  on public.activities for select using (true);

create policy "Users can create their own activities"
  on public.activities for insert with check (auth.uid() = user_id);

create policy "Users can delete their own activities"
  on public.activities for delete using (auth.uid() = user_id);

-- =====================
-- ACTIVITY LIKES
-- =====================
create table if not exists public.activity_likes (
  activity_id  uuid not null references public.activities(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (activity_id, user_id)
);

alter table public.activity_likes enable row level security;

create policy "Likes are viewable by everyone"
  on public.activity_likes for select using (true);

create policy "Users can like activities"
  on public.activity_likes for insert with check (auth.uid() = user_id);

create policy "Users can unlike activities"
  on public.activity_likes for delete using (auth.uid() = user_id);

-- =====================
-- FOLLOWS
-- =====================
create table if not exists public.follows (
  follower_id   uuid not null references public.profiles(id) on delete cascade,
  following_id  uuid not null references public.profiles(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);

alter table public.follows enable row level security;

create policy "Follows are viewable by everyone"
  on public.follows for select using (true);

create policy "Users can follow others"
  on public.follows for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on public.follows for delete using (auth.uid() = follower_id);
