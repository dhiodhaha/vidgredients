// LinearGradient removed - using solid color fallback
import { router } from 'expo-router';
import { ArrowLeft, Check, Crown, Sparkle } from 'phosphor-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlowingBorder } from '../../components/ui/GlowingBorder';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import {
  type PurchasesPackage,
  getOfferings,
  purchasePackage,
  restorePurchases,
} from '../../services/purchases';
import { usePremiumStore } from '../../stores/premium';

const FEATURES = [
  { icon: '🍽️', title: 'Unlimited Recipes', desc: 'Save as many recipes as you want' },
  { icon: '📊', title: 'AI Meal Plans', desc: 'Generate meal plans from your recipes' },
  { icon: '📥', title: 'Export & Share', desc: 'Download as PDF or shopping list' },
  { icon: '🎯', title: 'Advanced Filters', desc: 'Dietary, nutrition & more' },
  { icon: '☁️', title: 'Cloud Backup', desc: 'Your recipes are always safe' },
];

export default function PaywallScreen() {
  const [offerings, setOfferings] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<number>(0);
  const checkStatus = usePremiumStore((s) => s.checkStatus);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      const pkgs = await getOfferings();
      setOfferings(pkgs);
      // Select annual by default if available
      if (pkgs.length > 1) setSelectedPkg(1);
    } catch {
      // offerings stay empty
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = useCallback(async () => {
    const pkg = offerings[selectedPkg];
    if (!pkg) return;
    setPurchasing(true);
    try {
      await purchasePackage(pkg);
      await checkStatus();
      Alert.alert('Welcome to Premium!', 'You now have access to all features.', [
        { text: 'Continue', onPress: () => router.back() },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Purchase failed';
      // Don't show error for cancelled purchases or test store simulations
      if (!msg.includes('cancelled') && !msg.includes('simulated')) {
        Alert.alert('Purchase Failed', msg);
      }
    } finally {
      setPurchasing(false);
    }
  }, [offerings, selectedPkg, checkStatus]);

  const handleRestore = useCallback(async () => {
    setPurchasing(true);
    try {
      await restorePurchases();
      await checkStatus();
      Alert.alert('Restored', 'Your purchases have been restored.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Restore Failed', 'No previous purchases found.');
    } finally {
      setPurchasing(false);
    }
  }, [checkStatus]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.textPrimary} weight="bold" />
        </Pressable>
        <Pressable onPress={handleRestore}>
          <Text style={styles.restoreText}>Restore</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.hero}>
          <View style={styles.heroGradient}>
            <Crown size={48} color="#F5D49A" weight="fill" />
            <Text style={styles.heroTitle}>Unlock Premium</Text>
            <Text style={styles.heroSubtitle}>
              Get the most out of your cooking with unlimited recipes and AI meal plans
            </Text>
          </View>
        </Animated.View>

        {/* Features */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
              <Check size={18} color={COLORS.primaryLight} weight="bold" />
            </View>
          ))}
        </Animated.View>

        {/* Offerings */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
          ) : offerings.length > 0 ? (
            <View style={styles.offerings}>
              {offerings.map((pkg, i) => {
                const product = pkg as unknown as {
                  identifier: string;
                  product: {
                    title: string;
                    priceString: string;
                    description: string;
                  };
                };
                const isSelected = i === selectedPkg;
                const isAnnual = i === 1;
                return (
                  <Pressable key={product.identifier} onPress={() => setSelectedPkg(i)}>
                    {isAnnual ? (
                      <GlowingBorder isActive={isSelected} borderRadius={RADIUS.lg}>
                        <OfferingCard
                          title={product.product?.title || (isAnnual ? 'Annual' : 'Monthly')}
                          price={product.product?.priceString || ''}
                          isSelected={isSelected}
                          badge={isAnnual ? 'Best Value' : undefined}
                        />
                      </GlowingBorder>
                    ) : (
                      <OfferingCard
                        title={product.product?.title || 'Monthly'}
                        price={product.product?.priceString || ''}
                        isSelected={isSelected}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={styles.fallbackOfferings}>
              <Text style={styles.fallbackText}>
                Subscription offerings are not available yet. Set up products in RevenueCat
                dashboard.
              </Text>
            </View>
          )}
        </Animated.View>

        {/* CTA */}
        <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.ctaContainer}>
          <PurchaseButton onPress={handlePurchase} loading={purchasing} />
          <Pressable onPress={() => router.back()} style={styles.skipButton}>
            <Text style={styles.skipText}>Maybe later</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function OfferingCard({
  title,
  price,
  isSelected,
  badge,
}: {
  title: string;
  price: string;
  isSelected: boolean;
  badge?: string;
}) {
  return (
    <View style={[styles.offeringCard, isSelected && styles.offeringSelected]}>
      <View style={styles.offeringContent}>
        <View style={styles.offeringTitleRow}>
          <Text style={[styles.offeringTitle, isSelected && styles.offeringTitleSelected]}>
            {title}
          </Text>
          {badge && (
            <View style={styles.offeringBadge}>
              <Sparkle size={10} color="#FFFFFF" weight="fill" />
              <Text style={styles.offeringBadgeText}>{badge}</Text>
            </View>
          )}
        </View>
      </View>
      <Text style={[styles.offeringPrice, isSelected && styles.offeringPriceSelected]}>
        {price}
      </Text>
    </View>
  );
}

function PurchaseButton({
  onPress,
  loading,
}: {
  onPress: () => void;
  loading: boolean;
}) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={loading}
      >
        <View style={styles.purchaseButton}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.purchaseButtonText}>Continue</Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glass,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restoreText: {
    fontSize: FONT_SIZES.bodyMedium,
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  hero: {
    marginBottom: SPACING.xl,
  },
  heroGradient: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: '#3D4A2A', // Deep olive (Alma)
  },
  heroTitle: {
    fontSize: FONT_SIZES.displayMedium,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.bodyLarge,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  featureDesc: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  loader: {
    marginVertical: SPACING.xl,
  },
  offerings: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  offeringCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    position: 'relative',
    ...SHADOWS.sm,
  },
  offeringSelected: {
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.accentBackground,
  },
  offeringContent: {
    flex: 1,
  },
  offeringTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  offeringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  offeringBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  offeringTitle: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  offeringTitleSelected: {
    color: COLORS.primary,
  },
  offeringDesc: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  offeringDescSelected: {
    color: COLORS.primaryMuted,
  },
  offeringPrice: {
    fontSize: FONT_SIZES.headingMedium,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  offeringPriceSelected: {
    color: COLORS.primary,
  },
  fallbackOfferings: {
    backgroundColor: COLORS.glassDark,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  fallbackText: {
    fontSize: FONT_SIZES.bodyMedium,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  ctaContainer: {
    gap: SPACING.md,
  },
  purchaseButton: {
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary, // Solid fallback for LinearGradient
  },
  purchaseButtonText: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
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
