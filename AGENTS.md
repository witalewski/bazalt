# Bazalt Development Guidelines

## Running the App

- Assume the Expo dev server is running in the background
- Do NOT run `npx expo start` or `npx expo start --web` - the dev server should already be running
- If hot reload doesn't work, ask the user to restart the server

## Building

- Run `npx expo export --platform web` to build the web bundle (only when explicitly requested)
- The user will test locally and let you know if changes are needed

## Supabase

- Supabase MCP tools may not always be available
- If needed, use the CLI: `npx supabase db push` (requires SUPABASE_ACCESS_TOKEN)
- Database migrations are in `supabase/migrations/`

## Style Guidelines

- Black and white only, sharp corners, monospace fonts
- Always specify text color explicitly (color="white" or color="black") - never rely on defaults

## Data Fetching with TanStack Query

All data fetching MUST use TanStack Query hooks from `src/hooks/`. Never use useEffect for data fetching.

### Pattern

1. **Queries** - Use `useQuery` hooks for reading data (e.g., `useExercises`, `useWorkouts`, `useWorkoutSession`)
2. **Mutations** - Use `useMutation` hooks for creating/updating/deleting data (e.g., `useCreateExercise`, `useDeleteWorkout`)
3. **Query Keys** - Centralized in `src/lib/queryKeys.ts` for consistent cache management
4. **Cache Invalidation** - Mutations automatically invalidate relevant caches via `queryClient.invalidateQueries`

### Example

```tsx
function MyScreen() {
  const { user } = useStore();
  const { data: exercises = [], isLoading } = useExercises(user?.id);
  const createExercise = useCreateExercise();

  const handleCreate = async (data) => {
    await createExercise.mutateAsync({ userId: user.id, ...data });
    navigation.goBack();
  };
}
```

## Environment Variables

- Never commit secrets to git
- .env.local is gitignored but .env is not - use .env.local for sensitive keys
- Supabase anon key must be set in .env.local as EXPO_PUBLIC_SUPABASE_KEY
