import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { BorderRadius, Spacing } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
}

export function Card({ children, style, onPress, variant = 'default' }: CardProps) {
  const { colors, shadows } = useTheme();

  const cardStyle = [
    { backgroundColor: colors.cardBg, borderRadius: BorderRadius.lg, padding: Spacing.md, ...shadows.sm as any },
    variant === 'elevated' && (shadows.md as any),
    variant === 'outlined' && { borderWidth: 1, borderColor: colors.grayLight, shadowOpacity: 0, elevation: 0 },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}
