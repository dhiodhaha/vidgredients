/**
 * Design System Tokens
 * Based on Atomize Pro 3.1 Design Kit
 *
 * Configuration:
 *   Theme:       Light
 *   Primitives:  Atomize
 *   Color Type:  Atomize (Primary + Secondary + Tertiary + Quaternary)
 *   Typography:  Typeface 1 Mobile
 *   Radius:      Round
 *   Font:        Atomize
 *   Spacing:     Default tokens
 */

// ============================================================================
// COLORS
// ============================================================================

export const COLORS = {
  // Primary palette - Purple (Atomize Primary brand)
  primary: '#6F61FF', // Brand 500
  primaryLight: '#9187FF', // Brand 400
  primaryMuted: '#5548D8', // Brand 600
  primaryDark: '#4539C3', // Brand 700
  primaryDarker: '#392F9F', // Brand 800

  // Secondary palette - Magenta (Atomize Secondary brand)
  secondary: '#F83CE9', // Secondary 500
  secondaryLight: '#FF6DF3', // Secondary 400
  secondaryDark: '#E322D4', // Secondary 600
  secondaryDarker: '#B91EAC', // Secondary 700

  // Tertiary palette - Warm Orange (Atomize Tertiary brand)
  tertiary: '#F74E03', // Tertiary 500
  tertiaryLight: '#FF7335', // Tertiary 400
  tertiaryDark: '#EA3300', // Tertiary 600

  // Background - Light theme surfaces
  background: '#F9F9FA', // Surface s1
  surface: '#FFFFFF', // Surface s0
  surfaceElevated: '#FFFFFF', // Surface white
  surfaceMuted: '#F2F2F4', // Surface s2
  surfaceSubtle: '#ECECF0', // Surface s3

  // Text hierarchy - Light theme emphasis levels
  textPrimary: '#0A0C11', // Gray 950 (high emphasis)
  textSecondary: '#5B616D', // Gray 700 (medium emphasis)
  textMuted: '#8C929C', // Gray 600 (low emphasis)
  textDisabled: '#C3C6CC', // Gray 400 (base emphasis)
  textInverse: '#FFFFFF', // On dark backgrounds

  // Accent for active/selected states
  accent: '#6F61FF', // Same as primary
  accentBackground: '#F5F4FF', // Primary 50

  // Mood filter pill colors - derived from Atomize brand palettes
  mood: {
    lowEnergy: { bg: '#FFE3FD', text: '#98128D' }, // Secondary 100/800
    comfort: { bg: '#FFCDFB', text: '#75116D' }, // Secondary 200/900
    healthy: { bg: '#F5F4FF', text: '#4539C3' }, // Primary 50/700
    quick: { bg: '#F2F2F4', text: '#5B616D' }, // Surface s2/Gray 700
    family: { bg: '#E9E6FF', text: '#2B237F' }, // Primary 100/900
  },

  // UI states - Light theme borders
  border: '#DDDFE4', // Surface s4
  borderLight: '#ECECF0', // Surface s3
  shadow: 'rgba(0, 0, 0, 0.04)',
  overlay: 'rgba(0, 0, 0, 0.3)',

  // Semantic - from Light theme with Atomize colors
  error: '#F74E03', // Tertiary 500 (warm orange)
  success: '#6F61FF', // Primary 500 (purple)
  warning: '#F83CE9', // Secondary 500 (magenta)
  info: '#06B1F1', // Info med_em from Light theme

  // Premium palette - Primary brand tones
  premium: '#6F61FF', // Primary 500
  premiumDark: '#4539C3', // Primary 700
  gold: '#F83CE9', // Secondary 500
  goldLight: '#FFA1F7', // Secondary 300

  // Glassmorphism
  glass: 'rgba(255, 255, 255, 0.7)',
  glassDark: 'rgba(0, 0, 0, 0.03)',
} as const;

// ============================================================================
// GRADIENTS
// ============================================================================

export const GRADIENTS = {
  primary: ['#5548D8', '#6F61FF'] as const, // Brand 600 -> 500
  premium: ['#6F61FF', '#9187FF'] as const, // Brand 500 -> 400
  premiumDark: ['#4539C3', '#5548D8'] as const, // Brand 700 -> 600
  gold: ['#E322D4', '#F83CE9'] as const, // Secondary 600 -> 500
  subtle: ['rgba(111, 97, 255, 0.06)', 'rgba(248, 60, 233, 0.03)'] as const, // Primary + Secondary subtle
  card: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.45)'] as const,
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

// Font families from Font/Atomize tokens
// Display: "Radio Canada Big" -> using system font as RN-safe fallback
// Body: "Open Sauce Two" -> using system font as fallback
export const FONTS = {
  // Display font (Typeface 1 Mobile -> display)
  serifBold: 'PlayfairDisplay-Bold',
  serifRegular: 'PlayfairDisplay-Regular',

  // Body font (Typeface 1 Mobile -> body)
  sansRegular: 'System', // Open Sauce Two regular (weight 500)
  sansMedium: 'System', // Open Sauce Two medium (weight 600)
  sansBold: 'System', // Open Sauce Two bold (weight 800)
} as const;

// Font sizes from Typeface_1_mobile tokens
export const FONT_SIZES = {
  displayLarge: 44, // display_1/2/3
  displayMedium: 36, // heading_5
  displaySmall: 30, // heading_4
  headingLarge: 26, // heading_3
  headingMedium: 22, // heading_2
  headingSmall: 20, // heading_1
  bodyLarge: 17, // body_2 / title_1 / title_2
  bodyMedium: 15, // body_1
  bodySmall: 14, // caption_2
  caption: 12, // caption_1 / overline
} as const;

// Line heights from Typeface_1_mobile tokens (converted to multipliers)
export const LINE_HEIGHTS = {
  tight: 1.1, // Headings (48/44 ~ 1.09)
  normal: 1.33, // Body (20/15 ~ 1.33)
  relaxed: 1.6, // Long-form / paragraph
} as const;

// Font weights from Typeface_1_mobile tokens
export const FONT_WEIGHTS = {
  display: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  body: {
    normal: '500' as const,
    medium: '600' as const,
    semibold: '700' as const,
    bold: '800' as const,
  },
} as const;

// ============================================================================
// SPACING (from Default.tokens.json)
// ============================================================================

export const SPACING = {
  xxs: 2, // Atomize xxs
  xs: 4, // Atomize xs
  sm: 8, // Atomize md
  md: 16, // Atomize 3xl
  cardPadding: 20, // Atomize 5xl
  lg: 24, // Atomize 7xl
  xl: 32, // Atomize 10xl
  xxl: 40, // Atomize 12xl
  xxxl: 64, // Atomize 18xl
} as const;

// ============================================================================
// BORDER RADIUS (from Round.tokens.json)
// ============================================================================

export const RADIUS = {
  xs: 4, // radius_xs
  sm: 8, // radius_md
  md: 12, // radius_xl
  lg: 20, // big_component radius_sm (Round)
  xl: 24, // big_component radius_md (Round)
  bigLg: 28, // big_component radius_lg (Round)
  pill: 1000, // component radius (Round = all 1000)
  full: 1000, // radius_round
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
