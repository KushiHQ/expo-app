import { cacheExchange, type Cache } from '@urql/exchange-graphcache';

/**
 * Normalized cache (replaces urql's coarse document cache — see
 * sprints/expo-state-freshness-plan.md). Entities are keyed by `id`, so any
 * mutation that returns an updated entity (e.g. createOrUpdateHosting returning
 * a Hosting with a new publishStatus) updates it in-place across every query
 * instantly — no refetch, no stale UI.
 *
 * The `Response<T>` / MessageResponse wrappers carry no id and must NOT be
 * normalized, or graphcache would collapse unrelated results together.
 */
const NON_KEYED = [
  'MessageResponse',
  'AuthTokenResponse',
  'BoolResponse',
  'HostResponse',
  'GuestResponse',
  'UserResponse',
  'ProfileResponse',
  'HostAccountDetailsResponse',
  'HostingResponse',
  'HostingReviewResponse',
  'HostingRoomResponse',
  'HostingRoomImageResponse',
  'HostingVerificationResponse',
  'HostingVerificationRequestResponse',
  'BookingResponse',
  'BookingApplicationResponse',
  'TransactionResponse',
  'CautionClaimResponse',
  'CautionRefundResponse',
  'VideoWalkthroughResponse',
  'TitleMetadataResponse',
  'PhoneNumberResponse',
  'NotificationSettingsResponse',
  'SavedHostingResponse',
  'SavedHostingFolderResponse',
  'ContactResponse',
  'FieldInteractionResponse',
  'InteractionResponse',
  'InteractionResponseResponse',
  'FieldScriptResponse',
  'FieldScriptStepResponse',
  'BookingAssistResponse',
  'BookingAssistEventResponse',
  'AdminFeeConfigResponse',
  'AdminVerificationTierResponse',
  'AdminPropertyTypeResponse',
];

// Types that graphcache should always EMBED under their parent (never normalize),
// so the same object isn't normalized in one query and embedded in another —
// that inconsistency serves stale/partial data after navigation. Two groups:
//   1. Owned value objects with no standalone identity (Profile, Kyc, …).
//   2. Content/config entities that ARE often selected without `id` across the
//      app (Asset, HostingRoomImage, PropertyTypeConfig). We don't rely on their
//      normalization — image edits/room changes reconcile via query refetch and
//      the asset.lastUpdated cache-bust — so embedding them consistently is
//      correct and silences the "no key could be generated" warnings.
const EMBEDDED = [
  'Profile',
  'Kyc',
  'KycStatus',
  'HostingReviewAverage',
  'Bank',
  'Asset',
  'HostingRoomImage',
  'PropertyTypeConfig',
  // Tenancy-agreement template value objects: a template and its clause
  // variables/values carry no `id` (SubClause itself is keyed and stays so).
  // They're always read nested under a Hosting/SubClause, so embed them.
  'TenancyTemplate',
  'SubClauseVariable',
  'SubClauseValue',
  // Host-analytics value objects (hostAnalytics + its revenue/growth series):
  // aggregates and time-series points with no `id`, always read nested.
  'HostAnalytics',
  'TimeSeriesData',
  'AnalyticsDataPoint',
];

const keys = Object.fromEntries([...NON_KEYED, ...EMBEDDED].map((t) => [t, () => null])) as Record<
  string,
  () => null
>;

/**
 * Force-refetch specific `Query` fields. Used for mutations that change nested
 * lists (a hosting's rooms/images/video, a saved list) — graphcache can update
 * an entity's scalar fields by id automatically, but it can't know an item was
 * added to / removed from / moved between a list, so we invalidate the owning
 * queries and let them re-fetch fresh.
 */
function invalidateQueries(cache: Cache, fieldNames: string[]) {
  cache
    .inspectFields('Query')
    .filter((field) => fieldNames.includes(field.fieldName))
    .forEach((field) => cache.invalidate('Query', field.fieldName, field.arguments));
}

const HOSTING_QUERIES = ['hosting', 'hostings', 'authHostings'];
const SAVED_QUERIES = ['savedHostings', 'savedHostingFolders'];

const invalidateHosting = (_r: unknown, _a: unknown, cache: Cache) =>
  invalidateQueries(cache, HOSTING_QUERIES);
const invalidateSaved = (_r: unknown, _a: unknown, cache: Cache) =>
  invalidateQueries(cache, [...SAVED_QUERIES, ...HOSTING_QUERIES]);

export const graphcacheExchange = cacheExchange({
  keys,
  updates: {
    Mutation: {
      // Nested room/image/video list changes → refetch the owning hosting queries.
      moveHostingRoomImages: invalidateHosting,
      deleteHostingRoomImage: invalidateHosting,
      createHostingRoomImage: invalidateHosting,
      reorderHostingRoomImages: invalidateHosting,
      setHostingCoverImage: invalidateHosting,
      createOrUpdateHostingRoom: invalidateHosting,
      deleteHostingRoom: invalidateHosting,
      reorderHostingRooms: invalidateHosting,
      setHostingVideo: invalidateHosting,
      // New / removed listings → refetch the listing collections.
      duplicateHosting: invalidateHosting,
      deleteHosting: invalidateHosting,
      // Saved state also flips the `saved` flag shown on hosting cards.
      createUpdateSavedHosting: invalidateSaved,
      deleteSavedHosting: invalidateSaved,
      deleteSavedHostingFolder: invalidateSaved,
      createUpdateSavedHostingFolder: invalidateSaved,
    },
  },
});
