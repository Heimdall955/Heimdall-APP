import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';
import { SecureStore } from '../../utils/secureStore';
import { useAuth } from '../../contexts/AuthContext';
import { useBluetooth } from '../../contexts/BluetoothContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, StatusBadge, ProgressCircle } from '../../components/ui';
import { WalletCard } from '../../components/WalletCard';
import { Spacing, BorderRadius, FontSizes } from '../../constants/theme';

interface DogStatus {
  status: 'calm' | 'active' | 'anxious' | 'sleeping' | 'playing';
  bones: number;
  level: number;
  level_progress: number;
  level_target: number;
  streak_days: number;
  exercises_completed: number;
  practice_minutes: number;
}

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentDog, user } = useAuth();
  const { isConnected, biometricData } = useBluetooth();
  const { t } = useLanguage();
  const { colors, shadows, isDark, toggleTheme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState<any>(null);
  const [dogStatus, setDogStatus] = useState<DogStatus>({
    status: 'calm', bones: 0, level: 1, level_progress: 0,
    level_target: 500, streak_days: 0, exercises_completed: 0, practice_minutes: 0,
  });

  const quickAccessItems = [
    { id: 'chaleco', icon: 'bluetooth', label: t('vest'), color: colors.primary, route: '/chaleco' },
    { id: 'rutas', icon: 'navigate', label: t('gpsRoutes'), color: colors.accentPurple, route: '/rutas' },
    { id: 'historial', icon: 'medical', label: t('history'), color: colors.accentOrange, route: '/historial-medico' },
    { id: 'educacion', icon: 'school', label: t('academy'), color: colors.accentMint, route: '/(tabs)/educacion' },
    { id: 'salud', icon: 'heart', label: t('health'), color: colors.error, route: '/(tabs)/salud' },
    { id: 'pro', icon: 'diamond', label: t('pro'), color: colors.accent, route: '/pro' },
  ];

  const loadGamificationStats = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      if (!token) return;
      const [statsRes, weeklyRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/gamification/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BACKEND_URL}/api/gamification/weekly-summary`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
      ]);
      setDogStatus(prev => ({
        ...prev, bones: statsRes.data.bones, level: statsRes.data.level || 1,
        level_progress: statsRes.data.level_progress, level_target: statsRes.data.level_target,
        streak_days: statsRes.data.streak_days || 0, exercises_completed: statsRes.data.exercises_completed || 0,
        practice_minutes: statsRes.data.practice_minutes || 0,
      }));
      if (weeklyRes?.data) setWeeklySummary(weeklyRes.data);
    } catch (error) { console.log('Error loading gamification stats'); }
  }, []);

  useEffect(() => { loadGamificationStats(); }, [loadGamificationStats]);
  useFocusEffect(useCallback(() => { loadGamificationStats(); }, [loadGamificationStats]));

  useEffect(() => {
    if (isConnected && biometricData.connected) {
      let status: DogStatus['status'] = 'calm';
      if (biometricData.movement === 'high') status = biometricData.heartRate > 100 ? 'playing' : 'active';
      else if (biometricData.movement === 'low' && biometricData.heartRate < 60) status = 'sleeping';
      else if (biometricData.heartRate > 120) status = 'anxious';
      setDogStatus(prev => ({ ...prev, status }));
    }
  }, [isConnected, biometricData]);

  const onRefresh = async () => { setRefreshing(true); await loadGamificationStats(); setRefreshing(false); };
  const getGreeting = () => { const h = new Date().getHours(); return h < 12 ? t('goodMorning') : h < 19 ? t('goodAfternoon') : t('goodEvening'); };
  const handleQuickAccess = (route: string | null) => { if (route) router.push(route as any); };

  const s = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView style={s.scrollView} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={{ position: 'relative' }}>
              <Image source={require('../../assets/images/heimdall-logo.png')} style={s.headerLogo} resizeMode="contain" />
              <View style={s.onlineIndicator} />
            </View>
            <View>
              <Text style={s.appName}>Heimdall</Text>
              <Text style={s.subtitle}>{t('positiveEducation')}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={[s.iconBtn, isDark && { backgroundColor: colors.accent + '25' }]} onPress={toggleTheme} testID="theme-toggle-btn">
              <Ionicons name={isDark ? 'sunny' : 'moon-outline'} size={22} color={isDark ? colors.accent : colors.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={s.iconBtn}>
              <Ionicons name="notifications-outline" size={24} color={colors.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Reward Banner */}
        {dogStatus.bones > 0 && (
          <View style={s.rewardBanner}>
            <Text style={{ fontSize: 20, marginRight: 4 }}>{'🦴'}</Text>
            <Text style={s.rewardText}>{t('greatJob')} </Text>
            <Text style={s.rewardHighlight}>{dogStatus.bones} {t('bones').toLowerCase()}</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/perfil')}>
              <Text style={s.viewRewardsLink}>{t('viewRewards')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Today's Session */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('todaySession')}</Text>
          <TouchableOpacity style={s.sessionCard} onPress={() => router.push('/leccion?id=llamada-perfecta')}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400' }} style={StyleSheet.absoluteFillObject} />
            <View style={s.sessionOverlay}>
              <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm }}>
                <View style={{ backgroundColor: colors.primary, paddingVertical: 4, paddingHorizontal: Spacing.sm, borderRadius: BorderRadius.sm }}>
                  <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: '#FFF' }}>{t('intermediate')}</Text>
                </View>
                <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: colors.accentOrange }}>{t('highPriority')}</Text>
              </View>
              <Text style={{ fontSize: FontSizes.xxl, fontWeight: '800', color: '#FFF', marginBottom: Spacing.sm }}>{t('thePerfectCall')}</Text>
              <View style={{ flexDirection: 'row', gap: Spacing.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="time-outline" size={16} color="#FFF" />
                  <Text style={{ fontSize: FontSizes.sm, color: '#FFF', fontWeight: '500' }}>10 min</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="flame" size={16} color="#FFF" />
                  <Text style={{ fontSize: FontSizes.sm, color: '#FFF', fontWeight: '500' }}>+50 XP</Text>
                </View>
              </View>
            </View>
            <View style={s.playButton}><Ionicons name="play" size={24} color={colors.secondary} /></View>
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('yourProgress')}</Text>
          <Card style={{ padding: Spacing.lg }}>
            <View style={{ marginBottom: Spacing.lg }}>
              <Text style={{ fontSize: FontSizes.md, color: colors.textSecondary, marginBottom: Spacing.sm }}>{t('level')} {dogStatus.level}: {t('explorerLevel')}</Text>
              <View style={{ height: 8, backgroundColor: colors.grayLight, borderRadius: 4, marginBottom: 4 }}>
                <View style={{ height: '100%', backgroundColor: colors.primary, borderRadius: 4, width: `${(dogStatus.level_progress / dogStatus.level_target) * 100}%` }} />
              </View>
              <Text style={{ fontSize: FontSizes.sm, color: colors.textSecondary, textAlign: 'right' }}>{dogStatus.level_progress}/{dogStatus.level_target} XP</Text>
              <Text style={{ fontSize: FontSizes.sm, color: colors.textSecondary }}>{t('almostLevel')} {dogStatus.level + 1}!</Text>
              <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.accentLight, paddingVertical: 6, paddingHorizontal: Spacing.sm, borderRadius: BorderRadius.sm }}>
                  <Ionicons name="flash" size={14} color={colors.accent} />
                  <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: colors.text }}>{dogStatus.streak_days} {t('days')}</Text>
                </View>
              </View>
            </View>
            <View style={s.statsRow}>
              <View style={{ alignItems: 'center' }}><Text style={s.statNumber}>{dogStatus.exercises_completed}</Text><Text style={s.statLabel}>{t('exercises')}</Text></View>
              <View style={{ alignItems: 'center' }}><Text style={s.statNumber}>{dogStatus.practice_minutes}m</Text><Text style={s.statLabel}>{t('practice')}</Text></View>
              <View style={{ alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Text style={s.statNumber}>{dogStatus.bones}</Text><Text style={{ fontSize: 24 }}>{'🦴'}</Text></View>
                <Text style={s.statLabel}>{t('bones')}</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Weekly Summary */}
        <View style={s.section} data-testid="weekly-summary-section">
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>{t('weeklyProgress')}</Text>
            <Text style={{ fontSize: FontSizes.sm, color: colors.textSecondary, fontWeight: '500' }}>{t('thisWeek')}</Text>
          </View>
          <Card style={{ padding: Spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md }}>
              {[
                { emoji: '🦴', value: weeklySummary?.bones_total || dogStatus.bones || 0, label: t('bonesThisWeek'), bg: '#FFD70020' },
                { icon: 'school', value: weeklySummary?.exercises_total || dogStatus.exercises_completed || 0, label: t('exercisesThisWeek'), bg: colors.accentMint + '20', iconColor: colors.accentMint },
                { icon: 'flash', value: weeklySummary?.streak_days || dogStatus.streak_days || 0, label: t('streakActive'), bg: colors.accentPurple + '20', iconColor: colors.accentPurple },
              ].map((item, i) => (
                <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs }}>
                    {item.emoji ? <Text style={{ fontSize: 20 }}>{item.emoji}</Text> : <Ionicons name={item.icon as any} size={20} color={item.iconColor} />}
                  </View>
                  <Text style={{ fontSize: FontSizes.xl, fontWeight: '800', color: colors.text }}>{item.value}</Text>
                  <Text style={{ fontSize: FontSizes.xs, color: colors.textSecondary, marginTop: 2 }}>{item.label}</Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.grayLight, borderRadius: BorderRadius.md, padding: Spacing.sm }}>
              <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: colors.text, marginRight: Spacing.sm }}>{t('level')} {weeklySummary?.level || dogStatus.level}</Text>
              <View style={{ flex: 1, height: 8, backgroundColor: colors.grayLight, borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: colors.gray + '30' }}>
                <View style={{ height: '100%', backgroundColor: colors.primary, borderRadius: 4, width: `${((weeklySummary?.level_progress || 0) / (weeklySummary?.level_target || 500)) * 100}%` }} />
              </View>
              <Text style={{ fontSize: FontSizes.xs, color: colors.textSecondary, marginLeft: Spacing.sm, fontWeight: '600' }}>{weeklySummary?.level_progress || 0}/{weeklySummary?.level_target || 500} XP</Text>
            </View>
          </Card>
        </View>

        {/* Leaderboard Preview */}
        <View style={s.section} data-testid="leaderboard-preview-section">
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>{t('leaderboard')}</Text>
            <TouchableOpacity onPress={() => router.push('/leaderboard')}><Text style={s.viewAllLink}>{t('viewLeaderboard')}</Text></TouchableOpacity>
          </View>
          <TouchableOpacity style={s.leaderboardCard} onPress={() => router.push('/leaderboard')} data-testid="leaderboard-card">
            <Ionicons name="trophy" size={28} color="#FFD700" />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: colors.text }}>{t('leaderboardTitle')}</Text>
              <Text style={{ fontSize: FontSizes.sm, color: colors.textSecondary, marginTop: 2 }}>{t('topTrainers')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.gray} />
          </TouchableOpacity>
        </View>

        {/* Quick Access */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('quickAccess')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md }}>
            {quickAccessItems.map((item) => (
              <TouchableOpacity key={item.id} style={{ width: '30%', alignItems: 'center', padding: Spacing.sm }} onPress={() => handleQuickAccess(item.route)}>
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: item.color + '20', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm }}>
                  <Ionicons name={item.icon as any} size={26} color={item.color} />
                </View>
                <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: colors.text, textAlign: 'center' }}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* HANI Passport */}
        {currentDog && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>HANI Passport</Text>
            <WalletCard dogId={currentDog.id} dogName={currentDog.name} dogBreed={currentDog.breed} dogAge={currentDog.age} dogWeight={currentDog.weight} chipId={currentDog.chip_id} dogPhoto={currentDog.avatar} />
          </View>
        )}

        {/* Exercise Library Preview */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>{t('exerciseLibrary')}</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/educacion')}><Text style={s.viewAllLink}>{t('viewAll')}</Text></TouchableOpacity>
          </View>
          {[
            { id: 'senales-basicas', title: t('basicSignals'), subtitle: t('sitDownStay'), icon: 'paw', color: colors.primary, xp: 5 },
            { id: 'control-impulsos', title: t('impulseControl'), subtitle: t('waitLeaveRelease'), icon: 'hand-left', color: colors.accentPurple, xp: 10 },
            { id: 'socializacion', title: t('socialization'), subtitle: t('dogsPeopleEnvironments'), icon: 'search', color: colors.accentMint, xp: 15 },
          ].map((ex, i) => (
            <TouchableOpacity key={i} style={s.exerciseCard} onPress={() => router.push(`/ejercicio?id=${ex.id}`)}>
              <View style={[s.exerciseIcon, { backgroundColor: ex.color + '20' }]}><Ionicons name={ex.icon as any} size={24} color={ex.color} /></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: colors.text }}>{ex.title}</Text>
                <Text style={{ fontSize: FontSizes.sm, color: colors.textSecondary }}>{ex.subtitle}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.accentLight, paddingVertical: 4, paddingHorizontal: Spacing.sm, borderRadius: BorderRadius.sm, marginRight: Spacing.sm }}>
                <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: colors.text }}>{ex.xp}</Text>
                <Text style={{ fontSize: 14, marginLeft: 2 }}>{'🦴'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Chat Promo */}
        <TouchableOpacity onPress={() => router.push('/(tabs)/chat')}>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: Spacing.sm }}>
              <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md }}>
                <Image source={require('../../assets/images/heimdall-logo.png')} style={{ width: 40, height: 40, borderRadius: 20 }} resizeMode="contain" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: colors.text }}>{t('haveQuestions')}</Text>
                <Text style={{ fontSize: FontSizes.sm, color: colors.textSecondary }}>{t('askHani')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.primary} />
            </View>
          </Card>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (C: any, S: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  headerLogo: { width: 52, height: 52, borderRadius: 26, borderWidth: 3, borderColor: C.primary },
  onlineIndicator: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: C.primary, borderWidth: 2, borderColor: C.background },
  appName: { fontSize: FontSizes.xl, fontWeight: '700', color: C.text },
  subtitle: { fontSize: FontSizes.sm, color: C.textSecondary },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.grayLight, alignItems: 'center', justifyContent: 'center' },
  rewardBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bannerBg, padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.lg, flexWrap: 'wrap', gap: 4 },
  rewardText: { fontSize: FontSizes.md, color: C.text },
  rewardHighlight: { fontSize: FontSizes.md, fontWeight: '700', color: C.accent },
  viewRewardsLink: { fontSize: FontSizes.md, fontWeight: '600', color: C.accentOrange, marginLeft: 4 },
  section: { marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: C.text, marginBottom: Spacing.md },
  viewAllLink: { fontSize: FontSizes.md, fontWeight: '600', color: C.primary },
  sessionCard: { height: 200, borderRadius: BorderRadius.xl, overflow: 'hidden', position: 'relative' },
  sessionOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', padding: Spacing.lg, justifyContent: 'flex-end' },
  playButton: { position: 'absolute', bottom: Spacing.lg, right: Spacing.lg, width: 52, height: 52, borderRadius: 26, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: C.grayLight, paddingTop: Spacing.lg },
  statNumber: { fontSize: 28, fontWeight: '800', color: C.text },
  statLabel: { fontSize: FontSizes.sm, color: C.textSecondary, marginTop: 4 },
  leaderboardCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.cardBg, borderRadius: BorderRadius.lg, padding: Spacing.lg, ...S.sm },
  exerciseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.cardBg, padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm, ...S.sm },
  exerciseIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
});
