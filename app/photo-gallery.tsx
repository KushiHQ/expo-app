import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ImagePicker from 'react-native-image-crop-picker';
import { carryCapture } from '@/lib/k/photo-capture';
import * as FileSystem from 'expo-file-system/legacy';
import { Check, Crop } from 'lucide-react-native';
import { PhotoViewer, type ViewerPhoto } from '@/components/k/gallery';
import { Button } from '@/components/k';
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
		let temp: string | undefined;
		try {
			// The cropper opens local files only: download an uploaded photo first.
			let path = current;
			if (isRemote) {
				const { uri } = await FileSystem.downloadAsync(current, `${FileSystem.cacheDirectory}edit-${Date.now()}.jpg`);
				path = uri;
				temp = uri;
			}
			const cropped = await ImagePicker.openCropper({
				path,
				cropping: true,
				mediaType: 'photo',
				// 0 × 0 = no forced aspect ratio; full quality so edits stay sharp.
				width: 0,
				height: 0,
				compressImageQuality: 1,
				cropperActiveWidgetColor: color.amber,
				cropperStatusBarLight: false,
				cropperToolbarColor: color.bg,
				cropperToolbarWidgetColor: color.fg,
				freeStyleCropEnabled: true,
				enableRotationGesture: true
			});
			// iOS returns a raw path; the upload pipeline keys local files by scheme.
			const edited = /^\w+:\/\//.test(cropped.path) ? cropped.path : `file://${cropped.path}`;
			// Remember which uploaded image this replaces so it's updated in place, not duplicated.
			const original = useGalleryStore.getState().replacements[current] ?? (isRemote ? current : undefined);
			if (original) setReplacement(edited, original);
			// The crop drops EXIF; the edit was taken where the original was.
			carryCapture(current, edited);
			updateActiveImage(edited);
		} catch (e: unknown) {
			if ((e as { code?: string })?.code !== 'E_PICKER_CANCELLED') toast.show({ type: 'error', text1: 'Couldn’t edit that photo', text2: 'Please try again.' });
		} finally {
			if (temp) FileSystem.deleteAsync(temp, { idempotent: true }).catch(() => {});
		}
	}

	return (
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
	);
}
