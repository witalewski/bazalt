import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from './ui/Text';
import type { Exercise } from '../types';

interface ExerciseCardProps {
  exercise: Exercise;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function ExerciseCard({ exercise, onPress, onLongPress }: ExerciseCardProps) {
  const trackingLabel = {
    reps: 'REPS',
    time: 'TIME',
    emom: 'EMOM',
  }[exercise.tracking_mode];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text variant="h3">{exercise.name}</Text>
        {exercise.description && (
          <Text variant="caption" color="muted" style={styles.description}>
            {exercise.description}
          </Text>
        )}
      </View>
      <View style={styles.badge}>
        <Text variant="label" color="muted">{trackingLabel}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
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
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
});
