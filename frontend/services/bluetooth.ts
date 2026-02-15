import { Platform, PermissionsAndroid } from 'react-native';

// Service UUIDs
const HEART_RATE_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
const HEART_RATE_CHARACTERISTIC = '00002a37-0000-1000-8000-00805f9b34fb';
const BATTERY_SERVICE = '0000180f-0000-1000-8000-00805f9b34fb';
const BATTERY_CHARACTERISTIC = '00002a19-0000-1000-8000-00805f9b34fb';

export interface BiometricData {
  heartRate: number;
  temperature: number;
  movement: 'low' | 'medium' | 'high';
  battery: number;
  connected: boolean;
  deviceName: string | null;
}

export interface ScannedDevice {
  id: string;
  name: string | null;
  rssi: number | null;
}

type BiometricCallback = (data: BiometricData) => void;
type ScanCallback = (device: ScannedDevice) => void;
type StateCallback = (state: 'scanning' | 'connected' | 'disconnected' | 'error') => void;

class BluetoothService {
  private manager: any = null;
  private connectedDevice: any = null;
  private biometricCallback: BiometricCallback | null = null;
  private stateCallback: StateCallback | null = null;
  private isScanning: boolean = false;
  private simulationInterval: NodeJS.Timeout | null = null;
  private isSimulating: boolean = false;
  private bleAvailable: boolean = false;

  // Current biometric data
  private currentData: BiometricData = {
    heartRate: 0,
    temperature: 0,
    movement: 'low',
    battery: 0,
    connected: false,
    deviceName: null,
  };

  constructor() {
    // Don't initialize BLE in constructor - will be initialized lazily
    this.bleAvailable = Platform.OS !== 'web';
  }

