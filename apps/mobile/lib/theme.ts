/**
 * Design System Tokens
 * Alma-inspired warm, organic design philosophy
 */

// ============================================================================
// COLORS
// ============================================================================

export const COLORS = {
  // Primary palette - Deep olive green (Alma-inspired)
  primary: '#3D4A2A',
  primaryLight: '#7CB342',
  primaryMuted: '#4A5A33',

  // Background - Warm parchment (never pure white)
  background: '#F5F0E8',
  surface: '#FAF7F2',
  surfaceElevated: '#FFFFFF',

  // Text hierarchy - Warm undertones
  textPrimary: '#2C2C2C', // Warm near-black
  textSecondary: '#6B6B6B', // Warm gray
  textMuted: '#9B9B8E', // Olive-tinted muted
  textInverse: '#FFFFFF', // On dark backgrounds

  // Accent for active/selected states
  accent: '#3D4A2A',
  accentBackground: '#F0EBE1', // Warm cream

  // Mood filter pill colors - Warmer tones
  mood: {
    lowEnergy: { bg: '#F5ECD7', text: '#8B6914' }, // Warm gold
    comfort: { bg: '#F2E6C9', text: '#7A5C1F' }, // Sandy
    healthy: { bg: '#E4EDDA', text: '#3D4A2A' }, // Sage
    quick: { bg: '#E8E3D9', text: '#5A5548' }, // Stone
    family: { bg: '#F0DDD4', text: '#8B5A3C' }, // Terracotta
  },

  // UI states - Warm borders
  border: '#E8E4DC',
  borderLight: '#F0EBE3',
  shadow: 'rgba(0, 0, 0, 0.04)',
  overlay: 'rgba(0, 0, 0, 0.3)',

  // Semantic
  error: '#C0392B',
  success: '#7CB342',
  warning: '#E8963A',

  // Premium palette - Olive tones
  premium: '#7CB342',
  premiumDark: '#4A5A33',
  gold: '#E8963A',
  goldLight: '#F5D49A',

  // Glassmorphism - Warm tint
  glass: 'rgba(250, 247, 242, 0.7)',
  glassDark: 'rgba(0, 0, 0, 0.03)',
} as const;

// ============================================================================
// GRADIENTS
// ============================================================================

export const GRADIENTS = {
  primary: ['#3D4A2A', '#4A5A33'] as const,
  premium: ['#7CB342', '#8BC34A'] as const,
  premiumDark: ['#3D4A2A', '#4A5A33'] as const,
  gold: ['#E8963A', '#F5B041'] as const,
  subtle: ['rgba(124, 179, 66, 0.06)', 'rgba(232, 150, 58, 0.03)'] as const,
  card: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.45)'] as const,
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
  displaySmall: 28, // Smaller display
  headingLarge: 24, // Card titles
  headingMedium: 20, // Subsections
  headingSmall: 18, // Small headers
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
  cardPadding: 20, // Alma-style generous card padding
  lg: 24,
  xl: 32,
  xxl: 40, // Alma section gap
  xxxl: 64,
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const RADIUS = {
  xs: 4,
  sm: 10, // Alma ingredient image corners
  md: 12,
  lg: 20, // Alma pillow-like cards (was 16)
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
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
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
