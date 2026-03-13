import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { queryKeys } from '../lib/queryKeys';
import type { WorkoutSession, Workout, ExerciseLog, Exercise } from '../types';
import { useStore } from '../lib/store';

export interface SessionWithWorkout {
  id: string;
  user_id: string;
  workout_id: string | null;
  started_at: string;
  completed_at: string | null;
  is_deleted: boolean;
  notes: string | null;
  workout?: Workout | null;
}

export interface ExerciseLogWithExercise {
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
  exercise?: Exercise | null;
}

export function useWorkoutSession(sessionId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.workoutSessions.detail(sessionId || ''),
    queryFn: async (): Promise<SessionWithWorkout | null> => {
      if (!sessionId) return null;
      
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*, workout:workouts(*)')
        .eq('id', sessionId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!sessionId,
  });
}

export function useExerciseLogs(sessionId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.exerciseLogs.bySession(sessionId || ''),
    queryFn: async (): Promise<ExerciseLogWithExercise[]> => {
      if (!sessionId) return [];
      
      const { data, error } = await supabase
        .from('exercise_logs')
        .select('*, exercise:exercises(*)')
        .eq('session_id', sessionId)
        .eq('is_deleted', false)
        .order('logged_at');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!sessionId,
  });
}

interface CreateSessionInput {
  userId: string;
  workoutId: string;
}

export function useCreateWorkoutSession() {
  const queryClient = useQueryClient();
  const { setActiveSession } = useStore();
  
  return useMutation({
    mutationFn: async (input: CreateSessionInput): Promise<WorkoutSession> => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: input.userId,
          workout_id: input.workoutId,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (session) => {
      setActiveSession(session);
    },
  });
}

interface LogExerciseSetInput {
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  reps?: number | null;
  weightKg?: number | null;
  timeSeconds?: number | null;
}

export function useLogExerciseSet() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: LogExerciseSetInput): Promise<ExerciseLog> => {
      const { data, error } = await supabase
        .from('exercise_logs')
        .insert({
          session_id: input.sessionId,
          exercise_id: input.exerciseId,
          set_number: input.setNumber,
          reps: input.reps || null,
          weight_kg: input.weightKg || null,
          time_seconds: input.timeSeconds || null,
          is_completed: true,
          completed_at: new Date().toISOString(),
          logged_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.exerciseLogs.bySession(variables.sessionId) 
      });
    },
  });
}

interface FinishWorkoutSessionInput {
  sessionId: string;
}

export function useFinishWorkoutSession() {
  const queryClient = useQueryClient();
  const { clearSession } = useStore();
  
  return useMutation({
    mutationFn: async (input: FinishWorkoutSessionInput): Promise<void> => {
      const { error } = await supabase
        .from('workout_sessions')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', input.sessionId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      clearSession();
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.workoutSessions.detail(variables.sessionId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.exerciseLogs.bySession(variables.sessionId) 
      });
    },
  });
}
