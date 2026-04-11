// ============================================================
// THEME — Bento Box Dark-first design system
// ============================================================

export const Colors = {
  brand: {
    primary: '#007AFF',    // Apple Blue
    primaryLight: '#47A1FF', 
    primaryDark: '#005CC8',
    accent: '#34C759',       // Apple Green (Success)
    accentLight: '#30D158',
    danger: '#FF3B30',       // Apple Red
    warning: '#FF9500',      // Apple Orange
  },

  // Dark background layers (True Black)
  dark: {
    bg: '#000000',          // True black
    surface: '#121212',     // Barely gray
    surfaceHigh: '#1C1C1E', // Apple standard dark elevated
    surfaceBorder: '#282828', // Subtle border
    overlay: 'rgba(0,0,0,0.85)',
  },

  text: {
    primary: '#FFFFFF',
    secondary: '#A1A1A1',   // Subtitles
    muted: '#636366',       // Apple System Gray 3
    inverse: '#000000',
  },

  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  info: '#007AFF',

  // Gradients fallback to flat colors to avoid neon
  gradients: {
    magic: ['#121212', '#121212'] as const,
    card: ['#121212', '#121212'] as const,
    pet: ['#000000', '#000000'] as const,
  },

  glass: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
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
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  full: 9999,
};

export const Shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  pet: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
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
