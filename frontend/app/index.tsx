import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Colors, FontSizes } from '../constants/theme';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, onboardingCompleted, dogs, refreshDogs } = useAuth();
  const [hasCheckedDogs, setHasCheckedDogs] = useState(false);

  useEffect(() => {
    const checkAndNavigate = async () => {
      if (!isLoading) {
        if (!isAuthenticated) {
          // No autenticado -> ir a selección de idioma
          router.replace('/onboarding/idioma');
        } else {
          // Autenticado -> verificar si tiene perros
          if (!hasCheckedDogs) {
            await refreshDogs();
            setHasCheckedDogs(true);
          }
        }
      }
    };
    
    checkAndNavigate();
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    // Una vez que hemos verificado los perros, navegar
    if (hasCheckedDogs && isAuthenticated && !isLoading) {
      if (dogs.length > 0) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding/perro');
      }
    }
  }, [hasCheckedDogs, dogs, isAuthenticated, isLoading]);

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
