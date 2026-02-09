# Step-by-Step Implementation Checklist

**UPDATED PRIORITY**: Polish UI/UX FIRST (2.5 hours), THEN RevenueCat (3 hours)

## ⭐ PHASE 0: UI/UX MYMIND POLISH (DO THIS FIRST!)

**READ THIS FIRST**: `UI_UX_MYMIND_FIRST.md`

Follow those 8 components before anything else. This is critical for judges.

- [ ] Enhance theme with gradients
- [ ] Create gradients utility
- [ ] Build PremiumButton
- [ ] Polish RecipeCard
- [ ] Create PremiumModal
- [ ] Test animations
- [ ] Total: ~2.5 hours

**THEN continue to PRE-FLIGHT CHECK below...**

---

## PRE-FLIGHT CHECK (RevenueCat)
- [ ] RevenueCat account created
- [ ] iOS & Android API keys obtained
- [ ] Test products/subscriptions configured in RevenueCat Dashboard
- [ ] Environment variables ready: `EXPO_PUBLIC_RC_IOS_KEY`, `EXPO_PUBLIC_RC_ANDROID_KEY`

## PHASE 1: ENABLE REVENUECAT SDK

### Step 1.1: Set Environment Variables
**File:** `apps/mobile/.env.local` or `apps/mobile/.env`
```
EXPO_PUBLIC_RC_IOS_KEY=your_ios_api_key
EXPO_PUBLIC_RC_ANDROID_KEY=your_android_api_key
```
- [ ] Keys added to .env file
- [ ] DO NOT commit to git

### Step 1.2: Uncomment purchases.ts
**File:** `apps/mobile/services/purchases.ts`
- [ ] Remove mock returns (lines 19-20, 54-55, 71-72, etc.)
- [ ] Uncomment real Purchases implementation blocks
- [ ] Add to top: `import Purchases, { LOG_LEVEL, type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';`
- [ ] Test: `npm run lint` passes

### Step 1.3: Create Premium Store
**File:** `apps/mobile/stores/premium.ts` (NEW FILE)
```bash
cp apps/mobile/stores/recipe.ts apps/mobile/stores/premium.ts
```
- [ ] Copy code from IMPLEMENTATION_ROADMAP.md
- [ ] Replace template with actual Zustand store
- [ ] Add to `stores/index.ts` if exists: `export { usePremiumStore, useHasPremium } from './premium';`
- [ ] Test: `npm run lint` passes

### Step 1.4: Initialize in Root Layout
**File:** `apps/mobile/app/_layout.tsx`
- [ ] Add: `import { useIsAuthenticated } from '../stores/auth';`
- [ ] Add: `import { usePremiumStore } from '../stores/premium';`
- [ ] Add: `import { initPurchases } from '../services/purchases';`
- [ ] In RootLayout component:
  ```tsx
  useEffect(() => {
    initPurchases(user?.id);
  }, [user?.id]);
  ```
- [ ] Test: App starts without crashes

## PHASE 2: BUILD PAYWALL UI

### Step 2.1: Create Paywall Screen
**File:** `apps/mobile/app/(main)/paywall.tsx` (NEW FILE)
- [ ] Copy code from IMPLEMENTATION_ROADMAP.md
- [ ] Update feature list to match your app
- [ ] Customize colors using `COLORS` tokens
- [ ] Test: `npm run lint` passes
- [ ] Test: Screen renders without crashes

### Step 2.2: Add Navigation to Paywall
**File:** `apps/mobile/app/(main)/_layout.tsx` or `apps/mobile/app/(main)/index.tsx`
- [ ] Import: `import { router } from 'expo-router';`
- [ ] Add route handler: `router.push('/paywall');`
- [ ] Test: Clicking "upgrade" navigates to paywall

## PHASE 3: GATE FEATURES

### Step 3.1: Gate Meal Plans
**File:** `apps/mobile/hooks/useMealPlanGeneration.ts`
- [ ] Add: `import { useHasPremium } from '../stores/premium';`
- [ ] In `generate()` function, add check:
  ```tsx
  const isPremium = useHasPremium();
  if (!isPremium) {
    throw new Error('Meal plan generation requires premium');
  }
  ```
- [ ] Test: Free user gets error, premium user succeeds

### Step 3.2: Gate Meal Plan Button
**File:** `apps/mobile/app/(main)/index.tsx`
- [ ] In `handleMealPlanSelect()`:
  ```tsx
  if (!usePremiumStore.getState().isPremium) {
    router.push('/paywall');
    return;
  }
  ```
- [ ] Test: Tapping meal plan button shows paywall

### Step 3.3: Gate Recipe Saves (Optional)
**File:** `apps/mobile/stores/recipe.ts`
- [ ] Add check in `addRecipe()`:
  ```tsx
  const isPremium = usePremiumStore.getState().isPremium;
  const recipeCount = Object.keys(state.recipes).length;
  if (!isPremium && recipeCount >= 5) {
    throw new Error('Free users can save max 5 recipes');
  }
  ```
- [ ] Test: Free user hits limit, gets upgrade prompt

## PHASE 4: ADD UI POLISH

### Step 4.1: Update Profile Screen
**File:** `apps/mobile/app/(main)/profile.tsx`
- [ ] Add: `import { useHasPremium } from '../../stores/premium';`
- [ ] Add: `import { Crown } from 'phosphor-react-native';`
- [ ] Display premium badge if `isPremium`
- [ ] Add "Manage Subscription" button (optional)
- [ ] Test: Premium users see badge, free users don't

