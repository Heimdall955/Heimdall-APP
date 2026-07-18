import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Spacing, BorderRadius, FontSizes } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui';

export default function PrivacidadScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const s = useMemo(() => createStyles(colors), [colors]);

  const sections = [
    { icon: 'folder-open', color: '#4CAF50', title: t('dataCollection'), desc: t('dataCollectionDesc') },
    { icon: 'lock-closed', color: '#2196F3', title: t('dataStorage'), desc: t('dataStorageDesc') },
    { icon: 'people', color: '#FF9800', title: t('dataSharing'), desc: t('dataSharingDesc') },
    { icon: 'hardware-chip', color: '#9C27B0', title: t('aiDataUsage'), desc: t('aiDataUsageDesc') },
  ];

  const handleDeleteAccount = () => {
    Alert.alert(
      t('deleteAccount'),
      t('deleteAccountConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('deleteAccount'), style: 'destructive', onPress: () => Alert.alert('Info', 'Contacta soporte@heimdall-hani.app') },
      ]
    );
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} testID="privacy-back-btn">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.title}>{t('privacyTitle')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {sections.map((section, i) => (
          <Card key={i} variant="elevated" style={s.card}>
            <View style={s.cardHeader}>
              <View style={[s.iconCircle, { backgroundColor: section.color + '18' }]}>
                <Ionicons name={section.icon as any} size={22} color={section.color} />
              </View>
              <Text style={s.cardTitle}>{section.title}</Text>
            </View>
            <Text style={s.cardDesc}>{section.desc}</Text>
          </Card>
        ))}

        <View style={s.linksSection}>
          <TouchableOpacity style={s.linkRow} onPress={() => Linking.openURL('https://heimdall-ai.tech/politica-de-privacidad/')} testID="terms-link">
            <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            <Text style={s.linkText}>{t('termsOfService')}</Text>
            <Ionicons name="open-outline" size={16} color={colors.gray} />
          </TouchableOpacity>
          <TouchableOpacity style={s.linkRow} onPress={() => Linking.openURL('https://heimdall-ai.tech/politica-de-privacidad/')} testID="privacy-policy-link">
            <Ionicons name="shield-outline" size={20} color={colors.primary} />
            <Text style={s.linkText}>{t('privacyPolicy')}</Text>
            <Ionicons name="open-outline" size={16} color={colors.gray} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.deleteBtn} onPress={handleDeleteAccount} testID="delete-account-btn">
          <Ionicons name="trash-outline" size={20} color="#F44336" />
          <Text style={s.deleteBtnText}>{t('deleteAccount')}</Text>
        </TouchableOpacity>
        <Text style={s.deleteDesc}>{t('deleteAccountDesc')}</Text>

        <Text style={s.footer}>{t('lastUpdated')}: 16 Mar 2026</Text>
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
  card: { marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  iconCircle: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: FontSizes.md, fontWeight: '700', color: C.text, flex: 1 },
  cardDesc: { fontSize: FontSizes.sm, color: C.textSecondary, lineHeight: 22 },
  linksSection: { marginTop: Spacing.md, marginBottom: Spacing.lg, backgroundColor: C.white, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: C.grayLight },
  linkText: { flex: 1, fontSize: FontSizes.md, color: C.text, fontWeight: '500' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, marginTop: Spacing.md },
  deleteBtnText: { fontSize: FontSizes.md, color: '#F44336', fontWeight: '600' },
  deleteDesc: { fontSize: FontSizes.xs, color: C.textSecondary, textAlign: 'center', marginTop: Spacing.xs },
  footer: { fontSize: FontSizes.xs, color: C.textLight, textAlign: 'center', marginTop: Spacing.xl },
});
