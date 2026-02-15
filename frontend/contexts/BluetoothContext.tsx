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
      setConnectionState(state);
      setIsScanning(state === 'scanning');
      setIsConnected(state === 'connected');
    });

    return () => {
      bluetoothService.destroy();
    };
  }, []);

  const startScan = useCallback(async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Bluetooth no disponible',
        'El escaneo Bluetooth solo está disponible en dispositivos móviles. ¿Quieres usar el simulador?',
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
          // Avoid duplicates
          if (prev.some((d) => d.id === device.id)) {
            return prev;
          }
          return [...prev, device];
        });
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo iniciar el escaneo');
      setConnectionState('error');
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
      const success = await bluetoothService.connectToDevice(deviceId);
      if (success) {
        setIsConnected(true);
        setConnectionState('connected');
      }
      return success;
    } catch (error) {
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
