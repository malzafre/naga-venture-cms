import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';

import React from 'react';

import { GlobalErrorBoundary } from '@/components/errorBoundaries';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {
  // Note: Loading state and error boundary integration can be expanded here
  // const [isLoading, setIsLoading] = useState(true);

  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <ThemeProvider value={DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
}
