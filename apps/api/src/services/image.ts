export type RecipeCategory =
  | 'Pasta'
  | 'Salad'
  | 'Soup'
  | 'Dessert'
  | 'Meat'
  | 'Seafood'
  | 'Breakfast'
  | 'Drink'
  | 'Main Course'
  | 'Appetizer'
  | 'Snack'
  | 'Bread'
  | 'Vegetarian';

const CATEGORY_FALLBACKS: Record<RecipeCategory, string> = {
  Pasta:
    'https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=800&auto=format&fit=crop',
  Salad:
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
  Soup: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800&auto=format&fit=crop',
  Dessert:
    'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=800&auto=format&fit=crop',
  Meat: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?q=80&w=800&auto=format&fit=crop',
  Seafood:
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800&auto=format&fit=crop',
  Breakfast:
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=800&auto=format&fit=crop',
  Drink:
    'https://images.unsplash.com/photo-1544145945-f904253d0c7e?q=80&w=800&auto=format&fit=crop',
  'Main Course':
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop',
  Appetizer:
    'https://images.unsplash.com/photo-1541014741259-df5290ce50ca?q=80&w=800&auto=format&fit=crop',
  Snack:
    'https://images.unsplash.com/photo-1599490659223-ef52b4bc8c93?q=80&w=800&auto=format&fit=crop',
  Bread:
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
  Vegetarian:
    'https://images.unsplash.com/photo-1540914124281-342729f3aa3f?q=80&w=800&auto=format&fit=crop',
};

/**
 * Fetch a high-quality thumbnail from Unsplash based on query string.
 * Falls back to category-based image if search fails or API key is missing.
 * @param title - Recipe title (fallback if searchQuery not provided)
 * @param category - Recipe category for fallback and query enhancement
 * @param unsplashKey - Unsplash API Access Key
 * @param searchQuery - Optional clean search term from AI (1-3 words, best for accuracy)
 */
export async function getRecipeThumbnail(
  title: string,
  category: RecipeCategory,
  unsplashKey?: string,
  searchQuery?: string
): Promise<string> {
  const fallback = CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS['Main Course'];

  if (!unsplashKey) {
    console.info('Unsplash API key missing, using category fallback');
    return fallback;
  }

  try {
    // Construct smarter search query - put "food" first to prioritize context
    let finalQuery: string;
    if (searchQuery) {
      // AI-provided query - already optimized, just add food context
      finalQuery = `food ${searchQuery}`;
    } else {
      // Fallback: Use title + category
      finalQuery = `food ${title} ${category.toLowerCase()}`;
    }

    console.info(`[Image Service] Searching Unsplash for: "${finalQuery}"`);
    console.info(`[Image Service] Original query: "${searchQuery || 'not provided'}", using: "${finalQuery}"`);

    const params = new URLSearchParams({
      query: finalQuery,
      orientation: 'squarish',
      per_page: '3', // Fetch top 3 for better selection
      client_id: unsplashKey,
    });

    const response = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
      method: 'GET',
    });

    if (!response.ok) {
      console.warn(`Unsplash API error: ${response.status}. Using fallback.`);
      return fallback;
    }

    const data = (await response.json()) as {
      results: Array<{
        urls: {
          regular: string;
          small: string;
        };
        alt_description?: string;
      }>;
    };

    if (data.results && data.results.length > 0) {
      // Use the first result (most relevant)
      const selectedImage = data.results[0];
      console.info(`[Image Service] Found ${data.results.length} results, selected: "${selectedImage.alt_description || 'no description'}"`);
      return selectedImage.urls.small;
    }

    console.warn('[Image Service] No results found, using category fallback');
    return fallback;
  } catch (error) {
    console.error('Error fetching from Unsplash:', error);
    return fallback;
  }
}
