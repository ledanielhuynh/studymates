import { useEffect, useState, useCallback } from 'react';
import * as Location from 'expo-location';

export function useLocation() {
	const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
	const [coords, setCoords] = useState<Location.LocationObjectCoords | null>(null);
	const [error, setError] = useState<string | null>(null);

	const requestPermission = useCallback(async () => {
		try {
			const { status } = await Location.requestForegroundPermissionsAsync();
			setPermissionStatus(status);
			if (status !== Location.PermissionStatus.GRANTED) {
				setError('Location permission not granted');
				return null;
			}
			const loc = await Location.getCurrentPositionAsync({});
			setCoords(loc.coords);
			return loc.coords;
		} catch (e: any) {
			setError(e?.message ?? 'Failed to get location');
			return null;
		}
	}, []);

	useEffect(() => {
		Location.getForegroundPermissionsAsync().then(({ status }) => setPermissionStatus(status));
	}, []);

	return { permissionStatus, coords, error, requestPermission };
}