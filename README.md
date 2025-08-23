# StudyMates

A mobile app for UNSW students to find and join face-to-face study groups on campus with minimal friction.

## Features

- **Study Personality System**: Shape + color compatibility matching
- **Pomodoro-Break Join Flow**: Join requests queue until breaks to avoid disruption
- **Location-Based Discovery**: Find nearby compatible study groups
- **Real-time Updates**: Live session status and participant tracking
- **Neutral Acknowledgement**: Join requests expire neutrally if ignored
- **Campus-Only**: Restricted to @unsw.edu.au email addresses

## Tech Stack

- **Frontend**: React Native (Expo) with TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Location**: expo-location
- **Maps**: react-native-maps
- **Notifications**: expo-notifications
- **CI/CD**: EAS Build with GitHub Actions

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- Expo CLI
- Supabase account
- Google Maps API key (optional)

### 2. Environment Variables

Create a `.env` file in the root directory:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Expo Configuration
EXPO_PUBLIC_PROJECT_ID=ad06c864-4d9a-4191-aec7-a927e4f97508

# Optional: Google Maps API Key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 3. Supabase Setup

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Configure Auth**:
   - Go to Authentication → Settings
   - Enable "Email OTP" sign-in method
   - Add email template for OTP
   - Configure redirect URLs: `studymates://auth/callback`

3. **Set up Database**:
   - Go to SQL Editor
   - Run the schema from `supabase/schema.sql`
   - This creates all tables, RLS policies, and functions

4. **Configure Email Restrictions**:
   - In Authentication → Settings → Auth Providers
   - Add email domain restriction: `@unsw.edu.au`

### 4. Install Dependencies

```bash
npm install
```

### 5. Start Development Server

```bash
npx expo start
```

### 6. Build for Production

```bash
# Android
npx eas build --platform android --profile production

# iOS
npx eas build --platform ios --profile production
```

## Database Schema

### Tables

- **users**: User profiles with study personalities
- **study_sessions**: Active study sessions with Pomodoro timers
- **session_participants**: Users participating in sessions
- **join_requests**: Pending join requests with expiration
- **friends**: Friend relationships between users

### Key Features

- **Row Level Security (RLS)**: All tables have RLS enabled
- **Compatibility System**: Shape + color matching algorithm
- **Location-Based Queries**: PostGIS functions for nearby sessions
- **Real-time Subscriptions**: Live updates via Supabase Realtime

## API Services

### Location Service (`lib/location.ts`)
- GPS tracking and permissions
- UNSW campus boundary detection
- Distance calculations

### Notification Service (`lib/notifications.ts`)
- Push notifications setup
- Pomodoro timer notifications
- Join request alerts

### API Service (`lib/api.ts`)
- Supabase operations wrapper
- Study session management
- Join request handling
- Real-time subscriptions

## Development Workflow

1. **Feature Development**:
   - Create feature branch
   - Implement changes
   - Test locally with Expo
   - Create PR

2. **CI/CD Pipeline**:
   - PRs trigger preview builds
   - Main branch triggers production builds
   - Automated testing and deployment

3. **Database Changes**:
   - Update `supabase/schema.sql`
   - Run migrations in Supabase dashboard
   - Update TypeScript types if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email: support@studymates.app
