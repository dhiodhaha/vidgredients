import { Image } from 'expo-image';
import { memo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

interface IngredientItemProps {
  id: string;
  quantity: string;
  name: string;
  unit?: string;
  imageUrl?: string;
  hasLink?: boolean;
  onPress?: () => void;
}

export const IngredientItem = memo(function IngredientItem({
  quantity,
  name,
  unit,
  imageUrl,
  hasLink = false,
  onPress,
}: IngredientItemProps) {
  const content = (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.icon} contentFit="cover" />
        ) : (
          <View style={styles.iconPlaceholder}>
            <Text style={styles.iconEmoji}>🥘</Text>
          </View>
        )}
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.quantity}>
          {quantity}
          {unit ? ` ${unit}` : ''}
        </Text>
        <Text style={[styles.name, hasLink && styles.nameLink]}>{name}</Text>
      </View>

      {hasLink ? <Text style={styles.chevron}>›</Text> : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }

  return content;
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconContainer: {
    width: 44,
    height: 44,
    marginRight: 12,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  iconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  quantity: {
    fontSize: 15,
    fontWeight: '600',
    color: '#be185d', // Deep Pink/Magenta for contrast
    minWidth: 60,
  },
  name: {
    fontSize: 16,
    color: '#064e3b', // Deep Emerald
    flex: 1,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
  },
  nameLink: {
    textDecorationLine: 'underline',
  },
  chevron: {
    fontSize: 20,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  pressed: {
    opacity: 0.7,
  },
});
