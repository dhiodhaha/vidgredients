# Deployment & Preview Guide

This guide explains how to test your changes in a preview environment and deploy them to production for both the Backend API and the Mobile App.

---

## 🏗 Backend API (`apps/api`)

The backend is built on Cloudflare Workers.

### 1. Preview / Local Testing
Run the API locally to test changes before deploying.
```bash
cd apps/api
npm run dev
```
*Variables are loaded from `.dev.vars`.*

### 2. Live Deployment
Deploy your API to Cloudflare's global network.
```bash
npm run deploy
```

#### Important: Production Secrets
Deploying the code is not enough. You must also set your secrets in the Cloudflare dashboard or via CLI:
```bash
npx wrangler secret put DATABASE_URL
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put SCRAPECREATORS_API_KEY
npx wrangler secret put BETTER_AUTH_SECRET
```

---

## 📱 Mobile App (`apps/mobile`)

The mobile app uses Expo and EAS (Expo Application Services).

### 1. Preview (Internal Testing)
If you want to share a version of the app with team members or test it on a device without a computer:
```bash
cd apps/mobile
npm run build:preview
```
*This creates an "Internal Distribution" build that can be installed on registered devices.*

### 2. Development Build
If you've added new native modules (like RevenueCat) and need to test them on a device:
```bash
npm run build:dev
```

### 3. Production Deployment
To build the app for the Apple App Store or Google Play Store:
```bash
npm run build:prod
```
*This will create a production-ready bundle and can be configured to automatically submit to the stores.*

---

## 🧪 Testing Summary

Always run your automated tests before deploying!

| Component | Command | Tool |
| :--- | :--- | :--- |
| **Monorepo** | `npm run test` | Turbo (runs all) |
| **Backend** | `cd apps/api && npm run test` | Vitest |
| **Mobile** | `cd apps/mobile && npm run test` | Jest |

### Pre-deployment Checklist
1. [ ] Run `npm run lint` to check for code style issues.
2. [ ] Run `npm run typecheck` to ensure no TypeScript errors.
3. [ ] Run `npm run test` and ensure all tests pass.
4. [ ] For API: Deploy using `npm run deploy`.
5. [ ] For Mobile: Build a preview using `npm run build:preview` and verify on a real device.
