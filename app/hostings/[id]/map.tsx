import { useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { ArrowLeft, LocateFixed, Navigation } from 'lucide-react-native';
import { Button, Empty, IconButton, KText, Spinner } from '@/components/k';
import { color, gutter, radius } from '@/lib/k/theme';
import { place } from '@/lib/k/format';
import { openDirections } from '@/lib/utils/urls';
import { useHostingQuery } from '@/lib/services/graphql/generated';

/**
 * Full-screen map of one listing, opened by tapping the map on the listing
 * screen. Uses the same query as the listing screen, so it shows exactly the
 * location the server lets this viewer see (advert-only listings send no
 * coordinates to renters, so there's nothing to map or route to).
 */
export default function ListingMapScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const insets = useSafeAreaInsets();
	const map = useRef<MapView>(null);
	const [{ data, fetching }] = useHostingQuery({ variables: { hostingId: id, pagination: { limit: 20, offset: 0 }, childrenOnSale: true } });
	const h = data?.hosting;
	const latitude = Number(h?.latitude);
	const longitude = Number(h?.longitude);
	const hasPin = !!h?.latitude && !!h?.longitude && Number.isFinite(latitude) && Number.isFinite(longitude);
	const back = () => (router.canGoBack() ? router.back() : router.replace(`/hostings/${id}`));

	if (!hasPin)
		return (
			<View style={{ flex: 1, backgroundColor: color.bg, justifyContent: 'center', paddingHorizontal: gutter }}>
				{fetching ? (
					<Spinner />
				) : (
					<Empty title="No map location" body="This listing shows only the area, not an exact location." action="Back to listing" onAction={back} />
				)}
			</View>
		);

	const pin = { latitude, longitude };
	const recentre = () => map.current?.animateToRegion({ ...pin, latitudeDelta: 0.012, longitudeDelta: 0.012 }, 400);

	return (
		<View style={{ flex: 1, backgroundColor: color.bg }}>
			<MapView
				ref={map}
				style={StyleSheet.absoluteFill}
				provider={Platform.OS === 'ios' ? PROVIDER_DEFAULT : PROVIDER_GOOGLE}
				userInterfaceStyle="dark"
				initialRegion={{ ...pin, latitudeDelta: 0.012, longitudeDelta: 0.012 }}
				showsUserLocation
				showsMyLocationButton={false}
				toolbarEnabled={false}
			>
				<Marker coordinate={pin} title={h?.title ?? undefined} pinColor={color.amber} />
			</MapView>

			<View style={[s.top, { top: insets.top + 10 }]}>
				<IconButton label="Back" onPress={back}>
					<ArrowLeft size={18} color={color.fg} />
				</IconButton>
				<IconButton label="Centre on the listing" onPress={recentre}>
					<LocateFixed size={18} color={color.fg} />
				</IconButton>
			</View>

			<View style={[s.card, { bottom: insets.bottom + 16 }]}>
				<View style={{ gap: 2 }}>
					<KText v="bodyStrong" numberOfLines={1}>
						{h?.title}
					</KText>
					<KText v="small" numberOfLines={2}>
						{place(h?.city, h?.state) || 'Nigeria'}
						{h?.landmarks ? ` · Near ${h.landmarks}` : ''}
					</KText>
				</View>
				<Button
					title="Directions"
					block
					icon={<Navigation size={18} color={color.onAmber} />}
					onPress={() => openDirections({ ...pin, label: h?.title ?? undefined })}
					testID="listing-map-directions"
				/>
			</View>
		</View>
	);
}

const s = StyleSheet.create({
	top: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
	card: { position: 'absolute', left: 16, right: 16, gap: 14, padding: 16, borderRadius: radius.lg, backgroundColor: color.bg2, borderWidth: 1, borderColor: color.line2 }
});
