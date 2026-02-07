import { FlashList } from '@shopify/flash-list';
import { memo, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SPACING } from '../../lib/theme';
import type { Recipe } from '../../stores/recipe';
import { RecipeCard } from './RecipeCard';

interface MasonryGridProps {
  recipes: Recipe[];
  onRecipePress?: (recipeId: string) => void;
}

// Heights for staggered effect
const CARD_HEIGHTS = [200, 240, 180, 220, 260, 190];

export const MasonryGrid = memo(function MasonryGrid({ recipes, onRecipePress }: MasonryGridProps) {
  // Split recipes into two columns for masonry effect
  const { leftColumn, rightColumn } = useMemo(() => {
    const left: Array<{ recipe: Recipe; height: number }> = [];
    const right: Array<{ recipe: Recipe; height: number }> = [];
    let leftHeight = 0;
    let rightHeight = 0;

    recipes.forEach((recipe, index) => {
      const height = CARD_HEIGHTS[index % CARD_HEIGHTS.length];

      // Add to the shorter column
      if (leftHeight <= rightHeight) {
        left.push({ recipe, height });
        leftHeight += height + SPACING.md;
      } else {
        right.push({ recipe, height });
        rightHeight += height + SPACING.md;
      }
    });

    return { leftColumn: left, rightColumn: right };
  }, [recipes]);

  const renderColumn = useCallback(
    (items: Array<{ recipe: Recipe; height: number }>) => (
      <View style={styles.column}>
        {items.map(({ recipe, height }) => (
          <RecipeCard key={recipe.id} recipe={recipe} height={height} onPress={onRecipePress} />
        ))}
      </View>
    ),
    [onRecipePress]
  );

  if (recipes.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {renderColumn(leftColumn)}
      {renderColumn(rightColumn)}
    </View>
  );
});

// ============================================================================
// Alternative: Virtualized Masonry for large lists
// Uses FlashList with 2 columns - better for 50+ items
// ============================================================================

interface VirtualizedMasonryProps {
  recipes: Recipe[];
  onRecipePress?: (recipeId: string) => void;
}

export const VirtualizedMasonry = memo(function VirtualizedMasonry({
  recipes,
  onRecipePress,
}: VirtualizedMasonryProps) {
  const renderItem = useCallback(
    ({ item, index }: { item: Recipe; index: number }) => (
      <View style={styles.flashListItem}>
        <RecipeCard
          recipe={item}
          height={CARD_HEIGHTS[index % CARD_HEIGHTS.length]}
          onPress={onRecipePress}
        />
      </View>
    ),
    [onRecipePress]
  );

  const keyExtractor = useCallback((item: Recipe) => item.id, []);

  return (
    <FlashList
      data={recipes}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={2}
      contentContainerStyle={styles.flashListContent}
      showsVerticalScrollIndicator={false}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  column: {
    flex: 1,
  },
  flashListContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100, // Space for FAB
  },
  flashListItem: {
    flex: 1,
    paddingHorizontal: SPACING.xs,
  },
});
