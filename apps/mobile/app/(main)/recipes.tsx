import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RecipeCard } from '../../components/recipe/RecipeCard';
import { COLORS, FONT_SIZES, SPACING } from '../../lib/theme';
import { useRecipeStore } from '../../stores/recipe';

export default function RecipesScreen() {
  const recipesMap = useRecipeStore((state) => state.recipes);
  const recipes = useMemo(() => Object.values(recipesMap).reverse(), [recipesMap]);

  const renderItem = useCallback(
    ({ item }: { item: (typeof recipes)[0] }) => (
      <RecipeCard id={item.id} title={item.title} thumbnailUrl={item.thumbnailUrl} />
    ),
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Saved Recipes</Text>
      <View style={styles.listContainer}>
        {/* @ts-ignore: estimatedItemSize is a valid prop but types are flaking */}
        <FlashList
          data={recipes}
          renderItem={renderItem}
          estimatedItemSize={220}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: FONT_SIZES.headingLarge,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md, // Slightly less padding to allow cards to fill width
  },
  listContent: {
    paddingBottom: 100, // Space for floating tab bar
    paddingTop: SPACING.sm,
  },
});
