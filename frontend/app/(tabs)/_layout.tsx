import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSizes, Shadows } from '../../constants/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  
  // Calculate proper bottom padding based on device safe area
  // This ensures the tab bar sits above the system navigation controls
  const bottomInset = Math.max(insets.bottom, 0);
  const tabBarHeight = 65 + bottomInset;

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
          paddingBottom: bottomInset + 8,
          paddingTop: 8,
          paddingHorizontal: 10,
          ...Shadows.lg,
        },
        tabBarLabelStyle: {
          fontSize: FontSizes.xs,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
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
          title: 'Salud',
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
          title: 'Educación',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.centerTab, focused && styles.centerTabActive]}>
              <Ionicons name="school" size={26} color={focused ? Colors.white : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
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
          title: 'Perfil',
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
    borderRadius: 12,
    padding: 6,
  },
  centerTab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  centerTabActive: {
    backgroundColor: Colors.primary,
  },
});
