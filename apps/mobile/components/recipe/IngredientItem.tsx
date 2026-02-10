import { Image } from 'expo-image';
import { memo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../lib/theme';

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
    paddingVertical: SPACING.cardPadding,
    paddingHorizontal: SPACING.cardPadding, // Fix: Add horizontal padding so text doesn't touch edges
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 17, // Alma: Bold 17px for ingredient name
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }), // Alma uses sans-serif for names
  },
  quantity: {
    fontSize: 14, // Alma: Regular 14px for amount
    color: COLORS.textMuted,
    fontWeight: '400',
  },
  // Alma: Images are softly-rounded squares (12px radius), NOT circles
  imageContainer: {
    width: 64,
    height: 64,
    marginLeft: SPACING.md,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.sm, // Alma: 10-12px rounded square
  },
  imagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accentBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 28,
  },
  chevron: {
    fontSize: 24,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
    fontWeight: '300',
  },
  pressed: {
    opacity: 0.7,
  },
});
