import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, 
  RefreshControl, Modal, TextInput, Image, Platform, Share, Switch, KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Linking from 'expo-linking';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, Language } from '../../contexts/LanguageContext';
import { SecureStore } from '../../utils/secureStore';
import { Card, Button } from '../../components/ui';
import { Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { BiometricAuth } from '../../utils/biometricAuth';

import { BACKEND_URL } from '../../config/backend';

interface GamificationData {
  bones: number; xp: number; level: number; level_progress: number; level_target: number;
  streak_days: number; exercises_completed: number; practice_minutes: number;
  achievements_unlocked: string[]; last_activity: string | null;
}
interface Achievement { id: string; name: string; description: string; icon: string; bones_reward: number; unlocked: boolean; }
interface Friend { id: string; name: string; status: string; created_at: string; }
import notificationService, { NotificationPrefs, DEFAULT_PREFS } from '../../services/NotificationService';

interface ClinicalFile {
  country: string; vet_name: string; vet_phone: string; allergies: string;
  chronic_conditions: string; current_medication: string; blood_type: string; neutered: boolean; insurance: string;
}
interface UserSettings {
  notifications_enabled: boolean; daily_reminder: boolean; health_alerts: boolean;
  achievement_alerts: boolean; pack_alerts: boolean; weight_unit: string; temperature_unit: string;
}

export default function PerfilScreen() {
  const router = useRouter();
  const { currentDog, user, logout, dogs, refreshDogs, setCurrentDog } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { colors, shadows, isDark, toggleTheme } = useTheme();
  const PLACEHOLDER_COLORS = [colors.primary, colors.accentOrange, colors.accentPurple, '#4ECDC4', '#FF6B6B'];
  const [refreshing, setRefreshing] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showClinicalModal, setShowClinicalModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [dogImage, setDogImage] = useState<string | null>(null);
  
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editAgeUnit, setEditAgeUnit] = useState<'months' | 'years'>('months');
  const [editWeight, setEditWeight] = useState('');
  const [editBreed, setEditBreed] = useState('');
  const [editChip, setEditChip] = useState('');
  const [editPetType, setEditPetType] = useState('dog');
  const [editSex, setEditSex] = useState('');
  const [editNeutered, setEditNeutered] = useState(false);
  const [editAllergies, setEditAllergies] = useState('');
  const [saving, setSaving] = useState(false);
  const [gamification, setGamification] = useState<GamificationData | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [inviteName, setInviteName] = useState('');
  const [medicalEvents, setMedicalEvents] = useState<any[]>([]);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  
  const [clinical, setClinical] = useState<ClinicalFile>({
    country: '', vet_name: '', vet_phone: '', allergies: '',
    chronic_conditions: '', current_medication: '', blood_type: '', neutered: false, insurance: ''
  });
  const [settings, setSettings] = useState<UserSettings>({
    notifications_enabled: true, daily_reminder: true, health_alerts: true,
    achievement_alerts: true, pack_alerts: true, weight_unit: 'kg', temperature_unit: 'celsius'
  });

  useEffect(() => { loadDogImage(); loadAll(); loadBiometricStatus(); loadNotifPrefs(); }, []);
  useEffect(() => {
    if (currentDog) {
      setEditName(currentDog.name || '');
      const ageMonths = currentDog.age || 0;
      if (ageMonths >= 12) {
        setEditAge(Math.floor(ageMonths / 12).toString());
        setEditAgeUnit('years');
      } else {
        setEditAge(ageMonths.toString());
        setEditAgeUnit('months');
      }
      setEditWeight(currentDog.weight?.toString() || ''); setEditBreed(currentDog.breed || '');
      setEditChip(currentDog.chip_id || '');
      setEditPetType((currentDog as any).pet_type || 'dog');
      setEditSex((currentDog as any).sex || '');
      setEditNeutered((currentDog as any).neutered || false);
      setEditAllergies((currentDog as any).allergies || '');
    }
  }, [currentDog]);

  const getHeaders = async () => {
    const token = await SecureStore.getItemAsync('session_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadAll = async () => {
    const headers = await getHeaders();
    if (!headers.Authorization) return;
    try {
      const promises: Promise<any>[] = [
        axios.get(`${BACKEND_URL}/api/gamification/stats`, { headers }).catch(() => ({ data: null })),
        axios.get(`${BACKEND_URL}/api/gamification/achievements`, { headers }).catch(() => ({ data: { achievements: [] } })),
        axios.get(`${BACKEND_URL}/api/pack/friends`, { headers }).catch(() => ({ data: { friends: [] } })),
        axios.get(`${BACKEND_URL}/api/users/settings`, { headers }).catch(() => ({ data: settings })),
      ];
      if (currentDog?.id) {
        promises.push(
          axios.get(`${BACKEND_URL}/api/dogs/${currentDog.id}/clinical`, { headers }).catch(() => ({ data: null })),
          axios.get(`${BACKEND_URL}/api/medical-events/${currentDog.id}`, { headers }).catch(() => ({ data: [] })),
        );
      }
      const results = await Promise.all(promises);
      if (results[0].data) setGamification(results[0].data);
      setAchievements(results[1].data?.achievements || []);
      setFriends(results[2].data?.friends || []);
      setSettings(results[3].data);
      if (currentDog?.id) {
        if (results[4]?.data) setClinical(prev => ({ ...prev, ...results[4].data }));
        setMedicalEvents(results[5]?.data || []);
      }
    } catch (error) { console.log('Error loading profile data:', error); }
  };

  const loadDogImage = async () => {
    if (currentDog?.id) {
      const saved = await SecureStore.getItemAsync(`dog_image_${currentDog.id}`);
      if (saved) setDogImage(saved);
    }
  };

  const loadBiometricStatus = async () => {
    const { available, biometricType: bType } = await BiometricAuth.isAvailable();
    setBiometricAvailable(available);
    setBiometricType(bType);
    if (available) {
      const enabled = await BiometricAuth.isEnabled();
      setBiometricEnabled(enabled);
    }
  };

  const loadNotifPrefs = async () => {
    try {
      const prefs = await notificationService.getPrefs();
      setNotifPrefs(prefs);
    } catch (e) { console.log('Error loading notif prefs:', e); }
  };

  const handleNotifToggle = async (key: keyof NotificationPrefs, value: boolean) => {
    const newPrefs = { ...notifPrefs, [key]: value };
    setNotifPrefs(newPrefs);
    await notificationService.init();
    await notificationService.savePrefs(newPrefs);
  };


  const toggleBiometric = async () => {
    if (biometricEnabled) {
      await BiometricAuth.disable();
      setBiometricEnabled(false);
      Alert.alert(biometricType, `${biometricType} desactivado`);
    } else {
      const success = await BiometricAuth.authenticate(`Confirma ${biometricType}`);
      if (success) {
        const creds = await BiometricAuth.getCredentials();
        if (creds) {
          await BiometricAuth.enable();
          setBiometricEnabled(true);
          Alert.alert(biometricType, `${biometricType} activado correctamente`);
        } else {
          Alert.alert(biometricType, 'Inicia sesión primero con email y contraseña para activar la biometría');
        }
      }
    }
  };


  const onRefresh = async () => { setRefreshing(true); await Promise.all([refreshDogs(), loadAll()]); setRefreshing(false); };

  const handleLogout = () => {
    Alert.alert(t('logout'), t('logoutConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('logout'), style: 'destructive', onPress: async () => { await logout(); router.replace('/onboarding/idioma'); } },
    ]);
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permiso requerido'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: false, quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      try {
        const asset = result.assets[0];
        const w = asset.width || 800;
        const h = asset.height || 800;
        const size = Math.min(w, h);
        const originX = Math.floor((w - size) / 2);
        const originY = Math.floor((h - size) / 2);
        const manipulated = await ImageManipulator.manipulateAsync(
          asset.uri,
          [
            { crop: { originX, originY, width: size, height: size } },
            { resize: { width: 400 } },
          ],
          { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );
        if (manipulated.base64) {
          const base64Image = `data:image/jpeg;base64,${manipulated.base64}`;
          setDogImage(base64Image);
          if (currentDog?.id) await SecureStore.setItemAsync(`dog_image_${currentDog.id}`, base64Image);
        }
      } catch (e) {
        console.log('Image crop error:', e);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!currentDog) return;
    setSaving(true);
    try {
      const headers = await getHeaders();
      const ageInMonths = editAgeUnit === 'years' ? (parseInt(editAge) || 0) * 12 : parseInt(editAge) || 0;
      await axios.put(`${BACKEND_URL}/api/dogs/${currentDog.id}`, {
        name: editName, age: ageInMonths, weight: parseFloat(editWeight) || 0,
        breed: editBreed, chip_id: editChip, pet_type: editPetType, sex: editSex,
        neutered: editNeutered, allergies: editAllergies,
      }, { headers });
      setCurrentDog({ ...currentDog, name: editName, age: ageInMonths, weight: parseFloat(editWeight) || 0, breed: editBreed, chip_id: editChip, pet_type: editPetType as any, sex: editSex as any, neutered: editNeutered as any, allergies: editAllergies as any });
      await refreshDogs();
      setShowEditModal(false);
    } catch (error) { Alert.alert('Error', 'No se pudo guardar'); }
    finally { setSaving(false); }
  };

  const handleSaveClinical = async () => {
    if (!currentDog) return;
    setSaving(true);
    try {
      const headers = await getHeaders();
      await axios.put(`${BACKEND_URL}/api/dogs/${currentDog.id}/clinical`, clinical, { headers });
      setShowClinicalModal(false);
    } catch (error) { Alert.alert('Error', 'No se pudo guardar la ficha clínica'); }
    finally { setSaving(false); }
  };

  const handleSaveSettings = async (newSettings: UserSettings) => {
    setSettings(newSettings);
    try {
      const headers = await getHeaders();
      await axios.put(`${BACKEND_URL}/api/users/settings`, newSettings, { headers });
    } catch (error) { console.log('Error saving settings:', error); }
  };

  const handleInvite = async () => {
    const appLink = 'https://heimdall-hani.app/download';
    const shareMessage = language === 'en' 
      ? `Join me on Heimdall! The best app to take care of your pet. Download now:\n${appLink}`
      : language === 'it' 
      ? `Unisciti a me su Heimdall! La migliore app per prenderti cura del tuo animale. Scarica ora:\n${appLink}`
      : `Unete a mi en Heimdall! La mejor app para cuidar a tu mascota. Descargala ya:\n${appLink}`;
    
    try {
      await Share.share({ message: shareMessage, url: appLink, title: 'Heimdall - Tu guardian' });
      // Save invite
      if (inviteName.trim()) {
        const headers = await getHeaders();
        const res = await axios.post(`${BACKEND_URL}/api/pack/invite`, { invited_name: inviteName.trim() }, { headers });
        setFriends(prev => [...prev, { id: res.data.id || Date.now().toString(), name: inviteName.trim(), status: 'pending', created_at: new Date().toISOString() }]);
        setInviteName('');
        setShowInviteModal(false);
        Alert.alert('🦴 +5', t('inviteSent'));
        await loadAll();
      }
    } catch (e) { console.log('Share error:', e); }
  };

  const changeLanguage = async (newLang: Language) => { await setLanguage(newLang); setShowLanguageModal(false); notificationService.init().then(() => notificationService.scheduleAll()); };
  const formatAge = (months: number) => {
    const y = Math.floor(months / 12); const m = months % 12;
    if (y === 0) return `${m} ${t('months')}`; if (m === 0) return `${y} ${t('years')}`;
    return `${y} ${t('years')} ${t('and')} ${m} ${t('months')}`;
  };
  const getLanguageFlag = (lang: Language) => ({ es: '🇪🇸', en: '🇬🇧', it: '🇮🇹' }[lang]);

  const menuItems = [
    { id: 'theme', icon: isDark ? 'sunny-outline' : 'moon-outline', label: t('appearance'), onPress: toggleTheme, showValue: isDark ? t('darkMode') : t('lightMode') },
    ...(biometricAvailable ? [{
      id: 'biometric',
      icon: 'finger-print-outline' as const,
      label: biometricType || 'Biometric',
      onPress: toggleBiometric,
      showValue: biometricEnabled ? 'Activado' : 'Desactivado',
    }] : []),
    { id: 'settings', icon: 'settings-outline', label: t('settings'), onPress: () => setShowSettingsModal(true) },
    { id: 'notifications', icon: 'notifications-outline', label: t('notifications'), onPress: () => setShowNotificationsModal(true) },
    { id: 'privacy', icon: 'shield-outline', label: t('privacy'), onPress: () => router.push('/privacidad') },
    { id: 'help', icon: 'help-circle-outline', label: t('help'), onPress: () => router.push('/ayuda') },
    { id: 'language', icon: 'language-outline', label: t('language'), onPress: () => setShowLanguageModal(true), showValue: language.toUpperCase() },
    { id: 'logout', icon: 'log-out-outline', label: t('logout'), onPress: handleLogout, danger: true },
  ];

  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
        <View style={styles.header}><Text style={styles.title}>{t('profile')}</Text></View>

        {/* Dog Profile Card */}
        <Card style={styles.profileCard} variant="elevated">
          <View style={styles.profileHeader}>
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} data-testid="dog-photo-btn">
              {dogImage ? <Image source={{ uri: dogImage }} style={styles.avatarImage} /> : (
                <View style={styles.avatar}><Ionicons name="paw" size={40} color={colors.white} /></View>
              )}
              <View style={styles.cameraButton}><Ionicons name="camera" size={16} color={colors.white} /></View>
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              <Text style={styles.dogName}>{currentDog?.name || 'Tu perro'}</Text>
              <Text style={styles.ownerName}>de {user?.name}</Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={() => setShowEditModal(true)} data-testid="edit-profile-btn">
              <Ionicons name="create-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}><Text style={styles.statValue}>{currentDog?.age ? formatAge(currentDog.age) : '--'}</Text><Text style={styles.statLabel}>{t('age')}</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}><Text style={styles.statValue}>{currentDog?.weight || '--'} kg</Text><Text style={styles.statLabel}>{t('weight')}</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}><Text style={styles.statValue}>{currentDog?.breed || 'Mixto'}</Text><Text style={styles.statLabel}>{t('breed')}</Text></View>
          </View>
          {currentDog?.chip_id && (
            <View style={styles.chipContainer}><Ionicons name="hardware-chip" size={18} color={colors.primary} /><Text style={styles.chipText}>{t('chip')}: {currentDog.chip_id}</Text></View>
          )}
        </Card>

        {/* Gamification */}
        <View style={styles.section} data-testid="gamification-section">
          <Text style={styles.sectionTitle}>{t('myRewards')}</Text>
          <Card variant="elevated" style={{ marginBottom: 0 }}>
            <View style={styles.gamLevelRow}>
              <View style={styles.gamLevelIcon}><Ionicons name="shield-checkmark" size={28} color={colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.gamLevelText}>{t('level')} {gamification?.level || 1}</Text>
                <View style={styles.gamProgressTrack}><View style={[styles.gamProgressFill, { width: `${gamification ? (gamification.level_progress / gamification.level_target) * 100 : 0}%` }]} /></View>
                <Text style={styles.gamProgressLabel}>{gamification?.level_progress || 0}/{gamification?.level_target || 500} XP</Text>
              </View>
            </View>
            <View style={styles.gamStatsGrid}>
              <View style={styles.gamStatItem}><Text style={{ fontSize: 22 }}>🦴</Text><Text style={styles.gamStatValue}>{gamification?.bones || 0}</Text><Text style={styles.gamStatLabel}>{t('bones')}</Text></View>
              <View style={styles.gamStatDivider} />
              <View style={styles.gamStatItem}><Ionicons name="flame" size={22} color={colors.accentOrange} /><Text style={styles.gamStatValue}>{gamification?.streak_days || 0}</Text><Text style={styles.gamStatLabel}>{t('streak')}</Text></View>
              <View style={styles.gamStatDivider} />
              <View style={styles.gamStatItem}><Ionicons name="school" size={22} color={colors.accentPurple} /><Text style={styles.gamStatValue}>{gamification?.exercises_completed || 0}</Text><Text style={styles.gamStatLabel}>{t('lessons')}</Text></View>
            </View>
          </Card>
        </View>

        {/* Achievements */}
        <View style={styles.section} data-testid="achievements-section">
          <Text style={styles.sectionTitle}>{t('achievements')}</Text>
          <Card variant="elevated">
            <View style={styles.achGrid}>
              {achievements.map((ach) => (
                <View key={ach.id} style={[styles.achItem, !ach.unlocked && styles.achItemLocked]}>
                  <View style={[styles.achIconCircle, ach.unlocked ? { backgroundColor: colors.primary } : { backgroundColor: colors.grayLight }]}>
                    <Ionicons name={ach.icon as any} size={22} color={ach.unlocked ? colors.white : colors.gray} />
                  </View>
                  <Text style={[styles.achName, !ach.unlocked && { color: colors.gray }]} numberOfLines={2}>{ach.name}</Text>
                  <Text style={styles.achBones}>+{ach.bones_reward} 🦴</Text>
                </View>
              ))}
            </View>
            {achievements.length === 0 && <Text style={styles.emptyText}>{t('noAchievements')}</Text>}
          </Card>
        </View>

        {/* Pack Section */}
        <View style={styles.section} data-testid="pack-section">
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('myPack')}</Text>
            <TouchableOpacity style={styles.inviteBtn} onPress={() => setShowInviteModal(true)} data-testid="invite-btn">
              <Ionicons name="person-add" size={16} color={colors.white} />
              <Text style={styles.inviteBtnText}>{t('invite')}</Text>
            </TouchableOpacity>
          </View>
          <Card variant="elevated">
            {/* Owner */}
            <View style={styles.packMember}>
              <View style={[styles.memberAvatar, { backgroundColor: colors.primary }]}><Ionicons name="person" size={20} color={colors.white} /></View>
              <View style={styles.memberInfo}><Text style={styles.memberName}>{user?.name}</Text><Text style={styles.memberRole}>{t('mainOwner')}</Text></View>
              <View style={styles.ownerBadge}><Ionicons name="star" size={14} color={colors.accent} /></View>
            </View>
            
            {/* Friends */}
            {friends.map((f, i) => (
              <View key={f.id} style={[styles.packMember, { marginTop: Spacing.sm }]}>
                <View style={[styles.memberAvatar, { backgroundColor: PLACEHOLDER_COLORS[(i + 1) % 5] }]}>
                  <Text style={{ color: colors.white, fontWeight: '700', fontSize: 16 }}>{f.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{f.name}</Text>
                  <Text style={[styles.memberRole, f.status === 'pending' && { color: colors.accentOrange }]}>
                    {f.status === 'pending' ? (language === 'en' ? 'Pending' : language === 'it' ? 'In attesa' : 'Pendiente') : (language === 'en' ? 'Member' : language === 'it' ? 'Membro' : 'Miembro')}
                  </Text>
                </View>
              </View>
            ))}
            
            {/* Empty friend slots */}
            {Array.from({ length: Math.max(0, 3 - friends.length) }).map((_, i) => (
              <TouchableOpacity key={`empty-${i}`} style={[styles.packMember, { marginTop: Spacing.sm }]} onPress={() => setShowInviteModal(true)}>
                <View style={[styles.memberAvatar, { backgroundColor: colors.grayLight, borderWidth: 2, borderColor: colors.gray, borderStyle: 'dashed' }]}>
                  <Ionicons name="add" size={20} color={colors.gray} />
                </View>
                <View style={styles.memberInfo}>
                  <Text style={[styles.memberName, { color: colors.gray }]}>{language === 'en' ? 'Invite a friend' : language === 'it' ? 'Invita un amico' : 'Invita a un amigo'}</Text>
                  <Text style={styles.memberRole}>+5 🦴</Text>
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        </View>

        {/* Clinical File */}
        <View style={styles.section} data-testid="clinical-section">
          <Text style={styles.sectionTitle}>{t('clinicalFile')}</Text>
          <Card variant="elevated">
            <View style={styles.clinicalRow}><Ionicons name="location-outline" size={20} color={colors.textSecondary} /><Text style={styles.clinicalLabel}>{t('country')}</Text><Text style={styles.clinicalValue}>{clinical.country || '--'}</Text></View>
            <View style={styles.clinicalRow}><Ionicons name="medkit-outline" size={20} color={colors.textSecondary} /><Text style={styles.clinicalLabel}>{t('vet')}</Text><Text style={styles.clinicalValue}>{clinical.vet_name || t('notAssigned')}</Text></View>
            <View style={styles.clinicalRow}><Ionicons name="alert-circle-outline" size={20} color={colors.textSecondary} /><Text style={styles.clinicalLabel}>{t('allergies')}</Text><Text style={styles.clinicalValue}>{clinical.allergies || t('noneRegistered')}</Text></View>
            <View style={styles.clinicalRow}><Ionicons name="fitness-outline" size={20} color={colors.textSecondary} /><Text style={styles.clinicalLabel}>{language === 'en' ? 'Neutered' : language === 'it' ? 'Sterilizzato' : 'Esterilizado'}</Text><Text style={styles.clinicalValue}>{clinical.neutered ? (language === 'en' ? 'Yes' : 'Sí') : 'No'}</Text></View>
            <View style={styles.clinicalRow}><Ionicons name="medical-outline" size={20} color={colors.textSecondary} /><Text style={styles.clinicalLabel}>{language === 'en' ? 'Medication' : language === 'it' ? 'Farmaci' : 'Medicación'}</Text><Text style={styles.clinicalValue}>{clinical.current_medication || '--'}</Text></View>
            <TouchableOpacity style={styles.clinicalEdit} onPress={() => setShowClinicalModal(true)} data-testid="edit-clinical-btn">
              <Text style={styles.clinicalEditText}>{t('editClinicalFile')}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.primary} />
            </TouchableOpacity>
          </Card>

          {/* Medical Events Preview */}
          {medicalEvents.length > 0 && (
            <View style={{ marginTop: Spacing.md }} data-testid="medical-events-preview">
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm }}>
                <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: colors.text }}>
                  {language === 'en' ? 'Medical History' : language === 'it' ? 'Storia medica' : 'Historial Médico'} ({medicalEvents.length})
                </Text>
                <TouchableOpacity onPress={() => router.push('/historial-medico')} data-testid="view-all-medical-btn">
                  <Text style={{ fontSize: FontSizes.xs, color: colors.primary, fontWeight: '600' }}>
                    {language === 'en' ? 'View all' : language === 'it' ? 'Vedi tutto' : 'Ver todo'}
                  </Text>
                </TouchableOpacity>
              </View>
              {medicalEvents.slice(0, 5).map((ev: any, idx: number) => {
                const typeConfig: Record<string, { icon: string; color: string }> = {
                  vaccine: { icon: 'medical', color: colors.success },
                  checkup: { icon: 'clipboard', color: colors.info },
                  deworming: { icon: 'bug', color: colors.warning },
                  medication: { icon: 'medkit', color: '#9b59b6' },
                  note: { icon: 'document-text', color: colors.gray },
                };
                const cfg = typeConfig[ev.type] || typeConfig.note;
                const dateStr = (() => { try { return new Date(ev.date || ev.event_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return '--'; } })();
                return (
                  <Card key={ev.id || idx} style={{ marginBottom: Spacing.xs, padding: Spacing.sm }} data-testid={`medical-event-${idx}`}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: cfg.color + '20', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name={cfg.icon as any} size={18} color={cfg.color} />
                      </View>
                      <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                        <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: colors.text }}>{ev.title}</Text>
                        <Text style={{ fontSize: FontSizes.xs, color: colors.textSecondary }}>{dateStr}</Text>
                      </View>
                    </View>
                    {ev.description ? <Text style={{ fontSize: FontSizes.xs, color: colors.textSecondary, marginTop: 4, marginLeft: 48 }}>{ev.description}</Text> : null}
                  </Card>
                );
              })}
            </View>
          )}
        </View>

        {/* PRO Card - Removed */}

        {/* Menu */}
        <View style={styles.section}>
          <Card variant="elevated">
            {menuItems.map((item, index) => (
              <TouchableOpacity key={item.id} style={[styles.menuItem, index < menuItems.length - 1 && styles.menuItemBorder]} onPress={item.onPress} data-testid={`menu-${item.id}`}>
                <Ionicons name={item.icon as any} size={22} color={item.danger ? colors.error : colors.text} />
                <Text style={[styles.menuItemText, item.danger && { color: colors.error }]}>{item.label}</Text>
                {item.showValue && <Text style={styles.menuItemValue}>{getLanguageFlag(language)} {item.showValue}</Text>}
                <Ionicons name="chevron-forward" size={20} color={colors.gray} />
              </TouchableOpacity>
            ))}
          </Card>
        </View>

        <Text style={styles.version}>Heimdall v1.0.0</Text>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Language Modal */}
      <Modal visible={showLanguageModal} transparent animationType="slide" onRequestClose={() => setShowLanguageModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>{t('selectLanguage')}</Text><TouchableOpacity onPress={() => setShowLanguageModal(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity></View>
          {(['es', 'en', 'it'] as Language[]).map(lang => (
            <TouchableOpacity key={lang} style={[styles.langOption, language === lang && styles.langOptionActive]} onPress={() => changeLanguage(lang)}>
              <Text style={{ fontSize: 28, marginRight: Spacing.md }}>{getLanguageFlag(lang)}</Text>
              <Text style={{ flex: 1, fontSize: FontSizes.lg, fontWeight: '600', color: colors.text }}>{lang === 'es' ? t('spanish') : lang === 'en' ? t('english') : t('italian')}</Text>
              {language === lang && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
            </TouchableOpacity>
          ))}
        </View></View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={() => setShowEditModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}>
        <View style={styles.modalOverlay}><View style={[styles.modalContent, { maxHeight: '80%' }]}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>{t('editDogProfile')}</Text><TouchableOpacity onPress={() => setShowEditModal(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity></View>
          <ScrollView style={{ maxHeight: 450 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <TouchableOpacity style={{ alignSelf: 'center', marginBottom: Spacing.md }} onPress={pickImage}>
              {dogImage ? <Image source={{ uri: dogImage }} style={{ width: 90, height: 90, borderRadius: 45 }} /> : <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="paw" size={36} color={colors.white} /></View>}
            </TouchableOpacity>
            <View style={styles.inputGroup}><Text style={styles.inputLabel}>{t('dogName')}</Text><TextInput style={styles.input} value={editName} onChangeText={setEditName} /></View>
            <View style={{ flexDirection: 'row', gap: Spacing.md }}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>{t('dogAge')}</Text>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <TextInput style={[styles.input, { flex: 1 }]} value={editAge} onChangeText={setEditAge} keyboardType="numeric" />
                  <View style={{ flexDirection: 'row', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
                    <TouchableOpacity
                      style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: editAgeUnit === 'months' ? colors.primary : 'transparent' }}
                      onPress={() => {
                        if (editAgeUnit === 'years') {
                          const years = parseInt(editAge) || 0;
                          setEditAge((years * 12).toString());
                          setEditAgeUnit('months');
                        }
                      }}
                      data-testid="edit-age-unit-months"
                    >
                      <Text style={{ color: editAgeUnit === 'months' ? '#fff' : colors.text, fontWeight: '600', fontSize: 12 }}>{language === 'en' ? 'Months' : language === 'it' ? 'Mesi' : 'Meses'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: editAgeUnit === 'years' ? colors.primary : 'transparent' }}
                      onPress={() => {
                        if (editAgeUnit === 'months') {
                          const months = parseInt(editAge) || 0;
                          setEditAge(Math.floor(months / 12).toString());
                          setEditAgeUnit('years');
                        }
                      }}
                      data-testid="edit-age-unit-years"
                    >
                      <Text style={{ color: editAgeUnit === 'years' ? '#fff' : colors.text, fontWeight: '600', fontSize: 12 }}>{language === 'en' ? 'Years' : language === 'it' ? 'Anni' : 'Años'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.inputLabel}>{t('dogWeight')}</Text><TextInput style={styles.input} value={editWeight} onChangeText={setEditWeight} keyboardType="decimal-pad" /></View>
            </View>
            <View style={styles.inputGroup}><Text style={styles.inputLabel}>{t('dogBreed')}</Text><TextInput style={styles.input} value={editBreed} onChangeText={setEditBreed} /></View>
            <View style={styles.inputGroup}><Text style={styles.inputLabel}>{t('chipId')}</Text><TextInput style={styles.input} value={editChip} onChangeText={setEditChip} /></View>
            {/* Pet Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{language === 'en' ? 'Pet type' : language === 'it' ? 'Tipo animale' : 'Tipo de mascota'}</Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { value: 'dog', label: language === 'en' ? 'Dog' : language === 'it' ? 'Cane' : 'Perro', icon: '🐕' },
                  { value: 'cat', label: language === 'en' ? 'Cat' : language === 'it' ? 'Gatto' : 'Gato', icon: '🐈' },
                  { value: 'rodent', label: language === 'en' ? 'Rodent' : language === 'it' ? 'Roditore' : 'Roedor', icon: '🐹' },
                  { value: 'bird', label: language === 'en' ? 'Bird' : language === 'it' ? 'Uccello' : 'Pájaro', icon: '🐦' },
                ].map(opt => (
                  <TouchableOpacity key={opt.value} data-testid={`pet-type-${opt.value}`}
                    style={[styles.unitBtn, editPetType === opt.value && styles.unitBtnActive]}
                    onPress={() => setEditPetType(opt.value)}>
                    <Text style={[styles.unitBtnText, editPetType === opt.value && { color: colors.white }]}>{opt.icon} {opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {/* Sex */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{language === 'en' ? 'Sex' : language === 'it' ? 'Sesso' : 'Sexo'}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  { value: 'male', label: language === 'en' ? 'Male' : language === 'it' ? 'Maschio' : 'Macho' },
                  { value: 'female', label: language === 'en' ? 'Female' : language === 'it' ? 'Femmina' : 'Hembra' },
                ].map(opt => (
                  <TouchableOpacity key={opt.value} data-testid={`pet-sex-${opt.value}`}
                    style={[styles.unitBtn, editSex === opt.value && styles.unitBtnActive]}
                    onPress={() => setEditSex(opt.value)}>
                    <Text style={[styles.unitBtnText, editSex === opt.value && { color: colors.white }]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {/* Neutered */}
            <View style={[styles.inputGroup, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
              <Text style={styles.inputLabel}>{language === 'en' ? 'Neutered/Spayed' : language === 'it' ? 'Sterilizzato/a' : 'Esterilizado/a'}</Text>
              <Switch value={editNeutered} onValueChange={setEditNeutered} trackColor={{ true: colors.primary }} data-testid="pet-neutered-switch" />
            </View>
            {/* Allergies */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{language === 'en' ? 'Allergies' : language === 'it' ? 'Allergie' : 'Alergias'}</Text>
              <TextInput style={[styles.input, { minHeight: 60 }]} value={editAllergies} onChangeText={setEditAllergies} multiline
                placeholder={language === 'en' ? 'None known' : language === 'it' ? 'Nessuna nota' : 'Ninguna conocida'} placeholderTextColor={colors.gray}
                data-testid="pet-allergies-input" />
            </View>
          </ScrollView>
          <Button title={saving ? '...' : t('save')} onPress={handleSaveProfile} loading={saving} disabled={saving} style={{ marginTop: Spacing.md }} />
        </View></View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Clinical File Modal */}
      <Modal visible={showClinicalModal} transparent animationType="slide" onRequestClose={() => setShowClinicalModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}>
        <View style={styles.modalOverlay}><View style={[styles.modalContent, { maxHeight: '85%' }]}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>{t('clinicalFile')}</Text><TouchableOpacity onPress={() => setShowClinicalModal(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity></View>
          <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.inputGroup}><Text style={styles.inputLabel}>{t('country')}</Text><TextInput style={styles.input} value={clinical.country} onChangeText={v => setClinical(p => ({ ...p, country: v }))} placeholder="España" placeholderTextColor={colors.gray} /></View>
            <View style={styles.inputGroup}><Text style={styles.inputLabel}>{t('vet')}</Text><TextInput style={styles.input} value={clinical.vet_name} onChangeText={v => setClinical(p => ({ ...p, vet_name: v }))} placeholder="Dr. García" placeholderTextColor={colors.gray} /></View>
            <View style={styles.inputGroup}><Text style={styles.inputLabel}>{language === 'en' ? 'Vet phone' : 'Teléfono vet'}</Text><TextInput style={styles.input} value={clinical.vet_phone} onChangeText={v => setClinical(p => ({ ...p, vet_phone: v }))} keyboardType="phone-pad" placeholder="+34..." placeholderTextColor={colors.gray} /></View>
            <View style={styles.inputGroup}><Text style={styles.inputLabel}>{t('allergies')}</Text><TextInput style={[styles.input, { minHeight: 60 }]} value={clinical.allergies} onChangeText={v => setClinical(p => ({ ...p, allergies: v }))} multiline placeholder={language === 'en' ? 'None known' : 'Ninguna conocida'} placeholderTextColor={colors.gray} /></View>
            <View style={styles.inputGroup}><Text style={styles.inputLabel}>{language === 'en' ? 'Chronic conditions' : 'Enfermedades crónicas'}</Text><TextInput style={[styles.input, { minHeight: 60 }]} value={clinical.chronic_conditions} onChangeText={v => setClinical(p => ({ ...p, chronic_conditions: v }))} multiline placeholderTextColor={colors.gray} /></View>
            <View style={styles.inputGroup}><Text style={styles.inputLabel}>{language === 'en' ? 'Current medication' : 'Medicación actual'}</Text><TextInput style={[styles.input, { minHeight: 60 }]} value={clinical.current_medication} onChangeText={v => setClinical(p => ({ ...p, current_medication: v }))} multiline placeholderTextColor={colors.gray} /></View>
            <View style={styles.inputGroup}><Text style={styles.inputLabel}>{language === 'en' ? 'Insurance' : 'Seguro'}</Text><TextInput style={styles.input} value={clinical.insurance} onChangeText={v => setClinical(p => ({ ...p, insurance: v }))} placeholderTextColor={colors.gray} /></View>
            <View style={[styles.inputGroup, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
              <Text style={styles.inputLabel}>{language === 'en' ? 'Neutered/Spayed' : 'Esterilizado/a'}</Text>
              <Switch value={clinical.neutered} onValueChange={v => setClinical(p => ({ ...p, neutered: v }))} trackColor={{ true: colors.primary }} />
            </View>
          </ScrollView>
          <Button title={saving ? '...' : t('save')} onPress={handleSaveClinical} loading={saving} disabled={saving} style={{ marginTop: Spacing.md }} />
        </View></View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={showSettingsModal} transparent animationType="slide" onRequestClose={() => setShowSettingsModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>{t('settings')}</Text><TouchableOpacity onPress={() => setShowSettingsModal(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity></View>
          <View style={styles.settingRow}><Text style={styles.settingLabel}>{language === 'en' ? 'Weight unit' : 'Unidad de peso'}</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {['kg', 'lb'].map(u => (
                <TouchableOpacity key={u} style={[styles.unitBtn, settings.weight_unit === u && styles.unitBtnActive]} onPress={() => handleSaveSettings({ ...settings, weight_unit: u })}>
                  <Text style={[styles.unitBtnText, settings.weight_unit === u && { color: colors.white }]}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.settingRow}><Text style={styles.settingLabel}>{language === 'en' ? 'Temperature' : 'Temperatura'}</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {['celsius', 'fahrenheit'].map(u => (
                <TouchableOpacity key={u} style={[styles.unitBtn, settings.temperature_unit === u && styles.unitBtnActive]} onPress={() => handleSaveSettings({ ...settings, temperature_unit: u })}>
                  <Text style={[styles.unitBtnText, settings.temperature_unit === u && { color: colors.white }]}>{u === 'celsius' ? '°C' : '°F'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.settingRow}><Text style={styles.settingLabel}>{t('language')}</Text>
            <TouchableOpacity onPress={() => { setShowSettingsModal(false); setShowLanguageModal(true); }}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>{getLanguageFlag(language)} {language.toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
        </View></View>
      </Modal>

      {/* Notifications Modal */}
      <Modal visible={showNotificationsModal} transparent animationType="slide" onRequestClose={() => setShowNotificationsModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>{t('notifications')}</Text><TouchableOpacity onPress={() => setShowNotificationsModal(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity></View>
          <Text style={{ fontSize: FontSizes.sm, color: colors.textSecondary, marginBottom: Spacing.lg }}>
            {language === 'en' ? 'Choose which notifications you want to receive to motivate you every day.' : language === 'it' ? 'Scegli quali notifiche vuoi ricevere per motivarti ogni giorno.' : 'Elige que notificaciones quieres recibir para motivarte cada dia.'}
          </Text>
          {([
            { key: 'training_reminder' as const, icon: 'barbell', color: '#4CAF50',
              label: language === 'en' ? 'Training reminder' : language === 'it' ? 'Promemoria allenamento' : 'Recordatorio de entrenamiento',
              desc: language === 'en' ? 'Every day at 10:00' : language === 'it' ? 'Ogni giorno alle 10:00' : 'Cada dia a las 10:00' },
            { key: 'emotion_diary' as const, icon: 'journal', color: '#2196F3',
              label: language === 'en' ? 'Emotion diary' : language === 'it' ? 'Diario emozioni' : 'Diario de emociones',
              desc: language === 'en' ? 'Every day at 20:00' : language === 'it' ? 'Ogni giorno alle 20:00' : 'Cada dia a las 20:00' },
            { key: 'streak_warning' as const, icon: 'flame', color: '#FF9800',
              label: language === 'en' ? 'Streak in danger' : language === 'it' ? 'Serie in pericolo' : 'Racha en peligro',
              desc: language === 'en' ? 'Every day at 21:00' : language === 'it' ? 'Ogni giorno alle 21:00' : 'Cada dia a las 21:00' },
            { key: 'achievements' as const, icon: 'trophy', color: '#9C27B0',
              label: language === 'en' ? 'Achievements unlocked' : language === 'it' ? 'Traguardi sbloccati' : 'Logros desbloqueados',
              desc: language === 'en' ? 'When you unlock an achievement' : language === 'it' ? 'Quando sblocchi un traguardo' : 'Cuando desbloqueas un logro' },
            { key: 'miss_you' as const, icon: 'heart', color: '#FF4B4B',
              label: language === 'en' ? 'Heimdall misses you' : language === 'it' ? 'Heimdall ti manca' : 'Heimdall te echa de menos',
              desc: language === 'en' ? "If you haven't visited in days" : language === 'it' ? 'Se non entri da giorni' : 'Si llevas dias sin entrar' },
          ]).map(item => (
            <View key={item.key} style={[styles.settingRow, { paddingVertical: Spacing.md }]} data-testid={`notif-toggle-${item.key}`}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: item.color + '18', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={{ fontSize: FontSizes.xs, color: colors.textSecondary, marginTop: 1 }}>{item.desc}</Text>
                </View>
              </View>
              <Switch value={notifPrefs[item.key]} onValueChange={v => handleNotifToggle(item.key, v)} trackColor={{ true: item.color }} />
            </View>
          ))}
        </View></View>
      </Modal>

      {/* Invite Modal */}
      <Modal visible={showInviteModal} transparent animationType="slide" onRequestClose={() => setShowInviteModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>{t('invite')}</Text><TouchableOpacity onPress={() => setShowInviteModal(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity></View>
          <Text style={{ fontSize: FontSizes.md, color: colors.textSecondary, marginBottom: Spacing.lg, textAlign: 'center' }}>
            {language === 'en' ? 'Invite friends to join your pack and earn 5 bones!' : language === 'it' ? 'Invita amici e guadagna 5 ossa!' : '¡Invita a amigos a tu manada y gana 5 huesos! 🦴'}
          </Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{language === 'en' ? "Friend's name" : 'Nombre del amigo'}</Text>
            <TextInput style={styles.input} value={inviteName} onChangeText={setInviteName} placeholder="Alex" placeholderTextColor={colors.gray} />
          </View>
          <Button title={language === 'en' ? 'Share invitation' : language === 'it' ? 'Condividi invito' : 'Compartir invitación'} onPress={handleInvite} disabled={!inviteName.trim()} style={{ marginTop: Spacing.md }} />
        </View></View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (C: any, S: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.md },
  header: { marginBottom: Spacing.lg },
  title: { fontSize: FontSizes.xxl, fontWeight: '700', color: C.text },
  profileCard: { marginBottom: Spacing.lg },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  avatarContainer: { position: 'relative' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  cameraButton: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.white },
  profileInfo: { flex: 1, marginLeft: Spacing.md },
  dogName: { fontSize: FontSizes.xl, fontWeight: '700', color: C.text },
  ownerName: { fontSize: FontSizes.md, color: C.textSecondary },
  editButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.primary + '20', alignItems: 'center', justifyContent: 'center' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: Spacing.md, borderTopWidth: 1, borderTopColor: C.grayLight },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: FontSizes.md, fontWeight: '700', color: C.text, textAlign: 'center' },
  statLabel: { fontSize: FontSizes.xs, color: C.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 40, backgroundColor: C.grayLight },
  chipContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: C.grayLight },
  chipText: { fontSize: FontSizes.sm, color: C.textSecondary },
  section: { marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: C.text, marginBottom: Spacing.sm },
  gamLevelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  gamLevelIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' },
  gamLevelText: { fontSize: FontSizes.lg, fontWeight: '700', color: C.text, marginBottom: 4 },
  gamProgressTrack: { height: 8, backgroundColor: C.grayLight, borderRadius: 4, marginBottom: 4 },
  gamProgressFill: { height: '100%', backgroundColor: C.primary, borderRadius: 4 },
  gamProgressLabel: { fontSize: FontSizes.xs, color: C.textSecondary, textAlign: 'right' },
  gamStatsGrid: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: C.grayLight },
  gamStatItem: { alignItems: 'center', gap: 4, flex: 1 },
  gamStatValue: { fontSize: FontSizes.xl, fontWeight: '800', color: C.text },
  gamStatLabel: { fontSize: FontSizes.xs, color: C.textSecondary },
  gamStatDivider: { width: 1, height: 50, backgroundColor: C.grayLight },
  achGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  achItem: { width: '30%', alignItems: 'center', padding: Spacing.sm, borderRadius: BorderRadius.md },
  achItemLocked: { opacity: 0.5 },
  achIconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  achName: { fontSize: FontSizes.xs, fontWeight: '600', color: C.text, textAlign: 'center', marginBottom: 2 },
  achBones: { fontSize: FontSizes.xs, color: C.accent, fontWeight: '600' },
  emptyText: { textAlign: 'center', color: C.textSecondary, fontSize: FontSizes.sm, padding: Spacing.md },
  inviteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.primary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.lg },
  inviteBtnText: { fontSize: FontSizes.sm, color: C.white, fontWeight: '600' },
  packMember: { flexDirection: 'row', alignItems: 'center' },
  memberAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  memberInfo: { flex: 1, marginLeft: Spacing.md },
  memberName: { fontSize: FontSizes.md, fontWeight: '600', color: C.text },
  memberRole: { fontSize: FontSizes.sm, color: C.textSecondary },
  ownerBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.accent + '20', alignItems: 'center', justifyContent: 'center' },
  clinicalRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, gap: Spacing.sm },
  clinicalLabel: { fontSize: FontSizes.md, color: C.textSecondary, width: 100 },
  clinicalValue: { flex: 1, fontSize: FontSizes.md, color: C.text, textAlign: 'right' },
  clinicalEdit: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: Spacing.md, marginTop: Spacing.sm, borderTopWidth: 1, borderTopColor: C.grayLight },
  clinicalEditText: { fontSize: FontSizes.md, color: C.primary, fontWeight: '600' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.md },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: C.grayLight },
  menuItemText: { flex: 1, fontSize: FontSizes.md, color: C.text },
  menuItemValue: { fontSize: FontSizes.sm, color: C.textSecondary, marginRight: Spacing.xs },
  version: { fontSize: FontSizes.sm, color: C.textLight, textAlign: 'center', marginTop: Spacing.md },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: C.white, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, padding: Spacing.lg, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  modalTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: C.text },
  langOption: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm, backgroundColor: C.background },
  langOptionActive: { backgroundColor: C.primaryLight, borderWidth: 2, borderColor: C.primary },
  inputGroup: { marginBottom: Spacing.md },
  inputLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: C.textSecondary, marginBottom: Spacing.xs },
  input: { backgroundColor: C.background, borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSizes.md, color: C.text, borderWidth: 1, borderColor: C.grayLight },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: C.grayLight },
  settingLabel: { fontSize: FontSizes.md, color: C.text },
  unitBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: C.grayLight },
  unitBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
  unitBtnText: { fontSize: FontSizes.sm, fontWeight: '600', color: C.text },
});
