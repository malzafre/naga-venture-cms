import { Bell, SignOut, User } from 'phosphor-react-native';
import React from 'react';
import {
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { useSidebarLogic } from '@/hooks/useSidebarLogic';
import { UserRole } from '@/types/supabase';

import { CMSText } from '../atoms';
import { CMSNavigationSection } from '../molecules';

interface CMSSidebarProps {
  userRole?: UserRole;
  isVisible?: boolean;
  onNavigate?: (path: string) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const SIDEBAR_WIDTH = Platform.select({
  web: 270, // Increased from 260 for better text readability
  default: Math.min(300, screenWidth * 0.85), // Increased from 260
});

/**
 * CMSSidebar - Organism Component
 *
 * Main hierarchical sidebar navigation for Tourism CMS.
 * Following "Smart Hook, Dumb Component" pattern from coding guidelines.
 *
 * Features:
 * - Purely presentational (all logic in useSidebarLogic hook)
 * - Role-based navigation filtering
 * - Persistent expand/collapse state
 * - Active route highlighting
 * - Responsive design
 * - Centralized NavigationService usage
 *
 * @param userRole - Current user's role for permission filtering
 * @param isVisible - Whether sidebar is visible (mobile responsive)
 * @param onNavigate - Custom navigation handler
 */
export const CMSSidebar: React.FC<CMSSidebarProps> = ({
  userRole,
  isVisible = true,
  onNavigate,
}) => {
  // Smart Hook contains ALL business logic - following coding guidelines
  const {
    sidebarState,
    filteredNavigation,
    user,
    userProfile,
    handleNavigate,
    handleToggleExpand,
    handleSignOut,
  } = useSidebarLogic(userRole);

  // Render functions (purely presentational)
  const renderHeader = () => (
    <View
      style={[styles.header, { borderBottomColor: 'rgba(255, 255, 255, 0.1)' }]}
    >
      <CMSText type="title" style={[styles.headerTitle, { color: '#FFFFFF' }]}>
        Tourism CMS
      </CMSText>
      {userRole && (
        <CMSText
          type="caption"
          style={[styles.headerSubtitle, { color: 'rgba(255, 255, 255, 0.7)' }]}
        >
          {userRole.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
        </CMSText>
      )}
    </View>
  );

  const renderNavigation = () => (
    <ScrollView
      style={styles.navigationContainer}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      {filteredNavigation.map((section) => {
        const isExpanded = sidebarState.expandedSections.includes(section.id);
        const isActive =
          sidebarState.activeSection === section.id ||
          (section.subsections &&
            section.subsections.some(
              (sub) => sidebarState.activeSection === sub.id
            ));
        return (
          <CMSNavigationSection
            key={section.id}
            section={section}
            isExpanded={isExpanded}
            isActive={isActive}
            onToggleExpand={handleToggleExpand}
            onNavigate={(path: string) => handleNavigate(path, onNavigate)}
            expandedSections={sidebarState.expandedSections}
            level={0}
          />
        );
      })}
    </ScrollView>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <View style={styles.userSection}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <User size={16} color="#666" />
          </View>
          <View style={styles.userDetails}>
            <CMSText type="body" style={styles.userName}>
              {userProfile?.first_name && userProfile?.last_name
                ? `${userProfile.first_name} ${userProfile.last_name}`
                : user?.email || 'Admin User'}
            </CMSText>
            <CMSText type="caption" style={styles.userRole}>
              {userRole
                ?.replace(/_/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase()) || 'Admin'}
            </CMSText>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Bell size={18} color="#666" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
        accessibilityLabel="Sign Out"
        accessibilityRole="button"
      >
        <SignOut size={16} color="#FFFFFF" style={styles.signOutIcon} />
        <CMSText type="body" style={styles.signOutText}>
          Sign Out
        </CMSText>
      </TouchableOpacity>
    </View>
  );

  if (!isVisible) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.sidebar}>
        {renderHeader()}
        {renderNavigation()}
        {renderFooter()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: Platform.select({
      web: 'fixed' as any,
      default: 'absolute',
    }),
    top: 0,
    left: 0,
    height: '100%',
    width: SIDEBAR_WIDTH,
    zIndex: 1000,
    backgroundColor: '#0A1B47',
  },
  sidebar: {
    flex: 1,
    backgroundColor: '#0A1B47',
    ...Platform.select({
      web: {
        boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
    }),
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  navigationContainer: {
    flex: 1,
    paddingVertical: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  notificationButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(220, 53, 69, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  signOutIcon: {
    marginRight: 6,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
