import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { Spacing, BorderRadius, FontSizes } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from '../components/ui';
import { useLanguage } from '../contexts/LanguageContext';
import { SecureStore } from '../utils/secureStore';
import { getExerciseData } from '../data/exercisesContent';

import { BACKEND_URL } from '../config/backend';

export default function EjercicioScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { colors, shadows } = useTheme();

  const [ejercicioActual, setEjercicioActual] = useState(0);
  const [completados, setCompletados] = useState<number[]>([]);
  const [rewardData, setRewardData] = useState<any>(null);
  const [submittingReward, setSubmittingReward] = useState(false);

  const ejercicio = getExerciseData(language, id || 'senales-basicas');
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

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
  const progress = ejercicio.ejercicios.length > 0 ? (completados.length / ejercicio.ejercicios.length) * 100 : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Clean Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} data-testid="exercise-back-btn">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{ejercicio.titulo}</Text>
          <Text style={styles.headerSub}>{ejercicio.subtitulo}</Text>
        </View>
        <View style={[styles.bonesBadge, { backgroundColor: ejercicio.color + '18' }]}>
          <Ionicons name="trophy" size={16} color={ejercicio.color} />
          <Text style={[styles.bonesCount, { color: ejercicio.color }]}>{ejercicio.huesos}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Description Card */}
        <View style={[styles.descCard, { backgroundColor: ejercicio.color + '10', borderLeftColor: ejercicio.color }]}>
          <View style={[styles.descIcon, { backgroundColor: ejercicio.color + '20' }]}>
            <Ionicons name={ejercicio.icon as any} size={24} color={ejercicio.color} />
          </View>
          <Text style={styles.descText}>{ejercicio.descripcion}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>{completados.length}/{ejercicio.ejercicios.length} {t('completed')}</Text>
            <Text style={[styles.progressPct, { color: ejercicio.color }]}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: ejercicio.color }]} />
          </View>
        </View>

        {/* Exercises */}
        {ejercicio.ejercicios.map((ej: any, index: number) => {
          const isOpen = ejercicioActual === index;
          const isDone = completados.includes(index);
          return (
            <Card key={index} style={[styles.exCard, isDone && { borderLeftWidth: 3, borderLeftColor: ejercicio.color }]}>
              <TouchableOpacity
                style={styles.exHeader}
                onPress={() => setEjercicioActual(isOpen ? -1 : index)}
                data-testid={`exercise-item-${index}`}
              >
                <TouchableOpacity
                  style={[styles.checkbox, isDone && { backgroundColor: ejercicio.color, borderColor: ejercicio.color }]}
                  onPress={() => toggleCompletado(index)}
                  data-testid={`exercise-check-${index}`}
                >
                  {isDone && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.exName, isDone && { color: ejercicio.color }]}>{ej.nombre}</Text>
                  <Text style={styles.exReps}>{ej.repeticiones}</Text>
                </View>
                <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color={colors.gray} />
              </TouchableOpacity>

              {isOpen && (
                <View style={styles.exBody}>
                  <Text style={styles.exLabel}>{t('instructions')}</Text>
                  <Text style={styles.exInstructions}>{ej.instrucciones}</Text>
                  <View style={[styles.tipBox, { backgroundColor: ejercicio.color + '10' }]}>
                    <Ionicons name="bulb" size={18} color={ejercicio.color} />
                    <Text style={[styles.tipText, { color: ejercicio.color }]}>{ej.tip}</Text>
                  </View>
                </View>
              )}
            </Card>
          );
        })}

        {/* Reward & Complete */}
        {todosCompletados && (
          <View style={styles.completeSection}>
            {rewardData && (
              <View style={[styles.rewardCard, { backgroundColor: ejercicio.color + '12' }]} data-testid="exercise-reward-banner">
                <Ionicons name="trophy" size={28} color={ejercicio.color} />
                <Text style={[styles.rewardAmount, { color: ejercicio.color }]}>+{rewardData.bones_added} {t('bones')}</Text>
                <Text style={styles.rewardXP}>{t('level')} {rewardData.level} - {rewardData.xp} XP</Text>
                {rewardData.leveled_up && (
                  <Text style={[styles.levelUp, { color: ejercicio.color }]}>{t('levelUp')} {rewardData.level}!</Text>
                )}
              </View>
            )}
            <TouchableOpacity
              style={[styles.completeBtn, { backgroundColor: ejercicio.color }]}
              onPress={() => router.back()}
              data-testid="exercise-complete-button"
            >
              <Ionicons name="checkmark-circle" size={22} color="#FFF" />
              <Text style={styles.completeBtnText}>{t('done')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (C: any, S: any) => StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.grayLight,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: C.text },
  headerSub: { fontSize: FontSizes.sm, color: C.textSecondary, marginTop: 1 },
  bonesBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  bonesCount: { fontSize: FontSizes.md, fontWeight: '800' },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xl },

  // Description
  descCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.lg, borderLeftWidth: 4, marginBottom: Spacing.lg },
  descIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  descText: { flex: 1, fontSize: FontSizes.md, color: C.text, lineHeight: 22 },

  // Progress
  progressSection: { marginBottom: Spacing.lg },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: FontSizes.sm, color: C.textSecondary },
  progressPct: { fontSize: FontSizes.sm, fontWeight: '700' },
  progressTrack: { height: 8, backgroundColor: C.grayLight, borderRadius: 4 },
  progressFill: { height: '100%', borderRadius: 4 },

  // Exercise Card
  exCard: { marginBottom: Spacing.sm, padding: 0, overflow: 'hidden' },
  exHeader: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  checkbox: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: C.grayLight, alignItems: 'center', justifyContent: 'center' },
  exName: { fontSize: FontSizes.md, fontWeight: '700', color: C.text },
  exReps: { fontSize: FontSizes.sm, color: C.textSecondary, marginTop: 2 },
  exBody: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.grayLight },
  exLabel: { fontSize: FontSizes.sm, fontWeight: '700', color: C.textSecondary, marginTop: Spacing.md, marginBottom: Spacing.sm },
  exInstructions: { fontSize: FontSizes.md, color: C.text, lineHeight: 24, marginBottom: Spacing.md },
  tipBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.md },
  tipText: { flex: 1, fontSize: FontSizes.sm, fontWeight: '600', lineHeight: 20 },

  // Complete
  completeSection: { marginTop: Spacing.md },
  rewardCard: { alignItems: 'center', padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.md },
  rewardAmount: { fontSize: FontSizes.xxl, fontWeight: '800', marginTop: Spacing.sm },
  rewardXP: { fontSize: FontSizes.sm, color: C.textSecondary, marginTop: 4 },
  levelUp: { fontSize: FontSizes.lg, fontWeight: '800', marginTop: Spacing.sm },
  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: 16, borderRadius: BorderRadius.lg },
  completeBtnText: { fontSize: FontSizes.lg, fontWeight: '700', color: '#FFF' },
});
