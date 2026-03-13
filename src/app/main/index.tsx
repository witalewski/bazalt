import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, Text, Card } from '../../components/ui';
import { MainStackParamList } from './_layout';
import { useStore } from '../../lib/store';
import { useExercises, useWorkouts } from '../../hooks';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, activeSession, isOnline } = useStore();
  const { data: exercises = [] } = useExercises(user?.id);
  const { data: workouts = [] } = useWorkouts(user?.id);

  const activeExercises = exercises.filter(e => !e.is_deleted);
  const activeWorkouts = workouts.filter(w => !w.is_deleted);

  return (
    <Screen>
      <ScrollView style={styles.container}>
        {!isOnline && (
          <View style={styles.offlineBanner}>
            <Text variant="caption" color="white">OFFLINE MODE</Text>
          </View>
        )}

        {activeSession ? (
          <TouchableOpacity 
            style={styles.continueBanner}
            onPress={() => navigation.navigate('track-session', { sessionId: activeSession.id })}
          >
            <Text variant="h3" color="white">CONTINUE WORKOUT</Text>
            <Text variant="caption" color="white">
              Tap to resume tracking
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.startBanner}
            onPress={() => navigation.navigate('workouts')}
          >
            <Text variant="h2" color="white">START WORKOUT</Text>
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="label" color="muted">EXERCISES</Text>
            <TouchableOpacity onPress={() => navigation.navigate('exercises')}>
              <Text variant="caption" color="muted">VIEW ALL</Text>
            </TouchableOpacity>
          </View>
          <Card variant="bordered">
            <View style={styles.stat}>
              <Text variant="h2">{activeExercises.length}</Text>
              <Text variant="caption" color="muted">TOTAL</Text>
            </View>
          </Card>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('exercise-new')}
          >
            <Text variant="caption">+ ADD EXERCISE</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="label" color="muted">WORKOUTS</Text>
            <TouchableOpacity onPress={() => navigation.navigate('workouts')}>
              <Text variant="caption" color="muted">VIEW ALL</Text>
            </TouchableOpacity>
          </View>
          <Card variant="bordered">
            <View style={styles.stat}>
              <Text variant="h2">{activeWorkouts.length}</Text>
              <Text variant="caption" color="muted">TOTAL</Text>
            </View>
          </Card>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('workout-new')}
          >
            <Text variant="caption">+ ADD WORKOUT</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('settings')}
        >
          <Text variant="caption" color="muted">SETTINGS</Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  offlineBanner: {
    backgroundColor: '#000000',
    padding: 8,
    alignItems: 'center',
  },
  startBanner: {
    backgroundColor: '#000000',
    padding: 32,
    alignItems: 'center',
  },
  continueBanner: {
    backgroundColor: '#666666',
    padding: 32,
    alignItems: 'center',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stat: {
    padding: 24,
    alignItems: 'center',
  },
  addButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#000000',
    alignItems: 'center',
    marginTop: 12,
  },
  settingsButton: {
    padding: 24,
    alignItems: 'center',
  },
});
