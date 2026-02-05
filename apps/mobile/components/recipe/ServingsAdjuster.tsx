import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 8,
  },
  servingsControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    borderColor: '#E5E7EB',
    opacity: 0.5,
  },
  buttonPressed: {
    backgroundColor: '#F3F4F6',
  },
  buttonText: {
    fontSize: 18,
    color: '#374151',
    fontWeight: '500',
  },
  servingsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  unitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unitButtonActive: {
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
  unitButtonText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  unitButtonTextActive: {
    color: '#111827',
  },
  unitDivider: {
    color: '#D1D5DB',
    marginHorizontal: 4,
  },
});
