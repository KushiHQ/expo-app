import { useMemo } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { PhotoViewer, type ViewerPhoto } from '@/components/k/gallery';
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
	const photos = useMemo<ViewerPhoto[]>(
		() =>
			(h ? listingPhotos(h) : []).map((p) => ({
				key: p.id,
				uri: big ? getAssetResizeUrl(p.id, 2400, 1800, 85) : getAssetResizeUrl(p.id, 1600, 1200, 85),
				thumb: getAssetResizeUrl(p.id, 600, 450, 75),
				group: p.group,
				caption: p.caption
			})),
		[h, big]
	);
	return <PhotoViewer photos={photos} start={Number(start ?? 0) || 0} loading={fetching && !data} grid onClose={() => (router.canGoBack() ? router.back() : router.replace(`/hostings/${id}`))} />;
}
