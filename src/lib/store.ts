import { create } from 'zustand';
import type { User, Exercise, Workout, WorkoutSession, WorkoutExercise, TrackingMode } from '../types';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnline: boolean;
  
  exercises: Exercise[];
  workouts: Workout[];
  workoutExercises: WorkoutExercise[];
  activeSession: WorkoutSession | null;
  
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setOnline: (online: boolean) => void;
  
  setExercises: (exercises: Exercise[]) => void;
  addExercise: (exercise: Exercise) => void;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  removeExercise: (id: string) => void;
  
  setWorkouts: (workouts: Workout[]) => void;
  addWorkout: (workout: Workout) => void;
  updateWorkout: (id: string, updates: Partial<Workout>) => void;
  removeWorkout: (id: string) => void;

  setWorkoutExercises: (workoutExercises: WorkoutExercise[]) => void;
  addWorkoutExercise: (workoutExercise: WorkoutExercise) => void;
  removeWorkoutExercise: (id: string) => void;
  
  setActiveSession: (session: WorkoutSession | null) => void;
  clearSession: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isOnline: true,
  
  exercises: [],
  workouts: [],
  workoutExercises: [],
  activeSession: null,
  
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setOnline: (isOnline) => set({ isOnline }),
  
  setExercises: (exercises) => set({ exercises }),
  addExercise: (exercise) => set((state) => ({ 
    exercises: [...state.exercises, exercise] 
  })),
  updateExercise: (id, updates) => set((state) => ({
    exercises: state.exercises.map((e) => 
      e.id === id ? { ...e, ...updates } : e
    ),
  })),
  removeExercise: (id) => set((state) => ({
    exercises: state.exercises.filter((e) => e.id !== id),
  })),
  
  setWorkouts: (workouts) => set({ workouts }),
  addWorkout: (workout) => set((state) => ({ 
    workouts: [...state.workouts, workout] 
  })),
  updateWorkout: (id, updates) => set((state) => ({
    workouts: state.workouts.map((w) => 
      w.id === id ? { ...w, ...updates } : w
    ),
  })),
  removeWorkout: (id) => set((state) => ({
    workouts: state.workouts.filter((w) => w.id !== id),
  })),

  setWorkoutExercises: (workoutExercises) => set({ workoutExercises }),
  addWorkoutExercise: (workoutExercise) => set((state) => ({ 
    workoutExercises: [...state.workoutExercises, workoutExercise] 
  })),
  removeWorkoutExercise: (id) => set((state) => ({
    workoutExercises: state.workoutExercises.filter((we) => we.id !== id),
  })),
  
  setActiveSession: (activeSession) => set({ activeSession }),
  clearSession: () => set({ activeSession: null }),
}));

export const STARTER_EXERCISES: Omit<Exercise, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Push-up',
    description: 'Classic bodyweight chest exercise',
    video_link: null,
    tracking_mode: 'reps',
    is_deleted: false,
  },
  {
    name: 'Squat',
    description: 'Lower body fundamental',
    video_link: null,
    tracking_mode: 'reps',
    is_deleted: false,
  },
  {
    name: 'Dumbbell Bench Press',
    description: 'Chest with free weights',
    video_link: null,
    tracking_mode: 'reps',
    is_deleted: false,
  },
  {
    name: 'Seated Dumbbell Shoulder Press',
    description: 'Overhead pressing',
    video_link: null,
    tracking_mode: 'reps',
    is_deleted: false,
  },
  {
    name: 'Bent Over Row',
    description: 'Back pulling movement',
    video_link: null,
    tracking_mode: 'reps',
    is_deleted: false,
  },
  {
    name: 'Plank',
    description: 'Core stability hold',
    video_link: null,
    tracking_mode: 'time',
    is_deleted: false,
  },
  {
    name: 'Dumbbell Curl',
    description: 'Bicep isolation',
    video_link: null,
    tracking_mode: 'reps',
    is_deleted: false,
  },
  {
    name: 'Tricep Dip',
    description: 'Bodyweight triceps',
    video_link: null,
    tracking_mode: 'reps',
    is_deleted: false,
  },
  {
    name: 'EMOM Sit-ups',
    description: 'Every Minute On the Minute core',
    video_link: null,
    tracking_mode: 'emom',
    is_deleted: false,
  },
  {
    name: 'Romanian Deadlift',
    description: 'Hamstring focused deadlift',
    video_link: null,
    tracking_mode: 'reps',
    is_deleted: false,
  },
];
