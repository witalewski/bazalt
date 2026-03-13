import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, Text, Input, Button } from '../../../components/ui';
import { Timer } from '../../../components/Timer';
import { useStore } from '../../../lib/store';
import { 
  useWorkoutSession, 
  useWorkoutExercises, 
  useExerciseLogs, 
  useLogExerciseSet, 
  useFinishWorkoutSession,
  ExerciseLogWithExercise,
} from '../../../hooks';
import { MainStackParamList } from '../_layout';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;
type TrackRouteProp = RouteProp<MainStackParamList, 'track-session'>;

interface SetLog {
  set_number: number;
  reps: string;
  weight: string;
  time: string;
  is_completed: boolean;
}

export default function TrackSessionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TrackRouteProp>();
  const { sessionId } = route.params;
  const { user } = useStore();
  
  const { data: session, isLoading: sessionLoading } = useWorkoutSession(sessionId);
  const { data: workoutExercises = [], isLoading: exercisesLoading } = useWorkoutExercises(session?.workout_id || '');
  const { data: exerciseLogsData = [] } = useExerciseLogs(sessionId);
  const logExerciseSet = useLogExerciseSet();
  const finishWorkoutSession = useFinishWorkoutSession();
  
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, SetLog[]>>({});
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [timerMode, setTimerMode] = useState<'stopwatch' | 'countdown' | 'emom'>('stopwatch');
  const [loading, setLoading] = useState(false);

  const selectedExercise = workoutExercises.find(we => we.exercise_id === selectedExerciseId);

  useEffect(() => {
    if (exerciseLogsData.length > 0) {
      const grouped: Record<string, SetLog[]> = {};
      exerciseLogsData.forEach((log) => {
        const exerciseId = log.exercise_id || '';
        if (!grouped[exerciseId]) {
          grouped[exerciseId] = [];
        }
        grouped[exerciseId].push({
          set_number: log.set_number,
          reps: log.reps?.toString() || '',
          weight: log.weight_kg?.toString() || '',
          time: log.time_seconds?.toString() || '',
          is_completed: log.is_completed,
        });
      });
      setExerciseLogs(grouped);
    }
  }, [exerciseLogsData]);

  const initializeSetLogs = useCallback((exerciseId: string) => {
    if (exerciseLogs[exerciseId]) return;
    
    const exercise = workoutExercises.find(we => we.exercise_id === exerciseId);
    if (!exercise) return;
    
    const sets: SetLog[] = [];
    const numSets = exercise.exercise?.tracking_mode === 'emom' 
      ? (exercise.target_minutes || 10) 
      : (exercise.target_sets || 3);

    for (let i = 1; i <= numSets; i++) {
      sets.push({
        set_number: i,
        reps: exercise.exercise?.tracking_mode === 'emom' 
          ? (exercise.target_reps?.toString() || '10')
          : '',
        weight: '',
        time: '',
        is_completed: false,
      });
    }
    setExerciseLogs(prev => ({
      ...prev,
      [exerciseId]: sets,
    }));
  }, [exerciseLogs, workoutExercises]);

  const handleCompleteSet = async (exerciseId: string, setIndex: number) => {
    if (!user) return;
    const setLog = exerciseLogs[exerciseId]?.[setIndex];
    if (!setLog) return;

    setLoading(true);
    try {
      await logExerciseSet.mutateAsync({
        sessionId,
        exerciseId,
        setNumber: setIndex + 1,
        reps: setLog.reps ? parseInt(setLog.reps) : null,
        weightKg: setLog.weight ? parseFloat(setLog.weight) : null,
        timeSeconds: setLog.time ? parseInt(setLog.time) : null,
      });

      setExerciseLogs(prev => ({
        ...prev,
        [exerciseId]: prev[exerciseId].map((s, i) =>
          i === setIndex ? { ...s, is_completed: true } : s
        ),
      }));
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to log set');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishWorkout = async () => {
    Alert.alert(
      'Finish Workout',
      'Are you sure you want to finish this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          onPress: async () => {
            setLoading(true);
            try {
              await finishWorkoutSession.mutateAsync({ sessionId });
              navigation.popToTop();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to finish workout');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderExerciseItem = ({ item }: { item: typeof workoutExercises[0] }) => {
    const logs = exerciseLogs[item.exercise_id] || [];
    const completedSets = logs.filter(l => l.is_completed).length;
    const totalSets = item.exercise?.tracking_mode === 'emom' 
      ? (item.target_minutes || 10) 
      : (item.target_sets || 3);

    return (
      <TouchableOpacity
        style={[
          styles.exerciseItem,
          selectedExerciseId === item.exercise_id && styles.exerciseItemSelected,
        ]}
        onPress={() => {
          setSelectedExerciseId(item.exercise_id);
          initializeSetLogs(item.exercise_id);
        }}
      >
        <View style={styles.exerciseHeader}>
          <Text variant="body">{item.exercise?.name}</Text>
          <Text variant="caption" color="muted">
            {completedSets}/{totalSets}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(completedSets / totalSets) * 100}%` }
            ]} 
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderSetInput = (setIndex: number, setLog: SetLog, exerciseId: string) => {
    const exercise = workoutExercises.find(we => we.exercise_id === exerciseId);
    const trackingMode = exercise?.exercise?.tracking_mode;

    return (
      <View key={setIndex} style={[styles.setRow, setLog.is_completed && styles.setRowCompleted]}>
        <Text variant="caption" color="muted" style={styles.setNumber}>
          {setIndex + 1}
        </Text>
        
        {trackingMode === 'emom' ? (
          <View style={styles.setInputs}>
            <View style={styles.setInput}>
              <Text variant="caption" color="muted">REPS</Text>
              <Input
                value={setLog.reps}
                onChangeText={(text) => {
                  setExerciseLogs(prev => ({
                    ...prev,
                    [exerciseId]: prev[exerciseId].map((s, i) =>
                      i === setIndex ? { ...s, reps: text } : s
                    ),
                  }));
                }}
                keyboardType="number-pad"
                placeholder="0"
                editable={!setLog.is_completed}
              />
            </View>
          </View>
        ) : (
          <View style={styles.setInputs}>
            {trackingMode === 'reps' && (
              <View style={styles.setInput}>
                <Text variant="caption" color="muted">REPS</Text>
                <Input
                  value={setLog.reps}
                  onChangeText={(text) => {
                    setExerciseLogs(prev => ({
                      ...prev,
                      [exerciseId]: prev[exerciseId].map((s, i) =>
                        i === setIndex ? { ...s, reps: text } : s
                      ),
                    }));
                  }}
                  keyboardType="number-pad"
                  placeholder="0"
                  editable={!setLog.is_completed}
                />
              </View>
            )}
            {trackingMode === 'time' && (
              <View style={styles.setInput}>
                <Text variant="caption" color="muted">SEC</Text>
                <Input
                  value={setLog.time}
                  onChangeText={(text) => {
                    setExerciseLogs(prev => ({
                      ...prev,
                      [exerciseId]: prev[exerciseId].map((s, i) =>
                        i === setIndex ? { ...s, time: text } : s
                      ),
                    }));
                  }}
                  keyboardType="number-pad"
                  placeholder="0"
                  editable={!setLog.is_completed}
                />
              </View>
            )}
            <View style={styles.setInput}>
              <Text variant="caption" color="muted">KG</Text>
              <Input
                value={setLog.weight}
                onChangeText={(text) => {
                  setExerciseLogs(prev => ({
                    ...prev,
                    [exerciseId]: prev[exerciseId].map((s, i) =>
                      i === setIndex ? { ...s, weight: text } : s
                    ),
                  }));
                }}
                keyboardType="decimal-pad"
                placeholder="0"
                editable={!setLog.is_completed}
              />
            </View>
          </View>
        )}

        <View style={styles.setActions}>
          {setLog.is_completed ? (
            <Text variant="caption" color="muted">✓</Text>
          ) : (
            <Button
              title="✓"
              onPress={() => handleCompleteSet(exerciseId, setIndex)}
              size="sm"
            />
          )}
        </View>
      </View>
    );
  };

  if (sessionLoading || !session) {
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
          <Text variant="h3">{session?.workout?.name || 'Workout'}</Text>
          <Text variant="caption" color="muted">
            Started: {session?.started_at ? new Date(session.started_at).toLocaleTimeString() : '-'}
          </Text>
        </View>

        <FlatList
          data={workoutExercises}
          keyExtractor={(item) => item.id}
          renderItem={renderExerciseItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.exerciseList}
          contentContainerStyle={styles.exerciseListContent}
        />

        {selectedExercise && (
          <View style={styles.selectedExercise}>
            <View style={styles.selectedHeader}>
              <Text variant="h3">{selectedExercise.exercise?.name}</Text>
              <View style={styles.timerButtons}>
                <Button
                  title="⏱"
                  onPress={() => {
                    setTimerMode('stopwatch');
                    setShowTimer(!showTimer);
                  }}
                  variant={timerMode === 'stopwatch' && showTimer ? 'primary' : 'outline'}
                  size="sm"
                />
                <Button
                  title="⏳"
                  onPress={() => {
                    setTimerMode('countdown');
                    setShowTimer(!showTimer);
                  }}
                  variant={timerMode === 'countdown' && showTimer ? 'primary' : 'outline'}
                  size="sm"
                />
              </View>
            </View>

            {showTimer && (
              <Timer 
                mode={timerMode} 
                initialSeconds={60}
                emomMinutes={selectedExercise.target_minutes || 10}
              />
            )}

            <View style={styles.sets}>
              {(exerciseLogs[selectedExercise.exercise_id] || []).map((setLog, index) =>
                renderSetInput(index, setLog, selectedExercise.exercise_id)
              )}
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            title="FINISH WORKOUT"
            onPress={handleFinishWorkout}
            variant="outline"
            loading={loading}
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
  exerciseList: {
    maxHeight: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  exerciseListContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  exerciseItem: {
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    minWidth: 120,
  },
  exerciseItemSelected: {
    borderColor: '#000000',
    backgroundColor: '#F5F5F5',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5E5',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000000',
  },
  selectedExercise: {
    padding: 16,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sets: {
    gap: 8,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  setRowCompleted: {
    backgroundColor: '#F5F5F5',
  },
  setNumber: {
    width: 30,
  },
  setInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  setInput: {
    flex: 1,
  },
  setActions: {
    width: 40,
    alignItems: 'center',
  },
  actions: {
    padding: 16,
    marginTop: 16,
  },
});
