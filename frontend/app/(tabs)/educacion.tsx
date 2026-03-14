import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';
import { SecureStore } from '../../utils/secureStore';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, Language } from '../../contexts/LanguageContext';
import { Card, Button, ProgressCircle } from '../../components/ui';
import { Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { getTrainingPrograms, getExercises, getGames } from '../../data/educationContent';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';
const { width } = Dimensions.get('window');

export default function EducacionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentDog, user } = useAuth();
  const { t, language } = useLanguage();
  const { colors, shadows } = useTheme();
  // Get translated content
  const trainingPrograms = getTrainingPrograms(language as 'es' | 'en' | 'it');
  const exercises = getExercises(language as 'es' | 'en' | 'it');
  const games = getGames(language as 'es' | 'en' | 'it');
  
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    bones: 240,
    level: 3,
    levelName: 'Explorador Canino',
    xp: 750,
    xpTarget: 1000,
    streak: 3,
    exercisesCompleted: 12,
    practiceMinutes: 45,
  });
  const [showReward, setShowReward] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      if (!token) return;
      
      const response = await axios.get(
        `${BACKEND_URL}/api/gamification/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setStats(prev => ({
        ...prev,
        bones: response.data.bones,
        level: response.data.level,
        xp: response.data.level_progress,
        xpTarget: response.data.level_target,
      }));
    } catch (error) {
      console.log('Error loading stats');
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Reload stats when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const handleCompleteExercise = async (xp: number) => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      await axios.post(
        `${BACKEND_URL}/api/gamification/add-bones`,
        { amount: xp, reason: 'Ejercicio completado' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadStats();
    } catch (error) {
      console.log('Error completing exercise');
    }
  };

  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.userAvatar}>
              <Ionicons name="paw" size={20} color={colors.white} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Heimdall</Text>
              <Text style={styles.headerSubtitle}>{t('positiveEducation')}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bonesButton}>
            <Text style={styles.bonesIcon}>🦴</Text>
            <Text style={styles.bonesText}>{stats.bones}</Text>
          </TouchableOpacity>
        </View>

        {/* Reward Notification */}
        {showReward && (
          <TouchableOpacity style={styles.rewardCard} onPress={() => setShowReward(false)}>
            <Text style={styles.rewardIcon}>🎉</Text>
            <View style={styles.rewardContent}>
              <Text style={styles.rewardTitle}>{t('greatJob')}</Text>
              <Text style={styles.rewardSubtitle}>+15 {t('heimdallBones')}</Text>
            </View>
            <Text style={styles.rewardLink}>{t('viewRewards')}</Text>
          </TouchableOpacity>
        )}

        {/* Today's Session */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('todaySession')}</Text>
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>{t('highPriority')}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.sessionCard} onPress={() => router.push('/leccion?id=llamada-perfecta')}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600' }}
              style={styles.sessionImage}
            />
            <View style={styles.sessionOverlay}>
              <View style={styles.sessionBadge}>
                <Text style={styles.sessionBadgeText}>{t('intermediate')}</Text>
              </View>
              <View style={styles.sessionXpBadge}>
                <Text style={styles.sessionXpIcon}>🦴</Text>
                <Text style={styles.sessionXpText}>+15</Text>
              </View>
            </View>
            <View style={styles.sessionContent}>
              <Text style={styles.sessionTitle}>{t('thePerfectCall')}</Text>
              <View style={styles.sessionMeta}>
                <View style={styles.sessionMetaItem}>
                  <Ionicons name="time-outline" size={14} color={colors.white} />
                  <Text style={styles.sessionMetaText}>10 {t('min')}</Text>
                </View>
                <View style={styles.sessionMetaItem}>
                  <Ionicons name="paw" size={14} color={colors.white} />
                  <Text style={styles.sessionMetaText}>+50 XP</Text>
                </View>
              </View>
            </View>
            <View style={styles.playButton}>
              <Ionicons name="play" size={28} color={colors.white} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Progress Section */}
        <Card style={styles.progressCard} variant="elevated">
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>{t('yourProgress')}</Text>
              <Text style={styles.progressLevel}>{t('level')} {stats.level}: {t('explorerLevel')}</Text>
              <Text style={styles.progressXp}>{stats.xp} XP</Text>
            </View>
            <View style={styles.streakBadge}>
              <Ionicons name="flash" size={16} color={colors.accent} />
              <Text style={styles.streakText}>{stats.streak} {t('days')}</Text>
            </View>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(stats.xp / stats.xpTarget) * 100}%` }]} />
            </View>
            <Text style={styles.progressTarget}>{stats.xpTarget} XP</Text>
          </View>
          
          <Text style={styles.progressHint}>{t('almostLevel')} {stats.level + 1}!</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.exercisesCompleted}</Text>
              <Text style={styles.statLabel}>{t('exercises')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.practiceMinutes}m</Text>
              <Text style={styles.statLabel}>{t('practice')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.bones}</Text>
              <Text style={styles.statLabel}>{t('bones')} 🦴</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.nextButton} onPress={() => router.push('/progreso')} data-testid="view-progress-btn">
            <Ionicons name="bar-chart" size={16} color={colors.white} style={{ marginRight: 6 }} />
            <Text style={styles.nextButtonText}>Mi Progreso</Text>
          </TouchableOpacity>
        </Card>

        {/* Training Programs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('guidedPrograms')}</Text>
          <View style={styles.programsGrid}>
            {trainingPrograms.map((program) => (
              <TouchableOpacity 
                key={program.id} 
                style={styles.programCard}
                onPress={() => router.push(`/programa?id=${program.id}`)}
              >
                <Image source={{ uri: program.image }} style={styles.programImage} />
                <View style={[styles.categoryBadge, { backgroundColor: program.categoryColor }]}>
                  <Text style={styles.categoryText}>{program.category}</Text>
                </View>
                <View style={styles.xpBadge}>
                  <Text style={styles.xpIcon}>🦴</Text>
                  <Text style={styles.xpText}>+{program.xpReward}</Text>
                </View>
                <View style={styles.programContent}>
                  <Text style={styles.programTitle}>{program.title}</Text>
                  <Text style={styles.programSubtitle}>{program.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Exercise Library */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('exerciseLibrary')}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>{t('viewAll')}</Text>
            </TouchableOpacity>
          </View>
          
          <Card variant="elevated">
            {exercises.map((exercise, index) => (
              <TouchableOpacity 
                key={exercise.id} 
                style={[styles.exerciseItem, index < exercises.length - 1 && styles.exerciseItemBorder]}
                onPress={() => router.push(`/ejercicio?id=${exercise.id}`)}
              >
                <View style={[styles.exerciseIcon, { backgroundColor: exercise.iconColor + '20' }]}>
                  <Ionicons name={exercise.icon as any} size={24} color={exercise.iconColor} />
                </View>
                <View style={styles.exerciseContent}>
                  <View style={styles.exerciseTitleRow}>
                    <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                    <View style={styles.exerciseXp}>
                      <Text style={styles.exerciseXpIcon}>🦴</Text>
                      <Text style={styles.exerciseXpText}>{exercise.xpReward}</Text>
                    </View>
                  </View>
                  <Text style={styles.exerciseSubtitle}>{exercise.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.gray} />
              </TouchableOpacity>
            ))}
          </Card>
        </View>

        {/* Recommended Games */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('recommendedGames')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.gamesRow}>
              {games.map((game) => (
                <TouchableOpacity 
                  key={game.id} 
                  style={styles.gameCard}
                  onPress={() => router.push(`/juego?id=${game.id}`)}
                >
                  <Image source={{ uri: game.image }} style={styles.gameImage} />
                  <View style={styles.gameContent}>
                    <Text style={styles.gameTitle}>{game.title}</Text>
                    <View style={styles.gameMeta}>
                      <View style={styles.difficultyBadge}>
                        <Text style={styles.difficultyText}>{game.difficulty}</Text>
                      </View>
                      <View style={styles.gameXp}>
                        <Text style={styles.gameXpText}>+{game.xpReward} 🦴</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (C: any, S: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: C.text,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    color: C.textSecondary,
  },
  bonesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.accentLight,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  bonesIcon: {
    fontSize: 18,
  },
  bonesText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: C.accent,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.cardHighlight,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: C.primary + '30',
  },
  rewardIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  rewardContent: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: C.text,
  },
  rewardSubtitle: {
    fontSize: FontSizes.sm,
    color: C.textSecondary,
  },
  rewardLink: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: C.primary,
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
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: C.text,
  },
  priorityBadge: {
    backgroundColor: C.error + '20',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  priorityText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: C.error,
  },
  sessionCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    height: 200,
    position: 'relative',
  },
  sessionImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  sessionOverlay: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sessionBadge: {
    backgroundColor: C.primary,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  sessionBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: C.white,
  },
  sessionXpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.accent,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 2,
  },
  sessionXpIcon: {
    fontSize: 12,
  },
  sessionXpText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: C.white,
  },
  sessionContent: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
  },
  sessionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: C.white,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  sessionMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  sessionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionMetaText: {
    fontSize: FontSizes.sm,
    color: C.white,
    fontWeight: '500',
  },
  playButton: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...S.lg,
  },
  progressCard: {
    marginBottom: Spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  progressTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: C.text,
  },
  progressLevel: {
    fontSize: FontSizes.sm,
    color: C.textSecondary,
    marginTop: 2,
  },
  progressXp: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: C.accent,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.accent + '20',
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  streakText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: C.accent,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: C.grayLight,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: C.primary,
    borderRadius: 5,
  },
  progressTarget: {
    fontSize: FontSizes.sm,
    color: C.textSecondary,
  },
  progressHint: {
    fontSize: FontSizes.sm,
    color: C.primary,
    fontWeight: '500',
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: C.grayLight,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: C.text,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: C.textSecondary,
  },
  nextButton: {
    backgroundColor: C.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: C.white,
  },
  programsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  programCard: {
    width: (width - Spacing.md * 3) / 2,
    borderRadius: BorderRadius.xl,
    backgroundColor: C.white,
    overflow: 'hidden',
    ...S.md,
  },
  programImage: {
    width: '100%',
    height: 120,
  },
  categoryBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  categoryText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: C.white,
  },
  xpBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.accent,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 2,
  },
  xpIcon: {
    fontSize: 10,
  },
  xpText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: C.white,
  },
  programContent: {
    padding: Spacing.md,
  },
  programTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: C.text,
  },
  programSubtitle: {
    fontSize: FontSizes.sm,
    color: C.textSecondary,
  },
  seeAllText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: C.primary,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  exerciseItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.grayLight,
  },
  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: C.text,
  },
  exerciseXp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  exerciseXpIcon: {
    fontSize: 14,
  },
  exerciseXpText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: C.accent,
  },
  exerciseSubtitle: {
    fontSize: FontSizes.sm,
    color: C.textSecondary,
  },
  gamesRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingRight: Spacing.md,
  },
  gameCard: {
    width: 160,
    borderRadius: BorderRadius.lg,
    backgroundColor: C.white,
    overflow: 'hidden',
    ...S.sm,
  },
  gameImage: {
    width: '100%',
    height: 90,
  },
  gameContent: {
    padding: Spacing.sm,
  },
  gameTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: C.text,
  },
  gameMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  difficultyBadge: {
    backgroundColor: C.primary + '20',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: FontSizes.xs,
    color: C.primary,
    fontWeight: '500',
  },
  gameXp: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameXpText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: C.accent,
  },
});
