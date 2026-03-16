import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSubscription } from '../hooks/useSubscription';
import { Spacing, BorderRadius, FontSizes } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const { width } = Dimensions.get('window');

const GOLD = '#C8A960';
const GOLD_LIGHT = '#E8D5A3';
const GOLD_DARK = '#A68B3C';
const BG_DARK = '#0D0D0D';
const BG_CARD = '#1A1A1A';
const BG_CARD_LIGHT = '#222222';
const TEXT_GOLD = '#D4B96A';
const TEXT_LIGHT = '#E8E0D0';
const TEXT_MUTED = '#8A8070';

export default function ProScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const { isPro, loading: subLoading, purchasePackage, restorePurchases, packages, isSimulated } = useSubscription();
  const [purchasing, setPurchasing] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<'basico' | 'guardian'>('guardian');

  const txt = useMemo(() => ({
    choosePlan: { es: 'Elige el plan adecuado para ti', en: 'Choose the right plan for you', it: 'Scegli il piano giusto per te' },
    free7days: { es: 'Primeros 7 dias gratis', en: 'First 7 days free', it: 'Primi 7 giorni gratis' },
    planBasico: { es: 'Heimdall Basico', en: 'Heimdall Basic', it: 'Heimdall Base' },
    planBasicoDesc: { es: 'Cuidado diario con calma y claridad', en: 'Daily care with calm and clarity', it: 'Cura quotidiana con calma e chiarezza' },
    planGuardian: { es: 'Heimdall Guardian', en: 'Heimdall Guardian', it: 'Heimdall Guardiano' },
    planGuardianDesc: { es: 'Proteccion inteligente para tu companero', en: 'Smart protection for your companion', it: 'Protezione intelligente per il tuo compagno' },
    recommended: { es: 'Recomendado', en: 'Recommended', it: 'Consigliato' },
    feat1: { es: 'Seguimiento inteligente de salud', en: 'Smart health tracking', it: 'Monitoraggio intelligente della salute' },
    feat2: { es: 'Registro de sintomas y episodios', en: 'Symptom and episode logging', it: 'Registrazione sintomi ed episodi' },
    feat3: { es: 'Historial completo de tu animal', en: 'Complete history of your pet', it: 'Storico completo del tuo animale' },
    feat4: { es: 'Ayuda y orientacion 24/7', en: 'Help and guidance 24/7', it: 'Aiuto e orientamento 24/7' },
    feat5: { es: 'Recordatorios importantes', en: 'Important reminders', it: 'Promemoria importanti' },
    feat6: { es: 'Consejos personalizados', en: 'Personalized tips', it: 'Consigli personalizzati' },
    feat7: { es: 'Herramientas de prevencion y cuidado', en: 'Prevention and care tools', it: 'Strumenti di prevenzione e cura' },
    chooseDuration: { es: 'Elige la duracion de tu plan', en: 'Choose your plan duration', it: 'Scegli la durata del tuo piano' },
    month1: { es: '1 mes', en: '1 month', it: '1 mese' },
    perMonth: { es: 'por mes', en: 'per month', it: 'al mese' },
    tryFree: { es: 'PROBAR GRATIS', en: 'TRY FREE', it: 'PROVA GRATIS' },
    trialNote: { es: 'Primeros 7 dias gratis. Despues 4,90 EUR al mes. Cancela cuando quieras.', en: 'First 7 days free. Then 4.90 EUR/month. Cancel anytime.', it: 'Primi 7 giorni gratis. Poi 4,90 EUR al mese. Cancella quando vuoi.' },
    startTrial: { es: 'Empieza tu prueba gratuita', en: 'Start your free trial', it: 'Inizia la tua prova gratuita' },
    timelineToday: { es: 'Hoy', en: 'Today', it: 'Oggi' },
    timelineTodayDesc: { es: 'Accede a todas las funciones de Heimdall', en: 'Access all Heimdall features', it: 'Accedi a tutte le funzioni di Heimdall' },
    timelineDay5: { es: 'Dia 5', en: 'Day 5', it: 'Giorno 5' },
    timelineDay5Desc: { es: 'Te enviaremos un recordatorio antes de que termine tu prueba', en: 'We\'ll send a reminder before your trial ends', it: 'Ti invieremo un promemoria prima della fine della prova' },
    timelineDay7: { es: 'Dia 7', en: 'Day 7', it: 'Giorno 7' },
    timelineDay7Desc: { es: 'Se cobrara 4,90 EUR al mes. Puedes cancelar antes en cualquier momento', en: 'You\'ll be charged 4.90 EUR/month. You can cancel anytime before', it: 'Verra addebitato 4,90 EUR al mese. Puoi cancellare in qualsiasi momento' },
    quote: { es: 'Heimdall ilumina lo que no siempre sabemos ver', en: 'Heimdall illuminates what we don\'t always see', it: 'Heimdall illumina cio che non sempre sappiamo vedere' },
    alreadyPro: { es: 'Ya eres Guardian', en: 'You\'re a Guardian', it: 'Sei gia Guardiano' },
    enjoyPro: { es: 'Disfruta de todas las funciones premium', en: 'Enjoy all premium features', it: 'Goditi tutte le funzioni premium' },
    back: { es: 'Volver', en: 'Go back', it: 'Indietro' },
    restorePurchases: { es: 'Restaurar compras', en: 'Restore purchases', it: 'Ripristina acquisti' },
    annual: { es: '12 meses', en: '12 months', it: '12 mesi' },
    annualPrice: { es: '39,90 EUR', en: '39.90 EUR', it: '39,90 EUR' },
    annualPerMonth: { es: '3,33 EUR/mes', en: '3.33 EUR/month', it: '3,33 EUR/mese' },
    save32: { es: 'Ahorra 32%', en: 'Save 32%', it: 'Risparmia 32%' },
    processing: { es: 'Procesando...', en: 'Processing...', it: 'Elaborazione...' },
  }), []);

  const T = (key: keyof typeof txt) => txt[key][language] || txt[key].es;

  const handleSubscribe = async () => {
    setPurchasing(true);
    try {
      if (packages.length > 0) {
        const pkg = packages.find((p: any) => selectedDuration === 'annual' ? p.identifier?.includes('annual') : !p.identifier?.includes('annual')) || packages[0];
        await purchasePackage(pkg);
        Alert.alert('Heimdall Guardian', T('alreadyPro'));
        router.back();
      } else {
        Alert.alert('Heimdall', T('startTrial'));
      }
    } catch (e: any) {
      if (!e?.userCancelled) Alert.alert('Error', e?.message || 'Error');
    }
    setPurchasing(false);
  };

  const s = useMemo(() => styles, []);

  if (isPro) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <ScrollView contentContainerStyle={s.proActiveContainer}>
          <View style={s.proActiveBadge}>
            <Ionicons name="shield-checkmark" size={48} color={GOLD} />
          </View>
          <Text style={s.proActiveTitle}>{T('alreadyPro')}</Text>
          <Text style={s.proActiveDesc}>{T('enjoyPro')}</Text>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Text style={s.backBtnText}>{T('back')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const guardianFeatures = [
    { icon: 'pulse', text: T('feat1') },
    { icon: 'clipboard', text: T('feat2') },
    { icon: 'time', text: T('feat3') },
    { icon: 'chatbubble-ellipses', text: T('feat4') },
    { icon: 'notifications', text: T('feat5') },
    { icon: 'bulb', text: T('feat6') },
    { icon: 'shield-checkmark', text: T('feat7') },
  ];

  const timeline = [
    { day: T('timelineToday'), desc: T('timelineTodayDesc'), icon: 'lock-open', active: true },
    { day: T('timelineDay5'), desc: T('timelineDay5Desc'), icon: 'mail', active: false },
    { day: T('timelineDay7'), desc: T('timelineDay7Desc'), icon: 'card', active: false },
  ];

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.headerBack} data-testid="pro-back-btn">
          <Ionicons name="arrow-back" size={24} color={GOLD} />
        </TouchableOpacity>
        <View style={s.headerLogo}>
          <Ionicons name="shield" size={20} color={GOLD} />
          <Text style={s.headerTitle}>HEIMDALL</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroBadge}>
            <Ionicons name="diamond" size={36} color={GOLD} />
          </View>
          <Text style={s.heroTitle}>{T('choosePlan')}</Text>
          <View style={s.freeTrialBadge}>
            <Ionicons name="gift" size={14} color={BG_DARK} />
            <Text style={s.freeTrialText}>{T('free7days')}</Text>
          </View>
        </View>

        {/* Plan Cards */}
        <View style={s.plansRow}>
          {/* Basico */}
          <TouchableOpacity
            style={[s.planCard, selectedPlan === 'basico' && s.planCardSelected]}
            onPress={() => setSelectedPlan('basico')}
            data-testid="plan-basico"
          >
            <Ionicons name="paw" size={28} color={selectedPlan === 'basico' ? GOLD : TEXT_MUTED} />
            <Text style={[s.planName, selectedPlan === 'basico' && s.planNameSelected]}>{T('planBasico')}</Text>
            <Text style={s.planDesc}>{T('planBasicoDesc')}</Text>
          </TouchableOpacity>

          {/* Guardian */}
          <TouchableOpacity
            style={[s.planCard, s.planCardGuardian, selectedPlan === 'guardian' && s.planCardSelected]}
            onPress={() => setSelectedPlan('guardian')}
            data-testid="plan-guardian"
          >
            <View style={s.recommendedBadge}>
              <Text style={s.recommendedText}>{T('recommended')}</Text>
            </View>
            <Ionicons name="shield" size={28} color={GOLD} />
            <Text style={[s.planName, s.planNameSelected]}>{T('planGuardian')}</Text>
            <Text style={s.planDesc}>{T('planGuardianDesc')}</Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        {selectedPlan === 'guardian' && (
          <View style={s.featuresCard}>
            {guardianFeatures.map((f, i) => (
              <View key={i} style={s.featureRow}>
                <View style={s.featureIcon}>
                  <Ionicons name={f.icon as any} size={18} color={GOLD} />
                </View>
                <Text style={s.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Duration Selector */}
        <Text style={s.durationTitle}>{T('chooseDuration')}</Text>
        <View style={s.durationRow}>
          <TouchableOpacity
            style={[s.durationCard, selectedDuration === 'monthly' && s.durationSelected]}
            onPress={() => setSelectedDuration('monthly')}
            data-testid="duration-monthly"
          >
            <Text style={[s.durationLabel, selectedDuration === 'monthly' && s.durationLabelActive]}>{T('month1')}</Text>
            <Text style={s.durationPrice}>4,90 EUR</Text>
            <Text style={s.durationSub}>{T('perMonth')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.durationCard, selectedDuration === 'annual' && s.durationSelected]}
            onPress={() => setSelectedDuration('annual')}
            data-testid="duration-annual"
          >
            <View style={s.saveBadge}><Text style={s.saveBadgeText}>{T('save32')}</Text></View>
            <Text style={[s.durationLabel, selectedDuration === 'annual' && s.durationLabelActive]}>{T('annual')}</Text>
            <Text style={s.durationPrice}>{T('annualPrice')}</Text>
            <Text style={s.durationSub}>{T('annualPerMonth')}</Text>
          </TouchableOpacity>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={s.ctaButton}
          onPress={handleSubscribe}
          disabled={purchasing}
          data-testid="pro-subscribe-btn"
        >
          {purchasing ? (
            <ActivityIndicator color={BG_DARK} />
          ) : (
            <>
              <Ionicons name="flash" size={20} color={BG_DARK} />
              <Text style={s.ctaText}>{T('tryFree')}</Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={s.trialNote}>{T('trialNote')}</Text>

        {/* Timeline */}
        <View style={s.timelineSection}>
          <Text style={s.timelineTitle}>{T('startTrial')}</Text>
          {timeline.map((item, i) => (
            <View key={i} style={s.timelineRow}>
              <View style={s.timelineLeft}>
                <View style={[s.timelineDot, item.active && s.timelineDotActive]}>
                  <Ionicons name={item.icon as any} size={14} color={item.active ? BG_DARK : TEXT_MUTED} />
                </View>
                {i < timeline.length - 1 && <View style={s.timelineLine} />}
              </View>
              <View style={s.timelineContent}>
                <Text style={[s.timelineDay, item.active && s.timelineDayActive]}>{item.day}</Text>
                <Text style={s.timelineDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quote */}
        <View style={s.quoteSection}>
          <View style={s.quoteLine} />
          <Text style={s.quoteText}>{T('quote')}</Text>
          <View style={s.quoteLine} />
        </View>

        {/* Restore */}
        <TouchableOpacity style={s.restoreBtn} onPress={restorePurchases} data-testid="restore-purchases-btn">
          <Text style={s.restoreText}>{T('restorePurchases')}</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_DARK },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerBack: { width: 40, height: 40, borderRadius: 20, backgroundColor: BG_CARD, alignItems: 'center', justifyContent: 'center' },
  headerLogo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: GOLD, letterSpacing: 3 },
  scrollContent: { paddingHorizontal: 20 },

  // Hero
  hero: { alignItems: 'center', paddingTop: 20, paddingBottom: 28 },
  heroBadge: { width: 72, height: 72, borderRadius: 36, backgroundColor: BG_CARD, borderWidth: 2, borderColor: GOLD_DARK, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  heroTitle: { fontSize: 22, fontWeight: '700', color: TEXT_LIGHT, textAlign: 'center', marginBottom: 12 },
  freeTrialBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: GOLD, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  freeTrialText: { fontSize: 13, fontWeight: '700', color: BG_DARK },

  // Plans
  plansRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  planCard: { flex: 1, backgroundColor: BG_CARD, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#333' },
  planCardGuardian: { borderColor: GOLD_DARK },
  planCardSelected: { borderColor: GOLD, backgroundColor: '#1F1A0F' },
  planName: { fontSize: 15, fontWeight: '700', color: TEXT_MUTED, marginTop: 10, textAlign: 'center' },
  planNameSelected: { color: GOLD },
  planDesc: { fontSize: 12, color: TEXT_MUTED, textAlign: 'center', marginTop: 6, lineHeight: 17 },
  recommendedBadge: { position: 'absolute', top: -10, backgroundColor: GOLD, paddingHorizontal: 12, paddingVertical: 3, borderRadius: 10 },
  recommendedText: { fontSize: 10, fontWeight: '800', color: BG_DARK, textTransform: 'uppercase', letterSpacing: 1 },

  // Features
  featuresCard: { backgroundColor: BG_CARD, borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#2A2520' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  featureIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: GOLD + '15', alignItems: 'center', justifyContent: 'center' },
  featureText: { fontSize: 14, color: TEXT_LIGHT, flex: 1 },

  // Duration
  durationTitle: { fontSize: 16, fontWeight: '700', color: TEXT_LIGHT, marginBottom: 12 },
  durationRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  durationCard: { flex: 1, backgroundColor: BG_CARD, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#333' },
  durationSelected: { borderColor: GOLD, backgroundColor: '#1F1A0F' },
  durationLabel: { fontSize: 14, fontWeight: '600', color: TEXT_MUTED, marginBottom: 6 },
  durationLabelActive: { color: GOLD },
  durationPrice: { fontSize: 22, fontWeight: '800', color: TEXT_LIGHT },
  durationSub: { fontSize: 12, color: TEXT_MUTED, marginTop: 2 },
  saveBadge: { position: 'absolute', top: -8, backgroundColor: '#22C55E', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 8 },
  saveBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFF' },

  // CTA
  ctaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: GOLD, paddingVertical: 16, borderRadius: 14, marginBottom: 10 },
  ctaText: { fontSize: 16, fontWeight: '800', color: BG_DARK, letterSpacing: 1 },
  trialNote: { fontSize: 12, color: TEXT_MUTED, textAlign: 'center', marginBottom: 28, lineHeight: 18 },

  // Timeline
  timelineSection: { marginBottom: 28 },
  timelineTitle: { fontSize: 16, fontWeight: '700', color: TEXT_LIGHT, marginBottom: 20 },
  timelineRow: { flexDirection: 'row', marginBottom: 0 },
  timelineLeft: { width: 40, alignItems: 'center' },
  timelineDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: BG_CARD, borderWidth: 1.5, borderColor: '#444', alignItems: 'center', justifyContent: 'center' },
  timelineDotActive: { backgroundColor: GOLD, borderColor: GOLD },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#333', minHeight: 30 },
  timelineContent: { flex: 1, paddingLeft: 14, paddingBottom: 24 },
  timelineDay: { fontSize: 14, fontWeight: '700', color: TEXT_MUTED, marginBottom: 4 },
  timelineDayActive: { color: GOLD },
  timelineDesc: { fontSize: 13, color: TEXT_MUTED, lineHeight: 19 },

  // Quote
  quoteSection: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24, paddingHorizontal: 10 },
  quoteLine: { flex: 1, height: 1, backgroundColor: GOLD_DARK + '40' },
  quoteText: { fontSize: 13, color: TEXT_GOLD, fontStyle: 'italic', textAlign: 'center', flex: 3 },

  // Restore
  restoreBtn: { alignItems: 'center', paddingVertical: 12 },
  restoreText: { fontSize: 13, color: TEXT_MUTED, textDecorationLine: 'underline' },

  // Already Pro
  proActiveContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  proActiveBadge: { width: 100, height: 100, borderRadius: 50, backgroundColor: BG_CARD, borderWidth: 2, borderColor: GOLD, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  proActiveTitle: { fontSize: 24, fontWeight: '800', color: GOLD, marginBottom: 10 },
  proActiveDesc: { fontSize: 15, color: TEXT_MUTED, textAlign: 'center', marginBottom: 30 },
  backBtn: { backgroundColor: GOLD, paddingHorizontal: 40, paddingVertical: 14, borderRadius: 12 },
  backBtnText: { fontSize: 15, fontWeight: '700', color: BG_DARK },
});
