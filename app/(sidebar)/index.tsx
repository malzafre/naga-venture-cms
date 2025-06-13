import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

/**
 * Sidebar Index Route
 *
 * Automatically redirects to the dashboard when accessing the sidebar root.
 * This ensures users always land on a valid page within the admin area.
 */
export default function SidebarIndex() {
  useEffect(() => {
    // Redirect to dashboard immediately
    router.replace('/(sidebar)/dashboard');
  }, []);

  // Show loading while redirecting
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#0A1B47" />
    </View>
  );
}
