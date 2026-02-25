import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FontSizes, BorderRadius } from '../../constants/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { colors, shadows } = useTheme();
  
  const bottomInset = Math.max(insets.bottom, 0);
  const tabBarHeight = 70 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          backgroundColor: colors.cardBg,
          borderTopWidth: 0,
          height: tabBarHeight,
          paddingBottom: bottomInset + 10,
          paddingTop: 10,
          paddingHorizontal: 5,
          ...shadows.lg as any,
        },
        tabBarLabelStyle: {
          fontSize: FontSizes.xs,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: -4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? [styles.activeIconBg, { backgroundColor: colors.primaryLight }] : undefined}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="salud"
        options={{
          title: t('health'),
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? [styles.activeIconBg, { backgroundColor: colors.primaryLight }] : undefined}>
              <Ionicons name={focused ? 'heart' : 'heart-outline'} size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="educacion"
        options={{
          title: t('education'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.centerTab, { backgroundColor: colors.grayLight, borderColor: colors.cardBg, ...shadows.md as any }, focused && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
              <Image 
                source={require('../../assets/images/heimdall-logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t('chat'),
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? [styles.activeIconBg, { backgroundColor: colors.primaryLight }] : undefined}>
              <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? [styles.activeIconBg, { backgroundColor: colors.primaryLight }] : undefined}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconBg: {
    borderRadius: BorderRadius.md,
    padding: 6,
  },
  centerTab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    borderWidth: 3,
  },
  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
