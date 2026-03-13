import React from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, Text } from '../../../components/ui';
import { WorkoutCard } from '../../../components/WorkoutCard';
import { MainStackParamList } from '../_layout';
import { useStore } from '../../../lib/store';
import { useWorkouts, useDeleteWorkout } from '../../../hooks';
import type { Workout } from '../../../types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export default function WorkoutListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useStore();
  const { data: workouts = [], isLoading } = useWorkouts(user?.id);
  const deleteWorkout = useDeleteWorkout();

  const activeWorkouts = workouts.filter(w => !w.is_deleted);

  const handleDelete = (workout: Workout) => {
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
              await deleteWorkout.mutateAsync({ 
                workoutId: workout.id, 
                userId: user!.id 
              });
            } catch (err) {
              Alert.alert('Error', 'Failed to delete workout');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Workout }) => (
    <WorkoutCard
      workout={item}
      exerciseCount={0}
      onPress={() => navigation.navigate('workout-detail', { workoutId: item.id })}
      onLongPress={() => handleDelete(item)}
    />
  );

  return (
    <Screen>
      <FlatList
        data={activeWorkouts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="caption" color="muted">NO WORKOUTS YET</Text>
            <Text variant="caption" color="muted">Tap + to create your first workout</Text>
          </View>
        }
        contentContainerStyle={activeWorkouts.length === 0 && styles.emptyContainer}
      />
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('workout-new')}
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
