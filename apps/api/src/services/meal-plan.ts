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
  recipeIds: string[],
  recipes: Array<{
    id: string;
    title: string;
    cookTimeMinutes?: number;
    difficulty?: string;
  }>,
  duration: number,
  preferences?: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    maxCookTime?: number;
  }
): Promise<MealPlanDay[]> {
  const prompt = `You are a meal planning expert. Create a diverse ${duration}-day meal plan using the following recipes.

Available Recipes:
${recipes.map((r) => `- ${r.title} (${r.cookTimeMinutes || 'N/A'} min, ${r.difficulty || 'N/A'})`).join('\n')}

Requirements:
- Each day needs breakfast, lunch, and dinner
- Vary the recipes throughout the plan
- Avoid repeating the same recipe on consecutive days when possible
- Consider nutritional variety
${preferences?.maxCookTime ? `- Prefer recipes with max ${preferences.maxCookTime} min cook time` : ''}
${preferences?.vegetarian ? '- All recipes should be vegetarian' : ''}
${preferences?.vegan ? '- All recipes should be vegan' : ''}

Return ONLY a JSON array (no markdown, no code blocks) with ${duration} objects. Each object must have this exact structure:
{
  "day": <number 1-${duration}>,
  "breakfast": { "recipeId": "<recipe-id>", "servings": <number> },
  "lunch": { "recipeId": "<recipe-id>", "servings": <number> },
  "dinner": { "recipeId": "<recipe-id>", "servings": <number> },
  "snacks": [{ "recipeId": "<recipe-id>", "servings": <number> }]
}

Use recipe IDs from this list: ${recipeIds.join(', ')}`;

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
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`GPT API error: ${response.statusText}`);
  }

  const data = (await response.json()) as { choices: Array<{ message: { content: string } }> };
  const content = data.choices[0].message.content.trim();

  // Parse the JSON array
  const mealPlanDays: MealPlanDay[] = JSON.parse(content);

  return mealPlanDays;
}
