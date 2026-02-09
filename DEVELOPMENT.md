# Development Guide

Complete reference for developing features in video-to-ingredients.

## Quick Links

- **Agent Skills**: [`AGENT_SKILLS.md`](./AGENT_SKILLS.md) - Development patterns & rules
- **Toast Skill**: [`apps/mobile/components/ui/TOAST_SKILL.md`](./apps/mobile/components/ui/TOAST_SKILL.md)
- **Meal Plan Skill**: [`apps/mobile/hooks/MEAL_PLAN_SKILL.md`](./apps/mobile/hooks/MEAL_PLAN_SKILL.md)
- **Framework Rules**: `.agents/skills/vercel-react-native-skills/` - React Native best practices
- **Example**: [`apps/mobile/components/examples/MealPlanGeneratorExample.tsx`](./apps/mobile/components/examples/MealPlanGeneratorExample.tsx)

## Project Structure

```
.
├── AGENT_SKILLS.md                    # Development rules & patterns
├── DEVELOPMENT.md                     # This file
├── .agents/                           # Framework rules
│   └── skills/
│       └── vercel-react-native-skills/
│           ├── SKILL.md               # Skill index
│           └── rules/                 # Individual rules
│
├── apps/
│   ├── api/                          # Backend API
│   └── mobile/                       # React Native app
│       ├── components/
│       │   ├── ui/
│       │   │   ├── Toast.tsx          # Toast component ⭐
│       │   │   ├── TOAST_SKILL.md     # Toast docs ⭐
│       │   │   └── ...other UI
│       │   ├── home/                  # Home screen components
│       │   ├── recipe/                # Recipe detail components
│       │   └── examples/
│       │       └── MealPlanGeneratorExample.tsx  # Example implementation
│       ├── hooks/
│       │   ├── useToast.ts            # Toast hook ⭐
│       │   ├── useMealPlanGeneration.ts  # Meal plan hook ⭐
│       │   └── MEAL_PLAN_SKILL.md     # Meal plan docs ⭐
│       ├── stores/
│       │   ├── recipe.ts              # Recipe store
│       │   └── mealPlan.ts            # Meal plan store ⭐
│       └── lib/
│           └── theme.ts               # Design tokens
│
└── packages/shared/src/
    └── types.ts                       # Shared types (includes MealPlan*) ⭐
```

⭐ = New feature files

## Getting Started

### 1. Understand the Architecture

The app uses:
- **Zustand** for state management (recipe store, meal plan store)
- **AsyncStorage** for persistence
- **Reanimated** for animations
- **React Native** with Expo
- **TypeScript** for type safety

### 2. Add Toast Notifications

Want to add user feedback to an action?

```tsx
import { useToast } from '../../hooks/useToast';

export function MyComponent() {
  const { success, error, toasts, dismiss } = useToast();

  const handleAction = async () => {
    try {
      await doSomething();
      success('Success message!');
    } catch (err) {
      error('Error message');
    }
  };

  return (
    <>
      <Button onPress={handleAction} />
      {/* Always render toasts at end */}
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          duration={t.duration}
          onDismiss={() => dismiss(t.id)}
        />
      ))}
    </>
  );
}
```

**Key Points:**
- Import `useToast` hook
- Call `success()`, `error()`, `warning()`, or `info()`
- Render toast queue at end of JSX
- Always provide `onDismiss` callback

**See**: `apps/mobile/components/ui/TOAST_SKILL.md`

### 3. Generate Meal Plans

Want to create meal plans from recipes?

