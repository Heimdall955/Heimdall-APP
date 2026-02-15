import { Platform, PermissionsAndroid } from 'react-native';
import { BleManager, Device, State, Characteristic } from 'react-native-ble-plx';

// Heimdall Vest Service UUIDs (standard Heart Rate and custom services)
const HEART_RATE_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
const HEART_RATE_CHARACTERISTIC = '00002a37-0000-1000-8000-00805f9b34fb';
const BATTERY_SERVICE = '0000180f-0000-1000-8000-00805f9b34fb';
const BATTERY_CHARACTERISTIC = '00002a19-0000-1000-8000-00805f9b34fb';

// Custom Heimdall Service for temperature and movement
const HEIMDALL_SERVICE = '12345678-1234-5678-1234-56789abcdef0';
const TEMPERATURE_CHARACTERISTIC = '12345678-1234-5678-1234-56789abcdef1';
const MOVEMENT_CHARACTERISTIC = '12345678-1234-5678-1234-56789abcdef2';

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
  private manager: BleManager | null = null;
  private connectedDevice: Device | null = null;
  private biometricCallback: BiometricCallback | null = null;
  private stateCallback: StateCallback | null = null;
  private isScanning: boolean = false;
  private simulationInterval: NodeJS.Timeout | null = null;
  private isSimulating: boolean = false;

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
    if (Platform.OS !== 'web') {
      this.manager = new BleManager();
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return true; // Web doesn't need BLE permissions
    }

    if (Platform.OS === 'android') {
      const apiLevel = Platform.Version;
      
      if (apiLevel >= 31) {
        // Android 12+
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
        // Android 11 and below
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return result === 'granted';
      }
    }

    return true; // iOS handles permissions via Info.plist
  }

  async checkBluetoothState(): Promise<boolean> {
    if (Platform.OS === 'web' || !this.manager) {
      return false;
    }

    return new Promise((resolve) => {
      this.manager!.onStateChange((state) => {
        if (state === State.PoweredOn) {
          resolve(true);
        } else if (state === State.PoweredOff || state === State.Unauthorized) {
          resolve(false);
        }
      }, true);
    });
  }

  onBiometricUpdate(callback: BiometricCallback): void {
    this.biometricCallback = callback;
  }

  onStateChange(callback: StateCallback): void {
    this.stateCallback = callback;
  }

  async startScan(onDeviceFound: ScanCallback): Promise<void> {
    if (Platform.OS === 'web' || !this.manager) {
      console.log('BLE not available on web');
      return;
    }

    if (this.isScanning) {
      return;
    }

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

    this.manager.startDeviceScan(
      null, // Scan all services
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          this.stopScan();
          this.stateCallback?.('error');
          return;
        }

        if (device && device.name) {
          // Filter for Heimdall devices or heart rate monitors
          const isHeimdallDevice = 
            device.name.toLowerCase().includes('heimdall') ||
            device.name.toLowerCase().includes('vest') ||
            device.name.toLowerCase().includes('hr') ||
            device.name.toLowerCase().includes('heart');

          if (isHeimdallDevice || device.serviceUUIDs?.includes(HEART_RATE_SERVICE)) {
            onDeviceFound({
              id: device.id,
              name: device.name,
              rssi: device.rssi,
            });
          }
        }
      }
    );

    // Stop scan after 30 seconds
    setTimeout(() => {
      this.stopScan();
    }, 30000);
  }

  stopScan(): void {
    if (this.manager && this.isScanning) {
      this.manager.stopDeviceScan();
      this.isScanning = false;
    }
  }

  async connectToDevice(deviceId: string): Promise<boolean> {
    if (Platform.OS === 'web' || !this.manager) {
      return false;
    }

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

      // Start monitoring characteristics
      await this.startMonitoring(device);

      // Handle disconnection
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

  private async startMonitoring(device: Device): Promise<void> {
    try {
      // Monitor Heart Rate
      device.monitorCharacteristicForService(
        HEART_RATE_SERVICE,
        HEART_RATE_CHARACTERISTIC,
        (error, characteristic) => {
          if (error) {
            console.log('Heart rate monitor error:', error);
            return;
          }
          if (characteristic?.value) {
            const data = this.parseHeartRate(characteristic.value);
            this.currentData.heartRate = data;
            this.notifyUpdate();
          }
        }
      );

      // Monitor Battery
      device.monitorCharacteristicForService(
        BATTERY_SERVICE,
        BATTERY_CHARACTERISTIC,
        (error, characteristic) => {
          if (error) {
            console.log('Battery monitor error:', error);
            return;
          }
          if (characteristic?.value) {
            const data = this.parseBattery(characteristic.value);
            this.currentData.battery = data;
            this.notifyUpdate();
          }
        }
      );

      // Try to monitor Heimdall custom service
      try {
        device.monitorCharacteristicForService(
          HEIMDALL_SERVICE,
          TEMPERATURE_CHARACTERISTIC,
          (error, characteristic) => {
            if (!error && characteristic?.value) {
              const data = this.parseTemperature(characteristic.value);
              this.currentData.temperature = data;
              this.notifyUpdate();
            }
          }
        );

        device.monitorCharacteristicForService(
          HEIMDALL_SERVICE,
          MOVEMENT_CHARACTERISTIC,
          (error, characteristic) => {
            if (!error && characteristic?.value) {
              const data = this.parseMovement(characteristic.value);
              this.currentData.movement = data;
              this.notifyUpdate();
            }
          }
        );
      } catch (e) {
        // Heimdall custom service not available, use defaults
        console.log('Heimdall custom service not available');
      }
    } catch (error) {
      console.error('Monitoring error:', error);
    }
  }

  private parseHeartRate(base64Value: string): number {
    const bytes = Buffer.from(base64Value, 'base64');
    // Heart rate is typically in the second byte for most HR monitors
    return bytes.length > 1 ? bytes[1] : bytes[0];
  }

  private parseBattery(base64Value: string): number {
    const bytes = Buffer.from(base64Value, 'base64');
    return bytes[0];
  }

  private parseTemperature(base64Value: string): number {
    const bytes = Buffer.from(base64Value, 'base64');
    // Temperature in Celsius * 10
    return bytes[0] / 10 + 30; // Offset for dog body temp range
  }

  private parseMovement(base64Value: string): 'low' | 'medium' | 'high' {
    const bytes = Buffer.from(base64Value, 'base64');
    const value = bytes[0];
    if (value < 30) return 'low';
    if (value < 70) return 'medium';
    return 'high';
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
      // Simulate realistic biometric data
      const baseHeartRate = 70;
      const heartRateVariation = Math.sin(Date.now() / 5000) * 15;
      this.currentData.heartRate = Math.round(baseHeartRate + heartRateVariation + Math.random() * 5);

      // Simulate temperature (dog normal: 38-39°C)
      this.currentData.temperature = 38.2 + Math.random() * 0.8;

      // Simulate movement based on time
      const movementRandom = Math.random();
      if (movementRandom < 0.6) {
        this.currentData.movement = 'low';
      } else if (movementRandom < 0.9) {
        this.currentData.movement = 'medium';
      } else {
        this.currentData.movement = 'high';
      }

      // Slowly decrease battery
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
      this.manager.destroy();
      this.manager = null;
    }
  }
}

export const bluetoothService = new BluetoothService();
export default bluetoothService;
