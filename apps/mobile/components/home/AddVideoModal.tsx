import * as Clipboard from 'expo-clipboard';
import { Link, X } from 'lucide-react-native';
import { memo, useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { detectPlatform } from '../../lib/platform';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import { Button } from '../ui/Button';
import { GlowingBorder } from '../ui/GlowingBorder';
import { InstagramIcon, TiktokIcon, YoutubeIcon } from '../ui/PlatformIcons';

interface AddVideoModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (url: string) => Promise<void>;
}

export const AddVideoModal = memo(function AddVideoModal({
  visible,
  onClose,
  onSubmit,
}: AddVideoModalProps) {
  const insets = useSafeAreaInsets();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const SCREEN_HEIGHT = Dimensions.get('window').height;
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
        mass: 0.5, // Lightweight feel
      });
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
    }
  }, [visible, opacity, translateY, SCREEN_HEIGHT]);

  const platform = url ? detectPlatform(url) : null;

  const handlePaste = useCallback(async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setUrl(text);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to paste:', err);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!url.trim()) {
      setError('Please enter a video URL');
      return;
    }

    if (!platform) {
      setError('Unsupported platform. Use YouTube, TikTok, or Instagram.');
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);
    setError(null);

    try {
      await onSubmit(url);
      setUrl('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze video');
    } finally {
      setIsLoading(false);
    }
  }, [url, platform, onSubmit, onClose]);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    setUrl('');
    setError(null);
    onClose();
  }, [onClose]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.get() }],
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        <Animated.View
          style={[styles.modal, modalStyle, { paddingBottom: SPACING.lg + insets.bottom }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Recipe Video</Text>
            <Pressable
              onPress={handleClose}
              style={styles.closeButton}
              accessibilityLabel="Close modal"
            >
              <X size={20} color={COLORS.textSecondary} strokeWidth={2} />
            </Pressable>
          </View>

          {/* Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              {/* Dynamic platform icon */}
              {platform === 'youtube' ? (
                <YoutubeIcon size={22} />
              ) : platform === 'instagram' ? (
                <InstagramIcon size={22} />
              ) : platform === 'tiktok' ? (
                <TiktokIcon size={22} />
              ) : (
                <Link size={20} color={COLORS.textMuted} strokeWidth={2} />
              )}
              <TextInput
                style={styles.input}
                placeholder="Paste video URL..."
                placeholderTextColor={COLORS.textMuted}
                value={url}
                onChangeText={(text) => {
                  setUrl(text);
                  setError(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                autoFocus
              />
            </View>
            <Pressable
              style={({ pressed }) => [styles.pasteButton, pressed && styles.buttonPressed]}
              onPress={handlePaste}
            >
              <Text style={styles.pasteText}>Paste</Text>
            </Pressable>
          </View>

          {/* Error */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Submit button with glowing border during analysis */}
          <GlowingBorder
            isActive={isLoading}
            borderRadius={RADIUS.pill}
            style={{ marginBottom: SPACING.md }}
          >
            <Button
              title={isLoading ? 'Analyzing...' : 'Extract Ingredients'}
              onPress={handleSubmit}
              isLoading={isLoading}
              size="lg"
            />
          </GlowingBorder>

          {/* Supported platforms */}
          <Text style={styles.supportedText}>Supports YouTube, TikTok, and Instagram</Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.headingLarge,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: FONT_SIZES.bodyLarge,
    color: COLORS.textPrimary,
  },
  pasteButton: {
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.accentBackground,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
  },
  pasteText: {
    fontSize: FONT_SIZES.bodyMedium,
    fontWeight: '600',
    color: COLORS.primary,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  platformBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accentBackground,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
  },
  platformText: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.primary,
    fontWeight: '500',
  },
  errorText: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  supportedText: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
