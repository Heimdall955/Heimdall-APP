import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card, Button } from '../components/ui';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../constants/theme';

const proFeatures = [
  {
    icon: 'videocam',
    title: 'Análisis de Video IA',
    description: 'Sube videos de tu perro y recibe análisis de comportamiento',
    color: Colors.primary,
  },
  {
    icon: 'document-text',
    title: 'Informes Veterinarios',
    description: 'Genera informes completos para compartir con tu veterinario',
    color: Colors.info,
  },
  {
    icon: 'chatbubbles',
    title: 'Chat Ilimitado con Hani',
    description: 'Sin límite de mensajes con tu asistente IA',
    color: Colors.accentEducation,
  },
  {
    icon: 'analytics',
    title: 'Análisis Avanzado',
    description: 'Gráficos detallados de salud y comportamiento',
    color: Colors.success,
  },
  {
    icon: 'cloud-upload',
    title: 'Backup en la Nube',
    description: 'Todos tus datos seguros y sincronizados',
    color: Colors.accent,
  },
  {
    icon: 'people',
    title: 'Manada Familiar',
    description: 'Invita hasta 5 miembros a gestionar tu perro',
    color: Colors.error,
  },
];

const plans = [
  {
    id: 'monthly',
    name: 'Mensual',
    price: '1,99€',
    period: '/mes',
    popular: false,
  },
  {
    id: 'yearly',
    name: 'Anual',
    price: '14,99€',
    period: '/año',
    savings: 'Ahorra 40%',
    popular: true,
  },
];

export default function ProScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('yearly');

  const handleSubscribe = () => {
    Alert.alert(
      'Próximamente',
      'El sistema de suscripciones estará disponible pronto. \n\n¡Gracias por tu interés en Heimdall PRO!',
      [{ text: 'Entendido' }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.proBadge}>
            <Ionicons name="diamond" size={24} color={Colors.white} />
          </View>
          <Text style={styles.heroTitle}>Heimdall PRO</Text>
          <Text style={styles.heroSubtitle}>Desbloquea todo el potencial de Heimdall</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Todo lo que incluye PRO</Text>
          
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

        {/* Plans */}
        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Elige tu plan</Text>
          
          <View style={styles.plansRow}>
            {plans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  selectedPlan === plan.id && styles.planCardSelected,
                  plan.popular && styles.planCardPopular,
                ]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>MÁS POPULAR</Text>
                  </View>
                )}
                
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                </View>
                
                {plan.savings && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>{plan.savings}</Text>
                  </View>
                )}
                
                <View style={[
                  styles.radioCircle,
                  selectedPlan === plan.id && styles.radioCircleSelected,
                ]}>
                  {selectedPlan === plan.id && (
                    <Ionicons name="checkmark" size={16} color={Colors.white} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Button
            title="Activar PRO Ahora"
            onPress={handleSubscribe}
            size="lg"
            style={styles.ctaButton}
          />
          
          <Text style={styles.termsText}>
            Cancela cuando quieras. Al suscribirte aceptas los{' '}
            <Text style={styles.termsLink}>Términos de servicio</Text>
          </Text>
        </View>

        {/* Guarantee */}
        <Card style={styles.guaranteeCard}>
          <Ionicons name="shield-checkmark" size={32} color={Colors.success} />
          <View style={styles.guaranteeContent}>
            <Text style={styles.guaranteeTitle}>Garantía de 7 días</Text>
            <Text style={styles.guaranteeText}>
              Si no estás satisfecho, te devolvemos el dinero sin preguntas.
            </Text>
          </View>
        </Card>

        {/* Testimonials */}
        <View style={styles.testimonialSection}>
          <Text style={styles.testimonialTitle}>"¡Heimdall PRO ha cambiado nuestra rutina!"</Text>
          <Text style={styles.testimonialAuthor}>— María y Max, usuarios PRO</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
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
  hero: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  proBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  heroTitle: {
    fontSize: FontSizes.hero,
    fontWeight: '800',
    color: Colors.white,
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
    color: Colors.white,
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
    color: Colors.white,
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
    borderColor: Colors.primary,
  },
  planCardPopular: {
    backgroundColor: 'rgba(0,191,166,0.15)',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.primary,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderBottomLeftRadius: BorderRadius.sm,
  },
  popularText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.white,
  },
  planName: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: Colors.white,
  },
  planPeriod: {
    fontSize: FontSizes.md,
    color: 'rgba(255,255,255,0.6)',
    marginLeft: 4,
  },
  savingsBadge: {
    backgroundColor: Colors.accent,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  savingsText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.white,
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
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  ctaSection: {
    marginBottom: Spacing.xl,
  },
  ctaButton: {
    marginBottom: Spacing.md,
  },
  termsText: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  termsLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: Spacing.xl,
  },
  guaranteeContent: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.white,
  },
  guaranteeText: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.6)',
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
