# Video to Ingredients

A mobile app that extracts ingredients and cooking steps from cooking video URLs using AI-powered transcript analysis.

## Tech Stack

- **Mobile**: Expo SDK 54 + React Native
- **Backend**: Hono on Cloudflare Workers
- **Database**: Neon PostgreSQL
- **Auth**: Neon Auth
- **AI**: Scrapecreators API + GPT-5.2
- **Monetization**: RevenueCat

## Project Structure

```
video-to-ingredients/
├── apps/
│   ├── mobile/          # Expo React Native app
│   └── api/             # Hono backend API
└── packages/
    └── shared/          # Shared TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Expo CLI
- Cloudflare account (or Vercel)
- Neon database
- OpenAI API key
- Scrapecreators API key
- RevenueCat account

### Setup

1. **Clone and install dependencies**

```bash
git clone <repo-url>
cd video-to-ingredients

# Install mobile app dependencies
cd apps/mobile
npm install

# Install API dependencies
cd ../api
npm install
```

2. **Configure environment variables**

```bash
# Copy the example env file
cp .env.example .env

# For the API, create .dev.vars
cp apps/api/.dev.vars.example apps/api/.dev.vars
```

3. **Set up Neon database**

Run the schema migration:
```bash
# Connect to your Neon database and run:
psql $DATABASE_URL < apps/api/src/db/schema.sql
```

4. **Run development servers**

```bash
# Terminal 1: API
cd apps/api
npm run dev

# Terminal 2: Mobile
cd apps/mobile
npm start

# For iOS Simulator testing, see:
# [iOS Testing & Environment Setup Guide](./iOS_TESTING_SETUP.md)
```

## Features

- 🎬 Paste cooking video URLs (YouTube, TikTok, Instagram)
- 🥘 Extract ingredients with quantities
- 📝 Get step-by-step cooking instructions
- ✅ Mark steps as complete
- 📊 Adjust serving sizes
- 💾 Recipe caching (DB-level)
- 💎 Freemium model with RevenueCat

## Best Practices

This project follows [React Native SKILL.md](/.agents/skills/vercel-react-native-skills/SKILL.md) best practices:

- FlashList for virtualized lists
- Memoized components with primitive props
- Zustand for state management
- expo-image for optimized images
- Native navigators via expo-router

## License

MIT
