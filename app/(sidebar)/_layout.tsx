import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CMSSidebar } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { isAdminRole } from '@/hooks/useRouteGuard';

const { width: screenWidth } = Dimensions.get('window');
const SIDEBAR_WIDTH = Platform.select({
  web: 270, // Same as in CMSSidebar
  default: Math.min(300, screenWidth * 0.85),
});

export default function AdminLayout() {
  const { user, userProfile, isLoading, isUserProfileLoading } = useAuth();

  useEffect(() => {
    // Wait until authentication status and profile are fully loaded
    if (!isLoading && !isUserProfileLoading) {
      if (!user) {
        // If user is not authenticated, redirect to CMS login
        router.replace('/login');
      } else if (userProfile && !isAdminRole(userProfile.role)) {
        // If user doesn't have admin access, redirect to unauthorized
        router.replace('/unauthorized');
      }
    }
  }, [user, userProfile, isLoading, isUserProfileLoading]);

  // Show loading state while authentication is being determined
  if (isLoading || isUserProfileLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0A1B47" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Redirect if user is not authenticated or profile is missing
  if (!user || !userProfile) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0A1B47" />
        <Text style={styles.loadingText}>Loading User...</Text>
      </View>
    );
  }
  return (
    <ThemeProvider value={DefaultTheme}>
      <View style={styles.container}>
        {/* New Hierarchical Sidebar */}
        <CMSSidebar userRole={userProfile?.role} />
        {/* Main Content Area */}
        <View style={styles.content}>
          <Stack
            screenOptions={{ headerShown: false, headerBackVisible: false }}
          />
        </View>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: '100%',
    width: '100%',
  },
  content: {
    flex: 1,
    ...Platform.select({
      web: {
        marginLeft: SIDEBAR_WIDTH, // Push content to the right of the fixed sidebar
      },
    }),
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#0A1B47',
    fontWeight: '500',
  },
});
