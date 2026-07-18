import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { SecureStore } from '../utils/secureStore';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button, Input } from '../components/ui';
import { Spacing, BorderRadius, FontSizes, Fonts } from '../constants/theme';
import { BACKEND_URL } from '../config/backend';

export default function AgregarMascotaScreen() {
  const router = useRouter();
  const { refreshDogs, selectDog } = useAuth();
  const { t } = useLanguage();
  const { colors, shadows } = useTheme();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [ageUnit, setAgeUnit] = useState<'months' | 'years'>('years');
  const [weight, setWeight] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | null>(null);
  const [breed, setBreed] = useState('');
  const [chipId, setChipId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; age?: string; weight?: string }>({});

  const s = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = t('nameRequired');
    if (!age.trim() || isNaN(Number(age)) || Number(age) <= 0) newErrors.age = t('invalidAge');
    if (!weight.trim() || isNaN(Number(weight)) || Number(weight) <= 0) newErrors.weight = t('invalidWeight');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('session_token');
      const res = await axios.post(
        `${BACKEND_URL}/api/dogs`,
        {
          name: name.trim(),
          age: ageUnit === 'years' ? Number(age) * 12 : Number(age),
          weight: Number(weight),
          sex,
          breed: breed.trim() || undefined,
          chip_id: chipId.trim() || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await refreshDogs();
      if (res.data?.id) {
        await selectDog(res.data);
      }
      Alert.alert('✅', t('petAdded'), [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || t('petAddError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn} testID="add-pet-back-btn">
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={s.title}>{t('addPet')}</Text>
          <View style={{ width: 44 }} />
        </View>
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={s.iconContainer}>
            <Ionicons name="paw" size={40} color={colors.white} />
          </View>
          <Text style={s.subtitle}>{t('addPetSubtitle')}</Text>

          <Input
            label={`${t('dogName')} *`}
            placeholder={t('dogNamePlaceholder')}
            value={name}
            onChangeText={setName}
            icon="paw-outline"
            error={errors.name}
            autoCapitalize="words"
          />

          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>{t('dogAge')} *</Text>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
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
                <View style={s.unitToggle}>
                  <TouchableOpacity
                    style={[s.unitBtn, ageUnit === 'months' && { backgroundColor: colors.primary }]}
                    onPress={() => setAgeUnit('months')}
                    testID="age-unit-months"
                  >
                    <Text style={[s.unitText, ageUnit === 'months' && { color: '#FFF' }]}>{t('months')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.unitBtn, ageUnit === 'years' && { backgroundColor: colors.primary }]}
                    onPress={() => setAgeUnit('years')}
                    testID="age-unit-years"
                  >
                    <Text style={[s.unitText, ageUnit === 'years' && { color: '#FFF' }]}>{t('years')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <Input
            label={`${t('dogWeight')} *`}
            placeholder="Ej: 15"
            value={weight}
            onChangeText={setWeight}
            icon="scale-outline"
            keyboardType="numeric"
            error={errors.weight}
          />

          <Text style={s.fieldLabel}>{t('dogSex')}</Text>
          <View style={s.sexContainer}>
            <TouchableOpacity
              style={[s.sexButton, sex === 'male' && { backgroundColor: colors.primary }]}
              onPress={() => setSex('male')}
              testID="sex-male-btn"
            >
              <Ionicons name="male" size={22} color={sex === 'male' ? '#FFF' : colors.primary} />
              <Text style={[s.sexText, sex === 'male' && { color: '#FFF' }]}>{t('male')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.sexButton, sex === 'female' && { backgroundColor: colors.primary }]}
              onPress={() => setSex('female')}
              testID="sex-female-btn"
            >
              <Ionicons name="female" size={22} color={sex === 'female' ? '#FFF' : colors.primary} />
              <Text style={[s.sexText, sex === 'female' && { color: '#FFF' }]}>{t('female')}</Text>
            </TouchableOpacity>
          </View>

          <Input
            label={t('dogBreed')}
            placeholder="Ej: Golden Retriever"
            value={breed}
            onChangeText={setBreed}
            icon="paw-outline"
            autoCapitalize="words"
          />

          <Input
            label={t('chipId')}
            placeholder="Ej: 941000012345678"
            value={chipId}
            onChangeText={setChipId}
            icon="hardware-chip-outline"
          />

          <Button title={t('savePet')} onPress={handleSubmit} loading={isLoading} style={{ marginTop: Spacing.lg, marginBottom: Spacing.xl }} testID="save-pet-btn" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (C: any, S: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.cardBg, alignItems: 'center', justifyContent: 'center', ...S.sm },
  title: { fontSize: 20, fontFamily: Fonts.serif, fontWeight: '700', color: C.text },
  scrollContent: { padding: Spacing.lg, paddingTop: Spacing.sm },
  iconContainer: { width: 84, height: 84, borderRadius: 42, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: Spacing.md },
  subtitle: { fontSize: FontSizes.md, color: C.textSecondary, textAlign: 'center', marginBottom: Spacing.lg },
  row: { flexDirection: 'row', gap: Spacing.md },
  fieldLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: C.textSecondary, marginBottom: 6 },
  unitToggle: { flexDirection: 'row', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: C.grayLight, marginTop: 2 },
  unitBtn: { paddingHorizontal: 12, paddingVertical: 12, backgroundColor: 'transparent' },
  unitText: { color: C.textSecondary, fontWeight: '600', fontSize: 12 },
  sexContainer: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  sexButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.md, backgroundColor: C.cardBg, borderRadius: BorderRadius.md, borderWidth: 2, borderColor: C.primary },
  sexText: { fontSize: FontSizes.md, fontWeight: '600', color: C.primary },
});
