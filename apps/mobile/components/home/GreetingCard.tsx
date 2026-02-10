import { memo, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../lib/theme';

export const GreetingCard = memo(function GreetingCard() {
  const [greeting, setGreeting] = useState('Good Morning');
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Good Morning');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  }, []);

  if (isDismissed) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Alma-style dark tooltip / quick tip card */}
      <View style={styles.card}>
        <Text style={styles.tipLabel}>ℹ️ Quick tip</Text>
        <Text style={styles.greeting}>{greeting}!</Text>
        <Text style={styles.subtitle}>
          Have a great day ahead! Ready to cook something delicious?
        </Text>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={() => setIsDismissed(true)}
        >
          <Text style={styles.buttonText}>Got it</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  // Alma dark tooltip style — warm charcoal, not pure black
  card: {
    backgroundColor: COLORS.textPrimary, // #2C2C2C — warm charcoal
    borderRadius: RADIUS.xl, // 24px — Alma tooltip radius
    padding: SPACING.lg,
    alignItems: 'center',
  },
  tipLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textInverse, // White on dark bg
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)', // Muted white
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.cardPadding,
  },
  // Alma: inverted cream button on dark card
  button: {
    backgroundColor: COLORS.accentBackground, // Cream parchment
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg, // 20px — Alma CTA radius
    width: '100%',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
});
