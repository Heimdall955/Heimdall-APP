import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  Animated, Linking, ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Pedometer } from 'expo-sensors';
import axios from 'axios';
import { SecureStore } from '../utils/secureStore';
import { useAuth } from '../contexts/AuthContext';
import { Spacing, BorderRadius, FontSizes } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { TrailMap } from '../components/TrailMap';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface Route {
  id: string;
  name: string;
  distance_km: number;
  duration_minutes: number;
  created_at: string;
}

interface Trail {
  id: string;
  name: string;
  distance_km: number | null;
  duration_h: number | null;
  difficulty: 'easy' | 'moderate' | 'hard';
  dog_friendly: boolean;
  lat: number;
  lng: number;
  dist_from_user_km: number;
  surface: string;
  trail_type: string;
  description: string;
}

type ScreenState = 'gdpr' | 'permission' | 'denied' | 'main';
type ActiveTab = 'walk' | 'map' | 'trails' | 'history';

export default function RutasScreen() {
  const router = useRouter();
  const { currentDog } = useAuth();
  const { colors, shadows } = useTheme();
  const { t } = useLanguage();

  const [screenState, setScreenState] = useState<ScreenState>('gdpr');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [currentRoute, setCurrentRoute] = useState<{ lat: number; lng: number }[]>([]);
  const [trackingStats, setTrackingStats] = useState({ distance: 0, duration: 0 });
  const [stepCount, setStepCount] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('walk');
  const [trails, setTrails] = useState<Trail[]>([]);
  const [trailsLoading, setTrailsLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedTrail, setSelectedTrail] = useState<string | null>(null);

  const watchId = useRef<Location.LocationSubscription | null>(null);
  const startTime = useRef<Date | null>(null);
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const pedometerSub = useRef<{ remove: () => void } | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  useEffect(() => {
    checkGdprConsent();
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

  const checkGdprConsent = async () => {
    try {
      const consent = await SecureStore.getItemAsync('gdpr_location_consent');
      if (consent === 'granted') {
        await checkPermissionAfterConsent();
      } else {
        setScreenState('gdpr');
      }
    } catch {
      setScreenState('gdpr');
    }
  };

  const acceptGdpr = async () => {
    await SecureStore.setItemAsync('gdpr_location_consent', 'granted');
    await checkPermissionAfterConsent();
  };

  const checkPermissionAfterConsent = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        setScreenState('main');
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
        fetchNearbyTrails(loc.coords.latitude, loc.coords.longitude);
        loadFavorites();
      } else {
        setScreenState('permission');
      }
    } catch {
      setScreenState('permission');
    }
  };

  const requestPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setScreenState('main');
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
        fetchNearbyTrails(loc.coords.latitude, loc.coords.longitude);
        loadFavorites();
      } else {
        setScreenState('denied');
      }
    } catch {
      setScreenState('denied');
    }
  };

  const checkPedometer = async () => {
    try { setIsPedometerAvailable(await Pedometer.isAvailableAsync()); } catch { setIsPedometerAvailable(false); }
  };

  const fetchNearbyTrails = async (lat: number, lng: number) => {
    setTrailsLoading(true);
    try {
      const resp = await axios.get(`${BACKEND_URL}/api/trails/nearby`, { params: { lat, lng, radius: 15000 } });
      setTrails(resp.data.trails || []);
    } catch { setTrails([]); }
    finally { setTrailsLoading(false); }
  };

  const loadFavorites = async () => {
    try {
      const stored = await SecureStore.getItemAsync('favorite_trails');
      if (stored) setFavorites(JSON.parse(stored));
    } catch { setFavorites([]); }
  };

  const toggleFavorite = async (trail: Trail) => {
    const isFav = favorites.includes(trail.id);
    let updated: string[];
    if (isFav) {
      updated = favorites.filter(id => id !== trail.id);
    } else {
      updated = [...favorites, trail.id];
    }
    setFavorites(updated);
    await SecureStore.setItemAsync('favorite_trails', JSON.stringify(updated));
  };

  const loadRoutes = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      if (!token || !currentDog) return;
      const r = await axios.get(`${BACKEND_URL}/api/routes/${currentDog.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setRoutes(r.data);
    } catch { setRoutes([]); }
  }, [currentDog]);

  const startTracking = async () => {
    if (screenState !== 'main') return;
    setIsTracking(true); setCurrentRoute([]); setTrackingStats({ distance: 0, duration: 0 }); setStepCount(0);
    startTime.current = new Date();
    timerInterval.current = setInterval(() => {
      if (startTime.current) setTrackingStats(prev => ({ ...prev, duration: Math.floor((Date.now() - startTime.current!.getTime()) / 1000) }));
    }, 1000);
    if (isPedometerAvailable) pedometerSub.current = Pedometer.watchStepCount(r => setStepCount(r.steps));
    watchId.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 5 },
      (nl) => {
        const p = { lat: nl.coords.latitude, lng: nl.coords.longitude };
        setCurrentRoute(prev => {
          const nr = [...prev, p];
          if (nr.length > 1) { const l = nr[nr.length - 2]; const d = calcDist(l.lat, l.lng, p.lat, p.lng); setTrackingStats(s => ({ ...s, distance: s.distance + d })); }
          return nr;
        });
      }
    );
  };

  const stopTracking = async () => {
    if (watchId.current) { watchId.current.remove(); watchId.current = null; }
    if (timerInterval.current) { clearInterval(timerInterval.current); timerInterval.current = null; }
    if (pedometerSub.current) { pedometerSub.current.remove(); pedometerSub.current = null; }
    if (isTracking && currentRoute.length > 0) await saveRoute();
    setIsTracking(false);
  };

  const saveRoute = async () => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      if (!token || !currentDog) return;
      await axios.post(`${BACKEND_URL}/api/routes`, {
        dog_id: currentDog.id,
        name: `${t('startWalkWithDog')} ${currentDog.name} - ${new Date().toLocaleDateString()}`,
        distance_km: trackingStats.distance / 1000,
        duration_minutes: Math.ceil(trackingStats.duration / 60),
        coordinates: currentRoute,
      }, { headers: { Authorization: `Bearer ${token}` } });
      const bones = Math.floor(trackingStats.distance / 100) + 10;
      try { await axios.post(`${BACKEND_URL}/api/gamification/add-bones`, { amount: bones, reason: t('walkCompleted') }, { headers: { Authorization: `Bearer ${token}` } }); } catch {}
      Alert.alert(t('routeSaved'), `+${bones} ${t('bonesEarned')}`);
      loadRoutes();
    } catch { Alert.alert(t('error'), t('genericError')); }
  };

  const calcDist = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3, p1 = (lat1 * Math.PI) / 180, p2 = (lat2 * Math.PI) / 180;
    const dp = ((lat2 - lat1) * Math.PI) / 180, dl = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const fmtDur = (s: number) => { const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60; return h>0 ? `${h}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}` : `${m}:${sec.toString().padStart(2,'0')}`; };
  const fmtD = (m: number) => m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`;
  const dC = (d: string) => d === 'easy' ? colors.success : d === 'moderate' ? colors.warning : colors.error;
  const dL = (d: string) => d === 'easy' ? t('easy') : d === 'moderate' ? t('moderate') : t('hard');
  const tIcon = (tr: Trail) => tr.trail_type === 'hiking' ? 'trail-sign' : tr.surface === 'gravel' || tr.surface === 'earth' ? 'leaf' : 'navigate';

  const mapMarkers = useMemo(() => {
    return trails.map(tr => ({
      id: tr.id, lat: tr.lat, lng: tr.lng, name: tr.name,
      color: dC(tr.difficulty),
      isFavorite: favorites.includes(tr.id),
    }));
  }, [trails, favorites]);

  const selectedTrailData = trails.find(t => t.id === selectedTrail);

  // ======================= GDPR =======================
  if (screenState === 'gdpr') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} data-testid="back-button-gdpr">
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('gpsRoutes')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={styles.gdprContainer}>
          <View style={[styles.gdprIconWrap, { backgroundColor: colors.info + '15' }]}>
            <Ionicons name="shield-checkmark" size={56} color={colors.info} />
          </View>
          <Text style={[styles.gdprTitle, { color: colors.text }]}>{t('locationPermission')}</Text>
          <View style={[styles.gdprCard, { backgroundColor: colors.cardBg }]}>
            <Text style={[styles.gdprSectionTitle, { color: colors.text }]}>
              <Ionicons name="information-circle" size={16} color={colors.info} /> {t('locationPermissionDesc')}
            </Text>
            <View style={[styles.gdprDivider, { backgroundColor: colors.grayLight }]} />
            {[
              { icon: 'checkmark-circle', color: colors.success, text: `${t('distance')} & ${t('tracking')}` },
              { icon: 'checkmark-circle', color: colors.success, text: t('hikingTrails') },
              { icon: 'checkmark-circle', color: colors.success, text: `${t('steps')} (${t('pedometerActive')})` },
              { icon: 'map', color: colors.primary, text: 'Mapa interactivo' },
            ].map((item, i) => (
              <View key={i} style={styles.gdprItem}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
                <Text style={[styles.gdprItemText, { color: colors.text }]}>{item.text}</Text>
              </View>
            ))}
            <View style={[styles.gdprDivider, { backgroundColor: colors.grayLight }]} />
            <View style={styles.gdprItem}>
              <Ionicons name="lock-closed" size={18} color={colors.accentPurple} />
              <Text style={[styles.gdprItemText, { color: colors.textSecondary }]}>RGPD/GDPR - Art. 6(1)(a)</Text>
            </View>
            <Text style={[styles.gdprLegal, { color: colors.textSecondary }]}>
              Tu ubicacion se usa exclusivamente para rastrear rutas y buscar senderos cercanos. Los datos se almacenan de forma segura y no se comparten con terceros. Puedes revocar este permiso en cualquier momento desde los ajustes de tu dispositivo.
            </Text>
          </View>
          <TouchableOpacity style={[styles.gdprAcceptBtn, { backgroundColor: colors.primary }]} onPress={acceptGdpr} data-testid="gdpr-accept-button">
            <Ionicons name="shield-checkmark" size={20} color="#FFF" />
            <Text style={styles.gdprAcceptText}>Acepto - Continuar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gdprDeclineBtn} onPress={() => router.back()} data-testid="gdpr-decline-button">
            <Text style={[styles.gdprDeclineText, { color: colors.textSecondary }]}>No, volver</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ======================= PERMISSION =======================
  if (screenState === 'permission') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
          <Text style={styles.headerTitle}>{t('gpsRoutes')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContent}>
          <View style={[styles.permIconWrap, { backgroundColor: colors.primary + '18' }]}><Ionicons name="location" size={56} color={colors.primary} /></View>
          <Text style={[styles.permTitle, { color: colors.text }]}>{t('locationPermission')}</Text>
          <Text style={[styles.permDesc, { color: colors.textSecondary }]}>{t('locationPermissionDesc')}</Text>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={requestPermission} data-testid="grant-permission-button">
            <Ionicons name="navigate" size={20} color="#FFF" /><Text style={styles.actionBtnText}>{t('grantPermission')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ======================= DENIED =======================
  if (screenState === 'denied') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
          <Text style={styles.headerTitle}>{t('gpsRoutes')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContent}>
          <View style={[styles.permIconWrap, { backgroundColor: colors.error + '18' }]}><Ionicons name="close-circle" size={56} color={colors.error} /></View>
          <Text style={[styles.permTitle, { color: colors.text }]}>{t('permissionDenied')}</Text>
          <Text style={[styles.permDesc, { color: colors.textSecondary }]}>{t('permissionDeniedDesc')}</Text>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => Linking.openSettings()} data-testid="open-settings-button">
            <Ionicons name="settings" size={20} color="#FFF" /><Text style={styles.actionBtnText}>{t('grantPermission')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ======================= MAIN =======================
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} data-testid="back-button-main">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('gpsRoutes')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.cardBg }]}>
        {(['walk', 'map', 'trails', 'history'] as ActiveTab[]).map((tab) => {
          const icons: Record<ActiveTab, string> = { walk: 'walk', map: 'map', trails: 'trail-sign', history: 'time' };
          const labels: Record<ActiveTab, string> = {
            walk: t('startWalk'), map: 'Mapa', trails: t('hikingTrails'), history: t('savedRoutes'),
          };
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity key={tab} style={[styles.tabItem, isActive && { backgroundColor: colors.primary + '18' }]} onPress={() => setActiveTab(tab)} data-testid={`tab-${tab}`}>
              <Ionicons name={icons[tab] as any} size={16} color={isActive ? colors.primary : colors.textSecondary} />
              <Text style={[styles.tabLabel, isActive && { color: colors.primary, fontWeight: '700' }]}>{labels[tab]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ===== WALK ===== */}
        {activeTab === 'walk' && (
          <>
            {location && !isTracking && (
              <View style={[styles.locationBar, { backgroundColor: colors.primary + '10' }]}>
                <View style={[styles.locationDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.locationBarText, { color: colors.text }]}>GPS {t('liveTracking')}</Text>
                <Text style={[styles.locationCoords, { color: colors.textSecondary }]}>
                  {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
                </Text>
              </View>
            )}
            {isPedometerAvailable && !isTracking && (
              <View style={[styles.pedometerCard, { backgroundColor: colors.cardBg }]}>
                <View style={[styles.pedometerIcon, { backgroundColor: colors.accentPurple + '18' }]}>
                  <Ionicons name="footsteps" size={24} color={colors.accentPurple} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.pedometerLabel, { color: colors.textSecondary }]}>{t('pedometerActive')}</Text>
                  <Text style={[styles.pedometerValue, { color: colors.text }]}>{t('todaySteps')}</Text>
                </View>
                <View style={[styles.pedometerBadge, { backgroundColor: colors.accentPurple + '18' }]}>
                  <Text style={[styles.pedometerBadgeText, { color: colors.accentPurple }]}>{stepCount}</Text>
                </View>
              </View>
            )}
            {isTracking ? (
              <View style={[styles.trackingCard, { backgroundColor: colors.cardBg, borderColor: colors.primary }]}>
                <View style={styles.recordingRow}>
                  <Animated.View style={[styles.recordDot, { backgroundColor: colors.error, transform: [{ scale: pulseAnim }] }]} />
                  <Text style={[styles.recordingText, { color: colors.error }]}>{t('liveTracking')}</Text>
                </View>
                <View style={styles.trackStatsRow}>
                  {[
                    { icon: 'speedometer', color: colors.primary, val: fmtD(trackingStats.distance), label: t('distance') },
                    { icon: 'timer', color: colors.accentOrange, val: fmtDur(trackingStats.duration), label: t('duration') },
                    { icon: 'footsteps', color: colors.accentPurple, val: `${stepCount}`, label: t('steps') },
                  ].map((s, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <View style={[styles.trackStatDivider, { backgroundColor: colors.grayLight }]} />}
                      <View style={styles.trackStatItem}>
                        <Ionicons name={s.icon as any} size={22} color={s.color} />
                        <Text style={[styles.trackStatValue, { color: colors.text }]}>{s.val}</Text>
                        <Text style={[styles.trackStatLabel, { color: colors.textSecondary }]}>{s.label}</Text>
                      </View>
                    </React.Fragment>
                  ))}
                </View>
                <View style={[styles.pointsBar, { backgroundColor: colors.background }]}>
                  <Ionicons name="navigate" size={16} color={colors.textSecondary} />
                  <Text style={[styles.pointsText, { color: colors.textSecondary }]}>{currentRoute.length} {t('points')}</Text>
                </View>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.error }]} onPress={stopTracking} data-testid="stop-tracking-button">
                  <Ionicons name="stop" size={22} color="#FFF" /><Text style={styles.actionBtnText}>{t('stopAndSave')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.startCard, { backgroundColor: colors.cardBg }]}>
                <View style={[styles.startIconCircle, { backgroundColor: colors.primary }]}>
                  <Ionicons name="paw" size={44} color="#FFF" />
                </View>
                <Text style={[styles.startTitle, { color: colors.text }]}>{t('startWalkWithDog')} {currentDog?.name}</Text>
                <Text style={[styles.startSubtitle, { color: colors.textSecondary }]}>{t('walkWithDog')}</Text>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary, paddingHorizontal: Spacing.xxl }]} onPress={startTracking} data-testid="start-tracking-button">
                  <Ionicons name="play" size={22} color="#FFF" /><Text style={styles.actionBtnText}>{t('startWalk')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* ===== MAP ===== */}
        {activeTab === 'map' && location && (
          <>
            <TrailMap
              userLat={location.coords.latitude}
              userLng={location.coords.longitude}
              markers={mapMarkers}
              height={360}
              selectedId={selectedTrail}
              onMarkerPress={(id) => {
                setSelectedTrail(id === selectedTrail ? null : id);
              }}
            />

            {/* Selected trail detail card */}
            {selectedTrailData && (
              <View style={[styles.selectedCard, { backgroundColor: colors.cardBg }]}>
                <View style={styles.selectedCardTop}>
                  <View style={[styles.trailIconWrap, { backgroundColor: dC(selectedTrailData.difficulty) + '18' }]}>
                    <Ionicons name={tIcon(selectedTrailData) as any} size={22} color={dC(selectedTrailData.difficulty)} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.selectedCardName, { color: colors.text }]}>{selectedTrailData.name}</Text>
                    <View style={styles.trailMeta}>
                      <View style={[styles.trailBadge, { backgroundColor: dC(selectedTrailData.difficulty) + '18' }]}>
                        <Text style={[styles.trailBadgeText, { color: dC(selectedTrailData.difficulty) }]}>{dL(selectedTrailData.difficulty)}</Text>
                      </View>
                      {selectedTrailData.dog_friendly && (
                        <View style={[styles.trailBadge, { backgroundColor: colors.primary + '18' }]}>
                          <Ionicons name="paw" size={11} color={colors.primary} />
                          <Text style={[styles.trailBadgeText, { color: colors.primary }]}>{t('dogFriendly')}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => toggleFavorite(selectedTrailData)} data-testid="favorite-selected-button">
                    <Ionicons name={favorites.includes(selectedTrailData.id) ? 'heart' : 'heart-outline'} size={26} color={favorites.includes(selectedTrailData.id) ? colors.error : colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <View style={[styles.selectedCardStats, { borderTopColor: colors.grayLight }]}>
                  {selectedTrailData.distance_km && (
                    <View style={styles.trailStatItem}><Ionicons name="resize" size={14} color={colors.textSecondary} /><Text style={[styles.trailStatText, { color: colors.textSecondary }]}>{selectedTrailData.distance_km} km</Text></View>
                  )}
                  <View style={styles.trailStatItem}><Ionicons name="location" size={14} color={colors.primary} /><Text style={[styles.trailStatText, { color: colors.primary }]}>{selectedTrailData.dist_from_user_km} km</Text></View>
                  {selectedTrailData.surface ? (
                    <View style={styles.trailStatItem}><Ionicons name="footsteps" size={14} color={colors.textSecondary} /><Text style={[styles.trailStatText, { color: colors.textSecondary }]}>{selectedTrailData.surface}</Text></View>
                  ) : null}
                </View>
              </View>
            )}

            {/* Map legend */}
            <View style={[styles.legendCard, { backgroundColor: colors.cardBg }]}>
              <Text style={[styles.legendTitle, { color: colors.text }]}>Leyenda</Text>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: '#4361ee', borderColor: '#fff' }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Tu ubicacion</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>{t('easy')}</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>{t('moderate')}</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>{t('hard')}</Text>
              </View>
              <View style={styles.legendRow}>
                <Ionicons name="heart" size={14} color="#ffd700" />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Favorito</Text>
              </View>
            </View>

            {/* Quick stats */}
            <View style={[styles.mapStatsRow]}>
              <View style={[styles.mapStatCard, { backgroundColor: colors.cardBg }]}>
                <Text style={[styles.mapStatNum, { color: colors.primary }]}>{trails.length}</Text>
                <Text style={[styles.mapStatLabel, { color: colors.textSecondary }]}>Senderos</Text>
              </View>
              <View style={[styles.mapStatCard, { backgroundColor: colors.cardBg }]}>
                <Text style={[styles.mapStatNum, { color: colors.success }]}>{trails.filter(t => t.dog_friendly).length}</Text>
                <Text style={[styles.mapStatLabel, { color: colors.textSecondary }]}>{t('dogFriendly')}</Text>
              </View>
              <View style={[styles.mapStatCard, { backgroundColor: colors.cardBg }]}>
                <Text style={[styles.mapStatNum, { color: colors.error }]}>{favorites.length}</Text>
                <Text style={[styles.mapStatLabel, { color: colors.textSecondary }]}>Favoritos</Text>
              </View>
            </View>
          </>
        )}

        {/* ===== TRAILS ===== */}
        {activeTab === 'trails' && (
          <>
            {location && (
              <View style={[styles.trailsHeader, { backgroundColor: colors.primary + '10' }]}>
                <Ionicons name="compass" size={18} color={colors.primary} />
                <Text style={[styles.trailsHeaderText, { color: colors.text }]}>{t('hikingTrailsDesc')} ({trails.length})</Text>
              </View>
            )}
            {trailsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('loading')}</Text>
              </View>
            ) : trails.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.cardBg }]}>
                <View style={[styles.emptyIconWrap, { backgroundColor: colors.grayLight }]}>
                  <Ionicons name="trail-sign-outline" size={40} color={colors.gray} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No se encontraron senderos</Text>
                <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>Intenta con una ubicacion diferente</Text>
              </View>
            ) : (
              trails.map((trail) => (
                <View key={trail.id} style={[styles.trailCard, { backgroundColor: colors.cardBg }]}>
                  <View style={styles.trailTop}>
                    <View style={[styles.trailIconWrap, { backgroundColor: dC(trail.difficulty) + '18' }]}>
                      <Ionicons name={tIcon(trail) as any} size={24} color={dC(trail.difficulty)} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.trailName, { color: colors.text }]} numberOfLines={2}>{trail.name}</Text>
                      <View style={styles.trailMeta}>
                        <View style={[styles.trailBadge, { backgroundColor: dC(trail.difficulty) + '18' }]}>
                          <Text style={[styles.trailBadgeText, { color: dC(trail.difficulty) }]}>{dL(trail.difficulty)}</Text>
                        </View>
                        {trail.dog_friendly && (
                          <View style={[styles.trailBadge, { backgroundColor: colors.primary + '18' }]}>
                            <Ionicons name="paw" size={11} color={colors.primary} />
                            <Text style={[styles.trailBadgeText, { color: colors.primary }]}>{t('dogFriendly')}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => toggleFavorite(trail)} data-testid={`favorite-trail-${trail.id}`} style={styles.favBtn}>
                      <Ionicons name={favorites.includes(trail.id) ? 'heart' : 'heart-outline'} size={24} color={favorites.includes(trail.id) ? colors.error : colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.trailStatsRow, { borderTopColor: colors.grayLight }]}>
                    {trail.distance_km && (
                      <View style={styles.trailStatItem}><Ionicons name="resize" size={14} color={colors.textSecondary} /><Text style={[styles.trailStatText, { color: colors.textSecondary }]}>{trail.distance_km} km</Text></View>
                    )}
                    {trail.duration_h && (
                      <View style={styles.trailStatItem}><Ionicons name="time" size={14} color={colors.textSecondary} /><Text style={[styles.trailStatText, { color: colors.textSecondary }]}>{trail.duration_h}h</Text></View>
                    )}
                    <View style={styles.trailStatItem}><Ionicons name="location" size={14} color={colors.primary} /><Text style={[styles.trailStatText, { color: colors.primary }]}>{trail.dist_from_user_km} km</Text></View>
                    {trail.surface ? <View style={styles.trailStatItem}><Ionicons name="footsteps" size={14} color={colors.textSecondary} /><Text style={[styles.trailStatText, { color: colors.textSecondary }]}>{trail.surface}</Text></View> : null}
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* ===== HISTORY ===== */}
        {activeTab === 'history' && (
          <>
            {routes.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.cardBg }]}>
                <View style={[styles.emptyIconWrap, { backgroundColor: colors.grayLight }]}><Ionicons name="map-outline" size={40} color={colors.gray} /></View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('noRoutes')}</Text>
                <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>{t('noRoutesHint')}</Text>
              </View>
            ) : (
              routes.map((route, i) => (
                <View key={route.id} style={[styles.routeCard, { backgroundColor: colors.cardBg }]}>
                  <View style={styles.routeCardTop}>
                    <View style={[styles.routeNum, { backgroundColor: colors.primary + '18' }]}>
                      <Text style={[styles.routeNumText, { color: colors.primary }]}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.routeCardName, { color: colors.text }]} numberOfLines={1}>{route.name}</Text>
                      <Text style={[styles.routeCardDate, { color: colors.textSecondary }]}>{new Date(route.created_at).toLocaleDateString()}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </View>
                  <View style={[styles.routeCardStats, { borderTopColor: colors.grayLight }]}>
                    <View style={styles.routeCardStat}><Ionicons name="resize" size={14} color={colors.primary} /><Text style={[styles.routeCardStatText, { color: colors.text }]}>{route.distance_km.toFixed(2)} km</Text></View>
                    <View style={styles.routeCardStat}><Ionicons name="time" size={14} color={colors.accentOrange} /><Text style={[styles.routeCardStatText, { color: colors.text }]}>{route.duration_minutes} min</Text></View>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: C.text },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xxl + 40 },

  // GDPR
  gdprContainer: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  gdprIconWrap: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: Spacing.lg },
  gdprTitle: { fontSize: FontSizes.xxl, fontWeight: '700', textAlign: 'center', marginBottom: Spacing.lg },
  gdprCard: { borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.xl, ...S.sm },
  gdprSectionTitle: { fontSize: FontSizes.md, lineHeight: 22, marginBottom: Spacing.sm },
  gdprDivider: { height: 1, marginVertical: Spacing.md },
  gdprItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  gdprItemText: { fontSize: FontSizes.md, flex: 1 },
  gdprLegal: { fontSize: FontSizes.sm, lineHeight: 20, marginTop: Spacing.sm },
  gdprAcceptBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: 16, borderRadius: BorderRadius.xl, marginBottom: Spacing.md },
  gdprAcceptText: { color: '#FFF', fontSize: FontSizes.lg, fontWeight: '700' },
  gdprDeclineBtn: { alignItems: 'center', paddingVertical: Spacing.md },
  gdprDeclineText: { fontSize: FontSizes.md },

  // Permission
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  permIconWrap: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg },
  permTitle: { fontSize: FontSizes.xxl, fontWeight: '700', textAlign: 'center', marginBottom: Spacing.sm },
  permDesc: { fontSize: FontSizes.md, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl, paddingHorizontal: Spacing.lg },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: 14, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.xl },
  actionBtnText: { color: '#FFF', fontSize: FontSizes.lg, fontWeight: '700' },

  // Tabs
  tabBar: { flexDirection: 'row', marginHorizontal: Spacing.md, marginBottom: Spacing.sm, borderRadius: BorderRadius.lg, padding: 3, ...S.sm },
  tabItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 9, borderRadius: BorderRadius.md },
  tabLabel: { fontSize: 11, color: C.textSecondary, fontWeight: '500' },

  // Location bar
  locationBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 10, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.md },
  locationDot: { width: 8, height: 8, borderRadius: 4 },
  locationBarText: { fontSize: FontSizes.sm, fontWeight: '600' },
  locationCoords: { fontSize: FontSizes.xs, marginLeft: 'auto' },

  // Pedometer
  pedometerCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.md, ...S.sm },
  pedometerIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  pedometerLabel: { fontSize: FontSizes.xs, fontWeight: '500' },
  pedometerValue: { fontSize: FontSizes.md, fontWeight: '600' },
  pedometerBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full },
  pedometerBadgeText: { fontSize: FontSizes.lg, fontWeight: '700' },

  // Tracking
  trackingCard: { padding: Spacing.lg, borderRadius: BorderRadius.xl, borderWidth: 2, ...S.md },
  recordingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  recordDot: { width: 12, height: 12, borderRadius: 6 },
  recordingText: { fontSize: FontSizes.md, fontWeight: '700' },
  trackStatsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: Spacing.lg },
  trackStatItem: { alignItems: 'center', gap: 4 },
  trackStatValue: { fontSize: FontSizes.xxl, fontWeight: '700' },
  trackStatLabel: { fontSize: FontSizes.xs, fontWeight: '500' },
  trackStatDivider: { width: 1, height: 40 },
  pointsBar: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.lg },
  pointsText: { fontSize: FontSizes.sm, fontWeight: '500' },

  // Start
  startCard: { alignItems: 'center', padding: Spacing.xl, borderRadius: BorderRadius.xl, ...S.md },
  startIconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg },
  startTitle: { fontSize: FontSizes.xl, fontWeight: '700', marginBottom: 4 },
  startSubtitle: { fontSize: FontSizes.md, marginBottom: Spacing.xl },

  // Map
  selectedCard: { marginTop: Spacing.md, borderRadius: BorderRadius.lg, padding: Spacing.md, ...S.sm },
  selectedCardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  selectedCardName: { fontSize: FontSizes.md, fontWeight: '600', marginBottom: 4 },
  selectedCardStats: { flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, flexWrap: 'wrap' },
  legendCard: { marginTop: Spacing.md, borderRadius: BorderRadius.lg, padding: Spacing.md, ...S.sm },
  legendTitle: { fontSize: FontSizes.sm, fontWeight: '700', marginBottom: Spacing.sm },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: '#fff' },
  legendText: { fontSize: FontSizes.xs },
  mapStatsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  mapStatCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, ...S.sm },
  mapStatNum: { fontSize: FontSizes.xxl, fontWeight: '700' },
  mapStatLabel: { fontSize: FontSizes.xs, marginTop: 2 },

  // Trails
  trailsHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 10, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.md },
  trailsHeaderText: { fontSize: FontSizes.sm, fontWeight: '600' },
  loadingContainer: { alignItems: 'center', padding: Spacing.xxl, gap: Spacing.md },
  loadingText: { fontSize: FontSizes.md },
  trailCard: { borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, ...S.sm },
  trailTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  trailIconWrap: { width: 48, height: 48, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center' },
  trailName: { fontSize: FontSizes.md, fontWeight: '600', marginBottom: 4 },
  trailMeta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  trailBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  trailBadgeText: { fontSize: FontSizes.xs, fontWeight: '600' },
  trailStatsRow: { flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, flexWrap: 'wrap' },
  trailStatItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trailStatText: { fontSize: FontSizes.sm },
  favBtn: { padding: Spacing.xs },

  // Empty
  emptyState: { alignItems: 'center', padding: Spacing.xl, borderRadius: BorderRadius.xl, ...S.sm },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSizes.lg, fontWeight: '600', marginBottom: 4 },
  emptyHint: { fontSize: FontSizes.sm, textAlign: 'center' },

  // Route cards
  routeCard: { borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, ...S.sm },
  routeCardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  routeNum: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  routeNumText: { fontSize: FontSizes.md, fontWeight: '700' },
  routeCardName: { fontSize: FontSizes.md, fontWeight: '600' },
  routeCardDate: { fontSize: FontSizes.xs, marginTop: 2 },
  routeCardStats: { flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1 },
  routeCardStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  routeCardStatText: { fontSize: FontSizes.sm, fontWeight: '500' },
});
