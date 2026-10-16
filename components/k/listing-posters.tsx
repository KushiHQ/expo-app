/**
 * Posters and renders for land listings (artist's impressions of a proposed
 * development). Uploaded from the library, not location-checked, at most 5.
 */
import { useState } from 'react';
import { View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { usePathname } from 'expo-router';
import { ImagePlus, Star, Trash2 } from 'lucide-react-native';
import { Button, Card, KText, Sheet, Spinner } from '@/components/k';
import { PhotoTile } from '@/components/k/listing-form';
import { Pressable } from '@/components/k/pressable';
import { color, radius } from '@/lib/k/theme';
import { formMutation, generateRNFile } from '@/lib/services/graphql/utils/fetch';
import { HostingImageVariant, useDeleteHostingImageMutation, useSetHostingCoverMutation } from '@/lib/services/graphql/generated';
import { UPLOAD_HOSTING_IMAGE } from '@/lib/services/graphql/requests/mutations/hostings';
import { usePhotoGalleryScreen } from '@/lib/hooks/camera';
import { toast } from '@/lib/hooks/use-toast';
import { cleanError } from '@/lib/k/use-listing-step';
import type { Href } from 'expo-router';

const MAX = 5;
type Poster = { id: string; asset: { id: string; publicUrl: string } };

export function ListingPosters({ hostingId, posters, coverAssetId, size, onChange }: { hostingId: string; posters: Poster[]; coverAssetId?: string | null; size: number; onChange: () => void }) {
	const [uploading, setUploading] = useState(false);
	const [busy, setBusy] = useState(false);
	const [open, setOpen] = useState<Poster | null>(null);
	const [, del] = useDeleteHostingImageMutation();
	const [, setCover] = useSetHostingCoverMutation();
	const { redirect: openGallery } = usePhotoGalleryScreen();
	const pathname = usePathname();

	async function add() {
		const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
		if (r.canceled || !r.assets?.length) return;
		setUploading(true);
		try {
			const res = await formMutation(UPLOAD_HOSTING_IMAGE, { hostingId, variant: HostingImageVariant.Poster, image: generateRNFile(r.assets[0].uri) });
			if (res.error) toast.show({ type: 'error', text1: 'The poster didn’t upload', text2: cleanError(res.error.message) });
			else onChange();
		} catch {
			toast.show({ type: 'error', text1: 'The poster didn’t upload', text2: 'Check your connection and try again.' });
		} finally {
			setUploading(false);
		}
	}

	async function act(fn: () => Promise<{ error?: { message: string } }>, ok: string) {
		setBusy(true);
		const r = await fn();
		setBusy(false);
		setOpen(null);
		if (r.error) return toast.show({ type: 'error', text2: cleanError(r.error.message) });
		toast.show({ type: 'success', text2: ok });
		onChange();
	}

	return (
		<Card>
			<View style={{ gap: 4 }}>
				<KText v="bodyStrong">Posters and renders</KText>
				<KText v="xs">Optional. Plans or artist’s impressions of what could be built. Shown as “not verified”. Up to {MAX}.</KText>
			</View>
			<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
				{posters.map((p, i) => (
					<PhotoTile key={p.id} uri={p.asset.publicUrl} size={size} cover={coverAssetId === p.asset.id} label={`Poster ${i + 1}`} onPress={() => setOpen(p)} />
				))}
				{posters.length < MAX ? (
					<Pressable accessibilityRole="button" accessibilityLabel="Add a poster" onPress={add} disabled={uploading} style={{ width: size, height: size, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: color.line2, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
						{uploading ? <Spinner /> : <ImagePlus size={20} color={color.muted} />}
						<KText v="micro">{uploading ? 'Uploading' : 'Add poster'}</KText>
					</Pressable>
				) : null}
			</View>
			<Sheet open={!!open} onClose={() => setOpen(null)} title="Poster">
				<Button title="View full screen" variant="ghost" block onPress={() => {
					const idx = posters.findIndex((x) => x.id === open?.id);
					setOpen(null);
					openGallery({ images: posters.map((x) => x.asset.publicUrl), activeIndex: Math.max(0, idx), redirect: pathname as Href, viewOnly: true, push: true });
				}} />
				<Button title="Make this the cover photo" variant="ghost" block icon={<Star size={15} color={color.fg} />} loading={busy} onPress={() => open && act(() => setCover({ hostingId, assetId: open.asset.id }), 'Cover photo updated.')} />
				<Button title="Delete poster" variant="danger" block icon={<Trash2 size={15} color="#fff" />} loading={busy} onPress={() => open && act(() => del({ id: open.id }), 'Poster deleted.')} />
			</Sheet>
		</Card>
	);
}
