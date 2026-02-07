import { Sparkles } from 'lucide-react-native';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { ANIMATION, COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';

interface HeaderProps {
  onMealPlanSelect?: (days: number) => void;
}

const MEAL_PLAN_OPTIONS = [
  { days: 3, label: '3 Days', emoji: '🍳' },
  { days: 5, label: '5 Days', emoji: '🥗' },
  { days: 7, label: '7 Days', emoji: '🍽️' },
];

export const Header = memo(function Header({ onMealPlanSelect }: HeaderProps) {
  const [showOptions, setShowOptions] = useState(false);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Fade-in animation on mount
  useEffect(() => {
    opacity.set(withTiming(1, { duration: ANIMATION.slow }));
    translateY.set(withTiming(0, { duration: ANIMATION.slow }));
  }, [opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateY: translateY.get() }],
  }));

  const handleSparklePress = useCallback(() => {
    setShowOptions(true);
  }, []);

  const handleOptionSelect = useCallback(
    (days: number) => {
      setShowOptions(false);
      onMealPlanSelect?.(days);
    },
    [onMealPlanSelect]
  );

  return (
    <>
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.topRow}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Pressable
            onPress={handleSparklePress}
            style={({ pressed }) => [styles.sparkleButton, pressed && styles.sparklePressed]}
            accessibilityLabel="Auto-generate meal plan"
            accessibilityRole="button"
          >
            <Sparkles size={24} color={COLORS.primary} strokeWidth={2} />
          </Pressable>
        </View>
        <Text style={styles.title}>What are we eating?</Text>
      </Animated.View>

      {/* Meal Plan Options Modal */}
      <Modal
        visible={showOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowOptions(false)}>
          <View style={styles.optionsCard}>
            <Text style={styles.optionsTitle}>✨ Auto-Generate Menu</Text>
            <Text style={styles.optionsSubtitle}>Choose a meal plan duration</Text>
            <View style={styles.optionsRow}>
              {MEAL_PLAN_OPTIONS.map((option) => (
                <Pressable
                  key={option.days}
                  onPress={() => handleOptionSelect(option.days)}
                  style={({ pressed }) => [styles.optionButton, pressed && styles.optionPressed]}
                >
                  <Text style={styles.optionEmoji}>{option.emoji}</Text>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  greeting: {
    fontSize: FONT_SIZES.bodyMedium,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  sparkleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accentBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparklePressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  title: {
    fontSize: FONT_SIZES.displayLarge,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: FONT_SIZES.displayLarge * 1.1,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  optionsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 340,
    ...SHADOWS.lg,
  },
  optionsTitle: {
    fontSize: FONT_SIZES.headingMedium,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  optionsSubtitle: {
    fontSize: FONT_SIZES.bodyMedium,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  optionButton: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    minWidth: 90,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
  },
  optionPressed: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  optionLabel: {
    fontSize: FONT_SIZES.bodyMedium,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
