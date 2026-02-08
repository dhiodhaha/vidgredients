import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

// --- Better Auth Tables ---

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  isPremium: boolean('isPremium').default(false),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});

// --- Application Tables ---

export const platformEnum = pgEnum('platform', ['youtube', 'tiktok', 'instagram']);
export const subscriptionPlanEnum = pgEnum('subscription_plan', ['monthly', 'yearly', 'lifetime']);
export const difficultyEnum = pgEnum('difficulty', ['easy', 'medium', 'hard']);
export const categoryEnum = pgEnum('category', [
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
  'Vegetarian',
]);

export const recipes = pgTable(
  'recipes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    url: text('url').notNull().unique(),
    urlHash: text('url_hash').notNull().unique(),
    platform: platformEnum('platform').notNull(),
    title: text('title'),
    thumbnailUrl: text('thumbnail_url'),
    servings: integer('servings').default(4),
    ingredients: jsonb('ingredients').notNull(),
    steps: jsonb('steps').notNull(),
    nutrition: jsonb('nutrition'),
    rawTranscript: text('raw_transcript'),
    // Filter fields
    cookTimeMinutes: integer('cook_time_minutes'),
    difficulty: difficultyEnum('difficulty'),
    isVegetarian: boolean('is_vegetarian').default(false),
    isVegan: boolean('is_vegan').default(false),
    isGlutenFree: boolean('is_gluten_free').default(false),
    category: categoryEnum('category').default('Main Course'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    urlHashIdx: index('idx_recipes_url_hash').on(table.urlHash),
    platformIdx: index('idx_recipes_platform').on(table.platform),
    cookTimeIdx: index('idx_recipes_cook_time').on(table.cookTimeMinutes),
  })
);

// User saved recipes
export const userRecipes = pgTable(
  'user_recipes',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    recipeId: uuid('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    savedAt: timestamp('saved_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    pk: index('pk_user_recipes').on(table.userId, table.recipeId), // Logic PRIMARY KEY simulation
    userIdIdx: index('idx_user_recipes_user_id').on(table.userId),
  })
);

// Subscription tracking (RevenueCat source of truth)
export const userSubscriptions = pgTable('user_subscriptions', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  revenueCatCustomerId: text('revenuecat_customer_id').notNull().unique(),
  isPremium: boolean('is_premium').default(false),
  currentPlan: subscriptionPlanEnum('current_plan'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Usage logs
export const usageLogs = pgTable(
  'usage_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
    action: text('action').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userMonthIdx: index('idx_usage_logs_user_month').on(table.userId, table.createdAt),
  })
);
