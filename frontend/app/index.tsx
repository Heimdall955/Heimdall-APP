import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Image, Text, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Colors, FontSizes, Spacing } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, dogs, refreshDogs } = useAuth();
  const [navigationState, setNavigationState] = useState<'loading' | 'checking' | 'ready'>('loading');
  const [showSplash, setShowSplash] = useState(true);
  const hasNavigated = useRef(false);

  // Mostrar splash por un mínimo de 2 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const performNavigation = async () => {
      // Evitar navegación múltiple
      if (hasNavigated.current) return;
      
      // Esperar a que termine el splash y la carga inicial de auth
      if (showSplash || isLoading) {
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
  }, [showSplash, isLoading, isAuthenticated]);

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
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Heimdall Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://customer-assets.emergentagent.com/job_pethani/artifacts/20rghbje_Gemini_Generated_Image_2r7wpq2r7wpq2r7w.png' }}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Logo and Text */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>HEIMDALL</Text>
          <Text style={styles.subtitle}>Guardián de tu mejor amigo</Text>
        </View>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            {navigationState === 'checking' ? 'Verificando...' : 'Cargando...'}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by HANI AI</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  imageContainer: {
    width: width * 0.7,
    height: height * 0.4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 6,
    textShadowColor: Colors.primary,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    color: Colors.primary,
    marginTop: Spacing.sm,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  loadingText: {
    fontSize: FontSizes.md,
    color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing.sm,
  },
  footer: {
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.5)',
  },
});
