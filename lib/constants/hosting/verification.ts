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
 * Unverified -> Identity -> Address -> Owner -> Kushi Vetted.
 *
 * `Unverified` is omitted from the request picker — it's a derived state,
 * not something the host requests.
 */
export const VERIFICATION_TIER_OPTIONS: {
  value: HostingVerificationTier;
  label: string;
  description: string;
}[] = [
  {
    value: HostingVerificationTier.IdentityVerified,
    label: 'Identity Verified',
    description: 'BVN + NIN match the host profile.',
  },
  {
    value: HostingVerificationTier.AddressVerified,
    label: 'Address Verified',
    description: 'Utility bill + on-site possession confirmed.',
  },
  {
    value: HostingVerificationTier.OwnerVerified,
    label: 'Owner Verified',
    description: 'Title document + survey plan cross-checked with the land registry.',
  },
  {
    value: HostingVerificationTier.KushiVetted,
    label: 'Kushi Vetted',
    description: 'Building plan compliance + on-site Kushi inspection.',
  },
];

