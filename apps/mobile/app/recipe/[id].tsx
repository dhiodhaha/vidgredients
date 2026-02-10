import { FlashList } from '@shopify/flash-list';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IngredientItem } from '../../components/recipe/IngredientItem';
import { RecipeHeader } from '../../components/recipe/RecipeHeader';
import { ServingsAdjuster } from '../../components/recipe/ServingsAdjuster';
import { StepItem } from '../../components/recipe/StepItem';
import { useRecipeStore } from '../../stores/recipe';

type TabType = 'ingredients' | 'method';

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
  // Helper to parse and scale quantities
  const scaleQuantity = useCallback(
    (qtyString: string, originalServings: number, newServings: number) => {
      if (!qtyString) return '';
      
      // Basic fraction support
      try {
        let numericQty = 0;
        if (qtyString.includes('/')) {
          const [num, den] = qtyString.split('/').map(Number);
          numericQty = num / den;
        } else {
          numericQty = parseFloat(qtyString);
        }

        if (isNaN(numericQty)) return qtyString; // Return original if not a number

        const ratio = newServings / originalServings;
        const newQty = numericQty * ratio;

        // Format nicely (e.g. 0.5 -> 1/2 if you wanted, but decimal is fine for now)
        // Let's stick to max 2 decimals to avoid 1.3333333
        return parseFloat(newQty.toFixed(2)).toString();
      } catch (e) {
        return qtyString;
      }
    },
    []
  );

  const scaledIngredients = useMemo(() => {
    if (!recipe) return [];
    
    // Fallback if recipe.servings is missing/invalid
    const baseServings = recipe.servings || 4; 

    return recipe.ingredients.map(item => ({
      ...item,
      // Scale quantity if it exists
      displayQuantity: scaleQuantity(item.quantity, baseServings, servings)
    }));
  }, [recipe, servings, scaleQuantity]);

  const renderIngredient = useCallback(
    ({ item }: { item: (typeof recipe.ingredients)[0] & { displayQuantity: string } }) => (
      <IngredientItem
        id={item.id}
        name={item.name}
        // Use the scaled quantity
        quantity={item.displayQuantity} 
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
          headerTransparent: false,
          headerTitle: '',
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.headerBackButton, pressed && styles.opacityPressed]}
            >
              <ChevronLeftIcon size={24} color="#3D4A2A" strokeWidth={2.5} />
            </Pressable>
          ),
          headerStyle: {
            backgroundColor: '#FAF7F2',
          },
          headerShadowVisible: false,
        }}
      />
      <View style={styles.container}>
        <View style={styles.content}>
          <RecipeHeader
            title={recipe.title}
            activeTab={activeTab}
            onTabChange={setActiveTab as (tab: string) => void}
          />

          <View style={styles.listContainer}>
            {activeTab === 'ingredients' ? (
              <Animated.View
                key="ingredients"
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
                style={{ flex: 1 }}
              >
                <ServingsAdjuster
                  servings={servings}
                  onServingsChange={setServings}
                  unitSystem={unitSystem}
                  onUnitSystemChange={setUnitSystem}
                />
                {/* Alma: Wrap ingredients in a single container card */}
                <View style={styles.ingredientCard}>
                  <FlashList
                    data={scaledIngredients}
                    renderItem={renderIngredient}
                    keyExtractor={keyExtractorIngredient}
                    estimatedItemSize={84}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              </Animated.View>
            ) : (
              <Animated.View
                key="method"
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
                style={{ flex: 1 }}
              >
                <FlashList
                  data={recipe.steps}
                  renderItem={renderStep}
                  keyExtractor={keyExtractorStep}
                  estimatedItemSize={120}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContent}
                />
              </Animated.View>
            )}
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  content: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 40,
  },
  // Alma: Single container card wrapping all ingredients
  ingredientCard: {
    flex: 1, // Fix: Ensure it fills the space so FlashList can render
    backgroundColor: '#FAF7F2',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0EBE3',
    // Removed marginHorizontal to let it be full width within the container padding if needed, 
    // but looking at listContainer padding (20), this card is already inset.
    // Let's keep margin tight or remove it.
    marginHorizontal: 0, 
    minHeight: 100,
    marginBottom: 20,
    overflow: 'hidden', // Clip content to rounded corners
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#6B6B6B',
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3D4A2A',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerBackButton: {
    padding: 8,
    marginLeft: 0,
    borderRadius: 20,
  },
  opacityPressed: {
    opacity: 0.7,
  },
});
