import { useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { PhotoViewer, type ViewerPhoto } from '@/components/k/gallery';
import { Button } from '@/components/k';
import { listingPhotos, type Listing } from '@/lib/k/listing';
import { getAssetResizeUrl } from '@/lib/utils/urls';
import { useLayout } from '@/lib/k/layout';
import { useHostingQuery } from '@/lib/services/graphql/generated';

/** A listing's photos, grouped by room, opened at `start`. */
export default function Gallery() {
	const { id, start } = useLocalSearchParams<{ id: string; start?: string }>();
	// Tablets show photos much larger: ask the resizer for more pixels so they stay sharp.
	const big = !useLayout().compact;
	const [{ data, fetching }] = useHostingQuery({ variables: { hostingId: id, pagination: { limit: 1, offset: 0 } } });
	const h = data?.hosting as Listing | undefined;
	// Improved photos (Kushi fixed light and colour; staff checked nothing about the property changed) can be flipped back to the host's originals.
	const [originals, setOriginals] = useState(false);
	const list = useMemo(() => (h ? listingPhotos(h) : []), [h]);
	const anyImproved = list.some((p) => p.original);
	const photos = useMemo<ViewerPhoto[]>(
		() =>
			list.map((p) => {
				const shown = originals && p.original ? p.original : p.id;
				return {
					key: p.id,
					uri: big ? getAssetResizeUrl(shown, 2400, 1800, 85) : getAssetResizeUrl(shown, 1600, 1200, 85),
					thumb: getAssetResizeUrl(shown, 600, 450, 75),
					group: p.group,
					caption: p.original ? [p.caption, originals ? 'Original photo' : 'Light and colour improved by Kushi'].filter(Boolean).join(' · ') : p.caption
				};
			}),
		[list, big, originals]
	);
	return (
		<PhotoViewer
			photos={photos}
			start={Number(start ?? 0) || 0}
			loading={fetching && !data}
			grid
			actions={anyImproved ? <Button title={originals ? 'See improved photos' : 'See original photos'} variant="ghost" size="sm" onPress={() => setOriginals((v) => !v)} /> : undefined}
			onClose={() => (router.canGoBack() ? router.back() : router.replace(`/hostings/${id}`))}
		/>
	);
}
