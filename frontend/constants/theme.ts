// Heimdall Theme Constants - Exact Visual Style from Design
export const Colors = {
  // Main backgrounds
  background: '#F8F9FA',
  backgroundDark: '#1A1F2E',
  cardBg: '#FFFFFF',
  
  // Primary colors - Teal/Mint
  primary: '#20C997',
  primaryDark: '#1BA87C',
  primaryLight: '#E8F8F4',
  
  // Secondary - Dark
  secondary: '#343A40',
  
  // Accent colors
  accent: '#D4A60B',       // Golden yellow for bones/rewards
  accentLight: '#FFF3CD',  // Light yellow/cream for badges
  accentOrange: '#E67E22', // Orange for highlights
  accentPurple: '#A060DD', // Purple for icons
  accentMint: '#85E1CA',   // Light mint for icons
  
  // Reward badge colors
  rewardBadge: '#FDBA74',  // Light orange for +XP badges
  
  // UI Colors
  white: '#FFFFFF',
  black: '#000000',
  gray: '#6C757D',
  grayLight: '#E9ECEF',
  grayDark: '#495057',
  
  // Status colors
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',
  
  // Text colors
  text: '#343A40',
  textSecondary: '#6C757D',
  textLight: '#ADB5BD',
  textInverse: '#FFFFFF',
  
  // Specific UI elements
  notificationBg: '#E9ECEF',
  bannerBg: '#FFF3CD',
  levelBadgeBg: '#E9ECEF',
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
