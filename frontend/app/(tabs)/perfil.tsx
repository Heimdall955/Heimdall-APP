import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, 
  RefreshControl, Modal, TextInput, Image, Platform, Share, Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, Language } from '../../contexts/LanguageContext';
import { SecureStore } from '../../utils/secureStore';
import { Card, Button } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface GamificationData {
  bones: number; xp: number; level: number; level_progress: number; level_target: number;
  streak_days: number; exercises_completed: number; practice_minutes: number;
  achievements_unlocked: string[]; last_activity: string | null;
}
interface Achievement { id: string; name: string; description: string; icon: string; bones_reward: number; unlocked: boolean; }
interface Friend { id: string; name: string; status: string; created_at: string; }
interface ClinicalFile {
  country: string; vet_name: string; vet_phone: string; allergies: string;
  chronic_conditions: string; current_medication: string; blood_type: string; neutered: boolean; insurance: string;
}
interface UserSettings {
  notifications_enabled: boolean; daily_reminder: boolean; health_alerts: boolean;
  achievement_alerts: boolean; pack_alerts: boolean; weight_unit: string; temperature_unit: string;
}

const PLACEHOLDER_COLORS = [Colors.primary, Colors.accentOrange, Colors.accentPurple, '#4ECDC4', '#FF6B6B'];

