export type Platform = 'youtube' | 'tiktok' | 'instagram';
export type Difficulty = 'easy' | 'medium' | 'hard';

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
}

export interface RecipeFilters {
  maxCookTime?: number; // null = no filter
  difficulty?: Difficulty;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
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
