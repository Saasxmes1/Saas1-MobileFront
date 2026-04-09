// ============================================================
// THEME — Bento Box Dark-first design system
// ============================================================

export const Colors = {
  // Brand palette — deep violet / indigo / electric purple
  brand: {
    primary: '#7C3AED',    // Violet-600
    primaryLight: '#A78BFA', // Violet-400
    primaryDark: '#5B21B6',  // Violet-800
    accent: '#10B981',       // Emerald-500 (success / pet happy)
    accentLight: '#34D399',
    danger: '#EF4444',       // Red-500
    warning: '#F59E0B',      // Amber-500
  },

  // Dark background layers (Bento Box)
  dark: {
    bg: '#0F0F14',          // Almost black
    surface: '#18181F',     // Card surface
    surfaceHigh: '#21212B', // Elevated card
    surfaceBorder: '#2E2E3C',
    overlay: 'rgba(15,15,20,0.85)',
  },

  // Text
  text: {
    primary: '#F4F4F8',
    secondary: '#9CA3AF',
    muted: '#6B7280',
    inverse: '#0F0F14',
  },

  // Semantic
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Gradients (as arrays for LinearGradient)
  gradients: {
    magic: ['#7C3AED', '#A855F7', '#EC4899'] as const,
    card: ['#18181F', '#21212B'] as const,
    pet: ['#5B21B6', '#7C3AED'] as const,
  },

  // Glass effect
  glass: 'rgba(124, 58, 237, 0.12)',
  glassBorder: 'rgba(124, 58, 237, 0.3)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const Radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const Shadows = {
  card: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  input: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  pet: {
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
};

export const Typography = {
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Animation = {
  fast: 150,
  normal: 300,
  slow: 500,
  spring: {
    damping: 18,
    stiffness: 200,
    mass: 0.8,
  },
};
