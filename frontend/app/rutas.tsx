import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pedometer } from 'expo-sensors';
import axios from 'axios';
import { SecureStore } from '../utils/secureStore';
import { useAuth } from '../contexts/AuthContext';
import { Spacing, BorderRadius, FontSizes } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';
const STEP_LENGTH_KM = 0.0007;
const DAILY_GOAL = 5000;

const T: Record<string, Record<string, string>> = {
  es: {
    title: 'Paseos',
    subtitle: 'Camina con tu mejor amigo',
    start: 'Empezar paseo',
    stop: 'Terminar paseo',
    steps: 'Pasos',
    distance: 'Distancia',
    time: 'Tiempo',
    calories: 'Calorias',
    dailyGoal: 'Meta diaria',
    goalReached: 'Meta alcanzada!',
    keepGoing: 'Sigue asi!',
    motivate1: 'Tu mascota necesita moverse tanto como tu',
    motivate2: 'Cada paso fortalece vuestro vinculo',
    motivate3: '30 min al dia reduce el estres de tu perro un 40%',
    motivate4: 'Los paseos son la mejor terapia para los dos',
    history: 'Paseos recientes',
    noWalks: 'Aun no tienes paseos. Sal a caminar!',
    saved: 'Paseo guardado!',
    pedometerOff: 'El podometro no esta disponible en este dispositivo',
    bestWalk: 'Mejor paseo',
    totalSteps: 'Pasos totales',
    totalWalks: 'Paseos totales',
    thisWeek: 'Esta semana',
  },
  en: {
    title: 'Walks',
    subtitle: 'Walk with your best friend',
    start: 'Start walk',
    stop: 'End walk',
    steps: 'Steps',
    distance: 'Distance',
    time: 'Time',
    calories: 'Calories',
    dailyGoal: 'Daily goal',
    goalReached: 'Goal reached!',
    keepGoing: 'Keep going!',
    motivate1: 'Your pet needs to move as much as you do',
    motivate2: 'Every step strengthens your bond',
    motivate3: '30 min a day reduces your dog\'s stress by 40%',
    motivate4: 'Walks are the best therapy for both of you',
    history: 'Recent walks',
    noWalks: 'No walks yet. Go for a walk!',
    saved: 'Walk saved!',
    pedometerOff: 'Pedometer not available on this device',
    bestWalk: 'Best walk',
    totalSteps: 'Total steps',
    totalWalks: 'Total walks',
    thisWeek: 'This week',
  },
  it: {
    title: 'Passeggiate',
    subtitle: 'Cammina con il tuo migliore amico',
    start: 'Inizia passeggiata',
    stop: 'Termina passeggiata',
    steps: 'Passi',
    distance: 'Distanza',
    time: 'Tempo',
    calories: 'Calorie',
    dailyGoal: 'Obiettivo giornaliero',
    goalReached: 'Obiettivo raggiunto!',
    keepGoing: 'Continua cosi!',
    motivate1: 'Il tuo animale ha bisogno di muoversi quanto te',
    motivate2: 'Ogni passo rafforza il vostro legame',
    motivate3: '30 min al giorno riducono lo stress del cane del 40%',
    motivate4: 'Le passeggiate sono la migliore terapia per entrambi',
    history: 'Passeggiate recenti',
    noWalks: 'Nessuna passeggiata. Esci a camminare!',
    saved: 'Passeggiata salvata!',
    pedometerOff: 'Contapassi non disponibile su questo dispositivo',
    bestWalk: 'Migliore passeggiata',
    totalSteps: 'Passi totali',
    totalWalks: 'Passeggiate totali',
    thisWeek: 'Questa settimana',
  },
};

