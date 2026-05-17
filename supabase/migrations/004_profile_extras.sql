-- Add location and favourite players to profiles
alter table public.profiles
  add column if not exists location        text,
  add column if not exists favorite_players text[] default '{}';

-- Allow users to update their own profile row
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'profiles'
      and policyname = 'Users can update own profile'
  ) then
    execute $policy$
      create policy "Users can update own profile"
        on public.profiles for update
        using  (auth.uid() = id)
        with check (auth.uid() = id)
    $policy$;
  end if;
end $$;
