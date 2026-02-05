import { memo, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
      <View style={styles.card}>
        <Text style={styles.emoji}>👋</Text>
        <Text style={styles.greeting}>{greeting}</Text>
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
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#388E3C',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
