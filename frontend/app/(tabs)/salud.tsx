import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Card, ProgressCircle } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../../constants/theme';

interface MedicalEvent {
  id: string;
  type: string;
  title: string;
  date: string;
  icon: string;
  color: string;
}

const mockMedicalEvents: MedicalEvent[] = [
  { id: '1', type: 'vaccine', title: 'Vacuna antirrábica', date: '2024-06-15', icon: 'medical', color: Colors.success },
  { id: '2', type: 'checkup', title: 'Revisión general', date: '2024-05-20', icon: 'clipboard', color: Colors.info },
  { id: '3', type: 'deworming', title: 'Desparasitación', date: '2024-04-10', icon: 'bug', color: Colors.warning },
];

export default function SaludScreen() {
  const { currentDog } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [sensorsActive, setSensorsActive] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(78);
  const [chartPeriod, setChartPeriod] = useState<'24h' | '7d'>('24h');

  const healthMetrics = {
    physical: 75,
    sleep: 88,
    mental: 92,
    nutrition: 85,
  };

  // Mock heart rate data
  const heartRateData = chartPeriod === '24h' 
    ? [72, 78, 85, 72, 68, 75, 82, 78]
    : [74, 76, 78, 75, 72, 70, 73, 77, 80, 75, 72, 74];

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const toggleSensors = () => {
    setSensorsActive(!sensorsActive);
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
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Sensors Status */}
        <Card style={styles.sensorsCard} variant="elevated">
          <View style={styles.sensorsHeader}>
            <View style={styles.sensorsInfo}>
              <View style={[styles.sensorIndicator, sensorsActive && styles.sensorActive]} />
              <Text style={styles.sensorsTitle}>
                Sensores {sensorsActive ? 'activos' : 'pausados'}
              </Text>
            </View>
            <View style={styles.batteryContainer}>
              <Ionicons 
                name={batteryLevel > 20 ? 'battery-half' : 'battery-dead'} 
                size={20} 
                color={batteryLevel > 20 ? Colors.success : Colors.error} 
              />
              <Text style={styles.batteryText}>{batteryLevel}%</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.sensorsButton, !sensorsActive && styles.sensorsButtonActive]} 
            onPress={toggleSensors}
          >
            <Ionicons 
              name={sensorsActive ? 'pause' : 'play'} 
              size={20} 
              color={sensorsActive ? Colors.text : Colors.white} 
            />
            <Text style={[styles.sensorsButtonText, !sensorsActive && styles.sensorsButtonTextActive]}>
              {sensorsActive ? 'Pausar' : 'Reanudar'}
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
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Ver todo</Text>
            </TouchableOpacity>
          </View>
          <Card variant="elevated">
            {mockMedicalEvents.map((event, index) => (
              <View key={event.id} style={[styles.eventItem, index < mockMedicalEvents.length - 1 && styles.eventItemBorder]}>
                <View style={[styles.eventIcon, { backgroundColor: event.color + '20' }]}>
                  <Ionicons name={event.icon as any} size={20} color={event.color} />
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{new Date(event.date).toLocaleDateString('es-ES')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
              </View>
            ))}
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
});
