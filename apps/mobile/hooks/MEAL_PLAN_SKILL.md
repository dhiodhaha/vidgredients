# Meal Plan Generation Skill

This skill covers generating meal plans from collected recipes using AI-powered recommendations. It includes smart scheduling, nutritional balancing, and dietary preference filtering.

## When to Use

- Generate weekly/monthly meal plans from recipes
- Auto-schedule recipes based on complexity and nutrition
- Respect user dietary preferences and constraints
- Create balanced nutrition across multiple days
- Provide meal variety and rotation

## Components & Hooks

### useMealPlanStore (`stores/mealPlan.ts`)

Zustand store managing meal plan state and API interactions.

**Key Methods:**
- `generateMealPlan(request)` - Generate new meal plan from recipes
- `addMealPlan(mealPlan)` - Add meal plan to store
- `updateMealPlan(id, updates)` - Update meal plan metadata
- `updateMealDay(mealPlanId, day, dayData)` - Update specific day
- `deleteMealPlan(id)` - Remove meal plan

**State:**
- `mealPlans` - Record of all meal plans
- `isLoading` - Generation in progress
- `error` - Last error message

### useMealPlanGeneration (`hooks/useMealPlanGeneration.ts`)

High-level hook for meal plan generation with filtering.

**Returns:**
- `generate(recipeIds?, options?)` - Generate plan from specific recipes
- `generateForAllRecipes(options?)` - Use all available recipes
- `generateForFilteredRecipes(filter, options?)` - Filter recipes then generate

## Basic Pattern

### Step 1: Use Hook in Component

```tsx
import { useMealPlanGeneration } from '../../hooks/useMealPlanGeneration';
import { useToast } from '../../hooks/useToast';

export function MealPlanScreen() {
  const { generate, generateForAllRecipes } = useMealPlanGeneration();
  const { success, error } = useToast();
  // ...
}
```

### Step 2: Generate with Default Settings

```tsx
const handleGenerateWeekly = async () => {
  try {
    const mealPlanId = await generateForAllRecipes({
      duration: 7, // 7-day plan
    });
    success('Weekly meal plan created!');
    navigateToMealPlan(mealPlanId);
  } catch (err) {
    error('Failed to generate meal plan');
  }
};
```

### Step 3: Generate with Filters

```tsx
const handleGenerateVegetarian = async () => {
  try {
    const mealPlanId = await generateForFilteredRecipes(
      (recipe) => recipe.isVegetarian === true,
      {
        duration: 14,
        vegetarian: true,
      }
    );
    success('Vegetarian meal plan created!');
  } catch (err) {
    error('Failed to generate vegetarian meal plan');
  }
};
```

## Common Use Cases

### Weekly Plan from Selected Recipes

```tsx
const handleGenerateFromSelected = async () => {
  const selectedIds = recipes
    .filter((r) => r.selected)
    .map((r) => r.id);

  try {
    const planId = await generate(selectedIds, {
      duration: 7,
    });
    success('Meal plan created!');
  } catch (err) {
    error(err.message);
  }
};
```

### Plan with Dietary Restrictions

```tsx
const handleGenerateDietaryPlan = async () => {
  try {
    const planId = await generateForAllRecipes({
      duration: 30,
      vegetarian: true,
      glutenFree: true,
      maxCookTime: 30, // Minutes
    });
    success('Custom meal plan created!');
  } catch (err) {
    error('Failed to generate plan');
  }
};
```

### Regenerate with Different Duration

```tsx
const handleRegenerateLonger = async () => {
  try {
    // Generate 30-day plan instead of 7-day
    const planId = await generateForAllRecipes({
      duration: 30,
    });
    success('Extended meal plan created!');
  } catch (err) {
    error('Failed to extend meal plan');
  }
};
```

### Filter by Category then Generate

