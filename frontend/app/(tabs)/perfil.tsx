import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, 
  RefreshControl, Modal, TextInput, Image, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, Language } from '../../contexts/LanguageContext';
import { SecureStore } from '../../utils/secureStore';
import { Card, Button } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../../constants/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export default function PerfilScreen() {
  const router = useRouter();
  const { currentDog, user, logout, dogs, refreshDogs, setCurrentDog } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [dogImage, setDogImage] = useState<string | null>(null);
  
  // Edit form state
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editBreed, setEditBreed] = useState('');
  const [editChip, setEditChip] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDogImage();
  }, []);

  useEffect(() => {
    if (currentDog) {
      setEditName(currentDog.name || '');
      setEditAge(currentDog.age?.toString() || '');
      setEditWeight(currentDog.weight?.toString() || '');
      setEditBreed(currentDog.breed || '');
      setEditChip(currentDog.chip_id || '');
    }
  }, [currentDog]);

  const loadDogImage = async () => {
    if (currentDog?.id) {
      const savedImage = await SecureStore.getItemAsync(`dog_image_${currentDog.id}`);
      if (savedImage) {
        setDogImage(savedImage);
      }
    }
  };

  const changeLanguage = async (newLang: Language) => {
    await setLanguage(newLang);
    setShowLanguageModal(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshDogs();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('logoutConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t("logout"), 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/onboarding/idioma');
          }
        },
      ]
    );
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para cambiar la foto');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setDogImage(base64Image);
      if (currentDog?.id) {
        await SecureStore.setItemAsync(`dog_image_${currentDog.id}`, base64Image);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!currentDog) return;
    
    setSaving(true);
    try {
      const token = await SecureStore.getItemAsync('session_token');
      
      const updatedDog = {
        name: editName,
        age: parseInt(editAge) || 0,
        weight: parseFloat(editWeight) || 0,
        breed: editBreed,
        chip_id: editChip,
      };

      await axios.put(
        `${BACKEND_URL}/api/dogs/${currentDog.id}`,
        updatedDog,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setCurrentDog({ ...currentDog, ...updatedDog });
      await refreshDogs();
      
      setShowEditModal(false);
      Alert.alert('¡Guardado!', 'El perfil se ha actualizado correctamente');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'No se pudo guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const menuItems = [
    { id: 'settings', icon: 'settings-outline', label: t("settings"), onPress: () => {} },
    { id: 'notifications', icon: 'notifications-outline', label: t("notifications"), onPress: () => {} },
    { id: 'privacy', icon: 'shield-outline', label: t("privacy"), onPress: () => {} },
    { id: 'help', icon: 'help-circle-outline', label: t("help"), onPress: () => {} },
    { id: 'language', icon: 'language-outline', label: t("language"), onPress: () => setShowLanguageModal(true), showValue: language.toUpperCase() },
    { id: 'logout', icon: 'log-out-outline', label: t("logout"), onPress: handleLogout, danger: true },
  ];

  const formatAge = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${remainingMonths} ${t("months")}`;
    if (remainingMonths === 0) return `${years} ${t("years")}`;
    return `${years} ${t("years")} ${t("and")} ${remainingMonths} ${t("months")}`;
  };

  const getLanguageFlag = (lang: Language) => {
    switch (lang) {
      case 'es': return '🇪🇸';
      case 'en': return '🇬🇧';
      case 'it': return '🇮🇹';
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t("profile")}</Text>
        </View>

        {/* Dog Profile Card */}
        <Card style={styles.profileCard} variant="elevated">
          <View style={styles.profileHeader}>
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
              {dogImage ? (
                <Image source={{ uri: dogImage }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Ionicons name="paw" size={40} color={Colors.white} />
                </View>
              )}
              <View style={styles.cameraButton}>
                <Ionicons name="camera" size={16} color={Colors.white} />
              </View>
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              <Text style={styles.dogName}>{currentDog?.name || 'Tu perro'}</Text>
              <Text style={styles.ownerName}>de {user?.name}</Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={() => setShowEditModal(true)}>
              <Ionicons name="create-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {currentDog?.age ? formatAge(currentDog.age) : '--'}
              </Text>
              <Text style={styles.statLabel}>{t("age")}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentDog?.weight || '--'} kg</Text>
              <Text style={styles.statLabel}>{t("weight")}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentDog?.breed || 'Mixto'}</Text>
              <Text style={styles.statLabel}>{t("breed")}</Text>
            </View>
          </View>

          {currentDog?.chip_id && (
            <View style={styles.chipContainer}>
              <Ionicons name="hardware-chip" size={18} color={Colors.primary} />
              <Text style={styles.chipText}>{t("chip")}: {currentDog.chip_id}</Text>
            </View>
          )}
        </Card>

        {/* Pack Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("myPack")}</Text>
            <TouchableOpacity style={styles.inviteButton}>
              <Ionicons name="person-add-outline" size={18} color={Colors.primary} />
              <Text style={styles.inviteText}>{t("invite")}</Text>
            </TouchableOpacity>
          </View>
          <Card variant="elevated">
            <View style={styles.packMember}>
              <View style={styles.memberAvatar}>
                <Ionicons name="person" size={20} color={Colors.white} />
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{user?.name}</Text>
                <Text style={styles.memberRole}>{t("mainOwner")}</Text>
              </View>
              <View style={styles.ownerBadge}>
                <Ionicons name="star" size={14} color={Colors.accent} />
              </View>
            </View>
          </Card>
        </View>

        {/* Clinical File */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("clinicalFile")}</Text>
          <Card variant="elevated">
            <View style={styles.clinicalRow}>
              <Ionicons name="location-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.clinicalLabel}>{t("country")}</Text>
              <Text style={styles.clinicalValue}>España</Text>
            </View>
            <View style={styles.clinicalRow}>
              <Ionicons name="medkit-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.clinicalLabel}>{t("vet")}</Text>
              <Text style={styles.clinicalValue}>{t("notAssigned")}</Text>
            </View>
            <View style={styles.clinicalRow}>
              <Ionicons name="alert-circle-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.clinicalLabel}>{t("allergies")}</Text>
              <Text style={styles.clinicalValue}>{t("noneRegistered")}</Text>
            </View>
            <TouchableOpacity style={styles.clinicalEdit}>
              <Text style={styles.clinicalEditText}>{t("editClinicalFile")}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* PRO Card */}
        <Card style={styles.proCard} variant="elevated">
          <View style={styles.proHeader}>
            <View style={styles.proIcon}>
              <Ionicons name="diamond" size={28} color={Colors.white} />
            </View>
            <View style={styles.proInfo}>
              <Text style={styles.proTitle}>{t("goToPro")}</Text>
              <Text style={styles.proPrice}>1,99€/mes</Text>
            </View>
          </View>
          <View style={styles.proBenefits}>
            <View style={styles.proBenefit}>
              <Ionicons name="checkmark" size={18} color={Colors.success} />
              <Text style={styles.proBenefitText}>{t("videoAnalysis")}</Text>
            </View>
            <View style={styles.proBenefit}>
              <Ionicons name="checkmark" size={18} color={Colors.success} />
              <Text style={styles.proBenefitText}>{t("vetReports")}</Text>
            </View>
            <View style={styles.proBenefit}>
              <Ionicons name="checkmark" size={18} color={Colors.success} />
              <Text style={styles.proBenefitText}>{t("unlimitedChat")}</Text>
            </View>
          </View>
          <Button
            title={t("activatePro")}
            onPress={() => router.push('/pro')}
            style={styles.proButton}
          />
        </Card>

        {/* Menu */}
        <View style={styles.section}>
          <Card variant="elevated">
            {menuItems.map((item, index) => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.menuItem, index < menuItems.length - 1 && styles.menuItemBorder]}
                onPress={item.onPress}
              >
                <Ionicons 
                  name={item.icon as any} 
                  size={22} 
                  color={item.danger ? Colors.error : Colors.text} 
                />
                <Text style={[styles.menuItemText, item.danger && styles.menuItemDanger]}>
                  {item.label}
                </Text>
                {item.showValue && (
                  <Text style={styles.menuItemValue}>{getLanguageFlag(language)} {item.showValue}</Text>
                )}
                <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
              </TouchableOpacity>
            ))}
          </Card>
        </View>

        {/* Version */}
        <Text style={styles.version}>Heimdall v1.0.0</Text>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("selectLanguage")}</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.languageOption, language === 'es' && styles.languageOptionActive]}
              onPress={() => changeLanguage('es')}
            >
              <Text style={styles.languageFlag}>🇪🇸</Text>
              <Text style={styles.languageText}>{t("spanish")}</Text>
              {language === 'es' && <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.languageOption, language === 'en' && styles.languageOptionActive]}
              onPress={() => changeLanguage('en')}
            >
              <Text style={styles.languageFlag}>🇬🇧</Text>
              <Text style={styles.languageText}>{t("english")}</Text>
              {language === 'en' && <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.languageOption, language === 'it' && styles.languageOptionActive]}
              onPress={() => changeLanguage('it')}
            >
              <Text style={styles.languageFlag}>🇮🇹</Text>
              <Text style={styles.languageText}>{t("italian")}</Text>
              {language === 'it' && <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.editModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("editDogProfile")}</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.editForm}>
              {/* Photo */}
              <TouchableOpacity style={styles.editPhotoContainer} onPress={pickImage}>
                {dogImage ? (
                  <Image source={{ uri: dogImage }} style={styles.editPhoto} />
                ) : (
                  <View style={styles.editPhotoPlaceholder}>
                    <Ionicons name="paw" size={40} color={Colors.white} />
                  </View>
                )}
                <View style={styles.editPhotoButton}>
                  <Ionicons name="camera" size={20} color={Colors.white} />
                </View>
              </TouchableOpacity>
              <Text style={styles.editPhotoText}>{t("changePhoto")}</Text>

              {/* Form Fields */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("dogName")}</Text>
                <TextInput
                  style={styles.input}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder={t("dogName")}
                  placeholderTextColor={Colors.gray}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>{t("dogAge")}</Text>
                  <TextInput
                    style={styles.input}
                    value={editAge}
                    onChangeText={setEditAge}
                    placeholder="12"
                    keyboardType="numeric"
                    placeholderTextColor={Colors.gray}
                  />
                </View>
                <View style={{ width: Spacing.md }} />
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>{t("dogWeight")}</Text>
                  <TextInput
                    style={styles.input}
                    value={editWeight}
                    onChangeText={setEditWeight}
                    placeholder="15"
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.gray}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("dogBreed")}</Text>
                <TextInput
                  style={styles.input}
                  value={editBreed}
                  onChangeText={setEditBreed}
                  placeholder="Border Collie"
                  placeholderTextColor={Colors.gray}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("chipId")}</Text>
                <TextInput
                  style={styles.input}
                  value={editChip}
                  onChangeText={setEditChip}
                  placeholder="941000024680135"
                  placeholderTextColor={Colors.gray}
                />
              </View>
            </ScrollView>

            <Button
              title={saving ? 'Guardando...' : t("save")}
              onPress={handleSaveProfile}
              loading={saving}
              disabled={saving}
              style={styles.saveButton}
            />
          </View>
        </View>
      </Modal>
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
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  profileCard: {
    marginBottom: Spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  dogName: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  ownerName: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.grayLight,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.grayLight,
  },
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.grayLight,
  },
  chipText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  inviteText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  packMember: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  memberName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  memberRole: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  ownerBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clinicalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  clinicalLabel: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    width: 100,
  },
  clinicalValue: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
    textAlign: 'right',
  },
  clinicalEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.grayLight,
  },
  clinicalEditText: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  proCard: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.secondary,
  },
  proHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  proIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proInfo: {
    marginLeft: Spacing.md,
  },
  proTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.white,
  },
  proPrice: {
    fontSize: FontSizes.md,
    color: Colors.accent,
  },
  proBenefits: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  proBenefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  proBenefitText: {
    fontSize: FontSizes.md,
    color: Colors.white,
  },
  proButton: {
    backgroundColor: Colors.accent,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  menuItemText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  menuItemValue: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
  },
  menuItemDanger: {
    color: Colors.error,
  },
  version: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  editModalContent: {
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  languageOptionActive: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  languageFlag: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  languageText: {
    flex: 1,
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  editForm: {
    maxHeight: 400,
  },
  editPhotoContainer: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  editPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editPhotoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  editPhotoText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.grayLight,
  },
  saveButton: {
    marginTop: Spacing.md,
  },
});
