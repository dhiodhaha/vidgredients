import { Trash2 } from 'lucide-react-native';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../lib/theme';

interface GroceryItemProps {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  checked: boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export const GroceryItemRow = memo(function GroceryItemRow({
  id,
  name,
  quantity,
  unit,
  checked,
  onToggle,
  onRemove,
}: GroceryItemProps) {
  const handleToggle = useCallback(() => onToggle(id), [id, onToggle]);
  const handleRemove = useCallback(() => onRemove(id), [id, onRemove]);

  const displayQty = Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(1);

  return (
    <Pressable
      onPress={handleToggle}
      style={({ pressed }) => [
        styles.container,
        checked && styles.containerChecked,
        pressed && styles.pressed,
      ]}
    >
      {/* Checkbox */}
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.name, checked && styles.nameChecked]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[styles.qty, checked && styles.qtyChecked]}>
          {displayQty}
          {unit ? ` ${unit}` : ''}
        </Text>
      </View>

      {/* Delete */}
      <Pressable
        onPress={handleRemove}
        hitSlop={10}
        style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
      >
        <Trash2 size={16} color={checked ? COLORS.textMuted : COLORS.border} strokeWidth={1.5} />
      </Pressable>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  containerChecked: {
    backgroundColor: COLORS.borderLight,
    borderColor: 'transparent',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    fontSize: FONT_SIZES.bodyMedium,
    fontWeight: '500',
    color: COLORS.textPrimary,
    flex: 1,
  },
  nameChecked: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  qty: {
    fontSize: FONT_SIZES.bodySmall,
    fontWeight: '600',
    color: COLORS.primaryMuted,
    backgroundColor: COLORS.accentBackground,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    overflow: 'hidden',
  },
  qtyChecked: {
    color: COLORS.textMuted,
    backgroundColor: 'transparent',
    textDecorationLine: 'line-through',
  },
  deleteBtn: {
    marginLeft: 8,
    padding: 6,
    borderRadius: RADIUS.full,
  },
  deleteBtnPressed: {
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
  },
});
