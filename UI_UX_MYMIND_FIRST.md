# UI/UX Polish: MyMind-Inspired Aesthetic FIRST

## Strategy

**IMPORTANT**: Polish UI/UX BEFORE RevenueCat implementation. Beautiful design is 50% of what wins a hackathon.

Your app already has:
- ✅ Glowing borders (GlowingBorder component)
- ✅ Design tokens (COLORS, FONTS, SPACING)
- ✅ Swiss/MyMind aesthetic starting point
- ✅ Reanimated for smooth animations

**We need to:**
- Make it less generic, more personality-driven
- Add premium polish to every interaction
- Use animations like MyMind (subtle, sophisticated)
- Custom gradients and depth
- Micro-interactions throughout

## Phase 0: Design Polish (2-3 hours BEFORE RevenueCat)

### 0.1: Enhance Color System (15 mins)

Update `apps/mobile/lib/theme.ts`:

```typescript
export const COLORS = {
  // Existing
  primary: '#064E3B',
  primaryLight: '#10B981',
  primaryMuted: '#047857',

  // NEW: Premium gradients
  gradients: {
    primary: ['#064E3B', '#0F766E'], // Dark emerald to teal
    premium: ['#10B981', '#06B6D4'], // Green to cyan (MyMind-like)
    subtle: ['rgba(16, 185, 129, 0.1)', 'rgba(6, 182, 212, 0.05)'],
  },

  // NEW: Neutral palette (for card backgrounds)
  neutral: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    900: '#1C1917',
  },

  // Existing but enhanced
  background: '#F8F8F7', // Slightly warmer
  surface: '#FFFFFF',
  surfaceElevated: '#FAFAF9',

  // NEW: Glassmorphism
  glass: 'rgba(255, 255, 255, 0.4)',
  glassGray: 'rgba(120, 113, 108, 0.1)',
};
```

### 0.2: Add Premium Typography (10 mins)

Update theme.ts:

```typescript
export const FONTS = {
  // Keep PlayfairDisplay for headlines (luxury feel)
  serifBold: 'PlayfairDisplay-Bold',
  serifRegular: 'PlayfairDisplay-Regular',

  // System fonts (iPhone/Android native, but refined)
  sansRegular: 'System',
  sansMedium: 'System',
  sansBold: 'System',

  // NEW: Letter spacing for luxury
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 1,
    wider: 2,
  },
};

// NEW: Font weights
export const FONT_WEIGHTS = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;
```

### 0.3: Create Premium Gradient Utilities (20 mins)

Create `apps/mobile/lib/gradients.ts`:

```typescript
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';

interface GradientProps {
  colors: string[];
  children: ReactNode;
  style?: any;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export const PremiumGradient = ({
  colors,
  children,
  style,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
}: GradientProps) => (
  <LinearGradient
    colors={colors}
    start={start}
    end={end}
    style={[{ overflow: 'hidden' }, style]}
  >
    {children}
  </LinearGradient>
);

// Preset gradients matching MyMind aesthetic
export const GRADIENT_PRESETS = {
  primary: ['#064E3B', '#0F766E'],
  premium: ['#10B981', '#06B6D4'],
  warmGold: ['#D97706', '#F59E0B'],
  rosePink: ['#EC4899', '#F43F5E'],
  subtle: ['rgba(16, 185, 129, 0.05)', 'rgba(6, 182, 212, 0.05)'],
};
```

### 0.4: Create Premium Button Components (30 mins)

Create `apps/mobile/components/ui/PremiumButton.tsx`:

```typescript
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../lib/theme';

interface PremiumButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

export function PremiumButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  disabled,
}: PremiumButtonProps) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSpring(0.92);
    setTimeout(() => {
      scale.value = withSpring(1);
      onPress();
    }, 100);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const gradient =
    variant === 'premium'
      ? ['#10B981', '#06B6D4']
      : variant === 'primary'
        ? ['#064E3B', '#0F766E']
        : ['#FFFFFF', '#FAFAF9'];

  const sizes = {
    sm: { padding: SPACING.sm, fontSize: FONT_SIZES.bodyMedium },
    md: { padding: SPACING.md, fontSize: FONT_SIZES.bodyLarge },
    lg: { padding: SPACING.lg, fontSize: FONT_SIZES.headingMedium },
  };

  const sizeStyle = sizes[size];

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.button,
          {
            paddingVertical: sizeStyle.padding,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text
              style={[
                styles.label,
                {
                  fontSize: sizeStyle.fontSize,
                  color: variant === 'secondary' ? COLORS.textPrimary : '#FFFFFF',
                },
              ]}
            >
              {loading ? '...' : label}
            </Text>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  gradient: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  icon: {
    marginRight: SPACING.xs,
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
```

