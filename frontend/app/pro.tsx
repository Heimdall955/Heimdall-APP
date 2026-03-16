import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PurchasesPackage } from 'react-native-purchases';
import axios from 'axios';
import { useSubscription } from '../hooks/useSubscription';
import { Card, Button } from '../components/ui';
import { Spacing, BorderRadius, FontSizes } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { SecureStore } from '../utils/secureStore';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';


export default function ProScreen() {
  const router = useRouter();
  const { colors, shadows } = useTheme();
  const { t } = useLanguage();
  const proFeatures = [
    { icon: 'videocam', title: t('proFeatureVideo'), description: t('proFeatureVideoDesc'), color: colors.primary },
    { icon: 'document-text', title: t('proFeatureReports'), description: t('proFeatureReportsDesc'), color: colors.info },
    { icon: 'chatbubbles', title: t('proFeatureChat'), description: t('proFeatureChatDesc'), color: colors.accentEducation },
    { icon: 'analytics', title: t('proFeatureAnalytics'), description: t('proFeatureAnalyticsDesc'), color: colors.success },
    { icon: 'cloud-upload', title: t('proFeatureCloud'), description: t('proFeatureCloudDesc'), color: colors.accent },
    { icon: 'people', title: t('proFeaturePack'), description: t('proFeaturePackDesc'), color: colors.error },
  ];
  const { 
    packages, 
    loading, 
    purchasePackage, 
    restorePurchases, 
    isProUser,
    isSimulated 
  } = useSubscription();
  
  const [selectedPlan, setSelectedPlan] = useState<string>('annual');
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // If already PRO, show success screen
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  if (isProUser) {

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>{t('alreadyPro')}</Text>
          <Text style={styles.successText}>{t('enjoyPro')}</Text>
          <Button title={t('backToHome')} onPress={() => router.back()} style={styles.successButton} />
        </View>
      </SafeAreaView>
    );
  }

  const handleSubscribe = async () => {
    const selectedPackage = packages.find(
      pkg => (selectedPlan === 'annual' ? pkg.packageType === 'ANNUAL' : pkg.packageType === 'MONTHLY')
    );

    if (!selectedPackage) {
      Alert.alert('Error', 'No se encontró el plan seleccionado');
      return;
    }

    setPurchasing(true);
    try {
      const result = await purchasePackage(selectedPackage);
      
      if (result.success) {
        // Activate PRO on backend
        try {
          const token = await SecureStore.getItemAsync('session_token');
          await axios.post(`${BACKEND_URL}/api/subscription/activate`, { plan: selectedPlan }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (e) { console.log('Backend activation error:', e); }
        
        Alert.alert('¡Éxito!', result.message, [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Info', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al procesar la compra');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const result = await restorePurchases();
      
      if (result.hasActiveSubscription) {
        Alert.alert('¡Éxito!', 'Tu suscripción ha sido restaurada', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Info', 'No se encontraron compras anteriores para restaurar');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron restaurar las compras');
    } finally {
      setRestoring(false);
    }
  };

  const monthlyPackage = packages.find(pkg => pkg.packageType === 'MONTHLY');
  const annualPackage = packages.find(pkg => pkg.packageType === 'ANNUAL');


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Simulated Mode Banner */}
        {isSimulated && (
          <View style={styles.demoBanner}>
            <Ionicons name="information-circle" size={20} color={colors.accent} />
            <Text style={styles.demoBannerText}>Demo mode - Configure RevenueCat for real purchases</Text>
          </View>
        )}

        <View style={styles.hero}>
          <View style={styles.proBadge}><Ionicons name="diamond" size={32} color={colors.white} /></View>
          <Text style={styles.heroTitle}>{t('proTitle')}</Text>
          <Text style={styles.heroSubtitle}>{t('proSubtitle')}</Text>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>{t('allProIncludes')}</Text>
          
          <View style={styles.featuresGrid}>
            {proFeatures.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                  <Ionicons name={feature.icon as any} size={24} color={feature.color} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>{t('choosePlan')}</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>{t('loadingPlans')}</Text>
            </View>
          ) : (
            <View style={styles.plansRow}>
              <TouchableOpacity
                style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardSelected]}
                onPress={() => setSelectedPlan('monthly')}
              >
                <Text style={styles.planName}>{t('monthly')}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.planPrice}>
                    {monthlyPackage?.product.priceString || '4,90 €'}
                  </Text>
                  <Text style={styles.planPeriod}>/mes</Text>
                </View>
                
                <View style={[
                  styles.radioCircle,
                  selectedPlan === 'monthly' && styles.radioCircleSelected,
                ]}>
                  {selectedPlan === 'monthly' && (
                    <Ionicons name="checkmark" size={16} color={colors.white} />
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.planCard, selectedPlan === 'annual' && styles.planCardSelected, styles.planCardPopular]}
                onPress={() => setSelectedPlan('annual')}
              >
                <View style={styles.popularBadge}><Text style={styles.popularText}>{t('mostPopular')}</Text></View>
                <Text style={styles.planName}>{t('annual')}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.planPrice}>
                    {annualPackage?.product.priceString || '39,90 €'}
                  </Text>
                  <Text style={styles.planPeriod}>/año</Text>
                </View>
                
                <View style={styles.savingsBadge}><Text style={styles.savingsText}>{t('savingsPercent')}</Text></View>
                
                <View style={[
                  styles.radioCircle,
                  selectedPlan === 'annual' && styles.radioCircleSelected,
                ]}>
                  {selectedPlan === 'annual' && (
                    <Ionicons name="checkmark" size={16} color={colors.white} />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.ctaSection}>
          <Button
            title={purchasing ? t('processing') : t('activateProNow')}
            onPress={handleSubscribe} size="lg" style={styles.ctaButton}
            loading={purchasing} disabled={purchasing || loading}
          />
          <TouchableOpacity style={styles.restoreButton} onPress={handleRestore} disabled={restoring}>
            {restoring ? <ActivityIndicator size="small" color={colors.primary} /> : <Text style={styles.restoreButtonText}>{t('restorePurchases')}</Text>}
          </TouchableOpacity>
          <Text style={styles.termsText}>{t('cancelAnytime')} <Text style={styles.termsLink}>{t('termsOfService')}</Text></Text>
        </View>

        <View style={styles.guaranteeCard}>
          <Ionicons name="shield-checkmark" size={32} color={colors.success} />
          <View style={styles.guaranteeContent}>
            <Text style={styles.guaranteeTitle}>{t('guarantee7days')}</Text>
            <Text style={styles.guaranteeText}>{t('guaranteeDesc')}</Text>
          </View>
        </View>

        <View style={styles.paymentMethods}>
          <Text style={styles.paymentTitle}>{t('securePayment')}</Text>
          <View style={styles.paymentIcons}>
            <View style={styles.paymentIcon}>
              <Ionicons name="logo-google" size={24} color={colors.white} />
            </View>
            <Text style={styles.paymentText}>Google Play</Text>
          </View>
        </View>

        {/* Testimonials */}
        <View style={styles.testimonialSection}>
          <Text style={styles.testimonialTitle}>"Heimdall PRO has changed our routine!"</Text>
          <Text style={styles.testimonialAuthor}>-- Maria & Max, PRO users</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (C: any, S: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.backgroundDark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Spacing.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.accent + '20',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  demoBannerText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: C.accent,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  successIcon: {
    marginBottom: Spacing.lg,
  },
  successTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: C.white,
    marginBottom: Spacing.md,
  },
  successText: {
    fontSize: FontSizes.lg,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  successButton: {
    width: '100%',
  },
  hero: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  proBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  heroTitle: {
    fontSize: FontSizes.hero,
    fontWeight: '800',
    color: C.white,
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    fontSize: FontSizes.lg,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  featuresSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: C.white,
    marginBottom: Spacing.lg,
  },
  featuresGrid: {
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: C.white,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 20,
  },
  plansSection: {
    marginBottom: Spacing.xl,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    color: 'rgba(255,255,255,0.6)',
    fontSize: FontSizes.md,
  },
  plansRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  planCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  planCardSelected: {
    borderColor: C.primary,
  },
  planCardPopular: {
    backgroundColor: 'rgba(0,191,166,0.15)',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: C.primary,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderBottomLeftRadius: BorderRadius.sm,
  },
  popularText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: C.white,
  },
  planName: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: C.white,
    marginBottom: Spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: C.white,
  },
  planPeriod: {
    fontSize: FontSizes.md,
    color: 'rgba(255,255,255,0.6)',
    marginLeft: 4,
  },
  savingsBadge: {
    backgroundColor: C.accent,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  savingsText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: C.white,
  },
  radioCircle: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  ctaSection: {
    marginBottom: Spacing.xl,
  },
  ctaButton: {
    marginBottom: Spacing.md,
  },
  restoreButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  restoreButtonText: {
    color: C.primary,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  termsText: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  termsLink: {
    color: C.primary,
    textDecorationLine: 'underline',
  },
  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  guaranteeContent: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: C.white,
  },
  guaranteeText: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  paymentMethods: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  paymentTitle: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: Spacing.sm,
  },
  paymentIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentText: {
    fontSize: FontSizes.md,
    color: C.white,
    fontWeight: '500',
  },
  testimonialSection: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  testimonialTitle: {
    fontSize: FontSizes.lg,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  testimonialAuthor: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.5)',
  },
});