### Step 4.2: Add Upgrade Prompts
**File:** `apps/mobile/components/home/Header.tsx` or `index.tsx`
- [ ] When user tries premium feature as free user:
  ```tsx
  if (!isPremium) {
    Alert.alert(
      '✨ Premium Feature',
      'Unlock unlimited recipes and meal plans',
      [
        { text: 'Continue Free', style: 'cancel' },
        { text: 'Upgrade', onPress: () => router.push('/paywall') }
      ]
    );
  }
  ```
- [ ] Test: Appropriate prompts appear

### Step 4.3: Update Home Screen
**File:** `apps/mobile/app/(main)/index.tsx`
- [ ] Add premium indicator to recipe cards (optional)
- [ ] Update floating action button for premium users
- [ ] Test: UI adjusts based on subscription status

## PHASE 5: TESTING

### Step 5.1: Setup Test User
- [ ] Go to RevenueCat Dashboard
- [ ] Create test user
- [ ] Log in with test user credentials in app
- [ ] Record test user ID

### Step 5.2: Test Free Flow
- [ ] [ ] App starts
- [ ] [ ] Fetch offerings succeeds
- [ ] [ ] Paywall displays
- [ ] [ ] Meal plan button shows paywall
- [ ] [ ] No crashes

### Step 5.3: Test Paid Flow
- [ ] [ ] Switch to premium test user
- [ ] [ ] Meal plan button works
- [ ] [ ] Premium badge shows
- [ ] [ ] All features accessible
- [ ] [ ] No crashes

### Step 5.4: Test Edge Cases
- [ ] [ ] App logs out and switches users
- [ ] [ ] Network error during paywall load
- [ ] [ ] App backgrounded and returned to
- [ ] [ ] Cold app start (not in memory)
- [ ] [ ] Rotates screen (no crashes)

### Step 5.5: Lint & Type Check
```bash
npm run lint
npm run typecheck
```
- [ ] No lint errors
- [ ] No type errors
- [ ] No console.log() mocks left

## PHASE 6: OPTIMIZATION (If time permits)

### Step 6.1: Add Analytics
**File:** `apps/mobile/stores/premium.ts` or new `analytics.ts`
```tsx
// Track events
console.log('Event: paywall_opened', { userId, timestamp });
console.log('Event: purchase_completed', { sku, price });
```
- [ ] Track paywall opens
- [ ] Track purchase attempts
- [ ] Track purchase success
- [ ] Track restore purchases

### Step 6.2: Handle Subscription Expiry
**File:** `apps/mobile/stores/premium.ts`
```tsx
// On app foreground, check again
useEffect(() => {
  const subscription = AppState.addEventListener('change', () => {
    checkStatus();
  });
  return () => subscription.remove();
}, []);
```
- [ ] Subscription status refreshes when app resumes

### Step 6.3: Add Receipt Validation (Backend)
**File:** `apps/api/src/routes/entitlements.ts` (Optional, advanced)
- [ ] Validate RevenueCat receipt server-side
- [ ] Prevent client-side spoofing

## PHASE 7: FINAL CHECKS

### Pre-Submission Checklist
- [ ] No `console.warn('[Mock]')` messages
- [ ] All `//` comments uncommented
- [ ] Environment variables set in EAS build
- [ ] Test on actual iOS device
- [ ] Test on actual Android device
- [ ] Paywall displays offerings
- [ ] Purchase flow works end-to-end
- [ ] Free user cannot access premium
- [ ] Premium user can access all
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] App doesn't crash on lifecycle changes

### Build & Submit
```bash
# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production
```
- [ ] iOS build succeeds
- [ ] Android build succeeds
- [ ] Submit to App Store
- [ ] Submit to Google Play

## Troubleshooting

### Issue: "RevenueCat API key not found"
**Solution**: Check `.env` file, verify keys are set, rebuild app

### Issue: "Purchases are currently disabled"
**Solution**: Uncommented the mocks? Remove all mock code from purchases.ts

### Issue: "Paywall shows no offerings"
**Solution**:
- Verify products created in RevenueCat Dashboard
- Check iOS/Android keys are correct for your RevenueCat project
- Restart Expo dev server

### Issue: "User not synced with RevenueCat"
**Solution**: Ensure `initPurchases(userId)` called with correct user ID from Better Auth

### Issue: "Premium status not updating"
**Solution**: Call `usePremiumStore.getState().checkStatus()` after purchases

## Time Estimate

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1.1 | Set env vars | 5 min | |
| 1.2 | Uncomment SDK | 10 min | |
| 1.3 | Create store | 15 min | |
| 1.4 | Init layout | 10 min | |
| 2.1 | Paywall screen | 30 min | |
| 2.2 | Add navigation | 10 min | |
| 3.1 | Gate features | 15 min | |
| 3.2 | Gate buttons | 10 min | |
| 3.3 | Gate saves | 15 min | |
| 4.1 | Profile UI | 10 min | |
| 4.2 | Prompts | 15 min | |
| 4.3 | Home screen | 10 min | |
| 5.x | Testing | 30 min | |
| 6.x | Polish | 30 min | |
| **TOTAL** | | **3.5 hours** | |

## Success Metrics

After completion, you should have:
- ✅ RevenueCat SDK properly initialized
- ✅ Custom paywall screen
- ✅ Working purchase flow
- ✅ Feature gating (meal plans, saves)
- ✅ Premium badge in UI
- ✅ Zero mock code
- ✅ Proper error handling
- ✅ Passes all tests
- ✅ Ready to submit to hackathon

Good luck! 🚀
