import { Image } from 'expo-image';
import { memo, useCallback } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import type { Recipe } from '../../stores/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  height?: number;
  onPress?: (recipeId: string) => void;
}

export const RecipeCard = memo(function RecipeCard({
  recipe,
  // Height is now auto/flexible based on content + fixed image height
  onPress,
}: RecipeCardProps) {
  const handlePress = useCallback(() => {
    onPress?.(recipe.id);
  }, [onPress, recipe.id]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {/* Top Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: recipe.thumbnailUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        {/* Badges on top of image */}
        <View style={styles.badgeContainer}>
          <View style={styles.platformBadge}>
            <Text style={styles.platformText}>{recipe.platform.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {/* Bottom Content Section */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>
        
        <View style={styles.metaRow}>
          <Text style={styles.ingredients}>{recipe.ingredients.length} ingredients</Text>
          {recipe.cookTimeMinutes && (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.cookTime}>{recipe.cookTimeMinutes} min</Text>
            </>
          )}
        </View>

        {recipe.category && (
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{recipe.category}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    width: '100%',
    marginBottom: SPACING.cardPadding,
    borderRadius: RADIUS.lg, // 20px
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm, // Hard shadow for clean look
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  imageContainer: {
    width: '100%',
    height: 180, // Fixed height for image
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.accentBackground,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  platformBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    ...SHADOWS.sm,
  },
  platformText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  content: {
    padding: SPACING.md, // 16px
    gap: 8,
  },
  title: {
    fontSize: 17, // Alma bodyLarge
    fontWeight: '700',
    color: COLORS.textPrimary, // Dark text
    lineHeight: 22,
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ingredients: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  dot: {
    color: COLORS.border,
    fontSize: 12,
  },
  cookTime: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accentBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  categoryText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
