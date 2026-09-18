/*
# Create students and test_progress tables (single-tenant, no auth)

1. New Tables
- `students`: stores student names for progress tracking
  - `id` (uuid, primary key)
  - `name` (text, not null) — student's display name
  - `created_at` (timestamptz, default now())
- `test_progress`: stores pass/fail records per student per test range
  - `id` (uuid, primary key)
  - `student_id` (uuid, foreign key to students.id, cascade delete)
  - `test_type` (text, not null) — 'unit' for 2-section unit tests (e.g. S1-S2), 'summary' for 6-section summary tests (e.g. S1-S6)
  - `range_start` (int, not null) — starting section number
  - `range_end` (int, not null) — ending section number
  - `passed` (boolean, not null, default false) — whether the student passed this test
  - `recorded_date` (date, not null, default current_date) — date the result was recorded
  - `created_at` (timestamptz, default now())
  - Unique constraint on (student_id, test_type, range_start, range_end) to prevent duplicate records for the same test

2. Security
- Enable RLS on both tables.
- Allow anon + authenticated full CRUD (single-tenant app, no sign-in).
- All data is intentionally shared/public.

3. Important Notes
- This is a no-auth app. All policies use `TO anon, authenticated` with `USING (true)`.
- The unique constraint ensures one progress record per student per test range.
- Cascade delete on student_id means deleting a student also removes their progress.
*/

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_students" ON students;
CREATE POLICY "anon_select_students" ON students FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_students" ON students;
CREATE POLICY "anon_insert_students" ON students FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_students" ON students;
CREATE POLICY "anon_update_students" ON students FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_students" ON students;
CREATE POLICY "anon_delete_students" ON students FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS test_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  test_type text NOT NULL CHECK (test_type IN ('unit', 'summary')),
  range_start int NOT NULL,
  range_end int NOT NULL,
  passed boolean NOT NULL DEFAULT false,
  recorded_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (student_id, test_type, range_start, range_end)
);

ALTER TABLE test_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_progress" ON test_progress;
CREATE POLICY "anon_select_progress" ON test_progress FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_progress" ON test_progress;
CREATE POLICY "anon_insert_progress" ON test_progress FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_progress" ON test_progress;
CREATE POLICY "anon_update_progress" ON test_progress FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_progress" ON test_progress;
CREATE POLICY "anon_delete_progress" ON test_progress FOR DELETE
  TO anon, authenticated USING (true);
