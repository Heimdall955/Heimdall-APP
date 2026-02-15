import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { SecureStore } from '../../utils/secureStore';
import { useAuth } from '../../contexts/AuthContext';
import { useBluetooth } from '../../contexts/BluetoothContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, StatusBadge, ProgressCircle } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../../constants/theme';
// Define DogStatus type locally to avoid import issues
interface DogStatus {
  status: 'calm' | 'active' | 'anxious' | 'sleeping' | 'playing';
  bones: number;
  level_progress: number;
  level_target: number;
}

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentDog, user } = useAuth();
  const { isConnected, biometricData } = useBluetooth();
  const { t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [dogStatus, setDogStatus] = useState<DogStatus>({
    status: 'calm',
    bones: 240,
    level_progress: 340,
    level_target: 500,
  });

  const quickAccessItems = [
    { id: 'chaleco', icon: 'bluetooth', label: t('vest'), color: Colors.primary, route: '/chaleco' },
    { id: 'rutas', icon: 'navigate', label: t('gpsRoutes'), color: Colors.accentPurple, route: '/rutas' },
    { id: 'historial', icon: 'medical', label: t('history'), color: Colors.accentOrange, route: '/historial-medico' },
    { id: 'educacion', icon: 'school', label: t('academy'), color: Colors.accentMint, route: '/(tabs)/educacion' },
    { id: 'salud', icon: 'heart', label: t('health'), color: Colors.error, route: '/(tabs)/salud' },
    { id: 'pro', icon: 'diamond', label: t('pro'), color: Colors.accent, route: '/pro' },
  ];
  const [refreshing, setRefreshing] = useState(false);
  const [dogStatus, setDogStatus] = useState<DogStatus>({
    status: 'calm',
    bones: 240,
    level_progress: 340,
    level_target: 500,
  });

  const loadGamificationStats = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      if (!token) return;
      
      const response = await axios.get(
        `${BACKEND_URL}/api/gamification/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setDogStatus(prev => ({
        ...prev,
        bones: response.data.bones,
        level_progress: response.data.level_progress,
        level_target: response.data.level_target,
      }));
    } catch (error) {
      console.log('Error loading gamification stats');
    }
  }, []);

  useEffect(() => {
    loadGamificationStats();
  }, [loadGamificationStats]);

  // Update status based on biometric data
  useEffect(() => {
    if (isConnected && biometricData.connected) {
      let status: 'calm' | 'active' | 'anxious' | 'sleeping' | 'playing' = 'calm';
      
      if (biometricData.movement === 'high') {
        status = biometricData.heartRate > 100 ? 'playing' : 'active';
      } else if (biometricData.movement === 'low' && biometricData.heartRate < 60) {
        status = 'sleeping';
      } else if (biometricData.heartRate > 120) {
        status = 'anxious';
      }
      
      setDogStatus(prev => ({ ...prev, status }));
    }
  }, [isConnected, biometricData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGamificationStats();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 19) return t('goodAfternoon');
    return t('goodEvening');
  };

  const handleQuickAccess = (route: string | null) => {
    if (route) {
      router.push(route as any);
    }
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
        {/* Header with Logo */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/images/heimdall-logo.png')}
                style={styles.headerLogo}
                resizeMode="contain"
              />
              <View style={styles.onlineIndicator} />
            </View>
            <View>
              <Text style={styles.appName}>Heimdall</Text>
              <Text style={styles.subtitle}>{t('positiveEducation')}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={Colors.gray} />
          </TouchableOpacity>
        </View>

        {/* Reward Banner */}
        <View style={styles.rewardBanner}>
          <View style={styles.boneIconContainer}>
            <Text style={styles.boneEmoji}>🦴</Text>
          </View>
          <Text style={styles.rewardText}>{t('greatJob')} </Text>
          <Text style={styles.rewardHighlight}>+15 {t('bones').toLowerCase()}</Text>
          <Text style={styles.rewardText}> {t('bonesToday').split(' ')[0]}</Text>
          <TouchableOpacity>
            <Text style={styles.viewRewardsLink}>{t('viewRewards')}</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Session Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('todaySession')}</Text>
          <TouchableOpacity 
            style={styles.sessionCard}
            onPress={() => router.push('/leccion?id=llamada-perfecta')}
          >
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400' }}
              style={styles.sessionImage}
            />
            <View style={styles.sessionOverlay}>
              <View style={styles.sessionBadges}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>{t('intermediate')}</Text>
                </View>
                <View style={styles.priorityBadge}>
                  <Text style={styles.priorityBadgeText}>{t('highPriority')}</Text>
                </View>
              </View>
              <Text style={styles.sessionTitle}>{t('thePerfectCall')}</Text>
              <View style={styles.sessionMeta}>
                <View style={styles.sessionMetaItem}>
                  <Ionicons name="time-outline" size={16} color={Colors.white} />
                  <Text style={styles.sessionMetaText}>10 min</Text>
                </View>
                <View style={styles.sessionMetaItem}>
                  <Ionicons name="flame" size={16} color={Colors.white} />
                  <Text style={styles.sessionMetaText}>+50 XP</Text>
                </View>
              </View>
              <View style={styles.xpBadge}>
                <Text style={styles.xpBadgeText}>+15</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.playButton}>
              <Ionicons name="play" size={24} color={Colors.secondary} />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Your Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('yourProgress')}</Text>
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.levelTitle}>{t('level')} 3: {t('explorerLevel')}</Text>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarTrack}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { width: `${(dogStatus.level_progress / dogStatus.level_target) * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressBarText}>
                    {dogStatus.level_progress}/{dogStatus.level_target} XP
                  </Text>
                </View>
                <Text style={styles.progressHint}>{t('almostLevel')} 4!</Text>
              </View>
              <View style={styles.streakBadges}>
                <View style={styles.streakBadge}>
                  <Ionicons name="flash" size={14} color={Colors.accent} />
                  <Text style={styles.streakBadgeText}>3 {t('days')}</Text>
                </View>
                <View style={styles.streakBadge}>
                  <Ionicons name="trending-up" size={14} color={Colors.accentOrange} />
                  <Text style={styles.streakBadgeText}>{t('nextGoal')}: 50</Text>
                </View>
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>{t('exercises')}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>45m</Text>
                <Text style={styles.statLabel}>{t('practice')}</Text>
              </View>
              <View style={styles.statBox}>
                <View style={styles.bonesStatRow}>
                  <Text style={styles.statNumber}>{dogStatus.bones}</Text>
                  <Text style={styles.boneIcon}>🦴</Text>
                </View>
                <Text style={styles.statLabel}>{t('bones')}</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Quick Access */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('quickAccess')}</Text>
          <View style={styles.quickAccessGrid}>
            {quickAccessItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.quickAccessItem}
                onPress={() => handleQuickAccess(item.route)}
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon as any} size={26} color={item.color} />
                </View>
                <Text style={styles.quickAccessLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Exercise Library Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('exerciseLibrary')}</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/educacion')}>
              <Text style={styles.viewAllLink}>{t('viewAll')}</Text>
            </TouchableOpacity>
          </View>
          
          {[
            { id: 'senales-basicas', title: t('basicSignals'), subtitle: t('sitDownStay'), icon: 'paw', color: Colors.primary, xp: 5 },
            { id: 'control-impulsos', title: t('impulseControl'), subtitle: t('waitLeaveRelease'), icon: 'hand-left', color: Colors.accentPurple, xp: 10 },
            { id: 'socializacion', title: t('socialization'), subtitle: t('dogsPeopleEnvironments'), icon: 'search', color: Colors.accentMint, xp: 15 },
          ].map((exercise, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.exerciseCard}
              onPress={() => router.push(`/ejercicio?id=${exercise.id}`)}
            >
              <View style={[styles.exerciseIcon, { backgroundColor: exercise.color + '20' }]}>
                <Ionicons name={exercise.icon as any} size={24} color={exercise.color} />
              </View>
              <View style={styles.exerciseContent}>
                <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                <Text style={styles.exerciseSubtitle}>{exercise.subtitle}</Text>
              </View>
              <View style={styles.exerciseReward}>
                <Text style={styles.exerciseRewardText}>{exercise.xp}</Text>
                <Text style={styles.exerciseBone}>🦴</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Chat Promo */}
        <TouchableOpacity onPress={() => router.push('/(tabs)/chat')}>
          <Card style={styles.chatPromo}>
            <View style={styles.chatPromoContent}>
              <View style={styles.chatPromoIcon}>
                <Image 
                  source={require('../../assets/images/heimdall-logo.png')}
                  style={styles.chatPromoLogo}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.chatPromoText}>
                <Text style={styles.chatPromoTitle}>¿Tienes dudas?</Text>
                <Text style={styles.chatPromoSubtitle}>Pregúntale a Hani, tu asistente IA</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
            </View>
          </Card>
        </TouchableOpacity>

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 100 }} />
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
    gap: Spacing.md,
  },
  logoContainer: {
    position: 'relative',
  },
  headerLogo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  appName: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bannerBg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    flexWrap: 'wrap',
    gap: 4,
  },
  boneIconContainer: {
    marginRight: 4,
  },
  boneEmoji: {
    fontSize: 20,
  },
  rewardText: {
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  rewardHighlight: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.accent,
  },
  viewRewardsLink: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.accentOrange,
    marginLeft: 4,
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
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  viewAllLink: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  sessionCard: {
    height: 200,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  sessionImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  sessionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: Spacing.lg,
    justifyContent: 'flex-end',
  },
  sessionBadges: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  levelBadge: {
    backgroundColor: Colors.primary,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  levelBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.white,
  },
  priorityBadge: {
    backgroundColor: 'transparent',
  },
  priorityBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.accentOrange,
  },
  sessionTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  sessionMeta: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  sessionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionMetaText: {
    fontSize: FontSizes.sm,
    color: Colors.white,
    fontWeight: '500',
  },
  xpBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.rewardBadge,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  xpBadgeText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.white,
  },
  playButton: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCard: {
    padding: Spacing.lg,
  },
  progressHeader: {
    marginBottom: Spacing.lg,
  },
  levelTitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  progressBarContainer: {
    marginBottom: Spacing.xs,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: Colors.grayLight,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressBarText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  progressHint: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  streakBadges: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accentLight,
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  streakBadgeText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Colors.grayLight,
    paddingTop: Spacing.lg,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FontSizes.stat,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  bonesStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  boneIcon: {
    fontSize: 24,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  quickAccessItem: {
    width: '30%',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  quickAccessIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  quickAccessLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text,
  },
  exerciseSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  exerciseReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  exerciseRewardText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  exerciseBone: {
    fontSize: 14,
    marginLeft: 2,
  },
  chatPromo: {
    backgroundColor: Colors.white,
  },
  chatPromoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  chatPromoIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  chatPromoLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  chatPromoText: {
    flex: 1,
  },
  chatPromoTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  chatPromoSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
});
