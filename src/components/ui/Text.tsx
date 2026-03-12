import React from 'react';
import { Text as RNText, StyleSheet, TextStyle, TextProps } from 'react-native';

interface CustomTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
  color?: 'black' | 'white' | 'muted';
}

export function Text({ 
  variant = 'body', 
  color = 'black',
  style, 
  ...props 
}: CustomTextProps) {
  const variantStyles: Record<string, TextStyle> = {
    h1: { fontSize: 32, fontWeight: 'bold', letterSpacing: -1 },
    h2: { fontSize: 24, fontWeight: 'bold', letterSpacing: -0.5 },
    h3: { fontSize: 18, fontWeight: 'bold' },
    body: { fontSize: 14 },
    caption: { fontSize: 12 },
    label: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  };

  const colorMap: Record<string, string> = {
    black: '#000000',
    white: '#FFFFFF',
    muted: '#666666',
  };

  return (
    <RNText
      style={[
        styles.base,
        variantStyles[variant],
        { color: colorMap[color] },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: 'Menlo',
  },
});
