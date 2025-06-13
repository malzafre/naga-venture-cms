import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CMSRouteGuard } from '@/components';

/**
 * Business Registrations Screen
 *
 * Main screen for managing business registrations including:
 * - Pending approvals
 * - Registration history
 * - Rejected applications
 */
export default function BusinessRegistrationsScreen() {
  return (
    <CMSRouteGuard routePath="/(sidebar)/business-management/business-registrations">
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Business Registrations</Text>
          <Text style={styles.subtitle}>
            Manage all business registration requests, approvals, and history
          </Text>

          {/* TODO: Add your business registration management components here */}
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              Business registration management interface will be implemented
              here.
            </Text>
            <Text style={styles.placeholderText}>
              This can include tabs or sections for:
            </Text>
            <Text style={styles.placeholderText}>• Pending Approvals</Text>
            <Text style={styles.placeholderText}>• Registration History</Text>
            <Text style={styles.placeholderText}>• Rejected Applications</Text>
          </View>
        </View>
      </SafeAreaView>
    </CMSRouteGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  placeholder: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
});