```tsx
import { useMealPlanGeneration } from '../../hooks/useMealPlanGeneration';
import { useToast } from '../../hooks/useToast';

export function MyMealPlanComponent() {
  const { generateForAllRecipes, generateForFilteredRecipes } = useMealPlanGeneration();
  const { success, error } = useToast();

  // Generate from all recipes
  const handleGenerate = async () => {
    try {
      const planId = await generateForAllRecipes({
        duration: 7, // 7, 14, or 30 days
        vegetarian: false,
        vegan: false,
        glutenFree: false,
        maxCookTime: undefined, // No limit
      });
      success('Meal plan created!');
    } catch (err) {
      error('Failed to generate');
    }
  };

  // Generate from filtered recipes
  const handleGenerateVegetarian = async () => {
    try {
      const planId = await generateForFilteredRecipes(
        (recipe) => recipe.isVegetarian === true,
        { duration: 7 }
      );
      success('Vegetarian meal plan created!');
    } catch (err) {
      error('Failed');
    }
  };

  return (
    <>
      <Button onPress={handleGenerate} title="Generate Plan" />
      <Button onPress={handleGenerateVegetarian} title="Vegetarian Plan" />
    </>
  );
}
```

**Key Points:**
- Import `useMealPlanGeneration` hook
- Use `generateForAllRecipes()` for all recipes
- Use `generateForFilteredRecipes(filterFn, options)` for filtered recipes
- Support durations: 7, 14, 30 days
- Always use Toast for feedback
- Show loading state while generating

**See**: `apps/mobile/hooks/MEAL_PLAN_SKILL.md`

### 4. Follow Framework Rules

Before writing components, check relevant rules:

```
📋 Building a List?
→ Check: .agents/skills/vercel-react-native-skills/rules/list-performance-*.md
→ Must virtualize large lists with FlashList
→ Must memoize list items
→ Must stabilize callbacks

🎨 Styling Components?
→ Check: .agents/skills/vercel-react-native-skills/rules/ui-styling.md
→ Use StyleSheet.create or Nativewind

✨ Adding Animations?
→ Check: .agents/skills/vercel-react-native-skills/rules/animation-*.md
→ Only animate transform and opacity (GPU-accelerated)
→ Use Reanimated for smooth animations
```

**See**: `.agents/skills/vercel-react-native-skills/SKILL.md` for complete list

## Common Tasks

### Task: Add Toast to Existing Component

1. Import hook: `import { useToast } from '../../hooks/useToast';`
2. Call hook: `const { success, error, toasts, dismiss } = useToast();`
3. Use in handlers: `success('Message')` or `error('Message')`
4. Render queue at end: `{toasts.map(...)}`

**Example**: `apps/mobile/components/home/AddVideoModal.tsx`

### Task: Create Meal Plan Button

1. Import hook: `import { useMealPlanGeneration } from '../../hooks/useMealPlanGeneration';`
2. Import toast: `import { useToast } from '../../hooks/useToast';`
3. Call hooks in component
4. Create handler that calls `generateForAllRecipes()` or `generateForFilteredRecipes()`
5. Show success/error toast
6. Update loading state

**Example**: `apps/mobile/components/examples/MealPlanGeneratorExample.tsx`

### Task: Update Meal Plan Type

1. Edit: `packages/shared/src/types.ts`
2. Update `MealPlan` or `MealPlanDay` interface
3. Update store: `apps/mobile/stores/mealPlan.ts`
4. Update API calls in hook: `apps/mobile/hooks/useMealPlanGeneration.ts`
5. Test with example component

### Task: Fix Performance Issue

1. Check which category: list, animation, ui, state, rendering, etc.
2. Find rule: `.agents/skills/vercel-react-native-skills/rules/{category}-*.md`
3. Read rule (has ❌ and ✅ examples)
4. Apply correct pattern
5. Profile with React Native DevTools

## Type Safety

All shared types are in `packages/shared/src/types.ts`:

```typescript
// Recipe types
export type Platform = 'youtube' | 'tiktok' | 'instagram';
export interface Recipe { ... }
export interface RecipeFilters { ... }

// Meal Plan types (NEW)
export interface MealPlan { ... }
export interface MealPlanDay { ... }
export interface GenerateMealPlanRequest { ... }
export interface GenerateMealPlanResponse { ... }
```

Import with:
```typescript
import type { MealPlan, GenerateMealPlanRequest } from '@shared/types';
```

## State Management Pattern

The app uses **Zustand + AsyncStorage** for state:

