/**
 * Voice and video call stage (Daily.co). State and signalling stay in
 * lib/hooks/call.ts (useActiveCall); this is only the screen.
 */
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useQuery } from 'urql';
import { DailyMediaView } from '@daily-co/react-native-daily-js';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Mic, MicOff, Phone, PhoneOff, SwitchCamera, Video, VideoOff, Volume2 } from 'lucide-react-native';
import { color, radius } from '@/lib/k/theme';
import { K_CHAT } from '@/lib/services/graphql/requests/queries/k-manage';
import type { useActiveCall } from '@/lib/hooks/call';
import { Avatar } from './surface';
import { KText } from './text';

type Call = ReturnType<typeof useActiveCall>;

function Pulse({ size }: { size: number }) {
	const v = useSharedValue(0);
	useEffect(() => {
		v.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.cubic) }), -1);
	}, [v]);
	const st = useAnimatedStyle(() => ({ transform: [{ scale: 1 + v.value * 0.6 }], opacity: 0.5 * (1 - v.value) }));
	return <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: color.amber }, st]} />;
}

function Control({ label, on, onPress, tone = 'glass', children }: { label: string; on?: boolean; onPress: () => void; tone?: 'glass' | 'danger' | 'success'; children: React.ReactNode }) {
	const bg = tone === 'danger' ? color.danger : tone === 'success' ? color.success : on ? color.fg : 'rgba(242,238,230,0.12)';
	return (
		<View style={{ alignItems: 'center', gap: 8, width: 76 }}>
			<Pressable
				accessibilityRole="button"
				accessibilityLabel={label}
				accessibilityState={on !== undefined ? { selected: on } : undefined}
				onPress={() => {
					Haptics.impactAsync(tone === 'glass' ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
					onPress();
				}}
				style={({ pressed }) => [{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: bg }, pressed && { opacity: 0.8 }]}
			>
				{children}
			</Pressable>
			<KText v="xs" style={{ color: color.fg2 }} numberOfLines={1}>
				{label}
			</KText>
		</View>
	);
}

export function CallStage({ c, chatId, video }: { c: Call; chatId: string; video?: boolean }) {
	const insets = useSafeAreaInsets();
	const [{ data }] = useQuery<{ hostingChat: { hosting?: { title?: string | null } | null } }>({ query: K_CHAT, variables: { chatId } });
	const name = c.recipient?.profile?.fullName ?? 'Kushi user';
	const photo = c.recipient?.profile?.image?.publicUrl;
	const incoming = !c.isCaller && c.isRinging;
	const active = !c.isRinging;
	const remoteVideo = video && active ? c.remoteParticipant?.tracks.video.track : null;
	const remoteMuted = active && !!c.remoteParticipant && !c.remoteParticipant.tracks.audio.track;
	const status = c.isRinging ? (c.isCaller ? 'Calling…' : `Incoming ${video ? 'video' : 'voice'} call`) : c.callDuration;

	// The speaker button changes the audio route (it used to only flip a flag).
	useEffect(() => {
		try {
			c.call?.setNativeInCallAudioMode(c.isSpeakerOn ? 'video' : 'voice');
		} catch {}
	}, [c.call, c.isSpeakerOn]);

	return (
		<View style={{ flex: 1, backgroundColor: color.bg }} testID="call-stage">
			<StatusBar style="light" />
			{remoteVideo ? (
				<DailyMediaView videoTrack={remoteVideo} audioTrack={c.remoteParticipant?.tracks.audio.track ?? null} objectFit="cover" style={StyleSheet.absoluteFillObject} />
			) : video && !active && c.localParticipant && c.cameraEnabled ? (
				<DailyMediaView videoTrack={c.localParticipant.tracks.video.track ?? null} audioTrack={null} mirror objectFit="cover" style={StyleSheet.absoluteFillObject} />
			) : null}
			{remoteVideo || (video && !active && c.cameraEnabled) ? <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(7,8,11,0.35)' }]} pointerEvents="none" /> : null}

			<View style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, alignItems: 'center', gap: 4 }}>
				{data?.hostingChat?.hosting?.title ? (
					<KText v="micro" c="amber" numberOfLines={1}>
						About {data.hostingChat.hosting.title}
					</KText>
				) : null}
				{remoteVideo ? (
					<>
						<KText v="heading">{name}</KText>
						<KText v="small" accessibilityLiveRegion="polite">
							{status}
						</KText>
					</>
				) : null}
				{remoteMuted ? (
					<View style={s.muted}>
						<MicOff size={12} color={color.fg2} />
						<KText v="xs">{name.split(' ')[0]} is muted</KText>
					</View>
				) : null}
			</View>

			{!remoteVideo ? (
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 }}>
					<View style={{ alignItems: 'center', justifyContent: 'center', width: 220, height: 220 }}>
						{c.isRinging ? <Pulse size={140} /> : null}
						<Avatar name={name} uri={photo} size={132} />
					</View>
					<KText v="title" center>
						{name}
					</KText>
					<KText v="small" accessibilityLiveRegion="polite" testID="call-status">
						{status}
					</KText>
					{video && active && !c.remoteParticipant?.tracks.video.track ? (
						<View style={s.muted}>
							<VideoOff size={12} color={color.fg2} />
							<KText v="xs">Camera off</KText>
						</View>
					) : null}
				</View>
			) : (
				<View style={{ flex: 1 }} />
			)}

			{video && active && c.localParticipant ? (
				<View style={[s.pip, { bottom: insets.bottom + 150 }]}>
					{c.cameraEnabled ? (
						<DailyMediaView videoTrack={c.localParticipant.tracks.video.track ?? null} audioTrack={null} mirror objectFit="cover" style={StyleSheet.absoluteFillObject} zOrder={1} />
					) : (
						<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
							<VideoOff size={20} color={color.muted} />
						</View>
					)}
				</View>
			) : null}

			<View style={[s.controls, { paddingBottom: insets.bottom + 24 }]}>
				{incoming ? (
					<>
						<Control label="Decline" tone="danger" onPress={c.leaveCall}>
							<PhoneOff size={26} color="#fff" />
						</Control>
						<Control label="Answer" tone="success" onPress={c.joinCall}>
							{video ? <Video size={26} color="#fff" /> : <Phone size={26} color="#fff" />}
						</Control>
					</>
				) : (
					<>
						<Control label={c.micEnabled ? 'Mute' : 'Unmute'} on={!c.micEnabled} onPress={c.toggleMic}>
							{c.micEnabled ? <Mic size={24} color={color.fg} /> : <MicOff size={24} color={color.bg} />}
						</Control>
						{video ? (
							<>
								<Control label={c.cameraEnabled ? 'Camera off' : 'Camera on'} on={!c.cameraEnabled} onPress={c.toggleCamera}>
									{c.cameraEnabled ? <Video size={24} color={color.fg} /> : <VideoOff size={24} color={color.bg} />}
								</Control>
								<Control label="Flip" onPress={c.toggleFacingCamera}>
									<SwitchCamera size={24} color={color.fg} />
								</Control>
							</>
						) : (
							<Control label="Speaker" on={c.isSpeakerOn} onPress={c.toggleSpeakerOn}>
								<Volume2 size={24} color={c.isSpeakerOn ? color.bg : color.fg} />
							</Control>
						)}
						<Control label="End" tone="danger" onPress={c.leaveCall}>
							<PhoneOff size={26} color="#fff" />
						</Control>
					</>
				)}
			</View>
		</View>
	);
}

const s = StyleSheet.create({
	controls: { flexDirection: 'row', justifyContent: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 16 },
	muted: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: 'rgba(7,8,11,0.6)', borderWidth: 1, borderColor: color.line2, marginTop: 6 },
	pip: { position: 'absolute', right: 16, width: 110, height: 160, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: color.amberLine, backgroundColor: color.surface }
});
