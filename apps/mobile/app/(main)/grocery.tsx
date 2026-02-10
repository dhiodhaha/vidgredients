import type { GroceryCategory, GroceryItem, Recipe } from '@shared/types';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Plus, ShoppingBag, Sparkle, Trash } from 'phosphor-react-native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GroceryItemRow } from '../../components/grocery/GroceryItem';
import { RecipePicker } from '../../components/grocery/RecipePicker';
import { COLORS, FONT_SIZES, GRADIENTS, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import { CATEGORY_EMOJI, useGroceryStore } from '../../stores/grocery';
import { useMealPlanStore } from '../../stores/mealPlan';
import { useRecipeStore } from '../../stores/recipe';

const CATEGORY_ORDER: GroceryCategory[] = [
  'Produce',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Grains & Bread',
  'Pantry',
  'Spices & Seasonings',
  'Frozen',
  'Beverages',
  'Other',
];

export default function GroceryScreen() {
  const {
    items,
    isOptimizing,
    addFromRecipes,
    addFromMealPlan,
    smartMerge,
    toggleItem,
    removeItem,
    clearChecked,
  } = useGroceryStore();
  const { recipes } = useRecipeStore();
  const { mealPlans } = useMealPlanStore();
  const [pickerVisible, setPickerVisible] = useState(false);

  const checkedCount = useMemo(() => items.filter((i) => i.checked).length, [items]);
  const totalCount = items.length;
  const progress = totalCount > 0 ? checkedCount / totalCount : 0;

  // Group items by category into sections
  const sections = useMemo(() => {
    const unchecked = items.filter((i) => !i.checked);
    const checked = items.filter((i) => i.checked);

    const categoryMap = new Map<string, GroceryItem[]>();

    for (const item of unchecked) {
      const cat = item.category ?? 'Other';
      const list = categoryMap.get(cat) ?? [];
      list.push(item);
      categoryMap.set(cat, list);
    }

    // Sort categories in predefined order
    const result: { title: string; emoji: string; data: GroceryItem[] }[] = [];

    for (const cat of CATEGORY_ORDER) {
      const list = categoryMap.get(cat);
      if (list && list.length > 0) {
        result.push({
          title: cat,
          emoji: CATEGORY_EMOJI[cat] ?? '📦',
          data: list.sort((a, b) => a.name.localeCompare(b.name)),
        });
      }
    }

    // Items without categories go under "Uncategorized"
    const hasCategories = unchecked.some((i) => i.category);
    if (!hasCategories && unchecked.length > 0) {
      result.push({
        title: 'Items',
        emoji: '🛒',
        data: unchecked.sort((a, b) => a.name.localeCompare(b.name)),
      });
    }

    // Checked section at the bottom
    if (checked.length > 0) {
      result.push({
        title: 'Completed',
        emoji: '✅',
        data: checked.sort((a, b) => a.name.localeCompare(b.name)),
      });
    }

    return result;
  }, [items]);

  const handleSelectRecipes = useCallback(
    (selected: Recipe[]) => {
      addFromRecipes(selected);
    },
    [addFromRecipes]
  );

  const handleSelectMealPlan = useCallback(
    (mealPlanId: string) => {
      const mealPlan = mealPlans[mealPlanId];
      if (mealPlan) {
        addFromMealPlan(mealPlan, recipes);
      }
    },
    [mealPlans, recipes, addFromMealPlan]
  );

  const renderItem = useCallback(
    ({ item }: { item: GroceryItem }) => (
      <GroceryItemRow
        id={item.id}
        name={item.name}
        quantity={item.quantity}
        unit={item.unit}
        checked={item.checked}
        onToggle={toggleItem}
        onRemove={removeItem}
      />
    ),
    [toggleItem, removeItem]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string; emoji: string; data: GroceryItem[] } }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionEmoji}>{section.emoji}</Text>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <View style={styles.sectionCount}>
          <Text style={styles.sectionCountText}>{section.data.length}</Text>
        </View>
      </View>
    ),
    []
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.textPrimary} weight="bold" />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>Grocery List</Text>
            {totalCount > 0 && (
              <Text style={styles.headerSubtitle}>
                {checkedCount} of {totalCount} items done
              </Text>
            )}
          </View>
        </View>
        <View style={styles.headerActions}>
          {items.length > 0 && (
            <Pressable
              onPress={smartMerge}
              disabled={isOptimizing}
              style={({ pressed }) => [styles.smartButton, pressed && styles.smartButtonPressed]}
            >
              {isOptimizing ? (
                <ActivityIndicator size="small" color={COLORS.textInverse} />
              ) : (
                <>
                  <Sparkle size={16} color={COLORS.textInverse} weight="bold" />
                  <Text style={styles.smartButtonText}>AI Optimize</Text>
                </>
              )}
            </Pressable>
          )}
          <Pressable onPress={() => setPickerVisible(true)} style={styles.addButton} hitSlop={12}>
            <Plus size={22} color={COLORS.textInverse} weight="bold" />
          </Pressable>
        </View>
      </View>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={GRADIENTS.premium}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${Math.max(progress * 100, 2)}%` }]}
            />
          </View>
        </View>
      )}

      {items.length === 0 ? (
        /* Empty State */
        <View style={styles.emptyContainer}>
          <LinearGradient colors={GRADIENTS.subtle} style={styles.emptyIconContainer}>
            <ShoppingBag size={48} color={COLORS.primary} weight="thin" />
          </LinearGradient>
          <Text style={styles.emptyTitle}>Your grocery list is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add ingredients from your recipes or meal plans and let AI optimize your shopping list
          </Text>

          <View style={styles.emptyActions}>
            <Pressable
              onPress={() => setPickerVisible(true)}
              style={({ pressed }) => [styles.emptyButton, pressed && styles.emptyButtonPressed]}
            >
              <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emptyButtonGradient}
              >
                <Plus size={20} color={COLORS.textInverse} weight="bold" />
                <Text style={styles.emptyButtonText}>Add from Recipes</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      ) : (
        /* List State */
        <>
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            stickySectionHeadersEnabled={false}
          />

          {/* Bottom Actions */}
          {checkedCount > 0 && (
            <View style={styles.bottomBar}>
              <Pressable
                onPress={clearChecked}
                style={({ pressed }) => [styles.clearButton, pressed && styles.clearButtonPressed]}
              >
                <Trash size={16} color={COLORS.error} weight="bold" />
                <Text style={styles.clearButtonText}>Clear {checkedCount} checked</Text>
              </Pressable>
            </View>
          )}
        </>
      )}

      {/* Optimizing Overlay */}
      {isOptimizing && (
        <View style={styles.optimizingOverlay}>
          <View style={styles.optimizingCard}>
            <Sparkle size={28} color={COLORS.primary} weight="bold" />
            <Text style={styles.optimizingTitle}>AI is optimizing...</Text>
            <Text style={styles.optimizingSubtitle}>Merging duplicates & categorizing items</Text>
            <ActivityIndicator
              size="small"
              color={COLORS.primary}
              style={styles.optimizingSpinner}
            />
          </View>
        </View>
      )}

      <RecipePicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelectRecipes={handleSelectRecipes}
        onSelectMealPlan={handleSelectMealPlan}
      />
    </SafeAreaView>
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
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.headingLarge,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  smartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
  },
  smartButtonPressed: {
    opacity: 0.8,
  },
  smartButtonText: {
    fontSize: FONT_SIZES.bodySmall,
    fontWeight: '600',
    color: COLORS.textInverse,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  sectionEmoji: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.bodyMedium,
    fontWeight: '700',
    color: COLORS.textSecondary,
    flex: 1,
  },
  sectionCount: {
    backgroundColor: COLORS.borderLight,
    borderRadius: RADIUS.full,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  sectionCountText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  listContent: {
    paddingBottom: 120,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIconContainer: {
    width: 104,
    height: 104,
    borderRadius: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.headingMedium,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.bodyMedium,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: FONT_SIZES.bodyMedium * 1.5,
    marginBottom: SPACING.xl,
    maxWidth: 280,
  },
  emptyActions: {
    width: '100%',
    maxWidth: 260,
  },
  emptyButton: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  emptyButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 16,
  },
  emptyButtonText: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '600',
    color: COLORS.textInverse,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.md,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.error,
  },
  clearButtonPressed: {
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
  },
  clearButtonText: {
    fontSize: FONT_SIZES.bodyMedium,
    fontWeight: '600',
    color: COLORS.error,
  },
  optimizingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  optimizingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    width: 260,
    ...SHADOWS.lg,
  },
  optimizingTitle: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  optimizingSubtitle: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  optimizingSpinner: {
    marginTop: SPACING.lg,
  },
});
