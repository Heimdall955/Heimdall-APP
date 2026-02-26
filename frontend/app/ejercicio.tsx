import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { Spacing, BorderRadius, FontSizes } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from '../components/ui';
import { useLanguage } from '../contexts/LanguageContext';
import { SecureStore } from '../utils/secureStore';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

// Base de datos de ejercicios

export default function EjercicioScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();
  const { colors, shadows } = useTheme();
  const [ejercicioActual, setEjercicioActual] = useState(0);
  const [completados, setCompletados] = useState<number[]>([]);

  const [rewardData, setRewardData] = useState<any>(null);
  const [submittingReward, setSubmittingReward] = useState(false);

  const ejercicio = EJERCICIOS_DB[id || 'senales-basicas'];

  if (!ejercicio) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text>{t('error')}</Text>
      </SafeAreaView>
    );
  }

  const toggleCompletado = (index: number) => {
    if (completados.includes(index)) {
      setCompletados(completados.filter(i => i !== index));
    } else {
      const newCompletados = [...completados, index];
      setCompletados(newCompletados);
      // Auto-submit reward when all exercises completed
      if (newCompletados.length === ejercicio.ejercicios.length && !submittingReward) {
        submitReward();
      }
    }
  };

  const submitReward = async () => {
    setSubmittingReward(true);
    try {
      const token = await SecureStore.getItemAsync('session_token');
      if (!token) return;
      const response = await axios.post(
        `${BACKEND_URL}/api/gamification/add-bones`,
        { amount: ejercicio.huesos, reason: `Ejercicio: ${ejercicio.titulo}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRewardData(response.data);
    } catch (error) {
      console.log('Error submitting reward:', error);
    } finally {
      setSubmittingReward(false);
    }
  };

  const todosCompletados = completados.length === ejercicio.ejercicios.length;

  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{ejercicio.titulo}</Text>
        <View style={styles.huesosContainer}>
          <Text style={styles.huesosText}>{ejercicio.huesos}</Text>
          <Text style={styles.boneEmoji}>🦴</Text>
        </View>
      </View>

      {/* Hero Image */}
      <Image source={{ uri: ejercicio.imagen }} style={styles.heroImage} />
      <View style={[styles.heroOverlay, { backgroundColor: ejercicio.color + '90' }]}>
        <Text style={styles.heroSubtitle}>{ejercicio.subtitulo}</Text>
        <Text style={styles.heroDescription}>{ejercicio.descripcion}</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.progressText}>
            {completados.length} {t('of')} {ejercicio.ejercicios.length} {t('completed')}
          </Text>
          <View style={styles.progressDots}>
            {ejercicio.ejercicios.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.progressDot,
                  completados.includes(index) && styles.progressDotComplete
                ]} 
              />
            ))}
          </View>
        </View>

        {/* Ejercicios */}
        {ejercicio.ejercicios.map((ej, index) => (
          <Card key={index} style={styles.ejercicioCard}>
            <TouchableOpacity 
              style={styles.ejercicioHeader}
              onPress={() => setEjercicioActual(ejercicioActual === index ? -1 : index)}
            >
              <View style={styles.ejercicioTitleRow}>
                <TouchableOpacity 
                  style={[
                    styles.checkbox,
                    completados.includes(index) && styles.checkboxComplete
                  ]}
                  onPress={() => toggleCompletado(index)}
                >
                  {completados.includes(index) && (
                    <Ionicons name="checkmark" size={18} color={colors.white} />
                  )}
                </TouchableOpacity>
                <Text style={[
                  styles.ejercicioNombre,
                  completados.includes(index) && styles.ejercicioNombreComplete
                ]}>
                  {ej.nombre}
                </Text>
              </View>
              <Ionicons 
                name={ejercicioActual === index ? 'chevron-up' : 'chevron-down'} 
                size={24} 
                color={colors.gray} 
              />
            </TouchableOpacity>

            {ejercicioActual === index && (
              <View style={styles.ejercicioContent}>
                <Text style={styles.instruccionesLabel}>{t('instructions')}</Text>
                <Text style={styles.instruccionesText}>{ej.instrucciones}</Text>
                
                <View style={styles.repeticionesRow}>
                  <Ionicons name="repeat" size={20} color={colors.primary} />
                  <Text style={styles.repeticionesText}>{ej.repeticiones}</Text>
                </View>

                <View style={styles.tipContainer}>
                  <Ionicons name="bulb" size={20} color={colors.accent} />
                  <Text style={styles.tipText}>{ej.tip}</Text>
                </View>
              </View>
            )}
          </Card>
        ))}

        {/* Completion Button */}
        {todosCompletados && (
          <View>
            {rewardData && (
              <View style={styles.rewardBanner} data-testid="exercise-reward-banner">
                <Text style={styles.rewardText}>+{rewardData.bones_added} 🦴</Text>
                <Text style={styles.rewardSubtext}>{t('level')} {rewardData.level} - {rewardData.xp} XP</Text>
                {rewardData.leveled_up && (
                  <Text style={styles.levelUpText}>{t('levelUp')} {rewardData.level}!</Text>
                )}
              </View>
            )}
            <TouchableOpacity 
              style={styles.completarButton}
              onPress={() => router.back()}
              data-testid="exercise-complete-button"
            >
              <Ionicons name="checkmark-circle" size={24} color={colors.white} />
              <Text style={styles.completarButtonText}>
                {rewardData ? t('backToEducation') : `${t('exercisesCompleted')} +${ejercicio.huesos} 🦴`}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (C: any, S: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: C.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: C.white,
  },
  huesosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  huesosText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: C.white,
    marginRight: 4,
  },
  boneEmoji: {
    fontSize: 16,
  },
  heroImage: {
    width: '100%',
    height: 180,
  },
  heroOverlay: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    height: 180,
    padding: Spacing.lg,
    justifyContent: 'flex-end',
  },
  heroSubtitle: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: C.white,
    marginBottom: 4,
  },
  heroDescription: {
    fontSize: FontSizes.md,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
    marginTop: 130,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  progressText: {
    fontSize: FontSizes.md,
    color: C.textSecondary,
    marginBottom: Spacing.sm,
  },
  progressDots: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.grayLight,
  },
  progressDotComplete: {
    backgroundColor: C.primary,
  },
  ejercicioCard: {
    marginBottom: Spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  ejercicioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  ejercicioTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: C.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxComplete: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  ejercicioNombre: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: C.text,
  },
  ejercicioNombreComplete: {
    color: C.primary,
  },
  ejercicioContent: {
    padding: Spacing.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: C.grayLight,
  },
  instruccionesLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: C.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  instruccionesText: {
    fontSize: FontSizes.md,
    color: C.text,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  repeticionesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  repeticionesText: {
    fontSize: FontSizes.md,
    color: C.primary,
    fontWeight: '600',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: C.accentLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  tipText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: C.text,
    lineHeight: 20,
  },
  completarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: C.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  completarButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: C.white,
  },
  rewardBanner: {
    backgroundColor: C.accentLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  rewardText: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: C.accent,
  },
  rewardSubtext: {
    fontSize: FontSizes.sm,
    color: C.textSecondary,
    marginTop: 4,
  },
  levelUpText: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: C.primary,
    marginTop: Spacing.xs,
  },
});
