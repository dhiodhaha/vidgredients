import OpenAI from 'openai';
import { z } from 'zod';

const ingredientSchema = z.object({
  name: z.string(),
  quantity: z.string(),
  unit: z.string().nullable().optional(),
});

const stepSchema = z.object({
  order: z.number(),
  description: z.string(),
  highlightedWords: z.array(z.string()),
});

const nutritionSchema = z.object({
  calories: z.number().nullable().optional(),
  protein: z.number().nullable().optional(),
  carbs: z.number().nullable().optional(),
  fat: z.number().nullable().optional(),
});

const recipeSchema = z.object({
  title: z.string(),
  servings: z.number(),
  ingredients: z.array(ingredientSchema),
  steps: z.array(stepSchema),
  nutrition: nutritionSchema.nullable().optional(),
  // Filter fields - AI estimates these from transcript analysis
  cookTimeMinutes: z.number().nullable().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).nullable().optional(),
  isVegetarian: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  category: z
    .enum([
      'Pasta',
      'Salad',
      'Soup',
      'Dessert',
      'Meat',
      'Seafood',
      'Breakfast',
      'Drink',
      'Main Course',
      'Appetizer',
      'Snack',
      'Bread',
      'Vegetarian', // Specific category if it's the main focus
    ])
    .default('Main Course'),
  // Clean search term for thumbnail image search (1-3 words)
  thumbnailQuery: z.string().optional(),
});

export type ParsedRecipe = z.infer<typeof recipeSchema>;

const SYSTEM_PROMPT = `You are a culinary expert assistant that extracts recipe information from cooking video transcripts.

Given a transcript from a cooking video, extract:
1. Title: A descriptive name for the recipe
2. Servings: Number of portions the recipe makes (default to 4 if not mentioned)
3. Ingredients: List of all ingredients with quantities and units
4. Steps: Ordered cooking instructions with ingredient references highlighted
5. Nutrition (optional): Estimated nutritional information if mentioned
6. Cook Time: Estimate total cooking time in minutes based on steps described
7. Difficulty: Assess as "easy" (1-5 simple steps, common ingredients), "medium" (6-10 steps, some technique required), or "hard" (complex techniques, many steps)
8. Dietary Info: Analyze ingredients to determine:
   - isVegetarian: true if no meat/fish
   - isVegan: true if no animal products (meat, dairy, eggs, honey)
   - isGlutenFree: true if no wheat, barley, rye, or gluten-containing ingredients
9. Category: Choose the most appropriate category from: Pasta, Salad, Soup, Dessert, Meat, Seafood, Breakfast, Drink, Main Course, Appetizer, Snack, Bread, Vegetarian.
10. Thumbnail Query: Provide a 1-3 word search term optimized for food photography databases.
   - Focus on the PRIMARY food item (e.g., "toast", "chicken", "cake", "noodles")
   - Add ONE KEY descriptor if helpful (e.g., "grilled chicken", "chocolate cake", "egg sandwich")
   - AVOID ambiguous words with non-food meanings: "street" (roads/cars), "garden" (plants), "country" (landscapes), "home" (houses)
   - For street food, use the dish name instead (e.g., "toast sandwich" NOT "street toast")
   - Examples: "bulgogi", "pad thai", "tiramisu", "egg sandwich", "fried chicken"

For each step, identify and list ingredient names mentioned in the description as "highlightedWords".

Respond in JSON format matching this structure:
{
  "title": "Recipe Name",
  "servings": 4,
  "cookTimeMinutes": 25,
  "difficulty": "easy",
  "isVegetarian": false,
  "isVegan": false,
  "isGlutenFree": true,
  "category": "Main Course",
  "thumbnailQuery": "grilled chicken",
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
    max_completion_tokens: 4096,
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
