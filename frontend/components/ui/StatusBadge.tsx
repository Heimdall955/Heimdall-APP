import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { BorderRadius, FontSizes, Spacing } from '../../constants/theme';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'warning';
  label: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const { colors } = useTheme();
  const statusColors = {
    active: { bg: colors.success + '20', text: colors.success },
    inactive: { bg: colors.grayLight, text: colors.gray },
    warning: { bg: colors.warning + '20', text: colors.warning },
  };
  const c = statusColors[status];

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <View style={[styles.dot, { backgroundColor: c.text }]} />
      <Text style={[styles.label, { color: c.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm, gap: Spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: FontSizes.sm, fontWeight: '600' },
});
