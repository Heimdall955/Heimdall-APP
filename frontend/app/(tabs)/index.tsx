import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Card, StatusBadge, ProgressCircle } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../../constants/theme';
import { DogStatus } from '../../types';

const quickAccessItems = [
  { id: 'ficha', icon: 'paw', label: 'Ficha', color: Colors.primary, route: '/(tabs)/perfil' },
  { id: 'rutas', icon: 'map', label: 'Rutas GPS', color: Colors.accent, route: null },
  { id: 'juegos', icon: 'game-controller', label: 'Juegos', color: Colors.accentEducation, route: null },
  { id: 'educacion', icon: 'school', label: 'Educación', color: '#FF6B6B', route: '/(tabs)/educacion' },
  { id: 'salud', icon: 'heart', label: 'Salud', color: Colors.success, route: '/(tabs)/salud' },
  { id: 'historial', icon: 'time', label: 'Historial', color: Colors.info, route: '/(tabs)/salud' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { currentDog, user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [dogStatus, setDogStatus] = useState<DogStatus>({
    status: 'calm',
    bones: 340,
    level_progress: 340,
    level_target: 500,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const handleQuickAccess = (route: string | null) => {
    if (route) {
      router.push(route as any);
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
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.dogName}>
              {currentDog?.name || 'Tu perro'} <Text style={styles.paw}>🐾</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={26} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Status Card */}
        <Card style={styles.statusCard} variant="elevated">
          <View style={styles.statusHeader}>
            <View style={styles.statusLeft}>
              <View style={styles.dogAvatar}>
                <Ionicons name="paw" size={32} color={Colors.white} />
              </View>
              <View>
                <Text style={styles.statusTitle}>{currentDog?.name}</Text>
                <StatusBadge status={dogStatus.status} />
              </View>
            </View>
            <TouchableOpacity style={styles.connectButton}>
              <Ionicons name="bluetooth" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentDog?.weight || '--'}</Text>
              <Text style={styles.statLabel}>kg</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {currentDog?.age ? Math.floor(currentDog.age / 12) : '--'}
              </Text>
              <Text style={styles.statLabel}>años</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentDog?.breed || 'Mixto'}</Text>
              <Text style={styles.statLabel}>raza</Text>
            </View>
          </View>
        </Card>

        {/* Bones Card */}
        <Card style={styles.bonesCard}>
          <View style={styles.bonesContent}>
            <View style={styles.bonesLeft}>
              <View style={styles.boneIcon}>
                <Text style={styles.boneEmoji}>🦴</Text>
              </View>
              <View>
                <Text style={styles.bonesTitle}>Huesos Heimdall</Text>
                <Text style={styles.bonesValue}>{dogStatus.bones} huesos</Text>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(dogStatus.level_progress / dogStatus.level_target) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {dogStatus.level_progress}/{dogStatus.level_target} para PRO
              </Text>
            </View>
          </View>
        </Card>

        {/* Quick Access */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accesos rápidos</Text>
          <View style={styles.quickAccessGrid}>
            {quickAccessItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.quickAccessItem}
                onPress={() => handleQuickAccess(item.route)}
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon as any} size={28} color={item.color} />
                </View>
                <Text style={styles.quickAccessLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actividad de hoy</Text>
          <Card variant="elevated">
            <View style={styles.activityRow}>
              <View style={styles.activityItem}>
                <ProgressCircle percentage={75} size={70} color={Colors.primary} label="Físico" />
              </View>
              <View style={styles.activityItem}>
                <ProgressCircle percentage={88} size={70} color={Colors.info} label="Sueño" />
              </View>
              <View style={styles.activityItem}>
                <ProgressCircle percentage={92} size={70} color={Colors.accentEducation} label="Mental" />
              </View>
            </View>
          </Card>
        </View>

        {/* Chat Promo */}
        <TouchableOpacity onPress={() => router.push('/(tabs)/chat')}>
          <Card style={styles.chatPromo} variant="elevated">
            <View style={styles.chatPromoContent}>
              <View style={styles.chatPromoIcon}>
                <Ionicons name="chatbubbles" size={32} color={Colors.white} />
              </View>
              <View style={styles.chatPromoText}>
                <Text style={styles.chatPromoTitle}>¿Tienes dudas?</Text>
                <Text style={styles.chatPromoSubtitle}>Pregúntale a Hani, tu asistente IA</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
            </View>
          </Card>
        </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  dogName: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  paw: {
    fontSize: FontSizes.xl,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  statusCard: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.secondary,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dogAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  connectButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.white,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bonesCard: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.accent + '15',
    borderWidth: 1,
    borderColor: Colors.accent + '30',
  },
  bonesContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bonesLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  boneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boneEmoji: {
    fontSize: 24,
  },
  bonesTitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  bonesValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  progressContainer: {
    alignItems: 'flex-end',
  },
  progressBar: {
    width: 100,
    height: 8,
    backgroundColor: Colors.grayLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  progressText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  quickAccessItem: {
    width: '30%',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  quickAccessIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAccessLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.text,
    textAlign: 'center',
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.sm,
  },
  activityItem: {
    alignItems: 'center',
  },
  chatPromo: {
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  chatPromoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  chatPromoIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatPromoText: {
    flex: 1,
  },
  chatPromoTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text,
  },
  chatPromoSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
});
