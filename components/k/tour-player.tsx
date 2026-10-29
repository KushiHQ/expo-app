/**
 * Full-screen Kushi video player for photo tours: night frame, amber play
 * button and progress, mute, share. Playback is driven here (no native
 * controls), and the player mixes with other audio instead of taking Android's
 * audio focus: when anything else took focus, expo-video paused the video
 * the moment it started.
 */
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Pause, Play, RotateCcw, Share2, Volume2, VolumeX, X } from 'lucide-react-native';
import { Pressable } from '@/components/k/pressable';
import { KText } from '@/components/k';
import { color, font } from '@/lib/k/theme';

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

type Props = { visible: boolean; uri: string; title?: string | null; shareUrl?: string; onClose: () => void };

export function TourPlayer({ visible, uri, title, shareUrl, onClose }: Props) {
	return (
		<Modal visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent supportedOrientations={['portrait']}>
			{visible ? <Stage uri={uri} title={title} shareUrl={shareUrl} onClose={onClose} /> : null}
		</Modal>
	);
}

function Stage({ uri, title, shareUrl, onClose }: Omit<Props, 'visible'>) {
	const insets = useSafeAreaInsets();
	const player = useVideoPlayer(uri, (p) => {
		p.loop = false;
		p.audioMixingMode = 'mixWithOthers';
		p.timeUpdateEventInterval = 0.25;
		p.play();
	});
	const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
	const { status } = useEvent(player, 'statusChange', { status: player.status });
	const time = useEvent(player, 'timeUpdate', { currentTime: 0, currentLiveTimestamp: null, currentOffsetFromLive: null, bufferedPosition: 0 });
	const [ended, setEnded] = useState(false);
	const [muted, setMuted] = useState(false);
	const [width, setWidth] = useState(1);

	useEffect(() => {
		const sub = player.addListener('playToEnd', () => setEnded(true));
		return () => sub.remove();
	}, [player]);

	const duration = player.duration || 0;
	const current = time?.currentTime ?? 0;
	const progress = duration ? Math.min(1, current / duration) : 0;
	const loading = status === 'loading' && !isPlaying;

	function toggle() {
		if (ended) {
			player.currentTime = 0;
			setEnded(false);
			player.play();
		} else if (isPlaying) player.pause();
		else player.play();
	}
	function toggleMute() {
		player.muted = !player.muted;
		setMuted(player.muted);
	}
	function seek(x: number) {
		if (!duration) return;
		player.currentTime = Math.max(0, Math.min(duration, (x / width) * duration));
		if (ended) setEnded(false);
	}

	return (
		<View style={s.root}>
			<StatusBar style="light" hidden />
			<VideoView player={player} style={StyleSheet.absoluteFill} nativeControls={false} contentFit="contain" />
			<Pressable onPress={toggle} style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel={isPlaying ? 'Pause' : 'Play'}>
				<View style={s.center}>
					{loading ? (
						<ActivityIndicator size="large" color={color.amber} />
					) : !isPlaying ? (
						<View style={s.disc}>{ended ? <RotateCcw size={28} color={color.bg} /> : <Play size={30} color={color.bg} fill={color.bg} style={{ marginLeft: 4 }} />}</View>
					) : null}
				</View>
			</Pressable>

			<View style={[s.top, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
				<Pressable onPress={onClose} style={s.round} accessibilityRole="button" accessibilityLabel="Close">
					<X size={20} color={color.fg} />
				</Pressable>
				<View style={{ flex: 1, alignItems: 'center' }} pointerEvents="none">
					<KText v="micro" style={s.label}>
						PHOTO TOUR
					</KText>
					{title ? (
						<KText v="smallStrong" numberOfLines={1} style={{ color: color.fg }}>
							{title}
						</KText>
					) : null}
				</View>
				{shareUrl ? (
					<Pressable onPress={() => Share.share({ message: shareUrl, url: shareUrl }).catch(() => {})} style={s.round} accessibilityRole="button" accessibilityLabel="Share this photo tour">
						<Share2 size={18} color={color.fg} />
					</Pressable>
				) : (
					<View style={{ width: 40 }} />
				)}
			</View>

			<View style={[s.bottom, { paddingBottom: insets.bottom + 14 }]} pointerEvents="box-none">
				<Pressable onPress={toggle} style={s.round} accessibilityRole="button" accessibilityLabel={isPlaying ? 'Pause' : 'Play'}>
					{isPlaying ? <Pause size={18} color={color.fg} fill={color.fg} /> : <Play size={18} color={color.fg} fill={color.fg} />}
				</Pressable>
				<KText v="micro" style={s.time}>
					{clock(current)} / {clock(duration)}
				</KText>
				<Pressable
					onPress={(e) => seek(e.nativeEvent.locationX)}
					onLayout={(e) => setWidth(e.nativeEvent.layout.width || 1)}
					style={s.track}
					accessibilityRole="adjustable"
					accessibilityLabel="Seek"
				>
					<View style={s.rail}>
						<View style={[s.done, { width: `${progress * 100}%` }]} />
					</View>
					<View style={[s.knob, { left: `${progress * 100}%` }]} />
				</Pressable>
				<Pressable onPress={toggleMute} style={s.round} accessibilityRole="button" accessibilityLabel={muted ? 'Unmute' : 'Mute'}>
					{muted ? <VolumeX size={18} color={color.fg} /> : <Volume2 size={18} color={color.fg} />}
				</Pressable>
			</View>
		</View>
	);
}

const s = StyleSheet.create({
	root: { flex: 1, backgroundColor: color.bg },
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	disc: {
		width: 76,
		height: 76,
		borderRadius: 38,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: color.amber,
		borderWidth: 8,
		borderColor: 'rgba(245,158,11,0.25)'
	},
	top: { position: 'absolute', left: 0, right: 0, top: 0, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingBottom: 14, backgroundColor: 'rgba(7,8,11,0.45)' },
	label: { color: color.amber, letterSpacing: 2 },
	bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingTop: 18, backgroundColor: 'rgba(7,8,11,0.55)' },
	round: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(242,238,230,0.1)' },
	time: { color: 'rgba(242,238,230,0.85)', fontFamily: font.monoMedium, fontVariant: ['tabular-nums'] },
	track: { flex: 1, height: 32, justifyContent: 'center' },
	rail: { height: 3, borderRadius: 2, backgroundColor: 'rgba(242,238,230,0.25)', overflow: 'hidden' },
	done: { height: 3, backgroundColor: color.amber },
	knob: { position: 'absolute', width: 12, height: 12, marginLeft: -6, backgroundColor: color.amber, transform: [{ rotate: '45deg' }] }
});
