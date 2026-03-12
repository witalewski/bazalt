import { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, Text, Button } from '../../components/ui';
import { verifyOtp } from '../../lib/auth';

type AuthStackParamList = {
  login: undefined;
  'verify-otp': { email: string };
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'verify-otp'>;
type VerifyOtpRouteProp = RouteProp<AuthStackParamList, 'verify-otp'>;

export default function VerifyOtpScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<VerifyOtpRouteProp>();
  const { email } = route.params;
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newCode.join('');
    if (fullCode.length === 6) {
      handleVerify(fullCode);
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otp?: string) => {
    const finalCode = otp || code.join('');
    if (finalCode.length !== 6) {
      Alert.alert('Error', 'Please enter the full 6-digit code');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(email, finalCode);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const { sendOtp } = await import('../../lib/auth');
      await sendOtp(email);
      Alert.alert('Success', 'Code resent to your email');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to resend code');
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text variant="h2">VERIFY</Text>
          <Text variant="caption" color="muted" style={styles.email}>
            {email}
          </Text>
        </View>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[styles.codeInput, code[index] && styles.codeInputFilled]}
              value={digit}
              onChangeText={(value) => handleCodeChange(index, value)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <View style={styles.actions}>
          <Button
            title="VERIFY"
            onPress={() => handleVerify()}
            loading={loading}
            disabled={loading}
          />
          <Button
            title="RESEND CODE"
            onPress={handleResend}
            variant="ghost"
          />
        </View>
      </KeyboardAvoidingView>
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
    marginBottom: 32,
  },
  email: {
    marginTop: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: '#000000',
    fontFamily: 'Menlo',
    fontSize: 24,
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
  },
  codeInputFilled: {
    backgroundColor: '#000000',
    color: '#FFFFFF',
  },
  actions: {
    gap: 16,
  },
});
