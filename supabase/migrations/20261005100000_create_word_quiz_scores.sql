/*
# Create word_quiz_scores table for English vocabulary speed attack leaderboard

1. New Table: `word_quiz_scores`
  - `id` (uuid, primary key)
  - `player_name` (text, not null) — Name or nickname of the student
  - `score` (int, not null) — Number of correct answers (0..10)
  - `total_questions` (int, not null, default 10)
  - `time_ms` (int, not null) — Elapsed clear time in milliseconds
  - `game_points` (int, not null, default 0) — Overall arcade score (base + speed + combo bonus)
  - `max_combo` (int, not null, default 0) — Highest streak of consecutive correct answers
  - `course` (text, not null, default 'all') — 'all' | 'j1' | 'j2' | 'j3'
  - `created_at` (timestamptz, default now())

2. Indexes:
  - Indexed on `(score DESC, time_ms ASC)` for fast leaderboard ranking
  - Indexed on `(created_at DESC)` for daily ranking
*/

CREATE TABLE IF NOT EXISTS word_quiz_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_uuid text NOT NULL DEFAULT '',
  player_name text NOT NULL,
  score int NOT NULL,
  total_questions int NOT NULL DEFAULT 10,
  time_ms int NOT NULL,
  game_points int NOT NULL DEFAULT 0,
  max_combo int NOT NULL DEFAULT 0,
  course text NOT NULL DEFAULT 'season1',
  created_at timestamptz DEFAULT now()
);

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_word_scores_ranking ON word_quiz_scores (course, score DESC, time_ms ASC);
CREATE INDEX IF NOT EXISTS idx_word_scores_uuid ON word_quiz_scores (player_uuid);
CREATE INDEX IF NOT EXISTS idx_word_scores_created ON word_quiz_scores (created_at DESC);

-- Enable RLS
ALTER TABLE word_quiz_scores ENABLE ROW LEVEL SECURITY;

-- Allow public read access to rankings
DROP POLICY IF EXISTS "anon_select_word_quiz_scores" ON word_quiz_scores;
CREATE POLICY "anon_select_word_quiz_scores" ON word_quiz_scores FOR SELECT
  TO anon, authenticated USING (true);

-- Allow students to insert their scores
DROP POLICY IF EXISTS "anon_insert_word_quiz_scores" ON word_quiz_scores;
CREATE POLICY "anon_insert_word_quiz_scores" ON word_quiz_scores FOR INSERT
  TO anon, authenticated WITH CHECK (true);
