import { env } from '@/config/environment';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto'; // Important for Supabase Auth in React Native

// Use validated environment configuration
export const supabase = createClient(
  env.EXPO_PUBLIC_SUPABASE_URL,
  env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Required for Expo/React Native
    },
  }
);
