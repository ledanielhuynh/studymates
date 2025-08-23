import 'dotenv/config';
import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
	name: 'StudyMates',
	slug: 'studymates',
	scheme: 'studymates',
	version: '1.0.0',
	orientation: 'portrait',
	icon: './assets/icon.png',
	splash: {
		image: './assets/splash.png',
		resizeMode: 'contain',
		backgroundColor: '#ffffff',
	},
	userInterfaceStyle: 'automatic',
	ios: { supportsTablet: true },
	android: { adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#ffffff' } },
	web: { bundler: 'metro' },
	extra: {
		supabaseUrl: process.env.SUPABASE_URL ?? '',
		supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? '',
	},
};

export default config;