```tsx
const handleGenerateHealthy = async () => {
  try {
    const planId = await generateForFilteredRecipes(
      (recipe) => {
        const low = recipe.cookTimeMinutes <= 30;
        const high = recipe.nutrition?.protein >= 20;
        return low && high;
      },
      {
        duration: 7,
        maxCookTime: 30,
      }
    );
    success('Healthy meal plan created!');
  } catch (err) {
    error('Failed to generate healthy plan');
  }
};
```

## Types Reference

### GenerateMealPlanRequest

```typescript
{
  recipeIds: string[];        // Recipe IDs to use
  duration: number;           // 7, 14, or 30 days
  preferences?: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    maxCookTime?: number;     // Minutes
  };
}
```

### MealPlan

```typescript
{
  id: string;
  name: string;
  description?: string;
  duration: number;
  days: MealPlanDay[];
  createdAt: string;          // ISO timestamp
  updatedAt: string;          // ISO timestamp
  sharedWith?: string[];      // User IDs
}
```

### MealPlanDay

```typescript
{
  day: number;                // 1-indexed day number
  breakfast?: { recipeId: string; servings: number };
  lunch?: { recipeId: string; servings: number };
  dinner?: { recipeId: string; servings: number };
  snacks?: { recipeId: string; servings: number }[];
}
```

## Integration Examples

### With Toast Notifications

```tsx
import { useToast } from '../../hooks/useToast';
import { useMealPlanGeneration } from '../../hooks/useMealPlanGeneration';

export function MealPlanButton() {
  const { success, error } = useToast();
  const { generateForAllRecipes } = useMealPlanGeneration();

  const handlePress = async () => {
    try {
      const id = await generateForAllRecipes({ duration: 7 });
      success('Meal plan created successfully!');
    } catch (err) {
      error('Failed to generate meal plan');
    }
  };

  return <Button onPress={handlePress} />;
}
```

### With Loading State

```tsx
const [isGenerating, setIsGenerating] = useState(false);

const handleGenerateWithLoading = async () => {
  setIsGenerating(true);
  try {
    const planId = await generateForAllRecipes({ duration: 7 });
    success('Meal plan created!');
    navigation.navigate('MealPlanDetail', { id: planId });
  } catch (err) {
    error('Failed to generate meal plan');
  } finally {
    setIsGenerating(false);
  }
};
```

### In Modal Context

```tsx
import { Modal } from 'react-native';
import { useToast } from '../../hooks/useToast';

export function GenerateMealPlanModal({ visible, onClose }) {
  const { success, error } = useToast();
  const { generateForAllRecipes } = useMealPlanGeneration();
  const [duration, setDuration] = useState(7);

  const handleGenerate = async () => {
    try {
      await generateForAllRecipes({ duration });
      success('Meal plan generated!');
      onClose();
    } catch (err) {
      error('Generation failed');
    }
  };

  return (
    <Modal visible={visible}>
      {/* Duration selector UI */}
      <Button onPress={handleGenerate} title="Generate" />
    </Modal>
  );
}
```

## Best Practices

### ✅ DO

- Show loading state during generation
- Display success/error toasts
- Validate recipe count before generating
- Use appropriate duration (7, 14, 30 days)
- Show nutritional summaries in UI
- Allow editing individual days after generation
- Support dietary preference filters

### ❌ DON'T

- Generate without recipes available
- Ignore network errors
- Generate with invalid duration values
- Make multiple concurrent generation requests
- Replace existing plans without confirmation
- Ignore user dietary preferences
- Use old meal plan data after regeneration

## Accessibility

- Show loading indicator for long operations
- Display toast messages for confirmation
- Support keyboard navigation for controls
- Provide alternative text for filters
- Announce when plan generation completes

## Performance Considerations

- Generation happens on backend (API call)
- Local storage persists generated plans
- Supports offline viewing of cached plans
- Efficient recipe filtering with memoization
- Batch updates to meal days

## Related Skills

- **Toast Notifications** - Feedback during generation
- **Recipe Filtering** - Pre-filter recipes before plan
- **React Native Skills** - Smooth animations during load
