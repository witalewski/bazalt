import { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Screen, Text, Input, Button } from '../../../components/ui';
import { useStore } from '../../../lib/store';
import { supabase } from '../../../lib/supabase';
import type { TrackingMode } from '../../../types';

const exerciseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  video_link: z.string().url('Invalid URL').optional().or(z.literal('')),
  tracking_mode: z.enum(['reps', 'time', 'emom']),
});

type ExerciseFormData = z.infer<typeof exerciseSchema>;

const TRACKING_OPTIONS: { value: TrackingMode; label: string }[] = [
  { value: 'reps', label: 'SETS × REPS' },
  { value: 'time', label: 'SETS × TIME' },
  { value: 'emom', label: 'EMOM' },
];

export default function ExerciseNewScreen() {
  const navigation = useNavigation();
  const { user, addExercise } = useStore();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: '',
      description: '',
      video_link: '',
      tracking_mode: 'reps',
    },
  });

  const onSubmit = async (data: ExerciseFormData) => {
    console.log('Creating exercise, user:', user);
    if (!user) {
      Alert.alert('Error', 'Not logged in');
      return;
    }
    setLoading(true);

    try {
      const { data: exercise, error } = await supabase
        .from('exercises')
        .insert({
          user_id: user.id,
          name: data.name,
          description: data.description || null,
          video_link: data.video_link || null,
          tracking_mode: data.tracking_mode,
        })
        .select()
        .single();

      console.log('Insert result:', { exercise, error });
      
      if (error) throw error;
      if (exercise) {
        addExercise(exercise);
        navigation.goBack();
      }
    } catch (err: any) {
      console.error('Create exercise error:', err);
      Alert.alert('Error', err.message || 'Failed to create exercise');
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
              label="NAME"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
              placeholder="e.g. Push-up"
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="DESCRIPTION / NOTES"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={3}
              placeholder="Optional notes..."
            />
          )}
        />

        <Controller
          control={control}
          name="video_link"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="VIDEO LINK"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.video_link?.message}
              placeholder="https://youtube.com/..."
              keyboardType="url"
              autoCapitalize="none"
            />
          )}
        />

        <View style={styles.field}>
          <Text variant="label" color="muted">TRACKING TYPE</Text>
          <Controller
            control={control}
            name="tracking_mode"
            render={({ field: { onChange, value } }) => (
              <View style={styles.options}>
                {TRACKING_OPTIONS.map((option) => (
                  <View
                    key={option.value}
                    style={[
                      styles.option,
                      value === option.value && styles.optionSelected,
                    ]}
                  >
                    <Text
                      variant="caption"
                      color={value === option.value ? 'white' : 'black'}
                      onPress={() => onChange(option.value)}
                    >
                      {option.label}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          />
        </View>

        <View style={styles.actions}>
          <Button
            title="CREATE EXERCISE"
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
  field: {
    marginBottom: 16,
  },
  options: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  option: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#000000',
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#000000',
  },
  actions: {
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
});
