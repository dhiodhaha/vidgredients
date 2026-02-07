import { Image } from 'expo-image';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import type { Recipe } from '../../stores/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  height?: number;
  onPress?: (recipeId: string) => void;
}

export const RecipeCard = memo(function RecipeCard({
  recipe,
  height = 200,
  onPress,
}: RecipeCardProps) {
  const handlePress = useCallback(() => {
    onPress?.(recipe.id);
  }, [onPress, recipe.id]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.card, { height }, pressed && styles.cardPressed]}
    >
      <Image
        source={{ uri: recipe.thumbnailUrl }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.overlay}>
        <View style={styles.platformBadge}>
          <Text style={styles.platformText}>{recipe.platform.toUpperCase()}</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {recipe.title}
          </Text>
          <Text style={styles.subtitle}>{recipe.ingredients.length} ingredients</Text>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    width: '100%',
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    ...SHADOWS.md,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  platformBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xs,
  },
  platformText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  titleContainer: {
    marginTop: 'auto',
  },
  title: {
    fontSize: FONT_SIZES.headingMedium,
    fontWeight: '700',
    color: COLORS.textInverse,
    marginBottom: SPACING.xs,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: FONT_SIZES.bodySmall,
    color: 'rgba(255,255,255,0.8)',
  },
});
