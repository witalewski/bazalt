import { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, Text, Input, Button } from '../../../components/ui';
import { ExerciseCard } from '../../../components/ExerciseCard';
import { useStore } from '../../../lib/store';
import { supabase } from '../../../lib/supabase';
import type { Exercise, WorkoutExercise } from '../../../types';
import { MainStackParamList } from '../../_layout';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;
type DetailRouteProp = RouteProp<MainStackParamList, 'workout-detail'>;

interface WorkoutExerciseWithDetails extends WorkoutExercise {
  exercise?: Exercise;
}

export default function WorkoutDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DetailRouteProp>();
  const { workoutId } = route.params;
  const { workouts, exercises } = useStore();
  
  const [workout, setWorkout] = useState<any>(null);
  const [workoutExercisesList, setWorkoutExercisesList] = useState<WorkoutExerciseWithDetails[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: workoutData, error: workoutError } = await supabase
          .from('workouts')
          .select('*')
          .eq('id', workoutId)
          .single();

        if (workoutError) throw workoutError;
        if (workoutData) setWorkout(workoutData);

        const { data: exercisesData, error: exercisesError } = await supabase
          .from('workout_exercises')
          .select('*, exercise:exercises(*)')
          .eq('workout_id', workoutId)
          .order('order_index');

        if (exercisesError) throw exercisesError;
        if (exercisesData) setWorkoutExercisesList(exercisesData);
      } catch (err) {
        console.error('Failed to fetch workout:', err);
      }
    };

    fetchData();
  }, [workoutId]);

  const handleStart = () => {
    navigation.navigate('workout-start', { workoutId });
  };

  if (!workout) {
    return (
      <Screen>
        <View style={styles.notFound}>
          <Text variant="caption" color="muted">WORKOUT NOT FOUND</Text>
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
          <Text variant="label" color="muted">EXERCISES ({workoutExercisesList.length})</Text>
          
          {workoutExercisesList.map((we, index) => (
            <View key={we.id} style={styles.exerciseItem}>
              <Text variant="body">
                {index + 1}. {we.exercise?.name || 'Unknown'}
              </Text>
              <View style={styles.exerciseTargets}>
                {we.exercise?.tracking_mode !== 'emom' && (
                  <>
                    {we.target_sets && (
                      <Text variant="caption" color="muted">
                        {we.target_sets}×{we.target_reps || 0}
                      </Text>
                    )}
                    {we.target_weight_kg !== null && (
                      <Text variant="caption" color="muted">
                        {we.target_weight_kg}kg
                      </Text>
                    )}
                  </>
                )}
                {we.exercise?.tracking_mode === 'emom' && (
                  <Text variant="caption" color="muted">
                    {we.target_minutes}min @ {we.target_reps}/min
                  </Text>
                )}
              </View>
            </View>
          ))}

          {workoutExercisesList.length === 0 && (
            <View style={styles.empty}>
              <Text variant="caption" color="muted">No exercises in this workout</Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <Button
            title="START WORKOUT"
            onPress={handleStart}
          />
          <Button
            title="DELETE WORKOUT"
            onPress={() => {
              Alert.alert(
                'Delete Workout',
                `Are you sure you want to delete "${workout.name}"?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await supabase
                          .from('workouts')
                          .update({ is_deleted: true })
                          .eq('id', workoutId);
                        navigation.goBack();
                      } catch (err) {
                        Alert.alert('Error', 'Failed to delete workout');
                      }
                    },
                  },
                ]
              );
            }}
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
  exerciseTargets: {
    flexDirection: 'row',
    gap: 12,
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
