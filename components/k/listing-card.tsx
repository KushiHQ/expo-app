import { memo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Heart, Star } from 'lucide-react-native';
import { color, font, radius } from '@/lib/k/theme';
import { naira, perInterval, place } from '@/lib/k/format';
import { TIERS } from '@/lib/k/tiers';
import { isSignedIn, requireSignIn } from '@/lib/k/session';
import { useCreateUpdateSavedHostingMutation, useDeleteSavedHostingMutation, type HostingsQuery } from '@/lib/services/graphql/generated';
import { Photo } from './surface';
import { KText } from './text';

export type CardHosting = HostingsQuery['hostings'][number];

/** Save / unsave a listing; signed-out people are sent to sign in first. */
export function useSaveToggle(id: string, initial?: boolean | null) {
	const [saved, setSaved] = useState(!!initial);
	const [, save] = useCreateUpdateSavedHostingMutation();
	const [, unsave] = useDeleteSavedHostingMutation();
	async function toggle() {
		if (!isSignedIn()) return requireSignIn(`/hostings/${id}`);
		const next = !saved;
		setSaved(next);
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
		const r = next ? await save({ input: { hostingId: id } }) : await unsave({ hostingId: id });
		if (r.error) setSaved(!next);
	}
	return { saved, toggle };
}

function photosOf(h: CardHosting): string[] {
	const ids = [h.coverImage?.asset?.id, ...(h.images ?? []).map((i) => i.asset?.id)].filter(Boolean) as string[];
	return [...new Set(ids)].slice(0, 5);
}

export const ListingCard = memo(function ListingCard({ h, width: w }: { h: CardHosting; width?: number }) {
	const { width: screen } = useWindowDimensions();
	const width = w ?? screen - 40;
	const height = Math.round(width * 0.72);
	const photos = photosOf(h);
	const [page, setPage] = useState(0);
	const { saved, toggle } = useSaveToggle(h.id, h.saved);
	const tier = h.verification?.verificationTier;
	const isParent = h.kind === 'PARENT';
	const price = isParent && h.priceFrom ? h.priceFrom : h.price;
	const open = () => router.push(`/hostings/${h.id}`);

	return (
		<View style={{ width, gap: 10 }}>
			<View style={{ width, height, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: color.surface }}>
				{photos.length > 1 ? (
					<FlatList
						data={photos}
						horizontal
						pagingEnabled
						showsHorizontalScrollIndicator={false}
						keyExtractor={(id) => id}
						onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
						renderItem={({ item }) => (
							<Pressable onPress={open} accessibilityLabel={`Open ${h.title}`}>
								<Photo assetId={item} w={900} h={650} radius={0} style={{ width, height }} />
							</Pressable>
						)}
					/>
				) : (
					<Pressable onPress={open} accessibilityLabel={`Open ${h.title}`}>
						<Photo assetId={photos[0]} uri={photos[0] ? undefined : null} w={900} h={650} radius={0} style={{ width, height }} />
					</Pressable>
				)}
				<Pressable onPress={toggle} hitSlop={10} accessibilityLabel={saved ? 'Remove from saved' : 'Save'} style={s.heart}>
					<Heart size={20} color={saved ? color.amber : '#fff'} fill={saved ? color.amber : 'rgba(0,0,0,0.25)'} />
				</Pressable>
				{tier && tier !== 'UNVERIFIED' ? (
					<View style={s.tier}>
						<KText v="micro" style={{ color: '#fff' }}>
							◆ {TIERS[tier].short}
						</KText>
					</View>
				) : null}
				{photos.length > 1 ? (
					<View style={s.dots}>
						{photos.map((p, i) => (
							<View key={p} style={[s.dot, i === page && s.dotOn]} />
						))}
					</View>
				) : null}
			</View>
			<Pressable onPress={open} style={{ gap: 3 }}>
				<View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
					<KText v="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
						{h.title}
					</KText>
					{h.averageRating && (h.totalRatings ?? 0) > 0 ? (
						<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
							<Star size={13} color={color.amber} fill={color.amber} />
							<KText v="small" c="fg">
								{h.averageRating.toFixed(1)}
							</KText>
						</View>
					) : null}
				</View>
				<KText v="small" numberOfLines={1}>
					{place(h.city, h.state) || 'Nigeria'}
					{isParent && h.childCount ? ` · ${h.childCount} units` : ''}
				</KText>
				<KText v="small" c="fg">
					{isParent && h.priceFrom ? <KText v="small">from </KText> : null}
					<KText style={{ fontFamily: font.bodyBold, color: color.fg }}>{naira(price)}</KText>
					{h.listingType === 'SALE' ? '' : ` ${perInterval(h.paymentInterval)}`}
				</KText>
			</Pressable>
		</View>
	);
});

const s = StyleSheet.create({
	heart: { position: 'absolute', top: 12, right: 12, width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(7,8,11,0.45)' },
	tier: { position: 'absolute', left: 12, top: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: 'rgba(7,8,11,0.62)' },
	dots: { position: 'absolute', bottom: 10, alignSelf: 'center', flexDirection: 'row', gap: 5 },
	dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
	dotOn: { backgroundColor: '#fff', width: 7, height: 7, borderRadius: 4 }
});
