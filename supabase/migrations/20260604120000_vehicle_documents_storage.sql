-- Vehicle document media support.

alter table public.vehicles
  add column if not exists document_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vehicle-documents',
  'vehicle-documents',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "vehicle_documents_public_read"
on storage.objects
for select
using (bucket_id = 'vehicle-documents');

create policy "vehicle_documents_owner_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'vehicle-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "vehicle_documents_owner_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'vehicle-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'vehicle-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "vehicle_documents_owner_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'vehicle-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);
