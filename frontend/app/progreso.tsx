import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';
import { Spacing, BorderRadius, FontSizes } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from '../components/ui';
import { useLanguage } from '../contexts/LanguageContext';
import { SecureStore } from '../utils/secureStore';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

// Programs data (matching programa.tsx)
const PROGRAMS = [
  {
    id: 'educacion-basica',
    title: 'Educacion Basica',
    color: '#4CAF50',
    icon: 'school' as const,
    lessons: ['refuerzo-positivo', 'sentado-basico', 'quieto', 'llamada-perfecta', 'tumbado', 'paseo-correa'],
  },
  {
    id: 'calma-control',
    title: 'Calma y Control',
    color: '#FF9800',
    icon: 'leaf' as const,
    lessons: ['estres-canino', 'relajacion', 'lugar-seguro', 'desensibilizacion', 'rutinas-calmantes'],
  },
  {
    id: 'socializacion',
    title: 'Socializacion',
    color: '#2196F3',
    icon: 'people' as const,
    lessons: ['ventana-socializacion', 'presentaciones-perros', 'interaccion-humanos', 'nuevos-entornos', 'sonidos-estimulos', 'parque-canino'],
  },
  {
    id: 'mundo-cachorro',
    title: 'Mundo Cachorro',
    color: '#E91E63',
    icon: 'paw' as const,
    lessons: ['bienvenido-casa', 'rutina-cachorro', 'inhibicion-mordisco', 'necesidades', 'socializacion-temprana', 'juego-apropiado', 'quedarse-solo'],
  },
];

const ALL_LESSONS_COUNT = PROGRAMS.reduce((acc, p) => acc + p.lessons.length, 0);

