import { memo, useEffect, useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

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

      <View style={styles.tabBar} onLayout={onLayout}>
        <Animated.View style={[styles.indicator, indicatorStyle]} />
        {TABS.map((tab) => {
          // We need to animate the text color too for smoothness
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
              onPress={() => onTabChange(tab.key)}
            >
              {/* Use simplified approach: just change color based on prop since simpler */}
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
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#064e3b', // Deep Emerald
    marginBottom: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6', // Light grey background for the track
    borderRadius: 25, // Full rounded for pill shape
    padding: 4,
    borderBottomWidth: 0, // Remove bottom border
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    left: 4, // Account for padding
    bottom: 4,
    borderRadius: 20, // Slightly less than container
    backgroundColor: '#064e3b', // Deep Emerald
    zIndex: 0, // Behind text
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1, // Above indicator
  },
  tabPressed: {
    opacity: 0.8,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280', // Default grey
  },
  tabTextActive: {
    color: '#FFFFFF', // White text when active
  },
});
