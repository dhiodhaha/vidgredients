import { Image } from 'expo-image';
import { memo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../lib/theme';

interface IngredientItemProps {
  id: string;
  quantity: string;
  name: string;
  unit?: string;
  imageUrl?: string;
  hasLink?: boolean;
  onPress?: () => void;
}

export const IngredientItem = memo(function IngredientItem({
  quantity,
  name,
  unit,
  imageUrl,
  hasLink = false,
  onPress,
}: IngredientItemProps) {
  const content = (
    <View style={styles.container}>
      {/* Text content — left side (Alma layout: text-heavy left, image right) */}
      <View style={styles.textContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.quantity}>
          {quantity}
          {unit ? ` ${unit}` : ''}
        </Text>
      </View>

      {/* Image — right side, softly-rounded square (Alma: 12px radius, NOT circle) */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>🥘</Text>
          </View>
        )}
      </View>

      {hasLink ? <Text style={styles.chevron}>›</Text> : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }

  return content;
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg, // Use SPACING.lg for consistent side padding
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
  },
  quantity: {
    fontSize: FONT_SIZES.bodyMedium,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  // Images are softly-rounded squares
  imageContainer: {
    width: 56, // Slightly smaller than before (was 64) for better density
    height: 56,
    marginLeft: SPACING.md,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md, // 12px
    backgroundColor: COLORS.skeleton,
  },
  imagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.skeleton,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 24,
  },
  chevron: {
    fontSize: 20,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: COLORS.surfaceMuted,
  },
});