  private async initBLE(): Promise<boolean> {
    if (this.manager) return true;
    if (Platform.OS === 'web') return false;

    try {
      const { BleManager } = await import('react-native-ble-plx');
      this.manager = new BleManager();
      return true;
    } catch (e) {
      console.log('BLE not available:', e);
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return true;

    if (Platform.OS === 'android') {
      const apiLevel = Platform.Version;
      
      if (typeof apiLevel === 'number' && apiLevel >= 31) {
        const results = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        
        return (
          results['android.permission.BLUETOOTH_SCAN'] === 'granted' &&
          results['android.permission.BLUETOOTH_CONNECT'] === 'granted' &&
          results['android.permission.ACCESS_FINE_LOCATION'] === 'granted'
        );
      } else {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return result === 'granted';
      }
    }

    return true;
  }

  async checkBluetoothState(): Promise<boolean> {
    const initialized = await this.initBLE();
    if (!initialized || !this.manager) return false;

    return new Promise((resolve) => {
      try {
        this.manager.onStateChange((state: string) => {
          if (state === 'PoweredOn') {
            resolve(true);
          } else if (state === 'PoweredOff' || state === 'Unauthorized') {
            resolve(false);
          }
        }, true);
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
      console.log('BLE not available on web');
      return;
    }

    const initialized = await this.initBLE();
    if (!initialized || this.isScanning) return;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      this.stateCallback?.('error');
      throw new Error('Bluetooth permissions not granted');
    }

    const isEnabled = await this.checkBluetoothState();
    if (!isEnabled) {
      this.stateCallback?.('error');
      throw new Error('Bluetooth is not enabled');
    }

    this.isScanning = true;
    this.stateCallback?.('scanning');

    try {
      this.manager.startDeviceScan(
        null,
        { allowDuplicates: false },
        (error: any, device: any) => {
          if (error) {
            console.error('Scan error:', error);
            this.stopScan();
            this.stateCallback?.('error');
            return;
          }

          if (device) {
            const deviceName = device.name || device.localName || '';
            const deviceNameLower = deviceName.toLowerCase();
            
            // Detect ESP32, Heimdall, HANI, or any BLE device with a name
            const isCompatibleDevice = 
              deviceNameLower.includes('esp32') ||
              deviceNameLower.includes('heimdall') ||
              deviceNameLower.includes('hani') ||
              deviceNameLower.includes('vest') ||
              deviceNameLower.includes('chaleco') ||
              deviceNameLower.includes('hr') ||
              deviceNameLower.includes('heart') ||
              deviceNameLower.includes('ble') ||
              // Also accept any device with a name (for broader ESP32 detection)
              (deviceName.length > 0 && device.rssi && device.rssi > -80);

            if (isCompatibleDevice) {
              onDeviceFound({
                id: device.id,
                name: deviceName || `Dispositivo (${device.id.substring(0, 8)})`,
                rssi: device.rssi,
              });
            }
          }
        }
      );

      setTimeout(() => this.stopScan(), 30000);
    } catch (e) {
      console.error('Start scan error:', e);
      this.stateCallback?.('error');
    }
  }

  stopScan(): void {
    if (this.manager && this.isScanning) {
      try {
        this.manager.stopDeviceScan();
      } catch (e) {
        console.log('Stop scan error:', e);
      }
      this.isScanning = false;
    }
  }

  async connectToDevice(deviceId: string): Promise<boolean> {
    const initialized = await this.initBLE();
    if (!initialized || !this.manager) return false;

    try {
      this.stopScan();

      const device = await this.manager.connectToDevice(deviceId, {
        autoConnect: true,
      });

      await device.discoverAllServicesAndCharacteristics();
      
      this.connectedDevice = device;
      this.currentData.connected = true;
      this.currentData.deviceName = device.name;
      
      this.stateCallback?.('connected');
      this.notifyUpdate();

      device.onDisconnected(() => {
        this.handleDisconnection();
      });

      return true;
    } catch (error) {
      console.error('Connection error:', error);
      this.stateCallback?.('error');
      return false;
    }
  }

  private notifyUpdate(): void {
    if (this.biometricCallback) {
      this.biometricCallback({ ...this.currentData });
    }
  }

  private handleDisconnection(): void {
    this.connectedDevice = null;
    this.currentData.connected = false;
    this.currentData.deviceName = null;
    this.stateCallback?.('disconnected');
    this.notifyUpdate();
  }

  async disconnect(): Promise<void> {
    this.stopSimulation();
    
    if (this.connectedDevice) {
      try {
        await this.connectedDevice.cancelConnection();
      } catch (error) {
        console.error('Disconnect error:', error);
      }
      this.handleDisconnection();
    }
  }

  // Simulation mode for testing without real device
  startSimulation(): void {
    if (this.isSimulating) return;
    
    this.isSimulating = true;
    this.currentData.connected = true;
    this.currentData.deviceName = 'Heimdall Vest (Simulador)';
    this.currentData.battery = 78;
    this.stateCallback?.('connected');

    this.simulationInterval = setInterval(() => {
      const baseHeartRate = 70;
      const heartRateVariation = Math.sin(Date.now() / 5000) * 15;
      this.currentData.heartRate = Math.round(baseHeartRate + heartRateVariation + Math.random() * 5);

      this.currentData.temperature = 38.2 + Math.random() * 0.8;

      const movementRandom = Math.random();
      if (movementRandom < 0.6) {
        this.currentData.movement = 'low';
      } else if (movementRandom < 0.9) {
        this.currentData.movement = 'medium';
      } else {
        this.currentData.movement = 'high';
      }

      if (Math.random() < 0.1) {
        this.currentData.battery = Math.max(0, this.currentData.battery - 1);
      }

      this.notifyUpdate();
    }, 2000);

    this.notifyUpdate();
  }

  stopSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    this.isSimulating = false;
    this.currentData.connected = false;
    this.currentData.deviceName = null;
    this.stateCallback?.('disconnected');
    this.notifyUpdate();
  }

  isConnected(): boolean {
    return this.currentData.connected;
  }

  getCurrentData(): BiometricData {
    return { ...this.currentData };
  }

  destroy(): void {
    this.stopScan();
    this.stopSimulation();
    this.disconnect();
    if (this.manager) {
      try {
        this.manager.destroy();
      } catch (e) {
        console.log('Manager destroy error:', e);
      }
      this.manager = null;
    }
  }
}

export const bluetoothService = new BluetoothService();
export default bluetoothService;
