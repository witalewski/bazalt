export const queryKeys = {
  exercises: {
    all: ['exercises'] as const,
    lists: () => [...queryKeys.exercises.all, 'list'] as const,
    list: (filters: { userId: string; includeDeleted?: boolean }) => 
      [...queryKeys.exercises.lists(), filters] as const,
    details: () => [...queryKeys.exercises.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.exercises.details(), id] as const,
    count: (userId: string) => [...queryKeys.exercises.all, 'count', userId] as const,
  },
  workouts: {
    all: ['workouts'] as const,
    lists: () => [...queryKeys.workouts.all, 'list'] as const,
    list: (filters: { userId: string; includeDeleted?: boolean }) => 
      [...queryKeys.workouts.lists(), filters] as const,
    details: () => [...queryKeys.workouts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.workouts.details(), id] as const,
    count: (userId: string) => [...queryKeys.workouts.all, 'count', userId] as const,
  },
  workoutExercises: {
    all: ['workoutExercises'] as const,
    byWorkout: (workoutId: string) => [...queryKeys.workoutExercises.all, 'workout', workoutId] as const,
  },
  workoutSessions: {
    all: ['workoutSessions'] as const,
    detail: (sessionId: string) => [...queryKeys.workoutSessions.all, 'detail', sessionId] as const,
  },
  exerciseLogs: {
    all: ['exerciseLogs'] as const,
    bySession: (sessionId: string) => [...queryKeys.exerciseLogs.all, 'session', sessionId] as const,
  },
};
