/**
 * Design System Tokens
 * Swiss Style meets MyMind design philosophy
 */

// ============================================================================
// COLORS
// ============================================================================

export const COLORS = {
  // Primary palette - Dark emerald
  primary: '#064E3B',
  primaryLight: '#10B981',
  primaryMuted: '#047857',

  // Background
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Text hierarchy
  textPrimary: '#0F172A', // Slate 900 - Headlines
  textSecondary: '#475569', // Slate 600 - Body text
  textMuted: '#94A3B8', // Slate 400 - Labels, hints
  textInverse: '#FFFFFF', // On dark backgrounds

  // Accent for active/selected states
  accent: '#064E3B',
  accentBackground: '#ECFDF5', // Emerald 50

  // Mood filter pill colors
  mood: {
    lowEnergy: { bg: '#FEF3C7', text: '#92400E' }, // Amber
    comfort: { bg: '#FDE68A', text: '#78350F' }, // Warm amber
    healthy: { bg: '#D1FAE5', text: '#065F46' }, // Emerald
    quick: { bg: '#E0E7FF', text: '#3730A3' }, // Indigo
    family: { bg: '#FCE7F3', text: '#9D174D' }, // Pink
  },

  // UI states
  border: '#E2E8F0', // Slate 200
  borderLight: '#F1F5F9', // Slate 100
  shadow: 'rgba(0, 0, 0, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Semantic
  error: '#DC2626',
  success: '#10B981',
  warning: '#F59E0B',

  // Premium / MyMind palette
  premium: '#10B981',
  premiumDark: '#059669',
  gold: '#D97706',
  goldLight: '#FCD34D',

  // Glassmorphism
  glass: 'rgba(255, 255, 255, 0.6)',
  glassDark: 'rgba(0, 0, 0, 0.04)',
} as const;

// ============================================================================
// GRADIENTS
// ============================================================================

export const GRADIENTS = {
  primary: ['#064E3B', '#0F766E'] as const,
  premium: ['#10B981', '#06B6D4'] as const,
  premiumDark: ['#064E3B', '#059669'] as const,
  gold: ['#D97706', '#F59E0B'] as const,
  subtle: ['rgba(16, 185, 129, 0.08)', 'rgba(6, 182, 212, 0.04)'] as const,
  card: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)'] as const,
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const FONTS = {
  // Serif for display/headlines (Swiss Style influence)
  serifBold: 'PlayfairDisplay-Bold',
  serifRegular: 'PlayfairDisplay-Regular',

  // Sans-serif for body (system font for performance)
  sansRegular: 'System',
  sansMedium: 'System',
  sansBold: 'System',
} as const;

export const FONT_SIZES = {
  // Swiss Style - Bold typography hierarchy
  displayLarge: 40, // Main headline
  displayMedium: 32, // Section headers
  headingLarge: 24, // Card titles
  headingMedium: 20, // Subsections
  bodyLarge: 17, // Primary body
  bodyMedium: 15, // Secondary body
  bodySmall: 13, // Labels, captions
  caption: 11, // Smallest text
} as const;

export const LINE_HEIGHTS = {
  tight: 1.1, // Headlines
  normal: 1.4, // Body text
  relaxed: 1.6, // Long-form text
} as const;

// ============================================================================
// SPACING
// ============================================================================

export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;

// ============================================================================
// ANIMATION DURATIONS (for Reanimated)
// ============================================================================

export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  flip: 400,
} as const;
