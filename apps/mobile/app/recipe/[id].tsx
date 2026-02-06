import { FlashList } from '@shopify/flash-list';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { CaretLeft } from 'phosphor-react-native';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
          headerTransparent: false,
          headerTitle: '',
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.headerBackButton, pressed && styles.opacityPressed]}
            >
              <CaretLeft size={24} color="#064e3b" weight="bold" />
            </Pressable>
          ),
          headerStyle: {
            backgroundColor: '#FFFFFF',
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
                <FlashList
                  data={recipe.ingredients}
                  renderItem={renderIngredient}
                  keyExtractor={keyExtractorIngredient}
                  estimatedItemSize={60}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContent}
                />
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
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 40,
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
  headerBackButton: {
    padding: 8,
    marginLeft: 0,
    borderRadius: 20,
  },
  opacityPressed: {
    opacity: 0.7,
  },
});
