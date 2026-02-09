import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initPurchases } from '../services/purchases';
import { useIsAuthenticated } from '../stores/auth';
import { usePremiumStore } from '../stores/premium';

export default function RootLayout() {
  const { user, isAuthenticated } = useIsAuthenticated();
  const checkStatus = usePremiumStore((s) => s.checkStatus);
  const syncWithUser = usePremiumStore((s) => s.syncWithUser);

  useEffect(() => {
    initPurchases(user?.id);
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      syncWithUser(user.id);
    } else {
      checkStatus();
    }
  }, [isAuthenticated, user?.id, syncWithUser, checkStatus]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
