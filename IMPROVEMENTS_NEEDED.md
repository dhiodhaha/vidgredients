# Backend & UX Improvements

## 🔴 CRITICAL - Missing Endpoints

### 1. **Meal Plan Generation Endpoint** (MISSING!)
**Path**: `/meal-plans/generate`
**Priority**: 🔴 CRITICAL (Required for premium feature to work)

Currently, the frontend calls `/meal-plans/generate` but this endpoint doesn't exist in the API.

**Implementation needed**:
```typescript
// apps/api/src/routes/meal-plans.ts

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const generateSchema = z.object({
  recipeIds: z.array(z.string()),
  duration: z.number().min(1).max(30),
  preferences: z.object({
    vegetarian: z.boolean().optional(),
    vegan: z.boolean().optional(),
    glutenFree: z.boolean().optional(),
    maxCookTime: z.number().optional(),
  }).optional(),
});

export const mealPlans = new Hono();

mealPlans.post('/generate', zValidator('json', generateSchema), async (c) => {
  const { recipeIds, duration, preferences } = c.req.valid('json');

  try {
    // TODO: Implement meal plan generation logic
    // 1. Fetch recipes from database
    // 2. Filter based on preferences
    // 3. Use GPT to create meal plan distribution
    // 4. Return structured meal plan

    return c.json({
      id: crypto.randomUUID(),
      name: `${duration}-Day Meal Plan`,
      duration,
      days: [], // Array of MealPlanDay
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    return c.json(
      { error: 'Failed to generate meal plan', details: error instanceof Error ? error.message : '' },
      500
    );
  }
});
```

**Update `index.ts`**:
```typescript
import { mealPlans } from './routes/meal-plans';
app.route('/meal-plans', mealPlans);
```

---

### 2. **User Preferences/Settings Endpoint**
**Path**: `/user/preferences`
**Priority**: 🟡 HIGH (For personalized features)

**Features needed**:
- Save dietary preferences
- Save favorite cuisines
- Save meal prep time availability
- Cooking skill level

**Implementation**:
```typescript
// GET /user/preferences - Get user settings
// PUT /user/preferences - Update user settings
// Requires auth token validation
```

---

### 3. **Saved Recipes Endpoint**
**Path**: `/recipes/saved`
**Priority**: 🟡 HIGH (For saving recipes to user account)

**Features**:
- GET `/recipes/saved` - List user's saved recipes
- POST `/recipes/saved` - Add recipe to favorites
- DELETE `/recipes/saved/:recipeId` - Remove from favorites

---

## 🟡 UX IMPROVEMENTS

### 1. **Loading States & Skeleton Screens**
**Files to Update**:
- `AddVideoModal.tsx` - Show progress: extracting → parsing → thumbnailing
- `paywall.tsx` - Already good, but add skeleton for offerings loading

**Current**: Shows loader spinner
**Improvement**: Add progress indicators
```tsx
<ProgressBar
  steps={['Extracting video', 'Analyzing content', 'Finding photos']}
  currentStep={loadingStep}
/>
```

---

### 2. **Error Handling & Retry Logic**
**Files to Update**:
- `apps/mobile/components/home/AddVideoModal.tsx` - Add retry button on error
- `apps/mobile/app/(main)/paywall.tsx` - Better error messages
- Backend API routes - More specific error codes

**Current**: Generic error alerts
**Improvement**:
```tsx
// Specific error messages based on error type
if (error.includes('network')) {
  showError('Network error. Check your connection.');
  // Show retry button
} else if (error.includes('transcript')) {
  showError('Couldn\'t extract audio. Try a different video.');
}
```

---

### 3. **Empty States**
**Files needing improvement**:
- Home screen when no recipes
- Meal plans screen when no plans
- Search results when no matches

**Current**: Simple text
**Improvement**: Add illustrations, CTA buttons, helpful suggestions

```tsx
<EmptyState
  icon="🎬"
  title="No recipes yet"
  subtitle="Paste a video link to extract ingredients and steps"
  action={{ label: "Add first recipe", onPress: openModal }}
/>
```

---

### 4. **Search & Filter Improvements**
**Priority**: 🟡 MEDIUM

