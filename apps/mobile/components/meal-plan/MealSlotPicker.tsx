import type { Recipe } from '@shared/types';
import { Image } from 'expo-image';
import { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MagnifyingGlassIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { CheckCircleIcon } from 'react-native-heroicons/solid';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../lib/theme';
import { useRecipeStore } from '../../stores/recipe';

type MealType = 'breakfast' | 'lunch' | 'dinner';

interface MealSlotPickerProps {
  visible: boolean;
  onClose: () => void;
  mealType: MealType;
  day: number;
  currentRecipeId?: string;
  onSelectRecipe: (recipeId: string, servings: number) => void;
  onRemoveMeal: () => void;
}

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
};

export const MealSlotPicker = memo(function MealSlotPicker({
  visible,
  onClose,
  mealType,
  day,
  currentRecipeId,
  onSelectRecipe,
  onRemoveMeal,
}: MealSlotPickerProps) {
  const insets = useSafeAreaInsets();
  const { recipes } = useRecipeStore();
  const [search, setSearch] = useState('');

  const recipeList = useMemo(() => Object.values(recipes), [recipes]);

  const filtered = useMemo(() => {
    if (!search.trim()) return recipeList;
    const q = search.toLowerCase();
    return recipeList.filter((r) => r.title.toLowerCase().includes(q));
  }, [recipeList, search]);

  const handleSelect = useCallback(
    (recipe: Recipe) => {
      onSelectRecipe(recipe.id, recipe.servings);
      setSearch('');
      onClose();
    },
    [onSelectRecipe, onClose]
  );

  const handleRemove = useCallback(() => {
    onRemoveMeal();
    setSearch('');
    onClose();
  }, [onRemoveMeal, onClose]);

  const renderRecipe = useCallback(
    ({ item }: { item: Recipe }) => {
      const isCurrent = item.id === currentRecipeId;
      return (
        <Pressable
          onPress={() => handleSelect(item)}
          style={[styles.recipeRow, isCurrent && styles.recipeRowActive]}
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
            <Text style={styles.recipeMeta}>
              {item.ingredients.length} ingredients
              {item.cookTimeMinutes ? ` \u00B7 ${item.cookTimeMinutes} min` : ''}
            </Text>
          </View>
          {isCurrent && <CheckCircleIcon size={22} color={COLORS.primary} />}
        </Pressable>
      );
    },
    [currentRecipeId, handleSelect]
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>
              Day {day} {MEAL_LABELS[mealType]}
            </Text>
            <Text style={styles.headerSubtitle}>Choose a recipe</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={12}>
            <XMarkIcon size={24} color={COLORS.textPrimary} strokeWidth={2} />
          </Pressable>
        </View>

        {/* Remove meal option */}
        {currentRecipeId && (
          <Pressable onPress={handleRemove} style={styles.removeRow}>
            <Text style={styles.removeText}>Remove {MEAL_LABELS[mealType]}</Text>
          </Pressable>
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

        {/* Recipe list */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderRecipe}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <Text style={styles.emptyText}>No recipes found</Text>
            </View>
          }
        />
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
  headerSubtitle: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  removeRow: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  removeText: {
    fontSize: FONT_SIZES.bodyMedium,
    fontWeight: '600',
    color: COLORS.error,
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
  listContent: {
    paddingBottom: 40,
  },
  recipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    gap: 12,
  },
  recipeRowActive: {
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
  recipeMeta: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  emptyList: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.bodyMedium,
    color: COLORS.textMuted,
  },
});
