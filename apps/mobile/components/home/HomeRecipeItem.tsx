import { Image } from 'expo-image';
import { CaretRight } from 'phosphor-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, RADIUS, SPACING } from '../../lib/theme';

interface HomeRecipeItemProps {
  id: string;
  title: string;
  thumbnailUrl: string;
  ingredientsCount: number;
  sourceType: 'YOUTUBE' | 'TIKTOK' | 'INSTAGRAM' | 'UNKNOWN';
  onPress: (id: string) => void;
}

export const HomeRecipeItem = memo(function HomeRecipeItem({
  id,
  title,
  thumbnailUrl,
  ingredientsCount,
  sourceType,
  onPress,
}: HomeRecipeItemProps) {
  return (
    <Pressable
      onPress={() => onPress(id)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} contentFit="cover" />

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.ingredients}>{ingredientsCount} ingredients</Text>
        </View>

        <Text style={styles.platformTag}>{sourceType}</Text>
      </View>

      <CaretRight size={16} color={COLORS.textMuted} weight="bold" />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg, // Match screen padding
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.md, // Inset from screen edges? Wireframe shows cards inside a section.
    // If sections are full width, maybe marginHorizontal is needed.
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: COLORS.surfaceSubtle,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.skeleton,
  },
  content: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
    gap: 4,
  },
  title: {
    fontSize: FONT_SIZES.bodyMedium, // 15px-ish
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sansRegular,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ingredients: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.textMuted,
    fontFamily: FONTS.sansRegular,
  },
  platformTag: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
