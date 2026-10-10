import { HostingVerificationTier as T } from '@/lib/services/graphql/generated';

/** Trust ladder, lowest → highest. Matches the backend's ordinal tier filter. */
export const TIER_ORDER: T[] = [T.Unverified, T.IdentityVerified, T.AddressVerified, T.TitleChecked, T.KushiVetted];

export const TIERS: Record<T, { label: string; short: string; tone: 'neutral' | 'info' | 'success' | 'live'; what: string }> = {
	[T.Unverified]: {
		label: 'Unverified',
		short: 'Unverified',
		tone: 'neutral',
		what: 'Kushi has not verified this listing yet.'
	},
	[T.IdentityVerified]: {
		label: 'Identity verified',
		short: 'ID verified',
		tone: 'info',
		what: "The host's identity has been checked against government records."
	},
	[T.AddressVerified]: {
		label: 'Address verified',
		short: 'Address verified',
		tone: 'info',
		what: 'Kushi has confirmed the property exists at this address.'
	},
	[T.TitleChecked]: {
		label: 'Title checked',
		short: 'Title checked',
		tone: 'success',
		what: "The host's right to let or sell this property has been checked."
	},
	[T.KushiVetted]: {
		label: 'Kushi vetted',
		short: 'Kushi vetted',
		tone: 'live',
		what: 'Inspected and vetted by the Kushi team — our highest level of trust.'
	}
};

export const tierRank = (t: T | null | undefined) => (t ? TIER_ORDER.indexOf(t) : 0);
