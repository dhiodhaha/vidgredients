# Agent Skills & Development Guidelines

This document outlines the development skills and best practices for the video-to-ingredients application. It combines custom skills with industry-standard patterns from the `.agents` directory.

## Quick Reference

- 📋 Custom Skills: Toast Notifications, Meal Plan Generation
- 🎯 Framework Rules: React Native/Expo best practices from Vercel
- 📁 Rules Location: `.agents/skills/vercel-react-native-skills/`

## Custom Skills

### 1. Toast Notifications

**Files:**
- Component: `apps/mobile/components/ui/Toast.tsx`
- Hook: `apps/mobile/hooks/useToast.ts`
- Documentation: `apps/mobile/components/ui/TOAST_SKILL.md`

**Quick Start:**
```tsx
import { useToast } from '../../hooks/useToast';

export function MyComponent() {
  const { success, error, toasts, dismiss } = useToast();

  const handleAction = async () => {
    try {
      await doSomething();
      success('Done!');
    } catch (err) {
      error('Failed');
    }
  };

  return (
    <>
      <Button onPress={handleAction} />
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

**Key Features:**
- 4 toast types: success, error, info, warning
- Auto-dismiss with customizable duration
- Queue multiple toasts
- Manual dismiss option
- Smooth Reanimated animations

### 2. Meal Plan Generation

**Files:**
- Store: `apps/mobile/stores/mealPlan.ts`
- Hook: `apps/mobile/hooks/useMealPlanGeneration.ts`
- Documentation: `apps/mobile/hooks/MEAL_PLAN_SKILL.md`
- Types: `packages/shared/src/types.ts` (MealPlan*, GenerateMealPlanRequest*)

**Quick Start:**
```tsx
import { useMealPlanGeneration } from '../../hooks/useMealPlanGeneration';
import { useToast } from '../../hooks/useToast';

export function MealPlanScreen() {
  const { generateForAllRecipes } = useMealPlanGeneration();
  const { success, error } = useToast();

  const handleGenerate = async () => {
    try {
      const planId = await generateForAllRecipes({ duration: 7 });
      success('Meal plan created!');
    } catch (err) {
      error('Failed to generate');
    }
  };

  return <Button onPress={handleGenerate} />;
}
```

**Key Features:**
- Generate plans from any/all recipes
- Filter recipes before generation
- Respect dietary preferences
- Support 7/14/30-day plans
- Persist plans locally
- Type-safe with shared types

## Framework Rules

The `.agents/skills/vercel-react-native-skills/` directory contains comprehensive React Native best practices organized by priority.

### Critical Priority (MUST FOLLOW)

**List Performance** (`list-performance-*`)
- Virtualize large lists with FlashList
- Memoize list item components
- Stabilize callback references
- Avoid inline style objects
- Extract functions outside render
- Use FlatList itemTypes for heterogeneous lists

**Why it matters:** Lists are often the bottleneck in React Native performance.

### High Priority (STRONGLY RECOMMENDED)

**Animations** (`animation-*`)
- Animate only transform and opacity (GPU-accelerated)
- Use useDerivedValue for computed animations
- Use Gesture.Tap instead of Pressable for touch-driven animations

**Navigation** (`navigation-*`)
- Use native stack and native tabs over JS navigators

**UI Patterns** (`ui-*`)
- Use expo-image for all images
- Use Pressable over TouchableOpacity
- Handle safe areas in ScrollViews
- Use native modals when possible

### Medium Priority (RECOMMENDED)

**State Management** (`react-state-*`)
- Minimize state subscriptions
- Use dispatcher pattern for callbacks
- Show fallback on first render

**Rendering** (`rendering-*`)
- Wrap text in Text components (never bare strings)
- Avoid falsy && for conditional rendering

## How to Use Agent Rules

### Step 1: Reference Rules When Building

When implementing a feature, check the relevant rule category:

```
Building a list component?
→ Review: .agents/skills/vercel-react-native-skills/rules/list-performance-*.md

Implementing animations?
→ Review: .agents/skills/vercel-react-native-skills/rules/animation-*.md

Styling components?
→ Review: .agents/skills/vercel-react-native-skills/rules/ui-styling.md
```

### Step 2: Apply Rule Patterns

Each rule has:
1. Brief explanation of why it matters
2. ❌ Incorrect example (what not to do)
3. ✅ Correct example (what to do)
4. Additional context and references

### Step 3: Validate in Code Review

Before submitting code, ensure it follows:
- Critical priority rules (non-negotiable)
- High priority rules (necessary for quality)
- Medium priority rules (recommended for maintainability)

## Integration Examples

### Toast + Recipe Store

```tsx
import { useRecipeStore } from '../../stores/recipe';
import { useToast } from '../../hooks/useToast';

