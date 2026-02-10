import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { PlusIcon } from 'react-native-heroicons/outline';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../../lib/theme';

interface FloatingActionButtonProps {
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const FAB_SIZE = 56;

export const FloatingActionButton = memo(function FloatingActionButton({
  onPress,
}: FloatingActionButtonProps) {
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 10, stiffness: 200 }); // Slightly more squash for FAB
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  return (
    <View
      style={[
        styles.positionContainer,
        { bottom: SPACING.xl + insets.bottom }, // Respect safe area
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.shadowWrapper}>
        <AnimatedPressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.button, animatedStyle]}
          accessibilityLabel="Add recipe video"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(0,0,0,0)']}
            style={StyleSheet.absoluteFill}
          />

          {/* Inner Highlight Overlay */}
          <View style={styles.innerHighlight} />

          <PlusIcon size={28} color={COLORS.textInverse} strokeWidth={2.5} />
        </AnimatedPressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  positionContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  shadowWrapper: {
    // Deep shadow for floating element
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderRadius: FAB_SIZE / 2,
  },
  button: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden', // Clip gradient
  },
  innerHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.25)',
    borderRadius: FAB_SIZE / 2,
  },
});
