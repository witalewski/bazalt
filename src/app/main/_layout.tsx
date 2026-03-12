import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './index';
import ExerciseListScreen from './exercises/index';
import ExerciseNewScreen from './exercises/new';
import ExerciseEditScreen from './exercises/[id]';
import WorkoutListScreen from './workouts/index';
import WorkoutNewScreen from './workouts/new';
import WorkoutDetailScreen from './workouts/[id]';
import WorkoutStartScreen from './workouts/start';
import TrackSessionScreen from './track/[sessionId]';
import SettingsScreen from './settings';

export type MainStackParamList = {
  home: undefined;
  exercises: undefined;
  'exercise-new': undefined;
  'exercise-edit': { exerciseId: string };
  workouts: undefined;
  'workout-new': undefined;
  'workout-detail': { workoutId: string };
  'workout-start': { workoutId: string };
  'track-session': { sessionId: string };
  settings: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#000000',
        headerTitleStyle: { fontFamily: 'Menlo', fontSize: 14 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen 
        name="home" 
        component={HomeScreen}
        options={{ title: 'BAZALT', headerShown: false }}
      />
      <Stack.Screen 
        name="exercises" 
        component={ExerciseListScreen}
        options={{ title: 'EXERCISES' }}
      />
      <Stack.Screen 
        name="exercise-new" 
        component={ExerciseNewScreen}
        options={{ title: 'NEW EXERCISE' }}
      />
      <Stack.Screen 
        name="exercise-edit" 
        component={ExerciseEditScreen}
        options={{ title: 'EDIT EXERCISE' }}
      />
      <Stack.Screen 
        name="workouts" 
        component={WorkoutListScreen}
        options={{ title: 'WORKOUTS' }}
      />
      <Stack.Screen 
        name="workout-new" 
        component={WorkoutNewScreen}
        options={{ title: 'NEW WORKOUT' }}
      />
      <Stack.Screen 
        name="workout-detail" 
        component={WorkoutDetailScreen}
        options={{ title: 'WORKOUT' }}
      />
      <Stack.Screen 
        name="workout-start" 
        component={WorkoutStartScreen}
        options={{ title: 'START WORKOUT' }}
      />
      <Stack.Screen 
        name="track-session" 
        component={TrackSessionScreen}
        options={{ title: 'TRACKING', headerLeft: () => null }}
      />
      <Stack.Screen 
        name="settings" 
        component={SettingsScreen}
        options={{ title: 'SETTINGS' }}
      />
    </Stack.Navigator>
  );
}
