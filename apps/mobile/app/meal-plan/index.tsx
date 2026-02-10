import { Stack, router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PencilSquareIcon,
  TrashIcon,
} from 'react-native-heroicons/outline';
import { ShoppingBagIcon } from 'react-native-heroicons/solid';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MealSlotPicker } from '../../components/meal-plan/MealSlotPicker';
import { useMealPlanGeneration } from '../../hooks/useMealPlanGeneration';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import { useGroceryStore } from '../../stores/grocery';
import { useMealPlanStore } from '../../stores/mealPlan';
import { useRecipeStore } from '../../stores/recipe';

type MealType = 'breakfast' | 'lunch' | 'dinner';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];
const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
};
const MEAL_EMOJI: Record<MealType, string> = {
  breakfast: '\u2615',
  lunch: '\uD83C\uDF5C',
  dinner: '\uD83C\uDF7D\uFE0F',
};

const PLAN_OPTIONS = [
  { days: 3, label: '3 Days', emoji: '\uD83C\uDF73' },
  { days: 5, label: '5 Days', emoji: '\uD83E\uDD57' },
  { days: 7, label: '7 Days', emoji: '\uD83C\uDF7D\uFE0F' },
];

export default function MealPlanScreen() {
  const insets = useSafeAreaInsets();
  const {
    mealPlans,
    currentPlanId,
    error,
    setCurrentPlan,
    deleteMealPlan,
    setMealForDay,
    removeMealFromDay,
    clearError,
  } = useMealPlanStore();
  const { recipes } = useRecipeStore();
  const { addFromMealPlan } = useGroceryStore();
  const { generateForAllRecipes } = useMealPlanGeneration();

  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [slotPicker, setSlotPicker] = useState<{
    visible: boolean;
    day: number;
    mealType: MealType;
    currentRecipeId?: string;
  }>({ visible: false, day: 1, mealType: 'breakfast' });

  const planList = useMemo(
    () => Object.values(mealPlans).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [mealPlans]
  );

  const currentPlan = currentPlanId ? mealPlans[currentPlanId] : null;

  const handleGenerate = useCallback(
    async (days: number) => {
      try {
        setIsGenerating(true);
        await generateForAllRecipes({ duration: days });
        setExpandedDay(1);
      } catch (_err) {
        // error handled in store
      } finally {
        setIsGenerating(false);
      }
    },
    [generateForAllRecipes]
  );

  const handleDelete = useCallback(() => {
    if (!currentPlanId) return;
    Alert.alert('Delete Plan', 'Are you sure you want to delete this meal plan?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMealPlan(currentPlanId),
      },
    ]);
  }, [currentPlanId, deleteMealPlan]);

  const handleAddToGrocery = useCallback(() => {
    if (!currentPlan) return;
    addFromMealPlan(currentPlan, recipes);
    router.push('/grocery');
  }, [currentPlan, recipes, addFromMealPlan]);

  const toggleDay = useCallback((day: number) => {
    setExpandedDay((prev) => (prev === day ? null : day));
  }, []);

  const getRecipeTitle = useCallback(
    (id: string) => recipes[id]?.title || 'Unknown Recipe',
    [recipes]
  );

  const openSlotPicker = useCallback(
    (day: number, mealType: MealType, currentRecipeId?: string) => {
      setSlotPicker({ visible: true, day, mealType, currentRecipeId });
    },
    []
  );

  const handleSlotSelect = useCallback(
    (recipeId: string, servings: number) => {
      if (!currentPlanId) return;
      setMealForDay(currentPlanId, slotPicker.day, slotPicker.mealType, recipeId, servings);
    },
    [currentPlanId, slotPicker.day, slotPicker.mealType, setMealForDay]
  );

  const handleSlotRemove = useCallback(() => {
    if (!currentPlanId) return;
    removeMealFromDay(currentPlanId, slotPicker.day, slotPicker.mealType);
  }, [currentPlanId, slotPicker.day, slotPicker.mealType, removeMealFromDay]);

  // ---------- RENDER ----------

  const renderPlanChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsContainer}
      style={styles.chipsScroll}
    >
      {planList.map((plan) => {
        const isActive = plan.id === currentPlanId;
        return (
          <Pressable
            key={plan.id}
            onPress={() => setCurrentPlan(plan.id)}
            style={[styles.chip, isActive && styles.chipActive]}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]} numberOfLines={1}>
              {plan.name}
            </Text>
            <Text style={[styles.chipDuration, isActive && styles.chipDurationActive]}>
              {plan.duration}d
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  const renderMealRow = (
    day: number,
    mealType: MealType,
    meal?: { recipeId: string; servings: number }
  ) => (
    <Pressable
      key={mealType}
      onPress={() => openSlotPicker(day, mealType, meal?.recipeId)}
      style={styles.mealRow}
    >
      <Text style={styles.mealEmoji}>{MEAL_EMOJI[mealType]}</Text>
      <View style={styles.mealContent}>
        <Text style={styles.mealLabel}>{MEAL_LABELS[mealType]}</Text>
        {meal ? (
          <Text style={styles.mealRecipe} numberOfLines={1}>
            {getRecipeTitle(meal.recipeId)}
          </Text>
        ) : (
          <Text style={styles.mealEmpty}>+ Add {MEAL_LABELS[mealType]}</Text>
        )}
      </View>
      <PencilSquareIcon size={16} color={COLORS.textMuted} />
    </Pressable>
  );

  const renderActivePlan = () => {
    if (!currentPlan) return null;

    return (
      <>
        {/* Plan info card */}
        <View style={styles.planInfoCard}>
          <View>
            <Text style={styles.planTitle}>{currentPlan.name}</Text>
            <Text style={styles.planSubtitle}>
              {currentPlan.days.length} days
              {currentPlan.updatedAt
                ? ` \u00B7 ${new Date(currentPlan.updatedAt).toLocaleDateString()}`
                : ''}
            </Text>
          </View>
        </View>

        {/* Day accordion cards */}
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
                <Pressable onPress={() => toggleDay(day.day)} style={styles.dayHeader}>
                  <Text style={styles.dayTitle}>Day {day.day}</Text>
                  <View style={styles.dayHeaderRight}>
                    <Text style={styles.dayMealCount}>
                      {[day.breakfast, day.lunch, day.dinner].filter(Boolean).length}/3 meals
                    </Text>
                    {isExpanded ? (
                      <ChevronUpIcon size={18} color={COLORS.textMuted} />
                    ) : (
                      <ChevronDownIcon size={18} color={COLORS.textMuted} />
                    )}
                  </View>
                </Pressable>

                {isExpanded && (
                  <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.mealsContainer}>
                    {MEAL_TYPES.map((mt) =>
                      renderMealRow(
                        day.day,
                        mt,
                        day[mt] as { recipeId: string; servings: number } | undefined
                      )
                    )}
                  </Animated.View>
                )}
              </Animated.View>
            );
          })}
        </View>
      </>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>{'\uD83D\uDCC5'}</Text>
      <Text style={styles.emptyTitle}>No Meal Plans</Text>
      <Text style={styles.emptySubtitle}>
        Generate a personalized meal plan from your saved recipes.
      </Text>
    </View>
  );

  const renderGenerateSection = () => (
    <View style={styles.generateSection}>
      <Text style={styles.generateLabel}>
        {planList.length > 0 ? 'Generate New Plan' : 'Get Started'}
      </Text>
      <View style={styles.optionsRow}>
        {PLAN_OPTIONS.map((option) => (
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
          <Text style={styles.loadingText}>Generating & optimizing...</Text>
        </View>
      )}
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Meal Plans',
          headerStyle: { backgroundColor: COLORS.background },
          headerShadowVisible: false,
          headerTintColor: COLORS.textPrimary,
          headerRight: () =>
            currentPlan ? (
              <Pressable onPress={handleDelete} hitSlop={12} style={styles.headerDeleteBtn}>
                <TrashIcon size={20} color={COLORS.error} strokeWidth={2} />
              </Pressable>
            ) : null,
        }}
      />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: currentPlan ? 100 : 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Plan selector chips */}
          {planList.length > 0 && renderPlanChips()}

          {/* Active plan or empty state */}
          {currentPlan ? renderActivePlan() : renderEmptyState()}

          {/* Generate section */}
          {renderGenerateSection()}
        </ScrollView>

        {/* Bottom grocery CTA */}
        {currentPlan && (
          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + SPACING.md }]}>
            <Pressable onPress={handleAddToGrocery} style={styles.groceryButton}>
              <ShoppingBagIcon size={20} color={COLORS.textInverse} />
              <Text style={styles.groceryButtonText}>Add to Grocery List</Text>
            </Pressable>
          </View>
        )}

        {/* Error banner */}
        {error && (
          <Pressable onPress={clearError} style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </Pressable>
        )}
      </View>

      {/* Meal slot picker modal */}
      <MealSlotPicker
        visible={slotPicker.visible}
        onClose={() => setSlotPicker((s) => ({ ...s, visible: false }))}
        mealType={slotPicker.mealType}
        day={slotPicker.day}
        currentRecipeId={slotPicker.currentRecipeId}
        onSelectRecipe={handleSlotSelect}
        onRemoveMeal={handleSlotRemove}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },

  // Header
  headerDeleteBtn: {
    marginRight: SPACING.xs,
  },

  // Plan chips
  chipsScroll: {
    marginHorizontal: -SPACING.lg,
    marginBottom: SPACING.md,
  },
  chipsContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: FONT_SIZES.bodySmall,
    fontWeight: '600',
    color: COLORS.textPrimary,
    maxWidth: 120,
  },
  chipTextActive: {
    color: COLORS.textInverse,
  },
  chipDuration: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  chipDurationActive: {
    color: 'rgba(255,255,255,0.7)',
  },

  // Plan info
  planInfoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  planTitle: {
    fontSize: FONT_SIZES.headingMedium,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  planSubtitle: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Day cards
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
  dayHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dayTitle: {
    fontSize: FONT_SIZES.headingSmall,
    fontWeight: '600',
    color: COLORS.primary,
  },
  dayMealCount: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  mealsContainer: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.md,
  },

  // Meal rows
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
  },
  mealEmoji: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  mealContent: {
    flex: 1,
  },
  mealLabel: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mealRecipe: {
    fontSize: FONT_SIZES.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginTop: 1,
  },
  mealEmpty: {
    fontSize: FONT_SIZES.bodyMedium,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: 1,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
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
    paddingHorizontal: SPACING.lg,
  },

  // Generate section
  generateSection: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  generateLabel: {
    fontSize: FONT_SIZES.headingSmall,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
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
  loadingContainer: {
    marginTop: SPACING.md,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadingText: {
    fontSize: FONT_SIZES.bodyMedium,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.lg,
  },
  groceryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
  },
  groceryButtonText: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '600',
    color: COLORS.textInverse,
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
