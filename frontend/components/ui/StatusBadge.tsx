import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, FontSizes } from '../../constants/theme';

type StatusType = 'calm' | 'active' | 'anxious' | 'sleeping' | 'playing';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<StatusType, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  calm: { label: 'Tranquilo', color: Colors.primary, icon: 'leaf' },
  active: { label: 'Activo', color: Colors.accent, icon: 'flash' },
  anxious: { label: 'Ansioso', color: Colors.warning, icon: 'alert-circle' },
  sleeping: { label: 'Durmiendo', color: Colors.info, icon: 'moon' },
  playing: { label: 'Jugando', color: Colors.success, icon: 'happy' },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <View style={[styles.badge, { backgroundColor: config.color + '20' }]}>
      <Ionicons 
        name={config.icon} 
        size={size === 'sm' ? 14 : size === 'lg' ? 22 : 18} 
        color={config.color} 
      />
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  text: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
});
