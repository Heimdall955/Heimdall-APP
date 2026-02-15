import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui';
import { Colors, Spacing, FontSizes } from '../../constants/theme';

export default function ConfirmacionScreen() {
  const router = useRouter();
  const { currentDog } = useAuth();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleStart = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.iconContainer,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <Ionicons name="checkmark-circle" size={120} color={Colors.success} />
        </Animated.View>

        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>¡Todo listo!</Text>
          <Text style={styles.subtitle}>
            Ahora Heimdall vigila a{' '}
            <Text style={styles.dogName}>{currentDog?.name || 'tu perro'}</Text>
          </Text>
          <Text style={styles.description}>
            Hemos configurado todo para que puedas monitorear la salud y bienestar de tu compañero peludo.
          </Text>
        </Animated.View>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Ionicons name="heart" size={24} color={Colors.primary} />
            <Text style={styles.featureText}>Monitoreo de salud 360°</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="chatbubbles" size={24} color={Colors.primary} />
            <Text style={styles.featureText}>Asistente IA personalizado</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="school" size={24} color={Colors.primary} />
            <Text style={styles.featureText}>Educación positiva</Text>
          </View>
        </View>

        <Button
          title="Ir al inicio"
          onPress={handleStart}
          style={styles.button}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Spacing.xl,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  dogName: {
    color: Colors.primary,
    fontWeight: '700',
  },
  description: {
    fontSize: FontSizes.md,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
  features: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureText: {
    fontSize: FontSizes.md,
    color: Colors.text,
    fontWeight: '500',
  },
  button: {
    width: '100%',
  },
});
