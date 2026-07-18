import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { SecureStore } from '../utils/secureStore';

export type ThemeColors = {
  background: string;
  backgroundDark: string;
  cardBg: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  accentLight: string;
  accentOrange: string;
  accentPurple: string;
  accentMint: string;
  accentEducation: string;
  rewardBadge: string;
  cardHighlight: string;
  white: string;
  black: string;
  gray: string;
  grayLight: string;
  grayDark: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  text: string;
  textSecondary: string;
  textLight: string;
  textInverse: string;
  notificationBg: string;
  bannerBg: string;
  levelBadgeBg: string;
};

export type ThemeShadows = {
  sm: object;
  md: object;
  lg: object;
};

const LightColors: ThemeColors = {
  background: '#F6F4EE',
  backgroundDark: '#0C4A3E',
  cardBg: '#FFFFFF',
  primary: '#128C67',
  primaryDark: '#0C4A3E',
  primaryLight: '#E3F0EA',
  secondary: '#22332D',
  accent: '#B98A1D',
  accentLight: '#F8F1DD',
  accentOrange: '#E08A3C',
  accentPurple: '#8E6FD8',
  accentMint: '#2BAE94',
  accentEducation: '#4C6FBF',
  rewardBadge: '#EFD9A7',
  cardHighlight: '#EDF5F0',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#7A857F',
  grayLight: '#ECEAE3',
  grayDark: '#4A554F',
  success: '#2E9E5B',
  warning: '#D9A62E',
  error: '#D9534F',
  info: '#3B8EA5',
  text: '#1F2B26',
  textSecondary: '#6C7A73',
  textLight: '#A5AFA8',
  textInverse: '#FFFFFF',
  notificationBg: '#EFEDE6',
  bannerBg: '#F8F1DD',
  levelBadgeBg: '#ECEAE3',
};

const DarkColors: ThemeColors = {
  background: '#0B1F1A',
  backgroundDark: '#071511',
  cardBg: '#122A23',
  primary: '#2BB48A',
  primaryDark: '#0C4A3E',
  primaryLight: '#2BB48A20',
  secondary: '#C9D6CF',
  accent: '#D4AF37',
  accentLight: '#D4AF3718',
  accentOrange: '#F0A45E',
  accentPurple: '#A98FE8',
  accentMint: '#4FC9AE',
  accentEducation: '#7C97E0',
  rewardBadge: '#8A6F2E',
  cardHighlight: '#123328',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#8FA398',
  grayLight: '#1B352C',
  grayDark: '#C9D6CF',
  success: '#3FB950',
  warning: '#D9A62E',
  error: '#E76B67',
  info: '#58A6FF',
  text: '#EAF2EC',
  textSecondary: '#9BB0A5',
  textLight: '#5C7166',
  textInverse: '#0B1F1A',
  notificationBg: '#1B352C',
  bannerBg: '#241C06',
  levelBadgeBg: '#1B352C',
};

const LightShadows: ThemeShadows = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 4 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 6 },
};

const DarkShadows: ThemeShadows = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
};

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
  shadows: ThemeShadows;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync('app_theme');
        if (saved === 'dark') setIsDark(true);
      } catch (e) {}
    })();
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await SecureStore.setItemAsync('app_theme', next ? 'dark' : 'light');
  };

  const colors = useMemo(() => (isDark ? DarkColors : LightColors), [isDark]);
  const shadows = useMemo(() => (isDark ? DarkShadows : LightShadows), [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors, shadows }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
