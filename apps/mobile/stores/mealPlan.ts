import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  GenerateMealPlanRequest,
  GenerateMealPlanResponse,
  MealPlan,
  MealPlanDay,
} from '@shared/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type MealType = 'breakfast' | 'lunch' | 'dinner';

interface MealPlanState {
  mealPlans: Record<string, MealPlan>;
  currentPlanId: string | null;
  isLoading: boolean;
  error: string | null;
  generateMealPlan: (request: GenerateMealPlanRequest) => Promise<string>;
  addMealPlan: (mealPlan: MealPlan) => void;
  updateMealPlan: (id: string, updates: Partial<MealPlan>) => void;
  deleteMealPlan: (id: string) => void;
  setCurrentPlan: (id: string | null) => void;
  setMealForDay: (
    planId: string,
    day: number,
    mealType: MealType,
    recipeId: string,
    servings: number
  ) => void;
  removeMealFromDay: (planId: string, day: number, mealType: MealType) => void;
  updateMealDay: (mealPlanId: string, day: number, dayData: MealPlanDay) => void;
  clearError: () => void;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const useMealPlanStore = create<MealPlanState>()(
  persist(
    (set, _get) => ({
      mealPlans: {},
      currentPlanId: null,
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
            currentPlanId: mealPlan.id,
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
          const nextPlanId =
            state.currentPlanId === id
              ? (Object.keys(rest).sort((a, b) => {
                  const planA = rest[a];
                  const planB = rest[b];
                  return (planB?.createdAt ?? '').localeCompare(planA?.createdAt ?? '');
                })[0] ?? null)
              : state.currentPlanId;
          return { mealPlans: rest, currentPlanId: nextPlanId };
        });
      },

      setCurrentPlan: (id) => {
        set({ currentPlanId: id });
      },

      setMealForDay: (planId, day, mealType, recipeId, servings) => {
        set((state) => {
          const plan = state.mealPlans[planId];
          if (!plan) return state;

          const updatedDays = plan.days.map((d) => {
            if (d.day !== day) return d;
            return { ...d, [mealType]: { recipeId, servings } };
          });

          return {
            mealPlans: {
              ...state.mealPlans,
              [planId]: {
                ...plan,
                days: updatedDays,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      removeMealFromDay: (planId, day, mealType) => {
        set((state) => {
          const plan = state.mealPlans[planId];
          if (!plan) return state;

          const updatedDays = plan.days.map((d) => {
            if (d.day !== day) return d;
            const updated = { ...d };
            delete updated[mealType];
            return updated;
          });

          return {
            mealPlans: {
              ...state.mealPlans,
              [planId]: {
                ...plan,
                days: updatedDays,
                updatedAt: new Date().toISOString(),
              },
            },
          };
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
      partialize: (state) => ({
        mealPlans: state.mealPlans,
        currentPlanId: state.currentPlanId,
      }),
    }
  )
);
