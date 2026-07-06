import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Linking, ActivityIndicator, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Spacing, BorderRadius, FontSizes } from '../constants/theme';
import axios from 'axios';
import { SecureStore } from '../utils/secureStore';

import { BACKEND_URL } from '../config/backend';

interface WalletCardProps {
  dogId: string; dogName: string; dogBreed?: string; dogAge?: number;
  dogWeight?: number; chipId?: string; dogPhoto?: string;
}

export const WalletCard: React.FC<WalletCardProps> = ({ dogId, dogName, dogBreed, dogAge, dogWeight, chipId, dogPhoto }) => {
  const { t, language } = useLanguage();
  const { colors, shadows } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const formatAge = (months: number) => {
    const y = Math.floor(months / 12); const m = months % 12;
    if (y === 0) return `${m} ${language === 'en' ? 'months' : language === 'it' ? 'mesi' : 'meses'}`;
    if (m === 0) return `${y} ${language === 'en' ? 'years' : language === 'it' ? 'anni' : 'anos'}`;
    return `${y} ${language === 'en' ? 'y' : 'a'} ${m}m`;
  };

  const handleAddToWallet = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Google Wallet',
        language === 'en' ? 'Google Wallet passes can only be added from an Android device with Google Wallet installed. Try from your phone!'
        : language === 'it' ? 'I pass di Google Wallet possono essere aggiunti solo da un dispositivo Android con Google Wallet installato. Prova dal tuo telefono!'
        : 'Los pases de Google Wallet solo se pueden añadir desde un dispositivo Android con Google Wallet instalado. Prueba desde tu movil!'
      );
      return;
    }

    setLoading(true); setError(null);
    try {
      const token = await SecureStore.getItemAsync('session_token');
      if (!token) {
        setError(language === 'en' ? 'Not authenticated' : 'No autenticado');
        setLoading(false);
        return;
      }
      const response = await axios.get(`${BACKEND_URL}/api/wallet/pass/${dogId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.save_url) {
        const canOpen = await Linking.canOpenURL(response.data.save_url);
        if (canOpen) {
          await Linking.openURL(response.data.save_url);
          setSuccess(true);
        } else {
          // Fallback: try opening with intent on Android
          try {
            await Linking.openURL(response.data.save_url);
            setSuccess(true);
          } catch {
            setError(
              language === 'en' ? 'Install Google Wallet to add this pass'
              : language === 'it' ? 'Installa Google Wallet per aggiungere questo pass'
              : 'Instala Google Wallet para anadir este pase'
            );
          }
        }
      } else {
        setError(language === 'en' ? 'Could not generate pass' : 'No se pudo generar el pase');
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail || '';
      if (detail.includes('credentials') || detail.includes('private_key')) {
        setError(language === 'en' ? 'Wallet service temporarily unavailable' : 'Servicio de Wallet temporalmente no disponible');
      } else {
        setError(detail || (language === 'en' ? 'Error generating pass' : 'Error al generar pase'));
      }
    } finally { setLoading(false); }
  };

  return (
    <View style={{ marginVertical: Spacing.md }}>
      <View style={{ backgroundColor: '#1B4D3E', borderRadius: BorderRadius.lg, padding: Spacing.md, ...shadows.md as any }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
            <Image source={require('../assets/images/heimdall-logo.png')} style={{ width: 40, height: 40 }} resizeMode="cover" />
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <Text style={{ fontSize: FontSizes.lg, fontWeight: 'bold', color: '#FFF' }}>HANI Passport</Text>
            <Text style={{ fontSize: FontSizes.xs, color: 'rgba(255,255,255,0.7)' }}>{t('digitalIdCard')}</Text>
          </View>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="wallet" size={24} color="#FFF" />
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: BorderRadius.md, padding: Spacing.sm, marginBottom: Spacing.md }}>
          {dogPhoto ? <Image source={{ uri: dogPhoto }} style={{ width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#FFF' }} /> : (
            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' }}><Ionicons name="paw" size={24} color="#FFF" /></View>
          )}
          <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
            <Text style={{ fontSize: FontSizes.lg, fontWeight: 'bold', color: '#FFF' }}>{dogName}</Text>
            {dogBreed && <Text style={{ fontSize: FontSizes.sm, color: 'rgba(255,255,255,0.7)' }}>{dogBreed}</Text>}
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.md, paddingVertical: Spacing.sm, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}>
          {[{ label: language === 'en' ? 'AGE' : language === 'it' ? 'ETA' : 'EDAD', value: dogAge ? formatAge(dogAge) : '--' },
            { label: language === 'en' ? 'WEIGHT' : language === 'it' ? 'PESO' : 'PESO', value: dogWeight ? `${dogWeight} kg` : '--' },
            { label: 'CHIP', value: chipId || '--' }].map((d, i) => (
            <View key={i} style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '700', letterSpacing: 1, marginBottom: 2 }}>{d.label}</Text>
              <Text style={{ fontSize: FontSizes.sm, color: '#FFF', fontWeight: '600' }} numberOfLines={1}>{d.value}</Text>
            </View>
          ))}
        </View>
        <View style={{ alignItems: 'center', marginBottom: Spacing.md }}>
          <View style={{ width: 56, height: 56, borderRadius: BorderRadius.sm, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xs }}>
            <Ionicons name="qr-code" size={36} color="#FFF" />
          </View>
          <Text style={{ fontSize: FontSizes.xs, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>ID: HANI-{dogId.substring(0, 8).toUpperCase()}</Text>
        </View>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', borderRadius: 50, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, gap: Spacing.sm }}
          onPress={handleAddToWallet} disabled={loading} data-testid="add-to-wallet-btn"
        >
          {loading ? <ActivityIndicator color={colors.primary} /> : success ? (
            <><Ionicons name="checkmark-circle" size={22} color={colors.primary} /><Text style={{ fontSize: FontSizes.md, fontWeight: '600', color: colors.text }}>{language === 'en' ? 'Added!' : language === 'it' ? 'Aggiunto!' : 'Anadido!'}</Text></>
          ) : (
            <><Ionicons name="logo-google" size={20} color="#333" /><Text style={{ fontSize: FontSizes.md, fontWeight: '600', color: '#333' }}>{t('addToGoogleWallet')}</Text></>
          )}
        </TouchableOpacity>
        {error && <Text style={{ color: '#ff6b6b', fontSize: FontSizes.sm, textAlign: 'center', marginTop: Spacing.sm }}>{error}</Text>}
      </View>
      <Text style={{ fontSize: FontSizes.xs, color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, paddingHorizontal: Spacing.md }}>{t('walletCardDescription')}</Text>
    </View>
  );
};

export default WalletCard;
