-- Database migration for Bazalt exercise tracking app
-- Run this on your Supabase project

CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  video_link TEXT,
  tracking_mode TEXT NOT NULL DEFAULT 'reps' CHECK (tracking_mode IN ('reps', 'time', 'emom')),
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  target_sets INTEGER,
  target_reps INTEGER,
  target_weight_kg DECIMAL(10,2),
  target_minutes INTEGER,
  target_time_seconds INTEGER,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT false,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight_kg DECIMAL(10,2),
  time_seconds INTEGER,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT false,
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can manage own exercises" ON exercises;
CREATE POLICY "Users can manage own exercises" ON exercises FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own workouts" ON workouts;
CREATE POLICY "Users can manage own workouts" ON workouts FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own workout_exercises" ON workout_exercises;
CREATE POLICY "Users can manage own workout_exercises" ON workout_exercises FOR ALL USING (workout_id IN (SELECT id FROM workouts WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage own workout_sessions" ON workout_sessions;
CREATE POLICY "Users can manage own workout_sessions" ON workout_sessions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own exercise_logs" ON exercise_logs;
CREATE POLICY "Users can manage own exercise_logs" ON exercise_logs FOR ALL USING (session_id IN (SELECT id FROM workout_sessions WHERE user_id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exercises_user_id ON exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_session_id ON exercise_logs(session_id);
