import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { BorderRadius, Spacing, FontSizes } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export function Button({
  title, onPress, variant = 'primary', size = 'md',
  disabled = false, loading = false, icon, style, textStyle, testID,
}: ButtonProps) {
  const { colors } = useTheme();

  const sizeStyles = {
    sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
    md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg },
    lg: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl },
  };

  const variantStyles: Record<string, ViewStyle> = {
    primary: { backgroundColor: colors.primary, borderRadius: BorderRadius.md },
    secondary: { backgroundColor: colors.secondary, borderRadius: BorderRadius.md },
    outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary, borderRadius: BorderRadius.md },
    ghost: { backgroundColor: 'transparent' },
  };

  const textColors: Record<string, string> = {
    primary: '#FFFFFF',
    secondary: '#FFFFFF',
    outline: colors.primary,
    ghost: colors.primary,
  };

  const textSizes = { sm: FontSizes.sm, md: FontSizes.md, lg: FontSizes.lg };

  return (
    <TouchableOpacity
      style={[
        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
        variantStyles[variant],
        sizeStyles[size],
        disabled && { opacity: 0.5 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : colors.primary} />
      ) : (
        <>
          {icon}
          <Text style={[
            { fontWeight: '600', color: textColors[variant], fontSize: textSizes[size] },
            disabled && { opacity: 0.7 },
            textStyle,
          ]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
