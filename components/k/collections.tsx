/**
 * Saved collections (server: saved hosting folders). The Saved tab shows them
 * as a strip; a collection opens /hostings/folders/[id]; any saved home can be
 * moved into one.
 */
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Pressable } from '@/components/k/pressable';
import { router } from 'expo-router';
import { useQuery } from 'urql';
import { FolderHeart, FolderPlus, Plus, Trash2 } from 'lucide-react-native';
import { color, radius } from '@/lib/k/theme';
import { toast } from '@/lib/hooks/use-toast';
import { K_COLLECTIONS, K_SAVED_COLLECTED } from '@/lib/services/graphql/requests/queries/k-manage';
import { useCreateUpdateSavedHostingFolderMutation, useCreateUpdateSavedHostingMutation, useDeleteSavedHostingMutation } from '@/lib/services/graphql/generated';
import type { CardHosting } from './listing-card';
import { Button, IconButton } from './button';
import { Field, Choice } from './form';
import { Sheet } from './sheet';
import { KText } from './text';

const clean = (m?: string) => (m ?? '').replace('[GraphQL] ', '');

export type Collection = { id: string; folderName: string; itemCount?: number | null; lastUpdated?: string | null };
export type SavedItem = { id: string; createdAt?: string | null; folder?: { id: string; folderName: string } | null; hosting: CardHosting & { price?: number | null } };

export function useCollections(pause?: boolean) {
	const [{ data, fetching, error }, refetch] = useQuery<{ savedHostingFolders: Collection[] }>({ query: K_COLLECTIONS, variables: { pagination: { limit: 100, offset: 0 } }, pause, requestPolicy: 'cache-and-network' });
	return { collections: data?.savedHostingFolders ?? [], fetching, error, loaded: !!data, reload: () => refetch({ requestPolicy: 'network-only' }) };
}

export function useSavedItems(folderId?: string, pause?: boolean) {
	const [{ data, fetching, error }, refetch] = useQuery<{ savedHostings: SavedItem[] }>({
		query: K_SAVED_COLLECTED,
		variables: { filters: folderId ? { folderId } : undefined, pagination: { limit: 200, offset: 0 } },
		pause,
		requestPolicy: 'cache-and-network'
	});
	return { items: (data?.savedHostings ?? []).filter((s) => s.hosting && s.hosting.saved !== false), fetching, error, loaded: !!data, reload: () => refetch({ requestPolicy: 'network-only' }) };
}

/** Horizontal strip of collections with a "New" tile. */
export function CollectionsStrip({ collections, onNew }: { collections: Collection[]; onNew: () => void }) {
	return (
		<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }} testID="collections-strip">
			{collections.map((c) => (
				<Pressable
					key={c.id}
					onPress={() => router.push(`/hostings/folders/${c.id}`)}
					accessibilityRole="button"
					accessibilityLabel={`${c.folderName}, ${c.itemCount ?? 0} homes`}
					style={({ pressed }) => [s.tile, pressed && { opacity: 0.8 }]}
				>
					<FolderHeart size={18} color={color.amber} />
					<KText v="smallStrong" numberOfLines={1}>
						{c.folderName}
					</KText>
					<KText v="xs">
						{c.itemCount ?? 0} home{c.itemCount === 1 ? '' : 's'}
					</KText>
				</Pressable>
			))}
			<Pressable onPress={onNew} accessibilityRole="button" accessibilityLabel="New collection" testID="collection-new" style={({ pressed }) => [s.tile, s.newTile, pressed && { opacity: 0.8 }]}>
				<Plus size={18} color={color.fg2} />
				<KText v="smallStrong" c="fg2">
					New collection
				</KText>
				<KText v="xs">Group homes to compare</KText>
			</Pressable>
		</ScrollView>
	);
}

