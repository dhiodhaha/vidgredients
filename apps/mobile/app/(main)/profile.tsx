// LinearGradient removed - using solid color fallback
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Crown, SignOut, Sparkle, User } from 'phosphor-react-native';
import { useCallback } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import { signOut, useIsAuthenticated } from '../../stores/auth';
import { useHasPremium, usePremiumStore } from '../../stores/premium';

export default function ProfileScreen() {
  const { user } = useIsAuthenticated();
  const isPremium = useHasPremium();

  const handleLogout = useCallback(async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await usePremiumStore.getState().clearUser();
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }, []);

  const handleRestore = useCallback(async () => {
    const restored = await usePremiumStore.getState().restore();
    if (restored) {
      Alert.alert('Restored', 'Your premium access has been restored.');
    } else {
      Alert.alert('No Purchases', 'No previous purchases found.');
    }
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.textPrimary} weight="bold" />
        </Pressable>
        <Text style={styles.title}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* User Card */}
      <View style={styles.card}>
        <View style={styles.avatar}>
          <User size={32} color={COLORS.primary} weight="bold" />
        </View>
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{user?.name || 'User'}</Text>
            {isPremium && (
              <View style={styles.premiumBadge}>
                <Crown size={12} color="#F5D49A" weight="fill" />
                <Text style={styles.premiumBadgeText}>PRO</Text>
              </View>
            )}
          </View>
          <Text style={styles.email}>{user?.email || ''}</Text>
        </View>
      </View>

      {/* Premium Upsell or Status */}
      {isPremium ? (
        <View style={styles.premiumCard}>
          <View style={styles.premiumGradient}>
            <Crown size={24} color="#F5D49A" weight="fill" />
            <View style={styles.premiumInfo}>
              <Text style={styles.premiumTitle}>Premium Member</Text>
              <Text style={styles.premiumDesc}>You have access to all features</Text>
            </View>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={() => router.push('/paywall')}
          style={({ pressed }) => [styles.upgradeCard, pressed && { opacity: 0.9 }]}
        >
          <View style={styles.upgradeGradient}>
            <Sparkle size={24} color="#FFFFFF" weight="fill" />
            <View style={styles.upgradeInfo}>
              <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
              <Text style={styles.upgradeDesc}>Unlock meal plans, unlimited saves & more</Text>
            </View>
            <ArrowRight size={20} color="#FFFFFF" weight="bold" />
          </View>
        </Pressable>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {!isPremium && (
          <Pressable
            onPress={handleRestore}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
          >
            <Text style={styles.actionText}>Restore Purchases</Text>
          </Pressable>
        )}

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
        >
          <SignOut size={20} color={COLORS.error} weight="bold" />
          <Text style={[styles.actionText, { color: COLORS.error }]}>Log Out</Text>
        </Pressable>

        {/* DEV ONLY: Toggle premium for testing */}
        {__DEV__ && (
          <Pressable
            onPress={() => usePremiumStore.getState().setDevPremium(!isPremium)}
            style={({ pressed }) => [
              styles.actionButton,
              styles.devButton,
              pressed && styles.actionPressed,
            ]}
          >
            <Text style={styles.actionText}>
              {isPremium ? '🔓 Dev: Disable Premium' : '🔒 Dev: Enable Premium'}
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.headingLarge,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accentBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  name: {
    fontSize: FONT_SIZES.headingMedium,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  premiumBadgeText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    color: '#F5D49A',
    letterSpacing: 1,
  },
  email: {
    fontSize: FONT_SIZES.bodyMedium,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },
  premiumCard: {
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
    backgroundColor: '#3D4A2A', // Deep olive (Alma)
    borderRadius: RADIUS.lg,
  },
  premiumInfo: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  premiumDesc: {
    fontSize: FONT_SIZES.bodySmall,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  upgradeCard: {
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
    backgroundColor: COLORS.primary, // Solid fallback for LinearGradient
    borderRadius: RADIUS.lg,
  },
  upgradeInfo: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  upgradeDesc: {
    fontSize: FONT_SIZES.bodySmall,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  actions: {
    gap: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  actionPressed: {
    opacity: 0.7,
  },
  actionText: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  devButton: {
    backgroundColor: '#F0EBE1', // Warm cream to indicate dev feature
    borderWidth: 2,
    borderColor: '#E8963A',
    borderStyle: 'dashed',
  },
});
