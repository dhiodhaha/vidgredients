import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/react';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

// Get API URL from environment or use default
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8787';

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
