import React from 'react';
import { usePropertyTypesQuery } from '@/lib/services/graphql/generated';
import {
  FACILITIES_BY_VARIANT,
  PROPERTY_TYPE,
  PROPERTY_TYPE_SEARCH_TERMS,
  PropertyType,
  ROOMS_BY_VARIANT,
} from '@/lib/types/enums/hostings';

export type PropertyTypeConfig = {
  value: string;
  label: string;
  searchTerms: string[];
  rooms: string[];
  facilities: string[];
  category?: string | null;
  icon?: string | null;
};

// Bundled fallback, built from the shipped constants (mirrors the server seed).
// Used until/if the server list loads, and offline — so the app never hard
// depends on the network for these static-ish values.
const FALLBACK: PropertyTypeConfig[] = (PROPERTY_TYPE as string[]).map((value) => ({
  value,
  label: value,
  searchTerms: PROPERTY_TYPE_SEARCH_TERMS[value as PropertyType] ?? [],
  rooms: ROOMS_BY_VARIANT.filter((r) => r.hostingVariants.includes(value as PropertyType)).map(
    (r) => r.room as string,
  ),
  facilities: FACILITIES_BY_VARIANT.filter((f) =>
    f.hostingVariants.includes(value as PropertyType),
  ).map((f) => f.facility as string),
}));

/**
 * The canonical property types (+ per-type rooms/facilities) from the server's
 * admin-editable source of truth, with the bundled constants as a fallback.
 * See sprints/app-constants-plan.md.
 */
export const usePropertyTypeConfig = () => {
  const [{ data, fetching }] = usePropertyTypesQuery({ requestPolicy: 'cache-and-network' });

  const propertyTypes = React.useMemo<PropertyTypeConfig[]>(() => {
    const server = data?.propertyTypes;
    if (server && server.length > 0) {
      return server.map((p) => ({
        value: p.value,
        label: p.label,
        searchTerms: p.searchTerms ?? [],
        rooms: p.rooms ?? [],
        facilities: p.facilities ?? [],
        category: p.category,
        icon: p.icon,
      }));
    }
    return FALLBACK;
  }, [data]);

  const roomsFor = React.useCallback(
    (type?: string | null): string[] => propertyTypes.find((p) => p.value === type)?.rooms ?? [],
    [propertyTypes],
  );

  const facilitiesFor = React.useCallback(
    (type?: string | null): string[] =>
      propertyTypes.find((p) => p.value === type)?.facilities ?? [],
    [propertyTypes],
  );

  return { propertyTypes, roomsFor, facilitiesFor, fetching };
};