export function AddRecipeComponent() {
  const { analyzeVideo } = useRecipeStore();
  const { success, error } = useToast();

  const handleAnalyze = async (url: string) => {
    try {
      const recipeId = await analyzeVideo(url);
      success('Recipe extracted!');
      return recipeId;
    } catch (err) {
      error('Failed to extract recipe');
    }
  };

  return (
    <AddVideoModal
      onSubmit={handleAnalyze}
      // ... other props
    />
  );
}
```

### Meal Plan + Toast + Filters

```tsx
import { useMealPlanGeneration } from '../../hooks/useMealPlanGeneration';
import { useToast } from '../../hooks/useToast';
import { useRecipeStore } from '../../stores/recipe';

export function GenerateMealPlanModal() {
  const { recipes } = useRecipeStore();
  const { generateForFilteredRecipes } = useMealPlanGeneration();
  const { success, error } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      const planId = await generateForFilteredRecipes(
        (recipe) => !selectedCategory || recipe.category === selectedCategory,
        { duration: 7 }
      );
      success('Meal plan created!');
      navigateToPlan(planId);
    } catch (err) {
      error('Generation failed');
    }
  };

  return (
    <Modal>
      <CategoryPicker value={selectedCategory} onChange={setSelectedCategory} />
      <Button onPress={handleGenerate} title="Generate Plan" />
    </Modal>
  );
}
```

## File Structure

```
apps/mobile/
├── components/
│   └── ui/
│       ├── Toast.tsx                 # Toast component
│       ├── TOAST_SKILL.md           # Toast documentation
│       └── ...other components
├── hooks/
│   ├── useToast.ts                  # Toast state hook
│   ├── useMealPlanGeneration.ts     # Meal plan generation hook
│   └── MEAL_PLAN_SKILL.md           # Meal plan documentation
└── stores/
    ├── recipe.ts                    # Recipe store
    └── mealPlan.ts                  # Meal plan store

packages/shared/src/
└── types.ts                         # Shared types (Recipe, MealPlan, etc)

.agents/
└── skills/
    └── vercel-react-native-skills/
        ├── SKILL.md                 # Skill index
        └── rules/                   # Individual rules
```

## Development Workflow

### When Adding a New Feature

1. **Define Types** in `packages/shared/src/types.ts`
2. **Create Store** (if stateful) using Zustand
3. **Create Hook** for convenient access
4. **Check Rules** from `.agents/` for relevant guidelines
5. **Implement Component** following rule patterns
6. **Add Documentation** (SKILL.md) if it's a reusable pattern
7. **Test Integration** with existing features (Toast notifications, etc)

### When Fixing Performance Issues

1. Check `.agents/skills/vercel-react-native-skills/rules/list-performance-*`
2. Check animation rules if animations are involved
3. Check ui-styling for layout performance
4. Profile with React Native DevTools
5. Validate fix with DevTools after changes

### When Building UI Components

1. Reference `ui-styling.md` for approach (StyleSheet.create vs Nativewind)
2. Check `ui-pressable.md` for touch interactions
3. Check `ui-safe-area-scroll.md` for layout concerns
4. Use toast notifications for user feedback

## Best Practices Summary

### ✅ DO

- Use Toast component for async feedback
- Generate meal plans with proper filters
- Follow vercel-react-native-skills rules
- Type everything with shared types
- Persist state with Zustand + AsyncStorage
- Use Reanimated for animations (GPU properties only)
- Memoize expensive components and callbacks
- Virtualize lists
- Show loading states during async operations

### ❌ DON'T

- Show alerts for simple notifications (use Toast instead)
- Make async calls without error handling
- Ignore performance rules
- Use StyleSheet without review of `ui-styling.md`
- Animate layout properties
- Create new toast implementations
- Generate meal plans without recipes
- Store sensitive data in AsyncStorage

## References

- Toast Skill: `apps/mobile/components/ui/TOAST_SKILL.md`
- Meal Plan Skill: `apps/mobile/hooks/MEAL_PLAN_SKILL.md`
- Framework Rules: `.agents/skills/vercel-react-native-skills/SKILL.md`
- Full Rules Docs: `.agents/skills/vercel-react-native-skills/rules/`

## Questions?

- Check the SKILL.md files for detailed examples
- Review rule files for specific patterns
- Check existing components in `apps/mobile/components/` for implementation reference
