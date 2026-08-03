import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button, Input } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../../constants/theme';
import { BiometricAuth } from '../../utils/biometricAuth';
import axios from 'axios';
import { BACKEND_URL } from '../../config/backend';

export default function RegistroScreen() {
  const router = useRouter();
  const { login, register, isLoading, refreshDogs } = useAuth();
  const { t } = useLanguage();
  
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [showResetFlow, setShowResetFlow] = useState(false);
  const [resetStep, setResetStep] = useState<'email' | 'code'>('email');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

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
        router.push('/onboarding-mascota');
      }
    } catch (error: any) {
      Alert.alert(
        t('error') || 'Error',
        error.response?.data?.detail || t('genericError') || 'Ha ocurrido un error. Inténtalo de nuevo.'
      );
    }
  };


  const handleRequestReset = async () => {
    const emailToReset = resetEmail.trim().toLowerCase();
    if (!emailToReset || !/\S+@\S+\.\S+/.test(emailToReset)) {
      Alert.alert(t('error') || 'Error', t('invalidEmail') || 'Email inválido');
      return;
    }
    setResetLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/request-reset`, { email: emailToReset });
      if (res.data.code) {
        Alert.alert(
          t('recoveryCode') || 'Código de recuperación',
          `${t('yourCodeIs') || 'Tu código es'}: ${res.data.code}\n\n${t('codeExpiresIn') || 'Expira en 10 minutos'}`,
        );
      }
      setResetStep('code');
    } catch (error: any) {
      Alert.alert(t('error') || 'Error', error.response?.data?.detail || 'Error al solicitar recuperación');
    } finally {
      setResetLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!resetCode.trim() || resetCode.length !== 6) {
      Alert.alert(t('error') || 'Error', t('enterCode') || 'Introduce el código de 6 dígitos');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      Alert.alert(t('error') || 'Error', t('minCharacters') || 'Mínimo 6 caracteres');
      return;
    }
    setResetLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/auth/reset-password`, {
        email: resetEmail.trim().toLowerCase(),
        code: resetCode.trim(),
        new_password: newPassword,
      });
      Alert.alert(t('success') || 'Listo', t('passwordUpdated') || 'Contraseña actualizada correctamente');
      setShowResetFlow(false);
      setResetStep('email');
      setResetCode('');
      setNewPassword('');
      setResetEmail('');
    } catch (error: any) {
      Alert.alert(t('error') || 'Error', error.response?.data?.detail || 'Error al cambiar contraseña');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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

            {isLogin && (
              <TouchableOpacity 
                style={{ alignSelf: 'flex-end', marginTop: -Spacing.xs, marginBottom: Spacing.sm }}
                onPress={() => { setResetEmail(email); setShowResetFlow(true); setResetStep('email'); }}
                testID="forgot-password-link"
              >
                <Text style={{ fontSize: FontSizes.sm, color: Colors.primary, fontWeight: '500' }}>
                  {t('forgotPassword') || '¿Olvidaste tu contraseña?'}
                </Text>
              </TouchableOpacity>
            )}

            <Button
              title={isLogin ? t('loginButton') || 'Iniciar Sesión' : t('createAccountButton') || 'Crear Cuenta'}
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.submitButton}
            />

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

      {/* Password Reset Modal */}
      <Modal visible={showResetFlow} transparent animationType="slide" onRequestClose={() => setShowResetFlow(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.resetModal}>
            <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={() => { setShowResetFlow(false); setResetStep('email'); }}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            
            <Ionicons name="key" size={48} color={Colors.primary} style={{ alignSelf: 'center', marginBottom: Spacing.md }} />
            <Text style={styles.resetTitle}>{t('recoverPassword') || 'Recuperar contraseña'}</Text>

            {resetStep === 'email' ? (
              <>
                <Text style={styles.resetSubtitle}>{t('enterEmailToRecover') || 'Introduce tu email para recibir un código de recuperación'}</Text>
                <Input
                  label={t('email') || 'Email'}
                  placeholder="tu@email.com"
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  icon="mail-outline"
                  keyboardType="email-address"
                />
                <Button
                  title={t('sendCode') || 'Enviar código'}
                  onPress={handleRequestReset}
                  loading={resetLoading}
                  style={{ marginTop: Spacing.md }}
                />
              </>
            ) : (
              <>
                <Text style={styles.resetSubtitle}>{t('enterCodeAndPassword') || 'Introduce el código y tu nueva contraseña'}</Text>
                <Input
                  label={t('code') || 'Código'}
                  placeholder="123456"
                  value={resetCode}
                  onChangeText={setResetCode}
                  icon="keypad-outline"
                  keyboardType="numeric"
                />
                <Input
                  label={t('newPassword') || 'Nueva contraseña'}
                  placeholder="••••••••"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  icon="lock-closed-outline"
                  secureTextEntry
                />
                <Button
                  title={t('changePassword') || 'Cambiar contraseña'}
                  onPress={handleConfirmReset}
                  loading={resetLoading}
                  style={{ marginTop: Spacing.md }}
                />
                <TouchableOpacity style={{ marginTop: Spacing.md, alignSelf: 'center' }} onPress={() => setResetStep('email')}>
                  <Text style={{ color: Colors.primary, fontSize: FontSizes.sm }}>{t('resendCode') || 'Reenviar código'}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  resetModal: {
    backgroundColor: '#FFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  resetTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  resetSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
});
