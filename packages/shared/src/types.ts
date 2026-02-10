export type Platform = 'youtube' | 'tiktok' | 'instagram';
export type Difficulty = 'easy' | 'medium' | 'hard';

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

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit?: string;
  imageUrl?: string;
}

export interface Step {
  order: number;
  description: string;
  highlightedWords: string[];
}

export interface Nutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface Recipe {
  id: string;
  url: string;
  platform: Platform;
  title: string;
  thumbnailUrl: string;
  servings: number;
  ingredients: Ingredient[];
  steps: Step[];
  nutrition?: Nutrition;
  // Filter fields
  cookTimeMinutes?: number;
  difficulty?: Difficulty;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  category?: RecipeCategory;
}

export interface RecipeFilters {
  maxCookTime?: number; // null = no filter
  difficulty?: Difficulty;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  category?: RecipeCategory;
}

export interface AnalyzeRequest {
  url: string;
}

export interface AnalyzeResponse {
  id: string;
  title: string;
  platform: Platform;
  thumbnailUrl: string;
  servings: number;
  ingredients: Omit<Ingredient, 'id'>[];
  steps: Step[];
  nutrition?: Nutrition;
  cached: boolean;
}

export interface User {
  id: string;
  email: string;
  isPremium: boolean;
  subscriptionPlan?: 'monthly' | 'yearly' | 'lifetime';
  subscriptionExpiresAt?: string;
}

export interface MealPlanDay {
  day: number;
  breakfast?: {
    recipeId: string;
    servings: number;
  };
  lunch?: {
    recipeId: string;
    servings: number;
  };
  dinner?: {
    recipeId: string;
    servings: number;
  };
  snacks?: {
    recipeId: string;
    servings: number;
  }[];
}

export interface MealPlan {
  id: string;
  name: string;
  description?: string;
  duration: number; // Number of days
  days: MealPlanDay[];
  createdAt: string;
  updatedAt: string;
  sharedWith?: string[]; // User IDs
}

export interface GenerateMealPlanRequest {
  recipeIds: string[];
  duration: number; // Days (7, 14, 30)
  preferences?: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    maxCookTime?: number;
  };
}

export type GroceryCategory =
  | 'Produce'
  | 'Meat & Seafood'
  | 'Dairy & Eggs'
  | 'Pantry'
  | 'Spices & Seasonings'
  | 'Grains & Bread'
  | 'Frozen'
  | 'Beverages'
  | 'Other';

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  checked: boolean;
  recipeIds: string[];
  category?: GroceryCategory;
}

export interface GenerateMealPlanResponse {
  id: string;
  name: string;
  duration: number;
  days: MealPlanDay[];
  totalNutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}
