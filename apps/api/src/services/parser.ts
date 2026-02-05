import OpenAI from 'openai';
import { z } from 'zod';

const ingredientSchema = z.object({
  name: z.string(),
  quantity: z.string(),
  unit: z.string().optional(),
});

const stepSchema = z.object({
  order: z.number(),
  description: z.string(),
  highlightedWords: z.array(z.string()),
});

const nutritionSchema = z.object({
  calories: z.number().optional(),
  protein: z.number().optional(),
  carbs: z.number().optional(),
  fat: z.number().optional(),
});

const recipeSchema = z.object({
  title: z.string(),
  servings: z.number(),
  ingredients: z.array(ingredientSchema),
  steps: z.array(stepSchema),
  nutrition: nutritionSchema.optional(),
});

export type ParsedRecipe = z.infer<typeof recipeSchema>;

const SYSTEM_PROMPT = `You are a culinary expert assistant that extracts recipe information from cooking video transcripts.

Given a transcript from a cooking video, extract:
1. Title: A descriptive name for the recipe
2. Servings: Number of portions the recipe makes (default to 4 if not mentioned)
3. Ingredients: List of all ingredients with quantities and units
4. Steps: Ordered cooking instructions with ingredient references highlighted
5. Nutrition (optional): Estimated nutritional information if mentioned

For each step, identify and list ingredient names mentioned in the description as "highlightedWords".

Respond in JSON format matching this structure:
{
  "title": "Recipe Name",
  "servings": 4,
  "ingredients": [
    { "name": "chicken breast", "quantity": "500", "unit": "g" }
  ],
  "steps": [
    { 
      "order": 1, 
      "description": "Season the chicken breast with salt and pepper.", 
      "highlightedWords": ["chicken breast", "salt", "pepper"] 
    }
  ],
  "nutrition": {
    "calories": 350,
    "protein": 30,
    "carbs": 20,
    "fat": 15
  }
}

Be thorough but concise. Extract exact quantities when mentioned, use reasonable estimates if unclear.`;

/**
 * Parse transcript using GPT-5.2 with structured output
 */
export async function parseTranscript(transcript: string, apiKey: string): Promise<ParsedRecipe> {
  const openai = new OpenAI({ apiKey });

  const response = await openai.chat.completions.create({
    model: 'gpt-5.2',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Extract the recipe from this cooking video transcript:\n\n${transcript}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No response from GPT');
  }

  try {
    const parsed = JSON.parse(content);
    return recipeSchema.parse(parsed);
  } catch (error) {
    throw new Error(
      `Failed to parse GPT response: ${error instanceof Error ? error.message : 'Invalid JSON'}`
    );
  }
}
