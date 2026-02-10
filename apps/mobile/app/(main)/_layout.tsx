import { Tabs } from 'expo-router';
import { BookOpen, House, ShoppingBag, User } from 'lucide-react-native';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGroceryStore } from '../../stores/grocery';

export default function MainLayout() {
  const insets = useSafeAreaInsets();
  const groceryItems = useGroceryStore((s) => s.items);
  const uncheckedCount = useMemo(
    () => groceryItems.filter((i) => !i.checked).length,
    [groceryItems]
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3D4A2A', // Deep olive (Alma)
        tabBarInactiveTintColor: '#B8B5AD', // Warm gray (Alma)
        tabBarStyle: {
          display: 'none', // Hidden while we revamp the navigation
          position: 'absolute',
          bottom: 20 + insets.bottom, // Floating above home indicator
          left: 24,
          right: 24,
          backgroundColor: '#FFFFFF',
          borderRadius: 32, // Pill shape
          height: 64,
          borderTopWidth: 0,
          elevation: 10, // Android shadow
          shadowColor: '#000', // iOS shadow
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          paddingBottom: 0, // Reset padding
        },
        tabBarItemStyle: {
          paddingTop: 8, // Center icons vertically in the pill
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <House size={28} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          href: null, // Disabled for now
          tabBarIcon: ({ color, focused }) => (
            <BookOpen size={28} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="grocery"
        options={{
          title: 'Grocery',
          tabBarIcon: ({ color, focused }) => (
            <View>
              <ShoppingBag size={28} color={color} strokeWidth={focused ? 2.5 : 2} />
              {uncheckedCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{uncheckedCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <User size={28} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="paywall"
        options={{
          href: null, // Not a tab, accessed via router.push
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E86B3A', // Warm coral (Alma)
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
