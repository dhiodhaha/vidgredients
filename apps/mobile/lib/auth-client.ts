import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';

// Get API URL from environment or use default
// Get API URL from environment variables
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8787';

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    expoClient({
      scheme: 'video-to-ingredients',
      storagePrefix: 'video-to-ingredients',
      storage: SecureStore,
    }),
  ],
});

// Export commonly used hooks and methods
export const { useSession, signIn, signUp, signOut } = authClient;
