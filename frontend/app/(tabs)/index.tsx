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
import { Card } from '../../components/ui';
import { WalletCard } from '../../components/WalletCard';
import { Spacing, BorderRadius, FontSizes, Fonts } from '../../constants/theme';
import { BACKEND_URL } from '../../config/backend';

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

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentDog, user } = useAuth();
  const { isConnected, biometricData } = useBluetooth();
  const { t, language } = useLanguage();
  const { colors, shadows, isDark, toggleTheme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState<any>(null);
  const [todayEmotion, setTodayEmotion] = useState<string | null>(null);
  const [lastConsultation, setLastConsultation] = useState<string | null>(null);
  const [lastMedicalEvent, setLastMedicalEvent] = useState<any>(null);
  const [dogStatus, setDogStatus] = useState<DogStatus>({
    status: 'calm', bones: 0, level: 1, level_progress: 0,
    level_target: 500, streak_days: 0, exercises_completed: 0, practice_minutes: 0,
  });

  const quickAccessItems = [
    { id: 'chaleco', icon: 'bluetooth', label: t('vest'), color: '#2E7FD8', bg: '#E4EFFA', route: '/chaleco' },
    { id: 'subir-analisis', icon: 'cloud-upload-outline', label: t('uploadAnalysis'), color: colors.accentPurple, bg: '#EFEAFA', route: '/(tabs)/chat' },
    { id: 'describir-sintoma', icon: 'chatbox-ellipses-outline', label: t('describeSymptom'), color: colors.primary, bg: colors.primaryLight, route: '/(tabs)/chat' },
    { id: 'historial', icon: 'time-outline', label: t('history'), color: colors.accentOrange, bg: '#FBEEDF', route: '/historial-medico' },
    { id: 'salud', icon: 'pulse', label: t('health'), color: colors.error, bg: '#FAE8E7', route: '/(tabs)/salud' },
    { id: 'ficha-clinica', icon: 'document-text-outline', label: t('clinicalFile'), color: colors.accent, bg: colors.accentLight, route: '/(tabs)/perfil' },
  ];

  const loadGamificationStats = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      const dogId = currentDog?.id;
      const [statsRes, weeklyRes, diaryRes, chatRes, medicalRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/gamification/stats`, { headers }),
        axios.get(`${BACKEND_URL}/api/gamification/weekly-summary`, { headers }).catch(() => null),
        axios.get(`${BACKEND_URL}/api/diary/today`, { headers }).catch(() => null),
        dogId ? axios.get(`${BACKEND_URL}/api/chat/history?dog_id=${dogId}&limit=1`, { headers }).catch(() => null) : null,
        dogId ? axios.get(`${BACKEND_URL}/api/medical-events/${dogId}`, { headers }).catch(() => null) : null,
      ]);
      setDogStatus(prev => ({
        ...prev, bones: statsRes.data.bones, level: statsRes.data.level || 1,
        level_progress: statsRes.data.level_progress, level_target: statsRes.data.level_target,
        streak_days: statsRes.data.streak_days || 0, exercises_completed: statsRes.data.exercises_completed || 0,
        practice_minutes: statsRes.data.practice_minutes || 0,
      }));
      if (weeklyRes?.data) setWeeklySummary(weeklyRes.data);
      if (diaryRes?.data?.logged_today) setTodayEmotion(diaryRes.data.emotion);
      else setTodayEmotion(null);
      if (chatRes?.data?.length > 0) setLastConsultation(chatRes.data[0].created_at);
      else setLastConsultation(null);
      if (medicalRes?.data?.length > 0) setLastMedicalEvent(medicalRes.data[0]);
      else setLastMedicalEvent(null);
    } catch (error) { console.log('Error loading home data'); }
  }, [currentDog?.id]);

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
  const handleQuickAccess = (route: string | null) => { if (route) router.push(route as any); };
  const formatRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return t('today');
    if (diffDays === 1) return t('yesterday');
    if (diffDays < 7) return `${t('daysAgo').replace('{n}', String(diffDays))}`;
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : language === 'it' ? 'it-IT' : 'en-US', { day: 'numeric', month: 'short' });
  };
  const getEmotionLabel = (emotion: string) => {
    const map: Record<string, string> = { happy: t('emotionHappy'), calm: t('emotionCalm'), worried: t('emotionWorried'), sad: t('emotionSad'), stressed: t('emotionStressed') };
    return map[emotion] || emotion;
  };
  const getMedicalTypeLabel = (type: string) => {
    const map: Record<string, string> = { vaccine: t('vaccines'), deworming: t('deworming'), vet_visit: t('vetVisits'), medication: t('medications'), surgery: t('surgeries'), other: t('other') };
    return map[type] || type;
  };

  const s = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView style={s.scrollView} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={{ position: 'relative' }}>
              <View style={s.avatarRing}>
                <Image source={require('../../assets/images/heimdall-avatar.png')} style={s.headerLogo} resizeMode="cover" />
              </View>
              <View style={s.onlineIndicator} />
            </View>
            <View>
              <Text style={s.appName}>Heimdall</Text>
              <Text style={s.subtitle}>{t('positiveEducation')}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={[s.iconBtn, { marginRight: 10 }]} onPress={toggleTheme} accessibilityLabel="Toggle theme" testID="theme-toggle-btn">
              <Ionicons name={isDark ? 'sunny' : 'moon-outline'} size={21} color={isDark ? colors.accent : colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={s.iconBtn} testID="notifications-btn">
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Reward Card */}
        {dogStatus.bones > 0 && (
          <TouchableOpacity style={s.rewardCard} onPress={() => router.push('/(tabs)/perfil')} activeOpacity={0.85} testID="reward-banner">
            <Image source={require('../../assets/images/trophy-badge.png')} style={s.trophyImg} resizeMode="contain" />
            <View style={{ flex: 1 }}>
              <Text style={s.rewardText}>{t('greatJob')}</Text>
              <Text style={s.rewardHighlight}>{dogStatus.bones} {t('bones').toUpperCase()}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Text style={s.viewRewardsLink}>{t('viewRewards')}</Text>
                <Ionicons name="chevron-forward" size={13} color={colors.primary} />
              </View>
            </View>
            <Image source={require('../../assets/images/golden-bone.png')} style={s.boneImg} resizeMode="contain" />
          </TouchableOpacity>
        )}

        {/* AI Analysis Hero */}
        <TouchableOpacity
          style={s.section}
          onPress={() => router.push('/(tabs)/chat')}
          activeOpacity={0.9}
          testID="ai-analysis-banner"
        >
          <View style={s.analysisBanner}>
            <View style={{ position: 'absolute', top: -40, right: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: '#FFFFFF08' }} />
            <View style={{ position: 'absolute', bottom: -30, left: -20, width: 110, height: 110, borderRadius: 55, backgroundColor: '#FFFFFF06' }} />

            <Image source={require('../../assets/images/heimdall-vet-hero.png')} style={s.heroMascot} resizeMode="contain" />

            <View style={{ width: '58%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                {[
                  { icon: 'camera', color: '#8FD6BE', bg: '#FFFFFF14' },
                  { icon: 'document-text', color: '#8FD6BE', bg: '#FFFFFF14' },
                  { icon: 'chatbubble-ellipses', color: '#C8B4F5', bg: '#8E6FD830' },
                ].map((item, i) => (
                  <View key={i} style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFFFFF1A' }}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                ))}
              </View>

              <Text style={s.analysisBannerTitle}>{t('homeBannerTitle')}</Text>
              <Text style={s.analysisBannerSubtitle}>{t('homeBannerSubtitle')}</Text>
            </View>

            <View style={s.analysisBannerCta}>
              <Ionicons name="sparkles" size={17} color="#FFF" />
              <Text style={s.analysisBannerCtaText}>{t('homeBannerCta')}</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFF" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Access */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>{t('quickAccess')}</Text>
            <Image source={require('../../assets/images/tree-of-life.png')} style={{ width: 30, height: 30, opacity: 0.8 }} resizeMode="contain" />
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
            {quickAccessItems.map((item) => (
              <TouchableOpacity key={item.id} style={s.quickCard} onPress={() => handleQuickAccess(item.route)} activeOpacity={0.8} testID={`quick-access-${item.id}`}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <View style={[s.quickIcon, { backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon as any} size={22} color={item.color} />
                  </View>
                  <Ionicons name="chevron-forward" size={15} color={colors.textLight} />
                </View>
                <Text style={s.quickLabel} numberOfLines={2}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Health Activity */}
        <View style={s.section} testID="health-activity-section">
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>{t('healthActivity')}</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/salud')}><Text style={s.viewAllLink}>{t('viewAll')}</Text></TouchableOpacity>
          </View>
          <View style={{ gap: Spacing.sm }}>
            <TouchableOpacity style={s.healthCard} onPress={() => router.push('/(tabs)/chat')} testID="last-consultation-card">
              <View style={[s.healthCardIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="chatbubbles" size={21} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.healthCardTitle, { color: colors.textSecondary }]}>{t('lastConsultation')}</Text>
                <Text style={[s.healthCardValue, { color: lastConsultation ? colors.primary : colors.textSecondary }]}>
                  {lastConsultation ? formatRelativeDate(lastConsultation) : t('noConsultationsYet')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity style={s.healthCard} onPress={() => router.push('/historial-medico')} testID="last-medical-card">
              <View style={[s.healthCardIcon, { backgroundColor: '#FBEEDF' }]}>
                <Ionicons name="medical" size={21} color={colors.accentOrange} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.healthCardTitle, { color: colors.textSecondary }]}>{t('lastMedicalEvent')}</Text>
                <Text style={[s.healthCardValue, { color: lastMedicalEvent ? colors.text : colors.textSecondary }]}>
                  {lastMedicalEvent ? `${getMedicalTypeLabel(lastMedicalEvent.type)} - ${formatRelativeDate(lastMedicalEvent.date)}` : t('noEventsYet')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity style={s.healthCard} onPress={() => router.push('/diario')} testID="emotion-state-card">
              <View style={[s.healthCardIcon, { backgroundColor: todayEmotion ? colors.primaryLight : '#EFEAFA' }]}>
                <Ionicons name={todayEmotion ? 'happy' : 'journal'} size={21} color={todayEmotion ? colors.primary : colors.accentPurple} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.healthCardTitle, { color: colors.textSecondary }]}>{t('emotionalState')}</Text>
                <Text style={[s.healthCardValue, { color: todayEmotion ? colors.text : colors.textSecondary }]}>
                  {todayEmotion ? getEmotionLabel(todayEmotion) : t('notRegisteredToday')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Emotion Diary Banner */}
        <TouchableOpacity style={s.section} onPress={() => router.push('/diario')} activeOpacity={0.85} testID="emotion-diary-card">
          <View style={{ backgroundColor: colors.primaryDark, borderRadius: BorderRadius.xxl, padding: Spacing.lg, overflow: 'hidden' }}>
            <View style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFFFFF0A' }} />
            <View style={{ position: 'absolute', bottom: -30, left: -10, width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFFFFF07' }} />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFFFFF14', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFFFFF20' }}>
                <Ionicons name={todayEmotion ? 'checkmark-circle' : 'journal'} size={24} color={'#E9D9A8'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: FontSizes.lg, fontFamily: Fonts.serif, fontWeight: '700', color: '#FDFBF5' }}>
                  {todayEmotion ? t('todayYouFeel') : t('howDoYouFeel')}
                </Text>
                <Text style={{ fontSize: FontSizes.xs, color: '#A9C6BC', marginTop: 2 }}>
                  {todayEmotion ? t('emotionDiary') : t('diaryEmpty').substring(0, 50) + '...'}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 14, paddingHorizontal: 8 }}>
              {[
                { icon: 'happy', color: '#7FD8A8', id: 'happy' },
                { icon: 'leaf', color: '#7FC4D8', id: 'calm' },
                { icon: 'alert-circle', color: '#E8C170', id: 'worried' },
                { icon: 'sad', color: '#C8A8E8', id: 'sad' },
                { icon: 'thunderstorm', color: '#E89A8A', id: 'stressed' },
              ].map(e => (
                <View key={e.id} style={{
                  width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: todayEmotion === e.id ? e.color + '30' : '#FFFFFF0C',
                  borderWidth: todayEmotion === e.id ? 1.5 : 0, borderColor: e.color,
                }}>
                  <Ionicons name={e.icon as any} size={22} color={todayEmotion === e.id ? e.color : '#6E8E83'} />
                </View>
              ))}
            </View>

            <View style={{ backgroundColor: '#FFFFFF12', borderRadius: BorderRadius.full, paddingVertical: 11, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#FFFFFF1E' }}>
              <Ionicons name={todayEmotion ? 'eye' : 'add-circle'} size={18} color={'#E9D9A8'} />
              <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: '#E9D9A8' }}>
                {todayEmotion ? t('weeklyInsight') : t('emotionDiary')}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Weekly Summary */}
        <View style={s.section} testID="weekly-summary-section">
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>{t('weeklyProgress')}</Text>
            <Text style={{ fontSize: FontSizes.sm, color: colors.textSecondary, fontWeight: '500' }}>{t('thisWeek')}</Text>
          </View>
          <Card style={{ padding: Spacing.md, borderRadius: BorderRadius.xl }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md }}>
              {[
                { image: require('../../assets/images/golden-bone.png'), value: weeklySummary?.bones_total || dogStatus.bones || 0, label: t('bonesThisWeek'), bg: colors.accentLight },
                { icon: 'school', value: weeklySummary?.exercises_total || dogStatus.exercises_completed || 0, label: t('exercisesThisWeek'), bg: colors.primaryLight, iconColor: colors.primary },
                { icon: 'flash', value: weeklySummary?.streak_days || dogStatus.streak_days || 0, label: t('streakActive'), bg: '#EFEAFA', iconColor: colors.accentPurple },
              ].map((item, i) => (
                <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs }}>
                    {item.image ? <Image source={item.image} style={{ width: 28, height: 28 }} resizeMode="contain" /> : <Ionicons name={item.icon as any} size={20} color={item.iconColor} />}
                  </View>
                  <Text style={{ fontSize: FontSizes.xl, fontWeight: '800', color: colors.text }}>{item.value}</Text>
                  <Text style={{ fontSize: FontSizes.xs, color: colors.textSecondary, marginTop: 2, textAlign: 'center' }}>{item.label}</Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: BorderRadius.md, padding: Spacing.sm }}>
              <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: colors.text, marginRight: Spacing.sm }}>{t('level')} {weeklySummary?.level || dogStatus.level}</Text>
              <View style={{ flex: 1, height: 8, backgroundColor: colors.grayLight, borderRadius: 4, overflow: 'hidden' }}>
                <View style={{ height: '100%', backgroundColor: colors.accent, borderRadius: 4, width: `${((weeklySummary?.level_progress || 0) / (weeklySummary?.level_target || 500)) * 100}%` }} />
              </View>
              <Text style={{ fontSize: FontSizes.xs, color: colors.textSecondary, marginLeft: Spacing.sm, fontWeight: '600' }}>{weeklySummary?.level_progress || 0}/{weeklySummary?.level_target || 500} XP</Text>
            </View>
          </Card>
        </View>

        {/* What does Heimdall do? */}
        <View style={s.section} testID="what-heimdall-does-section">
          <Text style={s.sectionTitle}>{t('whatDoesHeimdall')}</Text>
          <View style={{ gap: Spacing.sm, marginTop: Spacing.md }}>
            {[
              { icon: 'search', color: colors.primary, bg: colors.primaryLight, text: t('heimdallFeature1') },
              { icon: 'shield-checkmark', color: colors.accent, bg: colors.accentLight, text: t('heimdallFeature2') },
              { icon: 'bulb', color: colors.accentOrange, bg: '#FBEEDF', text: t('heimdallFeature3') },
            ].map((item, i) => (
              <View key={i} style={s.healthCard}>
                <View style={[s.healthCardIcon, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon as any} size={22} color={item.color} />
                </View>
                <Text style={{ flex: 1, fontSize: FontSizes.md, fontWeight: '600', color: colors.text }}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* HANI Passport */}
        {currentDog && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, { marginBottom: Spacing.md }]}>HANI Passport</Text>
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
            { id: 'senales-basicas', title: t('basicSignals'), subtitle: t('sitDownStay'), icon: 'paw', color: colors.primary, bg: colors.primaryLight, xp: 5 },
            { id: 'control-impulsos', title: t('impulseControl'), subtitle: t('waitLeaveRelease'), icon: 'hand-left', color: colors.accentPurple, bg: '#EFEAFA', xp: 10 },
            { id: 'socializacion', title: t('socialization'), subtitle: t('dogsPeopleEnvironments'), icon: 'search', color: colors.accentOrange, bg: '#FBEEDF', xp: 15 },
          ].map((ex, i) => (
            <TouchableOpacity key={i} style={s.exerciseCard} onPress={() => router.push(`/ejercicio?id=${ex.id}`)}>
              <View style={[s.exerciseIcon, { backgroundColor: ex.bg }]}><Ionicons name={ex.icon as any} size={24} color={ex.color} /></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: colors.text }}>{ex.title}</Text>
                <Text style={{ fontSize: FontSizes.sm, color: colors.textSecondary }}>{ex.subtitle}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.accentLight, paddingVertical: 4, paddingHorizontal: Spacing.sm, borderRadius: BorderRadius.full, marginRight: Spacing.sm }}>
                <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: colors.accent }}>{ex.xp}</Text>
                <Image source={require('../../assets/images/golden-bone.png')} style={{ width: 16, height: 16, marginLeft: 3 }} resizeMode="contain" />
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Chat Promo */}
        <TouchableOpacity onPress={() => router.push('/(tabs)/chat')}>
          <Card style={{ borderRadius: BorderRadius.xl }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: Spacing.sm }}>
              <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md, overflow: 'hidden' }}>
                <Image source={require('../../assets/images/heimdall-avatar.png')} style={{ width: 48, height: 48, borderRadius: 24 }} resizeMode="cover" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: FontSizes.lg, fontFamily: Fonts.serif, fontWeight: '700', color: colors.text }}>{t('haveQuestions')}</Text>
                <Text style={{ fontSize: FontSizes.sm, color: colors.textSecondary }}>{t('askHani')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.primary} />
            </View>
          </Card>
        </TouchableOpacity>

        <View style={{ height: 110 }} />
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
  avatarRing: { width: 58, height: 58, borderRadius: 29, borderWidth: 2, borderColor: C.accent + '60', alignItems: 'center', justifyContent: 'center', backgroundColor: C.accentLight, overflow: 'hidden' },
  headerLogo: { width: 54, height: 54, borderRadius: 27 },
  onlineIndicator: { position: 'absolute', bottom: 1, right: 1, width: 14, height: 14, borderRadius: 7, backgroundColor: C.primary, borderWidth: 2, borderColor: C.background },
  appName: { fontSize: 26, fontFamily: Fonts.serif, fontWeight: '700', color: C.text, letterSpacing: 0.3 },
  subtitle: { fontSize: FontSizes.sm, color: C.textSecondary, marginTop: 1 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.cardBg, alignItems: 'center', justifyContent: 'center', ...S.sm },
  rewardCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.cardBg, padding: Spacing.md, borderRadius: BorderRadius.xl, marginBottom: Spacing.lg, gap: Spacing.md, ...S.md },
  trophyImg: { width: 58, height: 58 },
  boneImg: { width: 92, height: 64 },
  rewardText: { fontSize: FontSizes.sm, color: C.text },
  rewardHighlight: { fontSize: 22, fontWeight: '800', color: C.accent, marginVertical: 2, letterSpacing: 0.5 },
  viewRewardsLink: { fontSize: FontSizes.sm, fontWeight: '600', color: C.primary },
  section: { marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: 22, fontFamily: Fonts.serif, fontWeight: '700', color: C.text },
  viewAllLink: { fontSize: FontSizes.md, fontWeight: '600', color: C.primary },
  analysisBanner: { backgroundColor: C.primaryDark, borderRadius: 28, padding: Spacing.lg, overflow: 'hidden', position: 'relative', minHeight: 290 },
  heroMascot: { position: 'absolute', right: -14, bottom: 52, width: 185, height: 265 },
  analysisBannerTitle: { fontSize: 25, fontFamily: Fonts.serif, fontWeight: '700', color: '#FDFBF5', marginBottom: 10, lineHeight: 32 },
  analysisBannerSubtitle: { fontSize: FontSizes.sm, color: '#B9D2C9', marginBottom: 18, lineHeight: 20 },
  analysisBannerCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.full, backgroundColor: C.primary, alignSelf: 'flex-start', ...S.md },
  analysisBannerCtaText: { fontSize: FontSizes.md, fontWeight: '700', color: '#FFF' },
  quickCard: { width: '31.5%', backgroundColor: C.cardBg, borderRadius: BorderRadius.lg, padding: Spacing.sm + 2, ...S.sm },
  quickIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: C.text, marginTop: Spacing.sm },
  exerciseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.cardBg, padding: Spacing.md, borderRadius: BorderRadius.xl, marginBottom: Spacing.sm, ...S.sm },
  exerciseIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  healthCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.cardBg, padding: Spacing.md, borderRadius: BorderRadius.xl, ...S.sm },
  healthCardIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  healthCardTitle: { fontSize: FontSizes.sm, fontWeight: '500', marginBottom: 2 },
  healthCardValue: { fontSize: FontSizes.md, fontWeight: '700' },
});
