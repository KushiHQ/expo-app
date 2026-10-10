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
	const base = process.env.EXPO_PUBLIC_SHARE_PROPERTY_URL ?? 'https://kushi-housing-web.onrender.com/homes';
	return `${base.replace(/\/$/, '')}/${slugify(h.title, h.id)}`;
}

export function openListing(id: string) {
	router.push(`/hostings/${id}`);
}

/** Photos for a listing: cover, then each room's images (grouped by room), then posters. */
export function listingPhotos(h: Listing): { id: string; group: string; caption?: string | null }[] {
	const out: { id: string; group: string; caption?: string | null }[] = [];
	if (h.coverImage?.asset?.id) out.push({ id: h.coverImage.asset.id, group: 'Overview' });
	for (const r of h.rooms ?? []) for (const img of r.images ?? []) if (img.asset?.id) out.push({ id: img.asset.id, group: r.name, caption: r.description });
	for (const p of h.hostingImages ?? []) if (p.asset?.id) out.push({ id: p.asset.id, group: 'Plans & renders', caption: p.caption });
	const seen = new Set<string>();
	return out.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
}
