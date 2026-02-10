import { router } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CalendarIcon, ShoppingBagIcon, UserIcon } from 'react-native-heroicons/outline';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { ANIMATION, COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import { useGroceryStore } from '../../stores/grocery';
import { useHasPremium } from '../../stores/premium';

export const Header = memo(function Header() {
  const isPremium = useHasPremium();
  const groceryItems = useGroceryStore((s) => s.items);
  const uncheckedGroceryCount = useMemo(
    () => groceryItems.filter((i) => !i.checked).length,
    [groceryItems]
  );
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

  const handleMealPlanPress = useCallback(() => {
    router.push('/meal-plan');
  }, []);

  const handleGroceryPress = useCallback(() => {
    router.push('/grocery');
  }, []);

  const handleProfilePress = useCallback(() => {
    router.push('/profile');
  }, []);



  return (
    <>
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.topRow}>
          <Text style={styles.greeting}>{greeting}</Text>
          <View style={styles.headerButtons}>
            <Pressable
              onPress={handleMealPlanPress}
              style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
              accessibilityLabel="View meal plan"
              accessibilityRole="button"
            >
              <CalendarIcon size={24} color={COLORS.primary} strokeWidth={2} />
            </Pressable>
            <Pressable
              onPress={handleGroceryPress}
              style={({ pressed }) => [
                styles.iconButton,
                styles.groceryButton,
                pressed && styles.iconButtonPressed,
              ]}
              accessibilityLabel="Go to grocery list"
              accessibilityRole="button"
            >
              <ShoppingBagIcon size={24} color={COLORS.primary} strokeWidth={2} />
              {uncheckedGroceryCount > 0 && (
                <View style={styles.groceryBadge}>
                  <Text style={styles.groceryBadgeText}>
                    {uncheckedGroceryCount > 99 ? '99+' : uncheckedGroceryCount}
                  </Text>
                </View>
              )}
            </Pressable>
            <Pressable
              onPress={handleProfilePress}
              style={({ pressed }) => [
                styles.iconButton,
                styles.profileButton,
                pressed && styles.iconButtonPressed,
              ]}
              accessibilityLabel="Go to profile"
              accessibilityRole="button"
            >
              <UserIcon size={24} color={COLORS.primary} strokeWidth={2} />
              {isPremium && <View style={styles.premiumDot} />}
            </Pressable>
          </View>
        </View>
        <Text style={styles.title}>What are we eating?</Text>
      </Animated.View>

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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accentBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  groceryButton: {
    position: 'relative',
  },
  groceryBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E86B3A',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.accentBackground,
  },
  groceryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
  profileButton: {
    position: 'relative',
  },
  premiumDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F5D49A',
    borderWidth: 2,
    borderColor: COLORS.accentBackground,
  },
  title: {
    fontSize: FONT_SIZES.displayLarge,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: FONT_SIZES.displayLarge * 1.1,
  },

});
