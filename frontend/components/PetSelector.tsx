import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SecureStore } from '../utils/secureStore';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { FontSizes, Spacing } from '../constants/theme';

export const PetSelector = ({ compact = false }: { compact?: boolean }) => {
  const router = useRouter();
  const { dogs, currentDog, selectDog } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [photos, setPhotos] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const map: Record<string, string> = {};
      for (const dog of dogs) {
        try {
          const img = await SecureStore.getItemAsync(`dog_image_${dog.id}`);
          if (img) map[dog.id] = img;
        } catch (e) {}
      }
      setPhotos(map);
    })();
  }, [dogs]);

  if (!dogs || dogs.length === 0) return null;

  const avatarSize = compact ? 26 : 30;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm, paddingRight: Spacing.md }} testID="pet-selector">
      {dogs.map((dog: any) => {
        const isActive = currentDog?.id === dog.id;
        const photo = photos[dog.id];
        return (
          <TouchableOpacity
            key={dog.id}
            onPress={() => selectDog(dog)}
            testID={`pet-chip-${dog.id}`}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 8,
              paddingVertical: compact ? 6 : 8, paddingHorizontal: compact ? 10 : 14,
              borderRadius: 999, backgroundColor: isActive ? colors.primary : colors.cardBg,
              borderWidth: 1.5, borderColor: isActive ? colors.primary : colors.grayLight,
            }}
          >
            {photo ? (
              <Image source={{ uri: photo }} style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }} />
            ) : (
              <View style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2, backgroundColor: isActive ? '#FFFFFF30' : colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="paw" size={avatarSize * 0.5} color={isActive ? '#FFF' : colors.primary} />
              </View>
            )}
            <Text style={{ fontSize: compact ? FontSizes.sm : FontSizes.md, fontWeight: '700', color: isActive ? '#FFF' : colors.text }}>{dog.name}</Text>
            {isActive && <Ionicons name="checkmark-circle" size={15} color="#FFF" />}
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity
        onPress={() => router.push('/agregar-mascota')}
        testID="add-pet-btn"
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 6,
          paddingVertical: compact ? 6 : 8, paddingHorizontal: compact ? 10 : 14,
          borderRadius: 999, backgroundColor: colors.accentLight,
          borderWidth: 1.5, borderColor: colors.accent + '50', borderStyle: 'dashed',
        }}
      >
        <Ionicons name="add-circle" size={compact ? 18 : 22} color={colors.accent} />
        <Text style={{ fontSize: compact ? FontSizes.sm : FontSizes.md, fontWeight: '700', color: colors.accent }}>{t('addPet')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
