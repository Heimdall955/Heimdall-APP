import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  Dimensions, Platform, Animated, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Pedometer } from 'expo-sensors';
import axios from 'axios';
import { SecureStore } from '../utils/secureStore';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui';
import { Spacing, BorderRadius, FontSizes } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';
const { width } = Dimensions.get('window');

interface Route {
  id: string;
  name: string;
  distance_km: number;
  duration_minutes: number;
  created_at: string;
}

interface HikingTrail {
  id: string;
  name: string;
  distance_km: number;
  duration_h: number;
  difficulty: 'easy' | 'moderate' | 'hard';
  dogFriendly: boolean;
  icon: string;
}

const HIKING_TRAILS: HikingTrail[] = [
  { id: '1', name: 'Sendero del Bosque', distance_km: 3.2, duration_h: 1, difficulty: 'easy', dogFriendly: true, icon: 'leaf' },
  { id: '2', name: 'Ruta del Rio', distance_km: 5.5, duration_h: 1.5, difficulty: 'easy', dogFriendly: true, icon: 'water' },
  { id: '3', name: 'Camino de Montana', distance_km: 8.0, duration_h: 3, difficulty: 'moderate', dogFriendly: true, icon: 'trail-sign' },
  { id: '4', name: 'Senda del Mirador', distance_km: 6.2, duration_h: 2, difficulty: 'moderate', dogFriendly: true, icon: 'eye' },
  { id: '5', name: 'Ruta del Pico Alto', distance_km: 12.0, duration_h: 5, difficulty: 'hard', dogFriendly: false, icon: 'flag' },
];

type PermStatus = 'loading' | 'granted' | 'denied' | 'undetermined';
type ActiveTab = 'walk' | 'trails' | 'history';

