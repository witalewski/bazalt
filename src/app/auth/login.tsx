import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, Text, Input, Button } from '../../components/ui';
import { sendOtp } from '../../lib/auth';

type AuthStackParamList = {
  login: undefined;
  'verify-otp': { email: string };
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'login'>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sendOtp(email.trim().toLowerCase());
      navigation.navigate('verify-otp', { email: email.trim().toLowerCase() });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="h1">BAZALT</Text>
          <Text variant="caption" color="muted" style={styles.subtitle}>
            EXERCISE TRACKER
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="EMAIL"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
            error={error}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="your@email.com"
          />

          <Button
            title="SEND CODE"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
          />
        </View>

        <Text variant="caption" color="muted" style={styles.footer}>
          We'll send a verification code to your email
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  subtitle: {
    marginTop: 8,
    letterSpacing: 4,
  },
  form: {
    gap: 16,
  },
  footer: {
    textAlign: 'center',
    marginTop: 24,
  },
});