export default function PerfilScreen() {
  const router = useRouter();
  const { currentDog, user, logout, dogs, refreshDogs, setCurrentDog } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { colors, isDark, toggleTheme } = useTheme();
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
  const [editWeight, setEditWeight] = useState('');
  const [editBreed, setEditBreed] = useState('');
  const [editChip, setEditChip] = useState('');
  const [saving, setSaving] = useState(false);
  const [gamification, setGamification] = useState<GamificationData | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [inviteName, setInviteName] = useState('');
  
  const [clinical, setClinical] = useState<ClinicalFile>({
    country: '', vet_name: '', vet_phone: '', allergies: '',
    chronic_conditions: '', current_medication: '', blood_type: '', neutered: false, insurance: ''
  });
  const [settings, setSettings] = useState<UserSettings>({
    notifications_enabled: true, daily_reminder: true, health_alerts: true,
    achievement_alerts: true, pack_alerts: true, weight_unit: 'kg', temperature_unit: 'celsius'
  });

  useEffect(() => { loadDogImage(); loadAll(); }, []);
  useEffect(() => {
    if (currentDog) {
      setEditName(currentDog.name || ''); setEditAge(currentDog.age?.toString() || '');
      setEditWeight(currentDog.weight?.toString() || ''); setEditBreed(currentDog.breed || '');
      setEditChip(currentDog.chip_id || '');
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
      const [statsRes, achRes, friendsRes, settingsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/gamification/stats`, { headers }).catch(() => ({ data: null })),
        axios.get(`${BACKEND_URL}/api/gamification/achievements`, { headers }).catch(() => ({ data: { achievements: [] } })),
        axios.get(`${BACKEND_URL}/api/pack/friends`, { headers }).catch(() => ({ data: { friends: [] } })),
        axios.get(`${BACKEND_URL}/api/users/settings`, { headers }).catch(() => ({ data: settings })),
      ]);
      if (statsRes.data) setGamification(statsRes.data);
      setAchievements(achRes.data?.achievements || []);
      setFriends(friendsRes.data?.friends || []);
      setSettings(settingsRes.data);
    } catch (error) { console.log('Error loading profile data:', error); }
    // Load clinical if dog exists
    if (currentDog?.id) {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/dogs/${currentDog.id}/clinical`, { headers });
        if (res.data) setClinical(prev => ({ ...prev, ...res.data }));
      } catch (e) { console.log('Clinical load error:', e); }
    }
  };

  const loadDogImage = async () => {
    if (currentDog?.id) {
      const saved = await SecureStore.getItemAsync(`dog_image_${currentDog.id}`);
      if (saved) setDogImage(saved);
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
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setDogImage(base64Image);
      if (currentDog?.id) await SecureStore.setItemAsync(`dog_image_${currentDog.id}`, base64Image);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentDog) return;
    setSaving(true);
    try {
      const headers = await getHeaders();
      await axios.put(`${BACKEND_URL}/api/dogs/${currentDog.id}`, {
        name: editName, age: parseInt(editAge) || 0, weight: parseFloat(editWeight) || 0,
        breed: editBreed, chip_id: editChip,
      }, { headers });
      setCurrentDog({ ...currentDog, name: editName, age: parseInt(editAge) || 0, weight: parseFloat(editWeight) || 0, breed: editBreed, chip_id: editChip });
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
    const shareMessage = language === 'en' 
      ? `Join me on Heimdall! The best app to take care of your pet. Download now!`
      : language === 'it' 
      ? `Unisciti a me su Heimdall! La migliore app per prenderti cura del tuo animale.`
      : `¡Únete a mí en Heimdall! La mejor app para cuidar a tu mascota. ¡Descárgala ya!`;
    
    try {
      await Share.share({ message: shareMessage, title: 'Heimdall - Tu guardián' });
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

  const changeLanguage = async (newLang: Language) => { await setLanguage(newLang); setShowLanguageModal(false); };
  const formatAge = (months: number) => {
    const y = Math.floor(months / 12); const m = months % 12;
    if (y === 0) return `${m} ${t('months')}`; if (m === 0) return `${y} ${t('years')}`;
    return `${y} ${t('years')} ${t('and')} ${m} ${t('months')}`;
  };
  const getLanguageFlag = (lang: Language) => ({ es: '🇪🇸', en: '🇬🇧', it: '🇮🇹' }[lang]);

  const menuItems = [
    { id: 'theme', icon: isDark ? 'sunny-outline' : 'moon-outline', label: t('appearance'), onPress: toggleTheme, showValue: isDark ? t('darkMode') : t('lightMode') },
    { id: 'settings', icon: 'settings-outline', label: t('settings'), onPress: () => setShowSettingsModal(true) },
    { id: 'notifications', icon: 'notifications-outline', label: t('notifications'), onPress: () => setShowNotificationsModal(true) },
    { id: 'privacy', icon: 'shield-outline', label: t('privacy'), onPress: () => {} },
    { id: 'help', icon: 'help-circle-outline', label: t('help'), onPress: () => {} },
    { id: 'language', icon: 'language-outline', label: t('language'), onPress: () => setShowLanguageModal(true), showValue: language.toUpperCase() },
    { id: 'logout', icon: 'log-out-outline', label: t('logout'), onPress: handleLogout, danger: true },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
        <View style={styles.header}><Text style={styles.title}>{t('profile')}</Text></View>

        {/* Dog Profile Card */}
        <Card style={styles.profileCard} variant="elevated">
          <View style={styles.profileHeader}>
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} data-testid="dog-photo-btn">
              {dogImage ? <Image source={{ uri: dogImage }} style={styles.avatarImage} /> : (
                <View style={styles.avatar}><Ionicons name="paw" size={40} color={Colors.white} /></View>
              )}
              <View style={styles.cameraButton}><Ionicons name="camera" size={16} color={Colors.white} /></View>
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              <Text style={styles.dogName}>{currentDog?.name || 'Tu perro'}</Text>
              <Text style={styles.ownerName}>de {user?.name}</Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={() => setShowEditModal(true)} data-testid="edit-profile-btn">
              <Ionicons name="create-outline" size={20} color={Colors.primary} />
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
            <View style={styles.chipContainer}><Ionicons name="hardware-chip" size={18} color={Colors.primary} /><Text style={styles.chipText}>{t('chip')}: {currentDog.chip_id}</Text></View>
          )}
        </Card>

        {/* Gamification */}
        <View style={styles.section} data-testid="gamification-section">
          <Text style={styles.sectionTitle}>{t('myRewards')}</Text>
          <Card variant="elevated" style={{ marginBottom: 0 }}>
            <View style={styles.gamLevelRow}>
              <View style={styles.gamLevelIcon}><Ionicons name="shield-checkmark" size={28} color={Colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.gamLevelText}>{t('level')} {gamification?.level || 1}</Text>
                <View style={styles.gamProgressTrack}><View style={[styles.gamProgressFill, { width: `${gamification ? (gamification.level_progress / gamification.level_target) * 100 : 0}%` }]} /></View>
                <Text style={styles.gamProgressLabel}>{gamification?.level_progress || 0}/{gamification?.level_target || 500} XP</Text>
              </View>
            </View>
            <View style={styles.gamStatsGrid}>
              <View style={styles.gamStatItem}><Text style={{ fontSize: 22 }}>🦴</Text><Text style={styles.gamStatValue}>{gamification?.bones || 0}</Text><Text style={styles.gamStatLabel}>{t('bones')}</Text></View>
              <View style={styles.gamStatDivider} />
              <View style={styles.gamStatItem}><Ionicons name="flame" size={22} color={Colors.accentOrange} /><Text style={styles.gamStatValue}>{gamification?.streak_days || 0}</Text><Text style={styles.gamStatLabel}>{t('streak')}</Text></View>
              <View style={styles.gamStatDivider} />
              <View style={styles.gamStatItem}><Ionicons name="school" size={22} color={Colors.accentPurple} /><Text style={styles.gamStatValue}>{gamification?.exercises_completed || 0}</Text><Text style={styles.gamStatLabel}>{t('lessons')}</Text></View>
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
                  <View style={[styles.achIconCircle, ach.unlocked ? { backgroundColor: Colors.primary } : { backgroundColor: Colors.grayLight }]}>
                    <Ionicons name={ach.icon as any} size={22} color={ach.unlocked ? Colors.white : Colors.gray} />
                  </View>
                  <Text style={[styles.achName, !ach.unlocked && { color: Colors.gray }]} numberOfLines={2}>{ach.name}</Text>
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
              <Ionicons name="person-add" size={16} color={Colors.white} />
              <Text style={styles.inviteBtnText}>{t('invite')}</Text>
            </TouchableOpacity>
          </View>
          <Card variant="elevated">
            {/* Owner */}
            <View style={styles.packMember}>
              <View style={[styles.memberAvatar, { backgroundColor: Colors.primary }]}><Ionicons name="person" size={20} color={Colors.white} /></View>
              <View style={styles.memberInfo}><Text style={styles.memberName}>{user?.name}</Text><Text style={styles.memberRole}>{t('mainOwner')}</Text></View>
              <View style={styles.ownerBadge}><Ionicons name="star" size={14} color={Colors.accent} /></View>
            </View>
            
            {/* Friends */}
            {friends.map((f, i) => (
              <View key={f.id} style={[styles.packMember, { marginTop: Spacing.sm }]}>
                <View style={[styles.memberAvatar, { backgroundColor: PLACEHOLDER_COLORS[(i + 1) % 5] }]}>
                  <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 16 }}>{f.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{f.name}</Text>
                  <Text style={[styles.memberRole, f.status === 'pending' && { color: Colors.accentOrange }]}>
                    {f.status === 'pending' ? (language === 'en' ? 'Pending' : language === 'it' ? 'In attesa' : 'Pendiente') : (language === 'en' ? 'Member' : language === 'it' ? 'Membro' : 'Miembro')}
                  </Text>
                </View>
              </View>
            ))}
            
            {/* Empty friend slots */}
            {Array.from({ length: Math.max(0, 3 - friends.length) }).map((_, i) => (
              <TouchableOpacity key={`empty-${i}`} style={[styles.packMember, { marginTop: Spacing.sm }]} onPress={() => setShowInviteModal(true)}>
                <View style={[styles.memberAvatar, { backgroundColor: Colors.grayLight, borderWidth: 2, borderColor: Colors.gray, borderStyle: 'dashed' }]}>
                  <Ionicons name="add" size={20} color={Colors.gray} />
                </View>
                <View style={styles.memberInfo}>
                  <Text style={[styles.memberName, { color: Colors.gray }]}>{language === 'en' ? 'Invite a friend' : language === 'it' ? 'Invita un amico' : 'Invita a un amigo'}</Text>
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
            <View style={styles.clinicalRow}><Ionicons name="location-outline" size={20} color={Colors.textSecondary} /><Text style={styles.clinicalLabel}>{t('country')}</Text><Text style={styles.clinicalValue}>{clinical.country || '--'}</Text></View>
            <View style={styles.clinicalRow}><Ionicons name="medkit-outline" size={20} color={Colors.textSecondary} /><Text style={styles.clinicalLabel}>{t('vet')}</Text><Text style={styles.clinicalValue}>{clinical.vet_name || t('notAssigned')}</Text></View>
            <View style={styles.clinicalRow}><Ionicons name="alert-circle-outline" size={20} color={Colors.textSecondary} /><Text style={styles.clinicalLabel}>{t('allergies')}</Text><Text style={styles.clinicalValue}>{clinical.allergies || t('noneRegistered')}</Text></View>
            <View style={styles.clinicalRow}><Ionicons name="fitness-outline" size={20} color={Colors.textSecondary} /><Text style={styles.clinicalLabel}>{language === 'en' ? 'Neutered' : language === 'it' ? 'Sterilizzato' : 'Esterilizado'}</Text><Text style={styles.clinicalValue}>{clinical.neutered ? (language === 'en' ? 'Yes' : 'Sí') : 'No'}</Text></View>
            <View style={styles.clinicalRow}><Ionicons name="medical-outline" size={20} color={Colors.textSecondary} /><Text style={styles.clinicalLabel}>{language === 'en' ? 'Medication' : language === 'it' ? 'Farmaci' : 'Medicación'}</Text><Text style={styles.clinicalValue}>{clinical.current_medication || '--'}</Text></View>
            <TouchableOpacity style={styles.clinicalEdit} onPress={() => setShowClinicalModal(true)} data-testid="edit-clinical-btn">
              <Text style={styles.clinicalEditText}>{t('editClinicalFile')}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* PRO Card */}
        <Card style={[styles.profileCard, { backgroundColor: Colors.secondary }]} variant="elevated">
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="diamond" size={28} color={Colors.white} />
            </View>
            <View style={{ marginLeft: Spacing.md }}><Text style={{ fontSize: FontSizes.xl, fontWeight: '700', color: Colors.white }}>{t('goToPro')}</Text><Text style={{ fontSize: FontSizes.md, color: Colors.accent }}>1,99€/mes</Text></View>
          </View>
          <Button title={t('activatePro')} onPress={() => router.push('/pro')} style={{ backgroundColor: Colors.accent }} />
        </Card>

        {/* Menu */}
        <View style={styles.section}>
          <Card variant="elevated">
            {menuItems.map((item, index) => (
              <TouchableOpacity key={item.id} style={[styles.menuItem, index < menuItems.length - 1 && styles.menuItemBorder]} onPress={item.onPress} data-testid={`menu-${item.id}`}>
                <Ionicons name={item.icon as any} size={22} color={item.danger ? Colors.error : Colors.text} />
                <Text style={[styles.menuItemText, item.danger && { color: Colors.error }]}>{item.label}</Text>
                {item.showValue && <Text style={styles.menuItemValue}>{getLanguageFlag(language)} {item.showValue}</Text>}
                <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
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
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>{t('selectLanguage')}</Text><TouchableOpacity onPress={() => setShowLanguageModal(false)}><Ionicons name="close" size={24} color={Colors.text} /></TouchableOpacity></View>
          {(['es', 'en', 'it'] as Language[]).map(lang => (
            <TouchableOpacity key={lang} style={[styles.langOption, language === lang && styles.langOptionActive]} onPress={() => changeLanguage(lang)}>
              <Text style={{ fontSize: 28, marginRight: Spacing.md }}>{getLanguageFlag(lang)}</Text>
              <Text style={{ flex: 1, fontSize: FontSizes.lg, fontWeight: '600', color: Colors.text }}>{lang === 'es' ? t('spanish') : lang === 'en' ? t('english') : t('italian')}</Text>
              {language === lang && <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />}
            </TouchableOpacity>
          ))}
        </View></View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalOverlay}><View style={[styles.modalContent, { maxHeight: '80%' }]}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>{t('editDogProfile')}</Text><TouchableOpacity onPress={() => setShowEditModal(false)}><Ionicons name="close" size={24} color={Colors.text} /></TouchableOpacity></View>
          <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={{ alignSelf: 'center', marginBottom: Spacing.md }} onPress={pickImage}>
              {dogImage ? <Image source={{ uri: dogImage }} style={{ width: 90, height: 90, borderRadius: 45 }} /> : <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="paw" size={36} color={Colors.white} /></View>}
            </TouchableOpacity>
            <View style={styles.inputGroup}><Text style={styles.inputLabel}>{t('dogName')}</Text><TextInput style={styles.input} value={editName} onChangeText={setEditName} /></View>
            <View style={{ flexDirection: 'row', gap: Spacing.md }}>
              <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.inputLabel}>{t('dogAge')}</Text><TextInput style={styles.input} value={editAge} onChangeText={setEditAge} keyboardType="numeric" /></View>
              <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.inputLabel}>{t('dogWeight')}</Text><TextInput style={styles.input} value={editWeight} onChangeText={setEditWeight} keyboardType="decimal-pad" /></View>
            </View>
            <View style={styles.inputGroup}><Text style={styles.inputLabel}>{t('dogBreed')}</Text><TextInput style={styles.input} value={editBreed} onChangeText={setEditBreed} /></View>
            <View style={styles.inputGroup}><Text style={styles.inputLabel}>{t('chipId')}</Text><TextInput style={styles.input} value={editChip} onChangeText={setEditChip} /></View>
          </ScrollView>
          <Button title={saving ? '...' : t('save')} onPress={handleSaveProfile} loading={saving} disabled={saving} style={{ marginTop: Spacing.md }} />
        </View></View>
      </Modal>

      {/* Clinical File Modal */}
      <Modal visible={showClinicalModal} transparent animationType="slide" onRequestClose={() => setShowClinicalModal(false)}>
        <View style={styles.modalOverlay}><View style={[styles.modalContent, { maxHeight: '85%' }]}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>{t('clinicalFile')}</Text><TouchableOpacity onPress={() => setShowClinicalModal(false)}><Ionicons name="close" size={24} color={Colors.text} /></TouchableOpacity></View>
          <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}><Text style={styles.inputLabel}>{t('country')}</Text><TextInput style={styles.input} value={clinical.country} onChangeText={v => setClinical(p => ({ ...p, country: v }))} placeholder="España" placeholderTextColor={Colors.gray} /></View>
            <View style={styles.inputGroup}><Text style={styles.inputLabel}>{t('vet')}</Text><TextInput style={styles.input} value={clinical.vet_name} onChangeText={v => setClinical(p => ({ ...p, vet_name: v }))} placeholder="Dr. García" placeholderTextColor={Colors.gray} /></View>
            <View style={styles.inputGroup}><Text style={styles.inputLabel}>{language === 'en' ? 'Vet phone' : 'Teléfono vet'}</Text><TextInput style={styles.input} value={clinical.vet_phone} onChangeText={v => setClinical(p => ({ ...p, vet_phone: v }))} keyboardType="phone-pad" placeholder="+34..." placeholderTextColor={Colors.gray} /></View>
            <View style={styles.inputGroup}><Text style={styles.inputLabel}>{t('allergies')}</Text><TextInput style={[styles.input, { minHeight: 60 }]} value={clinical.allergies} onChangeText={v => setClinical(p => ({ ...p, allergies: v }))} multiline placeholder={language === 'en' ? 'None known' : 'Ninguna conocida'} placeholderTextColor={Colors.gray} /></View>
            <View style={styles.inputGroup}><Text style={styles.inputLabel}>{language === 'en' ? 'Chronic conditions' : 'Enfermedades crónicas'}</Text><TextInput style={[styles.input, { minHeight: 60 }]} value={clinical.chronic_conditions} onChangeText={v => setClinical(p => ({ ...p, chronic_conditions: v }))} multiline placeholderTextColor={Colors.gray} /></View>
            <View style={styles.inputGroup}><Text style={styles.inputLabel}>{language === 'en' ? 'Current medication' : 'Medicación actual'}</Text><TextInput style={[styles.input, { minHeight: 60 }]} value={clinical.current_medication} onChangeText={v => setClinical(p => ({ ...p, current_medication: v }))} multiline placeholderTextColor={Colors.gray} /></View>
            <View style={styles.inputGroup}><Text style={styles.inputLabel}>{language === 'en' ? 'Insurance' : 'Seguro'}</Text><TextInput style={styles.input} value={clinical.insurance} onChangeText={v => setClinical(p => ({ ...p, insurance: v }))} placeholderTextColor={Colors.gray} /></View>
            <View style={[styles.inputGroup, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
              <Text style={styles.inputLabel}>{language === 'en' ? 'Neutered/Spayed' : 'Esterilizado/a'}</Text>
              <Switch value={clinical.neutered} onValueChange={v => setClinical(p => ({ ...p, neutered: v }))} trackColor={{ true: Colors.primary }} />
            </View>
          </ScrollView>
          <Button title={saving ? '...' : t('save')} onPress={handleSaveClinical} loading={saving} disabled={saving} style={{ marginTop: Spacing.md }} />
        </View></View>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={showSettingsModal} transparent animationType="slide" onRequestClose={() => setShowSettingsModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>{t('settings')}</Text><TouchableOpacity onPress={() => setShowSettingsModal(false)}><Ionicons name="close" size={24} color={Colors.text} /></TouchableOpacity></View>
          <View style={styles.settingRow}><Text style={styles.settingLabel}>{language === 'en' ? 'Weight unit' : 'Unidad de peso'}</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {['kg', 'lb'].map(u => (
                <TouchableOpacity key={u} style={[styles.unitBtn, settings.weight_unit === u && styles.unitBtnActive]} onPress={() => handleSaveSettings({ ...settings, weight_unit: u })}>
                  <Text style={[styles.unitBtnText, settings.weight_unit === u && { color: Colors.white }]}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.settingRow}><Text style={styles.settingLabel}>{language === 'en' ? 'Temperature' : 'Temperatura'}</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {['celsius', 'fahrenheit'].map(u => (
                <TouchableOpacity key={u} style={[styles.unitBtn, settings.temperature_unit === u && styles.unitBtnActive]} onPress={() => handleSaveSettings({ ...settings, temperature_unit: u })}>
                  <Text style={[styles.unitBtnText, settings.temperature_unit === u && { color: Colors.white }]}>{u === 'celsius' ? '°C' : '°F'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.settingRow}><Text style={styles.settingLabel}>{t('language')}</Text>
            <TouchableOpacity onPress={() => { setShowSettingsModal(false); setShowLanguageModal(true); }}>
              <Text style={{ color: Colors.primary, fontWeight: '600' }}>{getLanguageFlag(language)} {language.toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
        </View></View>
      </Modal>

      {/* Notifications Modal */}
      <Modal visible={showNotificationsModal} transparent animationType="slide" onRequestClose={() => setShowNotificationsModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>{t('notifications')}</Text><TouchableOpacity onPress={() => setShowNotificationsModal(false)}><Ionicons name="close" size={24} color={Colors.text} /></TouchableOpacity></View>
          {[
            { key: 'notifications_enabled', label: language === 'en' ? 'Enable notifications' : 'Activar notificaciones', icon: 'notifications' },
            { key: 'daily_reminder', label: language === 'en' ? 'Daily check-in' : 'Check-in diario', icon: 'sunny' },
            { key: 'health_alerts', label: language === 'en' ? 'Health alerts' : 'Alertas de salud', icon: 'heart' },
            { key: 'achievement_alerts', label: language === 'en' ? 'Achievement alerts' : 'Alertas de logros', icon: 'trophy' },
            { key: 'pack_alerts', label: language === 'en' ? 'Pack activity' : 'Actividad de manada', icon: 'people' },
          ].map(item => (
            <View key={item.key} style={styles.settingRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 }}>
                <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
                <Text style={styles.settingLabel}>{item.label}</Text>
              </View>
              <Switch value={(settings as any)[item.key]} onValueChange={v => handleSaveSettings({ ...settings, [item.key]: v })} trackColor={{ true: Colors.primary }} />
            </View>
          ))}
        </View></View>
      </Modal>

      {/* Invite Modal */}
      <Modal visible={showInviteModal} transparent animationType="slide" onRequestClose={() => setShowInviteModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>{t('invite')}</Text><TouchableOpacity onPress={() => setShowInviteModal(false)}><Ionicons name="close" size={24} color={Colors.text} /></TouchableOpacity></View>
          <Text style={{ fontSize: FontSizes.md, color: Colors.textSecondary, marginBottom: Spacing.lg, textAlign: 'center' }}>
            {language === 'en' ? 'Invite friends to join your pack and earn 5 bones!' : language === 'it' ? 'Invita amici e guadagna 5 ossa!' : '¡Invita a amigos a tu manada y gana 5 huesos! 🦴'}
          </Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{language === 'en' ? "Friend's name" : 'Nombre del amigo'}</Text>
            <TextInput style={styles.input} value={inviteName} onChangeText={setInviteName} placeholder="Alex" placeholderTextColor={Colors.gray} />
          </View>
          <Button title={language === 'en' ? 'Share invitation' : language === 'it' ? 'Condividi invito' : 'Compartir invitación'} onPress={handleInvite} disabled={!inviteName.trim()} style={{ marginTop: Spacing.md }} />
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.md },
  header: { marginBottom: Spacing.lg },
  title: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.text },
  profileCard: { marginBottom: Spacing.lg },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  avatarContainer: { position: 'relative' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  cameraButton: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.white },
  profileInfo: { flex: 1, marginLeft: Spacing.md },
  dogName: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.text },
  ownerName: { fontSize: FontSizes.md, color: Colors.textSecondary },
  editButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary + '20', alignItems: 'center', justifyContent: 'center' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.grayLight },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  statLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 40, backgroundColor: Colors.grayLight },
  chipContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.grayLight },
  chipText: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  section: { marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  gamLevelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  gamLevelIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  gamLevelText: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  gamProgressTrack: { height: 8, backgroundColor: Colors.grayLight, borderRadius: 4, marginBottom: 4 },
  gamProgressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
  gamProgressLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, textAlign: 'right' },
  gamStatsGrid: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.grayLight },
  gamStatItem: { alignItems: 'center', gap: 4, flex: 1 },
  gamStatValue: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.text },
  gamStatLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  gamStatDivider: { width: 1, height: 50, backgroundColor: Colors.grayLight },
  achGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  achItem: { width: '30%', alignItems: 'center', padding: Spacing.sm, borderRadius: BorderRadius.md },
  achItemLocked: { opacity: 0.5 },
  achIconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  achName: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.text, textAlign: 'center', marginBottom: 2 },
  achBones: { fontSize: FontSizes.xs, color: Colors.accent, fontWeight: '600' },
  emptyText: { textAlign: 'center', color: Colors.textSecondary, fontSize: FontSizes.sm, padding: Spacing.md },
  inviteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.lg },
  inviteBtnText: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '600' },
  packMember: { flexDirection: 'row', alignItems: 'center' },
  memberAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  memberInfo: { flex: 1, marginLeft: Spacing.md },
  memberName: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.text },
  memberRole: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  ownerBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.accent + '20', alignItems: 'center', justifyContent: 'center' },
  clinicalRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, gap: Spacing.sm },
  clinicalLabel: { fontSize: FontSizes.md, color: Colors.textSecondary, width: 100 },
  clinicalValue: { flex: 1, fontSize: FontSizes.md, color: Colors.text, textAlign: 'right' },
  clinicalEdit: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: Spacing.md, marginTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.grayLight },
  clinicalEditText: { fontSize: FontSizes.md, color: Colors.primary, fontWeight: '600' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.md },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.grayLight },
  menuItemText: { flex: 1, fontSize: FontSizes.md, color: Colors.text },
  menuItemValue: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginRight: Spacing.xs },
  version: { fontSize: FontSizes.sm, color: Colors.textLight, textAlign: 'center', marginTop: Spacing.md },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, padding: Spacing.lg, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  modalTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.text },
  langOption: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm, backgroundColor: Colors.background },
  langOptionActive: { backgroundColor: Colors.primaryLight, borderWidth: 2, borderColor: Colors.primary },
  inputGroup: { marginBottom: Spacing.md },
  inputLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.xs },
  input: { backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSizes.md, color: Colors.text, borderWidth: 1, borderColor: Colors.grayLight },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.grayLight },
  settingLabel: { fontSize: FontSizes.md, color: Colors.text },
  unitBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.grayLight },
  unitBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  unitBtnText: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.text },
});
