import { memo, useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import { ANIMATION, COLORS, FONT_SIZES, RADIUS, SPACING } from '../../lib/theme';

export type FilterCategory = 'time' | 'difficulty' | 'dietary';

export interface RecipeFilter {
  id: string;
  label: string;
  emoji: string;
  category: FilterCategory;
  value: string | number | boolean;
}

// Practical filters for tired working women coming home
const RECIPE_FILTERS: RecipeFilter[] = [
  // Time filters
  { id: 'quick-15', label: 'Quick', emoji: '⚡', category: 'time', value: 15 },
  { id: 'medium-30', label: '30 min', emoji: '⏱️', category: 'time', value: 30 },
  // Difficulty filters
  { id: 'easy', label: 'Easy', emoji: '🍳', category: 'difficulty', value: 'easy' },
  { id: 'medium', label: 'Medium', emoji: '👩‍🍳', category: 'difficulty', value: 'medium' },
  // Dietary filters
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🥗', category: 'dietary', value: 'vegetarian' },
  { id: 'vegan', label: 'Vegan', emoji: '🌱', category: 'dietary', value: 'vegan' },
  { id: 'gluten-free', label: 'GF', emoji: '🌾', category: 'dietary', value: 'gluten-free' },
];

interface MoodFiltersProps {
  activeFilter: string | null;
  onFilterChange: (filterId: string | null) => void;
}

export const MoodFilters = memo(function MoodFilters({
  activeFilter,
  onFilterChange,
}: MoodFiltersProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {RECIPE_FILTERS.map((filter) => (
          <FilterPill
            key={filter.id}
            filter={filter}
            isActive={activeFilter === filter.id}
            onPress={() => onFilterChange(activeFilter === filter.id ? null : filter.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
});

// ============================================================================
// Filter Pill Component (with Reanimated press animation)
// ============================================================================

interface FilterPillProps {
  filter: RecipeFilter;
  isActive: boolean;
  onPress: () => void;
}

const FilterPill = memo(function FilterPill({ filter, isActive, onPress }: FilterPillProps) {
  const pressed = useSharedValue(0);
  const active = useSharedValue(isActive ? 1 : 0);

  // Update active state when prop changes - use useEffect to avoid render warning
  useEffect(() => {
    active.set(withTiming(isActive ? 1 : 0, { duration: ANIMATION.fast }));
  }, [isActive, active]);

  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  // Use Gesture.Tap() for UI-thread animations (per AGENTS.md)
  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      pressed.set(withTiming(1, { duration: 80 }));
    })
    .onFinalize(() => {
      pressed.set(withTiming(0, { duration: 150 }));
    })
    .onEnd(() => {
      runOnJS(handlePress)();
    });

  const animatedStyle = useAnimatedStyle(() => {
    const scale = 1 - pressed.get() * 0.05;
    const backgroundColor = interpolateColor(
      active.get(),
      [0, 1],
      [COLORS.borderLight, COLORS.primary]
    );

    return {
      transform: [{ scale }],
      backgroundColor,
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      active.get(),
      [0, 1],
      [COLORS.textSecondary, COLORS.textInverse]
    );

    return { color };
  });

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={[styles.pill, animatedStyle]}>
        <Text style={styles.emoji}>{filter.emoji}</Text>
        <Animated.Text style={[styles.label, textStyle]}>{filter.label}</Animated.Text>
      </Animated.View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  emoji: {
    fontSize: FONT_SIZES.bodyMedium,
  },
  label: {
    fontSize: FONT_SIZES.bodySmall,
    fontWeight: '600',
  },
});
