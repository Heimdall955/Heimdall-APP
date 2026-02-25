import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { BorderRadius, Spacing, FontSizes } from '../../constants/theme';

interface InputProps {
  label?: string; placeholder?: string; value: string; onChangeText: (text: string) => void;
  secureTextEntry?: boolean; keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string; icon?: keyof typeof Ionicons.glyphMap; style?: ViewStyle;
  multiline?: boolean; numberOfLines?: number;
}

export function Input({ label, placeholder, value, onChangeText, secureTextEntry = false, keyboardType = 'default', autoCapitalize = 'none', error, icon, style, multiline = false, numberOfLines = 1 }: InputProps) {
  const { colors } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[{ marginBottom: Spacing.md }, style]}>
      {label && <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: colors.text, marginBottom: Spacing.xs }}>{label}</Text>}
      <View style={[
        { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.grayLight, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md },
        isFocused && { borderColor: colors.primary, borderWidth: 2 },
        error && { borderColor: colors.error },
      ]}>
        {icon && <Ionicons name={icon} size={20} color={colors.gray} style={{ marginRight: Spacing.sm }} />}
        <TextInput
          style={[{ flex: 1, paddingVertical: Spacing.md, fontSize: FontSizes.md, color: colors.text }, multiline && { minHeight: 100, textAlignVertical: 'top' }]}
          placeholder={placeholder} placeholderTextColor={colors.gray} value={value} onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword} keyboardType={keyboardType} autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} multiline={multiline} numberOfLines={numberOfLines}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.gray} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={{ fontSize: FontSizes.xs, color: colors.error, marginTop: Spacing.xs }}>{error}</Text>}
    </View>
  );
}
