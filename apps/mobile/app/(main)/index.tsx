import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GreetingCard } from '../../components/home/GreetingCard';
import { PlatformBadge } from '../../components/home/PlatformBadge';
import { detectPlatform } from '../../lib/platform';
import { useRecipeStore } from '../../stores/recipe';

export default function HomeScreen() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const analyzeVideo = useRecipeStore((state) => state.analyzeVideo);

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

  const handleAnalyze = useCallback(async () => {
    if (!url.trim()) {
      setError('Please enter a video URL');
      return;
    }

    if (!platform) {
      setError('Unsupported platform. Please use YouTube, TikTok, or Instagram.');
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);
    setError(null);

    try {
      const recipeId = await analyzeVideo(url);
      router.push(`/(main)/recipe/${recipeId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze video');
    } finally {
      setIsLoading(false);
    }
  }, [url, platform, analyzeVideo]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <GreetingCard />

        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Analyze a cooking video</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Paste video URL here..."
              placeholderTextColor="#9E9E9E"
              value={url}
              onChangeText={(text) => {
                setUrl(text);
                setError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            <Pressable
              style={({ pressed }) => [styles.pasteButton, pressed && styles.buttonPressed]}
              onPress={handlePaste}
            >
              <Text style={styles.pasteButtonText}>Paste</Text>
            </Pressable>
          </View>

          {platform ? (
            <View style={styles.platformContainer}>
              <PlatformBadge platform={platform} />
            </View>
          ) : null}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            style={({ pressed }) => [
              styles.analyzeButton,
              pressed && styles.buttonPressed,
              isLoading && styles.analyzeButtonDisabled,
            ]}
            onPress={handleAnalyze}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.analyzeButtonText}>Extract Ingredients</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.supportedPlatforms}>
          <Text style={styles.supportedTitle}>Supported platforms</Text>
          <View style={styles.platformIcons}>
            <Text style={styles.platformIcon}>📺 YouTube</Text>
            <Text style={styles.platformIcon}>🎵 TikTok</Text>
            <Text style={styles.platformIcon}>📸 Instagram</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputSection: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#212121',
  },
  pasteButton: {
    height: 48,
    paddingHorizontal: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pasteButtonText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  platformContainer: {
    marginTop: 12,
  },
  errorText: {
    marginTop: 12,
    color: '#D32F2F',
    fontSize: 14,
  },
  analyzeButton: {
    marginTop: 20,
    height: 52,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  supportedPlatforms: {
    marginTop: 32,
    alignItems: 'center',
  },
  supportedTitle: {
    fontSize: 14,
    color: '#9E9E9E',
    marginBottom: 12,
  },
  platformIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  platformIcon: {
    fontSize: 13,
    color: '#757575',
  },
});
