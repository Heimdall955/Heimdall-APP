import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Colors, FontSizes } from '../constants/theme';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, onboardingCompleted, dogs } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/onboarding/idioma');
      } else if (!onboardingCompleted || dogs.length === 0) {
        router.replace('/onboarding/perro');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [isLoading, isAuthenticated, onboardingCompleted, dogs]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>HEIMDALL</Text>
        <Text style={styles.subtitle}>Bienestar Canino</Text>
      </View>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    color: Colors.primary,
    marginTop: 8,
  },
});
