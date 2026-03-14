import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button, Input } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../../constants/theme';
import { BiometricAuth } from '../../utils/biometricAuth';

export default function RegistroScreen() {
  const router = useRouter();
  const { login, register, loginWithGoogle, isLoading, refreshDogs } = useAuth();
  const { t } = useLanguage();
  
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    
    if (!isLogin && !name.trim()) {
      newErrors.name = t('nameRequired') || 'El nombre es requerido';
    }
    if (!email.trim()) {
      newErrors.email = t('emailRequired') || 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('invalidEmail') || 'Email inválido';
    }
    if (!password.trim()) {
      newErrors.password = t('passwordRequired') || 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = t('minCharacters') || 'Mínimo 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    try {
      if (isLogin) {
        await login(email, password);
        const dogsResponse = await refreshDogs();

        // Offer biometric setup after successful login
        const { available, biometricType } = await BiometricAuth.isAvailable();
        const alreadyEnabled = await BiometricAuth.isEnabled();
        if (available && !alreadyEnabled) {
          Alert.alert(
            biometricType,
            `¿Quieres activar ${biometricType} para iniciar sesión más rápido?`,
            [
              { text: 'No, gracias', style: 'cancel', onPress: () => router.replace('/') },
              {
                text: 'Activar',
                onPress: async () => {
                  const success = await BiometricAuth.authenticate(`Confirma ${biometricType}`);
                  if (success) {
                    await BiometricAuth.saveCredentials(email, password);
                    Alert.alert(biometricType, `${biometricType} activado correctamente`);
                  }
                  router.replace('/');
                },
              },
            ]
          );
        } else {
          // If biometric is already enabled, update credentials silently
          if (alreadyEnabled) {
            await BiometricAuth.saveCredentials(email, password);
          }
          router.replace('/');
        }
      } else {
        await register(email, password, name);
        router.push('/onboarding/perro');
      }
    } catch (error: any) {
      Alert.alert(
        t('error') || 'Error',
        error.response?.data?.detail || t('genericError') || 'Ha ocurrido un error. Inténtalo de nuevo.'
      );
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      Alert.alert(t('error') || 'Error', t('googleLoginError') || 'No se pudo iniciar sesión con Google');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Ionicons name="paw" size={60} color={Colors.primary} />
            <Text style={styles.title}>{isLogin ? t('welcomeBack') || 'Bienvenido de vuelta' : t('createAccount') || 'Crear cuenta'}</Text>
            <Text style={styles.subtitle}>
              {isLogin ? t('loginToContinue') || 'Inicia sesión para continuar' : t('registerToStart') || 'Regístrate para comenzar'}
            </Text>
          </View>

          <View style={styles.form}>
            {!isLogin && (
              <Input
                label={t('name') || 'Nombre'}
                placeholder={t('yourName') || 'Tu nombre'}
                value={name}
                onChangeText={setName}
                icon="person-outline"
                error={errors.name}
                autoCapitalize="words"
              />
            )}
            
            <Input
              label={t('email') || 'Email'}
              placeholder="tu@email.com"
              value={email}
              onChangeText={setEmail}
              icon="mail-outline"
              keyboardType="email-address"
              error={errors.email}
            />
            
            <Input
              label={t('password') || 'Contraseña'}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              icon="lock-closed-outline"
              secureTextEntry
              error={errors.password}
            />

            <Button
              title={isLogin ? t('loginButton') || 'Iniciar Sesión' : t('createAccountButton') || 'Crear Cuenta'}
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.submitButton}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('orContinueWith') || 'o continúa con'}</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
              <Ionicons name="logo-google" size={24} color={Colors.text} />
              <Text style={styles.googleButtonText}>{t('continueWithGoogle') || 'Continuar con Google'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.switchMode} 
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.switchModeText}>
                {isLogin ? (t('noAccount') || '¿No tienes cuenta? ') : (t('haveAccount') || '¿Ya tienes cuenta? ')}
                <Text style={styles.switchModeLink}>
                  {isLogin ? t('register') || 'Regístrate' : t('login') || 'Inicia sesión'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  form: {
    flex: 1,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.grayLight,
  },
  dividerText: {
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.sm,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.grayLight,
    gap: Spacing.sm,
  },
  googleButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  switchMode: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  switchModeLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
