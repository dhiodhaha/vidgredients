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
      nutrition
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
      raw_transcript
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
      ${data.rawTranscript}
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
      nutrition
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
  };
}
