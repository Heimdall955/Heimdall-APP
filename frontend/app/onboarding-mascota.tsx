import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Spacing, BorderRadius, FontSizes } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { SecureStore } from '../utils/secureStore';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

const PET_TYPES = [
  { id: 'dog', icon: 'paw', color: '#4CAF50', bg: '#E8F5E9' },
  { id: 'cat', icon: 'logo-octocat', color: '#FF9800', bg: '#FFF3E0' },
  { id: 'rodent', icon: 'egg', color: '#9C27B0', bg: '#F3E5F5' },
  { id: 'bird', icon: 'paper-plane', color: '#2196F3', bg: '#E3F2FD' },
];

const TXT: Record<string, Record<string, string>> = {
  // Step titles
  stepPetType: { es: 'Que tipo de mascota tienes?', en: 'What type of pet do you have?', it: 'Che tipo di animale hai?' },
  stepBasic: { es: 'Cuentanos sobre tu mascota', en: 'Tell us about your pet', it: 'Raccontaci del tuo animale' },
  stepDetails: { es: 'Un poco mas de detalle', en: 'A few more details', it: 'Qualche dettaglio in piu' },
  // Pet types
  dog: { es: 'Perro', en: 'Dog', it: 'Cane' },
  cat: { es: 'Gato', en: 'Cat', it: 'Gatto' },
  rodent: { es: 'Roedor', en: 'Rodent', it: 'Roditore' },
  bird: { es: 'Pajaro', en: 'Bird', it: 'Uccello' },
  // Fields
  name: { es: 'Nombre', en: 'Name', it: 'Nome' },
  namePlaceholder: { es: 'Como se llama?', en: 'What\'s their name?', it: 'Come si chiama?' },
  breed: { es: 'Raza', en: 'Breed', it: 'Razza' },
  breedPlaceholder: { es: 'Ej: Labrador, Mestizo...', en: 'E.g.: Labrador, Mixed...', it: 'Es.: Labrador, Meticcio...' },
  sex: { es: 'Sexo', en: 'Sex', it: 'Sesso' },
  male: { es: 'Macho', en: 'Male', it: 'Maschio' },
  female: { es: 'Hembra', en: 'Female', it: 'Femmina' },
  ageMonths: { es: 'Edad', en: 'Age', it: 'Eta' },
  agePlaceholder: { es: 'Ej: 2', en: 'E.g.: 2', it: 'Es.: 2' },
  ageUnitMonths: { es: 'Meses', en: 'Months', it: 'Mesi' },
  ageUnitYears: { es: 'Años', en: 'Years', it: 'Anni' },
  weightKg: { es: 'Peso (kg)', en: 'Weight (kg)', it: 'Peso (kg)' },
  weightPlaceholder: { es: 'Ej: 12.5', en: 'E.g.: 12.5', it: 'Es.: 12,5' },
  neutered: { es: 'Esterilizado/a', en: 'Neutered/Spayed', it: 'Sterilizzato/a' },
  yes: { es: 'Si', en: 'Yes', it: 'Si' },
  no: { es: 'No', en: 'No', it: 'No' },
  chipId: { es: 'Numero de chip (opcional)', en: 'Chip number (optional)', it: 'Numero chip (opzionale)' },
  chipPlaceholder: { es: 'Ej: 941000024...', en: 'E.g.: 941000024...', it: 'Es.: 941000024...' },
  allergies: { es: 'Alergias (opcional)', en: 'Allergies (optional)', it: 'Allergie (opzionale)' },
  allergiesPlaceholder: { es: 'Ej: Pollo, cereales...', en: 'E.g.: Chicken, grains...', it: 'Es.: Pollo, cereali...' },
  next: { es: 'Siguiente', en: 'Next', it: 'Avanti' },
  back: { es: 'Atras', en: 'Back', it: 'Indietro' },
  finish: { es: 'Empezar!', en: 'Let\'s go!', it: 'Iniziamo!' },
  saving: { es: 'Guardando...', en: 'Saving...', it: 'Salvataggio...' },
  welcome: { es: 'Bienvenido a Heimdall', en: 'Welcome to Heimdall', it: 'Benvenuto su Heimdall' },
  welcomeSub: { es: 'Vamos a conocer a tu companero', en: 'Let\'s get to know your companion', it: 'Conosciamo il tuo compagno' },
  required: { es: 'Por favor completa el nombre', en: 'Please fill in the name', it: 'Per favore inserisci il nome' },
  step: { es: 'Paso', en: 'Step', it: 'Passo' },
};