/** Create or rename a collection. */
export function CollectionNameSheet({ open, onClose, collection, onSaved }: { open: boolean; onClose: () => void; collection?: Collection | null; onSaved?: (id: string, name: string) => void }) {
	const [name, setName] = useState('');
	const [{ fetching }, save] = useCreateUpdateSavedHostingFolderMutation();
	useEffect(() => {
		if (open) setName(collection?.folderName ?? '');
	}, [open, collection]);
	async function submit() {
		const n = name.trim();
		if (!n) return;
		const r = await save({ input: { folderName: n, ...(collection ? { id: collection.id } : {}) } });
		if (r.error) return toast.show({ type: 'error', text1: 'Couldn’t save', text2: clean(r.error.message) });
		const id = r.data?.createUpdateSavedHostingFolder?.data?.id ?? collection?.id;
		onClose();
		if (id) onSaved?.(id, n);
	}
	return (
		<Sheet open={open} onClose={onClose} eyebrow="Collection" title={collection ? 'Rename collection' : 'New collection'}>
			<Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Near work, Shortlist" autoFocus maxLength={60} returnKeyType="done" onSubmitEditing={submit} testID="collection-name" />
			<Button title={collection ? 'Save' : 'Create collection'} size="lg" block loading={fetching} disabled={!name.trim()} onPress={submit} />
		</Sheet>
	);
}

/** Move a saved home into a collection, or remove it from saved. */
export function MoveSheet({ item, onClose, collections }: { item: SavedItem | null; onClose: () => void; collections: Collection[] }) {
	const [, save] = useCreateUpdateSavedHostingMutation();
	const [{ fetching: removing }, unsave] = useDeleteSavedHostingMutation();
	const [busy, setBusy] = useState<string | null>(null);
	const [creating, setCreating] = useState(false);
	async function moveTo(folderId: string, folderName: string) {
		if (!item) return;
		setBusy(folderId);
		const r = await save({ input: { id: item.id, hostingId: item.hosting.id, folderId } });
		setBusy(null);
		if (r.error) return toast.show({ type: 'error', text1: 'Couldn’t move it', text2: clean(r.error.message) });
		toast.show({ type: 'success', text2: `Moved to ${folderName}.` });
		onClose();
	}
	async function remove() {
		if (!item) return;
		const r = await unsave({ hostingId: item.hosting.id });
		if (r.error) return toast.show({ type: 'error', text1: 'Couldn’t remove it', text2: clean(r.error.message) });
		toast.show({ type: 'success', text2: 'Removed from saved.' });
		onClose();
	}
	return (
		<>
			<Sheet open={!!item && !creating} onClose={onClose} eyebrow="Saved home" title={item?.hosting.title ?? 'Saved home'}>
				<KText v="small">{item?.folder ? `In ${item.folder.folderName}. Move it to another collection:` : 'Add it to a collection:'}</KText>
				{collections.length ? (
					collections.map((c) => <Choice key={c.id} title={busy === c.id ? 'Moving…' : c.folderName} detail={`${c.itemCount ?? 0} homes`} on={item?.folder?.id === c.id} onPress={() => item?.folder?.id !== c.id && moveTo(c.id, c.folderName)} />)
				) : (
					<KText v="xs">You have no collections yet.</KText>
				)}
				<Button title="New collection" variant="ghost" icon={<FolderPlus size={16} color={color.fg} />} onPress={() => setCreating(true)} />
				<Button title="Remove from saved" variant="quiet" icon={<Trash2 size={16} color={color.danger} />} loading={removing} onPress={remove} />
			</Sheet>
			<CollectionNameSheet open={creating} onClose={() => setCreating(false)} onSaved={(id, name) => moveTo(id, name)} />
		</>
	);
}

/** Small button laid over a saved card's photo. */
export function CollectButton({ onPress, inCollection }: { onPress: () => void; inCollection?: boolean }) {
	return (
		<View style={s.collect}>
			<IconButton label={inCollection ? 'Move to another collection' : 'Add to a collection'} tone="glass" size={38} onPress={onPress}>
				{inCollection ? <FolderHeart size={17} color={color.amber} /> : <FolderPlus size={17} color={color.fg} />}
			</IconButton>
		</View>
	);
}

const s = StyleSheet.create({
	tile: { width: 150, gap: 6, padding: 14, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2 },
	newTile: { borderStyle: 'dashed', backgroundColor: 'transparent' },
	collect: { position: 'absolute', top: 56, right: 12 }
});
