import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import React from 'react';
import 'react-native-reanimated';

import { GlobalErrorBoundary } from '@/components/errorBoundaries';
import { AuthInitializer } from '@/components/providers/AuthInitializer';

const queryClient = new QueryClient();

export default function RootLayout() {
  // Note: Loading state and error boundary integration can be expanded here
  // const [isLoading, setIsLoading] = useState(true);
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalErrorBoundary>
        <AuthInitializer>
          <ThemeProvider value={DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
            </Stack>
          </ThemeProvider>
        </AuthInitializer>
      </GlobalErrorBoundary>
    </QueryClientProvider>
  );
}
