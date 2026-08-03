import { Platform, PermissionsAndroid } from 'react-native';

// Standard BLE Service UUIDs
const HEART_RATE_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
const HEART_RATE_CHARACTERISTIC = '00002a37-0000-1000-8000-00805f9b34fb';
const BATTERY_SERVICE = '0000180f-0000-1000-8000-00805f9b34fb';
const BATTERY_CHARACTERISTIC = '00002a19-0000-1000-8000-00805f9b34fb';

export interface BiometricData {
  heartRate: number | null;
  rrIntervals: number[];
  battery: number | null;
  movement: 'low' | 'medium' | 'high' | 'unknown';
  signalQuality: 'good' | 'fair' | 'poor' | 'unknown';
  connected: boolean;
  deviceId: string | null;
  deviceName: string | null;
  source: 'real' | 'demo';
  lastUpdatedAt: string | null;
}

export interface ScannedDevice {
  id: string;
  name: string | null;
  rssi: number | null;
  isMovesense: boolean;
  isHeimdallVest: boolean;
}

type BiometricCallback = (data: BiometricData) => void;
type ScanCallback = (device: ScannedDevice) => void;
type StateCallback = (state: 'scanning' | 'connected' | 'disconnected' | 'error') => void;

const emptyData = (): BiometricData => ({
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
});

class BluetoothService {
  private manager: any = null;
  private connectedDevice: any = null;
  private biometricCallback: BiometricCallback | null = null;
  private stateCallback: StateCallback | null = null;
  private isScanning: boolean = false;
  private demoInterval: ReturnType<typeof setInterval> | null = null;
  private isDemoMode: boolean = false;
  private subscriptions: any[] = [];
  private batteryPollingInterval: ReturnType<typeof setInterval> | null = null;

  private currentData: BiometricData = emptyData();

  private async initBLE(): Promise<boolean> {
    if (this.manager) return true;
    if (Platform.OS === 'web') return false;

    try {
      const blePlx = await import('react-native-ble-plx');
      if (blePlx && blePlx.BleManager) {
        this.manager = new blePlx.BleManager();
        return true;
      }
      return false;
    } catch (e: any) {
      console.log('BLE not available (this is normal in Expo Go):', e?.message || e);
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return true;

    if (Platform.OS === 'android') {
      const apiLevel = Platform.Version;

      if (typeof apiLevel === 'number' && apiLevel >= 31) {
        // Android 12+: solo permisos Bluetooth (BLUETOOTH_SCAN lleva neverForLocation)
        const results = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);
        return (
          results['android.permission.BLUETOOTH_SCAN'] === 'granted' &&
          results['android.permission.BLUETOOTH_CONNECT'] === 'granted'
        );
      } else {
        // Android 11 o inferior: la ubicación es necesaria para escanear BLE
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return result === 'granted';
      }
    }

    // iOS: el sistema gestiona el permiso Bluetooth automáticamente
    return true;
  }

  async checkBluetoothState(): Promise<boolean> {
    const initialized = await this.initBLE();
    if (!initialized || !this.manager) return false;

    return new Promise((resolve) => {
      try {
        const subscription = this.manager.onStateChange((state: string) => {
          if (state === 'PoweredOn') {
            subscription.remove();
            resolve(true);
          } else if (state === 'PoweredOff' || state === 'Unauthorized') {
            subscription.remove();
            resolve(false);
          }
        }, true);
        setTimeout(() => {
          subscription.remove();
          resolve(false);
        }, 5000);
      } catch (e) {
        resolve(false);
      }
    });
  }

  onBiometricUpdate(callback: BiometricCallback): void {
    this.biometricCallback = callback;
  }

  onStateChange(callback: StateCallback): void {
    this.stateCallback = callback;
  }

  async startScan(onDeviceFound: ScanCallback): Promise<void> {
    if (Platform.OS === 'web') {
      throw new Error('Bluetooth no disponible en navegador web. Usa el modo demostración para probar la interfaz.');
    }

    const initialized = await this.initBLE();
    if (!initialized) {
      throw new Error('Bluetooth no disponible en Expo Go.\n\nPara usar Bluetooth real necesitas un build nativo de la app.\n\nPor ahora, usa el modo demostración para probar la interfaz.');
    }

    if (this.isScanning) return;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      this.stateCallback?.('error');
      throw new Error('Permisos de Bluetooth no concedidos. Por favor, permite el acceso en Ajustes.');
    }

    const isEnabled = await this.checkBluetoothState();
    if (!isEnabled) {
      this.stateCallback?.('error');
      throw new Error('Bluetooth está desactivado. Por favor, actívalo para continuar.');
    }

    this.isScanning = true;
    this.stateCallback?.('scanning');

