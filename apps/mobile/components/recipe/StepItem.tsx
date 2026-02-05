import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
  const handleToggle = useCallback(() => {
    onToggle(stepNumber);
  }, [onToggle, stepNumber]);

  // Render description with highlighted words in bold
  const renderDescription = () => {
    if (highlightedWords.length === 0) {
      return (
        <Text style={[styles.description, isCompleted && styles.completedText]}>{description}</Text>
      );
    }

    // Create regex pattern for all highlighted words
    const pattern = new RegExp(
      `(${highlightedWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
      'gi'
    );
    const parts = description.split(pattern);

    return (
      <Text style={[styles.description, isCompleted && styles.completedText]}>
        {parts.map((part, index) => {
          const isHighlighted = highlightedWords.some(
            (word) => word.toLowerCase() === part.toLowerCase()
          );
          return isHighlighted ? (
            <Text key={index} style={styles.highlightedText}>
              {part}
            </Text>
          ) : (
            part
          );
        })}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step {stepNumber}</Text>
        <Pressable
          style={({ pressed }) => [
            styles.checkbox,
            isCompleted && styles.checkboxCompleted,
            pressed && styles.checkboxPressed,
          ]}
          onPress={handleToggle}
          hitSlop={8}
        >
          {isCompleted ? <Text style={styles.checkmark}>✓</Text> : null}
        </Pressable>
      </View>
      {renderDescription()}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkboxPressed: {
    opacity: 0.8,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
  },
  highlightedText: {
    fontWeight: '700',
    color: '#111827',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
});
