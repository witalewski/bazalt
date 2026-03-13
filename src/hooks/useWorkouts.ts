import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { queryKeys } from '../lib/queryKeys';
import type { Workout, WorkoutExercise, Exercise } from '../types';

export interface WorkoutExerciseWithDetails extends WorkoutExercise {
  exercise?: Exercise;
}

export function useWorkouts(userId: string | undefined, includeDeleted = false) {
  return useQuery({
    queryKey: queryKeys.workouts.list({ userId: userId || '', includeDeleted }),
    queryFn: async (): Promise<Workout[]> => {
      if (!userId) return [];
      
      let query = supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (!includeDeleted) {
        query = query.eq('is_deleted', false);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

export function useWorkoutCount(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.workouts.count(userId || ''),
    queryFn: async (): Promise<number> => {
      if (!userId) return 0;
      
      const { count, error } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_deleted', false);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
  });
}

export function useWorkout(workoutId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.workouts.detail(workoutId || ''),
    queryFn: async (): Promise<Workout | null> => {
      if (!workoutId) return null;
      
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', workoutId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!workoutId,
  });
}

export function useWorkoutExercises(workoutId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.workoutExercises.byWorkout(workoutId || ''),
    queryFn: async (): Promise<WorkoutExerciseWithDetails[]> => {
      if (!workoutId) return [];
      
      const { data, error } = await supabase
        .from('workout_exercises')
        .select('*, exercise:exercises(*)')
        .eq('workout_id', workoutId)
        .order('order_index');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!workoutId,
  });
}

interface CreateWorkoutInput {
  userId: string;
  name: string;
  description?: string | null;
  exercises: {
    exerciseId: string;
    orderIndex: number;
    targetSets?: number;
    targetReps?: number;
    targetWeightKg?: number | null;
    targetMinutes?: number | null;
  }[];
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateWorkoutInput): Promise<Workout> => {
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: input.userId,
          name: input.name,
          description: input.description || null,
        })
        .select()
        .single();
      
      if (workoutError) throw workoutError;
      if (!workout) throw new Error('Failed to create workout');
      
      const workoutExercises = input.exercises.map(e => ({
        workout_id: workout.id,
        exercise_id: e.exerciseId,
        order_index: e.orderIndex,
        target_sets: e.targetSets,
        target_reps: e.targetReps,
        target_weight_kg: e.targetWeightKg,
        target_minutes: e.targetMinutes,
      }));
      
      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(workoutExercises);
      
      if (exercisesError) throw exercisesError;
      
      return workout;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.workouts.list({ userId: variables.userId }) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.workouts.count(variables.userId) 
      });
    },
  });
}

interface DeleteWorkoutInput {
  workoutId: string;
  userId: string;
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: DeleteWorkoutInput): Promise<void> => {
      const { error } = await supabase
        .from('workouts')
        .update({ is_deleted: true })
        .eq('id', input.workoutId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.workouts.detail(variables.workoutId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.workouts.list({ userId: variables.userId }) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.workouts.count(variables.userId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.workoutExercises.byWorkout(variables.workoutId) 
      });
    },
  });
}
