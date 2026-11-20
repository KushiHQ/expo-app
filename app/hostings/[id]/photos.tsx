import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery } from 'urql';
import { Button, Card, Empty, Header, KText, Photo, Screen, Skeleton } from '@/components/k';
import { color, radius } from '@/lib/k/theme';
import { roomLabel } from '@/lib/k/listing';
import { cleanError } from '@/lib/k/use-listing-step';
import { toast } from '@/lib/hooks/use-toast';

type Item = { id: string; room: string; edits: string[]; originalAssetId: string; enhancedAssetId: string; hostReverted: boolean };

const LIST = `query MyPhotoEnhancements($hostingId: String!) {
	myPhotoEnhancements(hostingId: $hostingId) { id room edits originalAssetId enhancedAssetId hostReverted }
}`;
const SET_ONE = `mutation SetPhotoEnhancementInUse($id: String!, $inUse: Boolean!) {
	setPhotoEnhancementInUse(id: $id, inUse: $inUse) { id hostReverted }
}`;
const SET_ALL = `mutation SetListingPhotoEnhancementsInUse($hostingId: String!, $inUse: Boolean!) {
	setListingPhotoEnhancementsInUse(hostingId: $hostingId, inUse: $inUse)
}`;

const EDITS: Record<string, string> = {
	light: 'light',
	colour: 'colour',
	sharpness: 'sharpness',
	straighten: 'straightened',
	crop: 'light crop',
	tidy: 'tidied mess',
	people: 'people removed',
	privacy: 'privacy blur'
};

/**
 * Photos of this listing that Kushi improved (light, colour, sharpness, mess
 * tidied away) and a reviewer approved. The host picks which version renters
 * see; their originals are always kept.
 */
export default function ImprovedPhotos() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [{ data, fetching, error }, refetch] = useQuery<{ myPhotoEnhancements: Item[] }>({ query: LIST, variables: { hostingId: String(id) }, requestPolicy: 'network-only' });
	const [, setOne] = useMutation(SET_ONE);
	const [, setAll] = useMutation(SET_ALL);
	const [busy, setBusy] = useState<string | null>(null);
	const [local, setLocal] = useState<Record<string, boolean>>({});
	const items = (data?.myPhotoEnhancements ?? []).map((i) => (i.id in local ? { ...i, hostReverted: local[i.id] } : i));
	const using = items.filter((i) => !i.hostReverted).length;

	async function pick(it: Item, inUse: boolean) {
		if (busy || it.hostReverted === !inUse) return;
		setBusy(it.id);
		const r = await setOne({ id: it.id, inUse });
		setBusy(null);
		if (r.error) return toast.show({ type: 'error', text1: 'That didn’t work', text2: cleanError(r.error.message) });
		setLocal((m) => ({ ...m, [it.id]: !inUse }));
		toast.show({ type: 'success', text2: inUse ? 'Renters now see the improved photo.' : 'Renters now see your original.' });
	}
	async function pickAll(inUse: boolean) {
		setBusy('all');
		const r = await setAll({ hostingId: String(id), inUse });
		setBusy(null);
		if (r.error) return toast.show({ type: 'error', text1: 'That didn’t work', text2: cleanError(r.error.message) });
		setLocal(Object.fromEntries(items.map((i) => [i.id, !inUse])));
		toast.show({ type: 'success', text2: inUse ? 'Renters now see all the improved photos.' : 'Renters now see all your originals.' });
	}

	return (
		<Screen header={<Header eyebrow="Photos" title="Improved photos" />} onRefresh={() => refetch({ requestPolicy: 'network-only' })} refreshing={false} contentStyle={{ paddingTop: 20, gap: 16 }}>
			<KText v="small">
				Kushi improves listing photos: better light and colour, sharper, straighter, with litter and clutter tidied away. Nothing about the property itself is changed, and a Kushi reviewer checks every photo. Your originals are always kept; tap the one renters should see.
			</KText>
			{fetching && !data ? (
				<View style={{ gap: 10 }}>
					<Skeleton style={{ height: 220 }} />
					<Skeleton style={{ height: 220 }} />
				</View>
			) : error && !data ? (
				<Empty title="Photos didn’t load" body={cleanError(error.message)} action="Try again" onAction={() => refetch({ requestPolicy: 'network-only' })} />
			) : !items.length ? (
				<Empty title="No improved photos yet" body="When Kushi improves photos of this listing, they appear here and we let you know." />
			) : (
				<>
					<KText v="xs">
						Renters see {using} improved photo{using === 1 ? '' : 's'} of {items.length}.
					</KText>
					<View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
						{using < items.length ? <Button title="Use all improved" variant="ghost" size="sm" loading={busy === 'all'} onPress={() => pickAll(true)} /> : null}
						{using > 0 ? <Button title="Use all my originals" variant="ghost" size="sm" loading={busy === 'all'} onPress={() => pickAll(false)} /> : null}
					</View>
					{items.map((it) => (
						<Card key={it.id} style={{ padding: 14, gap: 10 }}>
							<KText v="bodyStrong">{roomLabel(it.room)}</KText>
							<KText v="xs">{it.edits.map((e) => EDITS[e] ?? e).join(' · ')}</KText>
							<View style={{ flexDirection: 'row', gap: 8 }}>
								{[
									{ inUse: false, assetId: it.originalAssetId, label: 'Your original' },
									{ inUse: true, assetId: it.enhancedAssetId, label: 'Improved' }
								].map((o) => {
									const on = it.hostReverted === !o.inUse;
									return (
										<Pressable
											key={o.label}
											accessibilityRole="button"
											accessibilityState={{ selected: on }}
											accessibilityLabel={`${o.label}${on ? ', renters see this' : ''}`}
											disabled={busy != null}
											onPress={() => pick(it, o.inUse)}
											style={{ flex: 1, gap: 6 }}
										>
											<View style={{ borderRadius: radius.md, borderWidth: 2, borderColor: on ? color.amber : 'transparent', overflow: 'hidden' }}>
												<Photo assetId={o.assetId} w={800} h={600} radius={0} style={{ width: '100%', aspectRatio: 4 / 3 }} />
											</View>
											<KText v={on ? 'smallStrong' : 'small'} style={on ? { color: color.amber } : undefined}>
												{on ? 'Renters see this' : o.label}
											</KText>
										</Pressable>
									);
								})}
							</View>
						</Card>
					))}
					<KText v="xs">Something looks wrong in an improved photo? Switch back to your original and tell us at support@kushi.ng.</KText>
				</>
			)}
		</Screen>
	);
}
