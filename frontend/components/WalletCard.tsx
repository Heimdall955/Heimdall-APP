import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../../constants/theme';
import { useLanguage } from '../../contexts/LanguageContext';
import axios from 'axios';
import { SecureStore } from '../../utils/secureStore';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || '/api';

interface WalletCardProps {
  dogId: string;
  dogName: string;
  dogBreed?: string;
  dogPhoto?: string;
}

export const WalletCard: React.FC<WalletCardProps> = ({ 
  dogId, 
  dogName, 
  dogBreed,
  dogPhoto 
}) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddToWallet = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await SecureStore.getItemAsync('session_token');
      
      if (!token) {
        setError('No autenticado');
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/wallet/pass/${dogId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data?.save_url) {
        // Open Google Wallet save URL
        await Linking.openURL(response.data.save_url);
      } else {
        setError('No se pudo generar el pase');
      }
    } catch (err: any) {
      console.error('Wallet error:', err);
      setError(err.response?.data?.detail || 'Error al generar pase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/heimdall-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.passportTitle}>HANI Passport</Text>
            <Text style={styles.passportSubtitle}>{t('digitalIdCard')}</Text>
          </View>
          <View style={styles.walletIcon}>
            <Ionicons name="wallet" size={24} color={Colors.white} />
          </View>
        </View>

        {/* Dog Info Preview */}
        <View style={styles.dogPreview}>
          <Image 
            source={{ uri: dogPhoto || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200' }}
            style={styles.dogPhoto}
          />
          <View style={styles.dogInfo}>
            <Text style={styles.dogName}>{dogName}</Text>
            {dogBreed && <Text style={styles.dogBreed}>{dogBreed}</Text>}
          </View>
        </View>

        {/* QR Code Preview */}
        <View style={styles.qrSection}>
          <View style={styles.qrPlaceholder}>
            <Ionicons name="qr-code" size={40} color={Colors.white} />
          </View>
          <Text style={styles.qrText}>ID: HANI-{dogId.substring(0, 8).toUpperCase()}</Text>
        </View>

        {/* Add to Wallet Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddToWallet}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <>
              <Image 
                source={{ uri: 'https://www.gstatic.com/instantbuy/svg/dark_gpay.svg' }}
                style={styles.gPayIcon}
                resizeMode="contain"
              />
              <Text style={styles.addButtonText}>{t('addToGoogleWallet')}</Text>
            </>
          )}
        </TouchableOpacity>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>

      {/* Info Text */}
      <Text style={styles.infoText}>
        {t('walletCardDescription')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  card: {
    backgroundColor: '#1B4D3E',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 30,
    height: 30,
  },
  headerText: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  passportTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.white,
  },
  passportSubtitle: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  walletIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dogPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dogPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  dogInfo: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  dogName: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.white,
  },
  dogBreed: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  qrPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  qrText: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'monospace',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  gPayIcon: {
    width: 24,
    height: 24,
  },
  addButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: FontSizes.sm,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  infoText: {
    fontSize: FontSizes.xs,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
});

export default WalletCard;
