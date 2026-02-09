# Implementation Roadmap - Quick Start

## Step 1: Create Premium Store (15 mins)

Create `apps/mobile/stores/premium.ts`:

```typescript
import { create } from 'zustand';
import { checkPremiumStatus, loginUser, logoutUser } from '../services/purchases';

interface PremiumState {
  isPremium: boolean;
  isLoading: boolean;
  error: string | null;
  checkStatus: () => Promise<void>;
  syncWithUser: (userId: string) => Promise<void>;
  clearUser: () => Promise<void>;
}

export const usePremiumStore = create<PremiumState>((set) => ({
  isPremium: false,
  isLoading: true,
  error: null,

  checkStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const status = await checkPremiumStatus();
      set({ isPremium: status, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to check status',
        isLoading: false,
      });
    }
  },

  syncWithUser: async (userId: string) => {
    try {
      await loginUser(userId);
      await (set as any).checkStatus();
    } catch (error) {
      console.error('Failed to sync user:', error);
    }
  },

  clearUser: async () => {
    try {
      await logoutUser();
      set({ isPremium: false });
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  },
}));

export const useHasPremium = () => {
  return usePremiumStore((state) => state.isPremium);
};
```

## Step 2: Enable RevenueCat Service (10 mins)

Update `apps/mobile/services/purchases.ts` - uncomment the real implementation.

## Step 3: Initialize in Root Layout (5 mins)

Update `apps/mobile/app/_layout.tsx`:

```typescript
import { useEffect } from 'react';
import { useIsAuthenticated } from '../stores/auth';
import { usePremiumStore } from '../stores/premium';
import { initPurchases } from '../services/purchases';

export default function RootLayout() {
  const { user, isAuthenticated } = useIsAuthenticated();
  const syncWithUser = usePremiumStore((state) => state.syncWithUser);
  const checkStatus = usePremiumStore((state) => state.checkStatus);

  useEffect(() => {
    // Initialize RevenueCat
    initPurchases(user?.id);
  }, [user?.id]);

  useEffect(() => {
    // Sync user and check premium status
    if (isAuthenticated && user?.id) {
      syncWithUser(user.id);
    } else {
      checkStatus();
    }
  }, [isAuthenticated, user?.id, syncWithUser, checkStatus]);

  // ... rest of layout
}
```

## Step 4: Create Paywall Screen (30 mins)

Create `apps/mobile/app/(main)/paywall.tsx`:

```typescript
import { router } from 'expo-router';
import { Crown, X } from 'phosphor-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import { getOfferings, purchasePackage } from '../../services/purchases';
import type { PurchasesPackage } from '../../services/purchases';

export default function PaywallScreen() {
  const [offerings, setOfferings] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      const packages = await getOfferings();
      setOfferings(packages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load offerings');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = useCallback(async (pkg: PurchasesPackage) => {
    setPurchasing(true);
    try {
      await purchasePackage(pkg);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>✨ Premium Features</Text>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <X size={24} color={COLORS.textPrimary} weight="bold" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.featureList}>
          <FeatureItem icon="🍽️" text="Unlimited recipes" />
          <FeatureItem icon="📊" text="Meal plan generation" />
          <FeatureItem icon="📥" text="Export as PDF" />
          <FeatureItem icon="📱" text="Cloud backup" />
          <FeatureItem icon="🎯" text="Advanced filters" />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <View style={styles.offerings}>
            {offerings.map((pkg) => (
              <OfferingCard
                key={pkg.identifier}
                package={pkg}
                onPress={() => handlePurchase(pkg)}
                loading={purchasing}
              />
            ))}
          </View>
        )}

        <Pressable onPress={() => router.back()} style={styles.skipButton}>
          <Text style={styles.skipText}>Continue as free user</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

function OfferingCard({
  package: pkg,
  onPress,
  loading,
}: {
  package: PurchasesPackage;
  onPress: () => void;
  loading: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [styles.offeringCard, pressed && styles.offeringPressed]}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.surface} />
      ) : (
        <>
          <Text style={styles.offeringTitle}>{(pkg as any).product?.title || 'Premium'}</Text>
          <Text style={styles.offeringPrice}>{(pkg as any).product?.priceString || '$9.99'}</Text>
          <Text style={styles.offeringDesc}>{(pkg as any).product?.description || ''}</Text>
        </>
      )}
    </Pressable>
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
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.headingLarge,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  featureList: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontSize: FONT_SIZES.bodyLarge,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  offerings: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  offeringCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.lg,
  },
  offeringPressed: {
    opacity: 0.8,
  },
  offeringTitle: {
    fontSize: FONT_SIZES.headingMedium,
    fontWeight: '700',
    color: COLORS.surface,
    marginBottom: SPACING.xs,
  },
  offeringPrice: {
    fontSize: FONT_SIZES.displayLarge,
    fontWeight: '700',
    color: COLORS.surface,
    marginBottom: SPACING.xs,
  },
  offeringDesc: {
    fontSize: FONT_SIZES.bodyMedium,
    color: 'rgba(255,255,255,0.8)',
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
  loader: {
    marginVertical: SPACING.xl,
  },
  error: {
    color: COLORS.error,
    fontSize: FONT_SIZES.bodyMedium,
    marginVertical: SPACING.md,
  },
});
```

