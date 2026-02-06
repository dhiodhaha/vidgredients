import { Check } from 'phosphor-react-native';
import { memo, useCallback } from 'react';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface StepItemProps {
  stepNumber: number;
  description: string;
  isCompleted: boolean;
  onToggle: (stepNumber: number) => void;
  highlightedWords?: string[];
}

export const StepItem = memo(function StepItem({
  stepNumber,
  description,
  isCompleted,
  onToggle,
  highlightedWords = [],
}: StepItemProps) {
  const scale = useSharedValue(1);
  const progress = useSharedValue(isCompleted ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isCompleted ? 1 : 0, { duration: 200 });
  }, [isCompleted, progress]);

  const handleToggle = useCallback(() => {
    scale.value = withSpring(0.9, {}, () => {
      scale.value = withSpring(1);
    });
    onToggle(stepNumber);
  }, [onToggle, stepNumber, scale]);

  const checkboxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(progress.value, [0, 1], ['rgba(255,255,255,0)', '#be185d']),
    borderColor: interpolateColor(progress.value, [0, 1], ['#064e3b', '#be185d']),
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isCompleted ? 0.6 : 1, { duration: 200 }),
  }));

  // Render description with highlighted words in bold
  const renderDescription = () => {
    if (highlightedWords.length === 0) {
      return (
        <Animated.Text style={[styles.description, isCompleted && styles.completedText, textStyle]}>
          {description}
        </Animated.Text>
      );
    }

    // Create regex pattern for all highlighted words
    const pattern = new RegExp(
      `(${highlightedWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
      'gi'
    );
    const parts = description.split(pattern);

    return (
      <Animated.Text style={[styles.description, isCompleted && styles.completedText, textStyle]}>
        {parts.map((part, index) => {
          const isHighlighted = highlightedWords.some(
            (word) => word.toLowerCase() === part.toLowerCase()
          );
          return isHighlighted ? (
            <Text key={`${part}-${index}`} style={styles.highlightedText}>
              {part}
            </Text>
          ) : (
            part
          );
        })}
      </Animated.Text>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step {stepNumber}</Text>
        <Pressable
          onPress={handleToggle}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        >
          <Animated.View style={[styles.checkbox, checkboxStyle]}>
            {isCompleted && <Check size={16} color="#FFFFFF" weight="bold" />}
          </Animated.View>
        </Pressable>
      </View>
      <View style={styles.contentContainer}>{renderDescription()}</View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#064e3b', // Dark green
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    marginTop: 4,
  },
  description: {
    fontSize: 18,
    lineHeight: 28,
    color: '#064e3b', // Deep emerald green
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
  },
  highlightedText: {
    fontWeight: '700',
    color: '#064e3b',
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
});
