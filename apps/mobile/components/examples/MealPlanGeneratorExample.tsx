/**
 * Example component demonstrating Toast notifications + Meal Plan Generation
 *
 * This shows the complete integration pattern:
 * 1. Use hooks for state management
 * 2. Handle async operations with try/catch
 * 3. Provide user feedback via Toast
 * 4. Display loading states
 *
 * Remove this file or use as reference for implementation.
 */

import { Loader2 } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useMealPlanGeneration } from '../../hooks/useMealPlanGeneration';
import { useToast } from '../../hooks/useToast';
import { useMealPlanStore } from '../../stores/mealPlan';
import { useRecipeStore } from '../../stores/recipe';
import { Toast } from '../ui/Toast';

import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../lib/theme';

interface DurationOption {
  label: string;
  value: number;
}

const DURATION_OPTIONS: DurationOption[] = [
  { label: '1 Week', value: 7 },
  { label: '2 Weeks', value: 14 },
  { label: '1 Month', value: 30 },
];

export function MealPlanGeneratorExample() {
  const { recipes } = useRecipeStore();
  const { mealPlans } = useMealPlanStore();
  const { generateForAllRecipes, generateForFilteredRecipes } = useMealPlanGeneration();
  const { toasts, success, error, warning, dismiss } = useToast();

  const [selectedDuration, setSelectedDuration] = useState<number>(7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [vegetarianOnly, setVegetarianOnly] = useState(false);

  const recipeCount = Object.keys(recipes).length;
  const scale = useSharedValue(1);

  const handleGenerateBasic = async () => {
    if (recipeCount === 0) {
      warning('Add some recipes first');
      return;
    }

    setIsGenerating(true);
    try {
      const _planId = await generateForAllRecipes({ duration: selectedDuration });
      success(`${selectedDuration}-day meal plan created!`);

      // Scale animation
      scale.value = withSpring(1.1, { damping: 5 }, () => {
        scale.value = withSpring(1);
      });
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to generate meal plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFiltered = async () => {
    const vegetarianRecipes = Object.values(recipes).filter((r) => r.isVegetarian);

    if (vegetarianRecipes.length === 0) {
      warning('No vegetarian recipes available');
      return;
    }

    setIsGenerating(true);
    try {
      const _planId = await generateForFilteredRecipes((recipe) => recipe.isVegetarian === true, {
        duration: selectedDuration,
        vegetarian: true,
      });
      success('Vegetarian meal plan created!');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to generate plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const mealPlanCount = Object.keys(mealPlans).length;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <View style={styles.container}>
      {/* Toast Queue */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onDismiss={() => dismiss(toast.id)}
        />
      ))}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Meal Plan Generator</Text>
        <Text style={styles.subtitle}>Create balanced meal plans from recipes</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{recipeCount}</Text>
          <Text style={styles.statLabel}>Recipes</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{mealPlanCount}</Text>
          <Text style={styles.statLabel}>Plans</Text>
        </View>
      </View>

      {/* Duration Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Plan Duration</Text>
        <View style={styles.durationGrid}>
          {DURATION_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.durationButton,
                selectedDuration === option.value && styles.durationButtonActive,
              ]}
              onPress={() => setSelectedDuration(option.value)}
            >
              <Text
                style={[
                  styles.durationText,
                  selectedDuration === option.value && styles.durationTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <Pressable style={styles.optionButton} onPress={() => setVegetarianOnly(!vegetarianOnly)}>
          <View style={[styles.checkbox, vegetarianOnly && styles.checkboxActive]} />
          <Text style={styles.optionText}>Vegetarian only</Text>
        </Pressable>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Animated.View style={animatedStyle}>
          <Pressable
            style={[styles.button, styles.primaryButton, isGenerating && styles.buttonDisabled]}
            onPress={handleGenerateBasic}
            disabled={isGenerating || recipeCount === 0}
          >
            {isGenerating ? (
              <View style={styles.loadingRow}>
                <Loader2 size={18} color="#fff" strokeWidth={2} />
                <Text style={styles.buttonText}>Generating...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Generate Plan</Text>
            )}
          </Pressable>
        </Animated.View>

        {vegetarianRecipes.length > 0 && (
          <Pressable
            style={[styles.button, styles.secondaryButton, isGenerating && styles.buttonDisabled]}
            onPress={handleGenerateFiltered}
            disabled={isGenerating}
          >
            <Text style={styles.secondaryButtonText}>Generate Vegetarian</Text>
          </Pressable>
        )}
      </View>

      {/* Recent Plans */}
      {mealPlanCount > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Plans</Text>
          <FlatList
            data={Object.entries(mealPlans).slice(-3)}
            keyExtractor={([id]) => id}
            scrollEnabled={false}
            renderItem={({ item: [_, plan] }) => (
              <View style={styles.planItem}>
                <View>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planMeta}>{plan.duration} days</Text>
                </View>
                <Text style={styles.planDate}>{new Date(plan.createdAt).toLocaleDateString()}</Text>
              </View>
            )}
          />
        </View>
      )}

      {/* Help Text */}
      <View style={styles.footer}>
        <Text style={styles.helpText}>
          {recipeCount === 0
            ? '👆 Add recipes first to generate meal plans'
            : '✅ Ready to generate meal plans'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.headingLarge,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.bodyMedium,
    color: COLORS.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  stat: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.headingMedium,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  durationGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  durationButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  durationButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.accentBackground,
  },
  durationText: {
    fontSize: FONT_SIZES.bodyMedium,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  durationTextActive: {
    color: COLORS.primary,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: FONT_SIZES.bodyMedium,
    color: COLORS.textPrimary,
  },
  button: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginBottom: SPACING.md,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '600',
    color: COLORS.primary,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  planItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  planName: {
    fontSize: FONT_SIZES.bodyMedium,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  planMeta: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  planDate: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textMuted,
  },
  footer: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  helpText: {
    fontSize: FONT_SIZES.bodyMedium,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
