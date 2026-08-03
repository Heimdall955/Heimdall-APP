import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import { showAlert } from '../utils/alert';
import bluetoothService, { BiometricData, ScannedDevice } from '../services/bluetooth';

interface BluetoothContextType {
  isScanning: boolean;
  isConnected: boolean;
  isDemo: boolean;
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
  heartRate: null,
  rrIntervals: [],
  battery: null,
  movement: 'unknown',
  signalQuality: 'unknown',
  connected: false,
  deviceId: null,
  deviceName: null,
  source: 'real',
  lastUpdatedAt: null,
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
      showAlert(
        'Bluetooth no disponible',
        'El escaneo Bluetooth solo funciona en dispositivos móviles. Para probarlo, instala la app en tu teléfono.',
      );
      return;
    }

    setScannedDevices([]);
    setIsScanning(true);
    setConnectionState('scanning');

    try {
      await bluetoothService.startScan((device) => {
        setScannedDevices((prev) => {
          if (prev.some((d) => d.id === device.id)) {
            return prev.map(d => d.id === device.id ? { ...d, rssi: device.rssi } : d);
          }
          const newDevices = [...prev, device];
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
      
      const isExpoGo = error.message?.includes('Expo Go') || error.message?.includes('development build');
      showAlert(
        isExpoGo ? 'Build nativo necesario' : 'Error de Bluetooth',
        isExpoGo
          ? 'Para usar el Bluetooth real necesitas compilar la app con EAS Build. Contacta al equipo de desarrollo para crear el build.'
          : error.message || 'No se pudo iniciar el escaneo. Verifica que Bluetooth este activado.'
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
    // El servicio rechaza el modo demo si hay un sensor real conectado (nunca se mezclan)
    bluetoothService.startSimulation();
  }, []);

  const stopSimulation = useCallback(() => {
    bluetoothService.stopSimulation();
  }, []);

  return (
    <BluetoothContext.Provider
      value={{
        isScanning,
        isConnected,
        isDemo: isConnected && biometricData.source === 'demo',
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
