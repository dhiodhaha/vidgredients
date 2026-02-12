import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AccordionSection } from '../../components/home/AccordionSection';
import { AddVideoModal } from '../../components/home/AddVideoModal';
import { FloatingActionButton } from '../../components/home/FloatingActionButton';
import { HomeRecipeItem } from '../../components/home/HomeRecipeItem';
import { HomeSearchInput } from '../../components/home/HomeSearchInput';
import { COLORS, FONT_SIZES, SPACING } from '../../lib/theme';
import { useRecipeStore } from '../../stores/recipe';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  const recipes = useRecipeStore((state) => state.recipes);
  const analyzeVideo = useRecipeStore((state) => state.analyzeVideo);

  // Categorize recipes
  const { allRecipes, recentRecipes, quickRecipes, dinnerRecipes } = useMemo(() => {
    const all = Object.values(recipes).reverse(); // Newest first
    const quick = all.filter((r) => (r.cookTimeMinutes || 0) <= 30);
    // For now, "Dinner Ideas" can be a random subset or everything if we don't have mealType
    // Let's just use 'all' for now or filter by tags if available.
    // Assuming 'dinner' might not be populate, let's just take a slice or randomize?
    // Let's just use all for now but sliced to avoid duplication visually if possible,
    // or just show all again.
    const dinner = all;

    return {
      allRecipes: all,
      recentRecipes: all,
      quickRecipes: quick,
      dinnerRecipes: dinner,
    };
  }, [recipes]);

  const handleRecipePress = useCallback((recipeId: string) => {
    router.push(`/recipe/${recipeId}`);
  }, []);

  const handleAddVideo = useCallback(
    async (url: string) => {
      const recipeId = await analyzeVideo(url);
      router.push(`/recipe/${recipeId}`);
    },
    [analyzeVideo]
  );

  const handleOpenModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  // Filter for search
  const displayRecipes = useMemo(() => {
    if (!searchQuery) return allRecipes;
    const lowerQuery = searchQuery.toLowerCase();
    return allRecipes.filter((r) => r.title.toLowerCase().includes(lowerQuery));
  }, [allRecipes, searchQuery]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>What are we{'\n'}eating?</Text>
        <View style={styles.searchContainer}>
          <HomeSearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search recipes (e.g. Pasta)"
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {searchQuery ? (
          /* Search Results */
          <View style={styles.sectionList}>
            <Text style={styles.searchResultsTitle}>Search Results ({displayRecipes.length})</Text>
            {displayRecipes.map((recipe) => (
              <HomeRecipeItem
                key={recipe.id}
                id={recipe.id}
                title={recipe.title}
                thumbnailUrl={recipe.thumbnailUrl}
                ingredientsCount={recipe.ingredients.length}
                sourceType={
                  recipe.sourceUrl?.includes('tiktok')
                    ? 'TIKTOK'
                    : recipe.sourceUrl?.includes('youtube')
                      ? 'YOUTUBE'
                      : 'UNKNOWN'
                }
                onPress={handleRecipePress}
              />
            ))}
          </View>
        ) : (
          /* Accordion Sections */
          <>
            <AccordionSection title="Recently Added" count={recentRecipes.length} initialExpanded>
              {recentRecipes.map((recipe) => (
                <HomeRecipeItem
                  key={recipe.id}
                  id={recipe.id}
                  title={recipe.title}
                  thumbnailUrl={recipe.thumbnailUrl}
                  ingredientsCount={recipe.ingredients.length}
                  sourceType={
                    recipe.sourceUrl?.includes('tiktok')
                      ? 'TIKTOK'
                      : recipe.sourceUrl?.includes('youtube')
                        ? 'YOUTUBE'
                        : 'UNKNOWN'
                  }
                  onPress={handleRecipePress}
                />
              ))}
            </AccordionSection>

            <AccordionSection title="Quick Meals" count={quickRecipes.length}>
              {quickRecipes.map((recipe) => (
                <HomeRecipeItem
                  key={`quick-${recipe.id}`}
                  id={recipe.id}
                  title={recipe.title}
                  thumbnailUrl={recipe.thumbnailUrl}
                  ingredientsCount={recipe.ingredients.length}
                  sourceType={
                    recipe.sourceUrl?.includes('tiktok')
                      ? 'TIKTOK'
                      : recipe.sourceUrl?.includes('youtube')
                        ? 'YOUTUBE'
                        : 'UNKNOWN'
                  }
                  onPress={handleRecipePress}
                />
              ))}
            </AccordionSection>

            <AccordionSection title="Dinner Ideas" count={dinnerRecipes.length}>
              {dinnerRecipes.map((recipe) => (
                <HomeRecipeItem
                  key={`dinner-${recipe.id}`}
                  id={recipe.id}
                  title={recipe.title}
                  thumbnailUrl={recipe.thumbnailUrl}
                  ingredientsCount={recipe.ingredients.length}
                  sourceType={
                    recipe.sourceUrl?.includes('tiktok')
                      ? 'TIKTOK'
                      : recipe.sourceUrl?.includes('youtube')
                        ? 'YOUTUBE'
                        : 'UNKNOWN'
                  }
                  onPress={handleRecipePress}
                />
              ))}
            </AccordionSection>
          </>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton onPress={handleOpenModal} />

      {/* Add Video Modal */}
      <AddVideoModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSubmit={handleAddVideo}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: FONT_SIZES.displayMedium,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    lineHeight: 42,
  },
  searchContainer: {
    marginBottom: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Space for FAB
    paddingTop: SPACING.sm,
  },
  sectionList: {
    paddingTop: SPACING.md,
  },
  searchResultsTitle: {
    fontSize: FONT_SIZES.headingSmall,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: SPACING.lg,
    marginBottom: SPACING.md,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: COLORS.textPrimary,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textInverse,
  },
});
