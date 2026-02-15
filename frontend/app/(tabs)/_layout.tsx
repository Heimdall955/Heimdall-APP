import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../contexts/LanguageContext';
import { Colors, FontSizes, Shadows, BorderRadius } from '../../constants/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  
  // Calculate proper bottom padding based on device safe area
  const bottomInset = Math.max(insets.bottom, 0);
  const tabBarHeight = 70 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 0,
          height: tabBarHeight,
          paddingBottom: bottomInset + 10,
          paddingTop: 10,
          paddingHorizontal: 5,
          ...Shadows.lg,
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
            <View style={focused ? styles.activeIconBg : undefined}>
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
            <View style={focused ? styles.activeIconBg : undefined}>
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
            <View style={[styles.centerTab, focused && styles.centerTabActive]}>
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
            <View style={focused ? styles.activeIconBg : undefined}>
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
            <View style={focused ? styles.activeIconBg : undefined}>
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
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    padding: 6,
  },
  centerTab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    borderWidth: 3,
    borderColor: Colors.white,
    ...Shadows.md,
  },
  centerTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
