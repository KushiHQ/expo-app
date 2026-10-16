/**
 * The listing set-up flow, as one model shared by the hub, every step's
 * progress bar and the publish gate.
 *
 * A LIVE save goes live at once (no review queue). The server enforces these
 * same rules (server_v2 `housing/utils/publish_rules.rs`, same wording) and
 * refuses a LIVE save that misses any — error code LISTING_INCOMPLETE with the
 * `missing` list — so keep the two in step when a rule changes.
 */
import type { Href } from 'expo-router';
import type { HostingQuery } from '@/lib/services/graphql/generated';
import { isAgentManaged, isLand, showPayoutAccount, showTenancySteps } from '@/lib/constants/hosting/step-rules';

export type Hosting = NonNullable<HostingQuery['hosting']>;
export type StepKey = 'basics' | 'photos' | 'location' | 'features' | 'price' | 'agreement' | 'publish';

export const MIN_PHOTOS = 3;
export const MIN_DESCRIPTION = 40;
export const PLACEHOLDER_TITLE = /^Untitled listing/i;

type StepDef = {
	key: StepKey;
	title: string;
	/** One line under the title on the hub. */
	blurb: string;
	optional?: boolean;
	applies: (h: Hosting) => boolean;
	/** What is still missing (empty = done). */
	missing: (h: Hosting) => string[];
};

export const roomPhotoCount = (h: Hosting) => (h.rooms ?? []).reduce((n, r) => n + (r.images?.length ?? 0), 0);
export const photoCount = (h: Hosting) => roomPhotoCount(h) + (h.hostingImages?.length ?? 0);

export function mandateMissing(h: Hosting): string[] {
	const v = h.verification;
	const out: string[] = [];
	if (!v?.landlordFullName?.trim() || !v?.landlordAddress?.trim() || !v?.propertyRelationship) out.push('Owner details');
	if (!v?.declOwnership || !v?.declLitigation || !v?.declIndemnity) out.push('The three declarations');
	return out;
}

export const STEPS: StepDef[] = [
	{
		key: 'basics',
		title: 'The basics',
		blurb: 'Who manages it, what kind of property, rent or sale',
		applies: () => true,
		missing: (h) => {
			const out: string[] = [];
			if (!h.propertyType) out.push('Property type');
			if (!h.listingType) out.push('Rent or sale');
			if (h.kind === 'CHILD' && !h.parentId) out.push('The property this unit belongs to');
			return out;
		}
	},
	{
		key: 'photos',
		title: 'Photos and video',
		blurb: 'On-site photos of each space, and an optional video tour',
		applies: () => true,
		missing: (h) => {
			const out: string[] = [];
			const n = photoCount(h);
			if (n < MIN_PHOTOS) out.push(`${MIN_PHOTOS - n} more photo${MIN_PHOTOS - n === 1 ? '' : 's'}`);
			if (isLand(h.propertyType) && h.kind !== 'CHILD' && roomPhotoCount(h) < 1) out.push('One on-site photo of the land (posters don’t count)');
			return out;
		}
	},
	{
		key: 'location',
		title: 'Location and contact',
		blurb: 'Pin the property and choose the number renters can call',
		applies: () => true,
		missing: (h) => {
			const out: string[] = [];
			if (!h.latitude || !h.longitude) out.push('Map pin');
			else if (!h.state && !h.city) out.push('Town or state');
			if (!h.contact) out.push('Contact number');
			return out;
		}
	},
	{
		key: 'features',
		title: 'Features',
		blurb: 'Amenities and how electricity is billed',
		applies: (h) => !isLand(h.propertyType),
		missing: (h) => (h.facilities?.length ? [] : ['At least one feature'])
	},
	{
		key: 'price',
		title: 'Price and payout',
		blurb: 'What you charge and where Kushi pays you',
		applies: () => true,
		missing: (h) => {
			const out: string[] = [];
			if (!Number(h.price)) out.push('Price');
			if (h.listingType !== 'SALE' && !h.paymentInterval) out.push('How often rent is paid');
			if (showPayoutAccount(h.managementType) && !h.paymentDetails?.id) out.push('Payout account');
			return out;
		}
	},
	{
		key: 'agreement',
		title: 'Ownership and agreement',
		blurb: 'Your right to let it, the tenancy terms and your signature',
		applies: (h) => showTenancySteps(h.listingType, h.propertyType, h.managementType),
		missing: (h) => {
			const out = mandateMissing(h);
			if (!h.tenancyAgreementTemplate?.sections?.length) out.push('Tenancy terms');
			if (!h.host?.signature?.publicUrl) out.push('Your signature');
			return out;
		}
	},
	{
		key: 'publish',
		title: 'Name and publish',
		blurb: 'Title, description, a final check, then go live',
		applies: () => true,
		missing: (h) => {
			const out: string[] = [];
			if (!h.title?.trim() || PLACEHOLDER_TITLE.test(h.title)) out.push('A title');
			if ((h.description?.trim().length ?? 0) < MIN_DESCRIPTION) out.push('A description');
			return out;
		}
	}
];

export type StepState = StepDef & { index: number; total: number; done: boolean; left: string[] };

/** The steps that apply to this listing, with their state. A missing hosting (new listing) gets every default step. */
export function stepsFor(h?: Hosting | null): StepState[] {
	const list = h ? STEPS.filter((s) => s.applies(h)) : STEPS;
	return list.map((s, index) => {
		const left = h ? s.missing(h) : ['Not started'];
		return { ...s, index, total: list.length, left, done: left.length === 0 };
	});
}

export function stepOf(h: Hosting | null | undefined, key: StepKey): StepState | undefined {
	return stepsFor(h).find((s) => s.key === key);
}

/** The step after `key` that applies to this listing. */
export function nextStep(h: Hosting | null | undefined, key: StepKey): StepKey | null {
	const list = stepsFor(h);
	const i = list.findIndex((s) => s.key === key);
	return i >= 0 && i < list.length - 1 ? list[i + 1].key : null;
}

/** Everything before "publish" that is still unfinished — the publish gate. */
export function blockers(h: Hosting): StepState[] {
	return stepsFor(h).filter((s) => !s.done);
}

export const stepHref = (key: StepKey, id: string) => `/hostings/form/${key}?id=${id}` as Href;
export const hubHref = (id: string) => `/hostings/form/onboarding?id=${id}` as Href;

export const agentManaged = (h?: Hosting | null) => isAgentManaged(h?.managementType);
