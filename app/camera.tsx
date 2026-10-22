import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, type CameraType, type FlashMode, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useAudioPlayer } from 'expo-audio';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, MapPin, MapPinOff, RefreshCcw, X, Zap, ZapOff } from 'lucide-react-native';
import { Button, KText, Spinner } from '@/components/k';
import { Pressable } from '@/components/k/pressable';
import { color, font, radius } from '@/lib/k/theme';
import { useGalleryStore } from '@/lib/stores/gallery';
import { usePhotoGalleryScreen } from '@/lib/hooks/camera';
import { cast } from '@/lib/types/utils';
import { rememberCapture } from '@/lib/k/photo-capture';
import { alert } from '@/lib/k/dialog';

type Fix = { coords: Location.LocationObjectCoords } | null;

/** Pinch range. Past this, digital zoom is too soft for listing photos. */
const MAX_ZOOM = 0.6;
/** iOS names its lenses; this one is the 0.5× ultra-wide on phones that have it. */
const isUltraWide = (name: string) => /ultra\s*wide/i.test(name);
type Gps = 'finding' | 'on' | 'off' | 'blocked';

/**
 * The Kushi camera. Every photo is stamped with where it was taken (EXIF GPS,
 * and the same coordinates are kept for the upload — see lib/k/photo-capture),
 * which is how listing photos are shown to be real. With `requireLocation`
 * (listing room photos) it won't shoot without a location fix, because the
 * server refuses room photos without one. Hands the shots to the photo review
 * screen, which returns them to `redirect`.
 */
export default function CameraScreen() {
	const { images, multiple, redirect, requireLocation } = useLocalSearchParams();
	const needsLocation = requireLocation === 'true';
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
	const { width: winW, height: winH } = useWindowDimensions();
	// The photo is 4:3, so the preview is too: what you see is what you get.
	// (Filling the whole screen cropped the sides and looked zoomed in.)
	const frameW = Math.min(winW, (winH * 3) / 4);
	const frameH = (frameW * 4) / 3;

	const [zoom, setZoom] = useState(0);
	const pinchStart = useRef(0);
	const [ultraWide, setUltraWide] = useState<string | null>(null);
	const [wide, setWide] = useState(false);
	const pinch = Gesture.Pinch()
		.onStart(() => {
			runOnJS(beginPinch)();
		})
		.onUpdate((e) => {
			runOnJS(applyPinch)(e.scale);
		});
	function beginPinch() {
		pinchStart.current = zoom;
	}
	function applyPinch(scale: number) {
		setZoom(Math.min(MAX_ZOOM, Math.max(0, pinchStart.current + Math.log(scale) * 0.25)));
	}

	// Kushi's own shutter sound, the same on every phone (the system one is muted).
	const shutterSound = useAudioPlayer(require('@/assets/audio/shutter.wav'));

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

	// Keep the fix fresh while the host walks round the property.
	const watch = useRef<Location.LocationSubscription | null>(null);
	const locate = useCallback(async () => {
		setGps('finding');
		try {
			let p = await Location.getForegroundPermissionsAsync();
			if (p.status !== 'granted' && p.canAskAgain) p = await Location.requestForegroundPermissionsAsync();
			if (p.status !== 'granted') return setGps(p.canAskAgain ? 'off' : 'blocked');
			const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
			setFix({ coords: pos.coords });
			setGps('on');
			watch.current?.remove();
			watch.current = await Location.watchPositionAsync({ accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 5 }, (next) => setFix({ coords: next.coords }));
		} catch {
			setGps('off');
		}
	}, []);
	useEffect(() => {
		locate();
		return () => {
			watch.current?.remove();
			watch.current = null;
		};
	}, [locate]);

	const taken = Math.max(0, gallery.length - start.current);

	async function shoot() {
		if (!cam.current || busy) return;
		if (needsLocation && !fix) {
			alert('Turn on location', 'Room photos must be taken with location on, so renters can trust they were taken at the property.', [
				{ text: 'Not now', style: 'cancel' },
				gps === 'blocked' ? { text: 'Open Settings', onPress: () => Linking.openSettings() } : { text: 'Try again', onPress: () => locate() }
			]);
			return;
		}
		setBusy(true);
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
		try {
			shutterSound.seekTo(0);
			shutterSound.play();
		} catch {}
		try {
			const c = fix?.coords;
			const photo = await cam.current.takePictureAsync({
				// JPEG quality only — 0.7 keeps uploads to 1–2 MB on Nigerian networks; resolution and EXIF are untouched.
				quality: 0.7,
				exif: true,
				shutterSound: false,
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
				if (c) rememberCapture(photo.uri, { latitude: c.latitude, longitude: c.longitude, accuracyM: c.accuracy ?? undefined, capturedAt: new Date().toISOString() });
				append(photo.uri);
				if (multiple === 'false') review({ redirect: cast(redirect), fromCamera: true });
			}
		} catch {
			alert('That photo didn’t save', 'Try again.');
		} finally {
			setBusy(false);
		}
	}

	function close() {
		if (taken === 0) return router.back();
		alert(`Discard ${taken} new photo${taken === 1 ? '' : 's'}?`, 'They haven’t been added to your listing yet.', [
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
			<View style={[StyleSheet.absoluteFill, s.center]}>
				<GestureDetector gesture={pinch}>
					<View style={{ width: frameW, height: frameH, overflow: 'hidden' }}>
						<CameraView
							ref={cam}
							style={StyleSheet.absoluteFill}
							facing={facing}
							flash={flash}
							ratio="4:3"
							zoom={zoom}
							selectedLens={Platform.OS === 'ios' && facing === 'back' && wide && ultraWide ? ultraWide : undefined}
							onAvailableLensesChanged={(e) => setUltraWide(e.lenses.find(isUltraWide) ?? null)}
						/>
					</View>
				</GestureDetector>
			</View>

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
						{needsLocation ? 'Room photos need your location. Turn it on to take photos.' : 'Photos taken without location can’t be checked, which can hold up verification.'}
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
			{facing === 'back' ? (
				<View style={[s.zoomRow, { bottom: Math.max(insets.bottom, 16) + (taken ? 164 : 112) }]}>
					{ultraWide ? (
						<Pressable accessibilityRole="button" accessibilityLabel="Wide angle, 0.5 times" onPress={() => { setWide(true); setZoom(0); }} style={[s.zoomChip, wide && s.zoomOn]}>
							<KText style={[s.zoomText, wide && { color: color.amber }]}>0.5</KText>
						</Pressable>
					) : null}
					<Pressable accessibilityRole="button" accessibilityLabel="Normal zoom, 1 times" onPress={() => { setWide(false); setZoom(0); }} style={[s.zoomChip, !wide && s.zoomOn]}>
						<KText style={[s.zoomText, !wide && { color: color.amber }]}>{!wide && zoom > 0.01 ? 'Zoom' : '1×'}</KText>
					</Pressable>
				</View>
			) : null}
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
	done: { position: 'absolute', alignSelf: 'center' },
	zoomRow: { position: 'absolute', alignSelf: 'center', flexDirection: 'row', gap: 8, padding: 4, borderRadius: radius.pill, backgroundColor: 'rgba(0,0,0,0.45)' },
	zoomChip: { minWidth: 40, height: 40, paddingHorizontal: 10, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
	zoomOn: { backgroundColor: 'rgba(0,0,0,0.55)' },
	zoomText: { fontFamily: font.bodySemi, fontSize: 13, color: '#fff' }
});
