import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'bordered';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  return (
    <View style={[
      styles.card,
      variant === 'bordered' && styles.bordered,
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
  },
  bordered: {
    borderWidth: 1,
    borderColor: '#000000',
  },
});
