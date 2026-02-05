import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useIsAuthenticated } from '../stores/auth';

export default function Index() {
  const { isAuthenticated, isPending } = useIsAuthenticated();

  // Show loading while checking auth state
  if (isPending) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // Redirect based on auth state
  if (isAuthenticated) {
    return <Redirect href="/(main)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
