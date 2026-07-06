import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';
import { Spacing, BorderRadius, FontSizes } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui';
import { SecureStore } from '../utils/secureStore';
import { useLanguage } from '../contexts/LanguageContext';

import { BACKEND_URL } from '../config/backend';

const EMOTION_KEYS = [
  { id: 'happy', icon: 'happy', labelKey: 'emotionHappy', color: '#4CAF50', bg: '#E8F5E9' },
  { id: 'calm', icon: 'leaf', labelKey: 'emotionCalm', color: '#2196F3', bg: '#E3F2FD' },
  { id: 'worried', icon: 'alert-circle', labelKey: 'emotionWorried', color: '#FF9800', bg: '#FFF3E0' },
  { id: 'sad', icon: 'sad', labelKey: 'emotionSad', color: '#9C27B0', bg: '#F3E5F5' },
  { id: 'stressed', icon: 'thunderstorm', labelKey: 'emotionStressed', color: '#F44336', bg: '#FFEBEE' },
];

export default function DiarioScreen() {
  const router = useRouter();
  const { colors, shadows } = useTheme();
  const { currentDog } = useAuth();
  const { t, language } = useLanguage();
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [todayLogged, setTodayLogged] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const [insight, setInsight] = useState('');
  const [insightLoading, setInsightLoading] = useState(false);
  const [entriesCount, setEntriesCount] = useState(0);

  const EMOTIONS = useMemo(() => EMOTION_KEYS.map(e => ({ ...e, label: t(e.labelKey) })), [language]);

  const loadData = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      const [todayRes, entriesRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/diary/today`, { headers }),
        axios.get(`${BACKEND_URL}/api/diary?days=90`, { headers }),
      ]);
      if (todayRes.data.logged_today) {
        setTodayLogged(true);
        setSelected(todayRes.data.emotion);
        setNote(todayRes.data.note || '');
      }
      setEntries(entriesRes.data.entries || []);
    } catch (e) {
      console.log('Error loading diary:', e);
    }
  }, []);

  const loadInsight = useCallback(async () => {
    setInsightLoading(true);
    try {
      const token = await SecureStore.getItemAsync('session_token');
      if (!token) return;
      const res = await axios.get(`${BACKEND_URL}/api/diary/insights`, { headers: { Authorization: `Bearer ${token}` } });
      setInsight(res.data.insight || '');
      setEntriesCount(res.data.entries_count || 0);
    } catch (e) {
      console.log('Error loading insights:', e);
    } finally {
      setInsightLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); loadInsight(); }, [loadData, loadInsight]));

  const saveEntry = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const token = await SecureStore.getItemAsync('session_token');
      await axios.post(`${BACKEND_URL}/api/diary`, {
        emotion: selected, note: note.trim() || null, dog_id: currentDog?.id,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setTodayLogged(true);
      loadData();
    } catch (e) {
      Alert.alert(t('error'), t('diaryError'));
    } finally {
      setSaving(false);
    }
  };

  const s = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  // Group entries by week
  const weekEmotions = useMemo(() => {
    const last7 = entries.slice(0, 7);
    const counts: Record<string, number> = {};
    last7.forEach(e => { counts[e.emotion] = (counts[e.emotion] || 0) + 1; });
    return counts;
  }, [entries]);

  const dominantEmotion = useMemo(() => {
    let max = 0; let dominant = '';
    Object.entries(weekEmotions).forEach(([k, v]) => { if (v > max) { max = v; dominant = k; } });
    return EMOTIONS.find(e => e.id === dominant);
  }, [weekEmotions, EMOTIONS]);

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} data-testid="diary-back-btn">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t('emotionDiary')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Today's entry */}
        <Card style={s.todayCard}>
          <Text style={s.todayTitle}>{todayLogged ? t('todayYouFeel') : t('howDoYouFeel')}</Text>
          <View style={s.emotionsRow}>
            {EMOTIONS.map(em => (
              <TouchableOpacity
                key={em.id}
                style={[s.emotionBtn, selected === em.id && { backgroundColor: em.bg, borderColor: em.color, borderWidth: 2 }]}
                onPress={() => setSelected(em.id)}
                data-testid={`emotion-${em.id}`}
              >
                <Ionicons name={em.icon as any} size={28} color={selected === em.id ? em.color : colors.gray} />
                <Text style={[s.emotionLabel, selected === em.id && { color: em.color, fontWeight: '700' }]}>{em.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={s.noteInput}
            placeholder={t('addNotePlaceholder')}
            placeholderTextColor={colors.gray}
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={200}
          />
          <TouchableOpacity
            style={[s.saveBtn, !selected && { opacity: 0.5 }]}
            onPress={saveEntry}
            disabled={!selected || saving}
            data-testid="save-diary-btn"
          >
            <Text style={s.saveBtnText}>{saving ? t('saving') : todayLogged ? t('update') : t('save')}</Text>
          </TouchableOpacity>
        </Card>

        {/* Weekly insight */}
        {entries.length >= 3 && (
          <Card style={s.insightCard}>
            <View style={s.insightHeader}>
              <Ionicons name="sparkles" size={20} color={colors.accent} />
              <Text style={s.insightTitle}>{t('weeklyInsight')}</Text>
            </View>
            {insightLoading ? (
              <Text style={s.insightText}>{t('analyzingWeek')}</Text>
            ) : (
              <Text style={s.insightText}>{insight}</Text>
            )}
          </Card>
        )}

        {/* Week overview */}
        {entries.length > 0 && (
          <>
            <Text style={s.sectionTitle}>{t('thisWeek')}</Text>
            <View style={s.weekRow}>
              {EMOTIONS.map(em => {
                const count = weekEmotions[em.id] || 0;
                return (
                  <View key={em.id} style={s.weekItem}>
                    <View style={[s.weekDot, { backgroundColor: count > 0 ? em.color : colors.grayLight }]}>
                      <Text style={s.weekCount}>{count}</Text>
                    </View>
                    <Ionicons name={em.icon as any} size={16} color={count > 0 ? em.color : colors.gray} />
                  </View>
                );
              })}
            </View>
            {dominantEmotion && (
              <Text style={s.dominantText}>
                {t('dominantEmotion')} <Text style={{ color: dominantEmotion.color, fontWeight: '700' }}>{dominantEmotion.label}</Text>
              </Text>
            )}
          </>
        )}

        {/* History */}
        {entries.length > 0 && (
          <>
            <Text style={[s.sectionTitle, { marginTop: Spacing.lg }]}>{t('history')}</Text>
            <Text style={{ fontSize: FontSizes.sm, color: colors.textSecondary, marginBottom: Spacing.md }}>
              {entries.length} {language === 'en' ? 'entries' : language === 'it' ? 'registri' : 'registros'}
            </Text>
            {entries.map((entry, idx) => {
              const em = EMOTIONS.find(e => e.id === entry.emotion);
              const date = new Date(entry.created_at);
              const dayStr = date.toLocaleDateString(language === 'en' ? 'en-US' : language === 'it' ? 'it-IT' : 'es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
              const isToday = new Date().toDateString() === date.toDateString();
              return (
                <View key={entry.id || idx} style={[s.historyCard, { borderLeftColor: em?.color || colors.grayLight }]} data-testid={`diary-entry-${idx}`}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: entry.note ? 8 : 0 }}>
                    <View style={[s.historyDot, { backgroundColor: em?.bg || colors.grayLight }]}>
                      <Ionicons name={(em?.icon || 'ellipse') as any} size={18} color={em?.color || colors.gray} />
                    </View>
                    <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                      <Text style={[s.historyEmotion, { color: em?.color }]}>{em?.label || entry.emotion}</Text>
                      <Text style={s.historyDate}>{isToday ? (language === 'en' ? 'Today' : language === 'it' ? 'Oggi' : 'Hoy') : dayStr}</Text>
                    </View>
                  </View>
                  {entry.note ? (
                    <View style={[s.historyNoteBox, { backgroundColor: em?.bg || colors.grayLight }]}>
                      <Ionicons name="chatbubble-outline" size={14} color={em?.color || colors.gray} style={{ marginTop: 2 }} />
                      <Text style={s.historyNoteText}>{entry.note}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </>
        )}

        {entries.length === 0 && (
          <Card style={s.emptyCard}>
            <Ionicons name="journal" size={40} color={colors.gray} />
            <Text style={s.emptyText}>{t('diaryEmpty')}</Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (C: any, S: any) => StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: C.text },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  todayCard: { marginBottom: Spacing.lg },
  todayTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: C.text, marginBottom: Spacing.md, textAlign: 'center' },
  emotionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  emotionBtn: { alignItems: 'center', padding: Spacing.sm, borderRadius: BorderRadius.lg, borderWidth: 2, borderColor: 'transparent', width: '18%' },
  emotionLabel: { fontSize: 10, color: C.textSecondary, marginTop: 4, textAlign: 'center' },
  noteInput: { backgroundColor: C.grayLight, borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSizes.md, color: C.text, minHeight: 60, textAlignVertical: 'top', marginBottom: Spacing.md },
  saveBtn: { backgroundColor: C.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, alignItems: 'center' },
  saveBtnText: { fontSize: FontSizes.md, fontWeight: '700', color: '#FFF' },

  insightCard: { marginBottom: Spacing.lg, backgroundColor: C.accentLight },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  insightTitle: { fontSize: FontSizes.md, fontWeight: '700', color: C.accent },
  insightText: { fontSize: FontSizes.md, color: C.text, lineHeight: 22 },

  sectionTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: C.text, marginBottom: Spacing.sm },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  weekItem: { alignItems: 'center', gap: 4 },
  weekDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  weekCount: { fontSize: FontSizes.sm, fontWeight: '700', color: '#FFF' },
  dominantText: { fontSize: FontSizes.sm, color: C.textSecondary, textAlign: 'center', marginBottom: Spacing.md },

  historyCard: { flexDirection: 'column', padding: Spacing.md, marginBottom: Spacing.sm, backgroundColor: C.white, borderRadius: BorderRadius.lg, borderLeftWidth: 4, ...S.small },
  historyDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  historyEmotion: { fontSize: FontSizes.md, fontWeight: '700' },
  historyDate: { fontSize: FontSizes.xs, color: C.textSecondary, marginTop: 1 },
  historyNoteBox: { flexDirection: 'row', gap: 8, padding: Spacing.sm, borderRadius: BorderRadius.md, marginTop: 4 },
  historyNoteText: { fontSize: FontSizes.sm, color: C.text, flex: 1, lineHeight: 20 },

  emptyCard: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.md },
  emptyText: { fontSize: FontSizes.md, color: C.textSecondary, textAlign: 'center', lineHeight: 22 },
});
