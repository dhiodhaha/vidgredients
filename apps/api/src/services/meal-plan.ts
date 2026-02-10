import { neon } from '@neondatabase/serverless';
import type { MealPlan, MealPlanDay } from '@repo/shared';

export async function saveMealPlan(
  databaseUrl: string,
  mealPlan: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>
): Promise<MealPlan> {
  const sql = neon(databaseUrl);

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await sql`
    INSERT INTO meal_plans (id, name, description, duration, days, created_at, updated_at)
    VALUES (
      ${id},
      ${mealPlan.name},
      ${mealPlan.description || null},
      ${mealPlan.duration},
      ${JSON.stringify(mealPlan.days)},
      ${now},
      ${now}
    )
  `;

  return {
    ...mealPlan,
    id,
    createdAt: now,
    updatedAt: now,
  };
}

export async function getMealPlan(databaseUrl: string, id: string): Promise<MealPlan | null> {
  const sql = neon(databaseUrl);

  const result = await sql`
    SELECT
      id,
      name,
      description,
      duration,
      days,
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM meal_plans
    WHERE id = ${id}
    LIMIT 1
  `;

  if (result.length === 0) {
    return null;
  }

  const row = result[0];
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    duration: row.duration,
    days: row.days,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Generate a meal plan using GPT
 * Distributes recipes across days and meals
 */
export async function generateMealPlanWithGPT(
  openaiKey: string,
  _recipeIds: string[],
  recipes: Array<{
    id: string;
    title: string;
    cookTimeMinutes?: number;
    difficulty?: string;
  }>,
  duration: number,
  _preferences?: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    maxCookTime?: number;
  }
): Promise<MealPlanDay[]> {
  if (!openaiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  if (recipes.length === 0) {
    throw new Error('No recipes available to generate meal plan');
  }

  // Create a simpler, more reliable prompt
  const recipeList = recipes.map((r) => `${r.id}:${r.title}`).join('\n');

  const prompt = `Create a ${duration}-day meal plan using these recipes (use exact recipe IDs):
${recipeList}

Return ONLY valid JSON (no markdown) with this structure for each of ${duration} days:
[{"day":1,"breakfast":{"recipeId":"<id>","servings":1},"lunch":{"recipeId":"<id>","servings":1},"dinner":{"recipeId":"<id>","servings":1},"snacks":[]}]`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 1500,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GPT] API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as { choices: Array<{ message: { content: string } }> };
    const content = data.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('No response from GPT');
    }

    // Extract JSON from response (in case it includes markdown)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const jsonContent = jsonMatch ? jsonMatch[0] : content;

    const mealPlanDays: MealPlanDay[] = JSON.parse(jsonContent);

    if (!Array.isArray(mealPlanDays) || mealPlanDays.length !== duration) {
      throw new Error(`Expected ${duration} days, got ${mealPlanDays.length}`);
    }

    return mealPlanDays;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('GPT request timeout (30s)');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Optimize an existing meal plan using GPT
 * Focus on ingredient reuse (grocery efficiency), nutritional balance, and variety
 */
export async function optimizeMealPlanWithGPT(
  openaiKey: string,
  currentPlan: MealPlanDay[],
  recipes: Array<{
    id: string;
    title: string;
    cookTimeMinutes?: number;
    difficulty?: string;
  }>
): Promise<MealPlanDay[]> {
  if (!openaiKey) throw new Error('OpenAI API key is not configured');
  if (recipes.length === 0) throw new Error('No recipes available for optimization');

  const recipeList = recipes.map((r) => `${r.id}:${r.title}`).join('\n');
  const currentPlanJson = JSON.stringify(currentPlan);

  const prompt = `Here is a preliminary ${currentPlan.length}-day meal plan and a list of available recipes.
  
CURRENT PLAN:
${currentPlanJson}

AVAILABLE RECIPES:
${recipeList}

TASK:
Optimize this meal plan for:
1. Grocery Efficiency: Reuse ingredients across days (e.g. if a recipe uses cilantro on Day 1, try to use another cilantro recipe on Day 3).
2. Variety: Ensure protein sources and flavors are varied across the week.
3. Balance: Avoid heavy meals for both Lunch and Dinner on the same day if possible.

You may swap recipes with others from the AVAILABLE RECIPES list.
The structure must remain EXACTLY the same (Day X, Breakfast/Lunch/Dinner/Snacks).

Return ONLY valid JSON (no markdown) with this structure for each of the ${currentPlan.length} days:
[{"day":1,"breakfast":{"recipeId":"<id>","servings":1},"lunch":{"recipeId":"<id>","servings":1},"dinner":{"recipeId":"<id>","servings":1},"snacks":[]}]`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for optimization

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.4, // Lower temperature for more focused optimization
        max_tokens: 2000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GPT-Optimize] API error:', response.status, errorText);
      // Fallback: return the original plan if optimization fails
      console.warn('Optimization failed, returning original plan');
      return currentPlan;
    }

    const data = (await response.json()) as { choices: Array<{ message: { content: string } }> };
    const content = data.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('No response from GPT during optimization');
    }

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const jsonContent = jsonMatch ? jsonMatch[0] : content;

    const optimizedPlan: MealPlanDay[] = JSON.parse(jsonContent);

    if (!Array.isArray(optimizedPlan) || optimizedPlan.length !== currentPlan.length) {
      console.warn('Optimized plan has invalid length, returning original');
      return currentPlan;
    }

    return optimizedPlan;
  } catch (error) {
    console.error('[GPT-Optimize] Error:', error);
    // Fallback on error
    return currentPlan;
  } finally {
    clearTimeout(timeoutId);
  }
}

