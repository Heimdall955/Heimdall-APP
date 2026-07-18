import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage, Language } from '../../contexts/LanguageContext';
import { Spacing, BorderRadius, FontSizes, Fonts } from '../../constants/theme';

const GREEN = '#1E4D3B';
const GOLD = '#B98A1D';
const CREAM = '#F6F4EE';

const languages: { code: Language; name: string; flag: any }[] = [
  { code: 'es', name: 'Español', flag: require('../../assets/images/flag-es.png') },
  { code: 'en', name: 'English', flag: require('../../assets/images/flag-en.png') },
  { code: 'it', name: 'Italiano', flag: require('../../assets/images/flag-it.png') },
];

const OrnamentDivider = () => (
  <View style={styles.ornamentRow}>
    <View style={styles.ornamentArrow}><Ionicons name="remove" size={14} color={GOLD} /></View>
    <View style={styles.ornamentLine} />
    <View style={styles.ornamentDiamond} />
    <Image source={require('../../assets/images/tree-of-life.png')} style={{ width: 26, height: 26 }} resizeMode="contain" />
    <View style={styles.ornamentDiamond} />
    <View style={styles.ornamentLine} />
    <View style={styles.ornamentArrow}><Ionicons name="remove" size={14} color={GOLD} /></View>
  </View>
);

export default function IdiomaScreen() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { width } = useWindowDimensions();

  const handleSelectLanguage = async (lang: Language) => {
    await setLanguage(lang);
    router.push('/onboarding/registro');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <Image
          source={require('../../assets/images/language-hero.png')}
          style={{ width: '100%', height: Math.min(width * 0.67, 340), marginBottom: -14 }}
          resizeMode="cover"
        />

        <SafeAreaView edges={[]} style={{ paddingHorizontal: Spacing.lg }}>
          <Text style={styles.title}>HEIMDALL</Text>
          <OrnamentDivider />
          <Text style={styles.subtitle}>Bienestar Canino Inteligente</Text>

          <Text style={styles.selectText}>Selecciona tu idioma</Text>
          <View style={{ alignItems: 'center', marginBottom: Spacing.md }}>
            <View style={styles.ornamentDiamond} />
          </View>

          <View style={styles.languageList}>
            {languages.map((lang) => {
              const isActive = language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.languageButton, isActive && styles.languageButtonActive]}
                  onPress={() => handleSelectLanguage(lang.code)}
                  activeOpacity={0.8}
                  testID={`language-${lang.code}`}
                >
                  <Image source={lang.flag} style={styles.flagImg} resizeMode="contain" />
                  <Text style={styles.languageName}>{lang.name}</Text>
                  {isActive ? (
                    <View style={styles.checkCircle}>
                      <Ionicons name="checkmark" size={16} color="#FFF" />
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color="#A5AFA8" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.footer}>
            <View style={styles.footerOrnament}>
              <View style={styles.ornamentLine} />
              <Image source={require('../../assets/images/shield-paw.png')} style={{ width: 34, height: 38 }} resizeMode="contain" />
              <View style={styles.ornamentLine} />
            </View>
            <Text style={styles.tagline}>Tu compañero. Su bienestar. Nuestra misión.</Text>
          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM },
  title: {
    fontSize: 42,
    fontFamily: Fonts.serif,
    fontWeight: '700',
    color: GREEN,
    letterSpacing: 5,
    textAlign: 'center',
  },
  ornamentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6, marginBottom: 8 },
  ornamentLine: { width: 52, height: 1, backgroundColor: GOLD + '90' },
  ornamentDiamond: { width: 7, height: 7, backgroundColor: GOLD, transform: [{ rotate: '45deg' }] },
  ornamentArrow: { opacity: 0.7 },
  subtitle: { fontSize: FontSizes.lg, color: '#5C6660', textAlign: 'center', marginBottom: Spacing.xl },
  selectText: { fontSize: 19, fontWeight: '700', color: GREEN, textAlign: 'center', marginBottom: 8 },
  languageList: { gap: Spacing.md, marginTop: Spacing.sm },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: Spacing.lg,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  languageButtonActive: {
    borderWidth: 1.5,
    borderColor: '#1E5B4A',
  },
  flagImg: { width: 44, height: 32, marginRight: Spacing.lg },
  languageName: { flex: 1, fontSize: 19, fontWeight: '700', color: '#22332D' },
  checkCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1E7A4F', alignItems: 'center', justifyContent: 'center' },
  footer: { alignItems: 'center', marginTop: Spacing.xl },
  footerOrnament: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8 },
  tagline: { fontSize: FontSizes.sm, color: '#8A938D', textAlign: 'center' },
});
