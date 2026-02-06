import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Clock } from 'phosphor-react-native';
import { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRecipeStore } from '../../stores/recipe';

export default function SavedScreen() {
  const recipesMap = useRecipeStore((state) => state.recipes);
  const recipes = useMemo(() => Object.values(recipesMap).reverse(), [recipesMap]);

  const renderItem = useCallback(
    ({ item }: { item: (typeof recipes)[0] }) => (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => router.push(`/recipe/${item.id}`)}
      >
        <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} contentFit="cover" />
        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.metaRow}>
            <Clock size={14} color="#757575" />
            <Text style={styles.metaText}>Saved</Text>
          </View>
        </View>
      </Pressable>
    ),
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Saved Recipes</Text>
      <View style={styles.listContainer}>
        <FlashList
          data={recipes}
          renderItem={renderItem}
          estimatedItemSize={200}
          numColumns={2}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  listContent: {
    paddingBottom: 100, // Space for floating tab bar
  },
  card: {
    flex: 1,
    margin: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  thumbnail: {
    width: '100%',
    height: 120,
    backgroundColor: '#F5F5F5',
  },
  cardContent: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
    height: 40,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#757575',
  },
});
