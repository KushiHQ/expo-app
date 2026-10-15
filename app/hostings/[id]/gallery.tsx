import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import { IconButton, KText, Spinner } from '@/components/k';
import { color, radius } from '@/lib/k/theme';
import { listingPhotos, type Listing } from '@/lib/k/listing';
import { getAssetResizeUrl } from '@/lib/utils/urls';
import { useLayout } from '@/lib/k/layout';
import { useHostingQuery } from '@/lib/services/graphql/generated';

/** Full-screen photo viewer, grouped by room, opened at `start`. */
export default function Gallery() {
	const { id, start } = useLocalSearchParams<{ id: string; start?: string }>();
	const { width, height } = useWindowDimensions();
	const insets = useSafeAreaInsets();
	// Tablets show photos much larger: ask the resizer for more pixels so they stay sharp.
	const big = !useLayout().compact;
	const [{ data }] = useHostingQuery({ variables: { hostingId: id, pagination: { limit: 1, offset: 0 } } });
	const h = data?.hosting as Listing | undefined;
	const photos = useMemo(() => (h ? listingPhotos(h) : []), [h]);
	const groups = useMemo(() => {
		const out: { name: string; first: number; count: number }[] = [];
		photos.forEach((p, i) => {
			const g = out.find((x) => x.name === p.group);
			if (g) g.count++;
			else out.push({ name: p.group, first: i, count: 1 });
		});
		return out;
	}, [photos]);
	const initial = Math.min(Number(start ?? 0) || 0, Math.max(photos.length - 1, 0));
	const [index, setIndex] = useState(initial);
	const pager = useRef<FlatList>(null);
	// Photos arrive after mount; land on the one that was tapped.
	useEffect(() => {
		if (!photos.length) return;
		setIndex(initial);
		const t = setTimeout(() => pager.current?.scrollToIndex({ index: initial, animated: false }), 0);
		return () => clearTimeout(t);
	}, [photos.length, initial]);
	const close = () => (router.canGoBack() ? router.back() : router.replace(`/hostings/${id}`));
	const cur = photos[index];

	function jump(i: number) {
		setIndex(i);
		pager.current?.scrollToIndex({ index: i, animated: false });
	}

	return (
		<View style={{ flex: 1, backgroundColor: '#000' }}>
			<StatusBar style="light" />
			{photos.length ? (
				<FlatList
					ref={pager}
					data={photos}
					horizontal
					pagingEnabled
					initialScrollIndex={initial}
					getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
					showsHorizontalScrollIndicator={false}
					keyExtractor={(p) => p.id}
					onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
					renderItem={({ item }) => (
						<View style={{ width, height, justifyContent: 'center' }}>
							<Image
								source={{ uri: big ? getAssetResizeUrl(item.id, 2400, 1800, 85) : getAssetResizeUrl(item.id, 1600, 1200, 85) }}
								placeholder={{ uri: getAssetResizeUrl(item.id, 800, 600, 80) }}
								style={{ width, height: height * 0.72 }}
								contentFit="contain"
								transition={200}
								cachePolicy="memory-disk"
							/>
						</View>
					)}
				/>
			) : (
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>{data ? <KText c="dim">No photos yet</KText> : <Spinner />}</View>
			)}

			<View style={[s.top, { top: insets.top + 8 }]}>
				<View style={{ flex: 1, gap: 2 }}>
					<KText v="micro" style={{ color: color.amber }}>
						{cur?.group ?? ''}
					</KText>
					<KText v="smallStrong" style={{ color: '#fff' }}>
						{photos.length ? `${index + 1} / ${photos.length}` : ''}
					</KText>
				</View>
				<IconButton label="Close" onPress={close}>
					<X size={18} color={color.fg} />
				</IconButton>
			</View>

			<View style={[s.bottom, { paddingBottom: insets.bottom + 14 }]}>
				{cur?.caption ? (
					<KText v="small" numberOfLines={3} style={{ color: 'rgba(255,255,255,0.82)', paddingHorizontal: 20 }}>
						{cur.caption}
					</KText>
				) : null}
				{groups.length > 1 ? (
					<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
						{groups.map((g) => {
							const on = cur?.group === g.name;
							return (
								<Pressable key={g.name} onPress={() => jump(g.first)} style={[s.group, on && s.groupOn]} accessibilityRole="button">
									<KText v="small" style={{ color: on ? color.onAmber : '#fff' }}>
										{g.name} · {g.count}
									</KText>
								</Pressable>
							);
						})}
					</ScrollView>
				) : null}
			</View>
		</View>
	);
}

const s = StyleSheet.create({
	top: { position: 'absolute', left: 20, right: 20, flexDirection: 'row', alignItems: 'center' },
	bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, gap: 12 },
	group: { paddingHorizontal: 14, height: 36, justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(0,0,0,0.5)' },
	groupOn: { backgroundColor: color.amber, borderColor: color.amber }
});
