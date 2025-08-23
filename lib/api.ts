import { supabase } from './supabase';
import { locationService, LocationData } from './location';
import { Database } from './database.types';

type User = Database['public']['Tables']['users']['Row'];
type StudySession = Database['public']['Tables']['study_sessions']['Row'];
type JoinRequest = Database['public']['Tables']['join_requests']['Row'];
type SessionParticipant = Database['public']['Tables']['session_participants']['Row'];

export class ApiService {
  private static instance: ApiService;

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // User operations
  async createUserProfile(userData: {
    email: string;
    study_personality_shape: 'circle' | 'square' | 'triangle' | 'star';
    study_personality_color: 'red' | 'blue' | 'green' | 'yellow';
    display_name?: string;
  }): Promise<{ data: User | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: userData.email,
        study_personality_shape: userData.study_personality_shape,
        study_personality_color: userData.study_personality_color,
        display_name: userData.display_name,
        is_online: true,
      })
      .select()
      .single();

    return { data, error };
  }

  async updateUserLocation(location: LocationData): Promise<{ error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('users')
      .update({
        current_location: location,
        last_seen: new Date().toISOString(),
        is_online: true,
      })
      .eq('id', user.id);

    return { error };
  }

  async updateUserOnlineStatus(isOnline: boolean): Promise<{ error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('users')
      .update({
        is_online,
        last_seen: new Date().toISOString(),
      })
      .eq('id', user.id);

    return { error };
  }

  async getCurrentUser(): Promise<{ data: User | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return { data, error };
  }

  // Study session operations
  async createStudySession(sessionData: {
    title?: string;
    description?: string;
    location: LocationData;
    location_name: string;
    session_type: 'deep_work' | 'group_project' | 'revision' | 'casual';
    convenience_tags?: string[];
    max_participants?: number;
    pomodoro_duration?: number;
    break_duration?: number;
  }): Promise<{ data: StudySession | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('study_sessions')
      .insert({
        creator_id: user.id,
        title: sessionData.title,
        description: sessionData.description,
        location: sessionData.location,
        location_name: sessionData.location_name,
        session_type: sessionData.session_type,
        convenience_tags: sessionData.convenience_tags || [],
        max_participants: sessionData.max_participants || 6,
        pomodoro_duration: sessionData.pomodoro_duration || 1500,
        break_duration: sessionData.break_duration || 300,
      })
      .select()
      .single();

    if (data && !error) {
      // Add creator as first participant
      await this.joinSession(data.id);
    }

    return { data, error };
  }

  async getNearbySessions(radius: number = 500): Promise<{ data: any[]; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: [], error: 'User not authenticated' };
    }

    const location = await locationService.getCurrentLocation();
    if (!location) {
      return { data: [], error: 'Location not available' };
    }

    const { data, error } = await supabase
      .rpc('get_nearby_compatible_sessions', {
        user_location: location,
        user_id: user.id,
        radius_meters: radius,
      });

    return { data: data || [], error };
  }

  async getSessionById(sessionId: string): Promise<{ data: StudySession | null; error: any }> {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    return { data, error };
  }

  async updateSessionPhase(
    sessionId: string,
    phase: 'focus' | 'break',
    nextBreakTime?: string
  ): Promise<{ error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'User not authenticated' };
    }

    const updateData: any = {
      current_phase: phase,
      phase_start_time: new Date().toISOString(),
    };

    if (nextBreakTime) {
      updateData.next_break_time = nextBreakTime;
    }

    const { error } = await supabase
      .from('study_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .eq('creator_id', user.id);

    return { error };
  }

  // Join request operations
  async createJoinRequest(sessionId: string): Promise<{ data: JoinRequest | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    // Check if user already has a pending request
    const { data: existingRequest } = await supabase
      .from('join_requests')
      .select('*')
      .eq('session_id', sessionId)
      .eq('requester_id', user.id)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      return { data: existingRequest, error: null };
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expire in 1 hour

    const { data, error } = await supabase
      .from('join_requests')
      .insert({
        session_id: sessionId,
        requester_id: user.id,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    return { data, error };
  }

  async getJoinRequestsForSession(sessionId: string): Promise<{ data: JoinRequest[]; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: [], error: 'User not authenticated' };
    }

    // Check if user is the session creator
    const { data: session } = await supabase
      .from('study_sessions')
      .select('creator_id')
      .eq('id', sessionId)
      .single();

    if (!session || session.creator_id !== user.id) {
      return { data: [], error: 'Not authorized' };
    }

    const { data, error } = await supabase
      .from('join_requests')
      .select('*')
      .eq('session_id', sessionId)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    return { data: data || [], error };
  }

  async acceptJoinRequest(requestId: string): Promise<{ error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'User not authenticated' };
    }

    // Get the join request
    const { data: request, error: requestError } = await supabase
      .from('join_requests')
      .select('*, study_sessions!inner(creator_id)')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      return { error: 'Join request not found' };
    }

    if (request.study_sessions.creator_id !== user.id) {
      return { error: 'Not authorized' };
    }

    // Update join request status
    const { error: updateError } = await supabase
      .from('join_requests')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        location_revealed: true,
      })
      .eq('id', requestId);

    if (updateError) {
      return { error: updateError };
    }

    // Add user to session participants
    const { error: joinError } = await this.joinSession(request.session_id, request.requester_id);

    return { error: joinError };
  }

  async rejectJoinRequest(requestId: string): Promise<{ error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'User not authenticated' };
    }

    // Get the join request
    const { data: request, error: requestError } = await supabase
      .from('join_requests')
      .select('*, study_sessions!inner(creator_id)')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      return { error: 'Join request not found' };
    }

    if (request.study_sessions.creator_id !== user.id) {
      return { error: 'Not authorized' };
    }

    const { error } = await supabase
      .from('join_requests')
      .update({
        status: 'withdrawn',
      })
      .eq('id', requestId);

    return { error };
  }

  // Session participation operations
  async joinSession(sessionId: string, userId?: string): Promise<{ error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'User not authenticated' };
    }

    const targetUserId = userId || user.id;

    const { error } = await supabase
      .from('session_participants')
      .insert({
        session_id: sessionId,
        user_id: targetUserId,
      });

    if (!error) {
      // Update user's current session
      await supabase
        .from('users')
        .update({ current_session_id: sessionId })
        .eq('id', targetUserId);
    }

    return { error };
  }

  async leaveSession(sessionId: string): Promise<{ error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('session_participants')
      .update({
        status: 'left',
        left_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId)
      .eq('user_id', user.id);

    if (!error) {
      // Update user's current session
      await supabase
        .from('users')
        .update({ current_session_id: null })
        .eq('id', user.id);
    }

    return { error };
  }

  async getSessionParticipants(sessionId: string): Promise<{ data: SessionParticipant[]; error: any }> {
    const { data, error } = await supabase
      .from('session_participants')
      .select(`
        *,
        users (
          id,
          display_name,
          study_personality_shape,
          study_personality_color,
          avatar_url
        )
      `)
      .eq('session_id', sessionId)
      .eq('status', 'active')
      .order('joined_at', { ascending: true });

    return { data: data || [], error };
  }

  // Realtime subscriptions
  subscribeToSessionUpdates(sessionId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_sessions',
          filter: `id=eq.${sessionId}`,
        },
        callback
      )
      .subscribe();
  }

  subscribeToJoinRequests(sessionId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`join_requests:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'join_requests',
          filter: `session_id=eq.${sessionId}`,
        },
        callback
      )
      .subscribe();
  }

  subscribeToUserLocation(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user_location:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }
}

export const apiService = ApiService.getInstance();
