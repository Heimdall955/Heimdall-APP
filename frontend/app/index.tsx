import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Colors, FontSizes } from '../constants/theme';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, dogs, refreshDogs } = useAuth();
  const [navigationState, setNavigationState] = useState<'loading' | 'checking' | 'ready'>('loading');
  const hasNavigated = useRef(false);

  useEffect(() => {
    const performNavigation = async () => {
      // Evitar navegación múltiple
      if (hasNavigated.current) return;
      
      // Esperar a que termine la carga inicial de auth
      if (isLoading) {
        setNavigationState('loading');
        return;
      }

      // Si no está autenticado, ir a idioma
      if (!isAuthenticated) {
        hasNavigated.current = true;
        router.replace('/onboarding/idioma');
        return;
      }

      // Usuario autenticado - verificar perros
      setNavigationState('checking');
      
      try {
        await refreshDogs();
      } catch (error) {
        console.log('Error refreshing dogs:', error);
      }
      
      setNavigationState('ready');
    };

    performNavigation();
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    // Navegar solo cuando estamos listos y no hemos navegado aún
    if (navigationState === 'ready' && isAuthenticated && !hasNavigated.current) {
      hasNavigated.current = true;
      if (dogs.length > 0) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding/perro');
      }
    }
  }, [navigationState, dogs, isAuthenticated]);

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
