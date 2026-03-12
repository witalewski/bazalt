import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, Text, Button } from '../../components/ui';
import { useStore } from '../../lib/store';
import { signOut } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { STARTER_EXERCISES } from '../../lib/store';
import { MainStackParamList } from './_layout';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, setExercises, clearSession } = useStore();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              clearSession();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const handleSeedExercises = async () => {
    if (!user) return;
    
    Alert.alert(
      'Seed Exercises',
      'This will add the starter exercises to your library. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async () => {
            try {
              const exercisesToInsert = STARTER_EXERCISES.map(e => ({
                ...e,
                user_id: user.id,
              }));

              const { data, error } = await supabase
                .from('exercises')
                .insert(exercisesToInsert)
                .select();

              if (error) throw error;
              if (data) setExercises([...data]);
              
              Alert.alert('Success', 'Starter exercises added!');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to add exercises');
            }
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.section}>
          <Text variant="label" color="muted">ACCOUNT</Text>
          <View style={styles.card}>
            <Text variant="body">{user?.email}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="label" color="muted">DATA</Text>
          <Button
            title="ADD STARTER EXERCISES"
            onPress={handleSeedExercises}
            variant="outline"
          />
        </View>

        <View style={styles.section}>
          <Button
            title="SIGN OUT"
            onPress={handleSignOut}
            variant="ghost"
          />
        </View>

        <View style={styles.footer}>
          <Text variant="caption" color="muted">BAZALT v1.0.0</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginTop: 8,
    marginBottom: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
