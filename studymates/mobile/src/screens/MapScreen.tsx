import MapView, { Marker, Region } from 'react-native-maps';
import { View } from 'react-native';
import { useMemo } from 'react';

export default function MapScreen() {
	const region: Region = useMemo(() => ({
		latitude: -33.9173, // UNSW Sydney approx
		longitude: 151.2313,
		latitudeDelta: 0.01,
		longitudeDelta: 0.01,
	}), []);

	return (
		<View className="w-full items-center">
			<MapView style={{ width: '92%', height: 240, borderRadius: 12 }} initialRegion={region}>
				<Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} title="UNSW" />
			</MapView>
		</View>
	);
}