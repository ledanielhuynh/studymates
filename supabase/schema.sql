-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE study_personality_shape AS ENUM ('circle', 'square', 'triangle', 'star');
CREATE TYPE study_personality_color AS ENUM ('red', 'blue', 'green', 'yellow');
CREATE TYPE session_status AS ENUM ('active', 'paused', 'completed');
CREATE TYPE session_type AS ENUM ('deep_work', 'group_project', 'revision', 'casual');
CREATE TYPE phase_type AS ENUM ('focus', 'break');
CREATE TYPE participant_status AS ENUM ('active', 'left', 'removed');
CREATE TYPE phase_status AS ENUM ('focus', 'break', 'away');
CREATE TYPE join_request_status AS ENUM ('pending', 'accepted', 'expired', 'withdrawn');
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'blocked');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL CHECK (email LIKE '%@unsw.edu.au'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  study_personality_shape study_personality_shape NOT NULL,
  study_personality_color study_personality_color NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE,
  current_location JSONB,
  current_session_id UUID REFERENCES study_sessions(id)
);

-- Study sessions table
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  location JSONB NOT NULL,
  location_name TEXT NOT NULL,
  max_participants INTEGER DEFAULT 6,
  current_participants INTEGER DEFAULT 1,
  status session_status DEFAULT 'active',
  session_type session_type NOT NULL,
  convenience_tags TEXT[] DEFAULT '{}',
  pomodoro_duration INTEGER DEFAULT 1500, -- 25 minutes in seconds
  break_duration INTEGER DEFAULT 300, -- 5 minutes in seconds
  current_phase phase_type DEFAULT 'focus',
  phase_start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  next_break_time TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '25 minutes')
);

-- Session participants table
CREATE TABLE session_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id UUID NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  status participant_status DEFAULT 'active',
  current_phase_status phase_status DEFAULT 'focus',
  UNIQUE(session_id, user_id)
);

-- Join requests table
CREATE TABLE join_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id UUID NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status join_request_status DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  location_revealed BOOLEAN DEFAULT false,
  UNIQUE(session_id, requester_id)
);

-- Friends table
CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status friendship_status DEFAULT 'pending',
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_online ON users(is_online);
CREATE INDEX idx_users_location ON users USING GIN(current_location);
CREATE INDEX idx_study_sessions_creator ON study_sessions(creator_id);
CREATE INDEX idx_study_sessions_status ON study_sessions(status);
CREATE INDEX idx_study_sessions_location ON study_sessions USING GIN(location);
CREATE INDEX idx_session_participants_session ON session_participants(session_id);
CREATE INDEX idx_session_participants_user ON session_participants(user_id);
CREATE INDEX idx_join_requests_session ON join_requests(session_id);
CREATE INDEX idx_join_requests_requester ON join_requests(requester_id);
CREATE INDEX idx_join_requests_status ON join_requests(status);
CREATE INDEX idx_join_requests_expires ON join_requests(expires_at);
CREATE INDEX idx_friends_user ON friends(user_id);
CREATE INDEX idx_friends_friend ON friends(friend_id);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Study sessions policies
CREATE POLICY "Anyone can view active study sessions" ON study_sessions
  FOR SELECT USING (status = 'active');

CREATE POLICY "Creators can view their own sessions" ON study_sessions
  FOR SELECT USING (creator_id = auth.uid());

CREATE POLICY "Creators can update their own sessions" ON study_sessions
  FOR UPDATE USING (creator_id = auth.uid());

CREATE POLICY "Authenticated users can create sessions" ON study_sessions
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Session participants policies
CREATE POLICY "Participants can view session participants" ON session_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM session_participants sp2 
      WHERE sp2.session_id = session_participants.session_id 
      AND sp2.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own participation" ON session_participants
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can join sessions" ON session_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Join requests policies
CREATE POLICY "Requesters can view their own requests" ON join_requests
  FOR SELECT USING (requester_id = auth.uid());

