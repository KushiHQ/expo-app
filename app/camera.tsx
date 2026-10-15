import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, type CameraType, type FlashMode, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, MapPin, MapPinOff, RefreshCcw, X, Zap, ZapOff } from 'lucide-react-native';
import { Button, KText, Spinner } from '@/components/k';
import { Pressable } from '@/components/k/pressable';
import { color, font, radius } from '@/lib/k/theme';
import { useGalleryStore } from '@/lib/stores/gallery';
import { usePhotoGalleryScreen } from '@/lib/hooks/camera';
import { cast } from '@/lib/types/utils';

type Fix = { coords: Location.LocationObjectCoords } | null;
type Gps = 'finding' | 'on' | 'off' | 'blocked';

/**
 * The Kushi camera. Every photo is stamped with where it was taken (EXIF GPS),
 * which is how listing photos are shown to be real. Hands the shots to the
 * photo review screen, which returns them to `redirect`.
 */
export default function CameraScreen() {
	const { images, multiple, redirect } = useLocalSearchParams();
	const insets = useSafeAreaInsets();
	const cam = useRef<CameraView>(null);
	const [perm, requestPerm] = useCameraPermissions();
	const [facing, setFacing] = useState<CameraType>('back');
	const [flash, setFlash] = useState<FlashMode>('off');
	const [fix, setFix] = useState<Fix>(null);
	const [gps, setGps] = useState<Gps>('finding');
	const [busy, setBusy] = useState(false);
	const { gallery, append, setGallery, setActiveIndex } = useGalleryStore();
	const { redirect: review } = usePhotoGalleryScreen();
	const start = useRef(0);

	const imagesParam = JSON.stringify(images);
	useFocusEffect(
		useCallback(() => {
			const parsed = imagesParam ? JSON.parse(imagesParam) : null;
			if (Array.isArray(parsed)) {
				setGallery(parsed.map((i) => (typeof i === 'string' ? i.replaceAll(',', '') : i)));
				setActiveIndex(0);
				start.current = parsed.length;
			} else if (parsed) {
				append(String(parsed).replaceAll(',', ''));
				setActiveIndex(0);
				start.current = 1;
			}
		}, [imagesParam, setActiveIndex, append, setGallery])
	);

	const locate = useCallback(async () => {
		setGps('finding');
		try {
			let p = await Location.getForegroundPermissionsAsync();
			if (p.status !== 'granted' && p.canAskAgain) p = await Location.requestForegroundPermissionsAsync();
			if (p.status !== 'granted') return setGps(p.canAskAgain ? 'off' : 'blocked');
			const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
			setFix({ coords: pos.coords });
			setGps('on');
		} catch {
			setGps('off');
		}
	}, []);
	useEffect(() => {
		locate();
	}, [locate]);

	const taken = Math.max(0, gallery.length - start.current);

	async function shoot() {
		if (!cam.current || busy) return;
		setBusy(true);
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
		try {
			const c = fix?.coords;
			const photo = await cam.current.takePictureAsync({
				// JPEG quality only — 0.7 keeps uploads to 1–2 MB on Nigerian networks; resolution and EXIF are untouched.
				quality: 0.7,
				exif: true,
				additionalExif: c
					? {
							GPSLatitude: Math.abs(c.latitude),
							GPSLongitude: Math.abs(c.longitude),
							GPSLatitudeRef: c.latitude >= 0 ? 'N' : 'S',
							GPSLongitudeRef: c.longitude >= 0 ? 'E' : 'W',
							GPSAltitude: c.altitude || 0,
							GPSSpeed: c.speed || 0,
							GPSTimeStamp: new Date().toISOString()
						}
					: {}
			});
			if (photo?.uri) {
				append(photo.uri);
				if (multiple === 'false') review({ redirect: cast(redirect), fromCamera: true });
			}
		} catch {
			Alert.alert('That photo didn’t save', 'Try again.');
		} finally {
			setBusy(false);
		}
	}

	function close() {
		if (taken === 0) return router.back();
		Alert.alert(`Discard ${taken} new photo${taken === 1 ? '' : 's'}?`, 'They haven’t been added to your listing yet.', [
			{ text: 'Keep shooting', style: 'cancel' },
			{ text: 'Discard', style: 'destructive', onPress: () => router.back() }
		]);
	}

	if (!perm)
		return (
			<View style={[s.fill, s.center]}>
				<Spinner />
			</View>
		);

	if (!perm.granted)
		return (
			<View style={[s.fill, { paddingTop: insets.top + 12, paddingHorizontal: 24 }]}>
				<StatusBar style="light" />
				<Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => router.back()} style={s.round}>
					<X size={20} color="#fff" />
				</Pressable>
				<View style={[s.center, { flex: 1, gap: 14 }]}>
					<Camera size={36} color={color.amber} />
					<KText v="title" center>
						Allow the camera
					</KText>
					<KText v="small" center style={{ maxWidth: 320 }}>
						Listing photos are taken in the app, at the property, so renters can trust they’re real.
					</KText>
					<Button title={perm.canAskAgain ? 'Allow camera' : 'Open Settings'} onPress={() => (perm.canAskAgain ? requestPerm() : Linking.openSettings())} />
				</View>
			</View>
		);

	const last = gallery[gallery.length - 1];
	return (
		<View style={s.fill}>
			<StatusBar style="light" />
			<CameraView ref={cam} style={StyleSheet.absoluteFill} facing={facing} flash={flash} />

			<View style={[s.top, { paddingTop: insets.top + 8 }]}>
				<Pressable accessibilityRole="button" accessibilityLabel="Close camera" onPress={close} style={s.round}>
					<X size={20} color="#fff" />
				</Pressable>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={gps === 'on' ? 'Location is on' : 'Location is off. Tap to fix'}
					onPress={() => (gps === 'blocked' ? Linking.openSettings() : gps !== 'on' ? locate() : undefined)}
					style={[s.chip, gps === 'on' ? { borderColor: 'rgba(60,203,142,0.5)' } : gps === 'finding' ? null : { borderColor: color.amberLine }]}
				>
					{gps === 'on' ? <MapPin size={13} color={color.success} /> : gps === 'finding' ? <Spinner /> : <MapPinOff size={13} color={color.amber} />}
					<KText style={s.chipText}>{gps === 'on' ? `Location on${fix?.coords.accuracy ? ` · ±${Math.round(fix.coords.accuracy)} m` : ''}` : gps === 'finding' ? 'Finding location…' : 'No location — tap to fix'}</KText>
				</Pressable>
				{facing === 'back' ? (
					<Pressable accessibilityRole="button" accessibilityLabel={`Flash ${flash}`} onPress={() => setFlash((f) => (f === 'off' ? 'on' : f === 'on' ? 'auto' : 'off'))} style={s.round}>
						{flash === 'off' ? <ZapOff size={19} color="#fff" /> : <Zap size={19} color={color.amber} fill={flash === 'on' ? color.amber : 'none'} />}
						{flash === 'auto' ? <KText style={s.auto}>A</KText> : null}
					</Pressable>
				) : (
					<View style={{ width: 44 }} />
				)}
			</View>

			{gps !== 'on' && gps !== 'finding' ? (
				<View style={[s.warn, { top: insets.top + 64 }]}>
					<KText v="xs" style={{ color: '#fff' }} center>
						Photos taken without location can’t be checked, which can hold up verification.
					</KText>
				</View>
			) : null}

			<View style={[s.bottom, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
				<Pressable accessibilityRole="button" accessibilityLabel={gallery.length ? `Review ${gallery.length} photos` : 'No photos yet'} disabled={!gallery.length} onPress={() => review({ redirect: cast(redirect), fromCamera: true })} style={s.thumb}>
					{last ? <Image source={{ uri: last }} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
					{gallery.length ? (
						<View style={s.count}>
							<KText style={{ fontFamily: font.bodyBold, fontSize: 11, color: color.onAmber }}>{gallery.length}</KText>
						</View>
					) : null}
				</Pressable>
				<Pressable accessibilityRole="button" accessibilityLabel="Take photo" onPress={shoot} disabled={busy} style={s.shutter} testID="shutter">
					<View style={[s.shutterIn, busy && { opacity: 0.6 }]} />
				</Pressable>
				<Pressable accessibilityRole="button" accessibilityLabel="Switch camera" onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))} style={[s.round, { width: 56, height: 56, borderRadius: 28 }]}>
					<RefreshCcw size={22} color="#fff" />
				</Pressable>
			</View>
			{taken ? (
				<View style={[s.done, { bottom: Math.max(insets.bottom, 16) + 112 }]}>
					<Button title={`Review ${gallery.length} photo${gallery.length === 1 ? '' : 's'}`} size="sm" onPress={() => review({ redirect: cast(redirect), fromCamera: true })} />
				</View>
			) : null}
		</View>
	);
}

const s = StyleSheet.create({
	fill: { flex: 1, backgroundColor: '#000' },
	center: { alignItems: 'center', justifyContent: 'center' },
	top: { position: 'absolute', left: 0, right: 0, top: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
	round: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
	chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, height: 32, borderRadius: radius.pill, backgroundColor: 'rgba(0,0,0,0.55)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
	chipText: { fontFamily: font.bodyMedium, fontSize: 12, color: '#fff' },
	auto: { position: 'absolute', right: 8, top: 6, fontSize: 10, color: color.amber, fontFamily: font.bodyBold },
	warn: { position: 'absolute', left: 24, right: 24, padding: 10, borderRadius: radius.md, backgroundColor: 'rgba(0,0,0,0.6)' },
	bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 32, paddingTop: 20, backgroundColor: 'rgba(0,0,0,0.55)' },
	thumb: { width: 56, height: 56, borderRadius: radius.md, overflow: 'hidden', borderWidth: 2, borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.08)' },
	count: { position: 'absolute', right: 3, top: 3, minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: 9, backgroundColor: color.amber, alignItems: 'center', justifyContent: 'center' },
	shutter: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
	shutterIn: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff' },
	done: { position: 'absolute', alignSelf: 'center' }
});
