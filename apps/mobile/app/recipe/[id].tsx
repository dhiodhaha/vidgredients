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
import { Button } from '../../components/ui/Button';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
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
          numericQty = Number.parseFloat(qtyString);
        }

        if (Number.isNaN(numericQty)) return qtyString; // Return original if not a number

        const ratio = newServings / originalServings;
        const newQty = numericQty * ratio;

        // Format nicely (e.g. 0.5 -> 1/2 if you wanted, but decimal is fine for now)
        // Let's stick to max 2 decimals to avoid 1.3333333
        return Number.parseFloat(newQty.toFixed(2)).toString();
      } catch (_e) {
        return qtyString;
      }
    },
    []
  );

  const scaledIngredients = useMemo(() => {
    if (!recipe) return [];

    // Fallback if recipe.servings is missing/invalid
    return recipe.ingredients.map((item: (typeof recipe.ingredients)[0]) => ({
      ...item,
      // Scale quantity if it exists
      displayQuantity: scaleQuantity(item.quantity, recipe.servings || 4, servings),
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
    [recipe]
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
          <Button title="Go Back" onPress={() => router.back()} size="lg" />
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
              <ChevronLeftIcon size={24} color={COLORS.textPrimary} strokeWidth={2.5} />
            </Pressable>
          ),
          headerStyle: {
            backgroundColor: COLORS.background,
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
                <View style={styles.ingredientCard}>
                  {/* @ts-ignore: estimatedItemSize is a valid prop but types are flaking */}
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
                style={{ flex: 1, marginTop: SPACING.md }}
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
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  listContent: {
    paddingBottom: 40,
  },
  ingredientCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginHorizontal: 0,
    minHeight: 100,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  errorText: {
    fontSize: FONT_SIZES.bodyLarge,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    fontWeight: '500',
  },
  headerBackButton: {
    padding: 8,
    marginLeft: 0,
    borderRadius: RADIUS.pill,
  },
  opacityPressed: {
    opacity: 0.7,
  },
});
