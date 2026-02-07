-- Video to Ingredients Database Schema
-- Run this in your Neon PostgreSQL database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (managed by Neon Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cached recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT UNIQUE NOT NULL,
  url_hash TEXT UNIQUE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'tiktok', 'instagram')),
  title TEXT,
  thumbnail_url TEXT,
  servings INTEGER DEFAULT 4,
  ingredients JSONB NOT NULL,
  steps JSONB NOT NULL,
  nutrition JSONB,
  raw_transcript TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User saved recipes (many-to-many)
CREATE TABLE IF NOT EXISTS user_recipes (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, recipe_id)
);

-- Subscription tracking (RevenueCat as source of truth)
CREATE TABLE IF NOT EXISTS user_subscriptions (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  revenuecat_customer_id TEXT UNIQUE NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  current_plan TEXT CHECK (current_plan IN ('monthly', 'yearly', 'lifetime')),
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking for freemium limits
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_recipes_url_hash ON recipes(url_hash);
CREATE INDEX IF NOT EXISTS idx_recipes_platform ON recipes(platform);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_month ON usage_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_user_recipes_user_id ON user_recipes(user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- MIGRATION: Recipe Filter Fields (run manually on existing DB)
-- ============================================================

-- Add difficulty enum
DO $$ BEGIN
  CREATE TYPE difficulty AS ENUM ('easy', 'medium', 'hard');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new filter columns
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cook_time_minutes INTEGER;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS difficulty difficulty;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS is_vegetarian BOOLEAN DEFAULT FALSE;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS is_vegan BOOLEAN DEFAULT FALSE;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS is_gluten_free BOOLEAN DEFAULT FALSE;

-- Add index for filtering by cook time
CREATE INDEX IF NOT EXISTS idx_recipes_cook_time ON recipes(cook_time_minutes);