export default function ProgresoScreen() {
  const router = useRouter();
  const { colors, shadows } = useTheme();
  const { t } = useLanguage();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [stats, setStats] = useState({ bones: 0, xp: 0, level: 1, streak_days: 0, exercises_completed: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };

      const [progressRes, statsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/lessons/progress`, { headers }),
        axios.get(`${BACKEND_URL}/api/gamification/stats`, { headers }),
      ]);

      setCompletedLessons((progressRes.data?.completed_lessons || []).map((l: any) => l.lesson_id));
      setStats({
        bones: statsRes.data?.bones || 0,
        xp: statsRes.data?.xp || 0,
        level: statsRes.data?.level || 1,
        streak_days: statsRes.data?.streak_days || 0,
        exercises_completed: statsRes.data?.exercises_completed || 0,
      });
    } catch (e) {
      console.log('Error loading progress data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);
  const globalPercent = ALL_LESSONS_COUNT > 0 ? Math.round((completedLessons.length / ALL_LESSONS_COUNT) * 100) : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} data-testid="progress-back-btn">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Progreso</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Big Stats Ring */}
        <View style={styles.ringSection} data-testid="global-progress">
          <View style={styles.ringOuter}>
            <View style={styles.ringInner}>
              <Text style={styles.ringPercent}>{globalPercent}%</Text>
              <Text style={styles.ringLabel}>completado</Text>
            </View>
          </View>
          <Text style={styles.ringSubtext}>{completedLessons.length} de {ALL_LESSONS_COUNT} lecciones</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow} data-testid="stats-row">
          <StatBox icon="flame" color="#E67E22" value={stats.streak_days} label="Racha" colors={colors} styles={styles} />
          <StatBox icon="flash" color={colors.accent} value={stats.xp} label="XP Total" colors={colors} styles={styles} />
          <StatBox icon="trophy" color={colors.primary} value={stats.level} label="Nivel" colors={colors} styles={styles} />
          <StatBox icon="star" color="#D4A60B" value={stats.bones} label="Huesos" colors={colors} styles={styles} />
        </View>

        {/* Programs Progress */}
        <Text style={styles.sectionTitle}>Programas</Text>
        {PROGRAMS.map(program => {
          const done = program.lessons.filter(l => completedLessons.includes(l)).length;
          const total = program.lessons.length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const isComplete = done === total;

          return (
            <TouchableOpacity
              key={program.id}
              style={styles.programRow}
              onPress={() => router.push(`/programa?id=${program.id}`)}
              data-testid={`program-${program.id}`}
            >
              <View style={[styles.programIcon, { backgroundColor: program.color + '20' }]}>
                <Ionicons name={program.icon} size={22} color={program.color} />
              </View>
              <View style={styles.programInfo}>
                <View style={styles.programTitleRow}>
                  <Text style={styles.programName}>{program.title}</Text>
                  {isComplete && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
                </View>
                <Text style={styles.programMeta}>{done}/{total} lecciones</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: program.color }]} />
                </View>
              </View>
              <Text style={[styles.programPct, { color: program.color }]}>{pct}%</Text>
            </TouchableOpacity>
          );
        })}

        {/* Recent completions */}
        {completedLessons.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>Lecciones recientes</Text>
            <Card style={styles.recentCard}>
              {completedLessons.slice(0, 8).map((lessonId, idx) => (
                <View key={lessonId} style={[styles.recentItem, idx < Math.min(completedLessons.length, 8) - 1 && styles.recentBorder]}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  <Text style={styles.recentText}>{lessonId.replace(/-/g, ' ')}</Text>
                </View>
              ))}
            </Card>
          </>
        )}

        {/* Motivational */}
        {globalPercent < 100 && (
          <Card style={styles.motivCard}>
            <Ionicons name="rocket" size={28} color={colors.accent} />
            <Text style={styles.motivText}>
              {globalPercent < 25 ? 'Buen comienzo! Sigue asi para desbloquear nuevos niveles.' :
               globalPercent < 50 ? 'Gran progreso! Ya llevas casi la mitad.' :
               globalPercent < 75 ? 'Increible! Estas a mas de la mitad del camino.' :
               'Casi lo tienes! Un ultimo esfuerzo para completar todo.'}
            </Text>
          </Card>
        )}
        {globalPercent === 100 && (
          <Card style={[styles.motivCard, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="ribbon" size={28} color={colors.primary} />
            <Text style={[styles.motivText, { color: colors.primary }]}>
              Felicidades! Has completado todas las lecciones. Eres un experto en educacion canina.
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ icon, color, value, label, colors, styles }: any) {
  return (
    <View style={styles.statBox}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const createStyles = (C: any, S: any) => StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: C.text },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  // Ring
  ringSection: { alignItems: 'center', marginBottom: Spacing.lg },
  ringOuter: {
    width: 140, height: 140, borderRadius: 70,
    borderWidth: 8, borderColor: C.primary,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.primaryLight,
  },
  ringInner: { alignItems: 'center' },
  ringPercent: { fontSize: FontSizes.hero, fontWeight: '800', color: C.primary },
  ringLabel: { fontSize: FontSizes.sm, color: C.textSecondary, marginTop: -2 },
  ringSubtext: { fontSize: FontSizes.md, color: C.textSecondary, marginTop: Spacing.sm },

  // Stats Row
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: Spacing.lg, gap: Spacing.sm,
  },
  statBox: {
    flex: 1, alignItems: 'center', backgroundColor: C.cardBg,
    paddingVertical: Spacing.md, borderRadius: BorderRadius.lg,
    ...S.sm,
  },
  statValue: { fontSize: FontSizes.xl, fontWeight: '700', color: C.text, marginTop: 4 },
  statLabel: { fontSize: FontSizes.xs, color: C.textSecondary, marginTop: 2 },

  // Section
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: C.text, marginBottom: Spacing.sm },

  // Program Row
  programRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.cardBg,
    padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm,
    ...S.sm,
  },
  programIcon: {
    width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  programInfo: { flex: 1, marginLeft: Spacing.md },
  programTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  programName: { fontSize: FontSizes.md, fontWeight: '600', color: C.text },
  programMeta: { fontSize: FontSizes.sm, color: C.textSecondary, marginTop: 2, marginBottom: 6 },
  barTrack: { height: 6, backgroundColor: C.grayLight, borderRadius: 3 },
  barFill: { height: '100%', borderRadius: 3 },
  programPct: { fontSize: FontSizes.lg, fontWeight: '700', marginLeft: Spacing.sm },

  // Recent
  recentCard: { marginBottom: Spacing.md },
  recentItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  recentBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.grayLight },
  recentText: { fontSize: FontSizes.md, color: C.text, textTransform: 'capitalize' },

  // Motivational
  motivCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  motivText: { flex: 1, fontSize: FontSizes.md, color: C.textSecondary, lineHeight: 20 },
});
