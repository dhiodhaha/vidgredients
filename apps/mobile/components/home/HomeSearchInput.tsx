import { MagnifyingGlass } from 'phosphor-react-native';
import { StyleSheet, TextInput, View } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../../lib/theme';

interface HomeSearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function HomeSearchInput({
  value,
  onChangeText,
  placeholder = 'Search recipes...',
}: HomeSearchInputProps) {
  return (
    <View style={styles.container}>
      <MagnifyingGlass size={20} color={COLORS.textMuted} weight="bold" />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle, // Light gray background like wireframe? Or surface?
    // Wireframe looks like a pill shape, maybe white on gray bg? Or subtle gray on white bg?
    // Using surfaceSubtle for now as a safe bet for input fields.
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    height: 48,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontFamily: FONTS.sansRegular,
    height: '100%',
  },
});