### Recipe Store (`apps/mobile/stores/recipe.ts`)
```typescript
interface RecipeState {
  recipes: Record<string, Recipe>;
  isLoading: boolean;
  error: string | null;
  analyzeVideo: (url: string) => Promise<string>;
  addRecipe: (recipe: Recipe) => void;
  clearError: () => void;
}
```

### Meal Plan Store (`apps/mobile/stores/mealPlan.ts`)
```typescript
interface MealPlanState {
  mealPlans: Record<string, MealPlan>;
  isLoading: boolean;
  error: string | null;
  generateMealPlan: (request: GenerateMealPlanRequest) => Promise<string>;
  addMealPlan: (mealPlan: MealPlan) => void;
  updateMealPlan: (id: string, updates: Partial<MealPlan>) => void;
  updateMealDay: (mealPlanId: string, day: number, dayData: MealPlanDay) => void;
  deleteMealPlan: (id: string) => void;
  clearError: () => void;
}
```

**Pattern:**
1. Create store with Zustand + persist middleware
2. Create hook for convenient access (optional)
3. Use in components with `const { ... } = useStore();`
4. Automatic persistence with AsyncStorage

## Best Practices Checklist

Before pushing code:

- [ ] Toast notifications for all async feedback
- [ ] Loading states during async operations
- [ ] Error handling with meaningful messages
- [ ] Types from `@shared/types`
- [ ] No hardcoded strings (use theme constants)
- [ ] Memoized list items
- [ ] Virtualized lists (FlashList)
- [ ] GPU-accelerated animations only (transform, opacity)
- [ ] No console.log in production code
- [ ] Proper TypeScript typing
- [ ] Tests for business logic
- [ ] No network calls in render
- [ ] AsyncStorage for persistence only
- [ ] Comments for complex logic
- [ ] Accessibility considerations

## Example Component

See `apps/mobile/components/examples/MealPlanGeneratorExample.tsx` for complete working example of:

- ✅ Toast notifications
- ✅ Meal plan generation
- ✅ Loading states
- ✅ Error handling
- ✅ Filter options
- ✅ Recent items display
- ✅ Animations
- ✅ Type safety

## Resources

| Topic | File |
|-------|------|
| Overview | `AGENT_SKILLS.md` |
| Toast | `apps/mobile/components/ui/TOAST_SKILL.md` |
| Meal Plans | `apps/mobile/hooks/MEAL_PLAN_SKILL.md` |
| Framework | `.agents/skills/vercel-react-native-skills/SKILL.md` |
| Example | `apps/mobile/components/examples/MealPlanGeneratorExample.tsx` |
| Types | `packages/shared/src/types.ts` |

## Troubleshooting

### Toast Not Showing

- ✅ Using `useToast()` hook?
- ✅ Rendering toast queue in JSX?
- ✅ Calling `success()`, `error()`, etc.?

### Meal Plan Generation Fails

- ✅ Have recipes added to the app?
- ✅ API endpoint working (`/meal-plans/generate`)?
- ✅ Handling error with try/catch?
- ✅ Showing error toast to user?

### Performance Issues

- ✅ Checked `.agents/skills/vercel-react-native-skills/rules/`?
- ✅ Memoizing expensive components?
- ✅ Stabilizing callback references?
- ✅ Virtualizing lists?
- ✅ Using GPU properties for animations?

## Contributing

When adding new features:

1. Check existing patterns in codebase
2. Follow React Native best practices from `.agents/`
3. Use Toast for user feedback
4. Add types to `packages/shared/src/types.ts`
5. Update this guide if adding major features
6. Include example usage in component
7. Document with SKILL.md if it's reusable

## Next Steps

- [ ] Review `AGENT_SKILLS.md`
- [ ] Check Toast skill: `TOAST_SKILL.md`
- [ ] Check Meal Plan skill: `MEAL_PLAN_SKILL.md`
- [ ] Review example: `MealPlanGeneratorExample.tsx`
- [ ] Read relevant rules from `.agents/`
- [ ] Start building!
