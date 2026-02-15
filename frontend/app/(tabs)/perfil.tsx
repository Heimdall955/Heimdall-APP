import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../../constants/theme';

export default function PerfilScreen() {
  const router = useRouter();
  const { currentDog, user, logout, dogs } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar sesión', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/onboarding/idioma');
          }
        },
      ]
    );
  };

  const menuItems = [
    { id: 'settings', icon: 'settings-outline', label: 'Ajustes', onPress: () => {} },
    { id: 'notifications', icon: 'notifications-outline', label: 'Notificaciones', onPress: () => {} },
    { id: 'privacy', icon: 'shield-outline', label: 'Privacidad y datos', onPress: () => {} },
    { id: 'help', icon: 'help-circle-outline', label: 'Ayuda', onPress: () => {} },
    { id: 'logout', icon: 'log-out-outline', label: 'Cerrar sesión', onPress: handleLogout, danger: true },
  ];

  const formatAge = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${remainingMonths} meses`;
    if (remainingMonths === 0) return `${years} años`;
    return `${years} años y ${remainingMonths} meses`;
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
          <Text style={styles.title}>Perfil</Text>
        </View>

        {/* Dog Profile Card */}
        <Card style={styles.profileCard} variant="elevated">
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="paw" size={40} color={Colors.white} />
              </View>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.dogName}>{currentDog?.name || 'Tu perro'}</Text>
              <Text style={styles.ownerName}>de {user?.name}</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="create-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {currentDog?.age ? formatAge(currentDog.age) : '--'}
              </Text>
              <Text style={styles.statLabel}>Edad</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentDog?.weight || '--'} kg</Text>
              <Text style={styles.statLabel}>Peso</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentDog?.breed || 'Mixto'}</Text>
              <Text style={styles.statLabel}>Raza</Text>
            </View>
          </View>

          {currentDog?.chip_id && (
            <View style={styles.chipContainer}>
              <Ionicons name="hardware-chip" size={18} color={Colors.primary} />
              <Text style={styles.chipText}>Chip: {currentDog.chip_id}</Text>
            </View>
          )}
        </Card>

        {/* Pack Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mi manada</Text>
            <TouchableOpacity style={styles.inviteButton}>
              <Ionicons name="person-add-outline" size={18} color={Colors.primary} />
              <Text style={styles.inviteText}>Invitar</Text>
            </TouchableOpacity>
          </View>
          <Card variant="elevated">
            <View style={styles.packMember}>
              <View style={styles.memberAvatar}>
                <Ionicons name="person" size={20} color={Colors.white} />
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{user?.name}</Text>
                <Text style={styles.memberRole}>Dueño principal</Text>
              </View>
              <View style={styles.ownerBadge}>
                <Ionicons name="star" size={14} color={Colors.accent} />
              </View>
            </View>
          </Card>
        </View>

        {/* Clinical File */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ficha Clínica</Text>
          <Card variant="elevated">
            <View style={styles.clinicalRow}>
              <Ionicons name="location-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.clinicalLabel}>País</Text>
              <Text style={styles.clinicalValue}>España</Text>
            </View>
            <View style={styles.clinicalRow}>
              <Ionicons name="medkit-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.clinicalLabel}>Veterinario</Text>
              <Text style={styles.clinicalValue}>Sin asignar</Text>
            </View>
            <View style={styles.clinicalRow}>
              <Ionicons name="alert-circle-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.clinicalLabel}>Alergias</Text>
              <Text style={styles.clinicalValue}>Ninguna registrada</Text>
            </View>
            <TouchableOpacity style={styles.clinicalEdit}>
              <Text style={styles.clinicalEditText}>Editar ficha clínica</Text>
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
              <Text style={styles.proTitle}>Pásate a PRO</Text>
              <Text style={styles.proPrice}>1,99€/mes</Text>
            </View>
          </View>
          <View style={styles.proBenefits}>
            <View style={styles.proBenefit}>
              <Ionicons name="checkmark" size={18} color={Colors.success} />
              <Text style={styles.proBenefitText}>Análisis de video</Text>
            </View>
            <View style={styles.proBenefit}>
              <Ionicons name="checkmark" size={18} color={Colors.success} />
              <Text style={styles.proBenefitText}>Informes veterinarios</Text>
            </View>
            <View style={styles.proBenefit}>
              <Ionicons name="checkmark" size={18} color={Colors.success} />
              <Text style={styles.proBenefitText}>Chat ilimitado con Hani</Text>
            </View>
          </View>
          <Button
            title="Activar PRO"
            onPress={() => {}}
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
                <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
              </TouchableOpacity>
            ))}
          </Card>
        </View>

        {/* Version */}
        <Text style={styles.version}>Heimdall v1.0.0</Text>
      </ScrollView>
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
    paddingBottom: Spacing.xxl,
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
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: 12,
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
  menuItemDanger: {
    color: Colors.error,
  },
  version: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
