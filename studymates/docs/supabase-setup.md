## Supabase Setup

1. Create a new project at https://app.supabase.com
   - Organization: choose or create
   - Project name: StudyMates
   - Region: ap-southeast-2 (Sydney) recommended
   - Save the `Project URL` and `anon` public key (Settings → API)

2. Configure Auth (email OTP + domain restriction)
   - Go to Authentication → Providers → Email
     - Enable Email logins
     - Delivery method: Magic Link (OTP works too)
   - Go to Authentication → Settings → General
     - Allowed email domains: `unsw.edu.au`
     - Disable phone signups if not needed

3. Apply database schema & policies
   - Open SQL Editor and run the contents of:
     - `supabase/schema.sql`
     - `supabase/policies.sql`

4. (Optional) Realtime
   - Database → Replication → WALRUS → Enable for `public` schema (if not already)

5. Connect Expo app
   - In `studymates/mobile`, copy `.env.example` to `.env` and fill values:
     - `SUPABASE_URL` = Project URL
     - `SUPABASE_ANON_KEY` = anon public key
   - Expo will read these via `app.config.ts` extras.

6. Local dev notes
   - Start app: `pnpm dev` (alias for `expo start`)
   - Android: `pnpm android`
   - Web: `pnpm web`

7. CI/CD
   - Add `EXPO_TOKEN` secret to GitHub repo (User Settings → Access Tokens → Expo)
   - Workflow: `.github/workflows/eas-build.yml` builds Android preview on pushes to `main`.