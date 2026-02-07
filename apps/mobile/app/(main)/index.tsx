import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddVideoModal } from '../../components/home/AddVideoModal';
import { EmptyState } from '../../components/home/EmptyState';
import { FloatingActionButton } from '../../components/home/FloatingActionButton';
import { Header } from '../../components/home/Header';
import { MasonryGrid } from '../../components/home/MasonryGrid';
import { MoodFilters, type RecipeFilter } from '../../components/home/MoodFilters';
import { COLORS } from '../../lib/theme';
import { type Recipe, useRecipeStore } from '../../stores/recipe';

// Filter definitions matching MoodFilters component
const FILTER_CONFIG: Record<string, RecipeFilter> = {
  'quick-15': { id: 'quick-15', label: 'Quick', emoji: '⚡', category: 'time', value: 15 },
  'medium-30': { id: 'medium-30', label: '30 min', emoji: '⏱️', category: 'time', value: 30 },
  easy: { id: 'easy', label: 'Easy', emoji: '🍳', category: 'difficulty', value: 'easy' },
  medium: { id: 'medium', label: 'Medium', emoji: '👩‍🍳', category: 'difficulty', value: 'medium' },
  vegetarian: {
    id: 'vegetarian',
    label: 'Vegetarian',
    emoji: '🥗',
    category: 'dietary',
    value: 'vegetarian',
  },
  vegan: { id: 'vegan', label: 'Vegan', emoji: '🌱', category: 'dietary', value: 'vegan' },
  'gluten-free': {
    id: 'gluten-free',
    label: 'GF',
    emoji: '🌾',
    category: 'dietary',
    value: 'gluten-free',
  },
};

// Helper function to filter recipes
function filterRecipes(recipes: Recipe[], filterId: string | null): Recipe[] {
  if (!filterId) return recipes;

  const filterConfig = FILTER_CONFIG[filterId];
  if (!filterConfig) return recipes;

  return recipes.filter((recipe) => {
    switch (filterConfig.category) {
      case 'time':
        // Filter by cook time (show recipes faster or equal to selected time)
        return (
          recipe.cookTimeMinutes != null && recipe.cookTimeMinutes <= (filterConfig.value as number)
        );
      case 'difficulty':
        // Filter by exact difficulty
        return recipe.difficulty === filterConfig.value;
      case 'dietary':
        // Filter by dietary restriction
        if (filterConfig.value === 'vegetarian') return recipe.isVegetarian === true;
        if (filterConfig.value === 'vegan') return recipe.isVegan === true;
        if (filterConfig.value === 'gluten-free') return recipe.isGlutenFree === true;
        return true;
      default:
        return true;
    }
  });
}

export default function HomeScreen() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const recipes = useRecipeStore((state) => state.recipes);
  const analyzeVideo = useRecipeStore((state) => state.analyzeVideo);

  // Convert recipes record to array and apply filter
  const recipeList = useMemo(() => {
    const allRecipes = Object.values(recipes);
    return filterRecipes(allRecipes, activeFilter);
  }, [recipes, activeFilter]);

  const handleMealPlanSelect = useCallback((days: number) => {
    // TODO: Implement meal plan generation
    Alert.alert(
      '🍽️ Coming Soon',
      `Auto-generating a ${days}-day meal plan from your saved recipes will be available soon!`
    );
  }, []);

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with title and meal plan button */}
        <Header onMealPlanSelect={handleMealPlanSelect} />

        {/* Mood filters */}
        <MoodFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />

        {/* Recipe grid or empty state */}
        {recipeList.length > 0 ? (
          <MasonryGrid recipes={recipeList} onRecipePress={handleRecipePress} />
        ) : (
          <EmptyState />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Space for FAB
  },
});
