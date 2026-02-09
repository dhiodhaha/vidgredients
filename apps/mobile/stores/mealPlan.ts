import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  GenerateMealPlanRequest,
  GenerateMealPlanResponse,
  MealPlan,
  MealPlanDay,
} from '@shared/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface MealPlanState {
  mealPlans: Record<string, MealPlan>;
  isLoading: boolean;
  error: string | null;
  generateMealPlan: (request: GenerateMealPlanRequest) => Promise<string>;
  addMealPlan: (mealPlan: MealPlan) => void;
  updateMealPlan: (id: string, updates: Partial<MealPlan>) => void;
  deleteMealPlan: (id: string) => void;
  updateMealDay: (mealPlanId: string, day: number, dayData: MealPlanDay) => void;
  clearError: () => void;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const useMealPlanStore = create<MealPlanState>()(
  persist(
    (set, _get) => ({
      mealPlans: {},
      isLoading: false,
      error: null,

      generateMealPlan: async (request: GenerateMealPlanRequest) => {
        set({ isLoading: true, error: null });

        try {
          console.log('[MealPlanStore] Generating with:', request);
          const response = await fetch(`${API_BASE_URL}/meal-plans/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // TODO: Add auth token
            },
            body: JSON.stringify(request),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage =
              (errorData as { details?: string }).details || `Server error (${response.status})`;
            throw new Error(errorMessage);
          }

          const data: GenerateMealPlanResponse = await response.json();

          const mealPlan: MealPlan = {
            id: data.id,
            name: data.name,
            duration: data.duration,
            days: data.days,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set((state) => ({
            mealPlans: { ...state.mealPlans, [mealPlan.id]: mealPlan },
            isLoading: false,
          }));

          return mealPlan.id;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to generate meal plan';
          console.error('[MealPlanStore] Error:', message);
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      addMealPlan: (mealPlan) => {
        set((state) => ({
          mealPlans: { ...state.mealPlans, [mealPlan.id]: mealPlan },
        }));
      },

      updateMealPlan: (id, updates) => {
        set((state) => {
          const existing = state.mealPlans[id];
          if (!existing) return state;

          return {
            mealPlans: {
              ...state.mealPlans,
              [id]: {
                ...existing,
                ...updates,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      deleteMealPlan: (id) => {
        set((state) => {
          const { [id]: _, ...rest } = state.mealPlans;
          return { mealPlans: rest };
        });
      },

      updateMealDay: (mealPlanId, day, dayData) => {
        set((state) => {
          const mealPlan = state.mealPlans[mealPlanId];
          if (!mealPlan) return state;

          const updatedDays = mealPlan.days.map((d) => (d.day === day ? dayData : d));

          return {
            mealPlans: {
              ...state.mealPlans,
              [mealPlanId]: {
                ...mealPlan,
                days: updatedDays,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'meal-plan-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ mealPlans: state.mealPlans }),
    }
  )
);
