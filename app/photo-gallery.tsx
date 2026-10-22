import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { carryCapture } from '@/lib/k/photo-capture';
import * as FileSystem from 'expo-file-system/legacy';
import { Check, Crop } from 'lucide-react-native';
import { PhotoViewer, type ViewerPhoto } from '@/components/k/gallery';
import { Button } from '@/components/k';
import { PhotoEditor } from '@/components/k/photo-editor';
import { color } from '@/lib/k/theme';
import { toast } from '@/lib/hooks/use-toast';
import { useGalleryStore } from '@/lib/stores/gallery';
import { cast } from '@/lib/types/utils';

/**
 * Viewer for a list of images held in the gallery store: chat attachments,
 * posters, and the camera review (Edit / Use photos) when not `viewOnly`.
 * Listing photos use /hostings/[id]/gallery; both render the same PhotoViewer.
 */
export default function PhotoGalleryScreen() {
	const router = useRouter();
	const { redirect, fromCamera, viewOnly } = useLocalSearchParams();
	const { gallery, captions, activeIndex, setActiveIndex, updateActiveImage, setReplacement } = useGalleryStore();
	const photos = useMemo<ViewerPhoto[]>(() => gallery.map((uri, i) => ({ key: `${i}:${uri}`, uri, caption: [captions[i]?.title, captions[i]?.subtitle].filter(Boolean).join(' — ') || null })), [gallery, captions]);
	const reviewing = viewOnly !== 'true';
	// Open where the caller asked; later index changes come from swiping.
	const [start] = useState(activeIndex);
	// The photo being edited: what the editor shows, the gallery entry it replaces,
	// and the downloaded copy to clean up (uploaded photos are edited locally).
	const [editing, setEditing] = useState<{ path: string; current: string; isRemote: boolean; temp?: string } | null>(null);

	const close = () => (router.canGoBack() ? router.back() : router.replace('/'));
	const confirmPhotos = () => {
		// dismissTo pops back to the screen that opened the camera (already in the stack).
		if (redirect) router.dismissTo(cast(`${redirect}?fromCamera=${fromCamera}`));
		else close();
	};

	async function edit() {
		const current = useGalleryStore.getState().gallery[useGalleryStore.getState().activeIndex];
		if (!current) return;
		const isRemote = /^https?:\/\//.test(current);
		try {
			// Edit a local copy of an uploaded photo.
			if (isRemote) {
				const { uri } = await FileSystem.downloadAsync(current, `${FileSystem.cacheDirectory}edit-${Date.now()}.jpg`);
				setEditing({ path: uri, current, isRemote, temp: uri });
			} else {
				setEditing({ path: current, current, isRemote });
			}
		} catch {
			toast.show({ type: 'error', text1: 'Couldn’t open that photo', text2: 'Check your connection and try again.' });
		}
	}

	function finishEdit(edited: string | null) {
		const e = editing;
		setEditing(null);
		if (!e) return;
		if (edited) {
			// Remember which uploaded image this replaces so it's updated in place, not duplicated.
			const original = useGalleryStore.getState().replacements[e.current] ?? (e.isRemote ? e.current : undefined);
			if (original) setReplacement(edited, original);
			// The edit drops EXIF; it was taken where the original was.
			carryCapture(e.current, edited);
			updateActiveImage(edited);
		}
		if (e.temp) FileSystem.deleteAsync(e.temp, { idempotent: true }).catch(() => {});
	}

	return (
		<>
		<PhotoEditor open={!!editing} uri={editing?.path ?? null} onCancel={() => finishEdit(null)} onDone={(edited) => finishEdit(edited)} />
		<PhotoViewer
			photos={photos}
			start={start}
			onIndexChange={setActiveIndex}
			onClose={close}
			grid={!reviewing}
			actions={
				reviewing ? (
					<View style={{ flexDirection: 'row', gap: 10 }}>
						<Button title="Edit" variant="ghost" icon={<Crop size={16} color={color.fg} />} onPress={edit} style={{ flex: 1 }} />
						<Button title={`Use ${gallery.length} photo${gallery.length === 1 ? '' : 's'}`} icon={<Check size={16} color={color.onAmber} />} onPress={confirmPhotos} style={{ flex: 1.4 }} />
					</View>
				) : undefined
			}
		/>
		</>
	);
}
