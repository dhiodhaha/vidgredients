import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { initPurchases } from '../services/purchases';

export default function RootLayout() {
  useEffect(() => {
    // Initialize RevenueCat on app start
    initPurchases();
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </>
  );
}
