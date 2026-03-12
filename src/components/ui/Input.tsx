import React from 'react';
import { TextInput, Text, View, StyleSheet, ViewStyle, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  containerStyle,
  style,
  ...props
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor="#999999"
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Menlo',
    fontSize: 12,
    color: '#000000',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    fontFamily: 'Menlo',
    fontSize: 14,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: '#FF0000',
  },
  error: {
    fontFamily: 'Menlo',
    fontSize: 10,
    color: '#FF0000',
    marginTop: 4,
  },
});
