-- Court bookmarks ("want to play" wishlist)
create table if not exists public.court_bookmarks (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  court_id   uuid not null references public.courts(id)   on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, court_id)
);

alter table public.court_bookmarks enable row level security;

create policy "Bookmarks are viewable by everyone"
  on public.court_bookmarks for select using (true);

create policy "Users can bookmark courts"
  on public.court_bookmarks for insert with check (auth.uid() = user_id);

create policy "Users can remove their own bookmarks"
  on public.court_bookmarks for delete using (auth.uid() = user_id);
