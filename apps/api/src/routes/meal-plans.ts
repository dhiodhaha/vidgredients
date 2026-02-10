import { zValidator } from '@hono/zod-validator';
import { neon } from '@neondatabase/serverless';
import type { GenerateMealPlanRequest, GenerateMealPlanResponse } from '@repo/shared';
import { Hono } from 'hono';
import { z } from 'zod';
import {
  generateMealPlanWithGPT,
  optimizeMealPlanWithGPT,
  saveMealPlan,
} from '../services/meal-plan';

type Bindings = {
  DATABASE_URL: string;
  OPENAI_API_KEY: string;
};

const generateSchema = z.object({
  recipeIds: z.array(z.string()).min(1),
  duration: z.number().int().min(1).max(30),
  preferences: z
    .object({
      vegetarian: z.boolean().optional(),
      vegan: z.boolean().optional(),
      glutenFree: z.boolean().optional(),
      maxCookTime: z.number().optional(),
    })
    .optional(),
}) satisfies z.ZodType<GenerateMealPlanRequest>;

export const mealPlans = new Hono<{ Bindings: Bindings }>();

mealPlans.post('/generate', zValidator('json', generateSchema), async (c) => {
  const { recipeIds, duration, preferences } = c.req.valid('json');

  try {
    // Fetch recipes from database
    const sql = neon(c.env.DATABASE_URL);
    const result = await sql`
      SELECT
        id,
        title,
        cook_time_minutes as "cookTimeMinutes",
        difficulty,
        is_vegetarian as "isVegetarian",
        is_vegan as "isVegan",
        is_gluten_free as "isGlutenFree"
      FROM recipes
      WHERE id = ANY(${recipeIds}::uuid[])
    `;

    // Define a minimal type for what we need
    type DbRecipe = {
      id: string;
      title: string;
      cookTimeMinutes?: number;
      difficulty?: string;
      isVegetarian?: boolean;
      isVegan?: boolean;
      isGlutenFree?: boolean;
    };

    const recipes = result as unknown as DbRecipe[];

    if (recipes.length === 0) {
      return c.json(
        {
          error: 'No recipes found',
          details: 'The specified recipe IDs do not exist',
        },
        404
      );
    }

    // Filter recipes by preferences
    const filteredRecipes = recipes.filter((recipe) => {
      if (preferences?.vegetarian && !recipe.isVegetarian) return false;
      if (preferences?.vegan && !recipe.isVegan) return false;
      if (preferences?.glutenFree && !recipe.isGlutenFree) return false;
      if (
        preferences?.maxCookTime &&
        recipe.cookTimeMinutes &&
        recipe.cookTimeMinutes > preferences.maxCookTime
      ) {
        return false;
      }
      return true;
    });

    if (filteredRecipes.length === 0) {
      return c.json(
        {
          error: 'No recipes match preferences',
          details: 'No recipes found that match the specified dietary preferences',
        },
        400
      );
    }
    const initialMealPlan = await generateMealPlanWithGPT(
      c.env.OPENAI_API_KEY,
      filteredRecipes.map((r: { id: string }) => r.id),
      filteredRecipes,
      duration,
      preferences
    );

    // AI Step 2: Optimize the plan
    const optimizedMealPlan = await optimizeMealPlanWithGPT(
      c.env.OPENAI_API_KEY,
      initialMealPlan,
      filteredRecipes
    );

    const mealPlan = await saveMealPlan(c.env.DATABASE_URL, {
      name: `${duration}-Day Meal Plan`,
      description: 'AI Optimized Meal Plan',
      duration,
      days: optimizedMealPlan,
    });

    const response: GenerateMealPlanResponse = {
      id: mealPlan.id,
      name: mealPlan.name,
      duration: mealPlan.duration,
      days: mealPlan.days,
    };

    return c.json(response);
  } catch (error) {
    console.error('[meal-plans] Error:', error);

    return c.json(
      {
        error: 'Failed to generate meal plan',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});
