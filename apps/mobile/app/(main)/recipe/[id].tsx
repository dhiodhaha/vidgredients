import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IngredientItem } from '../../../components/recipe/IngredientItem';
import { RecipeHeader } from '../../../components/recipe/RecipeHeader';
import { ServingsAdjuster } from '../../../components/recipe/ServingsAdjuster';
import { StepItem } from '../../../components/recipe/StepItem';
import { useRecipeStore } from '../../../stores/recipe';

type TabType = 'ingredients' | 'method' | 'nutrition';

export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = useRecipeStore((state) => state.recipes[id]);

  const [activeTab, setActiveTab] = useState<TabType>('ingredients');
  const [servings, setServings] = useState(recipe?.servings ?? 4);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [unitSystem, setUnitSystem] = useState<'US' | 'METRIC'>('US');

  const handleStepToggle = useCallback((stepNumber: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNumber)) {
        next.delete(stepNumber);
      } else {
        next.add(stepNumber);
      }
      return next;
    });
  }, []);

  const renderIngredient = useCallback(
    ({ item }: { item: (typeof recipe.ingredients)[0] }) => (
      <IngredientItem
        id={item.id}
        name={item.name}
        quantity={item.quantity}
        unit={item.unit}
        imageUrl={item.imageUrl}
      />
    ),
    []
  );

  const renderStep = useCallback(
    ({ item }: { item: (typeof recipe.steps)[0] }) => (
      <StepItem
        stepNumber={item.order}
        description={item.description}
        isCompleted={completedSteps.has(item.order)}
        onToggle={handleStepToggle}
        highlightedWords={item.highlightedWords}
      />
    ),
    [completedSteps, handleStepToggle]
  );

  const keyExtractorIngredient = useCallback((item: (typeof recipe.ingredients)[0]) => item.id, []);

  const keyExtractorStep = useCallback((item: (typeof recipe.steps)[0]) => String(item.order), []);

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Recipe not found</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerTransparent: true,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {/* Thumbnail */}
        <Image source={{ uri: recipe.thumbnailUrl }} style={styles.thumbnail} contentFit="cover" />

        <View style={styles.content}>
          <RecipeHeader
            title={recipe.title}
            activeTab={activeTab}
            onTabChange={setActiveTab as (tab: string) => void}
          />

          {activeTab === 'ingredients' ? (
            <View style={styles.listContainer}>
              <ServingsAdjuster
                servings={servings}
                onServingsChange={setServings}
                unitSystem={unitSystem}
                onUnitSystemChange={setUnitSystem}
              />
              <FlashList
                data={recipe.ingredients}
                renderItem={renderIngredient}
                keyExtractor={keyExtractorIngredient}
                estimatedItemSize={60}
                showsVerticalScrollIndicator={false}
              />
            </View>
          ) : activeTab === 'method' ? (
            <View style={styles.listContainer}>
              <FlashList
                data={recipe.steps}
                renderItem={renderStep}
                keyExtractor={keyExtractorStep}
                estimatedItemSize={120}
                showsVerticalScrollIndicator={false}
              />
            </View>
          ) : (
            <View style={styles.nutritionContainer}>
              {recipe.nutrition ? (
                <>
                  <NutritionItem label="Calories" value={recipe.nutrition.calories} unit="kcal" />
                  <NutritionItem label="Protein" value={recipe.nutrition.protein} unit="g" />
                  <NutritionItem label="Carbs" value={recipe.nutrition.carbs} unit="g" />
                  <NutritionItem label="Fat" value={recipe.nutrition.fat} unit="g" />
                </>
              ) : (
                <Text style={styles.noDataText}>Nutrition data not available</Text>
              )}
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}

function NutritionItem({ label, value, unit }: { label: string; value?: number; unit: string }) {
  return (
    <View style={styles.nutritionItem}>
      <Text style={styles.nutritionLabel}>{label}</Text>
      <Text style={styles.nutritionValue}>{value !== undefined ? `${value} ${unit}` : '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  thumbnail: {
    width: '100%',
    height: 200,
  },
  content: {
    flex: 1,
    marginTop: -20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  nutritionContainer: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  nutritionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  nutritionLabel: {
    fontSize: 16,
    color: '#374151',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  noDataText: {
    fontSize: 16,
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#374151',
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
