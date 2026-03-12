export type TrackingMode = 'reps' | 'time' | 'emom';

export interface Exercise {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  video_link: string | null;
  tracking_mode: TrackingMode;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Workout {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  order_index: number;
  target_sets: number | null;
  target_reps: number | null;
  target_weight_kg: number | null;
  target_minutes: number | null;
  target_time_seconds: number | null;
  notes: string | null;
  exercise?: Exercise;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_id: string | null;
  started_at: string;
  completed_at: string | null;
  is_deleted: boolean;
  notes: string | null;
  workout?: Workout;
}

export interface ExerciseLog {
  id: string;
  session_id: string;
  exercise_id: string | null;
  set_number: number;
  reps: number | null;
  weight_kg: number | null;
  time_seconds: number | null;
  is_completed: boolean;
  completed_at: string | null;
  is_deleted: boolean;
  notes: string | null;
  logged_at: string;
  exercise?: Exercise;
}

export interface User {
  id: string;
  email: string;
}

export type TimerMode = 'stopwatch' | 'countdown' | 'emom';
