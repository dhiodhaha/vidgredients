import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Clock } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import type { Recipe } from '../../stores/recipe';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface RecipeCardProps {
  item: Recipe;
  index?: number;
}

export const RecipeCard = memo(function RecipeCard({ item }: RecipeCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 10, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      style={[styles.card, animatedStyle]}
      onPress={() => router.push(`/recipe/${item.id}`)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} contentFit="cover" />
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.metaRow}>
          <Clock size={14} color={COLORS.textMuted} />
          <Text style={styles.metaText}>Saved</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md, // Premium shadow
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)', // Subtle border for definition
  },
  thumbnail: {
    width: '100%',
    height: 140, // Taller image for better visual
    backgroundColor: COLORS.skeleton,
  },
  cardContent: {
    padding: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.bodyMedium,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    height: 40, // Fixed height for 2 lines
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});
