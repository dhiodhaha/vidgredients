import { Plus } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, SPACING } from '../../lib/theme';

interface FloatingActionButtonProps {
  onPress: () => void;
}

export const FloatingActionButton = memo(function FloatingActionButton({
  onPress,
}: FloatingActionButtonProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { bottom: SPACING.xl + insets.bottom }]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        accessibilityLabel="Add recipe video"
        accessibilityRole="button"
      >
        <Plus size={28} color={COLORS.textInverse} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
});

const FAB_SIZE = 64;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  button: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.xl,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
});
