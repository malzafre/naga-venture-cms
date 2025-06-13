import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto'; // Important for Supabase Auth in React Native

import { supabaseConfig } from '../config/environment';

// Use validated environment configuration
export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    auth: {
      // storage: AsyncStorage, // Uncomment if using AsyncStorage
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Required for Expo/React Native
    },
  }
);
