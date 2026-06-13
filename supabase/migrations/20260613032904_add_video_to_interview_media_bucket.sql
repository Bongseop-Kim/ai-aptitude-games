-- P2 Pro-only interview video: the interview-media bucket previously allowed only
-- audio MIME types and capped at 25 MiB, which would reject video/mp4 uploads.
-- Widen the allowlist and raise the size limit. RLS policies are extension-agnostic
-- and need no change.
update storage.buckets
set
  allowed_mime_types = ARRAY[
    'audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/aac',
    'video/mp4', 'video/quicktime'
  ],
  file_size_limit = 157286400  -- ~150 MiB
where id = 'interview-media';
