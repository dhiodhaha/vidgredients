import Constants from 'expo-constants';
import { Platform } from 'react-native';
import Purchases, {
  type CustomerInfo,
  type PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';

const RC_IOS_KEY = process.env.EXPO_PUBLIC_RC_IOS_KEY ?? '';
const RC_ANDROID_KEY = process.env.EXPO_PUBLIC_RC_ANDROID_KEY ?? '';

/**
 * Initialize RevenueCat SDK
 * Call this in the root _layout.tsx
 */
export async function initPurchases(userId?: string): Promise<void> {
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
}

/**
 * Check if the user has premium access
 */
export async function checkPremiumStatus(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active.premium !== undefined;
  } catch (error) {
    console.error('Failed to check premium status:', error);
    return false;
  }
}

/**
 * Get available subscription packages
 */
export async function getOfferings(): Promise<PurchasesPackage[]> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages ?? [];
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return [];
  }
}

/**
 * Purchase a subscription package
 */
export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

/**
 * Restore previous purchases
 */
export async function restorePurchases(): Promise<CustomerInfo> {
  return await Purchases.restorePurchases();
}

/**
 * Log in user to RevenueCat
 */
export async function loginUser(userId: string): Promise<void> {
  await Purchases.logIn(userId);
}

/**
 * Log out user from RevenueCat
 */
export async function logoutUser(): Promise<void> {
  await Purchases.logOut();
}