export default function RutasScreen() {
  const router = useRouter();
  const { currentDog } = useAuth();
  const { colors, shadows } = useTheme();
  const { t } = useLanguage();

  const [permStatus, setPermStatus] = useState<PermStatus>('loading');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [currentRoute, setCurrentRoute] = useState<{ lat: number; lng: number }[]>([]);
  const [trackingStats, setTrackingStats] = useState({ distance: 0, duration: 0 });
  const [stepCount, setStepCount] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('walk');

  const watchId = useRef<Location.LocationSubscription | null>(null);
  const startTime = useRef<Date | null>(null);
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const pedometerSub = useRef<{ remove: () => void } | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  useEffect(() => {
    checkPermission();
    loadRoutes();
    checkPedometer();
    return () => { stopTracking(); };
  }, []);

  useEffect(() => {
    if (isTracking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isTracking]);

  const checkPedometer = async () => {
    try {
      const available = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(available);
    } catch {
      setIsPedometerAvailable(false);
    }
  };

  const checkPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermStatus('granted');
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      } else {
        setPermStatus('undetermined');
      }
    } catch {
      setPermStatus('undetermined');
    }
  };

  const requestPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermStatus('granted');
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      } else {
        setPermStatus('denied');
      }
    } catch {
      setPermStatus('denied');
    }
  };

  const loadRoutes = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      if (!token || !currentDog) return;
      const response = await axios.get(
        `${BACKEND_URL}/api/routes/${currentDog.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoutes(response.data);
    } catch {
      setRoutes([]);
    }
  }, [currentDog]);

  const startTracking = async () => {
    if (permStatus !== 'granted') {
      await requestPermission();
      return;
    }

    setIsTracking(true);
    setCurrentRoute([]);
    setTrackingStats({ distance: 0, duration: 0 });
    setStepCount(0);
    startTime.current = new Date();

    timerInterval.current = setInterval(() => {
      if (startTime.current) {
        const elapsed = Math.floor((Date.now() - startTime.current.getTime()) / 1000);
        setTrackingStats(prev => ({ ...prev, duration: elapsed }));
      }
    }, 1000);

    // Start pedometer
    if (isPedometerAvailable) {
      pedometerSub.current = Pedometer.watchStepCount(result => {
        setStepCount(result.steps);
      });
    }

    // Track location
    watchId.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 5 },
      (newLocation) => {
        const newPoint = {
          lat: newLocation.coords.latitude,
          lng: newLocation.coords.longitude,
        };
        setCurrentRoute(prev => {
          const newRoute = [...prev, newPoint];
          if (newRoute.length > 1) {
            const lastPoint = newRoute[newRoute.length - 2];
            const dist = calculateDistance(lastPoint.lat, lastPoint.lng, newPoint.lat, newPoint.lng);
            setTrackingStats(s => ({ ...s, distance: s.distance + dist }));
          }
          return newRoute;
        });
      }
    );
  };

  const stopTracking = async () => {
    if (watchId.current) {
      watchId.current.remove();
      watchId.current = null;
    }
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    if (pedometerSub.current) {
      pedometerSub.current.remove();
      pedometerSub.current = null;
    }

    if (isTracking && currentRoute.length > 0) {
      await saveRoute();
    }
    setIsTracking(false);
  };

  const saveRoute = async () => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      if (!token || !currentDog) return;

      const distanceKm = trackingStats.distance / 1000;
      const durationMinutes = Math.ceil(trackingStats.duration / 60);

      await axios.post(
        `${BACKEND_URL}/api/routes`,
        {
          dog_id: currentDog.id,
          name: `${t('startWalkWithDog')} ${currentDog.name} - ${new Date().toLocaleDateString()}`,
          distance_km: distanceKm,
          duration_minutes: durationMinutes,
          coordinates: currentRoute,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const bonesEarned = Math.floor(trackingStats.distance / 100) + 10;
      try {
        await axios.post(
          `${BACKEND_URL}/api/gamification/add-bones`,
          { amount: bonesEarned, reason: t('walkCompleted') },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch {}

      Alert.alert(t('routeSaved'), `+${bonesEarned} ${t('bonesEarned')}`);
      loadRoutes();
    } catch {
      Alert.alert(t('error'), t('genericError'));
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const p1 = (lat1 * Math.PI) / 180;
    const p2 = (lat2 * Math.PI) / 180;
    const dp = ((lat2 - lat1) * Math.PI) / 180;
    const dl = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
    return `${Math.round(meters)} m`;
  };

  const difficultyColor = (d: string) => {
    if (d === 'easy') return colors.success;
    if (d === 'moderate') return colors.warning;
    return colors.error;
  };

  const difficultyLabel = (d: string) => {
    if (d === 'easy') return t('easy');
    if (d === 'moderate') return t('moderate');
    return t('hard');
  };

  // Permission request screen
  if (permStatus === 'undetermined' || permStatus === 'loading') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} data-testid="back-button">
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('gpsRoutes')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.permissionContainer}>
          <View style={[styles.permissionIconWrap, { backgroundColor: colors.primary + '18' }]}>
            <Ionicons name="location" size={56} color={colors.primary} />
          </View>
          <Text style={styles.permissionTitle}>{t('locationPermission')}</Text>
          <Text style={styles.permissionDesc}>{t('locationPermissionDesc')}</Text>
          <TouchableOpacity
            style={[styles.permissionBtn, { backgroundColor: colors.primary }]}
            onPress={requestPermission}
            data-testid="grant-permission-button"
          >
            <Ionicons name="navigate" size={20} color="#FFF" />
            <Text style={styles.permissionBtnText}>{t('grantPermission')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (permStatus === 'denied') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} data-testid="back-button-denied">
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('gpsRoutes')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.permissionContainer}>
          <View style={[styles.permissionIconWrap, { backgroundColor: colors.error + '18' }]}>
            <Ionicons name="close-circle" size={56} color={colors.error} />
          </View>
          <Text style={styles.permissionTitle}>{t('permissionDenied')}</Text>
          <Text style={styles.permissionDesc}>{t('permissionDeniedDesc')}</Text>
          <TouchableOpacity
            style={[styles.permissionBtn, { backgroundColor: colors.primary }]}
            onPress={() => Linking.openSettings()}
            data-testid="open-settings-button"
          >
            <Ionicons name="settings" size={20} color="#FFF" />
            <Text style={styles.permissionBtnText}>{t('grantPermission')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main screen with tabs
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} data-testid="back-button-main">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('gpsRoutes')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        {(['walk', 'trails', 'history'] as ActiveTab[]).map((tab) => {
          const icons: Record<ActiveTab, string> = { walk: 'walk', trails: 'trail-sign', history: 'time' };
          const labels: Record<ActiveTab, string> = {
            walk: t('startWalk'),
            trails: t('hikingTrails'),
            history: t('savedRoutes'),
          };
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, isActive && { backgroundColor: colors.primary + '18' }]}
              onPress={() => setActiveTab(tab)}
              data-testid={`tab-${tab}`}
            >
              <Ionicons
                name={icons[tab] as any}
                size={20}
                color={isActive ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.tabLabel, isActive && { color: colors.primary, fontWeight: '700' }]}>
                {labels[tab]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ===== WALK TAB ===== */}
        {activeTab === 'walk' && (
          <>
            {/* Location Status Bar */}
            {location && !isTracking && (
              <View style={[styles.locationBar, { backgroundColor: colors.primary + '10' }]}>
                <View style={[styles.locationDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.locationBarText, { color: colors.text }]}>
                  GPS {t('liveTracking')}
                </Text>
                <Text style={[styles.locationCoords, { color: colors.textSecondary }]}>
                  {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
                </Text>
              </View>
            )}

            {/* Pedometer Card */}
            {isPedometerAvailable && !isTracking && (
              <View style={[styles.pedometerCard, { backgroundColor: colors.cardBg }]}>
                <View style={[styles.pedometerIcon, { backgroundColor: colors.accentPurple + '18' }]}>
                  <Ionicons name="footsteps" size={24} color={colors.accentPurple} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.pedometerLabel, { color: colors.textSecondary }]}>
                    {t('pedometerActive')}
                  </Text>
                  <Text style={[styles.pedometerValue, { color: colors.text }]}>
                    {t('todaySteps')}
                  </Text>
                </View>
                <View style={[styles.pedometerBadge, { backgroundColor: colors.accentPurple + '18' }]}>
                  <Text style={[styles.pedometerBadgeText, { color: colors.accentPurple }]}>
                    {stepCount}
                  </Text>
                </View>
              </View>
            )}

            {/* Tracking / Start Card */}
            {isTracking ? (
              <View style={[styles.trackingCard, { backgroundColor: colors.cardBg, borderColor: colors.primary }]}>
                {/* Recording indicator */}
                <View style={styles.recordingRow}>
                  <Animated.View style={[styles.recordDot, { backgroundColor: colors.error, transform: [{ scale: pulseAnim }] }]} />
                  <Text style={[styles.recordingText, { color: colors.error }]}>{t('liveTracking')}</Text>
                </View>

                {/* Stats */}
                <View style={styles.trackStatsRow}>
                  <View style={styles.trackStatItem}>
                    <Ionicons name="speedometer" size={22} color={colors.primary} />
                    <Text style={[styles.trackStatValue, { color: colors.text }]}>
                      {formatDistance(trackingStats.distance)}
                    </Text>
                    <Text style={[styles.trackStatLabel, { color: colors.textSecondary }]}>{t('distance')}</Text>
                  </View>
                  <View style={[styles.trackStatDivider, { backgroundColor: colors.grayLight }]} />
                  <View style={styles.trackStatItem}>
                    <Ionicons name="timer" size={22} color={colors.accentOrange} />
                    <Text style={[styles.trackStatValue, { color: colors.text }]}>
                      {formatDuration(trackingStats.duration)}
                    </Text>
                    <Text style={[styles.trackStatLabel, { color: colors.textSecondary }]}>{t('duration')}</Text>
                  </View>
                  <View style={[styles.trackStatDivider, { backgroundColor: colors.grayLight }]} />
                  <View style={styles.trackStatItem}>
                    <Ionicons name="footsteps" size={22} color={colors.accentPurple} />
                    <Text style={[styles.trackStatValue, { color: colors.text }]}>{stepCount}</Text>
                    <Text style={[styles.trackStatLabel, { color: colors.textSecondary }]}>{t('steps')}</Text>
                  </View>
                </View>

                {/* Points counter */}
                <View style={[styles.pointsBar, { backgroundColor: colors.background }]}>
                  <Ionicons name="navigate" size={16} color={colors.textSecondary} />
                  <Text style={[styles.pointsText, { color: colors.textSecondary }]}>
                    {currentRoute.length} {t('points')}
                  </Text>
                </View>

                {/* Stop button */}
                <TouchableOpacity
                  style={[styles.stopBtn, { backgroundColor: colors.error }]}
                  onPress={stopTracking}
                  data-testid="stop-tracking-button"
                >
                  <Ionicons name="stop" size={22} color="#FFF" />
                  <Text style={styles.stopBtnText}>{t('stopAndSave')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.startCard, { backgroundColor: colors.cardBg }]}>
                <View style={[styles.startIconCircle, { backgroundColor: colors.primary }]}>
                  <Ionicons name="paw" size={44} color="#FFF" />
                </View>
                <Text style={[styles.startTitle, { color: colors.text }]}>
                  {t('startWalkWithDog')} {currentDog?.name}
                </Text>
                <Text style={[styles.startSubtitle, { color: colors.textSecondary }]}>
                  {t('walkWithDog')}
                </Text>
                <TouchableOpacity
                  style={[styles.startBtn, { backgroundColor: colors.primary }]}
                  onPress={startTracking}
                  data-testid="start-tracking-button"
                >
                  <Ionicons name="play" size={22} color="#FFF" />
                  <Text style={styles.startBtnText}>{t('startWalk')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* ===== TRAILS TAB ===== */}
        {activeTab === 'trails' && (
          <>
            <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
              {t('hikingTrailsDesc')}
            </Text>
            {HIKING_TRAILS.map((trail) => (
              <View key={trail.id} style={[styles.trailCard, { backgroundColor: colors.cardBg }]}>
                <View style={styles.trailTop}>
                  <View style={[styles.trailIconWrap, { backgroundColor: difficultyColor(trail.difficulty) + '18' }]}>
                    <Ionicons name={trail.icon as any} size={24} color={difficultyColor(trail.difficulty)} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.trailName, { color: colors.text }]}>{trail.name}</Text>
                    <View style={styles.trailMeta}>
                      <View style={[styles.trailBadge, { backgroundColor: difficultyColor(trail.difficulty) + '18' }]}>
                        <Text style={[styles.trailBadgeText, { color: difficultyColor(trail.difficulty) }]}>
                          {difficultyLabel(trail.difficulty)}
                        </Text>
                      </View>
                      {trail.dogFriendly && (
                        <View style={[styles.trailBadge, { backgroundColor: colors.primary + '18' }]}>
                          <Ionicons name="paw" size={12} color={colors.primary} />
                          <Text style={[styles.trailBadgeText, { color: colors.primary }]}>
                            {t('dogFriendly')}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                <View style={[styles.trailStatsRow, { borderTopColor: colors.grayLight }]}>
                  <View style={styles.trailStatItem}>
                    <Ionicons name="resize" size={16} color={colors.textSecondary} />
                    <Text style={[styles.trailStatText, { color: colors.textSecondary }]}>
                      {trail.distance_km} km
                    </Text>
                  </View>
                  <View style={styles.trailStatItem}>
                    <Ionicons name="time" size={16} color={colors.textSecondary} />
                    <Text style={[styles.trailStatText, { color: colors.textSecondary }]}>
                      {trail.duration_h}h
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ===== HISTORY TAB ===== */}
        {activeTab === 'history' && (
          <>
            {routes.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.cardBg }]}>
                <View style={[styles.emptyIconWrap, { backgroundColor: colors.grayLight }]}>
                  <Ionicons name="map-outline" size={40} color={colors.gray} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('noRoutes')}</Text>
                <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>{t('noRoutesHint')}</Text>
              </View>
            ) : (
              routes.map((route, index) => (
                <View key={route.id} style={[styles.routeCard, { backgroundColor: colors.cardBg }]}>
                  <View style={styles.routeCardTop}>
                    <View style={[styles.routeNum, { backgroundColor: colors.primary + '18' }]}>
                      <Text style={[styles.routeNumText, { color: colors.primary }]}>{index + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.routeCardName, { color: colors.text }]} numberOfLines={1}>
                        {route.name}
                      </Text>
                      <Text style={[styles.routeCardDate, { color: colors.textSecondary }]}>
                        {new Date(route.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </View>
                  <View style={[styles.routeCardStats, { borderTopColor: colors.grayLight }]}>
                    <View style={styles.routeCardStat}>
                      <Ionicons name="resize" size={14} color={colors.primary} />
                      <Text style={[styles.routeCardStatText, { color: colors.text }]}>
                        {route.distance_km.toFixed(2)} km
                      </Text>
                    </View>
                    <View style={styles.routeCardStat}>
                      <Ionicons name="time" size={14} color={colors.accentOrange} />
                      <Text style={[styles.routeCardStatText, { color: colors.text }]}>
                        {route.duration_minutes} min
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (C: any, S: any) => StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: C.text },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xxl + 40 },

  /* Permission */
  permissionContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl,
  },
  permissionIconWrap: {
    width: 120, height: 120, borderRadius: 60,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg,
  },
  permissionTitle: {
    fontSize: FontSizes.xxl, fontWeight: '700', color: C.text, marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  permissionDesc: {
    fontSize: FontSizes.md, color: C.textSecondary, textAlign: 'center',
    lineHeight: 22, marginBottom: Spacing.xl, paddingHorizontal: Spacing.lg,
  },
  permissionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: 14, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.xl,
  },
  permissionBtnText: { color: '#FFF', fontSize: FontSizes.lg, fontWeight: '600' },

  /* Tabs */
  tabBar: {
    flexDirection: 'row', marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    backgroundColor: C.cardBg, borderRadius: BorderRadius.lg, padding: 4,
    ...S.sm,
  },
  tabItem: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: BorderRadius.md,
  },
  tabLabel: { fontSize: FontSizes.sm, color: C.textSecondary, fontWeight: '500' },

  /* Location bar */
  locationBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: 10, paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md, marginBottom: Spacing.md,
  },
  locationDot: { width: 8, height: 8, borderRadius: 4 },
  locationBarText: { fontSize: FontSizes.sm, fontWeight: '600' },
  locationCoords: { fontSize: FontSizes.xs, marginLeft: 'auto' },

  /* Pedometer */
  pedometerCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.md,
    ...S.sm,
  },
  pedometerIcon: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  pedometerLabel: { fontSize: FontSizes.xs, fontWeight: '500' },
  pedometerValue: { fontSize: FontSizes.md, fontWeight: '600' },
  pedometerBadge: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full,
  },
  pedometerBadgeText: { fontSize: FontSizes.lg, fontWeight: '700' },

  /* Tracking */
  trackingCard: {
    padding: Spacing.lg, borderRadius: BorderRadius.xl,
    borderWidth: 2, ...S.md,
  },
  recordingRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg,
  },
  recordDot: { width: 12, height: 12, borderRadius: 6 },
  recordingText: { fontSize: FontSizes.md, fontWeight: '700' },
  trackStatsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    marginBottom: Spacing.lg,
  },
  trackStatItem: { alignItems: 'center', gap: 4 },
  trackStatValue: { fontSize: FontSizes.xxl, fontWeight: '700' },
  trackStatLabel: { fontSize: FontSizes.xs, fontWeight: '500' },
  trackStatDivider: { width: 1, height: 40 },
  pointsBar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md, marginBottom: Spacing.lg,
  },
  pointsText: { fontSize: FontSizes.sm, fontWeight: '500' },
  stopBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: 14, borderRadius: BorderRadius.xl,
  },
  stopBtnText: { color: '#FFF', fontSize: FontSizes.lg, fontWeight: '700' },

  /* Start */
  startCard: {
    alignItems: 'center', padding: Spacing.xl, borderRadius: BorderRadius.xl, ...S.md,
  },
  startIconCircle: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg,
  },
  startTitle: { fontSize: FontSizes.xl, fontWeight: '700', marginBottom: 4 },
  startSubtitle: { fontSize: FontSizes.md, marginBottom: Spacing.xl },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: 14, paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.xl,
  },
  startBtnText: { color: '#FFF', fontSize: FontSizes.lg, fontWeight: '700' },

  /* Trails */
  sectionHint: {
    fontSize: FontSizes.md, marginBottom: Spacing.md,
  },
  trailCard: {
    borderRadius: BorderRadius.lg, padding: Spacing.md,
    marginBottom: Spacing.sm, ...S.sm,
  },
  trailTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  trailIconWrap: {
    width: 48, height: 48, borderRadius: BorderRadius.md,
    justifyContent: 'center', alignItems: 'center',
  },
  trailName: { fontSize: FontSizes.md, fontWeight: '600', marginBottom: 4 },
  trailMeta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  trailBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full,
  },
  trailBadgeText: { fontSize: FontSizes.xs, fontWeight: '600' },
  trailStatsRow: {
    flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.sm,
    paddingTop: Spacing.sm, borderTopWidth: 1,
  },
  trailStatItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trailStatText: { fontSize: FontSizes.sm },

  /* History */
  emptyState: {
    alignItems: 'center', padding: Spacing.xl, borderRadius: BorderRadius.xl, ...S.sm,
  },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md,
  },
  emptyTitle: { fontSize: FontSizes.lg, fontWeight: '600', marginBottom: 4 },
  emptyHint: { fontSize: FontSizes.sm, textAlign: 'center' },
  routeCard: {
    borderRadius: BorderRadius.lg, padding: Spacing.md,
    marginBottom: Spacing.sm, ...S.sm,
  },
  routeCardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  routeNum: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  routeNumText: { fontSize: FontSizes.md, fontWeight: '700' },
  routeCardName: { fontSize: FontSizes.md, fontWeight: '600' },
  routeCardDate: { fontSize: FontSizes.xs, marginTop: 2 },
  routeCardStats: {
    flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.sm,
    paddingTop: Spacing.sm, borderTopWidth: 1,
  },
  routeCardStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  routeCardStatText: { fontSize: FontSizes.sm, fontWeight: '500' },
});
