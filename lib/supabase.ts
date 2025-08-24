import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  study_personality: string;
  shape: string;
  color: string;
  personality_name: string;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name?: string;
  creator_id: string;
  location_name?: string;
  location_coordinates?: { x: number; y: number };
  status: 'idle' | 'pomodoro' | 'break';
  convenience_tags?: string[];
  max_members: number;
  current_members: number;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  group_id: string;
  start_time: string;
  end_time?: string;
  pomodoro_cycle: number;
  break_start_time?: string;
  break_end_time?: string;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
}

export interface JoinRequest {
  id: string;
  user_id: string;
  group_id: string;
  status: 'pending' | 'accepted' | 'expired';
  requested_at: string;
  responded_at?: string;
  expires_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
  status: 'active' | 'left';
}