### 0.5: Enhance Recipe Card (MyMind Style) (30 mins)

Update `apps/mobile/components/home/RecipeCard.tsx`:

```typescript
import { Image } from 'expo-image';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import type { Recipe } from '../../stores/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  height?: number;
  isPremium?: boolean;
  onPress?: (recipeId: string) => void;
}

export const RecipeCard = memo(function RecipeCard({
  recipe,
  height = 200,
  isPremium,
  onPress,
}: RecipeCardProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const handlePress = useCallback(() => {
    onPress?.(recipe.id);
  }, [onPress, recipe.id]);

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 150 });
    glowOpacity.value = withTiming(1, { duration: 200 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
    glowOpacity.value = withTiming(0, { duration: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View style={[animatedStyle]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* Premium glow effect */}
        {isPremium && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.glowContainer,
              { height },
              glowStyle,
            ]}
          >
            <View
              style={[
                styles.glow,
                {
                  borderColor: COLORS.primaryLight,
                  opacity: 0.6,
                },
              ]}
            />
          </Animated.View>
        )}

        {/* Main card */}
        <View style={[styles.card, { height }, SHADOWS.lg]}>
          <Image
            source={{ uri: recipe.thumbnailUrl }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />

          {/* Dark gradient overlay */}
          <View style={styles.darkOverlay} />

          {/* Content */}
          <View style={styles.overlay}>
            <View style={styles.topBadges}>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                  },
                ]}
              >
                <Text style={styles.badgeText}>{recipe.platform.toUpperCase()}</Text>
              </View>

              {recipe.difficulty && (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: getDifficultyColor(recipe.difficulty),
                    },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>
                    {recipe.difficulty.toUpperCase()}
                  </Text>
                </View>
              )}

              {isPremium && (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>
                    ✨ PREMIUM
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={2}>
                {recipe.title}
              </Text>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>
                  {recipe.ingredients.length} ingredients
                </Text>
                {recipe.cookTimeMinutes && (
                  <Text style={styles.meta}>⏱️ {recipe.cookTimeMinutes}m</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return 'rgba(16, 185, 129, 0.8)'; // Green
    case 'medium':
      return 'rgba(245, 158, 11, 0.8)'; // Amber
    case 'hard':
      return 'rgba(239, 68, 68, 0.8)'; // Red
    default:
      return 'rgba(107, 114, 128, 0.8)'; // Gray
  }
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  glowContainer: {
    position: 'absolute',
    width: '100%',
    borderRadius: RADIUS.lg,
    zIndex: 10,
    pointerEvents: 'none',
  },
  glow: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderRadius: RADIUS.lg,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  topBadges: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xs,
    backdropFilter: 'blur(10px)',
  },
  badgeText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  titleContainer: {
    marginTop: 'auto',
  },
  title: {
    fontSize: FONT_SIZES.headingMedium,
    fontWeight: '700',
    color: COLORS.textInverse,
    marginBottom: SPACING.sm,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'center',
  },
  meta: {
    fontSize: FONT_SIZES.bodySmall,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
});
```

### 0.6: Create Premium Modal (For Paywall) (40 mins)

Create `apps/mobile/components/paywall/PremiumModal.tsx`:

