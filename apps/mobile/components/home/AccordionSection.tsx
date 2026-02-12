import { CaretDown, CaretUp } from 'phosphor-react-native';
import { type PropsWithChildren, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../lib/theme';

interface AccordionSectionProps extends PropsWithChildren {
  title: string;
  count?: number;
  initialExpanded?: boolean;
}

export function AccordionSection({
  title,
  count,
  initialExpanded = false,
  children,
}: AccordionSectionProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setIsExpanded(!isExpanded)}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {count !== undefined && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{count}</Text>
            </View>
          )}
        </View>

        {isExpanded ? (
          <CaretUp size={16} color={COLORS.textPrimary} weight="bold" />
        ) : (
          <CaretDown size={16} color={COLORS.textPrimary} weight="bold" />
        )}
      </Pressable>

      {isExpanded && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          layout={Layout.springify()}
          style={styles.content}
        >
          {children}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  pressed: {
    opacity: 0.7,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.headingSmall, // ~18px
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  badge: {
    backgroundColor: COLORS.surfaceSubtle, // Light gray badge
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  content: {
    marginTop: SPACING.xs,
  },
});
