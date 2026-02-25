import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useBluetooth } from '../contexts/BluetoothContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, Button } from '../components/ui';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

export default function ChalecoScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const {
    isScanning,
    isConnected,
    biometricData,
    scannedDevices,
    connectionState,
    startScan,
    stopScan,
    connectToDevice,
    disconnect,
    startSimulation,
    stopSimulation,
  } = useBluetooth();

  const [connectingDeviceId, setConnectingDeviceId] = useState<string | null>(null);

  const handleStartScan = async () => {
    console.log('Starting scan...');
    try {
      await startScan();
    } catch (error: any) {
      console.log('Scan error:', error);
      Alert.alert(
        'Error de Bluetooth', 
        error.message || 'No se pudo iniciar el escaneo. ¿Quieres usar el simulador?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Usar Simulador', onPress: startSimulation },
        ]
      );
    }
  };

  const handleConnect = async (deviceId: string) => {
    setConnectingDeviceId(deviceId);
    const success = await connectToDevice(deviceId);
    setConnectingDeviceId(null);
    
    if (success) {
      Alert.alert(t('connected'), t('vestConnected'));
    } else {
      Alert.alert(t('error'), t('deviceNotFound'));
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      t('disconnectDevice'),
      t('disconnectConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('disconnectDevice'), style: 'destructive', onPress: disconnect },
      ]
    );
  };

  const getMovementLabel = (movement: string) => {
    switch (movement) {
      case 'low': return t('low');
      case 'medium': return t('medium');
      case 'high': return t('high');
      default: return t('error');
    }
  };

  const getMovementColor = (movement: string) => {
    switch (movement) {
      case 'low': return Colors.info;
      case 'medium': return Colors.accent;
      case 'high': return Colors.error;
      default: return Colors.gray;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>{t('heimdallVest')}</Text>
            <Text style={styles.subtitle}>Bluetooth ESP32</Text>
          </View>
        </View>

        {/* Connection Status */}
        <Card style={styles.statusCard} variant="elevated">
          <View style={styles.statusHeader}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: isConnected ? Colors.success : Colors.gray }
            ]} />
            <Text style={styles.statusText}>
              {isConnected ? t('connected') : isScanning ? t('searching') : t('disconnected')}
            </Text>
          </View>
          
          {isConnected && biometricData.deviceName && (
            <Text style={styles.deviceName}>{biometricData.deviceName}</Text>
          )}

          {isConnected ? (
            <Button
              title={t('disconnectDevice')}
              onPress={handleDisconnect}
              variant="outline"
              style={styles.actionButton}
            />
          ) : (
            <View style={styles.buttonRow}>
              <Button
                title={isScanning ? t('stopScanning') : t('scanForDevices')}
                onPress={isScanning ? stopScan : handleStartScan}
                loading={isScanning}
                style={styles.scanButton}
                icon={<Ionicons name={isScanning ? 'stop' : 'bluetooth'} size={20} color={Colors.white} />}
              />
              <Button
                title={t('useSimulator')}
                onPress={startSimulation}
                variant="secondary"
                style={styles.simButton}
                icon={<Ionicons name="pulse" size={20} color={Colors.white} />}
              />
            </View>
          )}
        </Card>

        {/* Scanned Devices */}
        {!isConnected && scannedDevices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('availableDevices')}</Text>
            {scannedDevices.map((device) => (
              <Card key={device.id} style={[styles.deviceCard, device.isHeimdallVest ? styles.heimdallCard : null]} variant="elevated">
                <View style={styles.deviceRow}>
                  <View style={[styles.deviceIcon, device.isHeimdallVest && styles.heimdallIcon]}>
                    <Ionicons 
                      name={device.isHeimdallVest ? "paw" : "bluetooth"} 
                      size={24} 
                      color={device.isHeimdallVest ? Colors.white : Colors.primary} 
                    />
                  </View>
                  <View style={styles.deviceInfo}>
                    <View style={styles.deviceNameRow}>
                      <Text style={styles.deviceCardName}>{device.name || t('esp32Device')}</Text>
                      {device.isHeimdallVest && (
                        <View style={styles.heimdallBadge}>
                          <Text style={styles.heimdallBadgeText}>HEIMDALL</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.deviceRssi}>
                      {t('signalStrength')}: {device.rssi} dBm 
                      {device.rssi && device.rssi > -60 ? ' 📶📶📶' : device.rssi && device.rssi > -75 ? ' 📶📶' : ' 📶'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.connectButton, device.isHeimdallVest && styles.heimdallConnectButton]}
                    onPress={() => handleConnect(device.id)}
                    disabled={connectingDeviceId !== null}
                  >
                    {connectingDeviceId === device.id ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <Ionicons name="link" size={20} color={Colors.white} />
                    )}
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Scanning indicator */}
        {isScanning && scannedDevices.length === 0 && (
          <Card style={styles.scanningCard}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.scanningText}>{t('searching')}...</Text>
            <Text style={styles.scanningHint}>Asegúrate de que el chaleco esté encendido y cerca</Text>
          </Card>
        )}

        {/* Info when not connected */}
        {!isConnected && !isScanning && scannedDevices.length === 0 && (
          <Card style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={24} color={Colors.primary} />
              <Text style={styles.infoTitle}>{t('howToConnect')}</Text>
            </View>
            <View style={styles.infoStep}>
              <Text style={styles.infoNumber}>1</Text>
              <Text style={styles.infoText}>{t('turnOnVest')}</Text>
            </View>
            <View style={styles.infoStep}>
              <Text style={styles.infoNumber}>2</Text>
              <Text style={styles.infoText}>{t('pressSearchButton')}</Text>
            </View>
            <View style={styles.infoStep}>
              <Text style={styles.infoNumber}>3</Text>
              <Text style={styles.infoText}>{t('selectDevice')}</Text>
            </View>
            
            <View style={styles.infoDivider} />
            
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={20} color={Colors.accent} />
              <Text style={styles.warningText}>
                {t('bleNotAvailableInExpoGo')}
              </Text>
            </View>
          </Card>
        )}

        {/* Biometric Data */}
        {isConnected && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('biometrics')}</Text>
            
            {/* Heart Rate */}
            <Card style={styles.biometricCard} variant="elevated">
              <View style={styles.biometricRow}>
                <View style={[styles.biometricIcon, { backgroundColor: Colors.error + '20' }]}>
                  <Ionicons name="heart" size={28} color={Colors.error} />
                </View>
                <View style={styles.biometricInfo}>
                  <Text style={styles.biometricLabel}>{t('heartRate')}</Text>
                  <Text style={styles.biometricValue}>{biometricData.heartRate} {t('bpm').toUpperCase()}</Text>
                </View>
                <View style={styles.pulseIndicator}>
                  <Ionicons name="pulse" size={24} color={Colors.error} />
                </View>
              </View>
            </Card>

            {/* Temperature */}
            <Card style={styles.biometricCard} variant="elevated">
              <View style={styles.biometricRow}>
                <View style={[styles.biometricIcon, { backgroundColor: Colors.accent + '20' }]}>
                  <Ionicons name="thermometer" size={28} color={Colors.accent} />
                </View>
                <View style={styles.biometricInfo}>
                  <Text style={styles.biometricLabel}>{t('temperature')}</Text>
                  <Text style={styles.biometricValue}>{biometricData.temperature.toFixed(1)}°C</Text>
                </View>
                <Text style={styles.tempStatus}>
                  {biometricData.temperature < 38 ? t('low') : 
                   biometricData.temperature > 39.5 ? t('high') : t('normal')}
                </Text>
              </View>
            </Card>

            {/* Movement */}
            <Card style={styles.biometricCard} variant="elevated">
              <View style={styles.biometricRow}>
                <View style={[styles.biometricIcon, { backgroundColor: getMovementColor(biometricData.movement) + '20' }]}>
                  <Ionicons name="walk" size={28} color={getMovementColor(biometricData.movement)} />
                </View>
                <View style={styles.biometricInfo}>
                  <Text style={styles.biometricLabel}>{t('activity')}</Text>
                  <Text style={styles.biometricValue}>{getMovementLabel(biometricData.movement)}</Text>
                </View>
                <View style={[styles.movementBadge, { backgroundColor: getMovementColor(biometricData.movement) + '20' }]}>
                  <View style={[styles.movementDot, { backgroundColor: getMovementColor(biometricData.movement) }]} />
                </View>
              </View>
            </Card>

            {/* Battery */}
            <Card style={styles.biometricCard} variant="elevated">
              <View style={styles.biometricRow}>
                <View style={[styles.biometricIcon, { backgroundColor: Colors.success + '20' }]}>
                  <Ionicons 
                    name={biometricData.battery > 50 ? 'battery-full' : 
                          biometricData.battery > 20 ? 'battery-half' : 'battery-dead'} 
                    size={28} 
                    color={biometricData.battery > 20 ? Colors.success : Colors.error} 
                  />
                </View>
                <View style={styles.biometricInfo}>
                  <Text style={styles.biometricLabel}>{t('batteryLevel')}</Text>
                  <Text style={styles.biometricValue}>{biometricData.battery}%</Text>
                </View>
                <View style={styles.batteryBar}>
                  <View style={[styles.batteryFill, { 
                    width: `${biometricData.battery}%`,
                    backgroundColor: biometricData.battery > 20 ? Colors.success : Colors.error
                  }]} />
                </View>
              </View>
            </Card>
          </View>
        )}

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
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
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
  statusCard: {
    marginBottom: Spacing.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  statusText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  deviceName: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  actionButton: {
    marginTop: Spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  scanButton: {
    flex: 2,
  },
  simButton: {
    flex: 1,
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
  deviceCard: {
    marginBottom: Spacing.sm,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  deviceCardName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  deviceRssi: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  connectButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heimdallCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  heimdallIcon: {
    backgroundColor: Colors.primary,
  },
  heimdallConnectButton: {
    backgroundColor: Colors.secondary,
  },
  deviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heimdallBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  heimdallBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
  },
  scanningCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.lg,
  },
  scanningText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: Spacing.md,
  },
  scanningHint: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  biometricCard: {
    marginBottom: Spacing.sm,
  },
  biometricRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  biometricIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  biometricLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  biometricValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  pulseIndicator: {
    opacity: 0.8,
  },
  tempStatus: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.success,
  },
  movementBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  movementDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  batteryBar: {
    width: 60,
    height: 8,
    backgroundColor: Colors.grayLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  batteryFill: {
    height: '100%',
    borderRadius: 4,
  },
  instructionsCard: {
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  instructionsTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  instructionNumberText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.white,
  },
  instructionText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  tipText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  infoCard: {
    marginTop: Spacing.md,
    backgroundColor: Colors.white,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  infoTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.sm,
  },
  infoNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.grayLight,
    marginVertical: Spacing.md,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.accent + '15',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.text,
    lineHeight: 20,
  },
});
