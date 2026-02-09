import { AlertCircle, CheckCircle, Info, X } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../lib/theme';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss: () => void;
}

const typeConfig: Record<
  ToastType,
  {
    bgColor: string;
    textColor: string;
    borderColor: string;
    icon: React.ReactNode;
  }
> = {
  success: {
    bgColor: '#10b981',
    textColor: '#ffffff',
    borderColor: '#059669',
    icon: <CheckCircle size={20} color="#ffffff" strokeWidth={2} />,
  },
  error: {
    bgColor: '#ef4444',
    textColor: '#ffffff',
    borderColor: '#dc2626',
    icon: <AlertCircle size={20} color="#ffffff" strokeWidth={2} />,
  },
  info: {
    bgColor: '#3b82f6',
    textColor: '#ffffff',
    borderColor: '#2563eb',
    icon: <Info size={20} color="#ffffff" strokeWidth={2} />,
  },
  warning: {
    bgColor: '#f59e0b',
    textColor: '#ffffff',
    borderColor: '#d97706',
    icon: <AlertCircle size={20} color="#ffffff" strokeWidth={2} />,
  },
};

export function Toast({ message, type = 'info', duration = 3000, onDismiss }: ToastProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);

  const config = typeConfig[type];

  useEffect(() => {
    // Animate in
    opacity.value = withDelay(0, withTiming(1, { duration: 300 }));
    translateY.value = withDelay(0, withTiming(0, { duration: 300 }));

    // Auto-dismiss
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 300, easing: Easing.inOut(Easing.ease) });
      translateY.value = withTiming(-20, { duration: 300 });

      setTimeout(onDismiss, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [opacity, translateY, duration, onDismiss]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateY: translateY.get() }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View
        style={[
          styles.toast,
          {
            backgroundColor: config.bgColor,
            borderColor: config.borderColor,
          },
        ]}
      >
        {config.icon}
        <Text style={[styles.message, { color: config.textColor }]}>{message}</Text>
        <Pressable onPress={onDismiss} style={styles.closeButton}>
          <X size={16} color={config.textColor} strokeWidth={2.5} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: SPACING.lg,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 4,
  },
  message: {
    flex: 1,
    fontSize: FONT_SIZES.bodyMedium,
    fontWeight: '500',
  },
  closeButton: {
    padding: SPACING.xs,
  },
});
