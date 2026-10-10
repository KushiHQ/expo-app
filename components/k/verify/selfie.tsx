/**
 * Selfie for identity checks: front camera with live face detection; capture is
 * enabled only while a face is in frame. Uploads to Kushi (UPLOAD_KYC_IMAGE).
 * Camera stays mounted on retake (avoids an AVCaptureSession crash).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, usePhotoOutput } from 'react-native-vision-camera';
import { createFaceDetectorOutput } from 'react-native-vision-camera-face-detector';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { RefreshCw, ScanFace } from 'lucide-react-native';
import { color, radius } from '@/lib/k/theme';
import { formMutation } from '@/lib/services/graphql/utils/fetch';
import { UPLOAD_KYC_IMAGE } from '@/lib/services/graphql/requests/mutations/users';
import type { Kyc, UploadKycImageMutation, UploadKycImageMutationVariables, User } from '@/lib/services/graphql/generated';
import { generateRNFile } from '@/lib/utils/file';
import { useUserStore } from '@/lib/stores/users';
import { Button } from '../button';
import { KText } from '../text';
import { Notice } from '../feedback';

export function Selfie({ onDone }: { onDone: () => void }) {
	const device = useCameraDevice('front');
	const { hasPermission, requestPermission } = useCameraPermission();
	const photoOutput = usePhotoOutput({ quality: 0.9 });
	const [face, setFace] = useState(false);
	const [locked, setLocked] = useState(false);
	const [ready, setReady] = useState(false);
	const [shot, setShot] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	// Stable output: the hook variant recreates options each render and makes the session reconfigure.
	const faceOutput = useMemo(
		() =>
			createFaceDetectorOutput({
				onFacesDetected(faces: unknown[]) {
					setFace(faces.length > 0);
				},
				onError() {}
			}),
		[]
	);

	useEffect(() => {
		if (!hasPermission) requestPermission();
	}, [hasPermission, requestPermission]);
	useEffect(() => {
		if (face) {
			clearTimeout(timer.current);
			setLocked(true);
		} else timer.current = setTimeout(() => setLocked(false), 700);
		return () => clearTimeout(timer.current);
	}, [face]);

	async function capture() {
		try {
			const photo = await photoOutput.capturePhoto({ flashMode: 'off' }, {});
			const path = await photo.saveToTemporaryFileAsync();
			photo.dispose();
			// Bake EXIF orientation into pixels so it uploads upright everywhere.
			const baked = await manipulateAsync(`file://${path}`, [], { compress: 1, format: SaveFormat.JPEG });
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
			setShot(baked.uri);
		} catch {
			setError('The photo didn’t take. Try again.');
		}
	}

	async function upload() {
		if (!shot) return;
		setBusy(true);
		setError(null);
		const res = await formMutation<UploadKycImageMutation, UploadKycImageMutationVariables>(UPLOAD_KYC_IMAGE, { file: generateRNFile(shot) });
		setBusy(false);
		if (res.error || !res.data?.uploadKycImage) {
			setError((res.error?.message ?? 'Upload failed').replace('[GraphQL] ', ''));
			return;
		}
		const st = useUserStore.getState();
		const u = st.user.user ?? ({} as User);
		st.updateUser({ user: { ...u, kyc: { ...(u.kyc ?? ({} as Kyc)), image: res.data.uploadKycImage.image } } as typeof u });
		onDone();
	}

	if (!hasPermission)
		return (
			<View style={{ gap: 14 }}>
				<Notice tone="warn" title="Camera access needed">
					Kushi uses your front camera once to take a selfie for your identity check.
				</Notice>
				<Button title="Allow camera" onPress={async () => {
						if (!(await requestPermission())) Linking.openSettings();
					}} />
			</View>
		);

	return (
		<View style={{ gap: 16 }}>
			<View style={[s.frame, { borderColor: shot ? color.line2 : locked ? color.success : color.line2 }]}>
				{device ? <Camera style={StyleSheet.absoluteFill} device={device} isActive={!shot} outputs={[photoOutput, faceOutput]} onStarted={() => setReady(true)} onStopped={() => setReady(false)} /> : null}
				{shot ? <Image source={{ uri: shot }} style={StyleSheet.absoluteFill} contentFit="cover" /> : <View style={[s.oval, { borderColor: locked ? color.success : 'rgba(245,158,11,0.85)' }]} pointerEvents="none" />}
				{!device ? (
					<View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
						<ScanFace size={44} color={color.dim} strokeWidth={1.2} />
					</View>
				) : null}
			</View>
			<KText v="small" center c={locked && !shot ? 'success' : 'fg2'}>
				{shot ? 'Clear and well lit? Use it, or retake.' : locked ? 'Face found — hold still and take it.' : 'Centre your face in the oval, in good light. No glasses or hat.'}
			</KText>
			{error ? <Notice tone="danger">{error}</Notice> : null}
			{shot ? (
				<View style={{ flexDirection: 'row', gap: 10 }}>
					<Button title="Retake" variant="ghost" icon={<RefreshCw size={16} color={color.fg} />} onPress={() => setShot(null)} style={{ flex: 1 }} />
					<Button title="Use this photo" loading={busy} onPress={upload} style={{ flex: 1.4 }} />
				</View>
			) : (
				<Button title="Take selfie" size="lg" block disabled={!ready || !face} onPress={capture} />
			)}
		</View>
	);
}

const s = StyleSheet.create({
	frame: { alignSelf: 'center', width: '100%', maxWidth: 360, aspectRatio: 3 / 4, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: color.surface, borderWidth: 2 },
	oval: { position: 'absolute', left: '17%', right: '17%', top: '12%', bottom: '16%', borderRadius: 999, borderWidth: 2, borderStyle: 'dashed' }
});
