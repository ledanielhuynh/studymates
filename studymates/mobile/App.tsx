import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { Text, View, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocation } from './src/hooks/useLocation';
import MapScreen from './src/screens/MapScreen';
import { registerForPushNotificationsAsync } from './src/lib/notifications';

export default function App() {
	const systemScheme = useColorScheme();
	const [theme, setTheme] = useState<'light' | 'dark'>(systemScheme === 'dark' ? 'dark' : 'light');
	const { coords, requestPermission } = useLocation();
	const [pushToken, setPushToken] = useState<string | null>(null);

	useEffect(() => {
		if (!systemScheme) return;
		setTheme(systemScheme === 'dark' ? 'dark' : 'light');
	}, [systemScheme]);

	const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

	const onRegisterPush = async () => {
		try {
			const token = await registerForPushNotificationsAsync();
			setPushToken(token ?? null);
		} catch (e) {
			console.warn(e);
		}
	};

	return (
		<View className={theme === 'dark' ? 'flex-1 items-center justify-center bg-neutral-900' : 'flex-1 items-center justify-center bg-white'}>
			<Text className={theme === 'dark' ? 'text-white text-lg' : 'text-neutral-900 text-lg'}>StudyMates</Text>
			<View className="mt-4 flex-row gap-3">
				<Pressable onPress={toggleTheme} className="rounded-full px-4 py-2 bg-blue-600 active:opacity-80">
					<Text className="text-white">Toggle {theme === 'dark' ? 'Light' : 'Dark'}</Text>
				</Pressable>
				<Pressable onPress={requestPermission} className="rounded-full px-4 py-2 bg-emerald-600 active:opacity-80">
					<Text className="text-white">Get Location</Text>
				</Pressable>
				<Pressable onPress={onRegisterPush} className="rounded-full px-4 py-2 bg-purple-600 active:opacity-80">
					<Text className="text-white">Register Push</Text>
				</Pressable>
			</View>
			{coords ? (
				<Text className={theme === 'dark' ? 'text-white mt-2' : 'text-neutral-800 mt-2'}>
					Lat: {coords.latitude.toFixed(5)}, Lng: {coords.longitude.toFixed(5)}
				</Text>
			) : null}
			{pushToken ? (
				<Text numberOfLines={1} className={theme === 'dark' ? 'text-white mt-2 max-w-[90%]' : 'text-neutral-800 mt-2 max-w-[90%]'}>
					Push: {pushToken}
				</Text>
			) : null}
			<View className="mt-6 w-full items-center">
				<MapScreen />
			</View>
			<StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
		</View>
	);
}