## Step 5: Gate Meal Plan Generation (15 mins)

Update `apps/mobile/hooks/useMealPlanGeneration.ts`:

```typescript
import { useHasPremium } from '../stores/premium';

export function useMealPlanGeneration() {
  const isPremium = useHasPremium();
  // ... existing code

  const generate = useCallback(
    async (recipeIds?: string[], options?: MealPlanGenerationOptions) => {
      if (!isPremium) {
        throw new Error('Meal plan generation requires premium');
      }
      // ... rest of implementation
    },
    [generateMealPlan, recipes, isPremium]
  );

  // ... rest
}
```

## Step 6: Add Premium UI in Home (10 mins)

Update `apps/mobile/app/(main)/index.tsx`:

```typescript
const handleMealPlanSelect = useCallback(
  async (days: number) => {
    const isPremium = usePremiumStore.getState().isPremium;

    if (!isPremium) {
      router.push('/paywall');
      return;
    }

    const recipeIds = Object.keys(recipes);
    if (recipeIds.length === 0) {
      Alert.alert('No Recipes', 'Add some recipes first.');
      return;
    }

    try {
      await generate(recipeIds, { duration: days });
      Alert.alert('Meal Plan Created', `Your ${days}-day meal plan is ready!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      Alert.alert('Error', message);
    }
  },
  [recipes, generate]
);
```

## Step 7: Update Profile Screen (5 mins)

Add premium status to `apps/mobile/app/(main)/profile.tsx`:

```typescript
import { useHasPremium } from '../../stores/premium';

export default function ProfileScreen() {
  const isPremium = useHasPremium();

  return (
    <SafeAreaView style={styles.container}>
      {isPremium && (
        <View style={styles.premiumBadge}>
          <Crown size={16} color="#FFD700" weight="fill" />
          <Text style={styles.premiumText}>Premium Member</Text>
        </View>
      )}
      {/* ... rest */}
    </SafeAreaView>
  );
}
```

## Checklist

- [ ] Create `premium.ts` store
- [ ] Enable RevenueCat in `services/purchases.ts`
- [ ] Update `_layout.tsx` with initialization
- [ ] Create `paywall.tsx` screen
- [ ] Gate meal plans with isPremium check
- [ ] Add premium status to profile
- [ ] Set environment variables
- [ ] Test with RevenueCat test user
- [ ] Check paywall opens on upgrade attempt
- [ ] Verify purchase flow works
- [ ] Test restore purchases

**Total Time: ~2 hours for complete integration**
