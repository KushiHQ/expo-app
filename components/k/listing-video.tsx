/**
 * Optional video tour for a listing: record on site (location sampled at the
 * start and end) or pick a clip, then upload straight to storage through a
 * presigned URL with visible progress, cancel and retry.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Modal, StyleSheet, View } from 'react-native';
import { Pressable } from '@/components/k/pressable';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import { PlayCircle, Upload, Video, X } from 'lucide-react-native';
import { Button, Card, KText, Notice } from '@/components/k';
import { color, font, radius } from '@/lib/k/theme';
import { toast } from '@/lib/hooks/use-toast';
import { useCreateHostingVideoUploadUrlMutation, useSetHostingVideoMutation } from '@/lib/services/graphql/generated';
import { cleanError } from '@/lib/k/use-listing-step';

const MAX_SECONDS = 300;
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

type Pending = { uri: string; seconds: number; picked: boolean; contentType: string; start: Location.LocationObject | null; end: Location.LocationObject | null };
type Phase = { kind: 'idle' } | { kind: 'uploading'; progress: number } | { kind: 'failed'; message: string };

export function VideoTourEditor({ hostingId, existing, onSaved }: { hostingId: string; existing?: { url: string; seconds: number } | null; onSaved: () => void }) {
	const [camPerm, requestCam] = useCameraPermissions();
	const [micPerm, requestMic] = useMicrophonePermissions();
	const [, createUploadUrl] = useCreateHostingVideoUploadUrlMutation();
	const [, setHostingVideo] = useSetHostingVideoMutation();
	const [pending, setPending] = useState<Pending | null>(null);
	const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
	const [recorder, setRecorder] = useState(false);
	const task = useRef<FileSystem.UploadTask | null>(null);

	const upload = useCallback(
		async (p: Pending) => {
			setPhase({ kind: 'uploading', progress: 0 });
			try {
				const target = await createUploadUrl({ hostingId, contentType: p.contentType });
				const t = target.data?.createHostingVideoUploadUrl;
				if (target.error || !t) throw new Error(cleanError(target.error?.message) || 'Couldn’t start the upload.');
				task.current = FileSystem.createUploadTask(t.uploadUrl, p.uri, { httpMethod: 'PUT', uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT, headers: { 'Content-Type': p.contentType } }, (e) => {
					if (e.totalBytesExpectedToSend > 0) setPhase({ kind: 'uploading', progress: e.totalBytesSent / e.totalBytesExpectedToSend });
				});
				const res = await task.current.uploadAsync();
				task.current = null;
				if (!res) return setPhase({ kind: 'idle' }); // cancelled
				if (res.status < 200 || res.status >= 300) throw new Error(`The upload was refused (${res.status}).`);
				const samples = [p.start, p.end].filter(Boolean);
				const save = await setHostingVideo({
					assetId: t.assetId,
					input: {
						hostingId,
						durationSeconds: Math.min(MAX_SECONDS, Math.max(1, Math.round(p.seconds))),
						geofenceStatus: p.picked ? 'uploaded' : p.start ? 'captured' : 'no_gps',
						gpsSamples: samples.length ? JSON.stringify(samples) : undefined,
						gpsStartLat: p.start?.coords.latitude,
						gpsStartLng: p.start?.coords.longitude,
						gpsEndLat: p.end?.coords.latitude,
						gpsEndLng: p.end?.coords.longitude,
						ndprConsent: true,
						consentText: 'Host confirmed the right to record and publish this property video.',
						recordedAt: new Date().toISOString()
					}
				});
				if (save.error) throw new Error(cleanError(save.error.message));
				setPending(null);
				setPhase({ kind: 'idle' });
				toast.show({ type: 'success', text2: 'Video tour saved.' });
				onSaved();
			} catch (e) {
				task.current = null;
				setPhase({ kind: 'failed', message: e instanceof Error ? e.message : 'The upload didn’t finish.' });
			}
		},
		[createUploadUrl, hostingId, onSaved, setHostingVideo]
	);

	useEffect(() => () => void task.current?.cancelAsync().catch(() => {}), []);

	async function openRecorder() {
		const cam = camPerm?.granted ? camPerm : await requestCam();
		if (!cam.granted) {
			toast.show({ type: 'error', text1: 'Camera is off for Kushi', text2: 'Allow camera access in Settings to record a tour.' });
			if (!cam.canAskAgain) Linking.openSettings().catch(() => {});
			return;
		}
		if (!micPerm?.granted) await requestMic();
		setRecorder(true);
	}

	async function pick() {
		const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], quality: 1 });
		if (res.canceled || !res.assets?.length) return;
		const a = res.assets[0];
		const seconds = a.duration ? a.duration / 1000 : 1;
		if (seconds > MAX_SECONDS + 1) return toast.show({ type: 'error', text1: 'That video is too long', text2: 'Tours can be up to 5 minutes. Trim it and try again.' });
		const p: Pending = { uri: a.uri, seconds, picked: true, contentType: a.mimeType ?? (a.uri.toLowerCase().endsWith('.mov') ? 'video/quicktime' : 'video/mp4'), start: null, end: null };
		setPending(p);
		upload(p);
	}

	const busy = phase.kind === 'uploading';
	return (
		<Card>
			<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
				<Video size={18} color={color.amber} />
				<KText v="bodyStrong" style={{ flex: 1 }}>
					Video tour
				</KText>
				<KText v="xs">Optional · up to 5 min</KText>
			</View>
			{existing && !pending ? <Preview uri={existing.url} label={`Saved tour · ${clock(existing.seconds)}`} /> : null}
			{!existing && !pending ? <KText v="small">Walk renters through the outside, the living areas and each room. Listings with a tour get more serious enquiries.</KText> : null}
			{pending ? <KText v="small">New {pending.picked ? 'video' : 'recording'} · {clock(pending.seconds)}</KText> : null}
			{phase.kind === 'uploading' ? (
				<View style={{ gap: 8 }} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(phase.progress * 100) }}>
					<View style={s.track}>
						<View style={[s.fill, { width: `${Math.max(4, Math.round(phase.progress * 100))}%` }]} />
					</View>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
						<KText v="xs">Uploading… {Math.round(phase.progress * 100)}% — keep the app open</KText>
						<Pressable accessibilityRole="button" onPress={() => task.current?.cancelAsync().catch(() => {})} hitSlop={8}>
							<KText v="xs" c="amber">
								Cancel
							</KText>
						</Pressable>
					</View>
				</View>
			) : null}
			{phase.kind === 'failed' && pending ? (
				<Notice tone="danger" title="The video didn’t upload" action="Try again" onAction={() => upload(pending)}>
					{phase.message}
				</Notice>
			) : null}
			{!busy ? (
				<View style={{ flexDirection: 'row', gap: 10 }}>
					<Button title={existing || pending ? 'Record again' : 'Record'} variant="ghost" size="sm" icon={<Video size={15} color={color.fg} />} onPress={openRecorder} style={{ flex: 1 }} />
					<Button title="Choose a video" variant="ghost" size="sm" icon={<Upload size={15} color={color.fg} />} onPress={pick} style={{ flex: 1 }} />
				</View>
			) : null}
			<KText v="xs">By adding a video you confirm you have the right to record and publish it.</KText>
			{recorder ? (
				<Recorder
					onClose={() => setRecorder(false)}
					onDone={(p) => {
						setRecorder(false);
						setPending(p);
						upload(p);
					}}
				/>
			) : null}
		</Card>
	);
}

function Preview({ uri, label }: { uri: string; label: string }) {
	const [play, setPlay] = useState(false);
	const player = useVideoPlayer(play ? uri : null, (p) => {
		p.loop = false;
		p.play();
	});
	return (
		<View style={{ height: 190, borderRadius: radius.md, overflow: 'hidden', backgroundColor: color.surface }}>
			{play ? (
				<VideoView player={player} style={StyleSheet.absoluteFill} nativeControls contentFit="cover" allowsFullscreen />
			) : (
				<Pressable accessibilityRole="button" accessibilityLabel="Play video tour" onPress={() => setPlay(true)} style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', gap: 8 }]}>
					<PlayCircle size={44} color={color.amber} strokeWidth={1.4} />
					<KText v="xs">{label}</KText>
				</Pressable>
			)}
		</View>
	);
}

async function sample(): Promise<Location.LocationObject | null> {
	try {
		const perm = await Location.getForegroundPermissionsAsync();
		if (perm.status !== 'granted' && (await Location.requestForegroundPermissionsAsync()).status !== 'granted') return null;
		return await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
	} catch {
		return null;
	}
}

function Recorder({ onClose, onDone }: { onClose: () => void; onDone: (p: Pending) => void }) {
	const cam = useRef<CameraView>(null);
	const [recording, setRecording] = useState(false);
	const [elapsed, setElapsed] = useState(0);
	const timer = useRef<ReturnType<typeof setInterval> | null>(null);
	const seconds = useRef(0);
	const start = useRef<Promise<Location.LocationObject | null>>(Promise.resolve(null));

	const stopTimer = () => {
		if (timer.current) clearInterval(timer.current);
		timer.current = null;
	};
	useEffect(() => stopTimer, []);

	async function begin() {
		setRecording(true);
		setElapsed(0);
		seconds.current = 0;
		start.current = sample();
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
		timer.current = setInterval(() => {
			seconds.current += 1;
			setElapsed(seconds.current);
			if (seconds.current >= MAX_SECONDS) cam.current?.stopRecording();
		}, 1000);
		try {
			const v = await cam.current?.recordAsync({ maxDuration: MAX_SECONDS, maxFileSize: 200 * 1024 * 1024 });
			stopTimer();
			setRecording(false);
			if (!v?.uri) return;
			const [s0, s1] = await Promise.all([start.current, sample()]);
			onDone({ uri: v.uri, seconds: seconds.current || 1, picked: false, contentType: v.uri.toLowerCase().endsWith('.mov') ? 'video/quicktime' : 'video/mp4', start: s0, end: s1 });
		} catch {
			stopTimer();
			setRecording(false);
			toast.show({ type: 'error', text1: 'Recording stopped', text2: 'Try again.' });
		}
	}

	return (
		<Modal visible animationType="slide" onRequestClose={() => !recording && onClose()}>
			<View style={{ flex: 1, backgroundColor: '#000' }}>
				<StatusBar style="light" />
				<CameraView ref={cam} style={{ flex: 1 }} mode="video" />
				<SafeAreaView style={s.top} pointerEvents="box-none">
					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Close recorder"
						onPress={() => {
							if (recording) cam.current?.stopRecording();
							onClose();
						}}
						style={s.round}
					>
						<X color="#fff" size={20} />
					</Pressable>
					<View style={s.pill}>
						<KText style={{ color: '#fff', fontFamily: font.monoMedium, fontSize: 13 }}>{recording ? `● ${clock(elapsed)} / ${clock(MAX_SECONDS)}` : 'Up to 5:00'}</KText>
					</View>
					<View style={{ width: 44 }} />
				</SafeAreaView>
				<SafeAreaView style={s.bottom} pointerEvents="box-none">
					<KText v="xs" style={{ color: '#fff', marginBottom: 14 }}>
						{recording ? 'Walk slowly. Tap to stop.' : 'Start outside, then walk through each room.'}
					</KText>
					<Pressable accessibilityRole="button" accessibilityLabel={recording ? 'Stop recording' : 'Start recording'} onPress={recording ? () => cam.current?.stopRecording() : begin} style={s.shutter}>
						<View style={recording ? s.stop : s.rec} />
					</Pressable>
				</SafeAreaView>
			</View>
		</Modal>
	);
}

const s = StyleSheet.create({
	track: { height: 6, borderRadius: 3, backgroundColor: color.line2, overflow: 'hidden' },
	fill: { height: 6, borderRadius: 3, backgroundColor: color.amber },
	top: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12 },
	round: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
	pill: { backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
	bottom: { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', paddingBottom: 36 },
	shutter: { width: 78, height: 78, borderRadius: 39, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
	rec: { width: 58, height: 58, borderRadius: 29, backgroundColor: color.danger },
	stop: { width: 28, height: 28, borderRadius: 6, backgroundColor: color.danger }
});
