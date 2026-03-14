import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { SecureStore } from './secureStore';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_EMAIL_KEY = 'biometric_email';
const BIOMETRIC_PASSWORD_KEY = 'biometric_password';

export const BiometricAuth = {
  /**
   * Check if the device supports biometric authentication
   */
  async isAvailable(): Promise<{ available: boolean; biometricType: string }> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) return { available: false, biometricType: '' };

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) return { available: false, biometricType: '' };

      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      let biometricType = 'Biometric';
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricType = Platform.OS === 'ios' ? 'Face ID' : 'Face Unlock';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = Platform.OS === 'ios' ? 'Touch ID' : 'Huella dactilar';
      }

      return { available: true, biometricType };
    } catch {
      return { available: false, biometricType: '' };
    }
  },

  /**
   * Check if biometric login is enabled by the user
   */
  async isEnabled(): Promise<boolean> {
    const val = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return val === 'true';
  },

  /**
   * Authenticate with biometrics
   */
  async authenticate(promptMessage: string): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
        fallbackLabel: 'Usar contraseña',
      });
      return result.success;
    } catch {
      return false;
    }
  },

  /**
   * Save credentials after successful login + biometric approval
   */
  async saveCredentials(email: string, password: string): Promise<void> {
    await SecureStore.setItemAsync(BIOMETRIC_EMAIL_KEY, email);
    await SecureStore.setItemAsync(BIOMETRIC_PASSWORD_KEY, password);
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
  },

  /**
   * Get saved credentials
   */
  async getCredentials(): Promise<{ email: string; password: string } | null> {
    const email = await SecureStore.getItemAsync(BIOMETRIC_EMAIL_KEY);
    const password = await SecureStore.getItemAsync(BIOMETRIC_PASSWORD_KEY);
    if (email && password) return { email, password };
    return null;
  },

  /**
   * Disable biometric login and clear credentials
   */
  async disable(): Promise<void> {
    await SecureStore.deleteItemAsync(BIOMETRIC_EMAIL_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_PASSWORD_KEY);
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'false');
  },

  /**
   * Enable biometric login (credentials must already be saved)
   */
  async enable(): Promise<void> {
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
  },
};
