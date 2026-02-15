import { Platform } from 'react-native';
import * as ExpoSecureStore from 'expo-secure-store';

// Web-compatible secure storage wrapper
// Uses localStorage on web, SecureStore on native
class SecureStorage {
  async getItemAsync(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return ExpoSecureStore.getItemAsync(key);
  }

  async setItemAsync(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch {
        console.warn('Failed to save to localStorage');
      }
      return;
    }
    return ExpoSecureStore.setItemAsync(key, value);
  }

  async deleteItemAsync(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch {
        console.warn('Failed to remove from localStorage');
      }
      return;
    }
    return ExpoSecureStore.deleteItemAsync(key);
  }
}

export const SecureStore = new SecureStorage();
export default SecureStore;
