import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const variantStyles = {
    primary: { bg: '#000000', text: '#FFFFFF', border: '#333333' },
    secondary: { bg: '#666666', text: '#FFFFFF', border: '#666666' },
    outline: { bg: '#FFFFFF', text: '#000000', border: '#000000' },
    ghost: { bg: 'transparent', text: '#000000', border: '#CCCCCC' },
    danger: { bg: '#FF0000', text: '#FFFFFF', border: '#FF0000' },
  };

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 12 },
    md: { paddingVertical: 12, paddingHorizontal: 16 },
    lg: { paddingVertical: 16, paddingHorizontal: 24 },
  };

  const textSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const v = variantStyles[variant];
  const s = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: '#FFFFFF',
              fontSize: textSizes[size],
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Menlo',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
