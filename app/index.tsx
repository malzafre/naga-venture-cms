import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { ImageBackground, Platform, Text, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import { CMSButton, CMSText } from '@/components/atoms';
import { NavigationService } from '@/constants/NavigationService';

if (Platform.OS !== 'web') {
  // Only load the polyfill on native platforms
  require('react-native-url-polyfill/auto');
}

const Index = () => {
  const [fontsLoaded] = useFonts({
    'Poppins-Black': require('@/assets/fonts/Poppins-Black.ttf'),
    'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  const imageBackground =
    'https://i0.wp.com/nagayon.com/wp-content/uploads/2024/08/oragon-monument-by-colline.jpg';
  const handleAdminLogin = () => {
    console.log('🔥 Admin Login button pressed!');
    alert('Button clicked! Check console for navigation details.');

    try {
      console.log('📡 Attempting NavigationService.toLogin()...');
      const success = NavigationService.toLogin();
      console.log('📡 NavigationService result:', success);

      if (!success) {
        console.warn('⚠️ NavigationService failed, using fallback');
        console.log('📡 Attempting router.push fallback...');
        router.push('/login');
        console.log('✅ Fallback navigation attempted');
      }
    } catch (error) {
      console.error('❌ Navigation error:', error);
      console.log('📡 Attempting router.push as last resort...');
      router.push('/login');
    }
  };

  return (
    <PaperProvider>
      <ImageBackground
        source={{ uri: imageBackground }}
        resizeMode="cover"
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.0)', // Top (transparent)
            'rgba(10, 27, 71, 0.8)', // Middle
            '#0A1B47', // Bottom (solid)
          ]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: '35%',
            pointerEvents: 'box-none', // Allow pointer events to pass through
          }}
        >
          <CMSText
            type="title"
            style={{
              fontSize: 38,
              textAlign: 'left',
              marginTop: 250,
              color: '#fff',
            }}
          >
            Begin Your Journey in the Heart of Naga
          </CMSText>
          <Text
            style={{
              fontSize: 18,
              fontFamily: 'Poppins-Regular',
              textAlign: 'left',
              color: 'white',
              marginTop: 20,
            }}
          >
            {' '}
            - Where Faith Meets Adventure.
          </Text>
          <View
            style={{
              flexDirection: 'column',
              gap: 16,
              marginTop: 80,
              width: '100%',
              alignItems: 'center',
              pointerEvents: 'box-none', // Allow events to pass through to children
              zIndex: 10, // Ensure button is above other elements
            }}
          >
            <CMSButton
              title="Admin Login"
              fullWidth
              variant="secondary"
              size="large"
              onPress={handleAdminLogin}
              style={{
                minHeight: 55,
                backgroundColor: 'rgba(222, 227, 242, 0.95)',
                borderColor: '#007AFF',
                borderWidth: 2,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                pointerEvents: 'auto', // Ensure button receives pointer events
                cursor: 'pointer', // Web-specific cursor
              }}
            />
          </View>
        </LinearGradient>
      </ImageBackground>
    </PaperProvider>
  );
};

export default Index;
