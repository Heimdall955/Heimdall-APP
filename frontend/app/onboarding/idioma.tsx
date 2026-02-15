import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../../constants/theme';
import { Language } from '../../types';

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

export default function IdiomaScreen() {
  const router = useRouter();
  const { language, setLanguage } = useAuth();

  const handleSelectLanguage = async (lang: Language) => {
    await setLanguage(lang);
    router.push('/onboarding/registro');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="paw" size={80} color={Colors.primary} />
          <Text style={styles.title}>HEIMDALL</Text>
          <Text style={styles.subtitle}>Bienestar Canino Inteligente</Text>
        </View>

        <Text style={styles.selectText}>Selecciona tu idioma</Text>

        <View style={styles.languageList}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageButton,
                language === lang.code && styles.languageButtonActive,
              ]}
              onPress={() => handleSelectLanguage(lang.code)}
            >
              <Text style={styles.flag}>{lang.flag}</Text>
              <Text style={[
                styles.languageName,
                language === lang.code && styles.languageNameActive,
              ]}>
                {lang.name}
              </Text>
              {language === lang.code && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 3,
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  selectText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  languageList: {
    gap: Spacing.md,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  languageButtonActive: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  flag: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  languageName: {
    flex: 1,
    fontSize: FontSizes.lg,
    fontWeight: '500',
    color: Colors.text,
  },
  languageNameActive: {
    color: Colors.primary,
  },
});
