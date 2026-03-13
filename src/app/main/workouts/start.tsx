import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, Text, Button } from '../../../components/ui';
import { useWorkout, useWorkoutExercises, useCreateWorkoutSession } from '../../../hooks';
import { useStore } from '../../../lib/store';
import { MainStackParamList } from '../_layout';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;
type StartRouteProp = RouteProp<MainStackParamList, 'workout-start'>;

export default function WorkoutStartScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<StartRouteProp>();
  const { workoutId } = route.params;
  const { user } = useStore();
  const { data: workout, isLoading: workoutLoading } = useWorkout(workoutId);
  const { data: workoutExercises = [], isLoading: exercisesLoading } = useWorkoutExercises(workoutId);
  const createSession = useCreateWorkoutSession();
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const session = await createSession.mutateAsync({
        userId: user.id,
        workoutId,
      });
      navigation.replace('track-session', { sessionId: session.id });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to start workout');
    } finally {
      setLoading(false);
    }
  };

  if (workoutLoading || !workout) {
    return (
      <Screen>
        <View style={styles.notFound}>
          <Text variant="caption" color="muted">LOADING...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text variant="h2">{workout.name}</Text>
          {workout.description && (
            <Text variant="caption" color="muted" style={styles.description}>
              {workout.description}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text variant="label" color="muted">
            EXERCISES ({workoutExercises.length})
          </Text>
          
          {workoutExercises.map((we, index) => (
            <View key={we.id} style={styles.exerciseItem}>
              <Text variant="body">
                {index + 1}. {we.exercise?.name || 'Unknown'}
              </Text>
              <View style={styles.exerciseDetails}>
                {we.exercise?.tracking_mode === 'reps' && (
                  <Text variant="caption" color="muted">
                    {we.target_sets} sets × {we.target_reps} reps
                    {we.target_weight_kg ? ` @ ${we.target_weight_kg}kg` : ''}
                  </Text>
                )}
                {we.exercise?.tracking_mode === 'time' && (
                  <Text variant="caption" color="muted">
                    {we.target_sets} sets × {we.target_time_seconds}s
                    {we.target_weight_kg ? ` @ ${we.target_weight_kg}kg` : ''}
                  </Text>
                )}
                {we.exercise?.tracking_mode === 'emom' && (
                  <Text variant="caption" color="muted">
                    {we.target_minutes} minutes @ {we.target_reps}/min
                  </Text>
                )}
              </View>
            </View>
          ))}

          {workoutExercises.length === 0 && (
            <View style={styles.empty}>
              <Text variant="caption" color="muted">
                No exercises in this workout
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <Button
            title="START WORKOUT"
            onPress={handleStart}
            loading={loading}
            disabled={loading || workoutExercises.length === 0}
          />
          <Button
            title="BACK"
            onPress={() => navigation.goBack()}
            variant="ghost"
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  description: {
    marginTop: 8,
  },
  section: {
    padding: 16,
  },
  exerciseItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  exerciseDetails: {
    marginTop: 4,
  },
  empty: {
    padding: 16,
    alignItems: 'center',
  },
  actions: {
    padding: 16,
    gap: 12,
  },
});
