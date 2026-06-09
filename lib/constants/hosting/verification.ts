import {
  HostingPropertyRelationship,
  HostingVerificationTier,
} from '@/lib/services/graphql/generated';

export const HOSTING_VERIFICATION_OPTIONS: {
  label: keyof typeof HostingPropertyRelationship;
  value: HostingPropertyRelationship;
  description?: string;
}[] = [
  {
    label: 'Agent',
    value: HostingPropertyRelationship.Agent,
    description: 'I am the legal owner of this property with full rights to lease it.',
  },
  {
    label: 'Landlord',
    value: HostingPropertyRelationship.Landlord,
    description:
      'I am an attorney or agent with a direct mandate from the owner to manage this property.',
  },
  {
    label: 'Subletter',
    value: HostingPropertyRelationship.Subletter,
    description:
      'I am a tenant with a valid lease and written permission from my landlord to sublet this space.',
  },
];

/**
 * Ordered list of tiers a host can request. The order matches the
 * `admin_verification_tier` table and is the recommended progression:
 * Unverified -> ID Verified -> Address Verified -> Title Checked -> Kushi Vetted.
 *
 * `Unverified` is omitted from the request picker — it's a derived state,
 * not something the host requests.
 *
 * Sprint 1.9: customer-facing labels updated to match the team's
 * consensus — `ID Verified` (was `Identity Verified`),
 * `Address Verified` (was `Title Submitted`),
 * `Title Checked` (was `Owner Verified`).
 */
export const VERIFICATION_TIER_OPTIONS: {
  value: HostingVerificationTier;
  label: string;
  description: string;
}[] = [
  {
    value: HostingVerificationTier.IdentityVerified,
    label: 'ID Verified',
    description: 'BVN + NIN match the host profile. Auto-granted after KYC.',
  },
  {
    value: HostingVerificationTier.AddressVerified,
    label: 'Address Verified',
    description:
      'Title documents uploaded (C of O / R of O / Deed of Assignment / Survey Plan).',
  },
  {
    value: HostingVerificationTier.TitleChecked,
    label: 'Title Checked',
    description:
      'Registry search clean: AGIS for FCT, Lagos e-GIS for Lagos, state registry elsewhere.',
  },
  {
    value: HostingVerificationTier.KushiVetted,
    label: 'Kushi Vetted',
    description: 'Building plan compliance + on-site Kushi inspection.',
  },
];