**Current limitations**:
- No text search for recipes
- Filters only by recipe properties
- No sorting options

**Improvements needed**:
- Text search in recipe titles/ingredients
- Sort by: newest, cook time, difficulty, saved date
- Advanced filters: servings, nutrition ranges
- Dietary combination filters (vegetarian + gluten-free)

```tsx
// New filter types needed
interface AdvancedFilters {
  text?: string;
  sortBy?: 'newest' | 'quickest' | 'easiest' | 'saved';
  servings?: number;
  caloriesMax?: number;
  proteinMin?: number;
}
```

---

### 5. **Recipe Detail Screen Enhancements**
**File**: `apps/mobile/app/(main)/recipe/[id].tsx`
**Current**: Basic implementation
**Improvements**:
- [ ] Ingredients checklist (currently exists but could be enhanced)
- [ ] Nutritional breakdown UI (pie chart)
- [ ] Ingredient substitutes suggestion
- [ ] Print/share recipe
- [ ] Scale servings with ingredient amounts
- [ ] Timer for cooking steps
- [ ] Notes section
- [ ] Save to collections

---

### 6. **Meal Plan UI Improvements**
**Missing screens entirely!**
**Priority**: 🔴 CRITICAL

Need to create:
- Meal plan list screen
- Meal plan detail (calendar view)
- Day view with meal assignments
- Shopping list generation
- Meal plan editor (drag & drop)

```tsx
// apps/mobile/app/(main)/meal-plans.tsx - List all plans
// apps/mobile/app/(main)/meal-plans/[id].tsx - View/edit plan
// apps/mobile/app/(main)/meal-plans/[id]/shopping-list.tsx - Export list
```

---

### 7. **Accessibility (a11y) Improvements**
**Current**: Basic support
**Needed**:
- Proper `accessibilityLabel` on all buttons
- `accessibilityRole` on custom components
- Color contrast improvements (especially in paywall)
- Screen reader friendly error messages
- Keyboard navigation support

---

### 8. **Offline Support**
**Priority**: 🟡 MEDIUM

**Current**: Works online only
**Improvements**:
- Cache analyzed recipes
- Show cached recipes offline
- Queue new recipe analyses (sync when online)
- Offline indicator
- "Try again" for failed requests

---

### 9. **Performance Optimizations**
**Priority**: 🟡 MEDIUM

**Issues found**:
1. **RecipeCard re-renders**: Currently re-renders on every recipe change
   - Solution: Add `memo()` wrapper and use `useCallback` for handlers

2. **Image loading**: No optimization for thumbnails
   - Solution: Use Image component properly, add `placeholder`

3. **Meal plan modal**: Opens with animation every time
   - Solution: Memoize, prevent unnecessary re-renders

**Quick wins**:
```tsx
// Wrap expensive components
export const RecipeCard = memo(RecipeCard);

// Use callback for handlers
const handlePress = useCallback((id) => {
  router.push(`/recipe/${id}`);
}, []);
```

---

### 10. **Network Request Optimization**
**Backend**:
- Add request caching headers (Cache-Control)
- Implement ETag for recipe caching
- Add request timeout (currently none)
- Rate limiting for free tier

```typescript
// Backend middleware
app.use('*', async (c, next) => {
  // Add timeout
  // Add rate limiting check
  // Set appropriate cache headers
  await next();
});
```

---

## 🟢 QUICK WINS (High ROI)

1. **Add loading spinner with steps** (30 min)
   - Show "Extracting video" → "Analyzing content" → "Finding photos"

2. **Better error messages** (30 min)
   - Network error → "Check your connection"
   - Invalid URL → "Make sure it's YouTube, TikTok, or Instagram"

3. **Retry button on error** (20 min)
   - Don't require dismissing alert and starting over

4. **Empty state illustrations** (20 min)
   - Make "no recipes" feel less sad

5. **Add recipe count** (10 min)
   - Show "3 recipes saved" in header

6. **Search in recipes** (1 hour)
   - Text search by title/ingredients

---

## 📊 BACKEND IMPROVEMENTS SUMMARY

