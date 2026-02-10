import { Image, type ImageSourcePropType } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../lib/theme';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  title: string;
  subtitle?: string;
  leftIcon?: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  rightIcon?: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  leftImage?: string | ImageSourcePropType;
  onPress?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button = ({
  variant = 'primary',
  size = 'md',
  title,
  subtitle,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  leftImage,
  onPress,
  isLoading = false,
  disabled = false,
  style,
}: ButtonProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 10, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: { backgroundColor: COLORS.secondary },
          text: { color: COLORS.textInverse },
          iconColor: COLORS.textInverse,
        };
      case 'tertiary':
        return {
          container: {
            backgroundColor: COLORS.surfaceMuted,
            borderWidth: 1,
            borderColor: COLORS.border,
          },
          text: { color: COLORS.textPrimary },
          iconColor: COLORS.textPrimary,
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent' },
          text: { color: COLORS.primary },
          iconColor: COLORS.primary,
        };
      default:
        return {
          container: { backgroundColor: COLORS.primary },
          text: { color: COLORS.textInverse },
          iconColor: COLORS.textInverse,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'lg':
        return {
          container: { height: 48, paddingHorizontal: SPACING.md },
          title: { fontSize: FONT_SIZES.bodyLarge },
          subtitle: { fontSize: FONT_SIZES.caption },
          iconSize: 20,
        };
      case 'sm':
        return {
          container: { height: 32, paddingHorizontal: SPACING.sm },
          title: { fontSize: FONT_SIZES.bodySmall },
          subtitle: { fontSize: 10 },
          iconSize: 16,
        };
      default:
        return {
          container: { height: 40, paddingHorizontal: SPACING.md },
          title: { fontSize: FONT_SIZES.bodyMedium },
          subtitle: { fontSize: 11 },
          iconSize: 18,
        };
    }
  };

  const vStyles = getVariantStyles();
  const sStyles = getSizeStyles();

  return (
    <View style={styles.shadowWrapper}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || isLoading}
        style={[
          styles.container,
          vStyles.container as ViewStyle,
          sStyles.container as ViewStyle,
          disabled && styles.disabled,
          animatedStyle,
          style,
        ]}
      >
        <LinearGradient
          colors={
            variant === 'primary'
              ? ['rgba(255,255,255,0.08)', 'rgba(0,0,0,0)']
              : ['rgba(255,255,255,0.15)', 'rgba(0,0,0,0)']
          }
          style={StyleSheet.absoluteFill}
        />

        {/* Inner Highlight Overlay */}
        <View style={styles.innerHighlight} />

        {isLoading ? (
          <ActivityIndicator color={vStyles.iconColor} size="small" />
        ) : (
          <View style={styles.content}>
            {leftImage && (
              <Image
                source={leftImage}
                style={[
                  styles.leftImage,
                  { width: sStyles.iconSize + 4, height: sStyles.iconSize + 4 },
                ]}
              />
            )}

            {LeftIcon && (
              <View style={styles.iconGap}>
                <LeftIcon size={sStyles.iconSize} color={vStyles.iconColor} strokeWidth={2.5} />
              </View>
            )}

            <View style={styles.textContainer}>
              <Text style={[styles.title, vStyles.text as TextStyle, sStyles.title as TextStyle]}>
                {title}
              </Text>
              {subtitle && (
                <Text
                  style={[
                    styles.subtitle,
                    {
                      color:
                        variant === 'primary' || variant === 'secondary'
                          ? 'rgba(255,255,255,0.7)'
                          : COLORS.textMuted,
                    },
                    sStyles.subtitle as TextStyle,
                  ]}
                >
                  {subtitle}
                </Text>
              )}
            </View>

            {RightIcon && (
              <View style={styles.iconGapLeft}>
                <RightIcon size={sStyles.iconSize} color={vStyles.iconColor} strokeWidth={2.5} />
              </View>
            )}
          </View>
        )}
      </AnimatedPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowWrapper: {
    // Stacked shadow simulation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    fontWeight: '500',
  },
  leftImage: {
    borderRadius: 1000,
    marginRight: 8,
  },
  iconGap: {
    marginRight: 6,
  },
  iconGapLeft: {
    marginLeft: 6,
  },
  innerHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.18)',
    borderRadius: RADIUS.pill,
  },
  disabled: {
    opacity: 0.5,
  },
});
