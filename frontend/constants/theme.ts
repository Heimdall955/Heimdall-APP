// Heimdall Theme Constants - Emerald & Gold branding
import { Platform } from 'react-native';

export const Fonts = {
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: "Georgia, 'Times New Roman', serif" }),
};

export const Colors = {
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

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  title: 28,
  hero: 36,
  stat: 42,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
};

// Component specific styles
export const CardStyles = {
  default: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  elevated: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.md,
  },
};

export const BadgeStyles = {
  level: {
    backgroundColor: Colors.levelBadgeBg,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  reward: {
    backgroundColor: Colors.rewardBadge,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  accent: {
    backgroundColor: Colors.accentLight,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
};
