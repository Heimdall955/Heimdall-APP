import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button, ProgressCircle } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../../constants/theme';

interface TrainingPlan {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalDays: number;
  currentDay: number;
  icon: string;
  color: string;
}

const mockPlans: TrainingPlan[] = [
  {
    id: '1',
    title: 'Obediencia Básica',
    description: 'Sienta, quieto, ven',
    progress: 65,
    totalDays: 14,
    currentDay: 9,
    icon: 'school',
    color: Colors.primary,
  },
  {
    id: '2',
    title: 'Paseo sin tirar',
    description: 'Correa suelta',
    progress: 30,
    totalDays: 21,
    currentDay: 6,
    icon: 'walk',
    color: Colors.accentEducation,
  },
];

const dailyTips = [
  '🐕 Refuerza siempre en positivo: premios, caricias y palabras de aliento.',
  '⏱️ Las sesiones cortas (5-10 min) son más efectivas que las largas.',
  '🎯 Practica un comando a la vez hasta que lo domine.',
];

export default function EducacionScreen() {
  const { currentDog } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const generateRoutine = () => {
    // TODO: Generate AI routine
    setCurrentTipIndex((prev) => (prev + 1) % dailyTips.length);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Academia Heimdall</Text>
            <Text style={styles.subtitle}>Educación positiva</Text>
          </View>
          <View style={styles.bonesContainer}>
            <Text style={styles.bonesEmoji}>🦴</Text>
            <Text style={styles.bonesCount}>340</Text>
          </View>
        </View>

        {/* Flash Routine Card */}
        <Card style={styles.routineCard} variant="elevated">
          <View style={styles.routineHeader}>
            <View style={styles.routineIcon}>
              <Ionicons name="flash" size={28} color={Colors.white} />
            </View>
            <View style={styles.routineInfo}>
              <Text style={styles.routineTitle}>Rutina Flash</Text>
              <Text style={styles.routineSubtitle}>Ejercicio rápido del día</Text>
            </View>
          </View>
          
          <Card style={styles.tipCard}>
            <Text style={styles.tipText}>{dailyTips[currentTipIndex]}</Text>
          </Card>
          
          <Button
            title="Generar Rutina"
            onPress={generateRoutine}
            icon={<Ionicons name="refresh" size={20} color={Colors.white} />}
            style={styles.routineButton}
          />
        </Card>

        {/* My Plans */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mis planes</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {mockPlans.map((plan) => (
            <Card key={plan.id} style={styles.planCard} variant="elevated" onPress={() => {}}>
              <View style={styles.planContent}>
                <View style={[styles.planIcon, { backgroundColor: plan.color + '20' }]}>
                  <Ionicons name={plan.icon as any} size={24} color={plan.color} />
                </View>
                <View style={styles.planInfo}>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  <Text style={styles.planDescription}>{plan.description}</Text>
                  <View style={styles.planProgress}>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${plan.progress}%`, backgroundColor: plan.color }]} />
                    </View>
                    <Text style={styles.planDays}>Día {plan.currentDay}/{plan.totalDays}</Text>
                  </View>
                </View>
                <View style={styles.planPercentage}>
                  <ProgressCircle percentage={plan.progress} size={56} color={plan.color} />
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Quick Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Principios de educación positiva</Text>
          <Card variant="elevated">
            <View style={styles.principleItem}>
              <Ionicons name="heart" size={24} color={Colors.primary} />
              <View style={styles.principleText}>
                <Text style={styles.principleTitle}>Refuerzo positivo</Text>
                <Text style={styles.principleDescription}>Premia los comportamientos deseados</Text>
              </View>
            </View>
            <View style={styles.principleItem}>
              <Ionicons name="time" size={24} color={Colors.accent} />
              <View style={styles.principleText}>
                <Text style={styles.principleTitle}>Paciencia</Text>
                <Text style={styles.principleDescription}>Cada perro aprende a su ritmo</Text>
              </View>
            </View>
            <View style={styles.principleItem}>
              <Ionicons name="repeat" size={24} color={Colors.accentEducation} />
              <View style={styles.principleText}>
                <Text style={styles.principleTitle}>Consistencia</Text>
                <Text style={styles.principleDescription}>Repite los ejercicios regularmente</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logros recientes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.achievementsRow}>
              {[
                { icon: 'trophy', label: 'Primera semana', color: Colors.accent },
                { icon: 'ribbon', label: '10 sesiones', color: Colors.accentEducation },
                { icon: 'star', label: 'Sienta dominado', color: Colors.primary },
              ].map((achievement, index) => (
                <View key={index} style={styles.achievementCard}>
                  <View style={[styles.achievementIcon, { backgroundColor: achievement.color + '20' }]}>
                    <Ionicons name={achievement.icon as any} size={28} color={achievement.color} />
                  </View>
                  <Text style={styles.achievementLabel}>{achievement.label}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  bonesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent + '20',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  bonesEmoji: {
    fontSize: 20,
  },
  bonesCount: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text,
  },
  routineCard: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.accentEducation,
  },
  routineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  routineIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routineInfo: {
    flex: 1,
  },
  routineTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.white,
  },
  routineSubtitle: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  tipCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginBottom: Spacing.md,
  },
  tipText: {
    fontSize: FontSizes.md,
    color: Colors.text,
    lineHeight: 24,
  },
  routineButton: {
    backgroundColor: Colors.white,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  viewAllText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  planCard: {
    marginBottom: Spacing.md,
  },
  planContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  planTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text,
  },
  planDescription: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  planProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.grayLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  planDays: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  planPercentage: {
    marginLeft: Spacing.md,
  },
  principleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  principleText: {
    flex: 1,
  },
  principleTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  principleDescription: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  achievementsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingRight: Spacing.md,
  },
  achievementCard: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    width: 100,
    ...Shadows.sm,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  achievementLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
});
