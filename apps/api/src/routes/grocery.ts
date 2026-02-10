import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

type Bindings = {
  OPENAI_API_KEY: string;
};

const smartMergeSchema = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      quantity: z.number(),
      unit: z.string().optional(),
    })
  ),
});

export const grocery = new Hono<{ Bindings: Bindings }>();

grocery.post('/smart-merge', zValidator('json', smartMergeSchema), async (c) => {
  const { items } = c.req.valid('json');

  if (items.length === 0) {
    return c.json({ items: [] });
  }

  try {
    const itemList = items
      .map((i, idx) => `${idx + 1}. ${i.quantity}${i.unit ? ` ${i.unit}` : ''} ${i.name}`)
      .join('\n');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${c.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are a smart grocery list optimizer. Given a list of ingredients:
1. Merge duplicates intelligently (e.g. "garlic cloves" and "minced garlic" → "garlic", "soy sauce" and "light soy sauce" → "soy sauce")
2. Combine quantities when merging (sum them up). When units differ, pick the most practical unit and convert.
3. Categorize each item into exactly one of: "Produce", "Meat & Seafood", "Dairy & Eggs", "Pantry", "Spices & Seasonings", "Grains & Bread", "Frozen", "Beverages", "Other"
4. Use clean, display-friendly names (capitalize properly, no redundancy)

Respond with JSON: { "items": [{ "name": "...", "quantity": number, "unit": "..." or null, "category": "..." }] }
Sort items by category grouping. Be accurate with quantities — never drop items, only merge true duplicates.`,
          },
          {
            role: 'user',
            content: `Here is my grocery list:\n${itemList}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data: {
      choices: { message: { content: string } }[];
    } = await response.json();

    const parsed = JSON.parse(data.choices[0].message.content);

    return c.json(parsed);
  } catch (error) {
    console.error('[grocery/smart-merge] Error:', error);
    return c.json(
      {
        error: 'Failed to optimize grocery list',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});
