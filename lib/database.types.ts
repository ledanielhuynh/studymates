export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          study_personality_shape: 'circle' | 'square' | 'triangle' | 'star'
          study_personality_color: 'red' | 'blue' | 'green' | 'yellow'
          display_name: string | null
          avatar_url: string | null
          is_online: boolean
          last_seen: string | null
          current_location: Json | null
          current_session_id: string | null
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
          study_personality_shape: 'circle' | 'square' | 'triangle' | 'star'
          study_personality_color: 'red' | 'blue' | 'green' | 'yellow'
          display_name?: string | null
          avatar_url?: string | null
          is_online?: boolean
          last_seen?: string | null
          current_location?: Json | null
          current_session_id?: string | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
          study_personality_shape?: 'circle' | 'square' | 'triangle' | 'star'
          study_personality_color?: 'red' | 'blue' | 'green' | 'yellow'
          display_name?: string | null
          avatar_url?: string | null
          is_online?: boolean
          last_seen?: string | null
          current_location?: Json | null
          current_session_id?: string | null
        }
      }
      study_sessions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          creator_id: string
          title: string | null
          description: string | null
          location: Json
          location_name: string
          max_participants: number
          current_participants: number
          status: 'active' | 'paused' | 'completed'
          session_type: 'deep_work' | 'group_project' | 'revision' | 'casual'
          convenience_tags: string[]
          pomodoro_duration: number
          break_duration: number
          current_phase: 'focus' | 'break'
          phase_start_time: string
          next_break_time: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          creator_id: string
          title?: string | null
          description?: string | null
          location: Json
          location_name: string
          max_participants?: number
          current_participants?: number
          status?: 'active' | 'paused' | 'completed'
          session_type: 'deep_work' | 'group_project' | 'revision' | 'casual'
          convenience_tags?: string[]
          pomodoro_duration?: number
          break_duration?: number
          current_phase?: 'focus' | 'break'
          phase_start_time?: string
          next_break_time?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          creator_id?: string
          title?: string | null
          description?: string | null
          location?: Json
          location_name?: string
          max_participants?: number
          current_participants?: number
          status?: 'active' | 'paused' | 'completed'
          session_type?: 'deep_work' | 'group_project' | 'revision' | 'casual'
          convenience_tags?: string[]
          pomodoro_duration?: number
          break_duration?: number
          current_phase?: 'focus' | 'break'
          phase_start_time?: string
          next_break_time?: string
        }
      }
      session_participants: {
        Row: {
          id: string
          created_at: string
          session_id: string
          user_id: string
          joined_at: string
          left_at: string | null
          status: 'active' | 'left' | 'removed'
          current_phase_status: 'focus' | 'break' | 'away'
        }
        Insert: {
          id?: string
          created_at?: string
          session_id: string
          user_id: string
          joined_at?: string
          left_at?: string | null
          status?: 'active' | 'left' | 'removed'
          current_phase_status?: 'focus' | 'break' | 'away'
        }
        Update: {
          id?: string
          created_at?: string
          session_id?: string
          user_id?: string
          joined_at?: string
          left_at?: string | null
          status?: 'active' | 'left' | 'removed'
          current_phase_status?: 'focus' | 'break' | 'away'
        }
      }
      join_requests: {
        Row: {
          id: string
          created_at: string
          session_id: string
          requester_id: string
          status: 'pending' | 'accepted' | 'expired' | 'withdrawn'
          expires_at: string
          accepted_at: string | null
          location_revealed: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          session_id: string
          requester_id: string
          status?: 'pending' | 'accepted' | 'expired' | 'withdrawn'
          expires_at: string
          accepted_at?: string | null
          location_revealed?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          session_id?: string
          requester_id?: string
          status?: 'pending' | 'accepted' | 'expired' | 'withdrawn'
          expires_at?: string
          accepted_at?: string | null
          location_revealed?: boolean
        }
      }
      friends: {
        Row: {
          id: string
          created_at: string
          user_id: string
          friend_id: string
          status: 'pending' | 'accepted' | 'blocked'
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          friend_id: string
          status?: 'pending' | 'accepted' | 'blocked'
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          friend_id?: string
          status?: 'pending' | 'accepted' | 'blocked'
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
