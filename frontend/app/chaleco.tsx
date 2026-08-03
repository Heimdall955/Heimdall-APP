import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useBluetooth } from '../contexts/BluetoothContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui';
import { Spacing, BorderRadius, FontSizes } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

export default function ChalecoScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { colors, shadows } = useTheme();
  const {
    isScanning, isConnected, isDemo, biometricData, scannedDevices, connectionState,
    startScan, stopScan, connectToDevice, disconnect, startSimulation, stopSimulation,
  } = useBluetooth();

  const [connectingDeviceId, setConnectingDeviceId] = useState<string | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isConnected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isConnected]);

  const handleStartScan = async () => {
    try {
      await startScan();
    } catch (error: any) {
      // Error already handled in BluetoothContext
    }
  };

  const handleConnect = async (deviceId: string) => {
    setConnectingDeviceId(deviceId);
    const success = await connectToDevice(deviceId);
    setConnectingDeviceId(null);
    if (success) {
      Alert.alert('Conectado', 'Chaleco HEIMDALL conectado correctamente');
    }
  };

  const handleDisconnect = () => {
    if (isDemo) {
      stopSimulation();
      return;
    }
    Alert.alert('Desconectar', 'Quieres desconectar el chaleco?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Desconectar', style: 'destructive', onPress: disconnect },
    ]);
  };

  const getSignalBars = (rssi: number | null) => {
    if (!rssi) return 1;
    if (rssi > -55) return 4;
    if (rssi > -65) return 3;
    if (rssi > -75) return 2;
    return 1;
  };

  const s = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn} testID="vest-back-btn">
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>HEIMDALL Vest</Text>
            <Text style={s.subtitle}>HEIMDALL BioVest</Text>
          </View>
          {isConnected && (
            <View style={[s.connectedBadge, isDemo && { backgroundColor: '#FF980018' }]} testID="connected-badge">
              <View style={[s.connectedDot, isDemo && { backgroundColor: '#FF9800' }]} />
              <Text style={[s.connectedText, isDemo && { color: '#FF9800' }]}>{isDemo ? 'Demo' : 'Online'}</Text>
            </View>
          )}
        </View>

        {/* Demo data label - always visible in demo mode */}
        {isConnected && isDemo && (
          <View style={s.demoBanner} testID="demo-data-banner">
            <Ionicons name="flask" size={18} color="#B45309" />
            <Text style={s.demoBannerText}>{t('demoDataLabel')}</Text>
          </View>
        )}

        {/* No sensor data warning - real device connected but no readings */}
        {isConnected && !isDemo && biometricData.heartRate === null && (
          <View style={s.noDataBanner} testID="no-sensor-data-banner">
            <Ionicons name="warning" size={18} color="#B45309" />
            <Text style={s.noDataBannerText}>{t('sensorNoData')}</Text>
          </View>
        )}

        {/* Connection Card */}
        {!isConnected && (
          <Card style={s.scanCard}>
            <View style={s.scanIllustration}>
              <View style={s.vestCircle}>
                <Ionicons name="shirt" size={40} color={colors.primary} />
              </View>
              {isScanning && (
                <>
                  <Animated.View style={[s.scanRing, s.scanRing1]} />
                  <Animated.View style={[s.scanRing, s.scanRing2]} />
                </>
              )}
            </View>

            <Text style={s.scanTitle}>
              {isScanning ? 'Buscando chaleco...' : 'Conecta tu chaleco'}
            </Text>
            <Text style={s.scanSubtitle}>
              {isScanning ? 'Asegurate de que este encendido y cerca' : 'Enciende el chaleco HEIMDALL y pulsa buscar'}
            </Text>

            <TouchableOpacity
              style={[s.scanBtn, isScanning && { backgroundColor: colors.error }]}
              onPress={isScanning ? stopScan : handleStartScan}
              testID="scan-btn"
            >
              <Ionicons name={isScanning ? 'stop' : 'bluetooth'} size={22} color="#FFF" />
              <Text style={s.scanBtnText}>{isScanning ? 'Detener' : 'Buscar dispositivos'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.demoBtn} onPress={startSimulation} testID="demo-mode-btn">
              <Ionicons name="flask-outline" size={18} color={colors.textSecondary} />
              <Text style={s.demoBtnText}>{t('demoMode')}</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Scanned Devices */}
        {!isConnected && scannedDevices.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Dispositivos encontrados</Text>
            {scannedDevices.map((device) => {
              const bars = getSignalBars(device.rssi);
              return (
                <TouchableOpacity
                  key={device.id}
                  style={[s.deviceCard, device.isHeimdallVest && s.deviceCardHeimdall]}
                  onPress={() => handleConnect(device.id)}
                  disabled={connectingDeviceId !== null}
                  testID={`device-${device.id}`}
                >
                  <View style={[s.deviceIcon, device.isHeimdallVest && { backgroundColor: colors.primary }]}>
                    <Ionicons name={device.isHeimdallVest ? 'paw' : 'bluetooth'} size={22} color={device.isHeimdallVest ? '#FFF' : colors.primary} />
                  </View>
                  <View style={s.deviceInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={s.deviceName}>{device.name || 'Sensor'}</Text>
                      {device.isHeimdallVest && (
                        <View style={s.heimdallTag}><Text style={s.heimdallTagText}>HEIMDALL</Text></View>
                      )}
                    </View>
                    <View style={s.signalRow}>
                      {[1,2,3,4].map(i => (
                        <View key={i} style={[s.signalBar, { height: 4 + i * 3, backgroundColor: i <= bars ? colors.primary : colors.grayLight }]} />
                      ))}
                      <Text style={s.signalText}>{device.rssi} dBm</Text>
                    </View>
                  </View>
                  {connectingDeviceId === device.id ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color={colors.gray} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Biometric Dashboard */}
        {isConnected && (
          <>
            {/* Vital signs grid */}
            <View style={s.vitalsGrid}>
              {/* Heart Rate - Large */}
              <Card style={s.vitalCardLg} testID="heart-rate-card">
                <View style={s.vitalHeader}>
                  <View style={[s.vitalIcon, { backgroundColor: '#FF4B4B18' }]}>
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                      <Ionicons name="heart" size={24} color="#FF4B4B" />
                    </Animated.View>
                  </View>
                  <Text style={s.vitalLabel}>Frecuencia Cardiaca</Text>
                </View>
                <View style={s.vitalValueRow}>
                  <Text style={[s.vitalValueLg, { color: biometricData.heartRate !== null ? '#FF4B4B' : colors.textLight }]}>
                    {biometricData.heartRate !== null ? biometricData.heartRate : '--'}
                  </Text>
                  <Text style={s.vitalUnit}>BPM</Text>
                </View>
                {isDemo && (
                  <View style={s.demoTag}><Text style={s.demoTagText}>{t('demoDataLabel')}</Text></View>
                )}
              </Card>
            </View>

            <View style={s.vitalsGrid}>
              {/* Activity */}
              <Card style={s.vitalCardSm} testID="activity-card">
                <View style={[s.vitalIcon, { backgroundColor: getActivityColor(biometricData.movement) + '18', alignSelf: 'flex-start' }]}>
                  <Ionicons name="walk" size={22} color={getActivityColor(biometricData.movement)} />
                </View>
                <Text style={s.vitalLabelSm}>Actividad</Text>
                <Text style={[s.vitalValueSm, { color: getActivityColor(biometricData.movement) }]}>
                  {biometricData.movement === 'low' ? 'Baja' : biometricData.movement === 'medium' ? 'Media' : biometricData.movement === 'high' ? 'Alta' : '--'}
                </Text>
              </Card>

              {/* Battery */}
              <Card style={s.vitalCardSm} testID="battery-card">
                <View style={[s.vitalIcon, { backgroundColor: (biometricData.battery ?? 0) > 20 ? '#4CAF5018' : '#8888880F', alignSelf: 'flex-start' }]}>
                  <Ionicons name={(biometricData.battery ?? 0) > 50 ? 'battery-full' : (biometricData.battery ?? 0) > 20 ? 'battery-half' : 'battery-dead'} size={22} color={biometricData.battery === null ? colors.textLight : biometricData.battery > 20 ? '#4CAF50' : '#FF4B4B'} />
                </View>
                <Text style={s.vitalLabelSm}>Bateria</Text>
                <Text style={[s.vitalValueSm, { color: biometricData.battery === null ? colors.textLight : biometricData.battery > 20 ? '#4CAF50' : '#FF4B4B' }]}>
                  {biometricData.battery !== null ? `${biometricData.battery}%` : '--'}
                </Text>
                {biometricData.battery !== null && (
                  <View style={s.batteryTrack}>
                    <View style={[s.batteryFill, { width: `${biometricData.battery}%`, backgroundColor: biometricData.battery > 20 ? '#4CAF50' : '#FF4B4B' }]} />
                  </View>
                )}
              </Card>
            </View>

            {/* Device Info & Disconnect */}
            <Card style={s.deviceInfoCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
                <View style={[s.vitalIcon, { backgroundColor: colors.primary + '18' }]}>
                  <Ionicons name="shirt" size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.deviceInfoName}>{biometricData.deviceName || 'HEIMDALL BioVest'}</Text>
                  <Text style={s.deviceInfoSub}>{isDemo ? t('demoDataLabel') : 'HEIMDALL BioVest'}</Text>
                </View>
                <TouchableOpacity style={s.disconnectBtn} onPress={handleDisconnect} testID="disconnect-btn">
                  <Ionicons name="power" size={18} color="#FF4B4B" />
                  <Text style={s.disconnectText}>{isDemo ? t('exitDemoMode') : 'Desconectar'}</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </>
        )}

        {/* How to connect guide */}
        {!isConnected && !isScanning && scannedDevices.length === 0 && (
          <Card style={s.guideCard}>
            <Text style={s.guideTitle}>Como conectar</Text>
            {[
              { step: '1', icon: 'power', text: 'Enciende el chaleco HEIMDALL' },
              { step: '2', icon: 'bluetooth', text: 'Pulsa "Buscar dispositivos"' },
              { step: '3', icon: 'link', text: 'Selecciona tu chaleco de la lista' },
            ].map((item, idx) => (
              <View key={idx} style={s.guideStep}>
                <View style={s.guideNum}><Text style={s.guideNumText}>{item.step}</Text></View>
                <Ionicons name={item.icon as any} size={18} color={colors.primary} />
                <Text style={s.guideText}>{item.text}</Text>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getActivityColor(movement: string) {
  return movement === 'low' ? '#2196F3' : movement === 'medium' ? '#FF9800' : movement === 'high' ? '#FF4B4B' : '#9AA5A0';
}

const createStyles = (C: any, S: any) => StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: FontSizes.xxl, fontWeight: '800', color: C.text, letterSpacing: 0.5 },
  subtitle: { fontSize: FontSizes.sm, color: C.textSecondary, marginTop: 2 },
  connectedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#4CAF5018', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  connectedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50' },
  connectedText: { fontSize: FontSizes.sm, fontWeight: '600', color: '#4CAF50' },

  // Scan Card
  scanCard: { alignItems: 'center', paddingVertical: Spacing.xl, marginBottom: Spacing.lg },
  scanIllustration: { alignItems: 'center', justifyContent: 'center', width: 120, height: 120, marginBottom: Spacing.lg },
  vestCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.primary + '15', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  scanRing: { position: 'absolute', borderRadius: 100, borderWidth: 2, borderColor: C.primary + '30' },
  scanRing1: { width: 100, height: 100 },
  scanRing2: { width: 120, height: 120 },
  scanTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: C.text, marginBottom: Spacing.xs },
  scanSubtitle: { fontSize: FontSizes.md, color: C.textSecondary, textAlign: 'center', marginBottom: Spacing.lg, paddingHorizontal: Spacing.lg },
  scanBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: C.primary, paddingHorizontal: Spacing.xl, paddingVertical: 14, borderRadius: BorderRadius.lg },
  scanBtnText: { fontSize: FontSizes.md, fontWeight: '700', color: '#FFF' },
  demoBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: Spacing.md, paddingVertical: 10, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: C.grayLight },
  demoBtnText: { fontSize: FontSizes.sm, fontWeight: '600', color: C.textSecondary },
  demoBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#F59E0B60', borderRadius: BorderRadius.lg, paddingVertical: 10, marginBottom: Spacing.md },
  demoBannerText: { fontSize: FontSizes.sm, fontWeight: '800', color: '#B45309', letterSpacing: 1 },
  noDataBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#F59E0B60', borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  noDataBannerText: { flex: 1, fontSize: FontSizes.sm, fontWeight: '600', color: '#B45309' },
  demoTag: { alignSelf: 'flex-start', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: Spacing.sm },
  demoTagText: { fontSize: 10, fontWeight: '800', color: '#B45309', letterSpacing: 0.5 },

  // Devices
  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: C.text, marginBottom: Spacing.sm },
  deviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.cardBg, padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm, ...S.sm },
  deviceCardHeimdall: { borderWidth: 2, borderColor: C.primary },
  deviceIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.primary + '15', alignItems: 'center', justifyContent: 'center' },
  deviceInfo: { flex: 1, marginLeft: Spacing.md },
  deviceName: { fontSize: FontSizes.md, fontWeight: '600', color: C.text },
  heimdallTag: { backgroundColor: C.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  heimdallTagText: { fontSize: 9, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },
  signalRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, marginTop: 4 },
  signalBar: { width: 4, borderRadius: 2 },
  signalText: { fontSize: 10, color: C.textSecondary, marginLeft: 6 },

  // Vitals Grid
  vitalsGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  vitalCardLg: { flex: 1 },
  vitalCardSm: { flex: 1 },
  vitalHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  vitalIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  vitalLabel: { fontSize: FontSizes.sm, color: C.textSecondary, flex: 1 },
  vitalLabelSm: { fontSize: FontSizes.sm, color: C.textSecondary, marginTop: Spacing.sm },
  vitalValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  vitalValueLg: { fontSize: 36, fontWeight: '800' },
  vitalValueSm: { fontSize: FontSizes.xxl, fontWeight: '800', marginTop: 4 },
  vitalUnit: { fontSize: FontSizes.sm, color: C.textSecondary, fontWeight: '600' },
  vitalStatus: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: FontSizes.sm, color: C.textSecondary },

  // Battery
  batteryTrack: { height: 4, backgroundColor: C.grayLight, borderRadius: 2, marginTop: Spacing.sm },
  batteryFill: { height: '100%', borderRadius: 2 },

  // Device Info
  deviceInfoCard: { marginTop: Spacing.sm },
  deviceInfoName: { fontSize: FontSizes.md, fontWeight: '700', color: C.text },
  deviceInfoSub: { fontSize: FontSizes.sm, color: C.textSecondary },
  disconnectBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FF4B4B12', paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.md },
  disconnectText: { fontSize: FontSizes.sm, fontWeight: '600', color: '#FF4B4B' },

  // Guide
  guideCard: { marginTop: Spacing.md },
  guideTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: C.text, marginBottom: Spacing.md },
  guideStep: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  guideNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  guideNumText: { fontSize: FontSizes.sm, fontWeight: '700', color: '#FFF' },
  guideText: { flex: 1, fontSize: FontSizes.md, color: C.text },
});
