import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../constants/theme';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { SecureStore } from '../utils/secureStore';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface WalletCardProps {
  dogId: string;
  dogName: string;
  dogBreed?: string;
  dogAge?: number;
  dogWeight?: number;
  chipId?: string;
  dogPhoto?: string;
}

export const WalletCard: React.FC<WalletCardProps> = ({ 
  dogId, dogName, dogBreed, dogAge, dogWeight, chipId, dogPhoto 
}) => {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const formatAge = (months: number) => {
    const y = Math.floor(months / 12); const m = months % 12;
    if (y === 0) return `${m} ${language === 'en' ? 'months' : 'meses'}`;
    if (m === 0) return `${y} ${language === 'en' ? 'years' : 'años'}`;
    return `${y} ${language === 'en' ? 'y' : 'a'} ${m}m`;
  };

  const handleAddToWallet = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await SecureStore.getItemAsync('session_token');
      if (!token) { setError(language === 'en' ? 'Not authenticated' : 'No autenticado'); return; }

      const response = await axios.get(`${BACKEND_URL}/api/wallet/pass/${dogId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data?.save_url) {
        await Linking.openURL(response.data.save_url);
        setSuccess(true);
      } else {
        setError(language === 'en' ? 'Could not generate pass' : 'No se pudo generar el pase');
      }
    } catch (err: any) {
      console.error('Wallet error:', err?.response?.data || err.message);
      const detail = err.response?.data?.detail || '';
      setError(detail || (language === 'en' ? 'Error generating pass' : 'Error al generar pase'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.logoContainer}>
            <Image source={require('../assets/images/heimdall-logo.png')} style={styles.logo} resizeMode="cover" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.passportTitle}>HANI Passport</Text>
            <Text style={styles.passportSubtitle}>{t('digitalIdCard')}</Text>
          </View>
          <View style={styles.walletIcon}>
            <Ionicons name="wallet" size={24} color={Colors.white} />
          </View>
        </View>

        {/* Dog Info */}
        <View style={styles.dogPreview}>
          {dogPhoto ? (
            <Image source={{ uri: dogPhoto }} style={styles.dogPhoto} />
          ) : (
            <View style={[styles.dogPhoto, { backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="paw" size={24} color={Colors.white} />
            </View>
          )}
          <View style={styles.dogInfo}>
            <Text style={styles.dogName}>{dogName}</Text>
            {dogBreed && <Text style={styles.dogBreed}>{dogBreed}</Text>}
          </View>
        </View>

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{language === 'en' ? 'AGE' : 'EDAD'}</Text>
            <Text style={styles.detailValue}>{dogAge ? formatAge(dogAge) : '--'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{language === 'en' ? 'WEIGHT' : 'PESO'}</Text>
            <Text style={styles.detailValue}>{dogWeight ? `${dogWeight} kg` : '--'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>CHIP</Text>
            <Text style={styles.detailValue} numberOfLines={1}>{chipId || '--'}</Text>
          </View>
        </View>

        {/* QR */}
        <View style={styles.qrSection}>
          <View style={styles.qrPlaceholder}>
            <Ionicons name="qr-code" size={36} color={Colors.white} />
          </View>
          <Text style={styles.qrText}>ID: HANI-{dogId.substring(0, 8).toUpperCase()}</Text>
        </View>

        {/* Add to Wallet Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddToWallet} disabled={loading} data-testid="add-to-wallet-btn">
          {loading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : success ? (
            <>
              <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
              <Text style={styles.addButtonText}>{language === 'en' ? 'Added!' : '¡Añadido!'}</Text>
            </>
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color={Colors.text} />
              <Text style={styles.addButtonText}>{t('addToGoogleWallet')}</Text>
            </>
          )}
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
      <Text style={styles.infoText}>{t('walletCardDescription')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: Spacing.md },
  card: { backgroundColor: '#1B4D3E', borderRadius: BorderRadius.lg, padding: Spacing.md, ...Shadows.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  logoContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  logo: { width: 40, height: 40 },
  headerText: { flex: 1, marginLeft: Spacing.sm },
  passportTitle: { fontSize: FontSizes.lg, fontWeight: 'bold', color: Colors.white },
  passportSubtitle: { fontSize: FontSizes.xs, color: 'rgba(255,255,255,0.7)' },
  walletIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  dogPreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: BorderRadius.md, padding: Spacing.sm, marginBottom: Spacing.md },
  dogPhoto: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: Colors.white },
  dogInfo: { marginLeft: Spacing.sm, flex: 1 },
  dogName: { fontSize: FontSizes.lg, fontWeight: 'bold', color: Colors.white },
  dogBreed: { fontSize: FontSizes.sm, color: 'rgba(255,255,255,0.7)' },
  detailsGrid: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.md, paddingVertical: Spacing.sm, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  detailItem: { alignItems: 'center', flex: 1 },
  detailLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
  detailValue: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '600' },
  qrSection: { alignItems: 'center', marginBottom: Spacing.md },
  qrPlaceholder: { width: 56, height: 56, borderRadius: BorderRadius.sm, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xs },
  qrText: { fontSize: FontSizes.xs, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white, borderRadius: BorderRadius.full, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  addButtonText: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.text },
  errorText: { color: '#ff6b6b', fontSize: FontSizes.sm, textAlign: 'center', marginTop: Spacing.sm },
  infoText: { fontSize: FontSizes.xs, color: Colors.gray, textAlign: 'center', marginTop: Spacing.sm, paddingHorizontal: Spacing.md },
});

export default WalletCard;
