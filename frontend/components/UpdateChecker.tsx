import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Linking, Platform, StyleSheet, Image } from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { BACKEND_URL } from '../config/backend';

export const UpdateChecker = () => {
  const [visible, setVisible] = useState(false);
  const [storeUrl, setStoreUrl] = useState('');

  useEffect(() => {
    if (Platform.OS !== 'android' || __DEV__) return;
    const installed = Constants.expoConfig?.android?.versionCode ?? 0;
    if (!installed) return;
    (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/app/version`);
        const data = await res.json();
        if (data.android_version_code && data.android_version_code > installed) {
          setStoreUrl(data.store_url || '');
          setVisible(true);
        }
      } catch (e) {}
    })();
  }, []);

  const openStore = () => {
    const pkg = Constants.expoConfig?.android?.package || 'app.emergent.hanigpsfixf4b1b81d';
    Linking.openURL(`market://details?id=${pkg}`).catch(() => {
      if (storeUrl) Linking.openURL(storeUrl);
    });
  };

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Image source={require('../assets/images/heimdall-logo-round.png')} style={{ width: 72, height: 72, marginBottom: 14 }} resizeMode="contain" />
          <Text style={styles.title}>¡Nueva versión disponible!</Text>
          <Text style={styles.subtitle}>Hay una actualización de Heimdall con mejoras y novedades. Actualiza para disfrutar de la mejor experiencia.</Text>
          <TouchableOpacity style={styles.updateBtn} onPress={openStore} testID="update-now-btn">
            <Ionicons name="download-outline" size={18} color="#FFF" />
            <Text style={styles.updateBtnText}>Actualizar ahora</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.laterBtn} onPress={() => setVisible(false)} testID="update-later-btn">
            <Text style={styles.laterBtnText}>Más tarde</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(10,20,16,0.6)', alignItems: 'center', justifyContent: 'center', padding: 28 },
  card: { width: '100%', maxWidth: 360, backgroundColor: '#FFFFFF', borderRadius: 28, padding: 26, alignItems: 'center' },
  title: { fontSize: 21, fontWeight: '700', color: '#1F2B26', textAlign: 'center', marginBottom: 8, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }) },
  subtitle: { fontSize: 14, color: '#6C7A73', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  updateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#128C67', borderRadius: 999, paddingVertical: 14, width: '100%' },
  updateBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  laterBtn: { paddingVertical: 12, marginTop: 4 },
  laterBtnText: { fontSize: 14, fontWeight: '600', color: '#7A857F' },
});
