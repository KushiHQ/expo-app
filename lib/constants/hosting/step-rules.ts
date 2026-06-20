import { ListingType } from '@/lib/services/graphql/generated';
import { PropertyType } from '@/lib/types/enums/hostings';

/**
 * Whether the tenancy agreement & mandate steps should be shown.
 * Only relevant for RENT listings (not sale) and non-land-plot properties.
 */
export function showTenancySteps(
  listingType?: string | null,
  propertyType?: string | null,
): boolean {
  if (listingType === ListingType.Sale) return false;
  if (propertyType === PropertyType.LandPlots) return false;
  return true;
}

/**
 * Whether the amenities / features step should be shown.
 * Land plots have no buildings — no amenities to list.
 */
export function showAmenitiesStep(
  propertyType?: string | null,
): boolean {
  if (propertyType === PropertyType.LandPlots) return false;
  return true;
}
