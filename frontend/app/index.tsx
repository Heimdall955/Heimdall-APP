import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Image, Text, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Colors, FontSizes, Spacing } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { BiometricAuth } from '../utils/biometricAuth';

const { width, height } = Dimensions.get('window');

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, dogs, refreshDogs, login } = useAuth();
  const [navigationState, setNavigationState] = useState<'loading' | 'checking' | 'biometric' | 'ready'>('loading');
  const [showSplash, setShowSplash] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasNavigated = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const performNavigation = async () => {
      if (hasNavigated.current) return;
      if (showSplash || isLoading) {
        setNavigationState('loading');
        return;
      }
      if (!isAuthenticated) {
        // Try biometric auto-login
        const biometricEnabled = await BiometricAuth.isEnabled();
        if (biometricEnabled) {
          const { available, biometricType } = await BiometricAuth.isAvailable();
          if (available) {
            setNavigationState('biometric');
            const success = await BiometricAuth.authenticate(`Inicia sesión con ${biometricType}`);
            if (success) {
              const creds = await BiometricAuth.getCredentials();
              if (creds) {
                try {
                  await login(creds.email, creds.password);
                  return; // Will re-trigger this effect with isAuthenticated=true
                } catch {
                  // Credentials invalid, disable biometric
                  await BiometricAuth.disable();
                }
              }
            }
          }
        }
        hasNavigated.current = true;
        router.replace('/onboarding/idioma');
        return;
      }
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
      {/* Full screen background image */}
      <Image
        source={{ uri: 'https://customer-assets.emergentagent.com/job_pethani/artifacts/20rghbje_Gemini_Generated_Image_2r7wpq2r7wpq2r7w.png' }}
        style={styles.bgImage}
        resizeMode="cover"
        onLoad={() => setImageLoaded(true)}
      />
      
      {/* Dark overlay gradient */}
      <LinearGradient
        colors={['transparent', 'rgba(10,10,30,0.4)', 'rgba(10,10,30,0.85)', 'rgba(10,10,30,0.95)']}
        locations={[0, 0.35, 0.65, 1]}
        style={styles.overlay}
      />

      {/* Content over image */}
      <View style={styles.content}>
        <View style={styles.topSpacer} />
        
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>HEIMDALL</Text>
          <View style={styles.logoLine} />
          <Text style={styles.subtitle}>HANI</Text>
          <Text style={styles.tagline}>{'Guardi\u00e1n de tu mejor amigo'}</Text>
        </View>

        {/* Loading */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text style={styles.loadingText}>
            {navigationState === 'checking' ? 'Verificando...' : navigationState === 'biometric' ? 'Verificando identidad...' : 'Cargando...'}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by HANI AI</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1e',
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.xl,
  },
  topSpacer: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 8,
    textShadowColor: '#4ECDC4',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  logoLine: {
    width: 60,
    height: 3,
    backgroundColor: '#4ECDC4',
    marginVertical: 12,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4ECDC4',
    letterSpacing: 8,
  },
  tagline: {
    fontSize: FontSizes.md,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
    fontWeight: '400',
    letterSpacing: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  loadingText: {
    fontSize: FontSizes.md,
    color: 'rgba(255,255,255,0.5)',
    marginTop: Spacing.sm,
  },
  footer: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 2,
  },
});
