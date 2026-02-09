import { create } from 'zustand';
import { checkPremiumStatus, loginUser, logoutUser, restorePurchases } from '../services/purchases';

interface PremiumState {
  isPremium: boolean;
  isLoading: boolean;
  error: string | null;
  checkStatus: () => Promise<void>;
  syncWithUser: (userId: string) => Promise<void>;
  clearUser: () => Promise<void>;
  restore: () => Promise<boolean>;
  clearError: () => void;
}

export const usePremiumStore = create<PremiumState>()((set, get) => ({
  isPremium: false,
  isLoading: true,
  error: null,

  checkStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const status = await checkPremiumStatus();
      set({ isPremium: status, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  syncWithUser: async (userId: string) => {
    try {
      await loginUser(userId);
      await get().checkStatus();
    } catch {
      // Silently fail - user can still use app
    }
  },

  clearUser: async () => {
    try {
      await logoutUser();
      set({ isPremium: false });
    } catch {
      // Silently fail
    }
  },

  restore: async () => {
    set({ isLoading: true, error: null });
    try {
      const customerInfo = await restorePurchases();
      const isPremium =
        (customerInfo as { entitlements?: { active?: { premium?: unknown } } })?.entitlements
          ?.active?.premium !== undefined;
      set({ isPremium, isLoading: false });
      return isPremium;
    } catch {
      set({ isLoading: false, error: 'Failed to restore purchases' });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

export const useHasPremium = () => usePremiumStore((s) => s.isPremium);
