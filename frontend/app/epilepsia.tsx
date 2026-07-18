import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { SecureStore } from '../utils/secureStore';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius, FontSizes, Fonts } from '../constants/theme';
import { BACKEND_URL } from '../config/backend';

interface Seizure {
  id: string;
  date: string;
  duration_minutes?: number;
  severity?: string;
  trigger?: string;
  notes?: string;
}

const SEVERITIES = [
  { id: 'mild', color: '#3FA96C' },
  { id: 'moderate', color: '#E8B93C' },
  { id: 'severe', color: '#D9534F' },
];

export default function EpilepsiaScreen() {
  const router = useRouter();
  const { currentDog } = useAuth();
  const { t, language } = useLanguage();
  const { colors, shadows } = useTheme();
  const [seizures, setSeizures] = useState<Seizure[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState<string>('mild');
  const [trigger, setTrigger] = useState('');
  const [notes, setNotes] = useState('');

  const s = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  const load = useCallback(async () => {
    if (!currentDog?.id) return;
    try {
      const token = await SecureStore.getItemAsync('session_token');
      const res = await axios.get(`${BACKEND_URL}/api/epilepsy/${currentDog.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setSeizures(res.data || []);
    } catch (e) {}
  }, [currentDog?.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleSave = async () => {
    if (!currentDog?.id) return;
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) { Alert.alert('Error', t('invalidDate')); return; }
    setSaving(true);
    try {
      const token = await SecureStore.getItemAsync('session_token');
      await axios.post(`${BACKEND_URL}/api/epilepsy`, {
        dog_id: currentDog.id,
        date,
        duration_minutes: duration ? Number(duration) : null,
        severity,
        trigger: trigger.trim() || null,
        notes: notes.trim() || null,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setShowForm(false);
      setDuration(''); setTrigger(''); setNotes(''); setSeverity('mild');
      setDate(new Date().toISOString().slice(0, 10));
      await load();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.detail || t('seizureSaveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      await axios.delete(`${BACKEND_URL}/api/epilepsy/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setSeizures(prev => prev.filter(x => x.id !== id));
    } catch (e) {}
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString(language === 'es' ? 'es-ES' : language === 'it' ? 'it-IT' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return d; }
  };

  const sevLabel = (id?: string) => id === 'mild' ? t('sevMild') : id === 'moderate' ? t('sevModerate') : id === 'severe' ? t('sevSevere') : '--';
  const sevColor = (id?: string) => SEVERITIES.find(x => x.id === id)?.color || colors.gray;

  const now = new Date();
  const thisMonth = seizures.filter(x => {
    const d = new Date(x.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} testID="epilepsy-back-btn">
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.title}>{t('epilepsyDiary')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: 120 }} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>

        <View style={s.infoCard}>
          <Ionicons name="information-circle" size={20} color={'#4A7DDA'} />
          <Text style={s.infoText}>{t('epilepsyInfo').replace('{name}', currentDog?.name || '')}</Text>
        </View>

        <View style={s.statsRow} testID="epilepsy-stats">
          <View style={s.statBox}>
            <Text style={s.statValue}>{seizures.length}</Text>
            <Text style={s.statLabel}>{t('totalSeizures')}</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statValue}>{thisMonth}</Text>
            <Text style={s.statLabel}>{t('thisMonth')}</Text>
          </View>
          <View style={s.statBox}>
            <Text style={[s.statValue, { fontSize: 15, marginTop: 4 }]}>{seizures.length > 0 ? formatDate(seizures[0].date) : '--'}</Text>
            <Text style={s.statLabel}>{t('lastSeizure')}</Text>
          </View>
        </View>

        <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(true)} testID="register-seizure-btn">
          <Ionicons name="add-circle" size={20} color="#FFF" />
          <Text style={s.addBtnText}>{t('registerSeizure')}</Text>
        </TouchableOpacity>

        {seizures.length === 0 ? (
          <View style={s.emptyBox}>
            <Ionicons name="pulse" size={44} color={colors.textLight} />
            <Text style={s.emptyText}>{t('noSeizures')}</Text>
          </View>
        ) : (
          seizures.map(sz => (
            <View key={sz.id} style={s.seizureCard} testID={`seizure-card-${sz.id}`}>
              <View style={[s.sevBar, { backgroundColor: sevColor(sz.severity) }]} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={s.seizureDate}>{formatDate(sz.date)}</Text>
                  <View style={[s.sevBadge, { backgroundColor: sevColor(sz.severity) + '20' }]}>
                    <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: sevColor(sz.severity) }}>{sevLabel(sz.severity)}</Text>
                  </View>
                </View>
                {!!sz.duration_minutes && <Text style={s.seizureDetail}><Ionicons name="time-outline" size={13} /> {sz.duration_minutes} min</Text>}
                {!!sz.trigger && <Text style={s.seizureDetail}><Ionicons name="flash-outline" size={13} /> {t('trigger')}: {sz.trigger}</Text>}
                {!!sz.notes && <Text style={s.seizureDetail}>{sz.notes}</Text>}
              </View>
              <TouchableOpacity onPress={() => handleDelete(sz.id)} style={{ padding: 6 }} testID={`delete-seizure-${sz.id}`}>
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={showForm} transparent animationType="slide" onRequestClose={() => setShowForm(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md }}>
              <Text style={s.modalTitle}>{t('registerSeizure')}</Text>
              <TouchableOpacity onPress={() => setShowForm(false)} testID="close-seizure-form"><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.fieldLabel}>{t('seizureDate')} (YYYY-MM-DD)</Text>
              <TextInput style={s.input} value={date} onChangeText={setDate} placeholder="2026-07-18" placeholderTextColor={colors.textLight} testID="seizure-date-input" />

              <Text style={s.fieldLabel}>{t('durationMinutes')}</Text>
              <TextInput style={s.input} value={duration} onChangeText={setDuration} keyboardType="numeric" placeholder="Ej: 2" placeholderTextColor={colors.textLight} testID="seizure-duration-input" />

              <Text style={s.fieldLabel}>{t('severity')}</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: Spacing.md }}>
                {SEVERITIES.map(sv => (
                  <TouchableOpacity key={sv.id} onPress={() => setSeverity(sv.id)} testID={`severity-${sv.id}`}
                    style={[s.sevChip, severity === sv.id && { backgroundColor: sv.color, borderColor: sv.color }]}>
                    <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: severity === sv.id ? '#FFF' : sv.color }}>{sevLabel(sv.id)}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.fieldLabel}>{t('trigger')} ({t('optional')})</Text>
              <TextInput style={s.input} value={trigger} onChangeText={setTrigger} placeholder={t('triggerPlaceholder')} placeholderTextColor={colors.textLight} testID="seizure-trigger-input" />

              <Text style={s.fieldLabel}>{t('notes')} ({t('optional')})</Text>
              <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} value={notes} onChangeText={setNotes} multiline placeholder={t('notesPlaceholder')} placeholderTextColor={colors.textLight} testID="seizure-notes-input" />

              <TouchableOpacity style={[s.addBtn, { opacity: saving ? 0.6 : 1 }]} onPress={handleSave} disabled={saving} testID="save-seizure-btn">
                <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                <Text style={s.addBtnText}>{saving ? '...' : t('save')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (C: any, S: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.cardBg, alignItems: 'center', justifyContent: 'center', ...S.sm },
  title: { fontSize: 20, fontFamily: Fonts.serif, fontWeight: '700', color: C.text },
  infoCard: { flexDirection: 'row', gap: 10, backgroundColor: '#E7EEF9', borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: FontSizes.sm, color: '#3D5A8F', lineHeight: 19 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statBox: { flex: 1, backgroundColor: C.cardBg, borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: 'center', ...S.sm },
  statValue: { fontSize: 24, fontWeight: '800', color: C.text },
  statLabel: { fontSize: FontSizes.xs, color: C.textSecondary, marginTop: 2, textAlign: 'center' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#4A7DDA', borderRadius: BorderRadius.full, paddingVertical: 14, marginBottom: Spacing.md },
  addBtnText: { fontSize: FontSizes.md, fontWeight: '700', color: '#FFF' },
  emptyBox: { alignItems: 'center', padding: Spacing.xl, gap: 10 },
  emptyText: { fontSize: FontSizes.md, color: C.textSecondary, textAlign: 'center' },
  seizureCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.cardBg, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, ...S.sm },
  sevBar: { width: 4, alignSelf: 'stretch', borderRadius: 2 },
  seizureDate: { fontSize: FontSizes.md, fontWeight: '700', color: C.text },
  seizureDetail: { fontSize: FontSizes.sm, color: C.textSecondary, marginTop: 3 },
  sevBadge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 999 },
  sevChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 999, borderWidth: 1.5, borderColor: C.grayLight, backgroundColor: C.cardBg },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(10,20,16,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: C.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: Spacing.lg, maxHeight: '88%' },
  modalTitle: { fontSize: 19, fontFamily: Fonts.serif, fontWeight: '700', color: C.text },
  fieldLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: C.textSecondary, marginBottom: 6 },
  input: { backgroundColor: C.cardBg, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: C.grayLight, padding: Spacing.md, fontSize: FontSizes.md, color: C.text, marginBottom: Spacing.md },
});
