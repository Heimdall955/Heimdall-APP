import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { SecureStore } from '../../utils/secureStore';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Card } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../../constants/theme';

import { BACKEND_URL } from '../../config/backend';

export default function PerroScreen() {
  const router = useRouter();
  const { refreshDogs, setOnboardingCompleted } = useAuth();
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [ageUnit, setAgeUnit] = useState<'months' | 'years'>('months');
  const [weight, setWeight] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | null>(null);
  const [breed, setBreed] = useState('');
  const [chipId, setChipId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; age?: string; weight?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    
    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (!age.trim()) {
      newErrors.age = 'La edad es requerida';
    } else if (isNaN(Number(age)) || Number(age) <= 0) {
      newErrors.age = 'Edad inválida';
    }
    if (!weight.trim()) {
      newErrors.weight = 'El peso es requerido';
    } else if (isNaN(Number(weight)) || Number(weight) <= 0) {
      newErrors.weight = 'Peso inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('session_token');
      await axios.post(
        `${BACKEND_URL}/api/dogs`,
        {
          name: name.trim(),
          age: ageUnit === 'years' ? Number(age) * 12 : Number(age),
          weight: Number(weight),
          sex,
          breed: breed.trim() || undefined,
          chip_id: chipId.trim() || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      await refreshDogs();
      await setOnboardingCompleted(true);
      router.push('/onboarding/confirmacion');
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'No se pudo guardar el perfil del perro'
      );
    } finally {
      setIsLoading(false);
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
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="paw" size={48} color={Colors.white} />
            </View>
            <Text style={styles.title}>Cuéntanos sobre tu perro</Text>
            <Text style={styles.subtitle}>Necesitamos algunos datos para personalizar tu experiencia</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Nombre del perro *"
              placeholder="¿Cómo se llama?"
              value={name}
              onChangeText={setName}
              icon="paw-outline"
              error={errors.name}
              autoCapitalize="words"
            />
            
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={{ color: '#8a8a8a', fontSize: 14, marginBottom: 6, fontWeight: '500' }}>Edad *</Text>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Input
                      placeholder={ageUnit === 'years' ? 'Ej: 2' : 'Ej: 24'}
                      value={age}
                      onChangeText={setAge}
                      icon="calendar-outline"
                      keyboardType="numeric"
                      error={errors.age}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#2a2a3e', marginBottom: errors.age ? 20 : 0 }}>
                    <TouchableOpacity
                      style={{ paddingHorizontal: 10, paddingVertical: 10, backgroundColor: ageUnit === 'months' ? Colors.primary : 'transparent' }}
                      onPress={() => setAgeUnit('months')}
                    >
                      <Text style={{ color: ageUnit === 'months' ? '#fff' : '#aaa', fontWeight: '600', fontSize: 12 }}>Meses</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ paddingHorizontal: 10, paddingVertical: 10, backgroundColor: ageUnit === 'years' ? Colors.primary : 'transparent' }}
                      onPress={() => setAgeUnit('years')}
                    >
                      <Text style={{ color: ageUnit === 'years' ? '#fff' : '#aaa', fontWeight: '600', fontSize: 12 }}>Años</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Peso (kg) *"
                  placeholder="Ej: 15"
                  value={weight}
                  onChangeText={setWeight}
                  icon="scale-outline"
                  keyboardType="numeric"
                  error={errors.weight}
                />
              </View>
            </View>

            <Text style={styles.label}>Sexo (opcional)</Text>
            <View style={styles.sexContainer}>
              <TouchableOpacity
                style={[styles.sexButton, sex === 'male' && styles.sexButtonActive]}
                onPress={() => setSex('male')}
              >
                <Ionicons 
                  name="male" 
                  size={24} 
                  color={sex === 'male' ? Colors.white : Colors.primary} 
                />
                <Text style={[styles.sexText, sex === 'male' && styles.sexTextActive]}>
                  Macho
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sexButton, sex === 'female' && styles.sexButtonActive]}
                onPress={() => setSex('female')}
              >
                <Ionicons 
                  name="female" 
                  size={24} 
                  color={sex === 'female' ? Colors.white : Colors.primary} 
                />
                <Text style={[styles.sexText, sex === 'female' && styles.sexTextActive]}>
                  Hembra
                </Text>
              </TouchableOpacity>
            </View>

            <Input
              label="Raza (opcional)"
              placeholder="Ej: Golden Retriever"
              value={breed}
              onChangeText={setBreed}
              icon="paw-outline"
              autoCapitalize="words"
            />

            <Input
              label="Número de chip (opcional)"
              placeholder="Ej: 941000012345678"
              value={chipId}
              onChangeText={setChipId}
              icon="hardware-chip-outline"
            />

            <Button
              title="Continuar"
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.submitButton}
            />
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
  header: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  sexContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  sexButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  sexButtonActive: {
    backgroundColor: Colors.primary,
  },
  sexText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  sexTextActive: {
    color: Colors.white,
  },
  submitButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
});
