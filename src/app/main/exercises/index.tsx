import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, Text } from '../../../components/ui';
import { ExerciseCard } from '../../../components/ExerciseCard';
import { MainStackParamList } from '../_layout';
import { useStore } from '../../../lib/store';
import { useExercises, useDeleteExercise } from '../../../hooks';
import type { Exercise } from '../../../types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export default function ExerciseListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useStore();
  const { data: exercises = [], isLoading } = useExercises(user?.id);
  const deleteExercise = useDeleteExercise();

  const activeExercises = exercises.filter(e => !e.is_deleted);

  const handleDelete = (exercise: Exercise) => {
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
              await deleteExercise.mutateAsync({ 
                exerciseId: exercise.id, 
                userId: user!.id 
              });
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
