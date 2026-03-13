import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { queryKeys } from '../lib/queryKeys';
import type { Exercise } from '../types';

export function useExercises(userId: string | undefined, includeDeleted = false) {
  return useQuery({
    queryKey: queryKeys.exercises.list({ userId: userId || '', includeDeleted }),
    queryFn: async (): Promise<Exercise[]> => {
      if (!userId) return [];
      
      let query = supabase
        .from('exercises')
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

export function useExerciseCount(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.exercises.count(userId || ''),
    queryFn: async (): Promise<number> => {
      if (!userId) return 0;
      
      const { count, error } = await supabase
        .from('exercises')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_deleted', false);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
  });
}

export function useExercise(exerciseId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.exercises.detail(exerciseId || ''),
    queryFn: async (): Promise<Exercise | null> => {
      if (!exerciseId) return null;
      
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', exerciseId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!exerciseId,
  });
}

interface CreateExerciseInput {
  userId: string;
  name: string;
  description?: string | null;
  video_link?: string | null;
  tracking_mode: 'reps' | 'time' | 'emom';
}

export function useCreateExercise() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateExerciseInput): Promise<Exercise> => {
      const { data, error } = await supabase
        .from('exercises')
        .insert({
          user_id: input.userId,
          name: input.name,
          description: input.description || null,
          video_link: input.video_link || null,
          tracking_mode: input.tracking_mode,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.exercises.list({ userId: variables.userId }) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.exercises.count(variables.userId) 
      });
    },
  });
}

interface UpdateExerciseInput {
  exerciseId: string;
  userId: string;
  updates: Partial<Pick<Exercise, 'name' | 'description' | 'video_link' | 'tracking_mode'>>;
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: UpdateExerciseInput): Promise<void> => {
      const { error } = await supabase
        .from('exercises')
        .update({
          ...input.updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.exerciseId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.exercises.detail(variables.exerciseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.exercises.list({ userId: variables.userId }) 
      });
    },
  });
}

interface DeleteExerciseInput {
  exerciseId: string;
  userId: string;
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: DeleteExerciseInput): Promise<void> => {
      const { error } = await supabase
        .from('exercises')
        .update({ is_deleted: true })
        .eq('id', input.exerciseId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.exercises.detail(variables.exerciseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.exercises.list({ userId: variables.userId }) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.exercises.count(variables.userId) 
      });
    },
  });
}

interface SeedExercisesInput {
  userId: string;
  exercises: Omit<Exercise, 'id' | 'user_id' | 'created_at' | 'updated_at'>[];
}

export function useSeedExercises() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: SeedExercisesInput): Promise<Exercise[]> => {
      const exercisesToInsert = input.exercises.map(e => ({
        ...e,
        user_id: input.userId,
      }));
      
      const { data, error } = await supabase
        .from('exercises')
        .insert(exercisesToInsert)
        .select();
      
      if (error) throw error;
      return data || [];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.exercises.list({ userId: variables.userId }) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.exercises.count(variables.userId) 
      });
    },
  });
}
