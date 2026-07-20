import { ListingType, ManagementType } from '@/lib/services/graphql/generated';
import { PropertyType } from '@/lib/types/enums/hostings';

/** Agent-managed = advertise-only: Kushi doesn't transact, so the on-platform
 *  steps (tenancy agreement, mandate, signature, payout) are all skipped. */
export function isAgentManaged(managementType?: string | null): boolean {
  return managementType === ManagementType.AgentManaged;
}

/**
 * Whether the tenancy agreement & mandate steps should be shown.
 * Only for RENT listings (not sale), non-land-plot, and Kushi-managed
 * properties — agent-managed listings never carry a tenancy agreement.
 */
export function showTenancySteps(
  listingType?: string | null,
  propertyType?: string | null,
  managementType?: string | null,
): boolean {
  if (isAgentManaged(managementType)) return false;
  if (listingType === ListingType.Sale) return false;
  if (propertyType === PropertyType.LandPlots) return false;
  return true;
}

/**
 * Whether the amenities / features step should be shown.
 * Land plots have no buildings — no amenities to list.
 */
export function showAmenitiesStep(propertyType?: string | null): boolean {
  if (propertyType === PropertyType.LandPlots) return false;
  return true;
}

/**
 * Whether to collect payout bank-account details. Agent-managed listings take
 * no on-platform payment, so there's nothing to pay out.
 */
export function showPayoutAccount(managementType?: string | null): boolean {
  return !isAgentManaged(managementType);
}