| Endpoint | Status | Priority | Effort | Impact |
|----------|--------|----------|--------|--------|
| `/meal-plans/generate` | ❌ Missing | 🔴 CRITICAL | 2 hrs | HIGH |
| `/user/preferences` | ❌ Missing | 🟡 HIGH | 1.5 hrs | MEDIUM |
| `/recipes/saved` | ❌ Missing | 🟡 HIGH | 1.5 hrs | HIGH |
| Error handling | 🟡 Basic | 🟡 MEDIUM | 1 hr | MEDIUM |
| Caching headers | ❌ Missing | 🟡 MEDIUM | 30 min | MEDIUM |
| Rate limiting | ❌ Missing | 🟡 HIGH | 1 hr | MEDIUM |
| Request timeout | ❌ Missing | 🟠 LOW | 15 min | LOW |

---

## 🎨 UX IMPROVEMENTS SUMMARY

| Feature | Status | Priority | Effort | Impact |
|---------|--------|----------|--------|--------|
| Meal plans screens | ❌ Missing | 🔴 CRITICAL | 4 hrs | HIGH |
| Loading progress | 🟡 Basic | 🟡 HIGH | 1 hr | MEDIUM |
| Error handling | 🟡 Basic | 🟡 HIGH | 1.5 hrs | HIGH |
| Empty states | 🟡 Basic | 🟡 MEDIUM | 1 hr | MEDIUM |
| Search/filter | ❌ Missing | 🟡 MEDIUM | 2 hrs | MEDIUM |
| Accessibility | 🟡 Basic | 🟠 LOW | 1.5 hrs | MEDIUM |
| Offline support | ❌ Missing | 🟠 LOW | 2 hrs | LOW |
| Performance | 🟡 OK | 🟠 LOW | 1 hr | MEDIUM |

---

## 🎯 RECOMMENDED PRIORITY ORDER

### For Hackathon (7.5 hours remaining):
1. **[CRITICAL] Create `/meal-plans/generate` endpoint** (2 hrs)
   - Without this, premium feature is broken

2. **[CRITICAL] Create meal plan screens** (3 hrs)
   - List, detail, shopping list views
   - Without this, generated plans invisible to users

3. **[HIGH] Add better error handling** (1 hr)
   - Retry buttons, specific error messages

4. **[HIGH] Search recipes** (1 hr)
   - Text search by title/ingredients
   - Quick win for UX

**Total: 7 hours** - Leaves buffer for testing

### Post-Hackathon (If time allows):
5. Load state progress indicators
6. Empty state illustrations
7. User preferences endpoint
8. Saved recipes endpoint
9. Accessibility improvements

---

## Implementation Examples

### Meal Plan List Screen
```tsx
// apps/mobile/app/(main)/meal-plans.tsx
export default function MealPlansScreen() {
  const mealPlans = useMealPlanStore(s => s.mealPlans);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Meal Plans</Text>
      {Object.values(mealPlans).length > 0 ? (
        <FlatList
          data={Object.values(mealPlans)}
          renderItem={({ item }) => <MealPlanCard mealPlan={item} />}
        />
      ) : (
        <EmptyState
          icon="📋"
          title="No meal plans yet"
          subtitle="Generate a plan from your saved recipes"
          action={{ label: "Create plan", onPress: () => router.push('/') }}
        />
      )}
    </SafeAreaView>
  );
}
```

### Meal Plan Backend Endpoint
```typescript
// POST /meal-plans/generate
// 1. Validate recipe IDs exist
// 2. Fetch recipes from DB
// 3. Filter by preferences
// 4. Use GPT to distribute meals across days
// 5. Cache result
// 6. Return structured plan
```

---

## Conclusion

**What's working**:
- ✅ Video analysis (extract transcript, parse ingredients)
- ✅ Recipe storage and caching
- ✅ Authentication
- ✅ RevenueCat integration
- ✅ Beautiful UI

**What's missing**:
- ❌ Meal plan generation endpoint
- ❌ Meal plan display screens
- ❌ Search/advanced filters
- ❌ User preferences
- ❌ Saved recipes endpoint

**For a complete hackathon submission**:
- Implement meal plan endpoint + screens
- Add better error handling
- Add search capability
- Test thoroughly

These additions would elevate the app from "good foundation" to "complete product" ready for production.
