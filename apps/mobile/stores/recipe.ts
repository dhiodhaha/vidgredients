import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Re-export types from shared
export type {
  Ingredient,
  Step,
  Nutrition,
  Recipe,
  RecipeFilters,
  AnalyzeRequest,
  AnalyzeResponse,
} from '@shared/types';

interface RecipeState {
  recipes: Record<string, Recipe>;
  isLoading: boolean;
  error: string | null;
  analyzeVideo: (url: string) => Promise<string>;
  addRecipe: (recipe: Recipe) => void;
  clearError: () => void;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

// ... existing interfaces ...

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, _get) => ({
      recipes: {},
      isLoading: false,
      error: null,

      analyzeVideo: async (url: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`${API_BASE_URL}/analyze`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // TODO: Add auth token
            },
            body: JSON.stringify({ url }),
          });

          if (!response.ok) {
            throw new Error('Failed to analyze video');
          }

          const data = await response.json();

          const recipe: Recipe = {
            id: data.id,
            url: url,
            platform: data.platform,
            title: data.title,
            thumbnailUrl: data.thumbnailUrl,
            servings: data.servings ?? 4,
            ingredients: data.ingredients.map(
              (
                ing: { name: string; quantity: number; unit: string; imageUrl?: string },
                idx: number
              ) => ({
                id: `ing-${idx}`,
                name: ing.name,
                quantity: ing.quantity,
                unit: ing.unit,
                imageUrl: ing.imageUrl,
              })
            ),
            steps: data.steps.map(
              (step: { order: number; description: string; highlightedWords?: string[] }) => ({
                order: step.order,
                description: step.description,
                highlightedWords: step.highlightedWords ?? [],
              })
            ),
            nutrition: data.nutrition,
            // Filter fields from API
            cookTimeMinutes: data.cookTimeMinutes,
            difficulty: data.difficulty,
            isVegetarian: data.isVegetarian ?? false,
            isVegan: data.isVegan ?? false,
            isGlutenFree: data.isGlutenFree ?? false,
            category: data.category,
          };

          set((state) => ({
            recipes: { ...state.recipes, [recipe.id]: recipe },
            isLoading: false,
          }));

          return recipe.id;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      addRecipe: (recipe) => {
        set((state) => ({
          recipes: { ...state.recipes, [recipe.id]: recipe },
        }));
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'recipe-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ recipes: state.recipes }),
    }
  )
);
