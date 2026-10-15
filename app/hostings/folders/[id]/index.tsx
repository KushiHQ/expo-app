import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react-native';
import { Button, Empty, Header, IconButton, KText, Notice, Photo, Row, Sheet, Skeleton } from '@/components/k';
import { Check } from '@/components/k/form';
import { ListingCard } from '@/components/k/listing-card';
import { CollectButton, CollectionNameSheet, MoveSheet, useCollections, useSavedItems, type SavedItem } from '@/components/k/collections';
import { color, gutter, radius } from '@/lib/k/theme';
import { centered, itemWidth, useLayout } from '@/lib/k/layout';
import { naira, place } from '@/lib/k/format';
import { toast } from '@/lib/hooks/use-toast';
import { useCreateUpdateSavedHostingMutation, useDeleteSavedHostingFolderMutation, useSavedHostingFolderQuery } from '@/lib/services/graphql/generated';

/** One saved collection: same grid as the Saved tab, plus rename / delete / add homes. */
export default function Collection() {
	const { id: raw } = useLocalSearchParams<{ id: string }>();
	const id = String(raw);
	const layout = useLayout();
	const [{ data: fd, fetching: folderFetching, error: folderError }] = useSavedHostingFolderQuery({ variables: { savedHostingFolderId: id }, requestPolicy: 'cache-and-network' });
	const folder = fd?.savedHostingFolder;
	const { items, fetching, error, loaded, reload } = useSavedItems(id);
	const { collections } = useCollections();
	const { items: allSaved } = useSavedItems();
	const [menu, setMenu] = useState(false);
	const [renaming, setRenaming] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [adding, setAdding] = useState(false);
	const [picked, setPicked] = useState<string[]>([]);
	const [moving, setMoving] = useState<SavedItem | null>(null);
	const [{ fetching: deleting }, del] = useDeleteSavedHostingFolderMutation();
	const [{ fetching: saving }, save] = useCreateUpdateSavedHostingMutation();
	const cols = layout.columns;
	const colGap = 24;
	const cardWidth = layout.compact ? undefined : itemWidth(layout.contentWidth - layout.gutter * 2, cols, colGap);
	const candidates = useMemo(() => allSaved.filter((s) => s.folder?.id !== id), [allSaved, id]);

	async function remove() {
		const r = await del({ folderId: id });
		if (r.error) return toast.show({ type: 'error', text1: 'Couldn’t delete', text2: r.error.message.replace('[GraphQL] ', '') });
		setConfirmDelete(false);
		toast.show({ type: 'success', text2: 'Collection deleted.' });
		if (router.canGoBack()) router.back();
		else router.replace('/saved');
	}
	async function addPicked() {
		const chosen = candidates.filter((c) => picked.includes(c.id));
		const results = await Promise.all(chosen.map((c) => save({ input: { id: c.id, hostingId: c.hosting.id, folderId: id } })));
		const failed = results.filter((r) => r.error).length;
		setAdding(false);
		setPicked([]);
		if (failed) toast.show({ type: 'error', text1: `${failed} home${failed > 1 ? 's' : ''} couldn’t be added`, text2: 'Try again in a moment.' });
		else toast.show({ type: 'success', text2: `Added ${chosen.length} home${chosen.length > 1 ? 's' : ''}.` });
		reload();
	}

	const name = folder?.folderName ?? (folderFetching ? '' : 'Collection');
	const notFound = !folder && !folderFetching && (folderError || fd);

	return (
		<View style={{ flex: 1, backgroundColor: color.bg }}>
			<Header
				eyebrow="Collection"
				title={name}
				onBack={() => (router.canGoBack() ? router.back() : router.replace('/saved'))}
				right={
					folder ? (
						<IconButton label="Collection options" onPress={() => setMenu(true)}>
							<MoreHorizontal size={18} color={color.fg} />
						</IconButton>
					) : undefined
				}
			/>
			{notFound ? (
				<View style={{ padding: gutter }}>
					<Notice tone="warn" title="Collection not found" action="Back to saved" onAction={() => router.replace('/saved')}>
						It may have been deleted.
					</Notice>
				</View>
			) : (
				<FlatList
					key={`grid-${cols}`}
					testID="collection-list"
					numColumns={cols}
					columnWrapperStyle={cols > 1 ? { gap: colGap } : undefined}
					data={!loaded ? [] : items}
					keyExtractor={(s) => s.id}
					renderItem={({ item }) => (
						<View>
							<ListingCard h={item.hosting} width={cardWidth} />
							<CollectButton inCollection onPress={() => setMoving(item)} />
						</View>
					)}
					ItemSeparatorComponent={() => <View style={{ height: layout.compact ? 28 : 36 }} />}
					contentContainerStyle={layout.compact ? { paddingHorizontal: gutter, paddingTop: 16, paddingBottom: 40 } : [{ paddingHorizontal: layout.gutter, paddingTop: 20, paddingBottom: 40 }, centered(layout.contentWidth)]}
					onRefresh={reload}
					refreshing={false}
					ListHeaderComponent={
						items.length ? (
							<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16 }}>
								<KText v="small">
									{items.length} home{items.length === 1 ? '' : 's'}
								</KText>
								{candidates.length ? <Button title="Add homes" variant="ghost" size="sm" icon={<Plus size={15} color={color.fg} />} onPress={() => setAdding(true)} /> : null}
							</View>
						) : null
					}
					ListEmptyComponent={
						fetching && !loaded ? (
							<View style={{ gap: 10 }}>
								<Skeleton style={{ height: 250, borderRadius: radius.lg }} />
								<Skeleton style={{ height: 16, width: '55%' }} />
							</View>
						) : error && !loaded ? (
							<Notice tone="danger" title="Couldn’t load this collection" action="Try again" onAction={reload}>
								Check your connection and try again.
							</Notice>
						) : (
							<Empty
								eyebrow="Empty collection"
								title="No homes here yet"
								body={candidates.length ? 'Add homes you’ve saved to compare them side by side.' : 'Save homes from Explore with the heart, then add them here.'}
								action={candidates.length ? 'Add saved homes' : 'Explore homes'}
								onAction={() => (candidates.length ? setAdding(true) : router.navigate('/'))}
							/>
						)
					}
				/>
			)}

			<Sheet open={menu} onClose={() => setMenu(false)} title={name}>
				<Row
					icon={<Pencil size={17} color={color.fg2} />}
					title="Rename"
					onPress={() => {
						setMenu(false);
						setRenaming(true);
					}}
				/>
				<Row
					icon={<Trash2 size={17} color={color.danger} />}
					title="Delete collection"
					danger
					onPress={() => {
						setMenu(false);
						setConfirmDelete(true);
					}}
				/>
			</Sheet>
			<CollectionNameSheet open={renaming} onClose={() => setRenaming(false)} collection={folder ?? null} />
			<Sheet open={confirmDelete} onClose={() => setConfirmDelete(false)} title={`Delete “${name}”?`}>
				<KText v="small">The collection is removed for good. To keep a home, move it to another collection first.</KText>
				<Button title="Delete collection" variant="danger" size="lg" block loading={deleting} onPress={remove} />
			</Sheet>
			<Sheet
				open={adding}
				onClose={() => setAdding(false)}
				eyebrow="Add to collection"
				title={name}
				footer={<Button title={picked.length ? `Add ${picked.length} home${picked.length > 1 ? 's' : ''}` : 'Pick homes to add'} size="lg" block disabled={!picked.length} loading={saving} onPress={addPicked} />}
			>
				{candidates.map((c) => {
					const on = picked.includes(c.id);
					return (
						<Check key={c.id} on={on} onPress={() => setPicked((p) => (on ? p.filter((x) => x !== c.id) : [...p, c.id]))}>
							<View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
								<Photo assetId={c.hosting.coverImage?.asset?.id} w={160} h={120} style={{ width: 52, height: 40 }} />
								<View style={{ flex: 1 }}>
									<KText v="smallStrong" numberOfLines={1}>
										{c.hosting.title}
									</KText>
									<KText v="xs" numberOfLines={1}>
										{[place(c.hosting.city, c.hosting.state), c.hosting.price ? naira(c.hosting.price) : null, c.folder ? `in ${c.folder.folderName}` : null].filter(Boolean).join(' · ')}
									</KText>
								</View>
							</View>
						</Check>
					);
				})}
			</Sheet>
			<MoveSheet item={moving} collections={collections} onClose={() => setMoving(null)} />
		</View>
	);
}
