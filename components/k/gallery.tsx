/**
 * One photo viewer for the whole app: listing photos (grouped by room), chat
 * images and the camera review all render through PhotoViewer. PhotoGrid is
 * the overview (2 columns on phones, 3–4 on tablets).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, ScrollView, SectionList, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Pressable } from '@/components/k/pressable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LayoutGrid, X } from 'lucide-react-native';
import { color, radius } from '@/lib/k/theme';
import { useLayout } from '@/lib/k/layout';
import { IconButton } from './button';
import { KText } from './text';
import { Spinner } from './surface';

export type ViewerPhoto = {
	/** Stable key (asset id or uri + index). */
	key: string;
	uri: string;
	/** Small version shown while the full image loads. */
	thumb?: string;
	group?: string;
	caption?: string | null;
};

type ViewerProps = {
	photos: ViewerPhoto[];
	start?: number;
	onClose: () => void;
	/** Still loading the photo list. */
	loading?: boolean;
	/** Bottom actions (e.g. Edit / Use photos in the camera review). */
	actions?: React.ReactNode;
	onIndexChange?: (i: number) => void;
	/** Show a grid button that opens the overview. */
	grid?: boolean;
};

export function PhotoViewer({ photos, start = 0, onClose, loading, actions, onIndexChange, grid }: ViewerProps) {
	const { width, height } = useWindowDimensions();
	const insets = useSafeAreaInsets();
	const initial = Math.min(Math.max(0, start), Math.max(photos.length - 1, 0));
	const [index, setIndex] = useState(initial);
	const [chrome, setChrome] = useState(true);
	const [overview, setOverview] = useState(false);
	const pager = useRef<FlatList<ViewerPhoto>>(null);
	const groups = useMemo(() => {
		const out: { name: string; first: number; count: number }[] = [];
		photos.forEach((p, i) => {
			if (!p.group) return;
			const g = out.find((x) => x.name === p.group);
			if (g) g.count++;
			else out.push({ name: p.group, first: i, count: 1 });
		});
		return out;
	}, [photos]);

	// Photos can arrive after mount (listing query); land on the requested one.
	useEffect(() => {
		if (!photos.length) return;
		setIndex(initial);
		const t = setTimeout(() => pager.current?.scrollToIndex({ index: initial, animated: false }), 0);
		return () => clearTimeout(t);
	}, [photos.length, initial]);
	useEffect(() => onIndexChange?.(index), [index, onIndexChange]);

	const jump = useCallback((i: number) => {
		setIndex(i);
		pager.current?.scrollToIndex({ index: i, animated: false });
	}, []);
	const cur = photos[index];

	return (
		<View style={{ flex: 1, backgroundColor: '#000' }} testID="photo-viewer">
			<StatusBar style="light" hidden={!chrome} />
			{photos.length ? (
				<FlatList
					ref={pager}
					data={photos}
					horizontal
					pagingEnabled
					initialScrollIndex={initial}
					getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
					onScrollToIndexFailed={(info) => setTimeout(() => pager.current?.scrollToIndex({ index: info.index, animated: false }), 200)}
					showsHorizontalScrollIndicator={false}
					keyExtractor={(p) => p.key}
					windowSize={3}
					initialNumToRender={2}
					maxToRenderPerBatch={2}
					onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
					renderItem={({ item, index: i }) => (
						<Pressable
							onPress={() => setChrome((v) => !v)}
							style={{ width, height, justifyContent: 'center' }}
							accessibilityLabel={`Photo ${i + 1} of ${photos.length}${item.group ? `, ${item.group}` : ''}`}
							accessibilityHint="Tap to show or hide controls"
						>
							<Image
								source={{ uri: item.uri }}
								placeholder={item.thumb ? { uri: item.thumb } : undefined}
								style={{ width, height: chrome ? height * 0.72 : height }}
								contentFit="contain"
								transition={200}
								cachePolicy="memory-disk"
							/>
						</Pressable>
					)}
				/>
			) : (
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>{loading ? <Spinner /> : <KText c="dim">No photos yet</KText>}</View>
			)}

			{chrome ? (
				<>
					<View style={[s.top, { top: insets.top + 8 }]}>
						<View style={{ flex: 1, gap: 2 }}>
							{cur?.group ? (
								<KText v="micro" style={{ color: color.amber }}>
									{cur.group}
								</KText>
							) : null}
							<KText v="smallStrong" style={{ color: '#fff' }} testID="viewer-counter">
								{photos.length ? `${index + 1} / ${photos.length}` : ''}
							</KText>
						</View>
						{grid && photos.length > 1 ? (
							<IconButton label="All photos" tone="glass" onPress={() => setOverview(true)}>
								<LayoutGrid size={18} color={color.fg} />
							</IconButton>
						) : null}
						<IconButton label="Close" tone="glass" onPress={onClose}>
							<X size={18} color={color.fg} />
						</IconButton>
					</View>

					<View style={[s.bottom, { paddingBottom: insets.bottom + 14 }]} pointerEvents="box-none">
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
										<Pressable key={g.name} onPress={() => jump(g.first)} style={[s.group, on && s.groupOn]} accessibilityRole="button" accessibilityState={{ selected: on }}>
											<KText v="small" style={{ color: on ? color.onAmber : '#fff' }}>
												{g.name} · {g.count}
											</KText>
										</Pressable>
									);
								})}
							</ScrollView>
						) : null}
						{actions ? <View style={{ paddingHorizontal: 20 }}>{actions}</View> : null}
					</View>
				</>
			) : null}

			{overview ? (
				<View style={[StyleSheet.absoluteFill, { backgroundColor: color.bg, paddingTop: insets.top }]}>
					<View style={s.overviewHead}>
						<KText v="heading" style={{ flex: 1 }}>
							All photos · {photos.length}
						</KText>
						<IconButton label="Close all photos" onPress={() => setOverview(false)}>
							<X size={18} color={color.fg} />
						</IconButton>
					</View>
					<PhotoGrid
						photos={photos}
						onOpen={(i) => {
							setOverview(false);
							jump(i);
						}}
					/>
				</View>
			) : null}
		</View>
	);
}