```typescript
import { router } from 'expo-router';
import { X } from 'phosphor-react-native';
import { useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import { GlowingBorder } from '../ui/GlowingBorder';
import { PremiumButton } from '../ui/PremiumButton';

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PremiumModal({ visible, onClose }: PremiumModalProps) {
  const slideUp = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      slideUp.value = withTiming(1, { duration: 400 });
    }
  }, [visible, slideUp]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: slideUp.value === 0 ? 500 : 0,
      },
    ],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View style={[styles.container, animatedStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>✨ Unlock Premium</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={24} color={COLORS.textPrimary} weight="bold" />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Features */}
            <View style={styles.featuresContainer}>
              <Feature
                icon="🍽️"
                title="Unlimited Recipes"
                description="Save and organize unlimited recipes from any source"
              />
              <Feature
                icon="📊"
                title="Meal Plans"
                description="Generate AI-powered meal plans from your saved recipes"
              />
              <Feature
                icon="📥"
                title="Export & Share"
                description="Download recipes as PDF or shopping lists"
              />
              <Feature
                icon="📱"
                title="Cloud Backup"
                description="Your recipes are always safe and synced"
              />
              <Feature
                icon="🎯"
                title="Advanced Filters"
                description="Filter by nutrition, dietary needs, and more"
              />
            </View>

            {/* Pricing Cards */}
            <View style={styles.pricingContainer}>
              <PricingCard
                plan="Monthly"
                price="$4.99"
                period="/month"
                popular={false}
              />
              <GlowingBorder isActive={true} glowColor={COLORS.primaryLight}>
                <PricingCard
                  plan="Yearly"
                  price="$49.99"
                  period="/year"
                  popular={true}
                  savings="Save 16%"
                />
              </GlowingBorder>
            </View>

            {/* CTA Buttons */}
            <View style={styles.buttonGroup}>
              <PremiumButton
                label="Start Free Trial"
                variant="premium"
                size="lg"
                onPress={() => {
                  onClose();
                  router.push('/paywall');
                }}
              />
              <Pressable onPress={onClose} style={styles.skipButton}>
                <Text style={styles.skipText}>Continue as Free User</Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.feature}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

function PricingCard({
  plan,
  price,
  period,
  popular,
  savings,
}: {
  plan: string;
  price: string;
  period: string;
  popular?: boolean;
  savings?: string;
}) {
  return (
    <View
      style={[
        styles.pricingCard,
        popular && {
          backgroundColor: COLORS.primary,
          borderColor: COLORS.primaryLight,
        },
      ]}
    >
      {savings && (
        <View style={styles.savingsBadge}>
          <Text style={styles.savingsText}>{savings}</Text>
        </View>
      )}

      <Text style={[styles.planName, popular && styles.planNameDark]}>
        {plan}
      </Text>
      <View style={styles.priceContainer}>
        <Text style={[styles.price, popular && styles.priceDark]}>
          {price}
        </Text>
        <Text style={[styles.period, popular && styles.periodDark]}>
          {period}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '85%',
    ...SHADOWS.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.headingLarge,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    gap: SPACING.xl,
  },
  featuresContainer: {
    gap: SPACING.md,
  },
  feature: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'flex-start',
  },
  featureIcon: {
    fontSize: 28,
    marginTop: SPACING.xs,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  featureDescription: {
    fontSize: FONT_SIZES.bodyMedium,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  pricingContainer: {
    gap: SPACING.md,
  },
  pricingCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  savingsBadge: {
    position: 'absolute',
    top: -10,
    right: SPACING.lg,
    backgroundColor: '#10B981',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  savingsText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planName: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  planNameDark: {
    color: '#FFFFFF',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.sm,
  },
  price: {
    fontSize: FONT_SIZES.displayLarge,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  priceDark: {
    color: '#FFFFFF',
  },
  period: {
    fontSize: FONT_SIZES.bodyMedium,
    color: COLORS.textSecondary,
  },
  periodDark: {
    color: 'rgba(255,255,255,0.8)',
  },
  buttonGroup: {
    gap: SPACING.md,
  },
  skipButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  skipText: {
    fontSize: FONT_SIZES.bodyMedium,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});
```

### 0.7: Update Header Component (MyMind Polish) (20 mins)

Already looks good, but enhance with better animations in your existing `Header.tsx` - use the GlowingBorder for the sparkle button.

### 0.8: Enhance Profile Screen (10 mins)

Update `apps/mobile/app/(main)/profile.tsx` - already done well, just ensure consistent styling.

## Phase 0 Checklist

- [ ] Update theme.ts with gradients and new colors
- [ ] Create gradients.ts utility
- [ ] Create PremiumButton.tsx component
- [ ] Update RecipeCard.tsx with animations and premium badge
- [ ] Create PremiumModal.tsx for paywall intro
- [ ] Test all components visually
- [ ] Run lint check: `npm run lint`
- [ ] Test animations are smooth on device

## Time Budget

| Component | Time | Status |
|-----------|------|--------|
| Theme enhancement | 15 min | |
| Gradients utility | 20 min | |
| PremiumButton | 30 min | |
| RecipeCard polish | 30 min | |
| PremiumModal | 40 min | |
| Header animation | 20 min | |
| Profile consistency | 10 min | |
| Testing | 15 min | |
| **TOTAL** | **2.5 hours** | |

## Why This Matters for Hackathon

1. **Visual Impact** - Judges see polish immediately
2. **Differentiation** - Custom components vs generic UI
3. **MyMind Aesthetic** - Shows design understanding
4. **Animation Smoothness** - Shows technical skill
5. **Premium Feel** - Justifies the paywall

## THEN Proceed to RevenueCat

After completing Phase 0:
1. Do UI polish (2.5 hours) ✓
2. Implement RevenueCat (3 hours)
3. Test end-to-end (1 hour)
4. Polish and submit

**Total: 6.5 hours → World-class entry**

Next: Follow `STEP_BY_STEP_CHECKLIST.md` but do Phase 0 first!
