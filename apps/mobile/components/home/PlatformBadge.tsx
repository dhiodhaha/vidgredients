import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PlatformBadgeProps {
  platform: 'youtube' | 'tiktok' | 'instagram';
}

const PLATFORM_CONFIG = {
  youtube: {
    label: 'YouTube',
    emoji: '📺',
    bgColor: '#FEE2E2',
    textColor: '#DC2626',
  },
  tiktok: {
    label: 'TikTok',
    emoji: '🎵',
    bgColor: '#F3E8FF',
    textColor: '#9333EA',
  },
  instagram: {
    label: 'Instagram',
    emoji: '📸',
    bgColor: '#FCE7F3',
    textColor: '#DB2777',
  },
};

export const PlatformBadge = memo(function PlatformBadge({ platform }: PlatformBadgeProps) {
  const config = PLATFORM_CONFIG[platform];

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor }]}>
      <Text style={styles.emoji}>{config.emoji}</Text>
      <Text style={[styles.label, { color: config.textColor }]}>{config.label} detected</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  emoji: {
    fontSize: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
});
