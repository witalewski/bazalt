import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from './ui/Text';
import type { Workout } from '../types';

interface WorkoutCardProps {
  workout: Workout;
  exerciseCount?: number;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function WorkoutCard({ workout, exerciseCount = 0, onPress, onLongPress }: WorkoutCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text variant="h3">{workout.name}</Text>
        {workout.description && (
          <Text variant="caption" color="muted" style={styles.description}>
            {workout.description}
          </Text>
        )}
        <Text variant="label" color="muted" style={styles.count}>
          {exerciseCount} EXERCISES
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  description: {
    marginTop: 4,
  },
  count: {
    marginTop: 8,
  },
});
