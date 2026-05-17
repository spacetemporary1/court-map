-- Add photo support to activities
alter table public.activities add column if not exists image_url text;

-- Storage bucket for activity photos (5 MB limit, images only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'activity-photos',
  'activity-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Storage RLS policies
create policy "Activity photos are publicly visible"
  on storage.objects for select
  using (bucket_id = 'activity-photos');

create policy "Authenticated users can upload activity photos"
  on storage.objects for insert
  with check (bucket_id = 'activity-photos' and auth.role() = 'authenticated');

create policy "Users can delete their own activity photos"
  on storage.objects for delete
  using (
    bucket_id = 'activity-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
