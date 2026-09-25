/*
# Create materials table and storage bucket policies for educational material distribution

1. New Table: `materials`
  - `id` (uuid, primary key)
  - `title` (text, not null) — Title of the handout/audio/video
  - `description` (text) — Instructions, homework notes, etc.
  - `media_type` (text, not null) — 'pdf' | 'audio' | 'video' | 'image' | 'other'
  - `grade` (text, not null, default 'all') — 'all' | 'j1' | 'j2' | 'j3'
  - `category` (text, not null, default 'print') — 'print' | 'homework' | 'exam' | 'audio' | 'video' | 'other'
  - `file_url` (text, not null) — Public URL in Supabase Storage or external URL (e.g. YouTube)
  - `storage_path` (text) — Path inside Supabase Storage bucket `materials`
  - `file_size` (bigint) — File size in bytes
  - `related_section_start` (int) — Optional starting grammar section (1..72)
  - `related_section_end` (int) — Optional ending grammar section (1..72)
  - `is_published` (boolean, default true)
  - `is_pinned` (boolean, default false)
  - `created_at` (timestamptz, default now())

2. Storage Bucket: `materials`
  - Public bucket for easy student download & inline viewing via URL/QR
*/

CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  media_type text NOT NULL CHECK (media_type IN ('pdf', 'audio', 'video', 'image', 'other')),
  grade text NOT NULL DEFAULT 'all' CHECK (grade IN ('all', 'j1', 'j2', 'j3')),
  category text NOT NULL DEFAULT 'print',
  file_url text NOT NULL,
  storage_path text,
  file_size bigint,
  related_section_start int,
  related_section_end int,
  is_published boolean NOT NULL DEFAULT true,
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_materials" ON materials;
CREATE POLICY "anon_select_materials" ON materials FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_materials" ON materials;
CREATE POLICY "anon_insert_materials" ON materials FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_materials" ON materials;
CREATE POLICY "anon_update_materials" ON materials FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_materials" ON materials;
CREATE POLICY "anon_delete_materials" ON materials FOR DELETE
  TO anon, authenticated USING (true);

-- Create storage bucket 'materials' if storage schema is available
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access Materials Bucket" ON storage.objects;
CREATE POLICY "Public Access Materials Bucket" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'materials');

DROP POLICY IF EXISTS "Public Upload Materials Bucket" ON storage.objects;
CREATE POLICY "Public Upload Materials Bucket" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'materials');

DROP POLICY IF EXISTS "Public Update Materials Bucket" ON storage.objects;
CREATE POLICY "Public Update Materials Bucket" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'materials');

DROP POLICY IF EXISTS "Public Delete Materials Bucket" ON storage.objects;
CREATE POLICY "Public Delete Materials Bucket" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'materials');
