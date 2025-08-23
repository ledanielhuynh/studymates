import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
	handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false }),
});

export async function registerForPushNotificationsAsync() {
	let token: string | null = null;
	if (Device.isDevice) {
		const { status: existingStatus } = await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;
		if (existingStatus !== 'granted') {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}
		if (finalStatus !== 'granted') {
			throw new Error('Failed to get push token');
		}
		const pushToken = await Notifications.getExpoPushTokenAsync();
		token = pushToken.data;
	} else {
		throw new Error('Must use physical device for Push Notifications');
	}
	return token;
}