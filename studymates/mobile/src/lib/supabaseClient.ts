import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extra = (Constants?.expoConfig?.extra ?? {}) as { supabaseUrl?: string; supabaseAnonKey?: string };

const supabaseUrl = extra.supabaseUrl ?? '';
const supabaseAnonKey = extra.supabaseAnonKey ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		autoRefreshToken: true,
		detectSessionInUrl: false,
		persistSession: true,
	},
});