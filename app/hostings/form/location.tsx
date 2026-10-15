import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { Crosshair, MapPin } from 'lucide-react-native';
import { Button, Field, KText, Notice, Spinner } from '@/components/k';
import { Block, StepScreen } from '@/components/k/listing-form';
import { ContactPicker } from '@/components/k/listing-contact';
import { color, radius } from '@/lib/k/theme';
import { place } from '@/lib/k/format';
import { useListingStep } from '@/lib/k/use-listing-step';
import { getAddressFromCoords } from '@/lib/utils/locations';
import { isAgentManaged } from '@/lib/constants/hosting/step-rules';

type Perm = 'unknown' | 'granted' | 'denied' | 'blocked';

/** Step 3 — pin the property, confirm the address, and choose the number renters call. */
export default function LocationStep() {
	const params = useLocalSearchParams<{ id?: string }>();
	const f = useListingStep(params.id, 'location');
	const { input, updateInput, hosting } = f;
	const [perm, setPerm] = useState<Perm>('unknown');
	const [locating, setLocating] = useState(false);
	const [tried, setTried] = useState(false);
	const [busy, setBusy] = useState(false);
	const asked = useRef(false);
	const lat = Number(input.latitude);
	const lng = Number(input.longitude);
	const pinned = !!input.latitude && !!input.longitude && !Number.isNaN(lat) && !Number.isNaN(lng);

	const fillAddress = useCallback(
		async (latitude: number, longitude: number) => {
			updateInput({ latitude: String(latitude), longitude: String(longitude) });
			try {
				const a = (await getAddressFromCoords(latitude, longitude))?.[0];
				if (a) updateInput({ state: a.region ?? undefined, city: a.city ?? a.subregion ?? undefined, street: a.street ?? undefined, country: a.country ?? 'Nigeria', postalCode: a.postalCode ?? undefined });
			} catch {
				// Remote pins often have no address; the host can type it.
			}
		},
		[updateInput]
	);

	const locate = useCallback(async () => {
		setLocating(true);
		try {
			let p = await Location.getForegroundPermissionsAsync();
			if (p.status !== 'granted' && p.canAskAgain) p = await Location.requestForegroundPermissionsAsync();
			if (p.status !== 'granted') {
				setPerm(p.canAskAgain ? 'denied' : 'blocked');
				return;
			}
			setPerm('granted');
			const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
			await fillAddress(pos.coords.latitude, pos.coords.longitude);
		} catch {
			setPerm((x) => (x === 'unknown' ? 'denied' : x));
		} finally {
			setLocating(false);
		}
	}, [fillAddress]);

	// First visit with no pin: try once, the host is usually standing at the property.
	useEffect(() => {
		if (!f.ready || asked.current) return;
		asked.current = true;
		if (!input.latitude || !input.longitude) locate();
	}, [f.ready, input.latitude, input.longitude, locate]);

	const errors = {
		pin: !pinned ? 'Pin the property on the map.' : null,
		area: pinned && !input.state?.trim() && !input.city?.trim() ? 'Add the town or state.' : null,
		contact: !input.contact ? 'Choose the number renters should call.' : null
	};
	const valid = !errors.pin && !errors.area && !errors.contact;

	async function next() {
		setTried(true);
		if (!valid) return;
		setBusy(true);
		const id = await f.save({ country: input.country || 'Nigeria' });
		setBusy(false);
		if (id) f.advance(id);
	}

	return (
		<StepScreen
			stepKey="location"
			hosting={hosting}
			onBack={f.leave}
			loading={!f.ready}
			intro={isAgentManaged(hosting?.managementType) ? 'Renters only see the area for advert-only listings — your exact address stays private.' : 'Renters see the rough area on the map, not the exact pin.'}
			primary={{ title: 'Save and continue', onPress: next, loading: busy, testID: 'step-next' }}
			footnote={tried && !valid ? <KText v="xs" c="danger" center>{errors.pin ?? errors.area ?? errors.contact}</KText> : null}
		>
			<Block title="Where is it?" sub="Drag the pin if it isn’t exactly on the property.">
				<View style={s.map}>
					{pinned ? (
						<MapView
							style={StyleSheet.absoluteFill}
							provider={Platform.OS === 'ios' ? PROVIDER_DEFAULT : PROVIDER_GOOGLE}
							userInterfaceStyle="dark"
							region={{ latitude: lat, longitude: lng, latitudeDelta: 0.004, longitudeDelta: 0.004 }}
							accessibilityLabel="Map showing the property pin"
						>
							<Marker coordinate={{ latitude: lat, longitude: lng }} draggable pinColor={color.amber} onDragEnd={(e) => fillAddress(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude)} />
						</MapView>
					) : (
						<View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', gap: 8, padding: 20 }]}>
							{locating ? <Spinner /> : <MapPin size={26} color={tried ? color.danger : color.muted} />}
							<KText v="small" center>
								{locating ? 'Finding where you are…' : 'No pin yet'}
							</KText>
						</View>
					)}
				</View>
				{perm === 'denied' || perm === 'blocked' ? (
					<Notice tone="warn" title="Location is off for Kushi" action={perm === 'blocked' ? 'Open Settings' : 'Try again'} onAction={perm === 'blocked' ? () => Linking.openSettings() : locate}>
						Kushi uses your location once, to pin the property while you’re there. Nothing is tracked.
					</Notice>
				) : null}
				<Button title={pinned ? 'Re-pin to where I am now' : 'Use my current location'} variant="ghost" size="sm" icon={<Crosshair size={15} color={color.fg} />} loading={locating} onPress={locate} style={{ alignSelf: 'flex-start' }} />
			</Block>

			{pinned ? (
				<Block title="Address" sub={place(input.city, input.state) ? `We found ${place(input.city, input.state)}. Correct anything that’s off.` : 'We couldn’t read an address for this spot. Type it in.'}>
					<Field label="Street" optional value={input.street ?? ''} onChangeText={(street) => updateInput({ street })} placeholder="12 Admiralty Way" />
					<View style={{ flexDirection: 'row', gap: 12 }}>
						<View style={{ flex: 1 }}>
							<Field label="Town / area" value={input.city ?? ''} onChangeText={(city) => updateInput({ city })} placeholder="Lekki" error={tried ? errors.area : null} />
						</View>
						<View style={{ flex: 1 }}>
							<Field label="State" value={input.state ?? ''} onChangeText={(state) => updateInput({ state })} placeholder="Lagos" />
						</View>
					</View>
					<Field label="Landmarks" optional multiline value={input.landmarks ?? ''} onChangeText={(landmarks) => updateInput({ landmarks })} placeholder="Opposite the filling station, after the second roundabout" hint="Helps renters and inspectors find it." />
				</Block>
			) : null}

			<Block title="Contact number" sub="Shown to renters who are interested. It must be verified.">
				<ContactPicker value={input.contact} onChange={(contact) => updateInput({ contact })} error={tried ? errors.contact : null} />
			</Block>
		</StepScreen>
	);
}

const s = StyleSheet.create({
	map: { height: 230, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: color.surface, borderWidth: 1, borderColor: color.line }
});
