import { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Screen, Text, Input, Button } from '../../../components/ui';
import { ExerciseCard } from '../../../components/ExerciseCard';
import { useStore } from '../../../lib/store';
import { supabase } from '../../../lib/supabase';
import type { Exercise, WorkoutExercise } from '../../../types';

const workoutSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

type WorkoutFormData = z.infer<typeof workoutSchema>;

interface SelectedExercise extends Exercise {
  target_sets?: number;
  target_reps?: number;
  target_weight_kg?: number | null;
  target_minutes?: number;
}

export default function WorkoutNewScreen() {
  const navigation = useNavigation();
  const { user, exercises, addWorkout } = useStore();
  const [loading, setLoading] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const activeExercises = exercises.filter(e => !e.is_deleted);

  const toggleExercise = (exercise: Exercise) => {
    const exists = selectedExercises.find(e => e.id === exercise.id);
    if (exists) {
      setSelectedExercises(selectedExercises.filter(e => e.id !== exercise.id));
    } else {
      setSelectedExercises([
        ...selectedExercises,
        { 
          ...exercise, 
          target_sets: exercise.tracking_mode === 'emom' ? undefined : 3,
          target_reps: exercise.tracking_mode === 'emom' ? 10 : undefined,
          target_weight_kg: null,
        },
      ]);
    }
  };

  const updateExerciseTarget = (id: string, field: string, value: any) => {
    setSelectedExercises(selectedExercises.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const onSubmit = async (data: WorkoutFormData) => {
    if (!user) return;
    if (selectedExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    setLoading(true);

    try {
      const { data: workout, error } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          name: data.name,
          description: data.description || null,
        })
        .select()
        .single();

      if (error) throw error;

      const workoutExercises = selectedExercises.map((exercise, index) => ({
        workout_id: workout.id,
        exercise_id: exercise.id,
        order_index: index,
        target_sets: exercise.target_sets,
        target_reps: exercise.target_reps,
        target_weight_kg: exercise.target_weight_kg,
        target_minutes: exercise.tracking_mode === 'emom' ? 10 : null,
      }));

      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(workoutExercises);

      if (exercisesError) throw exercisesError;

      if (workout) {
        addWorkout(workout);
        navigation.goBack();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create workout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView style={styles.container}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="WORKOUT NAME"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
              placeholder="e.g. Full Body A"
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="DESCRIPTION"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={2}
              placeholder="Optional notes..."
            />
          )}
        />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="label" color="muted">EXERCISES</Text>
            <TouchableOpacity onPress={() => setShowPicker(!showPicker)}>
              <Text variant="caption" color="muted">
                {showPicker ? 'DONE' : '+ ADD'}
              </Text>
            </TouchableOpacity>
          </View>

          {showPicker && (
            <View style={styles.picker}>
              <FlatList
                data={activeExercises}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <ExerciseCard
                    exercise={item}
                    onPress={() => toggleExercise(item)}
                  />
                )}
                scrollEnabled={false}
              />
            </View>
          )}

          {selectedExercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.selectedExercise}>
              <View style={styles.exerciseHeader}>
                <Text variant="body">{index + 1}. {exercise.name}</Text>
                <TouchableOpacity onPress={() => toggleExercise(exercise)}>
                  <Text variant="caption" color="muted">REMOVE</Text>
                </TouchableOpacity>
              </View>
              
              {exercise.tracking_mode !== 'emom' && (
                <View style={styles.targets}>
                  <View style={styles.target}>
                    <Text variant="caption" color="muted">SETS</Text>
                    <Input
                      value={String(exercise.target_sets || '')}
                      onChangeText={(v) => updateExerciseTarget(exercise.id, 'target_sets', parseInt(v) || undefined)}
                      keyboardType="number-pad"
                      placeholder="3"
                    />
                  </View>
                  <View style={styles.target}>
                    <Text variant="caption" color="muted">REPS</Text>
                    <Input
                      value={String(exercise.target_reps || '')}
                      onChangeText={(v) => updateExerciseTarget(exercise.id, 'target_reps', parseInt(v) || undefined)}
                      keyboardType="number-pad"
                      placeholder="10"
                    />
                  </View>
                  <View style={styles.target}>
                    <Text variant="caption" color="muted">KG</Text>
                    <Input
                      value={exercise.target_weight_kg === null ? '' : String(exercise.target_weight_kg)}
                      onChangeText={(v) => updateExerciseTarget(
                        exercise.id, 
                        'target_weight_kg', 
                        v === '' ? null : parseFloat(v)
                      )}
                      keyboardType="decimal-pad"
                      placeholder="0"
                    />
                  </View>
                </View>
              )}

              {exercise.tracking_mode === 'emom' && (
                <View style={styles.targets}>
                  <View style={styles.target}>
                    <Text variant="caption" color="muted">MINUTES</Text>
                    <Input
                      value={String(exercise.target_minutes || 10)}
                      onChangeText={(v) => updateExerciseTarget(exercise.id, 'target_minutes', parseInt(v) || 10)}
                      keyboardType="number-pad"
                      placeholder="10"
                    />
                  </View>
                  <View style={styles.target}>
                    <Text variant="caption" color="muted">REPS/MIN</Text>
                    <Input
                      value={String(exercise.target_reps || '')}
                      onChangeText={(v) => updateExerciseTarget(exercise.id, 'target_reps', parseInt(v) || undefined)}
                      keyboardType="number-pad"
                      placeholder="10"
                    />
                  </View>
                </View>
              )}
            </View>
          ))}

          {selectedExercises.length === 0 && (
            <View style={styles.empty}>
              <Text variant="caption" color="muted">No exercises added</Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <Button
            title="CREATE WORKOUT"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={loading}
          />
          <Button
            title="CANCEL"
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
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  picker: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#000000',
  },
  selectedExercise: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#000000',
    marginBottom: 8,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  targets: {
    flexDirection: 'row',
    gap: 8,
  },
  target: {
    flex: 1,
  },
  empty: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
  },
  actions: {
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
});
