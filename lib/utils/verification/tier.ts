import { HostingVerificationTier } from '@/lib/services/graphql/generated';

/**
 * Ordered progression of verification tiers, lowest to highest.
 * The index of a tier in this array is its rank.
 */
export const TIER_PROGRESSION: HostingVerificationTier[] = [
  HostingVerificationTier.Unverified,
  HostingVerificationTier.IdentityVerified,
  HostingVerificationTier.TitleSubmitted,
  HostingVerificationTier.TitleChecked,
  HostingVerificationTier.KushiVetted,
];

/**
 * Human-readable label for a tier, used in card titles, badges, etc.
 *
 * Sprint 1.9: customer-facing labels updated to match the team's
 * consensus — `ID Verified` (was `Identity Verified`),
 * `Title Submitted` (was `Address Verified`),
 * `Title Checked` (was `Owner Verified`).
 */
export function formatTierLabel(tier: HostingVerificationTier): string {
  switch (tier) {
    case HostingVerificationTier.IdentityVerified:
      return 'ID Verified';
    case HostingVerificationTier.TitleSubmitted:
      return 'Title Submitted';
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
  [HostingVerificationTier.Unverified]:
    'Not yet started — guests see your listing as unverified.',
  [HostingVerificationTier.IdentityVerified]:
    'BVN + NIN match your profile. Auto-granted after KYC.',
  [HostingVerificationTier.TitleSubmitted]:
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

/**
 * `admin_verification_tier.document_requirements` is stored as `json` on
 * the server. The admin may have entered it as:
 *   1. A JSON array of strings, e.g. `["Government ID", "Utility bill"]`
 *   2. A JSON array of objects with `{name, ...}`
 *   3. A JSON-encoded string of either of the above
 *   4. A single string the admin typed into the textbox
 *
 * This helper normalises every shape to `string[]` so the mobile UI can
 * render a simple checklist without having to know about the server's
 * storage quirks.
 */
export function parseDocumentRequirements(input: unknown): string[] {
  if (input == null) return [];
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed.length === 0) return [];
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        return parseDocumentRequirements(JSON.parse(trimmed));
      } catch {
        return [trimmed];
      }
    }
    return [trimmed];
  }
  if (Array.isArray(input)) {
    return input
      .map((entry) => {
        if (typeof entry === 'string') return entry;
        if (entry && typeof entry === 'object' && 'name' in entry && typeof (entry as { name: unknown }).name === 'string') {
          return (entry as { name: string }).name;
        }
        return null;
      })
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
  }
  if (typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    if (typeof obj.name === 'string') return [obj.name];
  }
  return [];
}
