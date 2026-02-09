# Troubleshooting Guide: Why changes might not be showing

It's frustrating when you've applied changes but the app looks the same. Here are the most likely reasons and how to fix them.

## 1. Thumbnails are still the same
If you see the same thumbnail for recipes you added *before* the fix, this is expected behavior.

### The Cause: Database Cache
The app caches recipe results in the Neon database to save API costs. 
- **Existing Recipes**: They already have the old "fallback" URL stored in the `thumbnail_url` column. Fixing the API key doesn't automatically change old data in the database.
- **The Fix**: 
  1. Try a **completely new video URL** that you've never analyzed before.
  2. Or, delete the old recipes from the database (or app) so the system re-analyzes them.

### Verify the API Key
Check your terminal where `npm run dev` (Backend) is running. Look for these logs when you analyze a video:
- `[Image Service] Searching Unsplash for: "..."` -> This means the key is working!
- `Unsplash API key missing` -> If you see this, the server didn't pick up the `.dev.vars` change. **Restart the backend terminal** (`Ctrl+C` then `npm run dev`).

---

## 2. Glowing Border Animation is not showing
If the "Analyzing..." button doesn't have a green glow, it's likely a refresh or layout issue.

### Force a Hard Reload
Sometimes Expo's "Fast Refresh" misses new component files.
1. Go to your terminal running `npx expo start`.
2. Press **`r`** to force the app to reload completely.
3. If that fails, close the Expo Go app/Simulator and open it again.

### Check if `GlowingBorder` is active
The glow only appears during the **Analyzing** state (after you click the button). 
- If the analysis happens too fast (cached result), you might only see it for a split second.
- Try a long video or a new URL to give the AI time to work.

---

## 3. Checklist for success
- [ ] **Backend Restarted?** (Crucial after `.dev.vars` changes)
- [ ] **Tested with NEW URL?** (To avoid cache)
- [ ] **Mobile App Reloaded?** (Press `r` in terminal)
- [ ] **No Errors in Terminal?** (Check for red text in `npx expo start` or `npm run dev`)