export default function PaseosScreen() {
  const router = useRouter();
  const { currentDog } = useAuth();
  const { colors, shadows } = useTheme();
  const { language } = useLanguage();
  const t = (k: string) => T[language]?.[k] || T.es[k] || k;

  const [isWalking, setIsWalking] = useState(false);
  const [steps, setSteps] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [walks, setWalks] = useState<any[]>([]);
  const [pedometerAvailable, setPedometerAvailable] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<any>(null);
  const pedometerSub = useRef<any>(null);
  const stepsAtStart = useRef(0);

  const distance = (steps * STEP_LENGTH_KM).toFixed(2);
  const calories = Math.round(steps * 0.04);
  const goalPercent = Math.min((steps / DAILY_GOAL) * 100, 100);
  const timeStr = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  const motivations = [t('motivate1'), t('motivate2'), t('motivate3'), t('motivate4')];
  const [motivationIdx] = useState(Math.floor(Math.random() * motivations.length));

  useEffect(() => { loadWalks(); }, []);

  useEffect(() => {
    if (isWalking) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])).start();
    } else { pulseAnim.setValue(1); }
  }, [isWalking]);

  const loadWalks = async () => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      if (!token || !currentDog?.id) return;
      const res = await axios.get(`${BACKEND_URL}/api/walks/${currentDog.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setWalks(res.data || []);
    } catch { setWalks([]); }
  };

  const startWalk = async () => {
    setSteps(0); setSeconds(0); stepsAtStart.current = 0;
    const available = await Pedometer.isAvailableAsync().catch(() => false);
    setPedometerAvailable(!!available);
    if (available) {
      pedometerSub.current = Pedometer.watchStepCount(result => {
        setSteps(result.steps - stepsAtStart.current);
      });
    }
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    setIsWalking(true);
    Vibration.vibrate(100);
  };

  const stopWalk = async () => {
    setIsWalking(false);
    if (pedometerSub.current) { pedometerSub.current.remove(); pedometerSub.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    Vibration.vibrate([0, 100, 100, 100]);

    if (steps > 10) {
      try {
        const token = await SecureStore.getItemAsync('session_token');
        await axios.post(`${BACKEND_URL}/api/walks`, {
          dog_id: currentDog?.id, steps, distance_km: parseFloat(distance), duration_seconds: seconds, calories,
        }, { headers: { Authorization: `Bearer ${token}` } });
        loadWalks();
      } catch {}
    }
  };

  useEffect(() => () => {
    if (pedometerSub.current) pedometerSub.current.remove();
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const weekStats = walks.reduce((acc, w) => {
    const d = new Date(w.created_at);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (d >= weekAgo) { acc.steps += w.steps || 0; acc.walks += 1; }
    if ((w.steps || 0) > acc.best) acc.best = w.steps;
    return acc;
  }, { steps: 0, walks: 0, best: 0 });

  const C = colors; const S = shadows;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, paddingBottom: 0 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: Spacing.md }} data-testid="walks-back-btn">
            <Ionicons name="arrow-back" size={24} color={C.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: FontSizes.xl, fontWeight: '800', color: C.text }}>{t('title')}</Text>
            <Text style={{ fontSize: FontSizes.sm, color: C.textSecondary }}>{t('subtitle')}</Text>
          </View>
          <Ionicons name="paw" size={28} color={C.primary} />
        </View>

        {/* Motivation */}
        <View style={[st.motivCard, { backgroundColor: C.primary + '15' }]}>
          <Ionicons name="sparkles" size={20} color={C.primary} />
          <Text style={{ flex: 1, marginLeft: Spacing.sm, fontSize: FontSizes.sm, color: C.primary, fontWeight: '600', lineHeight: 20 }}>
            {motivations[motivationIdx]}
          </Text>
        </View>

        {/* Main pedometer circle */}
        <View style={{ alignItems: 'center', paddingVertical: Spacing.xl }}>
          <Animated.View style={[st.circle, { backgroundColor: isWalking ? C.primary : C.white, transform: [{ scale: pulseAnim }], ...S.medium }]} data-testid="pedometer-circle">
            <Text style={{ fontSize: 42, fontWeight: '900', color: isWalking ? '#FFF' : C.text }}>{steps}</Text>
            <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: isWalking ? 'rgba(255,255,255,0.8)' : C.textSecondary, marginTop: -4 }}>{t('steps')}</Text>
          </Animated.View>

          {/* Goal bar */}
          <View style={{ width: '70%', marginTop: Spacing.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: FontSizes.xs, color: C.textSecondary }}>{t('dailyGoal')}: {DAILY_GOAL}</Text>
              <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: goalPercent >= 100 ? C.success : C.primary }}>{goalPercent >= 100 ? t('goalReached') : `${Math.round(goalPercent)}%`}</Text>
            </View>
            <View style={{ height: 8, backgroundColor: C.grayLight, borderRadius: 4, overflow: 'hidden' }}>
              <View style={{ height: 8, width: `${goalPercent}%`, backgroundColor: goalPercent >= 100 ? C.success : C.primary, borderRadius: 4 }} />
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View style={st.statsRow}>
          {[
            { icon: 'footsteps', label: t('distance'), value: `${distance} km` },
            { icon: 'time', label: t('time'), value: timeStr },
            { icon: 'flame', label: t('calories'), value: `${calories} kcal` },
          ].map((s, i) => (
            <View key={i} style={[st.statCard, { backgroundColor: C.white, ...S.small }]}>
              <Ionicons name={s.icon as any} size={22} color={C.primary} />
              <Text style={{ fontSize: FontSizes.lg, fontWeight: '800', color: C.text, marginTop: 4 }}>{s.value}</Text>
              <Text style={{ fontSize: FontSizes.xs, color: C.textSecondary }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Start/Stop button */}
        <TouchableOpacity
          style={[st.mainBtn, { backgroundColor: isWalking ? '#FF4B4B' : C.primary }]}
          onPress={isWalking ? stopWalk : startWalk}
          data-testid="walk-toggle-btn"
        >
          <Ionicons name={isWalking ? 'stop-circle' : 'play-circle'} size={28} color="#FFF" />
          <Text style={st.mainBtnText}>{isWalking ? t('stop') : t('start')}</Text>
        </TouchableOpacity>

        {!pedometerAvailable && (
          <Text style={{ textAlign: 'center', fontSize: FontSizes.xs, color: C.warning, marginTop: Spacing.sm, paddingHorizontal: Spacing.lg }}>
            {t('pedometerOff')}
          </Text>
        )}

        {/* Week stats */}
        <View style={{ padding: Spacing.lg }}>
          <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.text, marginBottom: Spacing.md }}>{t('thisWeek')}</Text>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            {[
              { label: t('totalSteps'), value: weekStats.steps.toLocaleString(), icon: 'footsteps', color: C.primary },
              { label: t('totalWalks'), value: String(weekStats.walks), icon: 'walk', color: C.success },
              { label: t('bestWalk'), value: weekStats.best.toLocaleString(), icon: 'trophy', color: '#FFB800' },
            ].map((s, i) => (
              <View key={i} style={[st.weekCard, { backgroundColor: C.white, borderLeftColor: s.color, ...S.small }]}>
                <Ionicons name={s.icon as any} size={20} color={s.color} />
                <Text style={{ fontSize: FontSizes.lg, fontWeight: '800', color: C.text }}>{s.value}</Text>
                <Text style={{ fontSize: 10, color: C.textSecondary }}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* History */}
        <View style={{ padding: Spacing.lg, paddingTop: 0 }}>
          <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.text, marginBottom: Spacing.md }}>{t('history')}</Text>
          {walks.length === 0 ? (
            <View style={[st.emptyCard, { backgroundColor: C.white, ...S.small }]}>
              <Ionicons name="paw" size={40} color={C.grayLight} />
              <Text style={{ fontSize: FontSizes.sm, color: C.textSecondary, marginTop: Spacing.sm, textAlign: 'center' }}>{t('noWalks')}</Text>
            </View>
          ) : (
            walks.slice(0, 10).map((w, i) => {
              const d = new Date(w.created_at);
              const dateStr = d.toLocaleDateString(language === 'en' ? 'en-US' : language === 'it' ? 'it-IT' : 'es-ES', { day: 'numeric', month: 'short' });
              const dur = w.duration_seconds ? `${Math.floor(w.duration_seconds / 60)} min` : '--';
              return (
                <View key={w.id || i} style={[st.walkItem, { backgroundColor: C.white, ...S.small }]} data-testid={`walk-history-${i}`}>
                  <View style={[st.walkIcon, { backgroundColor: C.primary + '15' }]}>
                    <Ionicons name="walk" size={20} color={C.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontWeight: '700', color: C.text }}>{(w.steps || 0).toLocaleString()} {t('steps').toLowerCase()}</Text>
                      <Text style={{ fontSize: FontSizes.xs, color: C.textSecondary }}>{dateStr}</Text>
                    </View>
                    <Text style={{ fontSize: FontSizes.xs, color: C.textSecondary, marginTop: 2 }}>
                      {w.distance_km?.toFixed(2) || '0'} km  ·  {dur}  ·  {w.calories || 0} kcal
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  motivCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.lg, marginTop: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.lg },
  circle: { width: 180, height: 180, borderRadius: 90, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.lg },
  statCard: { flex: 1, alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.lg },
  mainBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginHorizontal: Spacing.lg, marginTop: Spacing.xl, paddingVertical: Spacing.md, borderRadius: 30 },
  mainBtnText: { fontSize: FontSizes.md, fontWeight: '800', color: '#FFF' },
  weekCard: { flex: 1, alignItems: 'center', padding: Spacing.sm, borderRadius: BorderRadius.md, borderLeftWidth: 3, gap: 2 },
  emptyCard: { alignItems: 'center', padding: Spacing.xl, borderRadius: BorderRadius.lg },
  walkItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm },
  walkIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
