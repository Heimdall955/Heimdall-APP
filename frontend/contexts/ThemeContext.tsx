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
  background: '#F8F9FA',
  backgroundDark: '#1A1F2E',
  cardBg: '#FFFFFF',
  primary: '#20C997',
  primaryDark: '#1BA87C',
  primaryLight: '#E8F8F4',
  secondary: '#343A40',
  accent: '#D4A60B',
  accentLight: '#FFF3CD',
  accentOrange: '#E67E22',
  accentPurple: '#A060DD',
  accentMint: '#85E1CA',
  accentEducation: '#6366F1',
  rewardBadge: '#FDBA74',
  cardHighlight: '#F0FDF4',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#6C757D',
  grayLight: '#E9ECEF',
  grayDark: '#495057',
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',
  text: '#343A40',
  textSecondary: '#6C757D',
  textLight: '#ADB5BD',
  textInverse: '#FFFFFF',
  notificationBg: '#E9ECEF',
  bannerBg: '#FFF3CD',
  levelBadgeBg: '#E9ECEF',
};

const DarkColors: ThemeColors = {
  background: '#0D1117',
  backgroundDark: '#080C11',
  cardBg: '#161B22',
  primary: '#20C997',
  primaryDark: '#1BA87C',
  primaryLight: '#20C99718',
  secondary: '#C9D1D9',
  accent: '#E5B80B',
  accentLight: '#E5B80B18',
  accentOrange: '#F0923E',
  accentPurple: '#B07DE8',
  accentMint: '#85E1CA',
  accentEducation: '#818CF8',
  rewardBadge: '#FDBA74',
  cardHighlight: '#0D2818',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#8B949E',
  grayLight: '#21262D',
  grayDark: '#C9D1D9',
  success: '#3FB950',
  warning: '#D29922',
  error: '#F85149',
  info: '#58A6FF',
  text: '#E6EDF3',
  textSecondary: '#8B949E',
  textLight: '#484F58',
  textInverse: '#0D1117',
  notificationBg: '#21262D',
  bannerBg: '#1C1507',
  levelBadgeBg: '#21262D',
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
