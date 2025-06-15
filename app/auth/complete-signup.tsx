import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import CMSButton from '@/components/atoms/CMSButton';
import CMSInput from '@/components/atoms/CMSInput';
import { useAuth } from '@/hooks/useAuthModern';
import { supabase } from '@/lib/supabaseClient';

/**
 * Complete Signup Page - For staff invitation completion
 *
 * This page handles the staff invitation completion flow:
 * 1. User clicks on invitation link in email
 * 2. They're redirected to this page with token_hash and type
 * 3. They set their password to complete account setup
 * 4. They're redirected to the CMS dashboard
 */

interface CompleteSignupForm {
  password: string;
  confirmPassword: string;
}

export default function CompleteSignupPage() {
  const router = useRouter();
  const {
    token_hash,
    type,
    error: urlError,
  } = useLocalSearchParams<{
    token_hash?: string;
    type?: string;
    error?: string;
  }>();

  const { user } = useAuth();
  const [formData, setFormData] = useState<CompleteSignupForm>({
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      router.replace('/(sidebar)/dashboard');
    }
  }, [user, router]);

  // Verify the invitation token when component mounts
  useEffect(() => {
    const verifyInvitation = async () => {
      if (!token_hash || !type) {
        Alert.alert(
          'Invalid Link',
          'This invitation link is invalid or has expired. Please contact your administrator for a new invitation.',
          [{ text: 'OK', onPress: () => router.replace('/login') }]
        );
        return;
      }

      if (urlError) {
        Alert.alert(
          'Link Error',
          'There was an error with the invitation link. Please contact your administrator.',
          [{ text: 'OK', onPress: () => router.replace('/login') }]
        );
        return;
      }

      try {
        // Verify the OTP token to get user info
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any,
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          // User is now logged in, get their email
          setUserEmail(data.user.email || '');
          setIsVerifying(false);
        } else {
          throw new Error('No user data received');
        }
      } catch (error: any) {
        console.error('Error verifying invitation:', error);
        Alert.alert(
          'Verification Failed',
          error.message ||
            'Failed to verify invitation. Please try again or contact your administrator.',
          [{ text: 'OK', onPress: () => router.replace('/login') }]
        );
      }
    };

    verifyInvitation();
  }, [token_hash, type, urlError, router]);

  const handleCompleteSignup = async () => {
    if (!formData.password || !formData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) {
        throw error;
      }

      // Mark user as verified in their profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', user?.id);

      if (profileError) {
        console.warn('Failed to update profile verification:', profileError);
        // Don't fail the whole process for this
      }

      Alert.alert(
        'Account Setup Complete!',
        'Your account has been successfully set up. You can now access the Tourism CMS.',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/(sidebar)/dashboard'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error completing signup:', error);
      Alert.alert(
        'Setup Failed',
        error.message || 'Failed to complete account setup. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Verifying Invitation...</Text>
          <Text style={styles.subtitle}>
            Please wait while we verify your invitation link.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Complete Your Account Setup</Text>
        <Text style={styles.subtitle}>
          Welcome to the NAGA VENTURE Tourism CMS! Please set your password to
          complete your account setup.
        </Text>
        {userEmail && (
          <View style={styles.emailContainer}>
            <Text style={styles.emailLabel}>Account Email:</Text>
            <Text style={styles.emailText}>{userEmail}</Text>
          </View>
        )}{' '}
        <View style={styles.form}>
          <CMSInput
            label="Password"
            value={formData.password}
            onChangeText={(text: string) =>
              setFormData((prev) => ({ ...prev, password: text }))
            }
            secureTextEntry
            placeholder="Enter your password"
            autoCapitalize="none"
          />

          <CMSInput
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(text: string) =>
              setFormData((prev) => ({ ...prev, confirmPassword: text }))
            }
            secureTextEntry
            placeholder="Confirm your password"
            autoCapitalize="none"
          />

          <Text style={styles.passwordRequirements}>
            Password must be at least 8 characters long
          </Text>

          <CMSButton
            title="Complete Setup"
            onPress={handleCompleteSignup}
            isLoading={isLoading}
            disabled={isLoading}
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
    lineHeight: 22,
  },
  emailContainer: {
    backgroundColor: '#e8f4fd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  emailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    color: '#1e40af',
    fontWeight: '500',
  },
  form: {
    gap: 16,
  },
  passwordRequirements: {
    fontSize: 14,
    color: '#666',
    marginTop: -8,
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
  },
});