export default function OnboardingMascotaScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { language } = useLanguage();
  const { refreshDogs, setOnboardingCompleted } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    pet_type: '',
    name: '',
    breed: '',
    sex: '',
    age: '',
    ageUnit: 'months' as 'months' | 'years',
    weight: '',
    neutered: false,
    chip_id: '',
    allergies: '',
  });

  const T = (key: string) => TXT[key]?.[language] || TXT[key]?.es || key;

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleFinish = async () => {
    if (!form.name.trim()) { Alert.alert('', T('required')); return; }
    setSaving(true);
    try {
      const token = await SecureStore.getItemAsync('session_token');
      const headers = { Authorization: `Bearer ${token}` };
      // Check if user already has dogs - update first one instead of creating duplicate
      const existingDogs = await axios.get(`${BACKEND_URL}/api/dogs`, { headers });
      const dogData = {
        name: form.name.trim(),
        pet_type: form.pet_type || 'dog',
        breed: form.breed.trim() || null,
        sex: form.sex || null,
        age: form.ageUnit === 'years' ? (parseInt(form.age) || 1) * 12 : parseInt(form.age) || 12,
        weight: parseFloat(form.weight) || 5,
        neutered: form.neutered,
        chip_id: form.chip_id.trim() || null,
        allergies: form.allergies.trim() || null,
      };
      if (existingDogs.data && existingDogs.data.length > 0) {
        await axios.put(`${BACKEND_URL}/api/dogs/${existingDogs.data[0].id}`, dogData, { headers });
      } else {
        await axios.post(`${BACKEND_URL}/api/dogs`, dogData, { headers });
      }
      await refreshDogs();
      await setOnboardingCompleted(true);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail || 'Error');
    }
    setSaving(false);
  };

  const s = useMemo(() => createStyles(colors), [colors]);

  // Step 0: Pet type
  if (step === 0) {
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={s.header}>
            <Ionicons name="shield" size={40} color={colors.primary} />
            <Text style={s.welcomeTitle}>{T('welcome')}</Text>
            <Text style={s.welcomeSub}>{T('welcomeSub')}</Text>
          </View>
          <Text style={s.stepTitle}>{T('stepPetType')}</Text>
          <View style={s.petGrid}>
            {PET_TYPES.map(pet => (
              <TouchableOpacity
                key={pet.id}
                style={[s.petCard, form.pet_type === pet.id && { borderColor: pet.color, borderWidth: 2.5, backgroundColor: pet.bg }]}
                onPress={() => update('pet_type', pet.id)}
                data-testid={`pet-type-${pet.id}`}
              >
                <View style={[s.petIcon, { backgroundColor: pet.bg }]}>
                  <Ionicons name={pet.icon as any} size={36} color={pet.color} />
                </View>
                <Text style={[s.petLabel, form.pet_type === pet.id && { color: pet.color, fontWeight: '700' }]}>{T(pet.id)}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[s.nextBtn, !form.pet_type && s.nextBtnDisabled]}
            onPress={() => form.pet_type && setStep(1)}
            disabled={!form.pet_type}
            data-testid="onboarding-next-0"
          >
            <Text style={s.nextBtnText}>{T('next')}</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Step 1: Name, Breed, Sex
  if (step === 1) {
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={s.stepHeader}>
              <Text style={s.stepIndicator}>{T('step')} 2/3</Text>
              <Text style={s.stepTitle}>{T('stepBasic')}</Text>
            </View>
            <View style={s.fieldGroup}>
              <Text style={s.fieldLabel}>{T('name')} *</Text>
              <TextInput style={s.input} value={form.name} onChangeText={v => update('name', v)} placeholder={T('namePlaceholder')} placeholderTextColor={colors.gray} data-testid="pet-name-input" />
            </View>
            <View style={s.fieldGroup}>
              <Text style={s.fieldLabel}>{T('breed')}</Text>
              <TextInput style={s.input} value={form.breed} onChangeText={v => update('breed', v)} placeholder={T('breedPlaceholder')} placeholderTextColor={colors.gray} data-testid="pet-breed-input" />
            </View>
            <View style={s.fieldGroup}>
              <Text style={s.fieldLabel}>{T('sex')}</Text>
              <View style={s.toggleRow}>
                <TouchableOpacity style={[s.toggleBtn, form.sex === 'male' && s.toggleActive]} onPress={() => update('sex', 'male')} data-testid="pet-sex-male">
                  <Ionicons name="male" size={18} color={form.sex === 'male' ? '#FFF' : colors.text} />
                  <Text style={[s.toggleText, form.sex === 'male' && s.toggleTextActive]}>{T('male')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.toggleBtn, form.sex === 'female' && s.toggleActiveF]} onPress={() => update('sex', 'female')} data-testid="pet-sex-female">
                  <Ionicons name="female" size={18} color={form.sex === 'female' ? '#FFF' : colors.text} />
                  <Text style={[s.toggleText, form.sex === 'female' && s.toggleTextActive]}>{T('female')}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={s.btnRow}>
              <TouchableOpacity style={s.backBtn} onPress={() => setStep(0)} data-testid="onboarding-back-1">
                <Ionicons name="arrow-back" size={20} color={colors.text} />
                <Text style={s.backBtnText}>{T('back')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.nextBtn, { flex: 1 }]} onPress={() => form.name.trim() ? setStep(2) : Alert.alert('', T('required'))} data-testid="onboarding-next-1">
                <Text style={s.nextBtnText}>{T('next')}</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Step 2: Age, Weight, Neutered, Chip, Allergies
  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={s.stepHeader}>
            <Text style={s.stepIndicator}>{T('step')} 3/3</Text>
            <Text style={s.stepTitle}>{T('stepDetails')}</Text>
          </View>
          <View style={s.rowFields}>
            <View style={[s.fieldGroup, { flex: 1 }]}>
              <Text style={s.fieldLabel}>{T('ageMonths')}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput style={[s.input, { flex: 1 }]} value={form.age} onChangeText={v => update('age', v)} placeholder={T('agePlaceholder')} placeholderTextColor={colors.gray} keyboardType="numeric" data-testid="pet-age-input" />
                <View style={{ flexDirection: 'row', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
                  <TouchableOpacity
                    style={{ paddingHorizontal: 12, paddingVertical: 10, backgroundColor: form.ageUnit === 'months' ? colors.primary : 'transparent' }}
                    onPress={() => update('ageUnit', 'months')}
                    data-testid="age-unit-months"
                  >
                    <Text style={{ color: form.ageUnit === 'months' ? '#fff' : colors.text, fontWeight: '600', fontSize: 13 }}>{T('ageUnitMonths')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ paddingHorizontal: 12, paddingVertical: 10, backgroundColor: form.ageUnit === 'years' ? colors.primary : 'transparent' }}
                    onPress={() => update('ageUnit', 'years')}
                    data-testid="age-unit-years"
                  >
                    <Text style={{ color: form.ageUnit === 'years' ? '#fff' : colors.text, fontWeight: '600', fontSize: 13 }}>{T('ageUnitYears')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={[s.fieldGroup, { flex: 1 }]}>
              <Text style={s.fieldLabel}>{T('weightKg')}</Text>
              <TextInput style={s.input} value={form.weight} onChangeText={v => update('weight', v)} placeholder={T('weightPlaceholder')} placeholderTextColor={colors.gray} keyboardType="decimal-pad" data-testid="pet-weight-input" />
            </View>
          </View>
          <View style={s.fieldGroup}>
            <Text style={s.fieldLabel}>{T('neutered')}</Text>
            <View style={s.toggleRow}>
              <TouchableOpacity style={[s.toggleBtn, form.neutered && s.toggleActive]} onPress={() => update('neutered', true)} data-testid="pet-neutered-yes">
                <Text style={[s.toggleText, form.neutered && s.toggleTextActive]}>{T('yes')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.toggleBtn, !form.neutered && s.toggleActiveNo]} onPress={() => update('neutered', false)} data-testid="pet-neutered-no">
                <Text style={[s.toggleText, !form.neutered && s.toggleTextActive]}>{T('no')}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={s.fieldGroup}>
            <Text style={s.fieldLabel}>{T('chipId')}</Text>
            <TextInput style={s.input} value={form.chip_id} onChangeText={v => update('chip_id', v)} placeholder={T('chipPlaceholder')} placeholderTextColor={colors.gray} data-testid="pet-chip-input" />
          </View>
          <View style={s.fieldGroup}>
            <Text style={s.fieldLabel}>{T('allergies')}</Text>
            <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} value={form.allergies} onChangeText={v => update('allergies', v)} placeholder={T('allergiesPlaceholder')} placeholderTextColor={colors.gray} multiline data-testid="pet-allergies-input" />
          </View>
          <View style={s.btnRow}>
            <TouchableOpacity style={s.backBtn} onPress={() => setStep(1)} data-testid="onboarding-back-2">
              <Ionicons name="arrow-back" size={20} color={colors.text} />
              <Text style={s.backBtnText}>{T('back')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.finishBtn, { flex: 1 }]} onPress={handleFinish} disabled={saving} data-testid="onboarding-finish">
              {saving ? (
                <Text style={s.finishBtnText}>{T('saving')}</Text>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={22} color="#FFF" />
                  <Text style={s.finishBtnText}>{T('finish')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (C: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  scrollContent: { padding: 24, paddingBottom: 40 },
  header: { alignItems: 'center', paddingVertical: 24 },
  welcomeTitle: { fontSize: 26, fontWeight: '800', color: C.text, marginTop: 12 },
  welcomeSub: { fontSize: 15, color: C.textSecondary, marginTop: 6 },
  stepHeader: { marginBottom: 20 },
  stepIndicator: { fontSize: 13, fontWeight: '700', color: C.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  stepTitle: { fontSize: 22, fontWeight: '700', color: C.text },
  petGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 20, marginBottom: 30 },
  petCard: { width: '47%', backgroundColor: C.white, borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1.5, borderColor: C.grayLight },
  petIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  petLabel: { fontSize: 15, fontWeight: '600', color: C.text },
  fieldGroup: { marginBottom: 18 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 8 },
  input: { backgroundColor: C.white, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: C.text, borderWidth: 1, borderColor: C.grayLight },
  toggleRow: { flexDirection: 'row', gap: 12 },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: 12, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.grayLight },
  toggleActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  toggleActiveF: { backgroundColor: '#E91E63', borderColor: '#E91E63' },
  toggleActiveNo: { backgroundColor: C.gray, borderColor: C.gray },
  toggleText: { fontSize: 14, fontWeight: '600', color: C.text },
  toggleTextActive: { color: '#FFF' },
  rowFields: { flexDirection: 'row', gap: 14 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.primary, paddingVertical: 16, borderRadius: 14 },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 14, backgroundColor: C.grayLight },
  backBtnText: { fontSize: 14, fontWeight: '600', color: C.text },
  finishBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#4CAF50', paddingVertical: 16, borderRadius: 14 },
  finishBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});
