import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, Text, Button } from '../../../components/ui';
import { ExerciseCard } from '../../../components/ExerciseCard';
import { MainStackParamList } from '../_layout';
import { useStore } from '../../../lib/store';
import { supabase } from '../../../lib/supabase';
import type { Exercise } from '../../../types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export default function ExerciseListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, exercises, setExercises, addExercise } = useStore();
  const [loading, setLoading] = useState(false);

  const activeExercises = exercises.filter(e => !e.is_deleted);

  const fetchExercises = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setExercises(data);
    } catch (err) {
      console.error('Failed to fetch exercises:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [user]);

  const handleDelete = async (exercise: Exercise) => {
    Alert.alert(
      'Delete Exercise',
      `Are you sure you want to delete "${exercise.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('exercises')
                .update({ is_deleted: true })
                .eq('id', exercise.id);
              if (error) throw error;
              setExercises(exercises.map(e => 
                e.id === exercise.id ? { ...e, is_deleted: true } : e
              ));
            } catch (err) {
              Alert.alert('Error', 'Failed to delete exercise');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Exercise }) => (
    <ExerciseCard
      exercise={item}
      onPress={() => navigation.navigate('exercise-edit', { exerciseId: item.id })}
      onLongPress={() => handleDelete(item)}
    />
  );

  return (
    <Screen>
      <FlatList
        data={activeExercises}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="caption" color="muted">NO EXERCISES YET</Text>
            <Text variant="caption" color="muted">Tap + to create your first exercise</Text>
          </View>
        }
        contentContainerStyle={activeExercises.length === 0 && styles.emptyContainer}
      />
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('exercise-new')}
      >
        <Text variant="h2" color="white">+</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
