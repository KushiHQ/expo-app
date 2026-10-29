/**
 * The Kushi photo tour on a listing: a short vertical video Kushi makes from
 * the room photos. Not the host's walk-through (VideoTour), which is recorded
 * on site. Shows nothing until a tour is ready. Tapping plays it full screen
 * in the Kushi player; a shared tour link (kushi://hostings/<id>?tour=1) opens
 * it straight away.
 */
import { useEffect, useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { gql, useQuery } from 'urql';
import { PlayCircle, Share2 } from 'lucide-react-native';
import { Pressable } from '@/components/k/pressable';
import { KText, Photo } from '@/components/k';
import { TourPlayer } from '@/components/k/tour-player';
import { slugify } from '@/lib/k/listing';
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

/** The public tour page, which also opens in the app. */
export const tourShareUrl = (id: string, title?: string | null) => `https://housing.kushi.ng/tours/${slugify(title, id)}`;

export function PhotoTour({ hostingId, title, coverAssetId }: { hostingId: string; title?: string | null; coverAssetId?: string | null }) {
	const [{ data }] = useQuery<{ hosting: { photoTour?: Tour | null } | null }>({ query: PHOTO_TOUR, variables: { hostingId } });
	const { tour: openParam } = useLocalSearchParams<{ tour?: string }>();
	const tour = data?.hosting?.photoTour;
	const uri = tour?.status === 'ready' ? (tour.video?.publicUrl ?? null) : null;
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (uri && openParam === '1') setOpen(true);
	}, [uri, openParam]);

	if (!uri) return null;
	const url = tourShareUrl(hostingId, title);

	return (
		<View style={{ gap: 10 }}>
			<KText v="heading">Photo tour</KText>
			<View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
				<Pressable onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel="Play the photo tour" style={s.frame}>
					<Photo assetId={coverAssetId} w={300} h={534} style={StyleSheet.absoluteFill} />
					<View style={s.play}>
						<PlayCircle size={44} color={color.amber} strokeWidth={1.4} />
					</View>
				</Pressable>
				<View style={{ flex: 1, gap: 8 }}>
					<KText v="body" style={{ color: color.fg2 }}>
						A quick look through the rooms{tour?.durationSeconds ? `, ${tour.durationSeconds} seconds` : ''}.
					</KText>
					<KText v="micro">Made by Kushi from the listing’s photos, not recorded on site</KText>
					<Pressable onPress={() => Share.share({ message: url, url }).catch(() => {})} style={s.share} accessibilityRole="button" accessibilityLabel="Share this photo tour">
						<Share2 size={15} color={color.fg} />
						<KText v="smallStrong">Share tour</KText>
					</Pressable>
				</View>
			</View>
			<TourPlayer visible={open} uri={uri} title={title} shareUrl={url} onClose={() => setOpen(false)} />
		</View>
	);
}

const s = StyleSheet.create({
	frame: { width: W, height: H, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: color.surface },
	play: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(7,8,11,0.28)' },
	share: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: color.line2 }
});
