import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './login';
import VerifyOtpScreen from './verify-otp';

const Stack = createNativeStackNavigator();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="login" component={LoginScreen} />
      <Stack.Screen name="verify-otp" component={VerifyOtpScreen} />
    </Stack.Navigator>
  );
}
