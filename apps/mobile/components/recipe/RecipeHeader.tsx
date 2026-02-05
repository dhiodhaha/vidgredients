import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface RecipeHeaderProps {
  title: string;
  activeTab: 'ingredients' | 'method' | 'nutrition';
  onTabChange: (tab: string) => void;
}

const TABS = [
  { key: 'ingredients', label: 'Ingredients' },
  { key: 'method', label: 'Method' },
  { key: 'nutrition', label: 'Nutrition' },
] as const;

export const RecipeHeader = memo(function RecipeHeader({
  title,
  activeTab,
  onTabChange,
}: RecipeHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>

      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={({ pressed }) => [
              styles.tab,
              activeTab === tab.key && styles.tabActive,
              pressed && styles.tabPressed,
            ]}
            onPress={() => onTabChange(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
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
    color: '#111827',
    marginBottom: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#10B981',
  },
  tabPressed: {
    opacity: 0.8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
});
