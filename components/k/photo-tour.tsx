/**
 * The Kushi photo tour on a listing: a short vertical video Kushi makes from
 * the room photos. Not the host's walk-through (VideoTour), which is recorded
 * on site. Shows nothing until a tour is ready; the video loads only on play.
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { gql, useQuery } from 'urql';
import { useVideoPlayer, VideoView } from 'expo-video';
import { PlayCircle } from 'lucide-react-native';
import { Pressable } from '@/components/k/pressable';
import { KText, Photo } from '@/components/k';
import { color, radius } from '@/lib/k/theme';

const PHOTO_TOUR = gql`
	query KPhotoTour($hostingId: String!) {
		hosting(hostingId: $hostingId) {
			id
			photoTour { id status durationSeconds video { publicUrl } }
		}
	}
`;
type Tour = { status: string; durationSeconds?: number | null; video?: { publicUrl: string } | null };

const W = 150;
const H = Math.round((W * 16) / 9);

export function PhotoTour({ hostingId, coverAssetId }: { hostingId: string; coverAssetId?: string | null }) {
	const [{ data }] = useQuery<{ hosting: { photoTour?: Tour | null } | null }>({ query: PHOTO_TOUR, variables: { hostingId } });
	const tour = data?.hosting?.photoTour;
	const [play, setPlay] = useState(false);
	const uri = tour?.video?.publicUrl ?? null;
	const player = useVideoPlayer(play ? uri : null, (p) => {
		p.loop = false;
		p.play();
	});
	if (!uri) return null;

	return (
		<View style={{ gap: 10 }}>
			<KText v="heading">Photo tour</KText>
			<View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
				<View style={s.frame}>
					{play ? (
						<VideoView player={player} style={StyleSheet.absoluteFill} nativeControls contentFit="cover" allowsFullscreen />
					) : (
						<Pressable onPress={() => setPlay(true)} accessibilityRole="button" accessibilityLabel="Play the photo tour" style={StyleSheet.absoluteFill}>
							<Photo assetId={coverAssetId} w={300} h={534} style={StyleSheet.absoluteFill} />
							<View style={s.play}>
								<PlayCircle size={44} color={color.amber} strokeWidth={1.4} />
							</View>
						</Pressable>
					)}
				</View>
				<View style={{ flex: 1, gap: 6 }}>
					<KText v="body" style={{ color: color.fg2 }}>
						A quick look through the rooms{tour?.durationSeconds ? `, ${tour.durationSeconds} seconds` : ''}.
					</KText>
					<KText v="micro">Made by Kushi from the listing’s photos, not recorded on site</KText>
				</View>
			</View>
		</View>
	);
}

const s = StyleSheet.create({
	frame: { width: W, height: H, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: color.surface },
	play: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(7,8,11,0.28)' }
});
