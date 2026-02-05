# iOS Testing & Environment Setup Guide

This guide covers how to set up your development environment and test the application on iOS using your MacBook.

## 1. Environment Variables Setup

You need to configure environment variables for both the **Mobile App** and the **Backend API**.

### Mobile App (`apps/mobile`)

Create a `.env` file in `apps/mobile/` and add the following:

```bash
# apps/mobile/.env

# 1. EXPO_PUBLIC_API_URL
# - For iOS Simulator: http://localhost:8787
# - For Physical Device: http://<your-mac-ip>:8787 (e.g., http://192.168.1.10:8787)
# - For Production: https://your-deployed-api.workers.dev
EXPO_PUBLIC_API_URL=http://localhost:8787

# 2. EXPO_PUBLIC_RC_IOS_KEY (RevenueCat)
# - Go to: https://app.revenuecat.com/
# - Select your Project -> Project Settings -> API Keys
# - Copy the "App-specific API Key" for the iOS App
EXPO_PUBLIC_RC_IOS_KEY=appl_your_ios_key_here
EXPO_PUBLIC_RC_ANDROID_KEY=goog_your_android_key_here
```

### Backend API (`apps/api`)

Create a `.dev.vars` file (used by Cloudflare Workers/Wrangler) in `apps/api/` and add the following:

```bash
# apps/api/.dev.vars

# Neon PostgreSQL Database URL
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# OpenAI API Key (For video processing)
OPENAI_API_KEY=sk-your-openai-key

# Scrapecreators API Key
SCRAPECREATORS_API_KEY=your-scrapecreators-key

# Better Auth Secret (Generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET=your-randomly-generated-secret
```

---

## 2. Testing on iOS Simulator (MacBook)

Testing on the simulator is the fastest way to iterate.

### Prerequisites

- **Xcode**: Install from the Mac App Store.
- **Xcode Command Line Tools**: Run `xcode-select --install` in your terminal.

### Usage

1. Open your terminal.
2. Navigate to the mobile app directory: `cd apps/mobile`
3. Start the development server and open the simulator:
   ```bash
   npm run ios
   ```
   *This will automatically launch the iOS Simulator and install the app.*

---

## 3. Testing on Physical iOS Device

### Option A: Expo Go (Quickest)

1. Install the **Expo Go** app from the App Store on your iPhone.
2. Connect your iPhone and MacBook to the **same Wi-Fi network**.
3. In `apps/mobile`, run:
   ```bash
   npm run start
   ```
4. Scan the QR code with your iPhone camera or the Expo Go app.

### Option B: Development Build (Required for Native Modules)

*If you are testing RevenueCat or other native modules, you might need a Development Build.*

1. Install EAS CLI: `npm install -g eas-cli`
2. Log in: `eas login`
3. Build for development:
   ```bash
   npm run build:dev
   ```
4. Follow the EAS prompts to install the build on your device.

---

## 4. Running the Backend Locally

The mobile app needs the API to function. In another terminal tab:

1. `cd apps/api`
2. `npm run dev` (Ensure `wrangler` is installed)
