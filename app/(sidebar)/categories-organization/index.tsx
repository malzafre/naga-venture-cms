import React from 'react';
import { View } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import { CMSText } from '@/components/atoms';

const CategoriesOrganizationPage = () => {
  return (
    <PaperProvider>
      <View
        style={{
          flex: 1,
          padding: 20,
          backgroundColor: '#f5f5f5',
        }}
      >
        <CMSText
          type="title"
          style={{
            fontSize: 24,
            marginBottom: 20,
            color: '#333',
          }}
        >
          Categories Organization
        </CMSText>

        <CMSText
          type="body"
          style={{
            fontSize: 16,
            color: '#666',
            lineHeight: 24,
          }}
        >
          Category management system for organizing businesses, tourist spots,
          and events. This feature will be implemented in Phase 2 of the
          development roadmap.
        </CMSText>
      </View>
    </PaperProvider>
  );
};

export default CategoriesOrganizationPage;
