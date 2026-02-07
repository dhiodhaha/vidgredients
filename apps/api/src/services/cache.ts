import { neon } from '@neondatabase/serverless';

export interface CachedRecipe {
  id: string;
  url: string;
  urlHash: string;
  platform: string;
  title: string;
  thumbnailUrl: string;
  servings: number;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit?: string;
  }>;
  steps: Array<{
    order: number;
    description: string;
    highlightedWords: string[];
  }>;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  // Filter fields
  cookTimeMinutes?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
}

/**
 * Get cached recipe by URL hash
 */
export async function getCachedRecipe(
  databaseUrl: string,
  urlHash: string
): Promise<CachedRecipe | null> {
  const sql = neon(databaseUrl);

  const result = await sql`
    SELECT 
      id,
      url,
      url_hash as "urlHash",
      platform,
      title,
      thumbnail_url as "thumbnailUrl",
      servings,
      ingredients,
      steps,
      nutrition,
      cook_time_minutes as "cookTimeMinutes",
      difficulty,
      is_vegetarian as "isVegetarian",
      is_vegan as "isVegan",
      is_gluten_free as "isGlutenFree"
    FROM recipes
    WHERE url_hash = ${urlHash}
    LIMIT 1
  `;

  if (result.length === 0) {
    return null;
  }

  const row = result[0];

  return {
    id: row.id,
    url: row.url,
    urlHash: row.urlHash,
    platform: row.platform,
    title: row.title,
    thumbnailUrl: row.thumbnailUrl,
    servings: row.servings,
    ingredients: row.ingredients as CachedRecipe['ingredients'],
    steps: row.steps as CachedRecipe['steps'],
    nutrition: row.nutrition as CachedRecipe['nutrition'],
    cookTimeMinutes: row.cookTimeMinutes ?? undefined,
    difficulty: row.difficulty ?? undefined,
    isVegetarian: row.isVegetarian ?? false,
    isVegan: row.isVegan ?? false,
    isGlutenFree: row.isGlutenFree ?? false,
  };
}

interface RecipeData {
  url: string;
  urlHash: string;
  platform: string;
  title: string;
  thumbnailUrl: string;
  servings: number;
  ingredients: CachedRecipe['ingredients'];
  steps: CachedRecipe['steps'];
  nutrition?: CachedRecipe['nutrition'];
  rawTranscript: string;
  // Filter fields
  cookTimeMinutes?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
}

/**
 * Cache recipe in database
 */
export async function cacheRecipe(databaseUrl: string, data: RecipeData): Promise<CachedRecipe> {
  const sql = neon(databaseUrl);

  const result = await sql`
    INSERT INTO recipes (
      url,
      url_hash,
      platform,
      title,
      thumbnail_url,
      servings,
      ingredients,
      steps,
      nutrition,
      raw_transcript,
      cook_time_minutes,
      difficulty,
      is_vegetarian,
      is_vegan,
      is_gluten_free
    ) VALUES (
      ${data.url},
      ${data.urlHash},
      ${data.platform},
      ${data.title},
      ${data.thumbnailUrl},
      ${data.servings},
      ${JSON.stringify(data.ingredients)},
      ${JSON.stringify(data.steps)},
      ${data.nutrition ? JSON.stringify(data.nutrition) : null},
      ${data.rawTranscript},
      ${data.cookTimeMinutes ?? null},
      ${data.difficulty ?? null},
      ${data.isVegetarian ?? false},
      ${data.isVegan ?? false},
      ${data.isGlutenFree ?? false}
    )
    RETURNING 
      id,
      url,
      url_hash as "urlHash",
      platform,
      title,
      thumbnail_url as "thumbnailUrl",
      servings,
      ingredients,
      steps,
      nutrition,
      cook_time_minutes as "cookTimeMinutes",
      difficulty,
      is_vegetarian as "isVegetarian",
      is_vegan as "isVegan",
      is_gluten_free as "isGlutenFree"
  `;

  const row = result[0];

  return {
    id: row.id,
    url: row.url,
    urlHash: row.urlHash,
    platform: row.platform,
    title: row.title,
    thumbnailUrl: row.thumbnailUrl,
    servings: row.servings,
    ingredients: row.ingredients as CachedRecipe['ingredients'],
    steps: row.steps as CachedRecipe['steps'],
    nutrition: row.nutrition as CachedRecipe['nutrition'],
    cookTimeMinutes: row.cookTimeMinutes ?? undefined,
    difficulty: row.difficulty ?? undefined,
    isVegetarian: row.isVegetarian ?? false,
    isVegan: row.isVegan ?? false,
    isGlutenFree: row.isGlutenFree ?? false,
  };
}