    try {
      this.manager.startDeviceScan(
        null,
        { allowDuplicates: false, scanMode: 2 },
        (error: any, device: any) => {
          if (error) {
            console.error('Scan error:', error);
            this.stopScan();
            this.stateCallback?.('error');
            return;
          }
          if (!device) return;

          const deviceName = device.name || device.localName || '';
          const lower = deviceName.toLowerCase();
          const serviceUUIDs: string[] = device.serviceUUIDs || [];
          const advertisesHeartRate = serviceUUIDs.some(
            (u: string) => u && u.toLowerCase().includes('180d')
          );

          const isMovesense = lower.includes('movesense');
          const isHeimdallVest =
            lower.includes('heimdall') ||
            lower.includes('biovest') ||
            lower.includes('hani');

          // Solo sensores compatibles: Movesense, HEIMDALL BioVest o dispositivos
          // que anuncian el servicio estándar de frecuencia cardiaca (0x180D).
          if (isMovesense || isHeimdallVest || advertisesHeartRate) {
            onDeviceFound({
              id: device.id,
              name: deviceName || `Sensor (${device.id.substring(0, 8)})`,
              rssi: device.rssi,
              isMovesense,
              isHeimdallVest: isHeimdallVest || isMovesense,
            });
          }
        }
      );

      setTimeout(() => {
        if (this.isScanning) this.stopScan();
      }, 30000);
    } catch (e) {
      this.stateCallback?.('error');
      throw new Error('Error al iniciar escaneo Bluetooth');
    }
  }

  stopScan(): void {
    if (this.manager && this.isScanning) {
      try {
        this.manager.stopDeviceScan();
      } catch (e) {}
      this.isScanning = false;
    }
  }

  async connectToDevice(deviceId: string): Promise<boolean> {
    if (this.isDemoMode) this.stopDemoMode();

    const initialized = await this.initBLE();
    if (!initialized || !this.manager) return false;

    try {
      this.stopScan();
      const device = await this.manager.connectToDevice(deviceId, {
        autoConnect: false,
        timeout: 10000,
      });

      await device.discoverAllServicesAndCharacteristics();

      this.connectedDevice = device;
      this.currentData = {
        ...emptyData(),
        connected: true,
        deviceId: device.id,
        deviceName: device.name || device.localName || 'HEIMDALL BioVest',
        source: 'real',
      };

      this.stateCallback?.('connected');
      this.notifyUpdate();

      device.onDisconnected(() => {
        this.handleDisconnection();
      });

      await this.startReadingData();
      return true;
    } catch (error: any) {
      console.error('Connection error:', error);
      this.stateCallback?.('error');
      return false;
    }
  }

  private async startReadingData(): Promise<void> {
    if (!this.connectedDevice) return;
    // Si algo falla aquí, NUNCA se generan datos simulados: la interfaz
    // mostrará "No se están recibiendo datos del sensor."
    try {
      await this.setupHeartRateMonitoring();
    } catch (e) {
      console.log('Heart Rate service setup failed:', e);
    }
    try {
      await this.readBatteryLevel();
      this.startBatteryPolling();
    } catch (e) {
      console.log('Battery service not available');
    }
  }

  // Estándar Bluetooth Heart Rate Measurement (org.bluetooth.characteristic.heart_rate_measurement)
  private parseHeartRateMeasurement(data: Uint8Array): { heartRate: number; rrIntervals: number[] } | null {
    if (data.length < 2) return null;

    const flags = data[0];
    const is16Bit = (flags & 0x01) !== 0;
    let offset = 1;
    let heartRate: number;

    if (is16Bit) {
      if (data.length < 3) return null;
      heartRate = data[1] | (data[2] << 8);
      offset = 3;
    } else {
      heartRate = data[1];
      offset = 2;
    }

    // Energy Expended presente: saltar 2 bytes
    if ((flags & 0x08) !== 0) {
      offset += 2;
    }

    // Intervalos RR presentes: uint16 little-endian en unidades de 1/1024 s
    const rrIntervals: number[] = [];
    if ((flags & 0x10) !== 0) {
      while (offset + 1 < data.length) {
        const raw = data[offset] | (data[offset + 1] << 8);
        rrIntervals.push(Math.round((raw * 1000) / 1024)); // → milisegundos
        offset += 2;
      }
    }

    return { heartRate, rrIntervals };
  }

  private async setupHeartRateMonitoring(): Promise<void> {
    if (!this.connectedDevice) return;

    const subscription = this.connectedDevice.monitorCharacteristicForService(
      HEART_RATE_SERVICE,
      HEART_RATE_CHARACTERISTIC,
      (error: any, characteristic: any) => {
        if (error) {
          console.log('Heart rate monitor error:', error.message);
          return;
        }
        if (characteristic?.value) {
          const bytes = this.decodeBase64(characteristic.value);
          const parsed = this.parseHeartRateMeasurement(bytes);
          if (parsed && parsed.heartRate > 0) {
            this.currentData.heartRate = parsed.heartRate;
            this.currentData.rrIntervals = parsed.rrIntervals;
            this.currentData.lastUpdatedAt = new Date().toISOString();
            this.notifyUpdate();
          }
        }
      }
    );
    this.subscriptions.push(subscription);
  }

  private async readBatteryLevel(): Promise<void> {
    if (!this.connectedDevice) return;
    const batteryChar = await this.connectedDevice.readCharacteristicForService(
      BATTERY_SERVICE,
      BATTERY_CHARACTERISTIC
    );
    if (batteryChar?.value) {
      const bytes = this.decodeBase64(batteryChar.value);
      if (bytes.length > 0 && bytes[0] >= 0 && bytes[0] <= 100) {
        this.currentData.battery = bytes[0];
        this.notifyUpdate();
      }
    }
  }

  private startBatteryPolling(): void {
    this.batteryPollingInterval = setInterval(async () => {
      if (!this.connectedDevice) return;
      try {
        await this.readBatteryLevel();
      } catch (e) {}
    }, 60000);
  }

  private decodeBase64(base64: string): Uint8Array {
    try {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } catch (e) {
      return new Uint8Array(0);
    }
  }

  private notifyUpdate(): void {
    if (this.biometricCallback) {
      this.biometricCallback({ ...this.currentData });
    }
  }

  private handleDisconnection(): void {
    this.subscriptions.forEach((sub) => {
      try {
        sub.remove?.();
      } catch (e) {}
    });
    this.subscriptions = [];

    if (this.batteryPollingInterval) {
      clearInterval(this.batteryPollingInterval);
      this.batteryPollingInterval = null;
    }

    this.connectedDevice = null;
    this.currentData = emptyData();
    this.stateCallback?.('disconnected');
    this.notifyUpdate();
  }

  async disconnect(): Promise<void> {
    if (this.isDemoMode) {
      this.stopDemoMode();
      return;
    }

    this.subscriptions.forEach((sub) => {
      try {
        sub.remove?.();
      } catch (e) {}
    });
    this.subscriptions = [];

    if (this.batteryPollingInterval) {
      clearInterval(this.batteryPollingInterval);
      this.batteryPollingInterval = null;
    }

    if (this.connectedDevice) {
      try {
        await this.connectedDevice.cancelConnection();
      } catch (error) {}
    }

    this.handleDisconnection();
  }

  // ===== MODO DEMOSTRACIÓN (nunca se mezcla con datos reales) =====
  startDemoMode(): void {
    if (this.isDemoMode) return;
    if (this.connectedDevice) {
      // Nunca mezclar demo con una sesión real activa
      console.log('Demo mode blocked: real device connected');
      return;
    }

    this.isDemoMode = true;
    this.currentData = {
      heartRate: 72,
      rrIntervals: [],
      battery: 78,
      movement: 'low',
      signalQuality: 'unknown',
      connected: true,
      deviceId: 'demo',
      deviceName: 'HEIMDALL BioVest (Demo)',
      source: 'demo',
      lastUpdatedAt: new Date().toISOString(),
    };
    this.stateCallback?.('connected');

    this.demoInterval = setInterval(() => {
      const base = 70;
      const variation = Math.sin(Date.now() / 5000) * 15;
      this.currentData.heartRate = Math.round(base + variation + Math.random() * 5);

      const r = Math.random();
      this.currentData.movement = r < 0.6 ? 'low' : r < 0.9 ? 'medium' : 'high';

      if (Math.random() < 0.05 && this.currentData.battery !== null) {
        this.currentData.battery = Math.max(0, this.currentData.battery - 1);
      }
      this.currentData.lastUpdatedAt = new Date().toISOString();
      this.notifyUpdate();
    }, 2000);

    this.notifyUpdate();
  }

  stopDemoMode(): void {
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
    this.isDemoMode = false;
    this.currentData = emptyData();
    this.stateCallback?.('disconnected');
    this.notifyUpdate();
  }

  // Aliases retro-compatibles
  startSimulation(): void {
    this.startDemoMode();
  }

  stopSimulation(): void {
    this.stopDemoMode();
  }

  isConnected(): boolean {
    return this.currentData.connected;
  }

  getCurrentData(): BiometricData {
    return { ...this.currentData };
  }

  destroy(): void {
    this.stopScan();
    this.stopDemoMode();
    this.disconnect();
    if (this.manager) {
      try {
        this.manager.destroy();
      } catch (e) {}
      this.manager = null;
    }
  }
}

export const bluetoothService = new BluetoothService();
export default bluetoothService;
