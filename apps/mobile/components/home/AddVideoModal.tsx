import * as Clipboard from 'expo-clipboard';
import { Link, Loader2, X } from 'lucide-react-native';
import { memo, useCallback, useEffect, useState } from 'react';
import {
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
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { detectPlatform } from '../../lib/platform';
import { ANIMATION, COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';

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

  const translateY = useSharedValue(300);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.set(withTiming(1, { duration: ANIMATION.normal }));
      translateY.set(withSpring(0, { damping: 20, stiffness: 300 }));
    } else {
      opacity.set(withTiming(0, { duration: ANIMATION.fast }));
      translateY.set(withTiming(300, { duration: ANIMATION.normal }));
    }
  }, [visible, opacity, translateY]);

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
              <Link size={20} color={COLORS.textMuted} strokeWidth={2} />
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

          {/* Platform indicator */}
          {platform ? (
            <View style={styles.platformBadge}>
              <Text style={styles.platformText}>
                {platform.charAt(0).toUpperCase() + platform.slice(1)} detected
              </Text>
            </View>
          ) : null}

          {/* Error */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Submit button */}
          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              pressed && !isLoading && styles.buttonPressed,
              isLoading && styles.submitDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingRow}>
                <Loader2 size={20} color={COLORS.textInverse} strokeWidth={2} />
                <Text style={styles.submitText}>Analyzing...</Text>
              </View>
            ) : (
              <Text style={styles.submitText}>Extract Ingredients</Text>
            )}
          </Pressable>

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
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  submitDisabled: {
    backgroundColor: COLORS.primaryMuted,
  },
  submitText: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '600',
    color: COLORS.textInverse,
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
