import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GroceryCategory, GroceryItem, Ingredient, MealPlan, Recipe } from '@shared/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

interface GroceryState {
  items: GroceryItem[];
  isOptimizing: boolean;
  addFromRecipes: (recipes: Recipe[]) => void;
  addFromMealPlan: (mealPlan: MealPlan, recipes: Record<string, Recipe>) => void;
  smartMerge: () => Promise<void>;
  toggleItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearChecked: () => void;
  clearAll: () => void;
}

const CATEGORY_EMOJI: Record<GroceryCategory, string> = {
  Produce: '🥬',
  'Meat & Seafood': '🥩',
  'Dairy & Eggs': '🥛',
  Pantry: '🫙',
  'Spices & Seasonings': '🧂',
  'Grains & Bread': '🍞',
  Frozen: '🧊',
  Beverages: '🥤',
  Other: '📦',
};

export { CATEGORY_EMOJI };

function aggregateIngredients(
  ingredients: { ingredient: Ingredient; recipeId: string }[],
  existingItems: GroceryItem[]
): GroceryItem[] {
  const merged = new Map<string, GroceryItem>();

  for (const item of existingItems) {
    merged.set(item.name.toLowerCase(), { ...item });
  }

  for (const { ingredient, recipeId } of ingredients) {
    const key = ingredient.name.toLowerCase();
    const existing = merged.get(key);
    const qty = Number.parseFloat(String(ingredient.quantity)) || 1;

    if (existing) {
      existing.quantity += qty;
      if (!existing.recipeIds.includes(recipeId)) {
        existing.recipeIds.push(recipeId);
      }
    } else {
      merged.set(key, {
        id: `grocery-${key}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: ingredient.name,
        quantity: qty,
        unit: ingredient.unit,
        checked: false,
        recipeIds: [recipeId],
      });
    }
  }

  return Array.from(merged.values());
}

export const useGroceryStore = create<GroceryState>()(
  persist(
    (set, get) => ({
      items: [],
      isOptimizing: false,

      addFromRecipes: (recipes: Recipe[]) => {
        const ingredients: { ingredient: Ingredient; recipeId: string }[] = [];
        for (const recipe of recipes) {
          for (const ing of recipe.ingredients) {
            ingredients.push({ ingredient: ing, recipeId: recipe.id });
          }
        }

        set((state) => ({
          items: aggregateIngredients(ingredients, state.items),
        }));
      },

      addFromMealPlan: (mealPlan: MealPlan, recipes: Record<string, Recipe>) => {
        const ingredients: { ingredient: Ingredient; recipeId: string }[] = [];

        for (const day of mealPlan.days) {
          const meals = [day.breakfast, day.lunch, day.dinner];
          for (const meal of meals) {
            if (meal) {
              const recipe = recipes[meal.recipeId];
              if (recipe) {
                for (const ing of recipe.ingredients) {
                  ingredients.push({ ingredient: ing, recipeId: recipe.id });
                }
              }
            }
          }

          if (day.snacks) {
            for (const snack of day.snacks) {
              const recipe = recipes[snack.recipeId];
              if (recipe) {
                for (const ing of recipe.ingredients) {
                  ingredients.push({ ingredient: ing, recipeId: recipe.id });
                }
              }
            }
          }
        }

        set((state) => ({
          items: aggregateIngredients(ingredients, state.items),
        }));
      },

      smartMerge: async () => {
        const { items } = get();
        const unchecked = items.filter((i) => !i.checked);
        const checked = items.filter((i) => i.checked);

        if (unchecked.length === 0) return;

        set({ isOptimizing: true });

        try {
          const response = await fetch(`${API_BASE_URL}/grocery/smart-merge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: unchecked.map((i) => ({
                name: i.name,
                quantity: i.quantity,
                unit: i.unit,
              })),
            }),
          });

          if (!response.ok) {
            throw new Error(`Server error (${response.status})`);
          }

          const data: {
            items: { name: string; quantity: number; unit?: string; category?: GroceryCategory }[];
          } = await response.json();

          const now = Date.now();
          const optimized: GroceryItem[] = data.items.map((item, idx) => ({
            id: `grocery-${item.name.toLowerCase()}-${now}-${idx}`,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit ?? undefined,
            checked: false,
            recipeIds: [],
            category: item.category,
          }));

          set({ items: [...optimized, ...checked], isOptimizing: false });
        } catch (error) {
          console.error('[GroceryStore] Smart merge failed:', error);
          set({ isOptimizing: false });
        }
      },

      toggleItem: (id: string) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, checked: !item.checked } : item
          ),
        }));
      },

      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      clearChecked: () => {
        set((state) => ({
          items: state.items.filter((item) => !item.checked),
        }));
      },

      clearAll: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'grocery-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Deduplicate items by name (fixes legacy data with colliding IDs)
          const seen = new Map<string, GroceryItem>();
          for (const item of state.items) {
            const key = item.name.toLowerCase();
            const existing = seen.get(key);
            if (existing) {
              // Merge quantities and keep the checked state
              existing.quantity += item.quantity;
              existing.recipeIds = [...new Set([...existing.recipeIds, ...item.recipeIds])];
            } else {
              seen.set(key, {
                ...item,
                id: `grocery-${key}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              });
            }
          }
          state.items = Array.from(seen.values());
        }
      },
    }
  )
);
