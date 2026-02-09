import type { MealPlanDay } from '@shared/types';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ChefHat, Download } from 'lucide-react-native';
import { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../../lib/theme';
import { useMealPlanStore } from '../../../stores/mealPlan';
import { useRecipeStore } from '../../../stores/recipe';

export default function MealPlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { mealPlans, isLoading } = useMealPlanStore();
  const { recipes } = useRecipeStore();

  const mealPlan = useMemo(() => {
    if (!id || typeof id !== 'string') return null;
    return mealPlans[id] || null;
  }, [id, mealPlans]);

  const shoppingList = useMemo(() => {
    if (!mealPlan) return {};

    const ingredients: Record<string, number> = {};

    for (const day of mealPlan.days) {
      const meals = [day.breakfast, day.lunch, day.dinner];
      for (const meal of meals) {
        if (meal) {
          const recipe = recipes[meal.recipeId];
          if (recipe) {
            for (const ing of recipe.ingredients) {
              const key = ing.name.toLowerCase();
              ingredients[key] = (ingredients[key] || 0) + Number.parseFloat(ing.quantity);
            }
          }
        }
      }

      if (day.snacks) {
        for (const snack of day.snacks) {
          const recipe = recipes[snack.recipeId];
          if (recipe) {
            for (const ing of recipe.ingredients) {
              const key = ing.name.toLowerCase();
              ingredients[key] = (ingredients[key] || 0) + Number.parseFloat(ing.quantity);
            }
          }
        }
      }
    }

    return ingredients;
  }, [mealPlan, recipes]);

  const handleDownloadShoppingList = useCallback(() => {
    // TODO: Implement PDF generation or share
    const list = Object.entries(shoppingList)
      .map(([ingredient, quantity]) => `${quantity} ${ingredient}`)
      .join('\n');

    console.log('Shopping List:\n', list);
  }, [shoppingList]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ArrowLeft size={24} color={COLORS.textPrimary} strokeWidth={2} />
          </Pressable>
          <Text style={styles.headerTitle}>Meal Plan</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!mealPlan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ArrowLeft size={24} color={COLORS.textPrimary} strokeWidth={2} />
          </Pressable>
          <Text style={styles.headerTitle}>Meal Plan</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.notFoundContainer}>
          <ChefHat size={56} color={COLORS.textMuted} strokeWidth={1.5} />
          <Text style={styles.notFoundText}>Meal plan not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const sortedDays = [...mealPlan.days].sort((a, b) => a.day - b.day);

  const MealDayCard = ({ day }: { day: MealPlanDay }) => {
    const getRecipeTitle = (recipeId: string) => {
      return recipes[recipeId]?.title || 'Unknown Recipe';
    };

    return (
      <View style={styles.dayCard}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayTitle}>Day {day.day}</Text>
        </View>

        <View style={styles.mealsContainer}>
          {day.breakfast && (
            <MealItem
              label="Breakfast"
              recipeName={getRecipeTitle(day.breakfast.recipeId)}
              servings={day.breakfast.servings}
            />
          )}
          {day.lunch && (
            <MealItem
              label="Lunch"
              recipeName={getRecipeTitle(day.lunch.recipeId)}
              servings={day.lunch.servings}
            />
          )}
          {day.dinner && (
            <MealItem
              label="Dinner"
              recipeName={getRecipeTitle(day.dinner.recipeId)}
              servings={day.dinner.servings}
            />
          )}
          {day.snacks && day.snacks.length > 0 && (
            <View style={styles.snacksSection}>
              <Text style={styles.snacksLabel}>Snacks</Text>
              {day.snacks.map((snack) => (
                <Text key={snack.recipeId} style={styles.snackItem}>
                  • {getRecipeTitle(snack.recipeId)} ({snack.servings}x)
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft size={24} color={COLORS.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Meal Plan</Text>
        <Pressable onPress={handleDownloadShoppingList} hitSlop={12}>
          <Download size={24} color={COLORS.primary} strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <Text style={styles.planName}>{mealPlan.name}</Text>
          <Text style={styles.planMeta}>
            {mealPlan.duration} days • {sortedDays.length} meals
          </Text>
        </View>

        <View>
          {sortedDays.map((day) => (
            <MealDayCard key={day.day} day={day} />
          ))}
        </View>

        {Object.keys(shoppingList).length > 0 && (
          <View style={styles.shoppingListPreview}>
            <Text style={styles.shoppingListTitle}>Shopping List Preview</Text>
            {Object.entries(shoppingList)
              .slice(0, 5)
              .map(([ingredient, quantity]) => (
                <Text key={ingredient} style={styles.shoppingItem}>
                  • {quantity} {ingredient}
                </Text>
              ))}
            {Object.keys(shoppingList).length > 5 && (
              <Text style={styles.shoppingMore}>
                + {Object.keys(shoppingList).length - 5} more items
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MealItem({
  label,
  recipeName,
  servings,
}: {
  label: string;
  recipeName: string;
  servings: number;
}) {
  return (
    <View style={styles.mealItem}>
      <Text style={styles.mealLabel}>{label}</Text>
      <View style={styles.mealContent}>
        <Text style={styles.mealRecipe}>{recipeName}</Text>
        <Text style={styles.mealServings}>{servings}x</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.headingMedium,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.lg,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: FONT_SIZES.bodyMedium,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  planName: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  planMeta: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textMuted,
  },
  dayCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  dayHeader: {
    backgroundColor: COLORS.accentBackground,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dayTitle: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '600',
    color: COLORS.primary,
  },
  mealsContainer: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  mealItem: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: SPACING.md,
  },
  mealLabel: {
    fontSize: FONT_SIZES.bodySmall,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mealContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  mealRecipe: {
    fontSize: FONT_SIZES.bodyMedium,
    fontWeight: '500',
    color: COLORS.textPrimary,
    flex: 1,
  },
  mealServings: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textMuted,
    marginLeft: SPACING.md,
  },
  snacksSection: {
    marginTop: SPACING.sm,
  },
  snacksLabel: {
    fontSize: FONT_SIZES.bodySmall,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  snackItem: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textPrimary,
    marginLeft: SPACING.md,
  },
  shoppingListPreview: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  shoppingListTitle: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  shoppingItem: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  shoppingMore: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: SPACING.sm,
  },
});
