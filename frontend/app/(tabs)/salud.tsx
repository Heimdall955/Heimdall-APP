import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { SecureStore } from '../../utils/secureStore';
import { useAuth } from '../../contexts/AuthContext';
import { useBluetooth } from '../../contexts/BluetoothContext';
import { Card, ProgressCircle } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../../constants/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface MedicalEvent {
  id: string;
  type: string;
  title: string;
  date: string;
  icon: string;
  color: string;
}

const eventTypeConfig: Record<string, { icon: string; color: string }> = {
  vaccine: { icon: 'medical', color: Colors.success },
  checkup: { icon: 'clipboard', color: Colors.info },
  deworming: { icon: 'bug', color: Colors.warning },
  medication: { icon: 'medkit', color: Colors.accentEducation },
  note: { icon: 'document-text', color: Colors.gray },
};

export default function SaludScreen() {
  const router = useRouter();
  const { currentDog } = useAuth();
  const { isConnected, biometricData, startSimulation, stopSimulation } = useBluetooth();
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
            <Text style={styles.title}>Salud 360°</Text>
            <Text style={styles.subtitle}>Monitorización biométrica</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/historial-medico')}>
            <Ionicons name="add" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Sensors Status */}
        <Card style={styles.sensorsCard} variant="elevated">
          <View style={styles.sensorsHeader}>
            <View style={styles.sensorsInfo}>
              <View style={[styles.sensorIndicator, isConnected && styles.sensorActive]} />
              <Text style={styles.sensorsTitle}>
                Sensores {isConnected ? 'activos' : 'pausados'}
              </Text>
            </View>
            <View style={styles.batteryContainer}>
              <Ionicons 
                name={biometricData.battery > 20 ? 'battery-half' : 'battery-dead'} 
                size={20} 
                color={biometricData.battery > 20 ? Colors.success : Colors.error} 
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
              color={isConnected ? Colors.text : Colors.white} 
            />
            <Text style={[styles.sensorsButtonText, !isConnected && styles.sensorsButtonTextActive]}>
              {isConnected ? 'Pausar' : 'Conectar'}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Health Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado General</Text>
          <Card variant="elevated">
            <View style={styles.healthGrid}>
              <View style={styles.healthItem}>
                <ProgressCircle 
                  percentage={healthMetrics.physical} 
                  size={80} 
                  color={Colors.primary}
                  label="Físico"
                />
              </View>
              <View style={styles.healthItem}>
                <ProgressCircle 
                  percentage={healthMetrics.sleep} 
                  size={80} 
                  color={Colors.info}
                  label="Sueño"
                />
              </View>
              <View style={styles.healthItem}>
                <ProgressCircle 
                  percentage={healthMetrics.mental} 
                  size={80} 
                  color={Colors.accentEducation}
                  label="Mental"
                />
              </View>
              <View style={styles.healthItem}>
                <ProgressCircle 
                  percentage={healthMetrics.nutrition} 
                  size={80} 
                  color={Colors.success}
                  label="Nutrición"
                />
              </View>
            </View>
          </Card>
        </View>

        {/* Cardio Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cardio</Text>
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
              <Ionicons name="heart" size={24} color={Colors.error} />
              <View style={styles.cardioInfo}>
                <Text style={styles.cardioValue}>
                  {heartRateData[heartRateData.length - 1]} BPM
                </Text>
                <Text style={styles.cardioLabel}>Ritmo cardíaco actual</Text>
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
            <Text style={styles.sectionTitle}>Historial Médico</Text>
            <TouchableOpacity onPress={() => router.push('/historial-medico')}>
              <Text style={styles.viewAllText}>Ver todo</Text>
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
                  <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
                </View>
              ))
            ) : (
              <TouchableOpacity style={styles.emptyEvents} onPress={() => router.push('/historial-medico')}>
                <Ionicons name="add-circle-outline" size={32} color={Colors.primary} />
                <Text style={styles.emptyEventsText}>Añadir primer evento</Text>
              </TouchableOpacity>
            )}
          </Card>
        </View>
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
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
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
    backgroundColor: Colors.gray,
  },
  sensorActive: {
    backgroundColor: Colors.success,
  },
  sensorsTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  batteryText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  sensorsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.grayLight,
  },
  sensorsButtonActive: {
    backgroundColor: Colors.primary,
  },
  sensorsButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  sensorsButtonTextActive: {
    color: Colors.white,
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
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  viewAllText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
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
    backgroundColor: Colors.grayLight,
    borderRadius: BorderRadius.sm,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  periodButtonActive: {
    backgroundColor: Colors.white,
  },
  periodText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  periodTextActive: {
    color: Colors.primary,
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
    color: Colors.text,
  },
  cardioLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.grayLight,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBarFill: {
    backgroundColor: Colors.error + '60',
    borderRadius: 4,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  eventItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
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
    color: Colors.text,
  },
  eventDate: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  emptyEvents: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyEventsText: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: '600',
  },
});
