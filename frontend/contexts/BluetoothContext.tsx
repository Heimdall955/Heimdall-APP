import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
import bluetoothService, { BiometricData, ScannedDevice } from '../services/bluetooth';

interface BluetoothContextType {
  isScanning: boolean;
  isConnected: boolean;
  biometricData: BiometricData;
  scannedDevices: ScannedDevice[];
  connectionState: 'idle' | 'scanning' | 'connected' | 'disconnected' | 'error';
  startScan: () => Promise<void>;
  stopScan: () => void;
  connectToDevice: (deviceId: string) => Promise<boolean>;
  disconnect: () => Promise<void>;
  startSimulation: () => void;
  stopSimulation: () => void;
}

const defaultBiometricData: BiometricData = {
  heartRate: 0,
  temperature: 0,
  movement: 'low',
  battery: 0,
  connected: false,
  deviceName: null,
};

const BluetoothContext = createContext<BluetoothContextType | undefined>(undefined);

export function BluetoothProvider({ children }: { children: ReactNode }) {
  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [biometricData, setBiometricData] = useState<BiometricData>(defaultBiometricData);
  const [scannedDevices, setScannedDevices] = useState<ScannedDevice[]>([]);
  const [connectionState, setConnectionState] = useState<'idle' | 'scanning' | 'connected' | 'disconnected' | 'error'>('idle');

  useEffect(() => {
    // Set up callbacks
    bluetoothService.onBiometricUpdate((data) => {
      setBiometricData(data);
      setIsConnected(data.connected);
    });

    bluetoothService.onStateChange((state) => {
      console.log('Bluetooth state changed:', state);
      setConnectionState(state);
      setIsScanning(state === 'scanning');
      setIsConnected(state === 'connected');
      
      if (state === 'disconnected') {
        setScannedDevices([]);
      }
    });

    return () => {
      bluetoothService.destroy();
    };
  }, []);

  const startScan = useCallback(async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Bluetooth no disponible',
        'El escaneo Bluetooth solo está disponible en dispositivos móviles con Expo Go. ¿Quieres usar el simulador para probar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Usar Simulador', onPress: () => startSimulation() },
        ]
      );
      return;
    }

    setScannedDevices([]);
    setIsScanning(true);
    setConnectionState('scanning');

    try {
      await bluetoothService.startScan((device) => {
        setScannedDevices((prev) => {
          // Avoid duplicates and sort by signal strength
          if (prev.some((d) => d.id === device.id)) {
            // Update RSSI if device already exists
            return prev.map(d => d.id === device.id ? { ...d, rssi: device.rssi } : d);
          }
          const newDevices = [...prev, device];
          // Sort: Heimdall devices first, then by signal strength
          return newDevices.sort((a, b) => {
            if (a.isHeimdallVest && !b.isHeimdallVest) return -1;
            if (!a.isHeimdallVest && b.isHeimdallVest) return 1;
            return (b.rssi || -100) - (a.rssi || -100);
          });
        });
      });
    } catch (error: any) {
      console.error('Scan error:', error);
      setIsScanning(false);
      setConnectionState('error');
      Alert.alert(
        'Error de Bluetooth', 
        error.message || 'No se pudo iniciar el escaneo. Verifica que Bluetooth esté activado.'
      );
    }
  }, []);

  const stopScan = useCallback(() => {
    bluetoothService.stopScan();
    setIsScanning(false);
    if (connectionState === 'scanning') {
      setConnectionState('idle');
    }
  }, [connectionState]);

  const connectToDevice = useCallback(async (deviceId: string): Promise<boolean> => {
    try {
      console.log('Connecting to device:', deviceId);
      setConnectionState('scanning'); // Show loading state
      const success = await bluetoothService.connectToDevice(deviceId);
      if (success) {
        setIsConnected(true);
        setConnectionState('connected');
        setScannedDevices([]); // Clear the list after successful connection
      } else {
        setConnectionState('error');
      }
      return success;
    } catch (error) {
      console.error('Connect error:', error);
      setConnectionState('error');
      return false;
    }
  }, []);

  const disconnect = useCallback(async () => {
    await bluetoothService.disconnect();
    setIsConnected(false);
    setConnectionState('disconnected');
    setBiometricData(defaultBiometricData);
  }, []);

  const startSimulation = useCallback(() => {
    bluetoothService.startSimulation();
    setIsConnected(true);
    setConnectionState('connected');
  }, []);

  const stopSimulation = useCallback(() => {
    bluetoothService.stopSimulation();
    setIsConnected(false);
    setConnectionState('disconnected');
    setBiometricData(defaultBiometricData);
  }, []);

  return (
    <BluetoothContext.Provider
      value={{
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
      }}
    >
      {children}
    </BluetoothContext.Provider>
  );
}

export function useBluetooth() {
  const context = useContext(BluetoothContext);
  if (!context) {
    throw new Error('useBluetooth must be used within BluetoothProvider');
  }
  return context;
}
