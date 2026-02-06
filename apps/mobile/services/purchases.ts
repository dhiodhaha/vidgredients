// import Purchases, {
//   type CustomerInfo,
//   type PurchasesPackage,
//   LOG_LEVEL,
// } from 'react-native-purchases';

// Define partial types to avoid importing from the library
export type CustomerInfo = unknown;
export type PurchasesPackage = unknown;

const _RC_IOS_KEY = process.env.EXPO_PUBLIC_RC_IOS_KEY ?? '';
const _RC_ANDROID_KEY = process.env.EXPO_PUBLIC_RC_ANDROID_KEY ?? '';

/**
 * Initialize RevenueCat SDK
 * Call this in the root _layout.tsx
 */
export async function initPurchases(_userId?: string): Promise<void> {
  console.log('[Mock] RevenueCat initialization disabled');
  return;
  /*
  // Graceful exit for Expo Go or web
  if (Constants.appOwnership === 'expo' || Platform.OS === 'web') {
    if (__DEV__) console.log('[RevenueCat] Skipping init in Expo Go/Web');
    return;
  }

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  const apiKey = Platform.OS === 'ios' ? RC_IOS_KEY : RC_ANDROID_KEY;

  if (!apiKey) {
    console.warn('RevenueCat API key not configured');
    return;
  }

  try {
    await Purchases.configure({ apiKey });
    if (userId) {
      await Purchases.logIn(userId);
    }
  } catch (e) {
    console.warn('RevenueCat init failed:', e);
  }
  */
}

/**
 * Check if the user has premium access
 */
export async function checkPremiumStatus(): Promise<boolean> {
  console.log('[Mock] checkPremiumStatus returning false');
  return false;
  /*
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active.premium !== undefined;
  } catch (error) {
    console.error('Failed to check premium status:', error);
    return false;
  }
  */
}

/**
 * Get available subscription packages
 */
export async function getOfferings(): Promise<PurchasesPackage[]> {
  console.log('[Mock] getOfferings returning empty array');
  return [];
  /*
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages ?? [];
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return [];
  }
  */
}

/**
 * Purchase a subscription package
 */
export async function purchasePackage(_pkg: PurchasesPackage): Promise<CustomerInfo> {
  console.warn('[Mock] purchasePackage called but disabled');
  throw new Error('Purchases are currently disabled');
  /*
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
  */
}

/**
 * Restore previous purchases
 */
export async function restorePurchases(): Promise<CustomerInfo> {
  console.log('[Mock] restorePurchases called');
  return {} as unknown as CustomerInfo;
  /*
  return await Purchases.restorePurchases();
  */
}

/**
 * Log in user to RevenueCat
 */
export async function loginUser(_userId: string): Promise<void> {
  console.log('[Mock] loginUser called');
  /*
  await Purchases.logIn(userId);
  */
}

/**
 * Log out user from RevenueCat
 */
export async function logoutUser(): Promise<void> {
  console.log('[Mock] logoutUser called');
  /*
  await Purchases.logOut();
  */
}
