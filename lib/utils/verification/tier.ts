import { HostingVerificationTier } from '@/lib/services/graphql/generated';

/**
 * Ordered progression of verification tiers, lowest to highest.
 * The index of a tier in this array is its rank.
 */
export const TIER_PROGRESSION: HostingVerificationTier[] = [
  HostingVerificationTier.Unverified,
  HostingVerificationTier.IdentityVerified,
  HostingVerificationTier.AddressVerified,
  HostingVerificationTier.TitleChecked,
  HostingVerificationTier.KushiVetted,
];

/**
 * Human-readable label for a tier, used in card titles, badges, etc.
 *
 * Sprint 1.9: customer-facing labels updated to match the team's
 * consensus — `ID Verified` (was `Identity Verified`),
 * `Address Verified` (was `Title Submitted`),
 * `Title Checked` (was `Owner Verified`).
 */
export function formatTierLabel(tier: HostingVerificationTier): string {
  switch (tier) {
    case HostingVerificationTier.IdentityVerified:
      return 'ID Verified';
    case HostingVerificationTier.AddressVerified:
      return 'Address Verified';
    case HostingVerificationTier.TitleChecked:
      return 'Title Checked';
    case HostingVerificationTier.KushiVetted:
      return 'Kushi Vetted';
    default:
      return 'Unverified';
  }
}

/**
 * Short tagline for each tier — used in the tier-ladder hero and the
 * request screen so the user sees the WHY of each tier at a glance.
 */
export const TIER_TAGLINES: Record<HostingVerificationTier, string> = {
  [HostingVerificationTier.Unverified]: 'Not yet started — guests see your listing as unverified.',
  [HostingVerificationTier.IdentityVerified]:
    'BVN + NIN match your profile. Auto-granted after KYC.',
  [HostingVerificationTier.AddressVerified]:
    'Title documents uploaded (C of O / Deed / Survey). Awaiting registry check.',
  [HostingVerificationTier.TitleChecked]:
    'Title document + survey plan cross-checked with the land registry (AGIS / e-GIS / state).',
  [HostingVerificationTier.KushiVetted]:
    'Building-plan compliance + Kushi inspection. Top-tier badge on listings.',
};

/**
 * Returns the next tier a host can request, or `null` if they're already
 * at the top.
 */
export function nextTier(current: HostingVerificationTier): HostingVerificationTier | null {
  const rank = TIER_PROGRESSION.indexOf(current);
  if (rank === -1 || rank === TIER_PROGRESSION.length - 1) return null;
  return TIER_PROGRESSION[rank + 1];
}
