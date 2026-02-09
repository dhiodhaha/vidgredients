import type { GenerateMealPlanRequest } from '@shared/types';
import { useCallback } from 'react';
import { useMealPlanStore } from '../stores/mealPlan';
import { useRecipeStore } from '../stores/recipe';

export interface MealPlanGenerationOptions {
  duration?: number; // Default 7 days
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  maxCookTime?: number;
}

export function useMealPlanGeneration() {
  const { generateMealPlan } = useMealPlanStore();
  const { recipes } = useRecipeStore();

  const generate = useCallback(
    async (recipeIds?: string[], options?: MealPlanGenerationOptions) => {
      // Use all recipes if not specified
      const selectedRecipeIds = recipeIds || Object.keys(recipes);

      if (selectedRecipeIds.length === 0) {
        throw new Error('No recipes available to generate meal plan');
      }

      const request: GenerateMealPlanRequest = {
        recipeIds: selectedRecipeIds,
        duration: options?.duration ?? 7,
        preferences: {
          vegetarian: options?.vegetarian,
          vegan: options?.vegan,
          glutenFree: options?.glutenFree,
          maxCookTime: options?.maxCookTime,
        },
      };

      return generateMealPlan(request);
    },
    [generateMealPlan, recipes]
  );

  const generateForAllRecipes = useCallback(
    (options?: MealPlanGenerationOptions) => {
      return generate(undefined, options);
    },
    [generate]
  );

  const generateForFilteredRecipes = useCallback(
    (
      filter: (recipe: (typeof recipes)[string]) => boolean,
      options?: MealPlanGenerationOptions
    ) => {
      const filtered = Object.entries(recipes)
        .filter(([_, recipe]) => filter(recipe))
        .map(([id]) => id);

      return generate(filtered, options);
    },
    [generate, recipes]
  );

  return {
    generate,
    generateForAllRecipes,
    generateForFilteredRecipes,
  };
}
