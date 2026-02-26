import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { SecureStore } from '../../utils/secureStore';
import { useAuth } from '../../contexts/AuthContext';
import { useBluetooth } from '../../contexts/BluetoothContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, ProgressCircle } from '../../components/ui';
import { Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface MedicalEvent {
  id: string;
  type: string;
  title: string;
  date: string;
  icon: string;
  color: string;
}

export default function SaludScreen() {
  const router = useRouter();
  const { currentDog } = useAuth();
  const { isConnected, biometricData, startSimulation, stopSimulation } = useBluetooth();
  const { t } = useLanguage();
  const { colors, shadows } = useTheme();
  const EVENT_TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
    vaccine: { icon: 'medical', color: colors.success },
    checkup: { icon: 'clipboard', color: colors.info },
    deworming: { icon: 'bug', color: colors.warning },
    medication: { icon: 'medkit', color: colors.accentEducation },
    note: { icon: 'document-text', color: colors.gray },
  };
  const [refreshing, setRefreshing] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'24h' | '7d'>('24h');
  const [medicalEvents, setMedicalEvents] = useState<MedicalEvent[]>([]);
  const [heartRateHistory, setHeartRateHistory] = useState<number[]>([72, 78, 85, 72, 68, 75, 82, 78]);

  // Update heart rate history from biometric data
  useEffect(() => {
    if (isConnected && biometricData.heartRate > 0) {
      setHeartRateHistory(prev => {
        const newHistory = [...prev.slice(-11), biometricData.heartRate];
        return newHistory;
      });
    }
  }, [isConnected, biometricData.heartRate]);

  const loadMedicalEvents = useCallback(async () => {
    if (!currentDog) return;
    
    try {
      const token = await SecureStore.getItemAsync('session_token');
      const response = await axios.get(
        `${BACKEND_URL}/api/medical-events/${currentDog.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const events = response.data.slice(0, 3).map((e: any) => ({
        id: e.id,
        type: e.type,
        title: e.title,
        date: e.date,
        ...eventTypeConfig[e.type] || eventTypeConfig.note,
      }));
      
      setMedicalEvents(events);
    } catch (error) {
      console.log('Error loading medical events');
    }
  }, [currentDog]);

  useEffect(() => {
    loadMedicalEvents();
  }, [loadMedicalEvents]);

  // Calculate health metrics based on biometric data
  const healthMetrics = {
    physical: isConnected ? Math.min(100, Math.max(50, 100 - Math.abs(biometricData.heartRate - 75))) : 75,
    sleep: isConnected && biometricData.movement === 'low' ? 88 : 75,
    mental: isConnected ? (biometricData.heartRate < 100 ? 92 : 70) : 85,
    nutrition: 85,
  };

  const heartRateData = chartPeriod === '24h' 
    ? heartRateHistory.slice(-8)
    : heartRateHistory;

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMedicalEvents();
    setRefreshing(false);
  };

  const toggleSensors = () => {
    if (isConnected) {
      stopSimulation();
    } else {
      startSimulation();
    }
  };

  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t('health360')}</Text>
            <Text style={styles.subtitle}>{t('realTimeMonitoring')}</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/historial-medico')}>
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Sensors Status */}
        <Card style={styles.sensorsCard} variant="elevated">
          <View style={styles.sensorsHeader}>
            <View style={styles.sensorsInfo}>
              <View style={[styles.sensorIndicator, isConnected && styles.sensorActive]} />
              <Text style={styles.sensorsTitle}>
                {isConnected ? t('vestConnected') : t('vestDisconnected')}
              </Text>
            </View>
            <View style={styles.batteryContainer}>
              <Ionicons 
                name={biometricData.battery > 20 ? 'battery-half' : 'battery-dead'} 
                size={20} 
                color={biometricData.battery > 20 ? colors.success : colors.error} 
              />
              <Text style={styles.batteryText}>{isConnected ? biometricData.battery : '--'}%</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.sensorsButton, !isConnected && styles.sensorsButtonActive]} 
            onPress={toggleSensors}
          >
            <Ionicons 
              name={isConnected ? 'pause' : 'play'} 
              size={20} 
              color={isConnected ? colors.text : colors.white} 
            />
            <Text style={[styles.sensorsButtonText, !isConnected && styles.sensorsButtonTextActive]}>
              {isConnected ? t('stop') : t('connectVest')}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Health Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('vitalSigns')}</Text>
          <Card variant="elevated">
            <View style={styles.healthGrid}>
              <View style={styles.healthItem}>
                <ProgressCircle 
                  percentage={healthMetrics.physical} 
                  size={80} 
                  color={colors.primary}
                  label={t('activity')}
                />
              </View>
              <View style={styles.healthItem}>
                <ProgressCircle 
                  percentage={healthMetrics.sleep} 
                  size={80} 
                  color={colors.info}
                  label={t('sleeping')}
                />
              </View>
              <View style={styles.healthItem}>
                <ProgressCircle 
                  percentage={healthMetrics.mental} 
                  size={80} 
                  color={colors.accentEducation}
                  label={t('stress')}
                />
              </View>
              <View style={styles.healthItem}>
                <ProgressCircle 
                  percentage={healthMetrics.nutrition} 
                  size={80} 
                  color={colors.success}
                  label={t('normal')}
                />
              </View>
            </View>
          </Card>
        </View>

        {/* Cardio Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('heartRate')}</Text>
            <View style={styles.periodSelector}>
              <TouchableOpacity 
                style={[styles.periodButton, chartPeriod === '24h' && styles.periodButtonActive]}
                onPress={() => setChartPeriod('24h')}
              >
                <Text style={[styles.periodText, chartPeriod === '24h' && styles.periodTextActive]}>24h</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.periodButton, chartPeriod === '7d' && styles.periodButtonActive]}
                onPress={() => setChartPeriod('7d')}
              >
                <Text style={[styles.periodText, chartPeriod === '7d' && styles.periodTextActive]}>7d</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Card variant="elevated">
            <View style={styles.cardioHeader}>
              <Ionicons name="heart" size={24} color={colors.error} />
              <View style={styles.cardioInfo}>
                <Text style={styles.cardioValue}>
                  {heartRateData[heartRateData.length - 1]} {t('bpm').toUpperCase()}
                </Text>
                <Text style={styles.cardioLabel}>{t('heartRate')}</Text>
              </View>
            </View>
            {/* Simple bar chart */}
            <View style={styles.chartContainer}>
              {heartRateData.map((value, index) => (
                <View key={index} style={styles.chartBar}>
                  <View 
                    style={[
                      styles.chartBarFill, 
                      { height: `${(value / 100) * 100}%` }
                    ]} 
                  />
                </View>
              ))}
            </View>
            <View style={styles.chartLabels}>
              <Text style={styles.chartLabel}>Min: {Math.min(...heartRateData)}</Text>
              <Text style={styles.chartLabel}>Prom: {Math.round(heartRateData.reduce((a, b) => a + b) / heartRateData.length)}</Text>
              <Text style={styles.chartLabel}>Max: {Math.max(...heartRateData)}</Text>
            </View>
          </Card>
        </View>

        {/* Medical History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('medicalHistory')}</Text>
            <TouchableOpacity onPress={() => router.push('/historial-medico')}>
              <Text style={styles.viewAllText}>{t('viewAll')}</Text>
            </TouchableOpacity>
          </View>
          <Card variant="elevated">
            {medicalEvents.length > 0 ? (
              medicalEvents.map((event, index) => (
                <View key={event.id} style={[styles.eventItem, index < medicalEvents.length - 1 && styles.eventItemBorder]}>
                  <View style={[styles.eventIcon, { backgroundColor: event.color + '20' }]}>
                    <Ionicons name={event.icon as any} size={20} color={event.color} />
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDate}>{new Date(event.date).toLocaleDateString('es-ES')}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.gray} />
                </View>
              ))
            ) : (
              <TouchableOpacity style={styles.emptyEvents} onPress={() => router.push('/historial-medico')}>
                <Ionicons name="add-circle-outline" size={32} color={colors.primary} />
                <Text style={styles.emptyEventsText}>{t('addEvent')}</Text>
              </TouchableOpacity>
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (C: any, S: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
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
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: C.text,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: C.textSecondary,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...S.md,
  },
  sensorsCard: {
    marginBottom: Spacing.lg,
  },
  sensorsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sensorsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sensorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.gray,
  },
  sensorActive: {
    backgroundColor: C.success,
  },
  sensorsTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: C.text,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  batteryText: {
    fontSize: FontSizes.sm,
    color: C.textSecondary,
  },
  sensorsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: C.grayLight,
  },
  sensorsButtonActive: {
    backgroundColor: C.primary,
  },
  sensorsButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: C.text,
  },
  sensorsButtonTextActive: {
    color: C.white,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: C.text,
    marginBottom: Spacing.sm,
  },
  viewAllText: {
    fontSize: FontSizes.sm,
    color: C.primary,
    fontWeight: '600',
  },
  healthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: Spacing.sm,
  },
  healthItem: {
    width: '45%',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: C.grayLight,
    borderRadius: BorderRadius.sm,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  periodButtonActive: {
    backgroundColor: C.white,
  },
  periodText: {
    fontSize: FontSizes.sm,
    color: C.textSecondary,
  },
  periodTextActive: {
    color: C.primary,
    fontWeight: '600',
  },
  cardioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardioInfo: {
    flex: 1,
  },
  cardioValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: C.text,
  },
  cardioLabel: {
    fontSize: FontSizes.sm,
    color: C.textSecondary,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 100,
    gap: 4,
    alignItems: 'flex-end',
    marginBottom: Spacing.sm,
  },
  chartBar: {
    flex: 1,
    height: '100%',
    backgroundColor: C.grayLight,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBarFill: {
    backgroundColor: C.error + '60',
    borderRadius: 4,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartLabel: {
    fontSize: FontSizes.xs,
    color: C.textSecondary,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  eventItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.grayLight,
  },
  eventIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  eventTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: C.text,
  },
  eventDate: {
    fontSize: FontSizes.sm,
    color: C.textSecondary,
  },
  emptyEvents: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyEventsText: {
    fontSize: FontSizes.md,
    color: C.primary,
    fontWeight: '600',
  },
});