/** Overview grid, sectioned by group when photos have groups. */
export function PhotoGrid({ photos, onOpen, header }: { photos: ViewerPhoto[]; onOpen: (index: number) => void; header?: React.ReactElement }) {
	const layout = useLayout();
	const insets = useSafeAreaInsets();
	const cols = layout.expanded ? 4 : layout.medium ? 3 : 2;
	const gap = 6;
	const inner = layout.width - layout.gutter * 2;
	const size = Math.floor((inner - gap * (cols - 1)) / cols);
	const sections = useMemo(() => {
		const out: { title: string; data: { i: number; p: ViewerPhoto }[][] }[] = [];
		const byGroup = new Map<string, { i: number; p: ViewerPhoto }[]>();
		photos.forEach((p, i) => {
			const g = p.group ?? '';
			if (!byGroup.has(g)) byGroup.set(g, []);
			byGroup.get(g)!.push({ i, p });
		});
		for (const [title, items] of byGroup) {
			const rows: { i: number; p: ViewerPhoto }[][] = [];
			for (let r = 0; r < items.length; r += cols) rows.push(items.slice(r, r + cols));
			out.push({ title, data: rows });
		}
		return out;
	}, [photos, cols]);
	return (
		<SectionList
			testID="photo-grid"
			sections={sections}
			keyExtractor={(row) => row.map((x) => x.p.key).join('|')}
			stickySectionHeadersEnabled={false}
			contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingBottom: insets.bottom + 24 }}
			ListHeaderComponent={header}
			renderSectionHeader={({ section }) =>
				section.title ? (
					<KText v="label" style={{ paddingTop: 18, paddingBottom: 8 }}>
						{section.title}
					</KText>
				) : null
			}
			renderItem={({ item: row }) => (
				<View style={{ flexDirection: 'row', gap, marginBottom: gap }}>
					{row.map(({ i, p }) => (
						<Pressable key={p.key} onPress={() => onOpen(i)} accessibilityRole="imagebutton" accessibilityLabel={`Open photo ${i + 1}${p.group ? `, ${p.group}` : ''}`} style={({ pressed }) => [{ width: size, height: size, borderRadius: radius.sm, overflow: 'hidden', backgroundColor: color.surface }, pressed && { opacity: 0.8 }]}>
							<Image source={{ uri: p.thumb ?? p.uri }} style={{ width: size, height: size }} contentFit="cover" transition={150} cachePolicy="memory-disk" recyclingKey={p.key} />
						</Pressable>
					))}
				</View>
			)}
		/>
	);
}

const s = StyleSheet.create({
	top: { position: 'absolute', left: 20, right: 20, flexDirection: 'row', alignItems: 'center', gap: 8 },
	bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, gap: 12 },
	group: { paddingHorizontal: 14, height: 36, justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(0,0,0,0.5)' },
	groupOn: { backgroundColor: color.amber, borderColor: color.amber },
	overviewHead: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 10 }
});
