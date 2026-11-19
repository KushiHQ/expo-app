import { router } from 'expo-router';
import type { HostingQuery } from '@/lib/services/graphql/generated';

export type Listing = NonNullable<HostingQuery['hosting']>;
export type ListingMode = 'book' | 'units' | 'agent' | 'sale' | 'group-unit' | 'unavailable';

/** Which call-to-action a listing gets (mirrors the backend's ensure_transactable). */
export function listingMode(h: Listing): ListingMode {
	if (h.managementType === 'AGENT_MANAGED') return 'agent';
	if (h.listingType === 'SALE') return 'sale';
	if (h.kind === 'PARENT' && h.unitStructure !== 'GROUP') return 'units';
	if (h.kind === 'CHILD' && h.parent?.unitStructure === 'GROUP') return 'group-unit';
	if (h.isBookable) return 'book';
	return 'unavailable';
}

export function slugify(title?: string | null, id?: string) {
	const s = (title ?? 'home')
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-');
	return id ? `${s}___${id}` : s;
}

/** Public web link for sharing (opens the app if installed). */
export function shareUrl(h: { id: string; title?: string | null }) {
	const base = process.env.EXPO_PUBLIC_SHARE_PROPERTY_URL ?? 'https://housing.kushi.ng/homes';
	return `${base.replace(/\/$/, '')}/${slugify(h.title, h.id)}`;
}

export function openListing(id: string) {
	router.push(`/hostings/${id}`);
}

/** "FrontArea" / "MASTER_BEDROOM" → "Front area" / "Master bedroom" */
export function roomLabel(name: string | null | undefined): string {
	const t = String(name ?? '').replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim().toLowerCase();
	return t ? t[0].toUpperCase() + t.slice(1) : 'Photos';
}

type ImageLike = { asset?: { id: string } | null; enhancedAsset?: { id: string } | null } | null | undefined;

/**
 * The photo guests see: Kushi's improved version when staff approved one and
 * the host kept it (`enhancedAsset`), otherwise the host's own (`asset`).
 */
export function shownAssetId(img: ImageLike): string | undefined {
	return img?.enhancedAsset?.id ?? img?.asset?.id ?? undefined;
}

/** The host's original, when what's shown is an improved version. */
export function originalIfEnhanced(img: ImageLike): string | null {
	return img?.enhancedAsset?.id && img.asset?.id ? img.asset.id : null;
}

export type ListingPhoto = { id: string; group: string; caption?: string | null; original?: string | null };

/** Photos for a listing: cover, then each room's images (grouped by room), then posters. */
export function listingPhotos(h: Listing): ListingPhoto[] {
	const out: ListingPhoto[] = [];
	const cover = shownAssetId(h.coverImage);
	if (cover) out.push({ id: cover, group: 'Overview', original: originalIfEnhanced(h.coverImage) });
	for (const r of h.rooms ?? [])
		for (const img of r.images ?? []) {
			const id = shownAssetId(img);
			if (id) out.push({ id, group: roomLabel(r.name), caption: r.description, original: originalIfEnhanced(img) });
		}
	for (const p of h.hostingImages ?? []) if (p.asset?.id) out.push({ id: p.asset.id, group: 'Plans & renders', caption: p.caption });
	const seen = new Set<string>();
	return out.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
}
