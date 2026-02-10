import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../lib/theme';

interface ServingsAdjusterProps {
  servings: number;
  onServingsChange: (servings: number) => void;
  unitSystem: 'US' | 'METRIC';
  onUnitSystemChange: (system: 'US' | 'METRIC') => void;
}

export const ServingsAdjuster = memo(function ServingsAdjuster({
  servings,
  onServingsChange,
  unitSystem,
  onUnitSystemChange,
}: ServingsAdjusterProps) {
  const handleDecrement = () => {
    if (servings > 1) {
      onServingsChange(servings - 1);
    }
  };

  const handleIncrement = () => {
    if (servings < 20) {
      onServingsChange(servings + 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.servingsControl}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            servings <= 1 && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleDecrement}
          disabled={servings <= 1}
        >
          <Text style={styles.buttonText}>−</Text>
        </Pressable>

        <Text style={styles.servingsText}>Serves {servings}</Text>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            servings >= 20 && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleIncrement}
          disabled={servings >= 20}
        >
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>

      <View style={styles.unitToggle}>
        <Pressable
          style={[styles.unitButton, unitSystem === 'US' && styles.unitButtonActive]}
          onPress={() => onUnitSystemChange('US')}
        >
          <Text style={[styles.unitButtonText, unitSystem === 'US' && styles.unitButtonTextActive]}>
            US
          </Text>
        </Pressable>
        <Text style={styles.unitDivider}>/</Text>
        <Pressable
          style={[styles.unitButton, unitSystem === 'METRIC' && styles.unitButtonActive]}
          onPress={() => onUnitSystemChange('METRIC')}
        >
          <Text
            style={[styles.unitButtonText, unitSystem === 'METRIC' && styles.unitButtonTextActive]}
          >
            METRIC
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.cardPadding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    marginBottom: SPACING.sm,
  },
  servingsControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    borderColor: COLORS.borderLight,
    opacity: 0.4,
  },
  buttonPressed: {
    backgroundColor: COLORS.accentBackground,
  },
  buttonText: {
    fontSize: 18,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  servingsText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  unitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  unitButtonActive: {
    backgroundColor: COLORS.accentBackground,
    borderRadius: RADIUS.xs,
  },
  unitButtonText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  unitButtonTextActive: {
    color: COLORS.textPrimary,
  },
  unitDivider: {
    color: COLORS.border,
    marginHorizontal: SPACING.xs,
  },
});
