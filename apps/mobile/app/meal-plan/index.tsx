import { Stack } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronDownIcon, ChevronUpIcon } from 'react-native-heroicons/outline';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { useMealPlanGeneration } from '../../hooks/useMealPlanGeneration';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import { useMealPlanStore } from '../../stores/mealPlan';
import { useRecipeStore } from '../../stores/recipe';

const MEAL_PLAN_OPTIONS = [
  { days: 3, label: '3 Days', emoji: '🍳' },
  { days: 5, label: '5 Days', emoji: '🥗' },
  { days: 7, label: '7 Days', emoji: '🍽️' },
];

export default function MealPlanScreen() {
  const { currentPlan, isLoading, error } = useMealPlanStore();
  const { recipes } = useRecipeStore();
  const { generateForAllRecipes } = useMealPlanGeneration();
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(1); // Default expand day 1

  const handleGenerate = useCallback(
    async (days: number) => {
      try {
        setIsGenerating(true);
        await generateForAllRecipes({ duration: days });
      } catch (err) {
        console.error('Failed to generate plan:', err);
      } finally {
        setIsGenerating(false);
      }
    },
    [generateForAllRecipes]
  );

  const toggleDay = useCallback((day: number) => {
    setExpandedDay((prev) => (prev === day ? null : day));
  }, []);

  const getRecipeTitle = useCallback(
    (id: string) => {
      return recipes[id]?.title || 'Unknown Recipe';
    },
    [recipes]
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📅</Text>
      <Text style={styles.emptyTitle}>No Meal Plan Yet</Text>
      <Text style={styles.emptySubtitle}>
        Let AI generate a personalized meal plan for you based on your saved recipes.
      </Text>

      <Text style={styles.sectionLabel}>Generate New Plan</Text>
      <View style={styles.optionsRow}>
        {MEAL_PLAN_OPTIONS.map((option) => (
          <Pressable
            key={option.days}
            onPress={() => handleGenerate(option.days)}
            style={({ pressed }) => [styles.optionButton, pressed && styles.optionPressed]}
            disabled={isGenerating}
          >
            <Text style={styles.optionEmoji}>{option.emoji}</Text>
            <Text style={styles.optionLabel}>{option.label}</Text>
          </Pressable>
        ))}
      </View>
      {isGenerating && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            Generating & Optimizing your plan...
          </Text>
        </View>
      )}
    </View>
  );

  const renderMealPlan = () => {
    if (!currentPlan) return null;

    return (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.planHeader}>
          <View>
            <Text style={styles.planTitle}>{currentPlan.name}</Text>
            <Text style={styles.planSubtitle}>{currentPlan.days.length} Days • Optimized</Text>
          </View>
          <Pressable
            onPress={() => handleGenerate(currentPlan.duration)}
            style={({ pressed }) => [styles.regenerateButton, pressed && styles.opacityPressed]}
            disabled={isGenerating}
          >
            <Text style={styles.regenerateText}>🔄 Refresh</Text>
          </Pressable>
        </View>

        {isGenerating ? (
           <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Optimizing new plan...</Text>
          </View>
        ) : (
          <View style={styles.daysList}>
            {currentPlan.days.map((day) => {
              const isExpanded = expandedDay === day.day;
              return (
                <Animated.View 
                  key={day.day} 
                  style={styles.dayCard}
                  layout={Layout.springify()}
                  entering={FadeIn}
                >
                  <Pressable 
                    onPress={() => toggleDay(day.day)}
                    style={styles.dayHeader}
                  >
                    <Text style={styles.dayTitle}>Day {day.day}</Text>
                    {isExpanded ? (
                      <ChevronUpIcon size={20} color={COLORS.textMuted} />
                    ) : (
                      <ChevronDownIcon size={20} color={COLORS.textMuted} />
                    )}
                  </Pressable>

                  {isExpanded && (
                    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.mealsContainer}>
                      {/* Breakfast */}
                      {day.breakfast && (
                        <View style={styles.mealRow}>
                          <Text style={styles.mealLabel}>Breakfast</Text>
                          <Text style={styles.mealRecipe} numberOfLines={1}>
                            {getRecipeTitle(day.breakfast.recipeId)}
                          </Text>
                        </View>
                      )}
                      
                      {/* Lunch */}
                      {day.lunch && (
                        <View style={styles.mealRow}>
                          <Text style={styles.mealLabel}>Lunch</Text>
                          <Text style={styles.mealRecipe} numberOfLines={1}>
                            {getRecipeTitle(day.lunch.recipeId)}
                          </Text>
                        </View>
                      )}

                      {/* Dinner */}
                      {day.dinner && (
                        <View style={styles.mealRow}>
                          <Text style={styles.mealLabel}>Dinner</Text>
                          <Text style={styles.mealRecipe} numberOfLines={1}>
                            {getRecipeTitle(day.dinner.recipeId)}
                          </Text>
                        </View>
                      )}
                    </Animated.View>
                  )}
                </Animated.View>
              );
            })}
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Meal Plan',
          headerStyle: { backgroundColor: COLORS.background },
          headerShadowVisible: false,
          headerTintColor: COLORS.textPrimary,
        }}
      />
      <View style={styles.container}>
        {currentPlan ? renderMealPlan() : renderEmptyState()}
        {error && (
          <View style={styles.errorBanner}>
             <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.displaySmall,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.bodyLarge,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.headingSmall,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  optionButton: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  optionPressed: {
    backgroundColor: COLORS.accentBackground,
    borderColor: COLORS.primary,
  },
  optionEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  optionLabel: {
    fontSize: FONT_SIZES.bodyMedium,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  // Loading
  loadingContainer: {
    marginTop: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadingText: {
    fontSize: FONT_SIZES.bodyMedium,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  // Active Plan
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  planTitle: {
    fontSize: FONT_SIZES.headingMedium,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  planSubtitle: {
    fontSize: FONT_SIZES.bodyMedium,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  regenerateButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  regenerateText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  opacityPressed: {
    opacity: 0.7,
  },
  daysList: {
    gap: SPACING.md,
  },
  dayCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayTitle: {
    fontSize: FONT_SIZES.headingSmall,
    fontWeight: '600',
    color: COLORS.primary,
  },
  mealsContainer: {
    marginTop: SPACING.md,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.md,
  },
  mealRow: {
    gap: 4,
  },
  mealLabel: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mealRecipe: {
    fontSize: FONT_SIZES.bodyLarge,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  // Error
  errorBanner: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FEE2E2',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#B91C1C',
    textAlign: 'center',
    fontWeight: '500',
  },
});
