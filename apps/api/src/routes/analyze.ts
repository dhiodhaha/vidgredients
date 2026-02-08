import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { hashUrl } from '../lib/utils';
import { cacheRecipe, getCachedRecipe } from '../services/cache';
import { parseTranscript } from '../services/parser';
import { extractTranscript } from '../services/scraper';
import { getRecipeThumbnail, type RecipeCategory } from '../services/image';

type Bindings = {
  DATABASE_URL: string;
  OPENAI_API_KEY: string;
  SCRAPECREATORS_API_KEY: string;
  UNSPLASH_ACCESS_KEY?: string;
};

const analyzeSchema = z.object({
  url: z.string().url(),
  language: z.string().length(2).optional().default('en'),
});

export const analyze = new Hono<{ Bindings: Bindings }>();

analyze.post('/', zValidator('json', analyzeSchema), async (c) => {
  const { url, language } = c.req.valid('json');
  const urlHash = hashUrl(url);

  try {
    // Step 1: Check cache
    const cached = await getCachedRecipe(c.env.DATABASE_URL, urlHash);

    if (cached) {
      return c.json({
        id: cached.id,
        title: cached.title,
        platform: cached.platform,
        thumbnailUrl: cached.thumbnailUrl,
        servings: cached.servings,
        ingredients: cached.ingredients,
        steps: cached.steps,
        nutrition: cached.nutrition,
        cookTimeMinutes: cached.cookTimeMinutes,
        difficulty: cached.difficulty,
        isVegetarian: cached.isVegetarian,
        isVegan: cached.isVegan,
        isGlutenFree: cached.isGlutenFree,
        category: cached.category,
        cached: true,
      });
    }

    // Step 2: Extract transcript using Scrapecreators API
    const transcriptData = await extractTranscript(url, c.env.SCRAPECREATORS_API_KEY, language);

    // Step 3: Parse transcript using GPT-5.2
    const parsedRecipe = await parseTranscript(transcriptData.transcript, c.env.OPENAI_API_KEY);

    // Step 4: Get high-quality thumbnail from Unsplash (or fallback)
    const thumbnailUrl = await getRecipeThumbnail(
      parsedRecipe.title,
      parsedRecipe.category as RecipeCategory,
      c.env.UNSPLASH_ACCESS_KEY,
      parsedRecipe.thumbnailQuery // AI-extracted clean search term for accuracy
    );

    // Step 5: Cache the result
    const recipe = await cacheRecipe(c.env.DATABASE_URL, {
      url,
      urlHash,
      platform: transcriptData.platform,
      title: transcriptData.title ?? parsedRecipe.title,
      thumbnailUrl: thumbnailUrl,
      servings: parsedRecipe.servings,
      ingredients: parsedRecipe.ingredients.map((i) => ({
        ...i,
        unit: i.unit ?? undefined,
      })),
      steps: parsedRecipe.steps,
      nutrition: parsedRecipe.nutrition
        ? {
            calories: parsedRecipe.nutrition.calories ?? undefined,
            protein: parsedRecipe.nutrition.protein ?? undefined,
            carbs: parsedRecipe.nutrition.carbs ?? undefined,
            fat: parsedRecipe.nutrition.fat ?? undefined,
          }
        : undefined,
      rawTranscript: transcriptData.transcript,
      // Filter fields from AI extraction
      cookTimeMinutes: parsedRecipe.cookTimeMinutes ?? undefined,
      difficulty: parsedRecipe.difficulty ?? undefined,
      isVegetarian: parsedRecipe.isVegetarian,
      isVegan: parsedRecipe.isVegan,
      isGlutenFree: parsedRecipe.isGlutenFree,
      category: parsedRecipe.category,
    });

    return c.json({
      id: recipe.id,
      title: recipe.title,
      platform: recipe.platform,
      thumbnailUrl: recipe.thumbnailUrl,
      servings: recipe.servings,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      nutrition: recipe.nutrition,
      cookTimeMinutes: recipe.cookTimeMinutes,
      difficulty: recipe.difficulty,
      isVegetarian: recipe.isVegetarian,
      isVegan: recipe.isVegan,
      isGlutenFree: recipe.isGlutenFree,
      category: recipe.category,
      cached: false,
    });
  } catch (error) {
    console.error('Analysis failed:', error);

    return c.json(
      {
        error: 'Failed to analyze video',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});
