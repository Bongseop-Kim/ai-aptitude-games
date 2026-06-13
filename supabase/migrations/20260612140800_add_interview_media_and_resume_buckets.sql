-- Storage buckets for interview media (private, audio) and resumes (private, docs).
-- Per-user isolation: the first path segment must equal auth.uid().
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'interview-media',
    'interview-media',
    false,
    26214400,
    ARRAY['audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/aac']
  ),
  (
    'resumes',
    'resumes',
    false,
    10485760,
    ARRAY[
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  )
on conflict (id) do nothing;

-- interview-media: insert/select/update (update enables upsert on retake).
create policy "interview media insert own"
on "storage"."objects"
as permissive
for insert
to authenticated
with check ((bucket_id = 'interview-media'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text));

create policy "interview media select own"
on "storage"."objects"
as permissive
for select
to authenticated
using ((bucket_id = 'interview-media'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text));

create policy "interview media update own"
on "storage"."objects"
as permissive
for update
to authenticated
using ((bucket_id = 'interview-media'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text))
with check ((bucket_id = 'interview-media'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text));

-- resumes: insert/select/delete.
create policy "resumes insert own"
on "storage"."objects"
as permissive
for insert
to authenticated
with check ((bucket_id = 'resumes'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text));

create policy "resumes select own"
on "storage"."objects"
as permissive
for select
to authenticated
using ((bucket_id = 'resumes'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text));

create policy "resumes delete own"
on "storage"."objects"
as permissive
for delete
to authenticated
using ((bucket_id = 'resumes'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text));
