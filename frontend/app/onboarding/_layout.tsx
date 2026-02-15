import React from 'react';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="idioma" />
      <Stack.Screen name="registro" />
      <Stack.Screen name="perro" />
      <Stack.Screen name="confirmacion" />
    </Stack>
  );
}
