import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../contexts/AuthContext';
import { BluetoothProvider } from '../contexts/BluetoothContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import notificationService from '../services/NotificationService';
import { UpdateChecker } from '../components/UpdateChecker';

function InnerLayout() {
  const { isDark } = useTheme();

  useEffect(() => {
    notificationService.init().then(() => notificationService.scheduleAll()).catch(() => {});
  }, []);
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <UpdateChecker />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chaleco" options={{ presentation: 'modal' }} />
        <Stack.Screen name="historial-medico" options={{ presentation: 'card' }} />
        <Stack.Screen name="rutas" options={{ presentation: 'card' }} />
        <Stack.Screen name="leccion" options={{ presentation: 'card' }} />
        <Stack.Screen name="ejercicio" options={{ presentation: 'card' }} />
        <Stack.Screen name="leaderboard" options={{ presentation: 'card' }} />
        <Stack.Screen name="progreso" options={{ presentation: 'card' }} />
        <Stack.Screen name="diario" options={{ presentation: 'card' }} />
        <Stack.Screen name="juego" options={{ presentation: 'card' }} />
        <Stack.Screen name="privacidad" options={{ presentation: 'card' }} />
        <Stack.Screen name="ayuda" options={{ presentation: 'card' }} />
        <Stack.Screen name="onboarding-mascota" options={{ presentation: 'card', gestureEnabled: false }} />
        <Stack.Screen name="agregar-mascota" options={{ presentation: 'card' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <BluetoothProvider>
                <InnerLayout />
              </BluetoothProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