CREATE POLICY "Session creators can view requests for their sessions" ON join_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM study_sessions ss 
      WHERE ss.id = join_requests.session_id 
      AND ss.creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can create join requests" ON join_requests
  FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Session creators can update requests for their sessions" ON join_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM study_sessions ss 
      WHERE ss.id = join_requests.session_id 
      AND ss.creator_id = auth.uid()
    )
  );

-- Friends policies
CREATE POLICY "Users can view their own friendships" ON friends
  FOR SELECT USING (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Users can create friend requests" ON friends
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own friend requests" ON friends
  FOR UPDATE USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Functions

-- Function to update user's online status
CREATE OR REPLACE FUNCTION update_user_online_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_seen = NOW();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_online_status_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_online_status();

-- Function to update session participant count
CREATE OR REPLACE FUNCTION update_session_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE study_sessions 
    SET current_participants = current_participants + 1
    WHERE id = NEW.session_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE study_sessions 
    SET current_participants = current_participants - 1
    WHERE id = OLD.session_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_participant_count_trigger
  AFTER INSERT OR DELETE ON session_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_session_participant_count();

-- Function to expire join requests
CREATE OR REPLACE FUNCTION expire_join_requests()
RETURNS void AS $$
BEGIN
  UPDATE join_requests 
  SET status = 'expired' 
  WHERE status = 'pending' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to check compatibility between users
CREATE OR REPLACE FUNCTION check_compatibility(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user1_shape study_personality_shape;
  user1_color study_personality_color;
  user2_shape study_personality_shape;
  user2_color study_personality_color;
BEGIN
  SELECT study_personality_shape, study_personality_color 
  INTO user1_shape, user1_color 
  FROM users WHERE id = user1_id;
  
  SELECT study_personality_shape, study_personality_color 
  INTO user2_shape, user2_color 
  FROM users WHERE id = user2_id;
  
  -- Compatible if same shape OR same color (but not both)
  RETURN (user1_shape = user2_shape AND user1_color != user2_color) OR
         (user1_shape != user2_shape AND user1_color = user2_color);
END;
$$ LANGUAGE plpgsql;

-- Function to get nearby compatible sessions
CREATE OR REPLACE FUNCTION get_nearby_compatible_sessions(
  user_location JSONB,
  user_id UUID,
  radius_meters INTEGER DEFAULT 500
)
RETURNS TABLE (
  session_id UUID,
  creator_id UUID,
  title TEXT,
  description TEXT,
  location JSONB,
  location_name TEXT,
  session_type session_type,
  convenience_tags TEXT[],
  current_participants INTEGER,
  max_participants INTEGER,
  current_phase phase_type,
  next_break_time TIMESTAMP WITH TIME ZONE,
  distance_meters NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ss.id,
    ss.creator_id,
    ss.title,
    ss.description,
    ss.location,
    ss.location_name,
    ss.session_type,
    ss.convenience_tags,
    ss.current_participants,
    ss.max_participants,
    ss.current_phase,
    ss.next_break_time,
    ST_Distance(
      ST_MakePoint(
        (user_location->>'longitude')::NUMERIC,
        (user_location->>'latitude')::NUMERIC
      )::geography,
      ST_MakePoint(
        (ss.location->>'longitude')::NUMERIC,
        (ss.location->>'latitude')::NUMERIC
      )::geography
    ) as distance_meters
  FROM study_sessions ss
  WHERE ss.status = 'active'
    AND ss.current_participants < ss.max_participants
    AND check_compatibility(user_id, ss.creator_id)
    AND ST_Distance(
      ST_MakePoint(
        (user_location->>'longitude')::NUMERIC,
        (user_location->>'latitude')::NUMERIC
      )::geography,
      ST_MakePoint(
        (ss.location->>'longitude')::NUMERIC,
        (ss.location->>'latitude')::NUMERIC
      )::geography
    ) <= radius_meters
  ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql;
