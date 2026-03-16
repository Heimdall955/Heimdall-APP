import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Spacing, BorderRadius, FontSizes } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui';

export default function AyudaScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [expanded, setExpanded] = useState<number | null>(null);

  const faqs = [
    { q: t('faqTraining'), a: t('faqTrainingAnswer'), icon: 'barbell' },
    { q: t('faqPro'), a: t('faqProAnswer'), icon: 'diamond' },
    { q: t('faqBluetooth'), a: t('faqBluetoothAnswer'), icon: 'bluetooth' },
    { q: t('faqData'), a: t('faqDataAnswer'), icon: 'shield-checkmark' },
  ];

  const actions = [
    { icon: 'mail', color: '#2196F3', label: t('contactSupport'), desc: t('contactEmail'), onPress: () => Linking.openURL('mailto:soporte@heimdall-hani.app') },
    { icon: 'bug', color: '#FF9800', label: t('reportBug'), desc: t('contactEmail'), onPress: () => Linking.openURL('mailto:soporte@heimdall-hani.app?subject=Bug%20Report') },
    { icon: 'star', color: '#4CAF50', label: t('rateApp'), desc: t('rateAppDesc'), onPress: () => Linking.openURL('https://play.google.com/store/apps/details?id=com.heimdall.hani') },
  ];

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} data-testid="help-back-btn">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.title}>{t('helpTitle')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* FAQ */}
        <Text style={s.sectionTitle}>{t('faq')}</Text>
        <Card variant="elevated" style={s.faqCard}>
          {faqs.map((faq, i) => (
            <TouchableOpacity
              key={i}
              style={[s.faqItem, i < faqs.length - 1 && s.faqBorder]}
              onPress={() => setExpanded(expanded === i ? null : i)}
              data-testid={`faq-item-${i}`}
            >
              <View style={s.faqHeader}>
                <Ionicons name={faq.icon as any} size={20} color={colors.primary} />
                <Text style={s.faqQuestion}>{faq.q}</Text>
                <Ionicons name={expanded === i ? 'chevron-up' : 'chevron-down'} size={20} color={colors.gray} />
              </View>
              {expanded === i && <Text style={s.faqAnswer}>{faq.a}</Text>}
            </TouchableOpacity>
          ))}
        </Card>

        {/* Actions */}
        <Text style={[s.sectionTitle, { marginTop: Spacing.lg }]}>{t('contactSupport')}</Text>
        {actions.map((action, i) => (
          <TouchableOpacity key={i} onPress={action.onPress} data-testid={`help-action-${i}`}>
            <Card variant="elevated" style={s.actionCard}>
              <View style={[s.actionIcon, { backgroundColor: action.color + '18' }]}>
                <Ionicons name={action.icon as any} size={22} color={action.color} />
              </View>
              <View style={s.actionContent}>
                <Text style={s.actionLabel}>{action.label}</Text>
                <Text style={s.actionDesc}>{action.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray} />
            </Card>
          </TouchableOpacity>
        ))}

        {/* Version */}
        <View style={s.versionBox}>
          <Ionicons name="paw" size={32} color={colors.primary} />
          <Text style={s.versionTitle}>Heimdall</Text>
          <Text style={s.versionText}>{t('appVersion')}: 1.0.0</Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (C: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.grayLight, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSizes.xl, fontWeight: '700', color: C.text },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: C.text, marginBottom: Spacing.sm },
  faqCard: { marginBottom: Spacing.md },
  faqItem: { paddingVertical: Spacing.md },
  faqBorder: { borderBottomWidth: 1, borderBottomColor: C.grayLight },
  faqHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  faqQuestion: { flex: 1, fontSize: FontSizes.md, fontWeight: '600', color: C.text },
  faqAnswer: { fontSize: FontSizes.sm, color: C.textSecondary, lineHeight: 22, marginTop: Spacing.sm, paddingLeft: 28 },
  actionCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionContent: { flex: 1 },
  actionLabel: { fontSize: FontSizes.md, fontWeight: '600', color: C.text },
  actionDesc: { fontSize: FontSizes.xs, color: C.textSecondary, marginTop: 2 },
  versionBox: { alignItems: 'center', paddingVertical: Spacing.xl, marginTop: Spacing.lg },
  versionTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: C.text, marginTop: Spacing.sm },
  versionText: { fontSize: FontSizes.sm, color: C.textSecondary, marginTop: Spacing.xs },
});
