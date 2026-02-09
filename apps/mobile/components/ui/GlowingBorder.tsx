import { memo, useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { COLORS, RADIUS } from '../../lib/theme';

interface GlowingBorderProps {
  /** Whether the animation is active */
  isActive: boolean;
  /** Content to wrap */
  children: React.ReactNode;
  /** Container style */
  style?: ViewStyle;
  /** Glow color (defaults to emerald green) */
  glowColor?: string;
  /** Border radius (defaults to RADIUS.md) */
  borderRadius?: number;
}

/**
 * Gemini-style glowing border animation component.
 * Creates a pulsing green glow effect around the wrapped content.
 * Uses GPU-accelerated properties (opacity, transform) for performance.
 */
export const GlowingBorder = memo(function GlowingBorder({
  isActive,
  children,
  style,
  glowColor = COLORS.primaryLight,
  borderRadius = RADIUS.md,
}: GlowingBorderProps) {
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      // Pulsing glow opacity
      glowOpacity.value = withRepeat(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1, // Infinite repeat
        true // Reverse
      );
    } else {
      cancelAnimation(glowOpacity);
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isActive, glowOpacity]);

  const _glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Helper for creating the glow layers with consistent offsets
  const GlowLayer = ({
    offset,
    opacityMultiplier,
    blur,
  }: {
    offset: number;
    opacityMultiplier: number;
    blur: number;
  }) => {
    const animatedStyle = useAnimatedStyle(() => ({
      opacity: glowOpacity.value * opacityMultiplier,
    }));

    return (
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glowLayer,
          animatedStyle,
          {
            top: -offset,
            bottom: -offset,
            left: -offset,
            right: -offset,
            borderRadius: borderRadius + offset,
            borderColor: glowColor,
            borderWidth: 2,
            shadowColor: glowColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: blur,
            elevation: 6, // Android shadow
            backgroundColor: 'transparent',
          },
        ]}
      />
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Outer Glow (Larger, softer) */}
      <GlowLayer offset={6} opacityMultiplier={0.4} blur={12} />

      {/* Inner Glow (Tighter, brighter) */}
      <GlowLayer offset={2} opacityMultiplier={0.8} blur={6} />

      {/* Content */}
      <View style={[styles.content, { borderRadius }]}>{children}</View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  glowLayer: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 0 },
  },
  content: {
    overflow: 'hidden',
  },
});
