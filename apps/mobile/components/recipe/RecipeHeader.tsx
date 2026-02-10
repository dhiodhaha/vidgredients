import { memo, useEffect, useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { COLORS, FONTS, FONT_SIZES, RADIUS, SPACING } from '../../lib/theme';

interface RecipeHeaderProps {
  title: string;
  activeTab: 'ingredients' | 'method';
  onTabChange: (tab: string) => void;
}

const TABS = [
  { key: 'ingredients', label: 'Ingredients' },
  { key: 'method', label: 'Method' },
] as const;

export const RecipeHeader = memo(function RecipeHeader({
  title,
  activeTab,
  onTabChange,
}: RecipeHeaderProps) {
  const [tabBarWidth, setTabBarWidth] = useState(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (tabBarWidth > 0) {
      const tabIndex = TABS.findIndex((t) => t.key === activeTab);
      // Account for padding (4 on left, 4 on right = 8 total)
      const availableWidth = tabBarWidth - 8;
      const tabWidth = availableWidth / TABS.length;

      translateX.value = withSpring(tabIndex * tabWidth, {
        mass: 0.8,
        damping: 15,
        stiffness: 120,
      });
    }
  }, [activeTab, tabBarWidth, translateX]);

  const onLayout = (event: LayoutChangeEvent) => {
    setTabBarWidth(event.nativeEvent.layout.width);
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    width: (tabBarWidth - 8) / TABS.length,
    height: '100%',
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.ingredientCount}>Recipe Details</Text>

      <View style={styles.tabBar} onLayout={onLayout}>
        <Animated.View style={[styles.indicator, indicatorStyle]} />
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
              onPress={() => onTabChange(tab.key)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.headingLarge,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  ingredientCount: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
    fontWeight: '500',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.borderLight,
    borderRadius: RADIUS.pill,
    padding: 4,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    zIndex: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabPressed: {
    opacity: 0.8,
  },
  tabText: {
    fontSize: FONT_SIZES.bodyMedium,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.textInverse,
  },
});
