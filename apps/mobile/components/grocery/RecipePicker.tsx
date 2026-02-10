import type { Recipe } from '@shared/types';
import { Image } from 'expo-image';
import { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MagnifyingGlassIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { CheckCircleIcon } from 'react-native-heroicons/solid';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import { useMealPlanStore } from '../../stores/mealPlan';
import { useRecipeStore } from '../../stores/recipe';

interface RecipePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectRecipes: (recipes: Recipe[]) => void;
  onSelectMealPlan: (mealPlanId: string) => void;
}

export const RecipePicker = memo(function RecipePicker({
  visible,
  onClose,
  onSelectRecipes,
  onSelectMealPlan,
}: RecipePickerProps) {
  const insets = useSafeAreaInsets();
  const { recipes } = useRecipeStore();
  const { mealPlans } = useMealPlanStore();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const recipeList = useMemo(() => Object.values(recipes), [recipes]);
  const mealPlanList = useMemo(() => Object.values(mealPlans), [mealPlans]);

  const filtered = useMemo(() => {
    if (!search.trim()) return recipeList;
    const q = search.toLowerCase();
    return recipeList.filter((r) => r.title.toLowerCase().includes(q));
  }, [recipeList, search]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === filtered.length) return new Set();
      return new Set(filtered.map((r) => r.id));
    });
  }, [filtered]);

  const handleGenerate = useCallback(() => {
    const selected = recipeList.filter((r) => selectedIds.has(r.id));
    onSelectRecipes(selected);
    setSelectedIds(new Set());
    setSearch('');
    onClose();
  }, [recipeList, selectedIds, onSelectRecipes, onClose]);

  const handleMealPlanSelect = useCallback(
    (id: string) => {
      onSelectMealPlan(id);
      setSelectedIds(new Set());
      setSearch('');
      onClose();
    },
    [onSelectMealPlan, onClose]
  );

  const renderRecipe = useCallback(
    ({ item }: { item: Recipe }) => {
      const isSelected = selectedIds.has(item.id);
      return (
        <Pressable
          onPress={() => toggleSelection(item.id)}
          style={[styles.recipeRow, isSelected && styles.recipeRowSelected]}
        >
          <Image
            source={{ uri: item.thumbnailUrl }}
            style={styles.recipeThumbnail}
            contentFit="cover"
          />
          <View style={styles.recipeInfo}>
            <Text style={styles.recipeTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.recipeMetaRow}>
              <View style={styles.ingredientBadge}>
                <Text style={styles.ingredientBadgeText}>{item.ingredients.length} items</Text>
              </View>
              {item.cookTimeMinutes && (
                <Text style={styles.recipeMeta}>{item.cookTimeMinutes} min</Text>
              )}
            </View>
          </View>
          <View style={[styles.selectionCircle, isSelected && styles.selectionCircleActive]}>
            {isSelected && <CheckCircleIcon size={24} color={COLORS.primary} />}
          </View>
        </Pressable>
      );
    },
    [selectedIds, toggleSelection]
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add Ingredients</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <XMarkIcon size={24} color={COLORS.textPrimary} strokeWidth={2} />
          </Pressable>
        </View>

        {/* Meal Plans Section */}
        {mealPlanList.length > 0 && (
          <View style={styles.mealPlanSection}>
            <Text style={styles.sectionLabel}>FROM MEAL PLANS</Text>
            {mealPlanList.map((mp) => (
              <Pressable
                key={mp.id}
                onPress={() => handleMealPlanSelect(mp.id)}
                style={styles.mealPlanRow}
              >
                <View style={styles.mealPlanIcon}>
                  <Text style={styles.mealPlanEmoji}>{'\uD83D\uDCCB'}</Text>
                </View>
                <View style={styles.recipeInfo}>
                  <Text style={styles.recipeTitle} numberOfLines={1}>
                    {mp.name}
                  </Text>
                  <Text style={styles.recipeMeta}>{mp.duration} days</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Search */}
        <View style={styles.searchContainer}>
          <MagnifyingGlassIcon size={18} color={COLORS.textMuted} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Select All */}
        <View style={styles.selectAllRow}>
          <Text style={styles.sectionLabel}>FROM RECIPES</Text>
          {filtered.length > 0 && (
            <Pressable onPress={toggleAll}>
              <Text style={styles.selectAllText}>
                {selectedIds.size === filtered.length ? 'Deselect All' : 'Select All'}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Recipe List */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderRecipe}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <Text style={styles.emptyEmoji}>{'\uD83C\uDF73'}</Text>
              <Text style={styles.emptyText}>No recipes found</Text>
              <Text style={styles.emptySubtext}>Add some recipes from the home screen first</Text>
            </View>
          }
        />

        {/* Bottom CTA */}
        {selectedIds.size > 0 && (
          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + SPACING.md }]}>
            <Pressable onPress={handleGenerate} style={styles.ctaButton}>
              <Text style={styles.ctaText}>
                Add {selectedIds.size} recipe{selectedIds.size > 1 ? 's' : ''} to list
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
});

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
  mealPlanSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  mealPlanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    gap: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.sm,
  },
  mealPlanIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.accentBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealPlanEmoji: {
    fontSize: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.bodyMedium,
    color: COLORS.textPrimary,
  },
  selectAllRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  selectAllText: {
    fontSize: FONT_SIZES.bodySmall,
    fontWeight: '600',
    color: COLORS.primary,
  },
  listContent: {
    paddingBottom: 120,
  },
  recipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    gap: 12,
  },
  recipeRowSelected: {
    backgroundColor: COLORS.accentBackground,
  },
  recipeThumbnail: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: FONT_SIZES.bodyMedium,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  recipeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  ingredientBadge: {
    backgroundColor: COLORS.accentBackground,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  ingredientBadgeText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  recipeMeta: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textMuted,
  },
  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionCircleActive: {
    borderColor: 'transparent',
  },
  emptyList: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textMuted,
  },
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
  ctaButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '600',
    color: COLORS.textInverse,
  },
});
