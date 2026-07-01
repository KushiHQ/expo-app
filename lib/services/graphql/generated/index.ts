import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Decimal: { input: any; output: any; }
  JSON: { input: any; output: any; }
  Upload: { input: any; output: any; }
};

export type AdminAuditLog = {
  __typename?: 'AdminAuditLog';
  auditType: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  meta: Scalars['String']['output'];
  staffEmail?: Maybe<Scalars['String']['output']>;
  staffId?: Maybe<Scalars['String']['output']>;
  staffName?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type AdminAuditLogConnection = {
  __typename?: 'AdminAuditLogConnection';
  items: Array<AdminAuditLog>;
  total: Scalars['Int']['output'];
};

/**
 * Enact a host decision on behalf of the host (accept / reject) — wraps the
 * existing `admin_update_booking_application_status`.
 */
export type AdminBookingAssistDecisionInput = {
  assistId: Scalars['String']['input'];
  /** `accept` | `reject`. */
  decision: Scalars['String']['input'];
};

/** Filters for the Booking Assist queue. */
export type AdminBookingAssistFilters = {
  /** Staff currently handling the assist. */
  handlerStaffId?: InputMaybe<Scalars['String']['input']>;
  /**
   * One of the assist statuses: `open` | `guest_contacted` | `awaiting_host`
   * | `host_decided` | `accepted_pending_payment` | `completed` | `rejected`
   * | `abandoned`.
   */
  status?: InputMaybe<Scalars['String']['input']>;
  /** Only assists that currently have no handler (need pickup). */
  unhandledOnly?: InputMaybe<Scalars['Boolean']['input']>;
};

export type AdminCompleteFieldInteractionInput = {
  interactionId: Scalars['String']['input'];
  /**
   * One of `interested` | `not_interested` | `call_back` | `listed` |
   * `no_answer` | `wrong_number`.
   */
  outcome: Scalars['String']['input'];
  summaryNote?: InputMaybe<Scalars['String']['input']>;
};

/** Optional contact fields for inline creation / standalone create. */
export type AdminCreateContactInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

/** Create a brand-new script for an interaction type. */
export type AdminCreateFieldScriptInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  /** One of `onboarding_call` | `in_person_meeting` | `host_booking_call`. */
  interactionType: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

/** Append (default) or insert a step into a script. */
export type AdminCreateFieldScriptStepInput = {
  /** Defaults to true server-side when omitted (only meaningful for questions). */
  aiSuggestionsEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  content: Scalars['String']['input'];
  /** Insert position. Defaults to append (max order_index + 1) when omitted. */
  orderIndex?: InputMaybe<Scalars['Int']['input']>;
  scriptId: Scalars['String']['input'];
  /** One of `guidance` | `question`. */
  stepType: Scalars['String']['input'];
};

export type AdminCreateRoleInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  permissions: Array<Scalars['String']['input']>;
};

export type AdminDashboardStats = {
  __typename?: 'AdminDashboardStats';
  activeBookings: Scalars['Int']['output'];
  activeListings: Scalars['Int']['output'];
  disputedClaims: Scalars['Int']['output'];
  pendingVerifications: Scalars['Int']['output'];
};

export type AdminFeeConfig = {
  __typename?: 'AdminFeeConfig';
  /** Days a guest has to pay after acceptance before the spot may be released. */
  bookingPaymentWindowDays: Scalars['Int']['output'];
  /** Days after tenancy expiry within which the host may file new caution claims. */
  cautionClaimWindowDays: Scalars['Int']['output'];
  /** Kushi's escrow custody fee as a % of the caution fee, charged upfront. */
  cautionCustodyFeePercent: Scalars['Float']['output'];
  /** Fixed mediation fee deducted from caution pot when a claim is disputed (NGN). */
  cautionDisputeFee: Scalars['Float']['output'];
  id: Scalars['String']['output'];
  /** Platform contribution charged to guests on secure lease bookings (% of total rent). */
  secureLeaseGuestContributionPercent: Scalars['Float']['output'];
  /** Platform fee charged to guests on short-let bookings (% of total rent). */
  shortLetGuestChargesPercent: Scalars['Float']['output'];
  /** Platform fee charged to hosts on short-let bookings (% of total rent). */
  shortLetHostChargesPercent: Scalars['Float']['output'];
  /** Fixed legal fee charged per booking (NGN). */
  standardLegalFee: Scalars['Float']['output'];
};

export type AdminFeeConfigResponse = {
  __typename?: 'AdminFeeConfigResponse';
  data?: Maybe<AdminFeeConfig>;
  message: Scalars['String']['output'];
};

/** Filters for the shared records table. */
export type AdminFieldInteractionFilters = {
  /** RFC3339 lower bound (inclusive) on created_at. */
  createdAfter?: InputMaybe<Scalars['String']['input']>;
  /** RFC3339 upper bound (inclusive) on created_at. */
  createdBefore?: InputMaybe<Scalars['String']['input']>;
  interactionType?: InputMaybe<Scalars['String']['input']>;
  outcome?: InputMaybe<Scalars['String']['input']>;
  staffId?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type AdminHostInfo = {
  __typename?: 'AdminHostInfo';
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
};

export type AdminInviteStaffInput = {
  email: Scalars['String']['input'];
  permissions?: InputMaybe<Array<Scalars['String']['input']>>;
  roleId?: InputMaybe<Scalars['String']['input']>;
  roleLabel?: InputMaybe<Scalars['String']['input']>;
};

export type AdminKyc = {
  __typename?: 'AdminKyc';
  bvnVerified?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['String']['output'];
  idDocumentType?: Maybe<Scalars['String']['output']>;
  kycReferenceId?: Maybe<Scalars['String']['output']>;
  lastUpdated: Scalars['String']['output'];
  ninVerified?: Maybe<Scalars['Boolean']['output']>;
};

export type AdminLegalConfig = {
  __typename?: 'AdminLegalConfig';
  /** Notice period required before exercising the break clause. */
  breakNoticePeriod: Scalars['String']['output'];
  /** Days after lease end within which the caution deposit must be refunded. */
  cautionRefundDays: Scalars['Int']['output'];
  /** Grace period (days) before forfeiture proceedings begin. */
  forfeitureGracePeriodDays: Scalars['Int']['output'];
  /** Grace period (days) after rent due date before late fees apply. */
  gracePeriodDays: Scalars['Int']['output'];
  /** Maximum consecutive days an approved guest may stay. */
  guestStayDays: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  /** Minimum notice in hours before a landlord inspection. */
  inspectionNoticeDays: Scalars['Int']['output'];
  /** Annual interest rate (%) charged on overdue rent. */
  latePaymentInterestRate: Scalars['Float']['output'];
  /** Agency legal fee as a percentage of annual rent (Nigerian standard: 10%). */
  legalFeePercentage: Scalars['Float']['output'];
  /** Monthly mesne profit rate (% of rent) for holding over after expiry. */
  mesneProfitRate: Scalars['Float']['output'];
  /** Minimum occupation before the break clause can be invoked. */
  minimumOccupationPeriod: Scalars['String']['output'];
  /** Notice period (months) required to renew the tenancy. */
  renewalNoticeMonths: Scalars['Int']['output'];
};

/** Record an ad-hoc note / event onto the assist timeline. */
export type AdminLogBookingAssistEventInput = {
  assistId: Scalars['String']['input'];
  /** One of `guest` | `host` | `guest_followup` | `general`. */
  leg?: InputMaybe<Scalars['String']['input']>;
  /** Free-form note shown on the audit timeline. */
  note: Scalars['String']['input'];
};

export type AdminMonthlyGrowthPoint = {
  __typename?: 'AdminMonthlyGrowthPoint';
  /**
   * Distinct users with marketplace activity that month (transactions,
   * booking applications, or listings created). Proxy metric: session
   * history is not retained, so login-based MAU is unavailable.
   */
  activeUsers: Scalars['Int']['output'];
  /** Calendar month in YYYY-MM (UTC). */
  month: Scalars['String']['output'];
  newBookings: Scalars['Int']['output'];
  newHostings: Scalars['Int']['output'];
  newUsers: Scalars['Int']['output'];
  /**
   * Platform revenue in NGN: guest + host service charges and caution
   * custody fees on bookings paid that month.
   */
  revenue: Scalars['Decimal']['output'];
  /**
   * Net payment volume in NGN: successful guest booking payments minus
   * cancellation refunds, by transaction month.
   */
  volume: Scalars['Decimal']['output'];
};

export type AdminPhoneNumber = {
  __typename?: 'AdminPhoneNumber';
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isPrimary: Scalars['Boolean']['output'];
  isVerified: Scalars['Boolean']['output'];
  phoneNumber: Scalars['String']['output'];
};

/** Full admin view of a property type (includes id / sequence / active). */
export type AdminPropertyType = {
  __typename?: 'AdminPropertyType';
  category?: Maybe<Scalars['String']['output']>;
  facilities: Array<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  label: Scalars['String']['output'];
  rooms: Array<Scalars['String']['output']>;
  searchTerms: Array<Scalars['String']['output']>;
  sequence: Scalars['Int']['output'];
  value: Scalars['String']['output'];
};

/**
 * Admin create/update for a property type (+ its potential rooms/facilities).
 * See sprints/app-constants-plan.md.
 */
export type AdminPropertyTypeInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  facilities: Array<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  /** Present = update (the `value` is immutable); absent = create. */
  id?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  label: Scalars['String']['input'];
  rooms: Array<Scalars['String']['input']>;
  searchTerms: Array<Scalars['String']['input']>;
  sequence?: InputMaybe<Scalars['Int']['input']>;
  value: Scalars['String']['input'];
};

export type AdminPropertyTypeResponse = {
  __typename?: 'AdminPropertyTypeResponse';
  data?: Maybe<AdminPropertyType>;
  message: Scalars['String']['output'];
};

export type AdminRecordInteractionResponseInput = {
  /** One of `favourable` | `medium` | `bad`, if a suggestion was tapped. */
  aiSuggestionUsed?: InputMaybe<Scalars['String']['input']>;
  answerText?: InputMaybe<Scalars['String']['input']>;
  contextNote?: InputMaybe<Scalars['String']['input']>;
  interactionId: Scalars['String']['input'];
  /** Source script step, when the question came from the script. Null for ad-hoc. */
  questionStepId?: InputMaybe<Scalars['String']['input']>;
  /** Snapshot of the question as it was asked. */
  questionText: Scalars['String']['input'];
};

/** Reorder a script's steps; `order_index` is set by array position. */
export type AdminReorderFieldScriptStepsInput = {
  orderedStepIds: Array<Scalars['String']['input']>;
  scriptId: Scalars['String']['input'];
};

export type AdminReviewHostingVerificationRequestInput = {
  details?: InputMaybe<Scalars['String']['input']>;
  requestId: Scalars['String']['input'];
  status: HostingVerificationRequestStatus;
};

export type AdminStartFieldInteractionInput = {
  /** Inline contact details, used when `contact_id` is not provided. */
  contact?: InputMaybe<AdminCreateContactInput>;
  /** Existing contact to attach this interaction to. */
  contactId?: InputMaybe<Scalars['String']['input']>;
  /** One of `onboarding_call` | `in_person_meeting` | `host_booking_call`. */
  interactionType: Scalars['String']['input'];
};

/**
 * Capture guest/host fields and the preferred key-handover date on an assist.
 * All fields are optional; only provided fields are updated. Setting
 * `preferred_key_handover_date` also relays it onto the booking_application.
 */
export type AdminUpdateBookingAssistInput = {
  assistId: Scalars['String']['input'];
  guestCanPay?: InputMaybe<Scalars['Boolean']['input']>;
  guestConfirmed?: InputMaybe<Scalars['Boolean']['input']>;
  hostConfirmedAvailability?: InputMaybe<Scalars['Boolean']['input']>;
  /** `accept` | `reject` — the host's stated decision (captured, not enacted). */
  hostDecision?: InputMaybe<Scalars['String']['input']>;
  /** ISO `YYYY-MM-DD`. Stored on the assist and relayed onto the application. */
  preferredKeyHandoverDate?: InputMaybe<Scalars['String']['input']>;
  /** Optionally advance the assist status (validated against the known set). */
  status?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Update a script's metadata. Setting `is_active = true` deactivates sibling
 * scripts of the same interaction type so only one stays active per type.
 */
export type AdminUpdateFieldScriptInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  scriptId: Scalars['String']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
};

/** Edit / enable-disable a single step. */
export type AdminUpdateFieldScriptStepInput = {
  aiSuggestionsEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  stepId: Scalars['String']['input'];
  /** One of `guidance` | `question`. */
  stepType?: InputMaybe<Scalars['String']['input']>;
};

export type AdminUpdateHostingVerificationRequestDetailsInput = {
  details: Scalars['String']['input'];
  requestId: Scalars['String']['input'];
};

export type AdminUpdateRoleInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  permissions?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type AdminUpdateStaffInput = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  permissions?: InputMaybe<Array<Scalars['String']['input']>>;
  roleId?: InputMaybe<Scalars['String']['input']>;
  roleLabel?: InputMaybe<Scalars['String']['input']>;
  staffId: Scalars['String']['input'];
};

export type AdminUser = {
  __typename?: 'AdminUser';
  bookingsCount: Scalars['Int']['output'];
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  host?: Maybe<AdminHostInfo>;
  hostingsCount: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  isArchived: Scalars['Boolean']['output'];
  isDisabled: Scalars['Boolean']['output'];
  kushiId: Scalars['String']['output'];
  kyc?: Maybe<AdminKyc>;
  phoneNumbers: Array<AdminPhoneNumber>;
  profile?: Maybe<AdminUserProfile>;
};

export type AdminUserProfile = {
  __typename?: 'AdminUserProfile';
  createdAt: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
};

export type AdminVerificationTier = {
  __typename?: 'AdminVerificationTier';
  color: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  documentRequirements: Array<AdminVerificationTierDocumentRequirement>;
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  price?: Maybe<Scalars['Decimal']['output']>;
  tier: Scalars['String']['output'];
};

export type AdminVerificationTierDocumentRequirement = {
  __typename?: 'AdminVerificationTierDocumentRequirement';
  description: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type AdminVerificationTierDocumentRequirementInput = {
  description: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type AdminVerificationTierInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  documentRequirements?: InputMaybe<Array<AdminVerificationTierDocumentRequirementInput>>;
  price?: InputMaybe<Scalars['Decimal']['input']>;
  tier?: InputMaybe<Scalars['String']['input']>;
};

export type AdminVerificationTierResponse = {
  __typename?: 'AdminVerificationTierResponse';
  data?: Maybe<AdminVerificationTier>;
  message: Scalars['String']['output'];
};

export type AiSearchPrediction = {
  __typename?: 'AiSearchPrediction';
  filters: AiSearchPredictionFilter;
  summary: Scalars['String']['output'];
};

export type AiSearchPredictionFilter = {
  __typename?: 'AiSearchPredictionFilter';
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  facilities?: Maybe<Array<Scalars['String']['output']>>;
  maxPrice?: Maybe<Scalars['Decimal']['output']>;
  minPrice?: Maybe<Scalars['Decimal']['output']>;
  propertyType?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
};

export type AnalyticsDataPoint = {
  __typename?: 'AnalyticsDataPoint';
  amount: Scalars['Decimal']['output'];
  label: Scalars['String']['output'];
};

export type AppleAuthInput = {
  /** Only present on the user's very first Apple Sign In */
  fullName?: InputMaybe<Scalars['String']['input']>;
  identityToken: Scalars['String']['input'];
};

export type Asset = {
  __typename?: 'Asset';
  contentType?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  key: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  originalFilename?: Maybe<Scalars['String']['output']>;
  publicUrl: Scalars['String']['output'];
  secureUrl: Scalars['String']['output'];
  sizeBytes: Scalars['Int']['output'];
};

export type AuthToken = {
  __typename?: 'AuthToken';
  expiresAt: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
  token: Scalars['String']['output'];
  user: User;
};

export type AuthTokenResponse = {
  __typename?: 'AuthTokenResponse';
  data?: Maybe<AuthToken>;
  message: Scalars['String']['output'];
};

export type Bank = {
  __typename?: 'Bank';
  active: Scalars['Boolean']['output'];
  code: Scalars['String']['output'];
  currency: Scalars['String']['output'];
  image: Scalars['String']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

export type Booking = {
  __typename?: 'Booking';
  amount: Scalars['Decimal']['output'];
  bookingApplication: BookingApplication;
  bookingReference: Scalars['String']['output'];
  cautionCustodyFee?: Maybe<Scalars['Decimal']['output']>;
  cautionFee?: Maybe<Scalars['Decimal']['output']>;
  commencementDate?: Maybe<Scalars['String']['output']>;
  correspondenceAddress?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  durationDescription?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  expiresAt?: Maybe<Scalars['String']['output']>;
  expiryDate?: Maybe<Scalars['String']['output']>;
  feeLineItems: Array<FeeLineItem>;
  fullName: Scalars['String']['output'];
  guest: Guest;
  guestServiceCharge: Scalars['Decimal']['output'];
  hostServiceCharge: Scalars['Decimal']['output'];
  hostTransaction?: Maybe<Transaction>;
  hosting: Hosting;
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  legalFee?: Maybe<Scalars['Decimal']['output']>;
  noteToHost?: Maybe<Scalars['String']['output']>;
  paymentMethod?: Maybe<Scalars['String']['output']>;
  paymentStatus: PaymentStatus;
  phoneNumber: Scalars['String']['output'];
  serviceCharge?: Maybe<Scalars['Decimal']['output']>;
  stampDuty?: Maybe<Scalars['Decimal']['output']>;
  status?: Maybe<BookingStatus>;
  tenancyAgreementAsset?: Maybe<Asset>;
  transaction?: Maybe<Transaction>;
  userReview?: Maybe<HostingReview>;
};

export type BookingApplication = {
  __typename?: 'BookingApplication';
  booking?: Maybe<Booking>;
  bookingAggrement?: Maybe<TenancyTemplate>;
  commencementDate?: Maybe<Scalars['String']['output']>;
  correspondenceAddress?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  email?: Maybe<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  guest: Guest;
  guestFormData?: Maybe<GuestFormData>;
  hosting: Hosting;
  id: Scalars['String']['output'];
  intervalMultiplier?: Maybe<Scalars['Int']['output']>;
  lastUpdated: Scalars['String']['output'];
  phoneNumber?: Maybe<Scalars['String']['output']>;
  status: BookingApplicationStatus;
  statusDetails?: Maybe<Scalars['String']['output']>;
};

export type BookingApplicationFilter = {
  authGuest?: InputMaybe<Scalars['Boolean']['input']>;
  authHost?: InputMaybe<Scalars['Boolean']['input']>;
  commencementDate?: InputMaybe<Scalars['String']['input']>;
  excludeStatuses?: InputMaybe<Array<BookingApplicationStatus>>;
  guestEmploymentStatus?: InputMaybe<GuestFormEmploymentStatus>;
  guestId?: InputMaybe<Scalars['String']['input']>;
  hostId?: InputMaybe<Scalars['String']['input']>;
  hostingId?: InputMaybe<Scalars['String']['input']>;
  incomeRanges?: InputMaybe<GuestFormIncomeRange>;
  intervalMultiplier?: InputMaybe<Scalars['Int']['input']>;
  occupancyTypes?: InputMaybe<GuestFormOccupancyType>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<BookingApplicationStatus>;
  statuses?: InputMaybe<Array<BookingApplicationStatus>>;
};

export type BookingApplicationResponse = {
  __typename?: 'BookingApplicationResponse';
  data?: Maybe<BookingApplication>;
  message: Scalars['String']['output'];
};

export enum BookingApplicationStatus {
  Accepted = 'ACCEPTED',
  AdminVerified = 'ADMIN_VERIFIED',
  Cancelled = 'CANCELLED',
  HostVerified = 'HOST_VERIFIED',
  InProgress = 'IN_PROGRESS',
  Rejected = 'REJECTED',
  Submited = 'SUBMITED',
  SystemVerified = 'SYSTEM_VERIFIED'
}

export type BookingApplicationStatusUpdateInput = {
  bookingApplicationId: Scalars['String']['input'];
  status: BookingApplicationStatus;
};

export type BookingApplicationSubmissionInput = {
  applicationId: Scalars['String']['input'];
  otp: Scalars['String']['input'];
};

export type BookingApplicationUpdateInput = {
  bookingAggrement?: InputMaybe<TenancyTemplateInput>;
  commencementDate?: InputMaybe<Scalars['String']['input']>;
  correspondenceAddress?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  fullName?: InputMaybe<Scalars['String']['input']>;
  guestFormData?: InputMaybe<GuestFormDataInput>;
  id: Scalars['String']['input'];
  intervalMultiplier?: InputMaybe<Scalars['Int']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};

/**
 * The assist case. The list view carries `context` (+ handler) so the queue can
 * render applicant/property/handler at a glance; the detail view additionally
 * carries the full `events` timeline.
 */
export type BookingAssist = {
  __typename?: 'BookingAssist';
  bookingApplicationId: Scalars['String']['output'];
  context?: Maybe<BookingAssistContext>;
  createdAt: Scalars['String']['output'];
  currentHandlerStaffId?: Maybe<Scalars['String']['output']>;
  events: Array<BookingAssistEvent>;
  guestCanPay: Scalars['Boolean']['output'];
  guestConfirmed: Scalars['Boolean']['output'];
  handler?: Maybe<BookingAssistHandler>;
  handlerSince?: Maybe<Scalars['String']['output']>;
  hostConfirmedAvailability: Scalars['Boolean']['output'];
  hostDecision?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  paymentExpiresAt?: Maybe<Scalars['String']['output']>;
  preferredKeyHandoverDate?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

/**
 * Lightweight applicant/property context embedded on the case so the admin can
 * run the call without extra round-trips. Read directly from the booking domain.
 */
export type BookingAssistContext = {
  __typename?: 'BookingAssistContext';
  applicantEmail?: Maybe<Scalars['String']['output']>;
  applicantName?: Maybe<Scalars['String']['output']>;
  applicantPhone?: Maybe<Scalars['String']['output']>;
  applicationId: Scalars['String']['output'];
  /** Key-handover date relayed onto the application (the relay target). */
  applicationPreferredKeyHandoverDate?: Maybe<Scalars['String']['output']>;
  applicationStatus?: Maybe<Scalars['String']['output']>;
  guestUserId?: Maybe<Scalars['String']['output']>;
  hostEmail?: Maybe<Scalars['String']['output']>;
  hostId?: Maybe<Scalars['String']['output']>;
  /**
   * Host contact details (from the host's user/profile/phone), so the assist
   * agent can reach the host without leaving the case.
   */
  hostName?: Maybe<Scalars['String']['output']>;
  hostPhone?: Maybe<Scalars['String']['output']>;
  hostUserId?: Maybe<Scalars['String']['output']>;
  hostingId: Scalars['String']['output'];
  propertyTitle?: Maybe<Scalars['String']['output']>;
};

export type BookingAssistEvent = {
  __typename?: 'BookingAssistEvent';
  assistId: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  detail?: Maybe<Scalars['String']['output']>;
  eventType: Scalars['String']['output'];
  id: Scalars['String']['output'];
  leg?: Maybe<Scalars['String']['output']>;
  staffId?: Maybe<Scalars['String']['output']>;
};

export type BookingAssistEventResponse = {
  __typename?: 'BookingAssistEventResponse';
  data?: Maybe<BookingAssistEvent>;
  message: Scalars['String']['output'];
};

export type BookingAssistHandler = {
  __typename?: 'BookingAssistHandler';
  email?: Maybe<Scalars['String']['output']>;
  handlerSince?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  staffId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type BookingAssistResponse = {
  __typename?: 'BookingAssistResponse';
  data?: Maybe<BookingAssist>;
  message: Scalars['String']['output'];
};

export type BookingFilterInput = {
  paymentStatus?: InputMaybe<PaymentStatus>;
};

export type BookingResponse = {
  __typename?: 'BookingResponse';
  data?: Maybe<Booking>;
  message: Scalars['String']['output'];
};

export enum BookingStatus {
  Canceled = 'CANCELED',
  Completed = 'COMPLETED',
  Paid = 'PAID'
}

export type BoolResponse = {
  __typename?: 'BoolResponse';
  data?: Maybe<Scalars['Boolean']['output']>;
  message: Scalars['String']['output'];
};

export enum CallType {
  Answered = 'ANSWERED',
  Cancel = 'CANCEL',
  Decline = 'DECLINE',
  Ended = 'ENDED',
  Video = 'VIDEO',
  Voice = 'VOICE'
}

export type CautionClaim = {
  __typename?: 'CautionClaim';
  adminNotes?: Maybe<Scalars['String']['output']>;
  amountRequested: Scalars['Decimal']['output'];
  bookingId: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  disputeFeeApplied: Scalars['Boolean']['output'];
  guestResponseNotes?: Maybe<Scalars['String']['output']>;
  hostNotes?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  resolvedAt?: Maybe<Scalars['String']['output']>;
  status: CautionClaimStatus;
};

export type CautionClaimResponse = {
  __typename?: 'CautionClaimResponse';
  data?: Maybe<CautionClaim>;
  message: Scalars['String']['output'];
};

export enum CautionClaimStatus {
  AdminApproved = 'ADMIN_APPROVED',
  AdminDeclined = 'ADMIN_DECLINED',
  GuestApproved = 'GUEST_APPROVED',
  GuestDisputed = 'GUEST_DISPUTED',
  PendingGuestResponse = 'PENDING_GUEST_RESPONSE',
  Released = 'RELEASED'
}

export type CautionRefund = {
  __typename?: 'CautionRefund';
  accountName: Scalars['String']['output'];
  accountNumber: Scalars['String']['output'];
  amount: Scalars['Decimal']['output'];
  bankCode: Scalars['String']['output'];
  bankName: Scalars['String']['output'];
  blockedReason?: Maybe<Scalars['String']['output']>;
  bookingId: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  status: CautionRefundStatus;
};

export type CautionRefundResponse = {
  __typename?: 'CautionRefundResponse';
  data?: Maybe<CautionRefund>;
  message: Scalars['String']['output'];
};

export enum CautionRefundStatus {
  Blocked = 'BLOCKED',
  Completed = 'COMPLETED',
  Processing = 'PROCESSING',
  Requested = 'REQUESTED'
}

export type CompletePasswordChangeInput = {
  email: Scalars['String']['input'];
  otp: Scalars['String']['input'];
  password1: Scalars['String']['input'];
  password2: Scalars['String']['input'];
};

export type Contact = {
  __typename?: 'Contact';
  createdAt: Scalars['String']['output'];
  createdByStaffId: Scalars['String']['output'];
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
};

export type ContactResponse = {
  __typename?: 'ContactResponse';
  data?: Maybe<Contact>;
  message: Scalars['String']['output'];
};

export type FeeLineItem = {
  __typename?: 'FeeLineItem';
  amount: Scalars['Decimal']['output'];
  description: Scalars['String']['output'];
  key: Scalars['String']['output'];
  label: Scalars['String']['output'];
};

export type Feedback = {
  __typename?: 'Feedback';
  adminNotes?: Maybe<Scalars['String']['output']>;
  body: Scalars['String']['output'];
  category?: Maybe<Scalars['String']['output']>;
  contactConsent: Scalars['Boolean']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  rating?: Maybe<Scalars['Int']['output']>;
  status: FeedbackStatus;
  title?: Maybe<Scalars['String']['output']>;
  type: FeedbackType;
  updatedAt: Scalars['String']['output'];
  user?: Maybe<User>;
};

export enum FeedbackStatus {
  Actioned = 'ACTIONED',
  Dismissed = 'DISMISSED',
  New = 'NEW',
  Reviewed = 'REVIEWED'
}

export enum FeedbackType {
  BugReport = 'BUG_REPORT',
  Complaint = 'COMPLAINT',
  FeatureRequest = 'FEATURE_REQUEST',
  General = 'GENERAL'
}

/**
 * List/detail representation of a field interaction. `contact` and `responses`
 * are embedded directly so callers can render the records table and the
 * call-taking screen without extra round trips.
 */
export type FieldInteraction = {
  __typename?: 'FieldInteraction';
  contact?: Maybe<Contact>;
  contactId: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  interactionType: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  outcome?: Maybe<Scalars['String']['output']>;
  responses: Array<InteractionResponse>;
  scriptId: Scalars['String']['output'];
  staffId: Scalars['String']['output'];
  status: Scalars['String']['output'];
  summaryNote?: Maybe<Scalars['String']['output']>;
};

export type FieldInteractionResponse = {
  __typename?: 'FieldInteractionResponse';
  data?: Maybe<FieldInteraction>;
  message: Scalars['String']['output'];
};

export type FieldScript = {
  __typename?: 'FieldScript';
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  interactionType: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  steps: Array<FieldScriptStep>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type FieldScriptResponse = {
  __typename?: 'FieldScriptResponse';
  data?: Maybe<FieldScript>;
  message: Scalars['String']['output'];
};

export type FieldScriptStep = {
  __typename?: 'FieldScriptStep';
  aiSuggestionsEnabled: Scalars['Boolean']['output'];
  content: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  orderIndex: Scalars['Int']['output'];
  scriptId: Scalars['String']['output'];
  stepType: Scalars['String']['output'];
};

export type FieldScriptStepResponse = {
  __typename?: 'FieldScriptStepResponse';
  data?: Maybe<FieldScriptStep>;
  message: Scalars['String']['output'];
};

export enum GoogleAuthTokenType {
  AccessToken = 'ACCESS_TOKEN',
  IdToken = 'ID_TOKEN'
}

export type Guest = {
  __typename?: 'Guest';
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  signature?: Maybe<Asset>;
  user: User;
};

export type GuestAnalytics = {
  __typename?: 'GuestAnalytics';
  fundsInEscrow: Scalars['Decimal']['output'];
  guest: Guest;
  hostingExpenditure: TimeSeriesData;
  pendingApplications: Scalars['Int']['output'];
  totalSpending: Scalars['Decimal']['output'];
  verificationStatus: Kyc;
};


export type GuestAnalyticsHostingExpenditureArgs = {
  lastNMonths?: InputMaybe<Scalars['Int']['input']>;
  lastNYears?: InputMaybe<Scalars['Int']['input']>;
  month?: InputMaybe<Scalars['Int']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

export type GuestFormData = {
  __typename?: 'GuestFormData';
  employmentStatus: GuestFormEmploymentStatus;
  guarantorAddress?: Maybe<Scalars['String']['output']>;
  guarantorName?: Maybe<Scalars['String']['output']>;
  guarantorPhone?: Maybe<Scalars['String']['output']>;
  guarantorRelationships?: Maybe<GuestFormGuarantorRelationships>;
  incomeRanges?: Maybe<GuestFormIncomeRange>;
  occupancyTypes: GuestFormOccupancyType;
};

export type GuestFormDataInput = {
  employmentStatus: GuestFormEmploymentStatus;
  guarantorAddress?: InputMaybe<Scalars['String']['input']>;
  guarantorName?: InputMaybe<Scalars['String']['input']>;
  guarantorPhone?: InputMaybe<Scalars['String']['input']>;
  guarantorRelationships?: InputMaybe<GuestFormGuarantorRelationships>;
  incomeRanges?: InputMaybe<GuestFormIncomeRange>;
  occupancyTypes: GuestFormOccupancyType;
};

export enum GuestFormEmploymentStatus {
  CorpMember = 'CORP_MEMBER',
  Employed = 'EMPLOYED',
  SelfEmployed = 'SELF_EMPLOYED',
  Student = 'STUDENT',
  Unemployed = 'UNEMPLOYED'
}

export enum GuestFormGuarantorRelationships {
  Clergy = 'CLERGY',
  Employer = 'EMPLOYER',
  Other = 'OTHER',
  Parent = 'PARENT',
  Sibling = 'SIBLING',
  Spouse = 'SPOUSE'
}

export enum GuestFormIncomeRange {
  High = 'HIGH',
  Low = 'LOW',
  Mid = 'MID',
  Vip = 'VIP'
}

export enum GuestFormOccupancyType {
  Couple = 'COUPLE',
  LargeFamily = 'LARGE_FAMILY',
  Single = 'SINGLE',
  SmallFamily = 'SMALL_FAMILY'
}

export type GuestInput = {
  signature?: InputMaybe<Scalars['Upload']['input']>;
};

export type GuestResponse = {
  __typename?: 'GuestResponse';
  data?: Maybe<Guest>;
  message: Scalars['String']['output'];
};

export type Host = {
  __typename?: 'Host';
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  signature?: Maybe<Asset>;
  user: User;
};

export type HostAccountDetails = {
  __typename?: 'HostAccountDetails';
  accountName?: Maybe<Scalars['String']['output']>;
  accountNumber: Scalars['String']['output'];
  bankCode: Scalars['String']['output'];
  bankDetails?: Maybe<Bank>;
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
};

export type HostAccountDetailsInput = {
  accountName?: InputMaybe<Scalars['String']['input']>;
  accountNumber: Scalars['String']['input'];
  bankCode: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
};

export type HostAccountDetailsResponse = {
  __typename?: 'HostAccountDetailsResponse';
  data?: Maybe<HostAccountDetails>;
  message: Scalars['String']['output'];
};

export type HostAnalytics = {
  __typename?: 'HostAnalytics';
  averageRating: Scalars['Float']['output'];
  fundsInEscrow: Scalars['Decimal']['output'];
  host: Host;
  occupancyRate: Scalars['Float']['output'];
  pendingApplications: Scalars['Int']['output'];
  revenueGrowth: TimeSeriesData;
  topListing?: Maybe<Hosting>;
  totalListings: Scalars['Int']['output'];
  totalRevenue: Scalars['Decimal']['output'];
};


export type HostAnalyticsRevenueGrowthArgs = {
  lastNMonths?: InputMaybe<Scalars['Int']['input']>;
  lastNYears?: InputMaybe<Scalars['Int']['input']>;
  month?: InputMaybe<Scalars['Int']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

export type HostInput = {
  signature?: InputMaybe<Scalars['Upload']['input']>;
};

export type HostResponse = {
  __typename?: 'HostResponse';
  data?: Maybe<Host>;
  message: Scalars['String']['output'];
};

export type Hosting = {
  __typename?: 'Hosting';
  averageRating?: Maybe<Scalars['Float']['output']>;
  bookingApplicationsCount: Scalars['Int']['output'];
  bookingsCount: Scalars['Int']['output'];
  categories?: Maybe<Array<Scalars['String']['output']>>;
  cautionFee?: Maybe<Scalars['Decimal']['output']>;
  /** Number of shops under this plaza. */
  childCount: Scalars['Int']['output'];
  /**
   * Child listings (shops) under this hosting, newest first. Pass
   * `onSale: true` to return only units available to book (Live, not booked).
   */
  children: Array<Hosting>;
  city?: Maybe<Scalars['String']['output']>;
  contact?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  coverImage?: Maybe<HostingRoomImage>;
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  facilities?: Maybe<Array<Scalars['String']['output']>>;
  host: Host;
  id: Scalars['String']['output'];
  /**
   * Top images across all of the hosting's rooms, ranked by `sequence`
   * (exterior/living-room first by default; cover leads). Pass `limit: 4`
   * for the hosting-list carousel; omit for the full set.
   */
  images: Array<HostingRoomImage>;
  imagesCount: Scalars['Int']['output'];
  /**
   * Whether this hosting can be booked directly. A parent (plaza) is a
   * container — you book one of its shops, not the plaza itself.
   */
  isBookable: Scalars['Boolean']['output'];
  kind: HostingKind;
  landmarks?: Maybe<Scalars['String']['output']>;
  lastUpdated: Scalars['String']['output'];
  latitude?: Maybe<Scalars['String']['output']>;
  listingType?: Maybe<ListingType>;
  longitude?: Maybe<Scalars['String']['output']>;
  maxOccupants?: Maybe<Scalars['Int']['output']>;
  /** The parent (plaza) this shop belongs to, if any. */
  parent?: Maybe<Hosting>;
  parentId?: Maybe<Scalars['String']['output']>;
  paymentDetails?: Maybe<HostAccountDetails>;
  paymentInterval?: Maybe<PaymentInterval>;
  postalCode?: Maybe<Scalars['String']['output']>;
  price?: Maybe<Scalars['Decimal']['output']>;
  /** Lowest price among this plaza's available shops — the card's "from ₦X". */
  priceFrom?: Maybe<Scalars['Decimal']['output']>;
  propertyType?: Maybe<Scalars['String']['output']>;
  publishStatus?: Maybe<PublishStatus>;
  reviewAverage: HostingReviewAverage;
  reviews: Array<HostingReview>;
  rooms: Array<HostingRoom>;
  roomsCount: Scalars['Int']['output'];
  saved: Scalars['Boolean']['output'];
  serviceCharge?: Maybe<Scalars['Decimal']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  street?: Maybe<Scalars['String']['output']>;
  tenancyAgreementTemplate?: Maybe<TenancyTemplate>;
  title?: Maybe<Scalars['String']['output']>;
  totalRatings?: Maybe<Scalars['Int']['output']>;
  verification?: Maybe<HostingVerificationData>;
  /**
   * The hosting's latest video walkthrough (shown in the gallery), if any.
   * A shop with no walkthrough of its own falls back to the parent plaza's.
   */
  video?: Maybe<VideoWalkthrough>;
  webUrl: Scalars['String']['output'];
};


export type HostingChildrenArgs = {
  onSale?: InputMaybe<Scalars['Boolean']['input']>;
};


export type HostingImagesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type HostingReviewsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type HostingRoomsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};

export type HostingChat = {
  __typename?: 'HostingChat';
  createdAt: Scalars['String']['output'];
  guest: Guest;
  host: Host;
  hosting: Hosting;
  id: Scalars['String']['output'];
  lastMessage?: Maybe<HostingChatMessage>;
  lastUpdated: Scalars['String']['output'];
  recipientUser: User;
  unreadMessageCount: Scalars['Int']['output'];
};

export type HostingChatAsset = {
  __typename?: 'HostingChatAsset';
  asset: Asset;
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
};

export type HostingChatFilter = {
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
};

export type HostingChatMessage = {
  __typename?: 'HostingChatMessage';
  assets: Array<HostingChatAsset>;
  callDurationSeconds?: Maybe<Scalars['Int']['output']>;
  callId?: Maybe<Scalars['String']['output']>;
  callType?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  edited?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['String']['output'];
  isSender: Scalars['Boolean']['output'];
  lastUpdated: Scalars['String']['output'];
  messageType?: Maybe<Scalars['String']['output']>;
  sender: User;
  text: Scalars['String']['output'];
  unread: Scalars['Boolean']['output'];
};

export type HostingChatMessageInput = {
  assets?: InputMaybe<Array<Scalars['Upload']['input']>>;
  chatId: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  text: Scalars['String']['input'];
};

/**
 * AI-generated copy suggestion for a hosting's title and description.
 * Clients present these as editable defaults — never auto-applied.
 */
export type HostingContentSuggestion = {
  __typename?: 'HostingContentSuggestion';
  description: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type HostingCounts = {
  __typename?: 'HostingCounts';
  active: Scalars['Int']['output'];
  drafts: Scalars['Int']['output'];
  pending: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type HostingFees = {
  __typename?: 'HostingFees';
  baseRent: Scalars['Decimal']['output'];
  cautionCustodyFee: Scalars['Decimal']['output'];
  cautionFee: Scalars['Decimal']['output'];
  guestServiceCharge: Scalars['Decimal']['output'];
  hostServiceCharge: Scalars['Decimal']['output'];
  legalFee: Scalars['Decimal']['output'];
  lineItems: Array<FeeLineItem>;
  /**
   * Days a guest has to pay after their application is accepted before the
   * spot may be released (admin-configurable; mirrored in checkout copy).
   */
  paymentWindowDays: Scalars['Int']['output'];
  serviceCharge: Scalars['Decimal']['output'];
  stampDuty: Scalars['Decimal']['output'];
  totalPayableAmount: Scalars['Decimal']['output'];
};

export type HostingFilterInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  creatorId?: InputMaybe<Scalars['String']['input']>;
  facilities?: InputMaybe<Array<Scalars['String']['input']>>;
  isDraft?: InputMaybe<Scalars['Boolean']['input']>;
  maxPrice?: InputMaybe<Scalars['Decimal']['input']>;
  minPrice?: InputMaybe<Scalars['Decimal']['input']>;
  minRating?: InputMaybe<Scalars['Int']['input']>;
  onSale?: InputMaybe<Scalars['Boolean']['input']>;
  propertyType?: InputMaybe<Scalars['String']['input']>;
  publishStatus?: InputMaybe<PublishStatus>;
  search?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  street?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  /**
   * Minimum verification tier — matches listings verified at this tier OR
   * higher (tiers are ordinal: unverified → kushi_vetted).
   */
  verificationTier?: InputMaybe<HostingVerificationTier>;
};

export type HostingInput = {
  averageRating?: InputMaybe<Scalars['Float']['input']>;
  categories?: InputMaybe<Array<Scalars['String']['input']>>;
  cautionFee?: InputMaybe<Scalars['Decimal']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  contact?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  facilities?: InputMaybe<Array<Scalars['String']['input']>>;
  id?: InputMaybe<Scalars['String']['input']>;
  /** Standalone (default) / Parent (a plaza container) / Child (a unit under a parent). */
  kind?: InputMaybe<HostingKind>;
  landmarks?: InputMaybe<Scalars['String']['input']>;
  latitude?: InputMaybe<Scalars['String']['input']>;
  listingType?: InputMaybe<ListingType>;
  longitude?: InputMaybe<Scalars['String']['input']>;
  maxOccupants?: InputMaybe<Scalars['Int']['input']>;
  /**
   * Required when `kind = Child`: the parent hosting this unit belongs to.
   * May reference a Parent or a Standalone — a Standalone is promoted to Parent on save.
   */
  parentId?: InputMaybe<Scalars['String']['input']>;
  paymentDetailsId?: InputMaybe<Scalars['String']['input']>;
  paymentInterval?: InputMaybe<PaymentInterval>;
  postalCode?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Decimal']['input']>;
  propertyType?: InputMaybe<Scalars['String']['input']>;
  publishStatus?: InputMaybe<PublishStatus>;
  serviceCharge?: InputMaybe<Scalars['Decimal']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  street?: InputMaybe<Scalars['String']['input']>;
  tenancyAgreementTemplate?: InputMaybe<TenancyTemplateInput>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export enum HostingKind {
  Child = 'CHILD',
  Parent = 'PARENT',
  Standalone = 'STANDALONE'
}

export enum HostingPropertyRelationship {
  Agent = 'AGENT',
  Landlord = 'LANDLORD',
  Subletter = 'SUBLETTER'
}

export type HostingResponse = {
  __typename?: 'HostingResponse';
  data?: Maybe<Hosting>;
  message: Scalars['String']['output'];
};

export type HostingReview = {
  __typename?: 'HostingReview';
  accuracy?: Maybe<Scalars['Float']['output']>;
  averageRating?: Maybe<Scalars['Float']['output']>;
  checkIn?: Maybe<Scalars['Float']['output']>;
  cleanliness?: Maybe<Scalars['Float']['output']>;
  communication?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  location?: Maybe<Scalars['Float']['output']>;
  user: User;
  value?: Maybe<Scalars['Float']['output']>;
};

export type HostingReviewAverage = {
  __typename?: 'HostingReviewAverage';
  accuracy?: Maybe<Scalars['Float']['output']>;
  checkIn?: Maybe<Scalars['Float']['output']>;
  cleanliness?: Maybe<Scalars['Float']['output']>;
  communication?: Maybe<Scalars['Float']['output']>;
  location?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

export type HostingReviewInput = {
  accuracy?: InputMaybe<Scalars['Float']['input']>;
  checkIn?: InputMaybe<Scalars['Float']['input']>;
  cleanliness?: InputMaybe<Scalars['Float']['input']>;
  communication?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  hostingId: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['Float']['input']>;
  value?: InputMaybe<Scalars['Float']['input']>;
};

export type HostingReviewResponse = {
  __typename?: 'HostingReviewResponse';
  data?: Maybe<HostingReview>;
  message: Scalars['String']['output'];
};

export type HostingRoom = {
  __typename?: 'HostingRoom';
  count?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  hosting: Hosting;
  id: Scalars['String']['output'];
  images: Array<HostingRoomImage>;
  lastUpdated: Scalars['String']['output'];
  name: Scalars['String']['output'];
  /** Display ordering key — higher sorts first. */
  sequence: Scalars['Int']['output'];
};


export type HostingRoomImagesArgs = {
  pagination?: InputMaybe<PaginationInput>;
};

export type HostingRoomImage = {
  __typename?: 'HostingRoomImage';
  asset: Asset;
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  /** Display ordering key — higher sorts first; the highest is the cover. */
  sequence: Scalars['Int']['output'];
};

export type HostingRoomImageInput = {
  asset: Scalars['Upload']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  roomId: Scalars['String']['input'];
};

export type HostingRoomImageResponse = {
  __typename?: 'HostingRoomImageResponse';
  data?: Maybe<HostingRoomImage>;
  message: Scalars['String']['output'];
};

export type HostingRoomInput = {
  count?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  hostingId: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type HostingRoomResponse = {
  __typename?: 'HostingRoomResponse';
  data?: Maybe<HostingRoom>;
  message: Scalars['String']['output'];
};

export type HostingVerificationData = {
  __typename?: 'HostingVerificationData';
  createdAt: Scalars['String']['output'];
  declIndemnity: Scalars['Boolean']['output'];
  declLitigation: Scalars['Boolean']['output'];
  declOwnership: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  landlordAddress: Scalars['String']['output'];
  landlordFullName: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  propertyRelationship: HostingPropertyRelationship;
  /** Human-readable tooltip from admin-configured tier description. */
  tierTooltip: Scalars['String']['output'];
  titleNumber?: Maybe<Scalars['String']['output']>;
  titleType?: Maybe<Scalars['String']['output']>;
  verificationTier: HostingVerificationTier;
};

export type HostingVerificationInput = {
  declIndemnity: Scalars['Boolean']['input'];
  declLitigation: Scalars['Boolean']['input'];
  declOwnership: Scalars['Boolean']['input'];
  hostingId: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  landlordAddress: Scalars['String']['input'];
  landlordFullName: Scalars['String']['input'];
  propertyRelationship: HostingPropertyRelationship;
  titleNumber?: InputMaybe<Scalars['String']['input']>;
  titleType?: InputMaybe<Scalars['String']['input']>;
};

export type HostingVerificationRequest = {
  __typename?: 'HostingVerificationRequest';
  createdAt: Scalars['String']['output'];
  /** Documents attached to this request, ordered by created_at. */
  documents: Array<HostingVerificationRequestDocument>;
  /** Resolves the hosting summary through the verification record. */
  hosting?: Maybe<Hosting>;
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  logs: Array<VerificationLogEntry>;
  status: HostingVerificationRequestStatus;
  statusDetails?: Maybe<Scalars['String']['output']>;
  tier: HostingVerificationTier;
  verificationMeta?: Maybe<Scalars['String']['output']>;
};

export type HostingVerificationRequestDocument = {
  __typename?: 'HostingVerificationRequestDocument';
  asset: Asset;
  /** Structured list of conflict records (prior sales, competing claims). */
  conflictRecords?: Maybe<Scalars['JSON']['output']>;
  createdAt: Scalars['String']['output'];
  /**
   * Structured list of encumbrances (mortgages, liens, caveats) returned
   * by the registry search.
   */
  encumbrances?: Maybe<Scalars['JSON']['output']>;
  /** When the registry result expires (typically 12 months from `searched_at`). */
  expiresAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  name: Scalars['String']['output'];
  /** Plot status — "Allocated", "Revoked", "Under_Acquisition", etc. */
  plotStatus?: Maybe<Scalars['String']['output']>;
  /** Free-form raw response — pasted text, PDF excerpt, or admin notes. */
  rawResponse?: Maybe<Scalars['String']['output']>;
  /** When the admin ran the registry search. */
  searchedAt?: Maybe<Scalars['String']['output']>;
  /**
   * Registry search source — e.g. "AGIS", "Lagos e-GIS", "Ogun OGIS",
   * "Kano KADGIS", or "Manual" for the admin human-in-the-loop case.
   */
  source?: Maybe<Scalars['String']['output']>;
  /** Name of the registered owner returned by the registry search. */
  verifiedOwnerName?: Maybe<Scalars['String']['output']>;
};

export type HostingVerificationRequestResponse = {
  __typename?: 'HostingVerificationRequestResponse';
  data?: Maybe<HostingVerificationRequest>;
  message: Scalars['String']['output'];
};

export enum HostingVerificationRequestStatus {
  Pending = 'PENDING',
  Rejected = 'REJECTED',
  UnderReview = 'UNDER_REVIEW',
  Verified = 'VERIFIED'
}

export type HostingVerificationResponse = {
  __typename?: 'HostingVerificationResponse';
  data?: Maybe<HostingVerificationData>;
  message: Scalars['String']['output'];
};

export enum HostingVerificationTier {
  AddressVerified = 'ADDRESS_VERIFIED',
  IdentityVerified = 'IDENTITY_VERIFIED',
  KushiVetted = 'KUSHI_VETTED',
  TitleChecked = 'TITLE_CHECKED',
  Unverified = 'UNVERIFIED'
}

export type HostingVerificationTierRequestInput = {
  /**
   * Parallel to `uploads`: the document "title" (e.g. "Government ID")
   * that this upload satisfies. The client looks up the required titles
   * from `hostingVerificationDocumentsForTier` and matches them to the
   * files the host picked.
   */
  documentNames: Array<Scalars['String']['input']>;
  hostingId: Scalars['String']['input'];
  targetTier: HostingVerificationTier;
  /** Parallel to `document_names`. Must be the same length. */
  uploads: Array<Scalars['Upload']['input']>;
};

export type InteractionAnswerSuggestions = {
  __typename?: 'InteractionAnswerSuggestions';
  bad: Scalars['String']['output'];
  favourable: Scalars['String']['output'];
  medium: Scalars['String']['output'];
};

export type InteractionResponse = {
  __typename?: 'InteractionResponse';
  aiSuggestionUsed?: Maybe<Scalars['String']['output']>;
  answerText?: Maybe<Scalars['String']['output']>;
  contextNote?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  interactionId: Scalars['String']['output'];
  orderIndex: Scalars['Int']['output'];
  questionStepId?: Maybe<Scalars['String']['output']>;
  questionText: Scalars['String']['output'];
};

export type InteractionResponseResponse = {
  __typename?: 'InteractionResponseResponse';
  data?: Maybe<InteractionResponse>;
  message: Scalars['String']['output'];
};

export type Kyc = {
  __typename?: 'Kyc';
  bvnVerified?: Maybe<Scalars['Boolean']['output']>;
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  idDocumentType?: Maybe<Scalars['String']['output']>;
  image?: Maybe<Asset>;
  kycReferenceId?: Maybe<Scalars['String']['output']>;
  lastUpdated: Scalars['String']['output'];
  ninVerified?: Maybe<Scalars['Boolean']['output']>;
};

export type KycInput = {
  bvn?: InputMaybe<Scalars['String']['input']>;
  nin?: InputMaybe<Scalars['String']['input']>;
};

export type KycStatus = {
  __typename?: 'KycStatus';
  bvnVerified: Scalars['Boolean']['output'];
  hasLiveness: Scalars['Boolean']['output'];
  kycComplete: Scalars['Boolean']['output'];
  ninVerified: Scalars['Boolean']['output'];
};

export type LandlordMandateConfig = {
  __typename?: 'LandlordMandateConfig';
  financialFields: Array<OptionItem>;
  legalDeclarations: Array<OptionItem>;
  propertyRelationships: Array<OptionItem>;
};

export enum ListingType {
  Rent = 'RENT',
  Sale = 'SALE'
}

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type MessageResponse = {
  __typename?: 'MessageResponse';
  message: Scalars['String']['output'];
};

export type Mutations = {
  __typename?: 'Mutations';
  acceptBookingApplication: BookingApplicationResponse;
  addSupportMessageAttachment: Scalars['Boolean']['output'];
  /** Accept a staff invitation (public, no auth required) */
  adminAcceptStaffInvitation: Scalars['Boolean']['output'];
  /**
   * AI pre-screen a title document: downloads the asset, runs multimodal OCR
   * via OpenRouter (Gemini Flash), saves structured results to
   * `hosting_title_metadata`. Returns the extracted metadata.
   */
  adminAiPreScreenTitleDocuments: TitleMetadataResponse;
  /**
   * Enact the host's decision on their behalf — accept or reject. Wraps
   * `BookingApplicationQueries::update_booking_application_status` (the same
   * path the admin status mutation uses), records the event, stamps the
   * payment window on accept, and the underlying status change fires the
   * bookings Discord update.
   */
  adminBookingAssistDecision: BookingAssistResponse;
  /** Complete an interaction with a structured outcome + summary note. */
  adminCompleteFieldInteraction: FieldInteractionResponse;
  /** Create a standalone contact (lead). */
  adminCreateContact: ContactResponse;
  /**
   * Create a brand-new script for an interaction type. Inactive until
   * explicitly activated via `admin_update_field_script(is_active: true)`.
   */
  adminCreateFieldScript: FieldScriptResponse;
  /** Append or insert a step into a script. */
  adminCreateFieldScriptStep: FieldScriptStepResponse;
  adminCreateOrUpdatePropertyType: AdminPropertyTypeResponse;
  /** Create a new role with permissions */
  adminCreateRole: Role;
  /** Deactivate a staff member */
  adminDeactivateStaff: Scalars['Boolean']['output'];
  /**
   * Hard delete a step. Historical `interaction_response` rows keep their
   * snapshotted question text (FK is ON DELETE SET NULL).
   */
  adminDeleteFieldScriptStep: BoolResponse;
  adminDeleteHosting: Scalars['Boolean']['output'];
  adminDeletePropertyType: MessageResponse;
  /** Delete a role (only if not assigned to any staff) */
  adminDeleteRole: Scalars['Boolean']['output'];
  /**
   * Idempotent get-or-create for the assist tied to an application. Returns
   * the existing assist when one is already present (never duplicated).
   */
  adminGetOrCreateBookingAssist: BookingAssistResponse;
  /** Invite a new staff member. If the user doesn't exist, creates them with a temp password. */
  adminInviteStaff: StaffInvitation;
  /** Append an ad-hoc note to the assist timeline. */
  adminLogBookingAssistEvent: BookingAssistEventResponse;
  /**
   * Manually mark a hosting as Address Verified. Upgrades the hosting's
   * verification tier from Unverified or IdentityVerified → AddressVerified.
   */
  adminMarkHostingAsAddressVerified: HostingVerificationRequestResponse;
  /** Record (upsert) a single question's answer/context. */
  adminRecordInteractionResponse: InteractionResponseResponse;
  /** Release the soft lock (only the current handler may). Publishes presence. */
  adminReleaseBookingAssist: BookingAssistResponse;
  /** Mark an admin-approved claim as Released (triggers payout logic externally). */
  adminReleaseCautionClaim: CautionClaimResponse;
  /** Reorder a script's steps by array position, in one transaction. */
  adminReorderFieldScriptSteps: FieldScriptResponse;
  adminReorderPropertyTypes: MessageResponse;
  /** Approve or decline a disputed caution claim after mediation. */
  adminResolveCautionClaim: CautionClaimResponse;
  adminReviewHostingVerificationRequest: HostingVerificationRequestResponse;
  /**
   * Start a field interaction. Creates the contact inline when no
   * `contactId` is supplied, then snapshots the active script's question
   * steps into ordered response rows.
   */
  adminStartFieldInteraction: FieldInteractionResponse;
  /**
   * Take the soft single-handler lock + record presence. Fails if someone
   * else currently holds it. Publishes the new presence to live subscribers.
   */
  adminTakeBookingAssist: BookingAssistResponse;
  adminUpdateBookingApplicationStatus: BookingApplicationResponse;
  /**
   * Capture guest/host fields + key date. Setting a key date also relays it
   * onto the booking_application. Publishes the updated state.
   */
  adminUpdateBookingAssist: BookingAssistResponse;
  adminUpdateFeeConfig: AdminFeeConfigResponse;
  /**
   * Update script metadata. Activating a script deactivates sibling scripts
   * of the same interaction type (single active per type), in one transaction.
   */
  adminUpdateFieldScript: FieldScriptResponse;
  /**
   * Edit / enable-disable a single step. Snapshot integrity: this never
   * touches `interaction_response` rows.
   */
  adminUpdateFieldScriptStep: FieldScriptStepResponse;
  adminUpdateHostingStatus: Scalars['Boolean']['output'];
  /**
   * Update the human-readable details/status-notes on a verification
   * request without changing its status. Push + email the host.
   */
  adminUpdateHostingVerificationRequestDetails: HostingVerificationRequestResponse;
  /** Update an existing role */
  adminUpdateRole: Role;
  /** Update staff member permissions/role */
  adminUpdateStaff: StaffMember;
  adminUpdateUserStatus: Scalars['Boolean']['output'];
  adminUpdateVerificationTier: AdminVerificationTierResponse;
  appleLogin: AuthTokenResponse;
  appleSignUp: AuthTokenResponse;
  cancelBooking: MessageResponse;
  cancelBookingApplication: MessageResponse;
  clearChatUrnreadMessages: MessageResponse;
  completeBookingApplicationSubmission: BookingApplicationResponse;
  completePasswordChange: MessageResponse;
  completePhoneNumberVerification: PhoneNumberResponse;
  createHostingRoomImage: HostingRoomImageResponse;
  /**
   * Step 1 of the large-video upload: returns a short-lived signed PUT URL
   * the client uploads the recorded property video to directly (the file is
   * far too large for the GraphQL multipart path / Cloud Run body limit).
   */
  createHostingVideoUploadUrl: VideoUploadTarget;
  createOrUpdateHosting: HostingResponse;
  createOrUpdateHostingReview: HostingReviewResponse;
  createOrUpdateHostingRoom: HostingRoomResponse;
  createUpdateHostPaymentDetails: HostAccountDetailsResponse;
  createUpdateMessage: HostingChatMessage;
  createUpdateSavedHosting: SavedHostingResponse;
  createUpdateSavedHostingFolder: SavedHostingFolderResponse;
  deleteAccount: BoolResponse;
  deleteHostPaymentDetails: MessageResponse;
  deleteHosting: MessageResponse;
  deleteHostingRoom: MessageResponse;
  deleteHostingRoomImage: MessageResponse;
  deleteSavedHosting: MessageResponse;
  deleteSavedHostingFolder: MessageResponse;
  /**
   * Duplicate a listing the host owns — deep-cloning its rooms, photos, and
   * (for a plaza) all of its units — to speed up capturing near-identical
   * buildings. The copy lands as a Draft with fresh (Unverified) verification;
   * the geofenced video walkthrough is not copied.
   */
  duplicateHosting: HostingResponse;
  finalizeBooking: Booking;
  googleLogin: AuthTokenResponse;
  googleSignUp: AuthTokenResponse;
  hostUpdateBookingApplicationStatus: BookingApplicationResponse;
  initiateAcceptBookingApplication: MessageResponse;
  initiateBookingApplication: BookingApplicationResponse;
  initiateBookingApplicationSubmission: MessageResponse;
  initiateCancelBooking: MessageResponse;
  initiateFinalizeBooking: MessageResponse;
  initiateHostingChat: HostingChat;
  /**
   * Initiate (or refresh) the hosting verification row for a hosting.
   * Does not create a verification request — call
   * `requestHostingVerificationTier` to submit one with documents.
   */
  initiateHostingVerification: HostingVerificationResponse;
  initiatePhoneNumberVerification: MessageResponse;
  initiateSupportChat: SupportChat;
  login: AuthTokenResponse;
  logout: MessageResponse;
  markAllNotificationsAsRead: MessageResponse;
  markNotificationAsRead: MessageResponse;
  /**
   * Move photos from one room/space to another within the same listing —
   * e.g. splitting shots that were all created under a single "Bedroom" out
   * to "Bedroom 2". Requires ownership of the target room and every image.
   */
  moveHostingRoomImages: MessageResponse;
  refreshToken: AuthTokenResponse;
  /**
   * Persist a host's manual image order within a room (drag-to-reorder).
   * `orderedImageIds` lists every image of the room in the desired order.
   */
  reorderHostingRoomImages: MessageResponse;
  /**
   * Persist a host's manual room order (drag-to-reorder). `orderedRoomIds`
   * lists every room of the hosting in the desired display order.
   */
  reorderHostingRooms: MessageResponse;
  /** Guest requests a refund of their remaining caution balance after tenancy ends. */
  requestCautionRefund: CautionRefundResponse;
  /** Host requests a partial or full release of the caution deposit. */
  requestCautionRelease: CautionClaimResponse;
  /**
   * Submit a tier-upgrade request. The client passes a parallel list of
   * `documentNames` and `uploads`; the server uploads each file securely
   * and creates one document row per pair.
   */
  requestHostingVerificationTier: HostingVerificationRequestResponse;
  requestPasswordChange: MessageResponse;
  resendEmailVerificationOtp: MessageResponse;
  resendPasswordChangeOtp: MessageResponse;
  /** Guest approves or disputes a caution release claim. */
  respondToCautionClaim: CautionClaimResponse;
  retryBookingPayment: TransactionResponse;
  sendChatCallNotification: MessageResponse;
  sendSupportMessage: SupportChatMessage;
  /**
   * Make the given image the hosting's cover by bumping its `sequence`
   * above every other image of the hosting.
   */
  setHostingCoverImage: HostingRoomImageResponse;
  /**
   * Step 2: finalize the hosting video after the direct upload completes.
   * GPS samples are captured silently for verification; duration is capped
   * at 5 minutes. Reuses the video-walkthrough record (shown in the gallery).
   */
  setHostingVideo: VideoWalkthroughResponse;
  signUp: UserResponse;
  submitFeedback: Feedback;
  submitNps: Npsscore;
  submitSupportRating: SupportChatRating;
  updateBookingApplication: BookingApplicationResponse;
  updateFeedbackStatus: Feedback;
  updateGuest: GuestResponse;
  updateHost: HostResponse;
  updateProfile: ProfileResponse;
  updatePushNotificationToken: NotificationSettingsResponse;
  updateSupportChatStatus: SupportChat;
  updateUserNotificationSettings: NotificationSettingsResponse;
  uploadKycImage: Kyc;
  /**
   * Upload a video walkthrough for a hosting.
   * The client records the video, extracts GPS samples, and uploads the file.
   * The server validates NDPR consent, stores metadata, and spawns reverse image search.
   */
  uploadVideoWalkthrough: VideoWalkthroughResponse;
  verifyBookingPayment: BookingResponse;
  verifyEmail: MessageResponse;
  verifyKyc: Kyc;
  verifyTransactionByReference: TransactionResponse;
};


export type MutationsAcceptBookingApplicationArgs = {
  applicationId: Scalars['String']['input'];
  otp: Scalars['String']['input'];
};


export type MutationsAddSupportMessageAttachmentArgs = {
  file: Scalars['Upload']['input'];
  messageId: Scalars['String']['input'];
};


export type MutationsAdminAcceptStaffInvitationArgs = {
  token: Scalars['String']['input'];
};


export type MutationsAdminAiPreScreenTitleDocumentsArgs = {
  documentId: Scalars['String']['input'];
};


export type MutationsAdminBookingAssistDecisionArgs = {
  input: AdminBookingAssistDecisionInput;
};


export type MutationsAdminCompleteFieldInteractionArgs = {
  input: AdminCompleteFieldInteractionInput;
};


export type MutationsAdminCreateContactArgs = {
  input: AdminCreateContactInput;
};


export type MutationsAdminCreateFieldScriptArgs = {
  input: AdminCreateFieldScriptInput;
};


export type MutationsAdminCreateFieldScriptStepArgs = {
  input: AdminCreateFieldScriptStepInput;
};


export type MutationsAdminCreateOrUpdatePropertyTypeArgs = {
  input: AdminPropertyTypeInput;
};


export type MutationsAdminCreateRoleArgs = {
  input: AdminCreateRoleInput;
};


export type MutationsAdminDeactivateStaffArgs = {
  staffId: Scalars['String']['input'];
};


export type MutationsAdminDeleteFieldScriptStepArgs = {
  stepId: Scalars['String']['input'];
};


export type MutationsAdminDeleteHostingArgs = {
  hostingId: Scalars['String']['input'];
};


export type MutationsAdminDeletePropertyTypeArgs = {
  id: Scalars['String']['input'];
};


export type MutationsAdminDeleteRoleArgs = {
  id: Scalars['String']['input'];
};


export type MutationsAdminGetOrCreateBookingAssistArgs = {
  applicationId: Scalars['String']['input'];
};


export type MutationsAdminInviteStaffArgs = {
  input: AdminInviteStaffInput;
};


export type MutationsAdminLogBookingAssistEventArgs = {
  input: AdminLogBookingAssistEventInput;
};


export type MutationsAdminMarkHostingAsAddressVerifiedArgs = {
  hostingId: Scalars['String']['input'];
};


export type MutationsAdminRecordInteractionResponseArgs = {
  input: AdminRecordInteractionResponseInput;
};


export type MutationsAdminReleaseBookingAssistArgs = {
  assistId: Scalars['String']['input'];
};


export type MutationsAdminReleaseCautionClaimArgs = {
  claimId: Scalars['String']['input'];
};


export type MutationsAdminReorderFieldScriptStepsArgs = {
  input: AdminReorderFieldScriptStepsInput;
};


export type MutationsAdminReorderPropertyTypesArgs = {
  orderedIds: Array<Scalars['String']['input']>;
};


export type MutationsAdminResolveCautionClaimArgs = {
  adminNotes?: InputMaybe<Scalars['String']['input']>;
  approved: Scalars['Boolean']['input'];
  claimId: Scalars['String']['input'];
};


export type MutationsAdminReviewHostingVerificationRequestArgs = {
  input: AdminReviewHostingVerificationRequestInput;
};


export type MutationsAdminStartFieldInteractionArgs = {
  input: AdminStartFieldInteractionInput;
};


export type MutationsAdminTakeBookingAssistArgs = {
  assistId: Scalars['String']['input'];
};


export type MutationsAdminUpdateBookingApplicationStatusArgs = {
  input: BookingApplicationStatusUpdateInput;
};


export type MutationsAdminUpdateBookingAssistArgs = {
  input: AdminUpdateBookingAssistInput;
};


export type MutationsAdminUpdateFeeConfigArgs = {
  input: UpdateFeeConfigInput;
};


export type MutationsAdminUpdateFieldScriptArgs = {
  input: AdminUpdateFieldScriptInput;
};


export type MutationsAdminUpdateFieldScriptStepArgs = {
  input: AdminUpdateFieldScriptStepInput;
};


export type MutationsAdminUpdateHostingStatusArgs = {
  hostingId: Scalars['String']['input'];
  isActive: Scalars['Boolean']['input'];
};


export type MutationsAdminUpdateHostingVerificationRequestDetailsArgs = {
  input: AdminUpdateHostingVerificationRequestDetailsInput;
};


export type MutationsAdminUpdateRoleArgs = {
  input: AdminUpdateRoleInput;
};


export type MutationsAdminUpdateStaffArgs = {
  input: AdminUpdateStaffInput;
};


export type MutationsAdminUpdateUserStatusArgs = {
  action: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationsAdminUpdateVerificationTierArgs = {
  input: AdminVerificationTierInput;
};


export type MutationsAppleLoginArgs = {
  input: AppleAuthInput;
};


export type MutationsAppleSignUpArgs = {
  input: AppleAuthInput;
};


export type MutationsCancelBookingArgs = {
  bookingId: Scalars['String']['input'];
  otp: Scalars['String']['input'];
};


export type MutationsCancelBookingApplicationArgs = {
  applicationId: Scalars['String']['input'];
};


export type MutationsClearChatUrnreadMessagesArgs = {
  chatId: Scalars['String']['input'];
};


export type MutationsCompleteBookingApplicationSubmissionArgs = {
  input: BookingApplicationSubmissionInput;
};


export type MutationsCompletePasswordChangeArgs = {
  input: CompletePasswordChangeInput;
};


export type MutationsCompletePhoneNumberVerificationArgs = {
  input: PhoneNumberVerificationInput;
};


export type MutationsCreateHostingRoomImageArgs = {
  input: HostingRoomImageInput;
};


export type MutationsCreateHostingVideoUploadUrlArgs = {
  contentType: Scalars['String']['input'];
  hostingId: Scalars['String']['input'];
};


export type MutationsCreateOrUpdateHostingArgs = {
  input: HostingInput;
};


export type MutationsCreateOrUpdateHostingReviewArgs = {
  input: HostingReviewInput;
};


export type MutationsCreateOrUpdateHostingRoomArgs = {
  input: HostingRoomInput;
};


export type MutationsCreateUpdateHostPaymentDetailsArgs = {
  input: HostAccountDetailsInput;
};


export type MutationsCreateUpdateMessageArgs = {
  input: HostingChatMessageInput;
};


export type MutationsCreateUpdateSavedHostingArgs = {
  input: SavedHostingInput;
};


export type MutationsCreateUpdateSavedHostingFolderArgs = {
  input: SavedHostingFolderInput;
};


export type MutationsDeleteHostPaymentDetailsArgs = {
  paymentDetailsId: Scalars['String']['input'];
};


export type MutationsDeleteHostingArgs = {
  hostingId: Scalars['String']['input'];
};


export type MutationsDeleteHostingRoomArgs = {
  hostingRoomId: Scalars['String']['input'];
};


export type MutationsDeleteHostingRoomImageArgs = {
  hostingRoomImageId: Scalars['String']['input'];
};


export type MutationsDeleteSavedHostingArgs = {
  hostingId: Scalars['String']['input'];
};


export type MutationsDeleteSavedHostingFolderArgs = {
  folderId: Scalars['String']['input'];
};


export type MutationsDuplicateHostingArgs = {
  sourceHostingId: Scalars['String']['input'];
};


export type MutationsFinalizeBookingArgs = {
  bookingId: Scalars['String']['input'];
  otp: Scalars['String']['input'];
};


export type MutationsGoogleLoginArgs = {
  idToken: Scalars['String']['input'];
  tokenType?: InputMaybe<GoogleAuthTokenType>;
};


export type MutationsGoogleSignUpArgs = {
  idToken: Scalars['String']['input'];
  tokenType?: InputMaybe<GoogleAuthTokenType>;
};


export type MutationsHostUpdateBookingApplicationStatusArgs = {
  input: BookingApplicationStatusUpdateInput;
};


export type MutationsInitiateAcceptBookingApplicationArgs = {
  applicationId: Scalars['String']['input'];
};


export type MutationsInitiateBookingApplicationArgs = {
  hostingId: Scalars['String']['input'];
};


export type MutationsInitiateBookingApplicationSubmissionArgs = {
  applicationId: Scalars['String']['input'];
};


export type MutationsInitiateCancelBookingArgs = {
  bookingId: Scalars['String']['input'];
};


export type MutationsInitiateFinalizeBookingArgs = {
  bookingId: Scalars['String']['input'];
};


export type MutationsInitiateHostingChatArgs = {
  hostingId: Scalars['String']['input'];
};


export type MutationsInitiateHostingVerificationArgs = {
  input: HostingVerificationInput;
};


export type MutationsInitiatePhoneNumberVerificationArgs = {
  phoneNumber: Scalars['String']['input'];
};


export type MutationsInitiateSupportChatArgs = {
  initialMessage?: InputMaybe<Scalars['String']['input']>;
  itemId?: InputMaybe<Scalars['String']['input']>;
  itemType?: InputMaybe<SupportItemType>;
};


export type MutationsLoginArgs = {
  input: LoginInput;
};


export type MutationsMarkNotificationAsReadArgs = {
  notificationId: Scalars['String']['input'];
};


export type MutationsMoveHostingRoomImagesArgs = {
  imageIds: Array<Scalars['String']['input']>;
  targetRoomId: Scalars['String']['input'];
};


export type MutationsRefreshTokenArgs = {
  input: RefreshTokenInput;
};


export type MutationsReorderHostingRoomImagesArgs = {
  orderedImageIds: Array<Scalars['String']['input']>;
  roomId: Scalars['String']['input'];
};


export type MutationsReorderHostingRoomsArgs = {
  hostingId: Scalars['String']['input'];
  orderedRoomIds: Array<Scalars['String']['input']>;
};


export type MutationsRequestCautionRefundArgs = {
  input: RequestCautionRefundInput;
};


export type MutationsRequestCautionReleaseArgs = {
  input: RequestCautionReleaseInput;
};


export type MutationsRequestHostingVerificationTierArgs = {
  input: HostingVerificationTierRequestInput;
};


export type MutationsRequestPasswordChangeArgs = {
  input: RequestPasswordChangeInput;
};


export type MutationsResendEmailVerificationOtpArgs = {
  email: Scalars['String']['input'];
};


export type MutationsResendPasswordChangeOtpArgs = {
  email: Scalars['String']['input'];
};


export type MutationsRespondToCautionClaimArgs = {
  input: RespondToCautionClaimInput;
};


export type MutationsRetryBookingPaymentArgs = {
  bookingId: Scalars['String']['input'];
};


export type MutationsSendChatCallNotificationArgs = {
  callId: Scalars['String']['input'];
  callKind?: InputMaybe<Scalars['String']['input']>;
  callType: CallType;
  chatId: Scalars['String']['input'];
  durationSeconds?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationsSendSupportMessageArgs = {
  chatId: Scalars['String']['input'];
  text: Scalars['String']['input'];
};


export type MutationsSetHostingCoverImageArgs = {
  hostingRoomImageId: Scalars['String']['input'];
};


export type MutationsSetHostingVideoArgs = {
  assetId: Scalars['String']['input'];
  input: VideoWalkthroughInput;
};


export type MutationsSignUpArgs = {
  input: SignUpInput;
};


export type MutationsSubmitFeedbackArgs = {
  input: SubmitFeedbackInput;
};


export type MutationsSubmitNpsArgs = {
  input: SubmitNpsInput;
};


export type MutationsSubmitSupportRatingArgs = {
  input: SubmitSupportRatingInput;
};


export type MutationsUpdateBookingApplicationArgs = {
  input: BookingApplicationUpdateInput;
};


export type MutationsUpdateFeedbackStatusArgs = {
  adminNotes?: InputMaybe<Scalars['String']['input']>;
  feedbackId: Scalars['String']['input'];
  status: FeedbackStatus;
};


export type MutationsUpdateGuestArgs = {
  input: GuestInput;
};


export type MutationsUpdateHostArgs = {
  input: HostInput;
};


export type MutationsUpdateProfileArgs = {
  input: ProfileUpdateInput;
};


export type MutationsUpdatePushNotificationTokenArgs = {
  tokens: UpdateNotificationTokensInput;
};


export type MutationsUpdateSupportChatStatusArgs = {
  chatId: Scalars['String']['input'];
  status: SupportChatStatus;
};


export type MutationsUpdateUserNotificationSettingsArgs = {
  input: NotificationSettingsInput;
};


export type MutationsUploadKycImageArgs = {
  file: Scalars['Upload']['input'];
};


export type MutationsUploadVideoWalkthroughArgs = {
  input: VideoWalkthroughInput;
  video: Scalars['Upload']['input'];
};


export type MutationsVerifyBookingPaymentArgs = {
  id: Scalars['String']['input'];
};


export type MutationsVerifyEmailArgs = {
  input: Otpinput;
};


export type MutationsVerifyKycArgs = {
  input: KycInput;
};


export type MutationsVerifyTransactionByReferenceArgs = {
  reference: Scalars['String']['input'];
};

export type Notification = {
  __typename?: 'Notification';
  createdAt: Scalars['String']['output'];
  data?: Maybe<NotificationData>;
  id: Scalars['String']['output'];
  isRead: Scalars['Boolean']['output'];
  lastUpdated: Scalars['String']['output'];
  message: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type?: Maybe<NotificationType>;
};

export type NotificationData = {
  __typename?: 'NotificationData';
  id?: Maybe<Scalars['String']['output']>;
  intent?: Maybe<NotificationIntent>;
  subject?: Maybe<NotificationSubject>;
};

export enum NotificationIntent {
  IncomingCall = 'INCOMING_CALL',
  MissedCall = 'MISSED_CALL',
  NewMessage = 'NEW_MESSAGE'
}

export type NotificationSettings = {
  __typename?: 'NotificationSettings';
  appUpdates: Scalars['Boolean']['output'];
  createdAt: Scalars['String']['output'];
  email: Scalars['Boolean']['output'];
  fcmToken?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  pushNotifications: Scalars['Boolean']['output'];
  specialOffers: Scalars['Boolean']['output'];
  voipToken?: Maybe<Scalars['String']['output']>;
};

export type NotificationSettingsInput = {
  appUpdates: Scalars['Boolean']['input'];
  email: Scalars['Boolean']['input'];
  pushNotifications: Scalars['Boolean']['input'];
  specialOffers: Scalars['Boolean']['input'];
};

export type NotificationSettingsResponse = {
  __typename?: 'NotificationSettingsResponse';
  data?: Maybe<NotificationSettings>;
  message: Scalars['String']['output'];
};

export enum NotificationSubject {
  Booking = 'BOOKING',
  BookingApplication = 'BOOKING_APPLICATION',
  Chat = 'CHAT',
  Hosting = 'HOSTING'
}

export enum NotificationType {
  General = 'GENERAL',
  GuestAlert = 'GUEST_ALERT',
  HostAlert = 'HOST_ALERT',
  System = 'SYSTEM'
}

export type NotificationsFilterInput = {
  type?: InputMaybe<NotificationType>;
};

export type Npsscore = {
  __typename?: 'Npsscore';
  context: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  score: Scalars['Int']['output'];
  user?: Maybe<User>;
};

export type OnlineUser = {
  __typename?: 'OnlineUser';
  createAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lastSeen: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  online: Scalars['Boolean']['output'];
  user: User;
};

export type OptionItem = {
  __typename?: 'OptionItem';
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isOptional: Scalars['Boolean']['output'];
  label: Scalars['String']['output'];
};

export type Otpinput = {
  email: Scalars['String']['input'];
  otp: Scalars['String']['input'];
};

export type PaginationInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export enum PaymentInterval {
  Anually = 'ANUALLY',
  Monthly = 'MONTHLY',
  Nightly = 'NIGHTLY',
  OneTimePayment = 'ONE_TIME_PAYMENT',
  Weekly = 'WEEKLY'
}

export enum PaymentStatus {
  Failed = 'FAILED',
  Paid = 'PAID',
  Pending = 'PENDING'
}

export type PhoneNumber = {
  __typename?: 'PhoneNumber';
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  number: Scalars['String']['output'];
  verificationStatus: PhoneNumberVerificationStatus;
};

export type PhoneNumberResponse = {
  __typename?: 'PhoneNumberResponse';
  data?: Maybe<PhoneNumber>;
  message: Scalars['String']['output'];
};

export type PhoneNumberVerificationInput = {
  otp: Scalars['String']['input'];
  phoneNumber: Scalars['String']['input'];
};

export enum PhoneNumberVerificationStatus {
  Failed = 'FAILED',
  Pending = 'PENDING',
  Verified = 'VERIFIED'
}

export type Profile = {
  __typename?: 'Profile';
  createdAt: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  gender?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  image?: Maybe<Asset>;
  lastUpdated: Scalars['String']['output'];
};

export type ProfileResponse = {
  __typename?: 'ProfileResponse';
  data?: Maybe<Profile>;
  message: Scalars['String']['output'];
};

export type ProfileUpdateInput = {
  fullName: Scalars['String']['input'];
  gender?: InputMaybe<Scalars['String']['input']>;
  profilePicture?: InputMaybe<Scalars['Upload']['input']>;
};

/**
 * A canonical, admin-editable property type + the rooms / facilities that are
 * potential for it. Source of truth for clients and the AI. See
 * sprints/app-constants-plan.md.
 */
export type PropertyTypeConfig = {
  __typename?: 'PropertyTypeConfig';
  category?: Maybe<Scalars['String']['output']>;
  facilities: Array<Scalars['String']['output']>;
  /** Icon name — clients map it to a component (with a fallback for unknown). */
  icon?: Maybe<Scalars['String']['output']>;
  label: Scalars['String']['output'];
  rooms: Array<Scalars['String']['output']>;
  searchTerms: Array<Scalars['String']['output']>;
  /** The free string stored on `hosting.property_type`. */
  value: Scalars['String']['output'];
};

export enum PublishStatus {
  Archived = 'ARCHIVED',
  Draft = 'DRAFT',
  Inreview = 'INREVIEW',
  Live = 'LIVE',
  Rejected = 'REJECTED'
}

export type Query = {
  __typename?: 'Query';
  /** The active script for an interaction type, with its ordered steps. */
  adminActiveFieldScript: FieldScript;
  adminAsset: Asset;
  adminAuditLogs: AdminAuditLogConnection;
  adminBooking: Booking;
  adminBookingApplication: BookingApplication;
  adminBookingApplications: Array<BookingApplication>;
  /**
   * The full case: assist + application/guest/host/hosting context + events +
   * the live current handler. Lookup by assist id or by application id.
   */
  adminBookingAssist: BookingAssist;
  /**
   * The assist queue. Each row carries handler + applicant/property context so
   * the list can render the current-handler badge and the case summary.
   */
  adminBookingAssists: Array<BookingAssist>;
  adminBookings: Array<Booking>;
  adminCautionClaim: CautionClaim;
  adminCautionClaims: Array<CautionClaim>;
  adminDashboardStats: AdminDashboardStats;
  adminFeeConfig: AdminFeeConfig;
  adminFeedback: Array<Feedback>;
  /** Full record with nested responses. */
  adminFieldInteraction: FieldInteraction;
  /** Shared records table — all reps. Optional filters + pagination. */
  adminFieldInteractions: Array<FieldInteraction>;
  /**
   * All scripts (including inactive) for the builder, optionally filtered by
   * interaction type. Each carries its ordered steps, including disabled ones.
   */
  adminFieldScripts: Array<FieldScript>;
  /**
   * Monthly growth time-series, oldest month first. Months with no data are zero-filled.
   * `months` defaults to 12 and is clamped to 1..=36.
   */
  adminGrowthStats: Array<AdminMonthlyGrowthPoint>;
  adminHosting: Hosting;
  adminHostingVerificationRequest: HostingVerificationRequest;
  adminHostingVerificationRequests: Array<HostingVerificationRequest>;
  adminHostings: Array<Hosting>;
  /**
   * AI-suggested customer answers (favourable / medium / bad) for the next
   * question, conditioned on the transcript built from prior responses.
   */
  adminInteractionAnswerSuggestions: InteractionAnswerSuggestions;
  /**
   * Returns the platform-wide legal configuration defaults used to
   * pre-populate tenancy agreement fields.
   */
  adminLegalConfig: AdminLegalConfig;
  adminNpsAverage?: Maybe<Scalars['Float']['output']>;
  adminNpsScores: Array<Npsscore>;
  /**
   * Host payouts not yet confirmed paid — for ops reconciliation. Surfaces
   * retry metadata (attempts, last_error, next_attempt_at) and flags the
   * `NeedsReconciliation` dead-letter rows that need manual attention.
   */
  adminPendingDisbursements: Array<Transaction>;
  /** Get all available permissions as enum values */
  adminPermissions: Array<Scalars['String']['output']>;
  /** Every property type (including inactive) for the admin editor. */
  adminPropertyTypes: Array<AdminPropertyType>;
  /** Get a single role by ID with its permissions */
  adminRole: Role;
  adminRoles: Array<Role>;
  /** List all roles (already available via adminRoles in staff queries) */
  adminRolesList: Array<Role>;
  adminStaff: Array<StaffMember>;
  adminSupportChats: Array<SupportChat>;
  adminSupportRatings: Array<SupportChatRating>;
  adminTransactions: Array<Transaction>;
  adminUser: AdminUser;
  adminUsers: Array<AdminUser>;
  adminVerificationTier?: Maybe<AdminVerificationTier>;
  adminVerificationTiers: Array<AdminVerificationTier>;
  /**
   * Suggest an AI-generated title and description for a hosting, built from
   * as much of the hosting's own context as is available (type, location,
   * price, rooms, facilities). Clients surface these as editable defaults —
   * never auto-applied. Requires the requester to own the hosting.
   */
  aiHostingContentSuggestion: HostingContentSuggestion;
  aiHostingSearchPredictions: Array<AiSearchPrediction>;
  authGuest: Guest;
  authHost: Host;
  banks: Array<Bank>;
  booking: Booking;
  bookingApplication: BookingApplication;
  bookingApplications: Array<BookingApplication>;
  bookingApplicationsCount: Scalars['Int']['output'];
  bookings: Array<Booking>;
  calculateHostingFees: HostingFees;
  /**
   * Check if a user can leave feedback for a specific booking
   * Returns true if the booking is completed and the user hasn't left feedback yet
   */
  canLeaveBookingFeedback: Scalars['Boolean']['output'];
  /** All caution claims filed against a booking. */
  cautionClaimsForBooking: Array<CautionClaim>;
  /** The guest's caution refund request for a booking, if any. */
  cautionRefundForBooking?: Maybe<CautionRefund>;
  chatMessages: Array<HostingChatMessage>;
  guestAnalytics: GuestAnalytics;
  guestBookingTenancyAgreementPreview: Scalars['String']['output'];
  hostAnalytics: HostAnalytics;
  hostPaymentDetails: Array<HostAccountDetails>;
  hosting: Hosting;
  hostingChat: HostingChat;
  hostingCounts: HostingCounts;
  /**
   * All verification requests for a hosting, newest-first.
   * Used by the Expo UI to display request history.
   */
  hostingVerificationRequests: Array<HostingVerificationRequest>;
  /**
   * Public tier configuration for a single tier — exposed to hosts
   * so the onboarding UI can render the document checklist for a
   * target tier.
   */
  hostingVerificationTier?: Maybe<AdminVerificationTier>;
  hostings: Array<Hosting>;
  /**
   * Returns the calling user's KYC status. Used by the mobile app to
   * gate access to the hosting verification flow (Sprint 1.5 hard-gate)
   * and to render a clear "what's missing" state in the KYC UI.
   */
  kycStatus: KycStatus;
  landlordMandateOptions: LandlordMandateConfig;
  me: User;
  mySupportChats: Array<SupportChat>;
  notifications: Array<Notification>;
  /**
   * The canonical, admin-editable property types (with the rooms + facilities
   * potential for each). Clients read this instead of hardcoding the list, and
   * the AI reads the same source so predictions return valid values.
   */
  propertyTypes: Array<PropertyTypeConfig>;
  resolveBankAccount: Scalars['String']['output'];
  savedHosting: SavedHosting;
  savedHostingFolder: SavedHostingFolder;
  savedHostingFolders: Array<SavedHostingFolder>;
  savedHostings: Array<SavedHosting>;
  /**
   * Check if user should be shown the quarterly NPS survey
   * Returns true if they haven't submitted an NPS score in the last 90 days
   */
  shouldShowNpsSurvey: Scalars['Boolean']['output'];
  supportChat: SupportChat;
  tenancyAgreementTemplate: TenancyTemplate;
  tenantMandateOptions: TenantMandateConfig;
  transactionByReference: Transaction;
  transactions: Array<Transaction>;
  userChats: Array<HostingChat>;
};


export type QueryAdminActiveFieldScriptArgs = {
  interactionType: Scalars['String']['input'];
};


export type QueryAdminAssetArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminAuditLogsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryAdminBookingArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminBookingApplicationArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminBookingApplicationsArgs = {
  pagination?: InputMaybe<PaginationInput>;
  status?: InputMaybe<BookingApplicationStatus>;
};


export type QueryAdminBookingAssistArgs = {
  applicationId?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAdminBookingAssistsArgs = {
  filters?: InputMaybe<AdminBookingAssistFilters>;
};


export type QueryAdminBookingsArgs = {
  pagination?: InputMaybe<PaginationInput>;
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAdminCautionClaimArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminCautionClaimsArgs = {
  pagination?: InputMaybe<PaginationInput>;
  status?: InputMaybe<CautionClaimStatus>;
};


export type QueryAdminFeedbackArgs = {
  pagination?: InputMaybe<PaginationInput>;
  status?: InputMaybe<FeedbackStatus>;
};


export type QueryAdminFieldInteractionArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminFieldInteractionsArgs = {
  filters?: InputMaybe<AdminFieldInteractionFilters>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryAdminFieldScriptsArgs = {
  interactionType?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAdminGrowthStatsArgs = {
  months?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryAdminHostingArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminHostingVerificationRequestArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminHostingVerificationRequestsArgs = {
  pagination?: InputMaybe<PaginationInput>;
  status?: InputMaybe<HostingVerificationRequestStatus>;
};


export type QueryAdminHostingsArgs = {
  pagination?: InputMaybe<PaginationInput>;
  source?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  verificationTier?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAdminInteractionAnswerSuggestionsArgs = {
  interactionId: Scalars['String']['input'];
  questionText: Scalars['String']['input'];
};


export type QueryAdminNpsScoresArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryAdminPendingDisbursementsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryAdminRoleArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminStaffArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryAdminSupportChatsArgs = {
  pagination?: InputMaybe<PaginationInput>;
  status?: InputMaybe<SupportChatStatus>;
};


export type QueryAdminSupportRatingsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryAdminTransactionsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryAdminUserArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminUsersArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryAdminVerificationTierArgs = {
  tier: Scalars['String']['input'];
};


export type QueryAiHostingContentSuggestionArgs = {
  hostingId: Scalars['String']['input'];
};


export type QueryAiHostingSearchPredictionsArgs = {
  userInput: Scalars['String']['input'];
};


export type QueryBookingArgs = {
  bookingId: Scalars['String']['input'];
};


export type QueryBookingApplicationArgs = {
  bookingApplicationId: Scalars['String']['input'];
};


export type QueryBookingApplicationsArgs = {
  filter?: InputMaybe<BookingApplicationFilter>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryBookingApplicationsCountArgs = {
  filter?: InputMaybe<BookingApplicationFilter>;
};


export type QueryBookingsArgs = {
  filter?: InputMaybe<BookingFilterInput>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryCalculateHostingFeesArgs = {
  hostingId: Scalars['String']['input'];
  multiplier: Scalars['Int']['input'];
};


export type QueryCanLeaveBookingFeedbackArgs = {
  bookingId: Scalars['String']['input'];
};


export type QueryCautionClaimsForBookingArgs = {
  bookingId: Scalars['String']['input'];
};


export type QueryCautionRefundForBookingArgs = {
  bookingId: Scalars['String']['input'];
};


export type QueryChatMessagesArgs = {
  chatId: Scalars['String']['input'];
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryGuestBookingTenancyAgreementPreviewArgs = {
  bookingId: Scalars['String']['input'];
};


export type QueryHostPaymentDetailsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryHostingArgs = {
  hostingId: Scalars['String']['input'];
};


export type QueryHostingChatArgs = {
  chatId: Scalars['String']['input'];
};


export type QueryHostingVerificationRequestsArgs = {
  hostingId: Scalars['String']['input'];
};


export type QueryHostingVerificationTierArgs = {
  tier: Scalars['String']['input'];
};


export type QueryHostingsArgs = {
  filters?: InputMaybe<HostingFilterInput>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryMySupportChatsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryNotificationsArgs = {
  filter?: InputMaybe<NotificationsFilterInput>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryResolveBankAccountArgs = {
  input: VerifyAccountInput;
};


export type QuerySavedHostingArgs = {
  id: Scalars['String']['input'];
};


export type QuerySavedHostingFolderArgs = {
  id: Scalars['String']['input'];
};


export type QuerySavedHostingFoldersArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QuerySavedHostingsArgs = {
  filters?: InputMaybe<SavedHostingFilterInput>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QuerySupportChatArgs = {
  id: Scalars['String']['input'];
};


export type QueryTransactionByReferenceArgs = {
  reference: Scalars['String']['input'];
};


export type QueryTransactionsArgs = {
  filter?: InputMaybe<TransactionFilter>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryUserChatsArgs = {
  filter?: InputMaybe<HostingChatFilter>;
  pagination?: InputMaybe<PaginationInput>;
};

export type RefreshTokenInput = {
  refreshToken: Scalars['String']['input'];
};

export type RequestCautionRefundInput = {
  accountName: Scalars['String']['input'];
  accountNumber: Scalars['String']['input'];
  bankCode: Scalars['String']['input'];
  bankName: Scalars['String']['input'];
  bookingId: Scalars['String']['input'];
};

export type RequestCautionReleaseInput = {
  amount: Scalars['Decimal']['input'];
  bookingId: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
};

export type RequestPasswordChangeInput = {
  email: Scalars['String']['input'];
};

export type RespondToCautionClaimInput = {
  approved: Scalars['Boolean']['input'];
  claimId: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
};

export type Role = {
  __typename?: 'Role';
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isDefault: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  permissions: Array<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
};

export type SavedHosting = {
  __typename?: 'SavedHosting';
  createdAt: Scalars['String']['output'];
  folder?: Maybe<SavedHostingFolder>;
  hosting: Hosting;
  id: Scalars['String']['output'];
  image?: Maybe<HostingRoomImage>;
  lastUpdated: Scalars['String']['output'];
};

export type SavedHostingFilterInput = {
  folderId?: InputMaybe<Scalars['String']['input']>;
  noFolder?: InputMaybe<Scalars['Boolean']['input']>;
};

export type SavedHostingFolder = {
  __typename?: 'SavedHostingFolder';
  createdAt: Scalars['String']['output'];
  folderName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  itemCount: Scalars['Int']['output'];
  lastUpdated: Scalars['String']['output'];
};

export type SavedHostingFolderInput = {
  folderName: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
};

export type SavedHostingFolderResponse = {
  __typename?: 'SavedHostingFolderResponse';
  data?: Maybe<SavedHostingFolder>;
  message: Scalars['String']['output'];
};

export type SavedHostingInput = {
  folderId?: InputMaybe<Scalars['String']['input']>;
  hostingId: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
};

export type SavedHostingResponse = {
  __typename?: 'SavedHostingResponse';
  data?: Maybe<SavedHosting>;
  message: Scalars['String']['output'];
};

export type SignUpInput = {
  email: Scalars['String']['input'];
  fullName: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type StaffInvitation = {
  __typename?: 'StaffInvitation';
  acceptedAt?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  expiresAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  permissions: Array<Scalars['String']['output']>;
  token: Scalars['String']['output'];
};

export type StaffMember = {
  __typename?: 'StaffMember';
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  lastUpdated: Scalars['String']['output'];
  permissions: Array<Scalars['String']['output']>;
  role?: Maybe<Role>;
  roleLabel?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
};

export type SubClause = {
  __typename?: 'SubClause';
  content: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  isCustom: Scalars['Boolean']['output'];
  isMandatory: Scalars['Boolean']['output'];
  priority: Scalars['Int']['output'];
  providedValues: Array<SubClauseValue>;
  requiredVariables: Array<SubClauseVariable>;
  title: Scalars['String']['output'];
};

export type SubClauseInput = {
  content: Scalars['String']['input'];
  description: Scalars['String']['input'];
  id: Scalars['String']['input'];
  isActive: Scalars['Boolean']['input'];
  isCustom: Scalars['Boolean']['input'];
  isMandatory: Scalars['Boolean']['input'];
  priority: Scalars['Int']['input'];
  providedValues: Array<SubClauseValueInput>;
  requiredVariables: Array<SubClauseVariableInput>;
  title: Scalars['String']['input'];
};

export type SubClauseValue = {
  __typename?: 'SubClauseValue';
  key: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type SubClauseValueInput = {
  key: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type SubClauseVariable = {
  __typename?: 'SubClauseVariable';
  name: Scalars['String']['output'];
  type: VariableType;
};

export type SubClauseVariableInput = {
  name: Scalars['String']['input'];
  type: VariableType;
};

export type SubmitFeedbackInput = {
  body: Scalars['String']['input'];
  category?: InputMaybe<Scalars['String']['input']>;
  contactConsent: Scalars['Boolean']['input'];
  feedbackType: FeedbackType;
  rating?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type SubmitNpsInput = {
  context: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  score: Scalars['Int']['input'];
};

export type SubmitSupportRatingInput = {
  chatId: Scalars['String']['input'];
  comment?: InputMaybe<Scalars['String']['input']>;
  rating: Scalars['Int']['input'];
};

export type Subscriptions = {
  __typename?: 'Subscriptions';
  /**
   * Live presence/state of an assist case. Emits the current state on connect
   * and on every subsequent take/release/update.
   */
  adminBookingAssistPresence: BookingAssist;
  latestHostingChatMessage: HostingChatMessage;
  onlineUser: OnlineUser;
  supportChatMessageAdded: SupportChatMessage;
};


export type SubscriptionsAdminBookingAssistPresenceArgs = {
  assistId: Scalars['String']['input'];
};


export type SubscriptionsLatestHostingChatMessageArgs = {
  chatId: Scalars['String']['input'];
};


export type SubscriptionsOnlineUserArgs = {
  userId: Scalars['String']['input'];
};


export type SubscriptionsSupportChatMessageAddedArgs = {
  chatId: Scalars['String']['input'];
};

export type SupportChat = {
  __typename?: 'SupportChat';
  booking?: Maybe<Booking>;
  createdAt: Scalars['String']['output'];
  hosting?: Maybe<Hosting>;
  id: Scalars['String']['output'];
  itemId?: Maybe<Scalars['String']['output']>;
  itemType?: Maybe<SupportItemType>;
  lastUpdated: Scalars['String']['output'];
  messages: Array<SupportChatMessage>;
  status: SupportChatStatus;
  supportChatRating?: Maybe<SupportChatRating>;
  transaction?: Maybe<Transaction>;
  user: User;
};


export type SupportChatMessagesArgs = {
  pagination?: InputMaybe<PaginationInput>;
};

export type SupportChatAsset = {
  __typename?: 'SupportChatAsset';
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
};

export type SupportChatMessage = {
  __typename?: 'SupportChatMessage';
  assets: Array<SupportChatAsset>;
  chatId: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isReadByAdmin: Scalars['Boolean']['output'];
  isReadByUser: Scalars['Boolean']['output'];
  sender?: Maybe<User>;
  text: Scalars['String']['output'];
};

export type SupportChatRating = {
  __typename?: 'SupportChatRating';
  chatId: Scalars['String']['output'];
  comment?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  rating: Scalars['Int']['output'];
  user?: Maybe<User>;
};

export enum SupportChatStatus {
  Closed = 'CLOSED',
  Open = 'OPEN',
  Resolved = 'RESOLVED'
}

export enum SupportItemType {
  Booking = 'BOOKING',
  Hosting = 'HOSTING',
  Transaction = 'TRANSACTION'
}

export type TenancySection = {
  __typename?: 'TenancySection';
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
  preamble?: Maybe<Scalars['String']['output']>;
  priority: Scalars['Int']['output'];
  subClauses: Array<SubClause>;
  title: Scalars['String']['output'];
};

export type TenancySectionInput = {
  description: Scalars['String']['input'];
  id: Scalars['String']['input'];
  preamble?: InputMaybe<Scalars['String']['input']>;
  priority: Scalars['Int']['input'];
  subClauses: Array<SubClauseInput>;
  title: Scalars['String']['input'];
};

export type TenancyTemplate = {
  __typename?: 'TenancyTemplate';
  sections: Array<TenancySection>;
  totalSections: Scalars['Int']['output'];
};

export type TenancyTemplateInput = {
  sections: Array<TenancySectionInput>;
  totalSections: Scalars['Int']['input'];
};

export type TenantMandateConfig = {
  __typename?: 'TenantMandateConfig';
  employmentStatus: Array<OptionItem>;
  guarantorRelationships: Array<OptionItem>;
  incomeRanges: Array<OptionItem>;
  occupancyTypes: Array<OptionItem>;
  reasonsForMoving: Array<OptionItem>;
  residentialStatus: Array<OptionItem>;
};

export type TimeSeriesData = {
  __typename?: 'TimeSeriesData';
  dataPoints: Array<AnalyticsDataPoint>;
};

export type TitleMetadata = {
  __typename?: 'TitleMetadata';
  confidence?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['String']['output'];
  dates?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['String']['output'];
  fileNumbers?: Maybe<Scalars['String']['output']>;
  flagReason?: Maybe<Scalars['String']['output']>;
  flagged: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  names?: Maybe<Scalars['String']['output']>;
  plotReference?: Maybe<Scalars['String']['output']>;
  rawOcrText?: Maybe<Scalars['String']['output']>;
};

export type TitleMetadataResponse = {
  __typename?: 'TitleMetadataResponse';
  data?: Maybe<TitleMetadata>;
  message: Scalars['String']['output'];
};

export type Transaction = {
  __typename?: 'Transaction';
  amount: Scalars['Decimal']['output'];
  /**
   * Disbursement bookkeeping (host payouts): retry attempts, last error, and
   * the recorded net/fee. Null for collection (incoming) transactions.
   */
  attempts: Scalars['Int']['output'];
  booking?: Maybe<Booking>;
  createdAt: Scalars['String']['output'];
  direction: TransactionDirection;
  disbursementAmount?: Maybe<Scalars['Decimal']['output']>;
  flutterwaveChargeId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  lastAttemptAt?: Maybe<Scalars['String']['output']>;
  lastError?: Maybe<Scalars['String']['output']>;
  lastUpdated: Scalars['String']['output'];
  nextAttemptAt?: Maybe<Scalars['String']['output']>;
  reference?: Maybe<Scalars['String']['output']>;
  status: TransactionStatus;
  transferFee?: Maybe<Scalars['Decimal']['output']>;
  transferFeeVat?: Maybe<Scalars['Decimal']['output']>;
  type: TransactionType;
};

export enum TransactionDirection {
  Incoming = 'INCOMING',
  Outgoing = 'OUTGOING'
}

export type TransactionFilter = {
  direction?: InputMaybe<TransactionDirection>;
  guestId?: InputMaybe<Scalars['String']['input']>;
  hostId?: InputMaybe<Scalars['String']['input']>;
  maxAmount?: InputMaybe<Scalars['Decimal']['input']>;
  minAmount?: InputMaybe<Scalars['Decimal']['input']>;
  status?: InputMaybe<TransactionStatus>;
  type?: InputMaybe<TransactionType>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type TransactionResponse = {
  __typename?: 'TransactionResponse';
  data?: Maybe<Transaction>;
  message: Scalars['String']['output'];
};

export enum TransactionStatus {
  Cancelled = 'CANCELLED',
  Failed = 'FAILED',
  /**
   * Dead-letter state for disbursements: a permanent failure or exhausted
   * retries — ops must manually reconcile/retry. Used by the payout worker.
   */
  NeedsReconciliation = 'NEEDS_RECONCILIATION',
  Pending = 'PENDING',
  Processing = 'PROCESSING',
  Refunded = 'REFUNDED',
  Success = 'SUCCESS'
}

export enum TransactionType {
  BookingPayment = 'booking_payment',
  GuestCancellationRefund = 'guest_cancellation_refund',
  HostBookingPayment = 'host_booking_payment',
  HostCancellationCompensation = 'host_cancellation_compensation'
}

export type UpdateFeeConfigInput = {
  /**
   * Days a guest has to pay after their application is accepted before the
   * spot may be released/expired.
   */
  bookingPaymentWindowDays?: InputMaybe<Scalars['Int']['input']>;
  cautionClaimWindowDays?: InputMaybe<Scalars['Int']['input']>;
  cautionCustodyFeePercent?: InputMaybe<Scalars['Decimal']['input']>;
  cautionDisputeFee?: InputMaybe<Scalars['Decimal']['input']>;
  secureLeaseGuestContributionPercent?: InputMaybe<Scalars['Decimal']['input']>;
  shortLetGuestChargesPercent?: InputMaybe<Scalars['Decimal']['input']>;
  shortLetHostChargesPercent?: InputMaybe<Scalars['Decimal']['input']>;
  standardLegalFee?: InputMaybe<Scalars['Decimal']['input']>;
};

export type UpdateNotificationTokensInput = {
  fcmToken?: InputMaybe<Scalars['String']['input']>;
  voipToken?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isStaff: Scalars['Boolean']['output'];
  kushiId: Scalars['String']['output'];
  kyc: Kyc;
  lastUpdated: Scalars['String']['output'];
  notificationSettings: NotificationSettings;
  onlineUser: OnlineUser;
  permissions: Array<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  phoneNumberVerified: Scalars['Boolean']['output'];
  phoneNumbers: Array<PhoneNumber>;
  profile: Profile;
};


export type UserPhoneNumbersArgs = {
  pagination?: InputMaybe<PaginationInput>;
};

export type UserResponse = {
  __typename?: 'UserResponse';
  data?: Maybe<User>;
  message: Scalars['String']['output'];
};

export enum VariableType {
  Number = 'NUMBER',
  String = 'STRING'
}

export type VerificationLogEntry = {
  __typename?: 'VerificationLogEntry';
  action: Scalars['String']['output'];
  datetime: Scalars['String']['output'];
  staffId?: Maybe<Scalars['String']['output']>;
  statusDetail?: Maybe<Scalars['String']['output']>;
  variant: Scalars['String']['output'];
};

export type VerifyAccountInput = {
  accountNumber: Scalars['String']['input'];
  bankCode: Scalars['String']['input'];
};

/**
 * Returned by `createHostingVideoUploadUrl` — the client PUTs the recorded
 * video directly to `uploadUrl`, then calls `setHostingVideo` with `assetId`.
 */
export type VideoUploadTarget = {
  __typename?: 'VideoUploadTarget';
  assetId: Scalars['String']['output'];
  uploadUrl: Scalars['String']['output'];
};

export type VideoWalkthrough = {
  __typename?: 'VideoWalkthrough';
  /** The underlying video asset (public URL for playback in the gallery). */
  asset: Asset;
  consentText?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  durationSeconds: Scalars['Int']['output'];
  expiresAt: Scalars['String']['output'];
  geofenceStatus: Scalars['String']['output'];
  gpsEndLat?: Maybe<Scalars['Float']['output']>;
  gpsEndLng?: Maybe<Scalars['Float']['output']>;
  gpsSamples?: Maybe<Scalars['String']['output']>;
  gpsStartLat?: Maybe<Scalars['Float']['output']>;
  gpsStartLng?: Maybe<Scalars['Float']['output']>;
  hostingId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  ndprConsent: Scalars['Boolean']['output'];
  recordedAt: Scalars['String']['output'];
  verified: Scalars['Boolean']['output'];
  videoAssetId: Scalars['String']['output'];
};

export type VideoWalkthroughInput = {
  consentText?: InputMaybe<Scalars['String']['input']>;
  durationSeconds: Scalars['Int']['input'];
  geofenceStatus: Scalars['String']['input'];
  gpsEndLat?: InputMaybe<Scalars['Float']['input']>;
  gpsEndLng?: InputMaybe<Scalars['Float']['input']>;
  gpsSamples?: InputMaybe<Scalars['String']['input']>;
  gpsStartLat?: InputMaybe<Scalars['Float']['input']>;
  gpsStartLng?: InputMaybe<Scalars['Float']['input']>;
  hostingId: Scalars['String']['input'];
  ndprConsent: Scalars['Boolean']['input'];
  recordedAt: Scalars['String']['input'];
};

export type VideoWalkthroughResponse = {
  __typename?: 'VideoWalkthroughResponse';
  data?: Maybe<VideoWalkthrough>;
  message: Scalars['String']['output'];
};

export type SignUpMutationVariables = Exact<{
  input: SignUpInput;
}>;


export type SignUpMutation = { __typename?: 'Mutations', signUp: { __typename?: 'UserResponse', message: string } };

export type GoogleSignUpMutationVariables = Exact<{
  idToken: Scalars['String']['input'];
}>;


export type GoogleSignUpMutation = { __typename?: 'Mutations', googleSignUp: { __typename?: 'AuthTokenResponse', message: string, data?: { __typename?: 'AuthToken', token: string, refreshToken: string, expiresAt: string, user: { __typename?: 'User', id: string, email: string, kushiId: string, createdAt: string, lastUpdated: string, profile: { __typename?: 'Profile', id: string, fullName: string, gender?: string | null, createdAt: string, lastUpdated: string, image?: { __typename?: 'Asset', publicUrl: string } | null }, notificationSettings: { __typename?: 'NotificationSettings', id: string, email: boolean, appUpdates: boolean, pushNotifications: boolean, specialOffers: boolean, fcmToken?: string | null, voipToken?: string | null }, kyc: { __typename?: 'Kyc', id: string, bvnVerified?: boolean | null, ninVerified?: boolean | null, idDocumentType?: string | null, kycReferenceId?: string | null, image?: { __typename?: 'Asset', id: string, secureUrl: string } | null }, phoneNumbers: Array<{ __typename?: 'PhoneNumber', id: string, number: string, verificationStatus: PhoneNumberVerificationStatus }> } } | null } };

export type RefreshTokenMutationVariables = Exact<{
  input: RefreshTokenInput;
}>;


export type RefreshTokenMutation = { __typename?: 'Mutations', refreshToken: { __typename?: 'AuthTokenResponse', message: string, data?: { __typename?: 'AuthToken', token: string, refreshToken: string, expiresAt: string, user: { __typename?: 'User', id: string, email: string, kushiId: string, createdAt: string, lastUpdated: string, profile: { __typename?: 'Profile', id: string, fullName: string, gender?: string | null, createdAt: string, lastUpdated: string, image?: { __typename?: 'Asset', publicUrl: string } | null }, notificationSettings: { __typename?: 'NotificationSettings', id: string, email: boolean, appUpdates: boolean, pushNotifications: boolean, specialOffers: boolean, fcmToken?: string | null, voipToken?: string | null }, kyc: { __typename?: 'Kyc', id: string, bvnVerified?: boolean | null, ninVerified?: boolean | null, idDocumentType?: string | null, kycReferenceId?: string | null, image?: { __typename?: 'Asset', id: string, secureUrl: string } | null }, phoneNumbers: Array<{ __typename?: 'PhoneNumber', id: string, number: string, verificationStatus: PhoneNumberVerificationStatus }> } } | null } };

export type VerifyEmailMutationVariables = Exact<{
  input: Otpinput;
}>;


export type VerifyEmailMutation = { __typename?: 'Mutations', verifyEmail: { __typename?: 'MessageResponse', message: string } };

export type ResendEmailVerificationOtpMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type ResendEmailVerificationOtpMutation = { __typename?: 'Mutations', resendEmailVerificationOtp: { __typename?: 'MessageResponse', message: string } };

export type GoogleLoginMutationVariables = Exact<{
  idToken: Scalars['String']['input'];
}>;


export type GoogleLoginMutation = { __typename?: 'Mutations', googleLogin: { __typename?: 'AuthTokenResponse', message: string, data?: { __typename?: 'AuthToken', token: string, refreshToken: string, expiresAt: string, user: { __typename?: 'User', id: string, email: string, kushiId: string, createdAt: string, lastUpdated: string, profile: { __typename?: 'Profile', id: string, fullName: string, gender?: string | null, createdAt: string, lastUpdated: string, image?: { __typename?: 'Asset', publicUrl: string } | null }, notificationSettings: { __typename?: 'NotificationSettings', id: string, email: boolean, appUpdates: boolean, pushNotifications: boolean, specialOffers: boolean, fcmToken?: string | null, voipToken?: string | null }, kyc: { __typename?: 'Kyc', id: string, bvnVerified?: boolean | null, ninVerified?: boolean | null, idDocumentType?: string | null, kycReferenceId?: string | null, image?: { __typename?: 'Asset', id: string, secureUrl: string } | null }, phoneNumbers: Array<{ __typename?: 'PhoneNumber', id: string, number: string, verificationStatus: PhoneNumberVerificationStatus }> } } | null } };

export type AppleLoginMutationVariables = Exact<{
  input: AppleAuthInput;
}>;


export type AppleLoginMutation = { __typename?: 'Mutations', appleLogin: { __typename?: 'AuthTokenResponse', message: string, data?: { __typename?: 'AuthToken', token: string, refreshToken: string, expiresAt: string, user: { __typename?: 'User', id: string, email: string, kushiId: string, createdAt: string, lastUpdated: string, profile: { __typename?: 'Profile', id: string, fullName: string, gender?: string | null, createdAt: string, lastUpdated: string, image?: { __typename?: 'Asset', publicUrl: string } | null }, notificationSettings: { __typename?: 'NotificationSettings', id: string, email: boolean, appUpdates: boolean, pushNotifications: boolean, specialOffers: boolean, fcmToken?: string | null, voipToken?: string | null }, kyc: { __typename?: 'Kyc', id: string, bvnVerified?: boolean | null, ninVerified?: boolean | null, idDocumentType?: string | null, kycReferenceId?: string | null, image?: { __typename?: 'Asset', id: string, secureUrl: string } | null }, phoneNumbers: Array<{ __typename?: 'PhoneNumber', id: string, number: string, verificationStatus: PhoneNumberVerificationStatus }> } } | null } };

export type AppleSignUpMutationVariables = Exact<{
  input: AppleAuthInput;
}>;


export type AppleSignUpMutation = { __typename?: 'Mutations', appleSignUp: { __typename?: 'AuthTokenResponse', message: string, data?: { __typename?: 'AuthToken', token: string, refreshToken: string, expiresAt: string, user: { __typename?: 'User', id: string, email: string, kushiId: string, createdAt: string, lastUpdated: string, profile: { __typename?: 'Profile', id: string, fullName: string, gender?: string | null, createdAt: string, lastUpdated: string, image?: { __typename?: 'Asset', publicUrl: string } | null }, notificationSettings: { __typename?: 'NotificationSettings', id: string, email: boolean, appUpdates: boolean, pushNotifications: boolean, specialOffers: boolean, fcmToken?: string | null, voipToken?: string | null }, kyc: { __typename?: 'Kyc', id: string, bvnVerified?: boolean | null, ninVerified?: boolean | null, idDocumentType?: string | null, kycReferenceId?: string | null, image?: { __typename?: 'Asset', id: string, secureUrl: string } | null }, phoneNumbers: Array<{ __typename?: 'PhoneNumber', id: string, number: string, verificationStatus: PhoneNumberVerificationStatus }> } } | null } };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutations', login: { __typename?: 'AuthTokenResponse', message: string, data?: { __typename?: 'AuthToken', token: string, refreshToken: string, expiresAt: string, user: { __typename?: 'User', id: string, email: string, kushiId: string, createdAt: string, lastUpdated: string, profile: { __typename?: 'Profile', id: string, fullName: string, gender?: string | null, createdAt: string, lastUpdated: string, image?: { __typename?: 'Asset', publicUrl: string } | null }, notificationSettings: { __typename?: 'NotificationSettings', id: string, email: boolean, appUpdates: boolean, pushNotifications: boolean, specialOffers: boolean, fcmToken?: string | null, voipToken?: string | null }, kyc: { __typename?: 'Kyc', id: string, bvnVerified?: boolean | null, ninVerified?: boolean | null, idDocumentType?: string | null, kycReferenceId?: string | null, image?: { __typename?: 'Asset', id: string, secureUrl: string } | null }, phoneNumbers: Array<{ __typename?: 'PhoneNumber', id: string, number: string, verificationStatus: PhoneNumberVerificationStatus }> } } | null } };

export type RequestPasswordChangeMutationVariables = Exact<{
  input: RequestPasswordChangeInput;
}>;


export type RequestPasswordChangeMutation = { __typename?: 'Mutations', requestPasswordChange: { __typename?: 'MessageResponse', message: string } };

export type ResendPasswordChangeOtpMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type ResendPasswordChangeOtpMutation = { __typename?: 'Mutations', resendPasswordChangeOtp: { __typename?: 'MessageResponse', message: string } };

export type CompletePasswordChangeMutationVariables = Exact<{
  input: CompletePasswordChangeInput;
}>;


export type CompletePasswordChangeMutation = { __typename?: 'Mutations', completePasswordChange: { __typename?: 'MessageResponse', message: string } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutations', logout: { __typename?: 'MessageResponse', message: string } };

export type InitiateBookingApplicationMutationVariables = Exact<{
  hostingId: Scalars['String']['input'];
}>;


export type InitiateBookingApplicationMutation = { __typename?: 'Mutations', initiateBookingApplication: { __typename?: 'BookingApplicationResponse', message: string, data?: { __typename?: 'BookingApplication', id: string, fullName?: string | null, email?: string | null, phoneNumber?: string | null, commencementDate?: string | null, correspondenceAddress?: string | null, intervalMultiplier?: number | null, status: BookingApplicationStatus, statusDetails?: string | null, createdAt: string, lastUpdated: string, bookingAggrement?: { __typename?: 'TenancyTemplate', totalSections: number, sections: Array<{ __typename?: 'TenancySection', id: string, title: string, description: string, priority: number, preamble?: string | null, subClauses: Array<{ __typename?: 'SubClause', id: string, title: string, description: string, priority: number, content: string, isMandatory: boolean, isActive: boolean, isCustom: boolean, requiredVariables: Array<{ __typename?: 'SubClauseVariable', name: string, type: VariableType }>, providedValues: Array<{ __typename?: 'SubClauseValue', key: string, value: string }> }> }> } | null, guestFormData?: { __typename?: 'GuestFormData', employmentStatus: GuestFormEmploymentStatus, incomeRanges?: GuestFormIncomeRange | null, occupancyTypes: GuestFormOccupancyType, guarantorRelationships?: GuestFormGuarantorRelationships | null, guarantorName?: string | null, guarantorPhone?: string | null, guarantorAddress?: string | null } | null } | null } };

export type UpdateBookingApplicationMutationVariables = Exact<{
  input: BookingApplicationUpdateInput;
}>;


export type UpdateBookingApplicationMutation = { __typename?: 'Mutations', updateBookingApplication: { __typename?: 'BookingApplicationResponse', message: string, data?: { __typename?: 'BookingApplication', id: string, fullName?: string | null, email?: string | null, phoneNumber?: string | null, commencementDate?: string | null, correspondenceAddress?: string | null, intervalMultiplier?: number | null, status: BookingApplicationStatus, statusDetails?: string | null, createdAt: string, lastUpdated: string, bookingAggrement?: { __typename?: 'TenancyTemplate', totalSections: number, sections: Array<{ __typename?: 'TenancySection', id: string, title: string, description: string, priority: number, preamble?: string | null, subClauses: Array<{ __typename?: 'SubClause', id: string, title: string, description: string, priority: number, content: string, isMandatory: boolean, isActive: boolean, isCustom: boolean, requiredVariables: Array<{ __typename?: 'SubClauseVariable', name: string, type: VariableType }>, providedValues: Array<{ __typename?: 'SubClauseValue', key: string, value: string }> }> }> } | null, guestFormData?: { __typename?: 'GuestFormData', employmentStatus: GuestFormEmploymentStatus, incomeRanges?: GuestFormIncomeRange | null, occupancyTypes: GuestFormOccupancyType, guarantorRelationships?: GuestFormGuarantorRelationships | null, guarantorName?: string | null, guarantorPhone?: string | null, guarantorAddress?: string | null } | null } | null } };

export type VerifyBookingPaymentMutationVariables = Exact<{
  verifyBookingPaymentId: Scalars['String']['input'];
}>;


export type VerifyBookingPaymentMutation = { __typename?: 'Mutations', verifyBookingPayment: { __typename?: 'BookingResponse', message: string, data?: { __typename?: 'Booking', id: string, paymentStatus: PaymentStatus } | null } };

export type InitiateFinalizeBookingMutationVariables = Exact<{
  bookingId: Scalars['String']['input'];
}>;


export type InitiateFinalizeBookingMutation = { __typename?: 'Mutations', initiateFinalizeBooking: { __typename?: 'MessageResponse', message: string } };

export type FinalizeBookingMutationVariables = Exact<{
  bookingId: Scalars['String']['input'];
  otp: Scalars['String']['input'];
}>;


export type FinalizeBookingMutation = { __typename?: 'Mutations', finalizeBooking: { __typename?: 'Booking', id: string } };

export type InitiateBookingApplicationSubmissionMutationVariables = Exact<{
  applicationId: Scalars['String']['input'];
}>;


export type InitiateBookingApplicationSubmissionMutation = { __typename?: 'Mutations', initiateBookingApplicationSubmission: { __typename?: 'MessageResponse', message: string } };

export type CompleteBookingApplicationSubmissionMutationVariables = Exact<{
  input: BookingApplicationSubmissionInput;
}>;


export type CompleteBookingApplicationSubmissionMutation = { __typename?: 'Mutations', completeBookingApplicationSubmission: { __typename?: 'BookingApplicationResponse', message: string } };

export type HostUpdateBookingApplicationStatusMutationVariables = Exact<{
  input: BookingApplicationStatusUpdateInput;
}>;


export type HostUpdateBookingApplicationStatusMutation = { __typename?: 'Mutations', hostUpdateBookingApplicationStatus: { __typename?: 'BookingApplicationResponse', message: string } };

export type InitiateCancelBookingMutationVariables = Exact<{
  bookingId: Scalars['String']['input'];
}>;


export type InitiateCancelBookingMutation = { __typename?: 'Mutations', initiateCancelBooking: { __typename?: 'MessageResponse', message: string } };

export type CancelBookingMutationVariables = Exact<{
  bookingId: Scalars['String']['input'];
  otp: Scalars['String']['input'];
}>;


export type CancelBookingMutation = { __typename?: 'Mutations', cancelBooking: { __typename?: 'MessageResponse', message: string } };

export type CancelBookingApplicationMutationVariables = Exact<{
  applicationId: Scalars['String']['input'];
}>;


export type CancelBookingApplicationMutation = { __typename?: 'Mutations', cancelBookingApplication: { __typename?: 'MessageResponse', message: string } };

export type InitiateAcceptBookingApplicationMutationVariables = Exact<{
  applicationId: Scalars['String']['input'];
}>;


export type InitiateAcceptBookingApplicationMutation = { __typename?: 'Mutations', initiateAcceptBookingApplication: { __typename?: 'MessageResponse', message: string } };

export type AcceptBookingApplicationMutationVariables = Exact<{
  applicationId: Scalars['String']['input'];
  otp: Scalars['String']['input'];
}>;


export type AcceptBookingApplicationMutation = { __typename?: 'Mutations', acceptBookingApplication: { __typename?: 'BookingApplicationResponse', message: string, data?: { __typename?: 'BookingApplication', id: string, status: BookingApplicationStatus, statusDetails?: string | null } | null } };

export type RequestCautionReleaseMutationVariables = Exact<{
  input: RequestCautionReleaseInput;
}>;


export type RequestCautionReleaseMutation = { __typename?: 'Mutations', requestCautionRelease: { __typename?: 'CautionClaimResponse', message: string, data?: { __typename?: 'CautionClaim', id: string, bookingId: string, amountRequested: any, status: CautionClaimStatus, hostNotes?: string | null, disputeFeeApplied: boolean, createdAt: string, lastUpdated: string } | null } };

export type RespondToCautionClaimMutationVariables = Exact<{
  input: RespondToCautionClaimInput;
}>;


export type RespondToCautionClaimMutation = { __typename?: 'Mutations', respondToCautionClaim: { __typename?: 'CautionClaimResponse', message: string, data?: { __typename?: 'CautionClaim', id: string, bookingId: string, amountRequested: any, status: CautionClaimStatus, guestResponseNotes?: string | null, disputeFeeApplied: boolean, createdAt: string, lastUpdated: string } | null } };

export type RequestCautionRefundMutationVariables = Exact<{
  input: RequestCautionRefundInput;
}>;


export type RequestCautionRefundMutation = { __typename?: 'Mutations', requestCautionRefund: { __typename?: 'CautionRefundResponse', message: string, data?: { __typename?: 'CautionRefund', id: string, bookingId: string, amount: any, status: CautionRefundStatus, accountNumber: string, accountName: string, bankName: string, bankCode: string, createdAt: string, lastUpdated: string } | null } };

export type SubmitFeedbackMutationVariables = Exact<{
  input: SubmitFeedbackInput;
}>;


export type SubmitFeedbackMutation = { __typename?: 'Mutations', submitFeedback: { __typename?: 'Feedback', id: string, type: FeedbackType, category?: string | null, rating?: number | null, title?: string | null, body: string, contactConsent: boolean, status: FeedbackStatus, createdAt: string } };

export type SubmitNpsMutationVariables = Exact<{
  input: SubmitNpsInput;
}>;


export type SubmitNpsMutation = { __typename?: 'Mutations', submitNps: { __typename?: 'Npsscore', id: string, score: number, reason?: string | null, context: string, createdAt: string } };

export type SubmitSupportRatingMutationVariables = Exact<{
  input: SubmitSupportRatingInput;
}>;


export type SubmitSupportRatingMutation = { __typename?: 'Mutations', submitSupportRating: { __typename?: 'SupportChatRating', id: string, chatId: string, rating: number, comment?: string | null, createdAt: string } };

export type AddSupportMessageAttachmentMutationVariables = Exact<{
  messageId: Scalars['String']['input'];
  file: Scalars['Upload']['input'];
}>;


export type AddSupportMessageAttachmentMutation = { __typename?: 'Mutations', addSupportMessageAttachment: boolean };

export type InitiateHostingChatMutationVariables = Exact<{
  hostingId: Scalars['String']['input'];
}>;


export type InitiateHostingChatMutation = { __typename?: 'Mutations', initiateHostingChat: { __typename?: 'HostingChat', id: string } };

export type CreateUpdateMessageMutationVariables = Exact<{
  input: HostingChatMessageInput;
}>;


export type CreateUpdateMessageMutation = { __typename?: 'Mutations', createUpdateMessage: { __typename?: 'HostingChatMessage', id: string, text: string, messageType?: string | null, callType?: string | null, callId?: string | null, callDurationSeconds?: number | null, isSender: boolean, edited?: boolean | null, createdAt: string, lastUpdated: string, sender: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', id: string, gender?: string | null, fullName: string } }, assets: Array<{ __typename?: 'HostingChatAsset', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string, contentType?: string | null, originalFilename?: string | null } }> } };

export type ClearChatUrnreadMessagesMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type ClearChatUrnreadMessagesMutation = { __typename?: 'Mutations', clearChatUrnreadMessages: { __typename?: 'MessageResponse', message: string } };

export type SendChatCallNotificationMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  callType: CallType;
  callId: Scalars['String']['input'];
  durationSeconds?: InputMaybe<Scalars['Int']['input']>;
  callKind?: InputMaybe<Scalars['String']['input']>;
}>;


export type SendChatCallNotificationMutation = { __typename?: 'Mutations', sendChatCallNotification: { __typename?: 'MessageResponse', message: string } };

export type CreateUpdateSavedHostingFolderMutationVariables = Exact<{
  input: SavedHostingFolderInput;
}>;


export type CreateUpdateSavedHostingFolderMutation = { __typename?: 'Mutations', createUpdateSavedHostingFolder: { __typename?: 'SavedHostingFolderResponse', message: string, data?: { __typename?: 'SavedHostingFolder', id: string } | null } };

export type CreateOrUpdateHostingMutationVariables = Exact<{
  input: HostingInput;
}>;


export type CreateOrUpdateHostingMutation = { __typename?: 'Mutations', createOrUpdateHosting: { __typename?: 'HostingResponse', message: string, data?: { __typename?: 'Hosting', id: string, kind: HostingKind, parentId?: string | null, title?: string | null, propertyType?: string | null, listingType?: ListingType | null, description?: string | null, categories?: Array<string> | null, postalCode?: string | null, city?: string | null, street?: string | null, state?: string | null, country?: string | null, longitude?: string | null, latitude?: string | null, landmarks?: string | null, contact?: string | null, price?: any | null, paymentInterval?: PaymentInterval | null, facilities?: Array<string> | null, averageRating?: number | null, totalRatings?: number | null, publishStatus?: PublishStatus | null, createdAt: string, lastUpdated: string, saved: boolean, cautionFee?: any | null, serviceCharge?: any | null, maxOccupants?: number | null, bookingApplicationsCount: number, rooms: Array<{ __typename?: 'HostingRoom', id: string, name: string, count?: number | null, description?: string | null, createdAt: string, lastUpdated: string, images: Array<{ __typename?: 'HostingRoomImage', id: string, createdAt: string, lastUpdated: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } }> }>, host: { __typename?: 'Host', id: string, createdAt: string, user: { __typename?: 'User', id: string, email: string, profile: { __typename?: 'Profile', fullName: string, gender?: string | null, id: string } } }, coverImage?: { __typename?: 'HostingRoomImage', id: string, createdAt: string, lastUpdated: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } } | null, paymentDetails?: { __typename?: 'HostAccountDetails', id: string, accountNumber: string, accountName?: string | null, bankCode: string, createdAt: string, lastUpdated: string, bankDetails?: { __typename?: 'Bank', name: string, slug: string, code: string, active: boolean, currency: string, image: string } | null } | null, reviews: Array<{ __typename?: 'HostingReview', averageRating?: number | null, description?: string | null, lastUpdated: string, id: string, user: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', fullName: string, id: string, gender?: string | null } } }>, reviewAverage: { __typename?: 'HostingReviewAverage', cleanliness?: number | null, accuracy?: number | null, communication?: number | null, location?: number | null, checkIn?: number | null, value?: number | null }, tenancyAgreementTemplate?: { __typename?: 'TenancyTemplate', sections: Array<{ __typename?: 'TenancySection', id: string, title: string, description: string, priority: number, preamble?: string | null, subClauses: Array<{ __typename?: 'SubClause', id: string, title: string, description: string, content: string, isMandatory: boolean, isActive: boolean, priority: number, isCustom: boolean, requiredVariables: Array<{ __typename?: 'SubClauseVariable', name: string, type: VariableType }>, providedValues: Array<{ __typename?: 'SubClauseValue', key: string, value: string }> }> }> } | null, verification?: { __typename?: 'HostingVerificationData', id: string, landlordFullName: string, landlordAddress: string, verificationTier: HostingVerificationTier, propertyRelationship: HostingPropertyRelationship, declOwnership: boolean, declLitigation: boolean, declIndemnity: boolean, titleType?: string | null, titleNumber?: string | null, createdAt: string, lastUpdated: string } | null } | null } };

export type CreateOrUpdateHostingRoomMutationVariables = Exact<{
  input: HostingRoomInput;
}>;


export type CreateOrUpdateHostingRoomMutation = { __typename?: 'Mutations', createOrUpdateHostingRoom: { __typename?: 'HostingRoomResponse', message: string, data?: { __typename?: 'HostingRoom', name: string, id: string, description?: string | null, createdAt: string, lastUpdated: string, count?: number | null, images: Array<{ __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', publicUrl: string, id: string } }> } | null } };

export type CreateHostingRoomImageMutationVariables = Exact<{
  input: HostingRoomImageInput;
}>;


export type CreateHostingRoomImageMutation = { __typename?: 'Mutations', createHostingRoomImage: { __typename?: 'HostingRoomImageResponse', message: string, data?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } } | null } };

export type SetHostingCoverImageMutationVariables = Exact<{
  hostingRoomImageId: Scalars['String']['input'];
}>;


export type SetHostingCoverImageMutation = { __typename?: 'Mutations', setHostingCoverImage: { __typename?: 'HostingRoomImageResponse', message: string, data?: { __typename?: 'HostingRoomImage', id: string, sequence: number, asset: { __typename?: 'Asset', id: string, publicUrl: string } } | null } };

export type CreateHostingVideoUploadUrlMutationVariables = Exact<{
  hostingId: Scalars['String']['input'];
  contentType: Scalars['String']['input'];
}>;


export type CreateHostingVideoUploadUrlMutation = { __typename?: 'Mutations', createHostingVideoUploadUrl: { __typename?: 'VideoUploadTarget', assetId: string, uploadUrl: string } };

export type SetHostingVideoMutationVariables = Exact<{
  input: VideoWalkthroughInput;
  assetId: Scalars['String']['input'];
}>;


export type SetHostingVideoMutation = { __typename?: 'Mutations', setHostingVideo: { __typename?: 'VideoWalkthroughResponse', message: string, data?: { __typename?: 'VideoWalkthrough', id: string, durationSeconds: number, asset: { __typename?: 'Asset', id: string, publicUrl: string } } | null } };

export type ReorderHostingRoomsMutationVariables = Exact<{
  hostingId: Scalars['String']['input'];
  orderedRoomIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type ReorderHostingRoomsMutation = { __typename?: 'Mutations', reorderHostingRooms: { __typename?: 'MessageResponse', message: string } };

export type ReorderHostingRoomImagesMutationVariables = Exact<{
  roomId: Scalars['String']['input'];
  orderedImageIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type ReorderHostingRoomImagesMutation = { __typename?: 'Mutations', reorderHostingRoomImages: { __typename?: 'MessageResponse', message: string } };

export type DeleteHostingRoomImageMutationVariables = Exact<{
  hostingRoomImageId: Scalars['String']['input'];
}>;


export type DeleteHostingRoomImageMutation = { __typename?: 'Mutations', deleteHostingRoomImage: { __typename?: 'MessageResponse', message: string } };

export type MoveHostingRoomImagesMutationVariables = Exact<{
  targetRoomId: Scalars['String']['input'];
  imageIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type MoveHostingRoomImagesMutation = { __typename?: 'Mutations', moveHostingRoomImages: { __typename?: 'MessageResponse', message: string } };

export type DeleteHostingRoomMutationVariables = Exact<{
  hostingRoomId: Scalars['String']['input'];
}>;


export type DeleteHostingRoomMutation = { __typename?: 'Mutations', deleteHostingRoom: { __typename?: 'MessageResponse', message: string } };

export type CreateUpdateSavedHostingMutationVariables = Exact<{
  input: SavedHostingInput;
}>;


export type CreateUpdateSavedHostingMutation = { __typename?: 'Mutations', createUpdateSavedHosting: { __typename?: 'SavedHostingResponse', message: string } };

export type DeleteSavedHostingMutationVariables = Exact<{
  hostingId: Scalars['String']['input'];
}>;


export type DeleteSavedHostingMutation = { __typename?: 'Mutations', deleteSavedHosting: { __typename?: 'MessageResponse', message: string } };

export type DeleteSavedHostingFolderMutationVariables = Exact<{
  folderId: Scalars['String']['input'];
}>;


export type DeleteSavedHostingFolderMutation = { __typename?: 'Mutations', deleteSavedHostingFolder: { __typename?: 'MessageResponse', message: string } };

export type CreateUpdateHostingReviewMutationVariables = Exact<{
  input: HostingReviewInput;
}>;


export type CreateUpdateHostingReviewMutation = { __typename?: 'Mutations', createOrUpdateHostingReview: { __typename?: 'HostingReviewResponse', message: string, data?: { __typename?: 'HostingReview', id: string } | null } };

export type InitiateHostingVerificationMutationVariables = Exact<{
  input: HostingVerificationInput;
}>;


export type InitiateHostingVerificationMutation = { __typename?: 'Mutations', initiateHostingVerification: { __typename?: 'HostingVerificationResponse', message: string, data?: { __typename?: 'HostingVerificationData', id: string, landlordFullName: string, landlordAddress: string, verificationTier: HostingVerificationTier, propertyRelationship: HostingPropertyRelationship, declOwnership: boolean, declLitigation: boolean, declIndemnity: boolean, titleType?: string | null, titleNumber?: string | null, createdAt: string, lastUpdated: string } | null } };

export type RequestHostingVerificationTierMutationVariables = Exact<{
  input: HostingVerificationTierRequestInput;
}>;


export type RequestHostingVerificationTierMutation = { __typename?: 'Mutations', requestHostingVerificationTier: { __typename?: 'HostingVerificationRequestResponse', message: string, data?: { __typename?: 'HostingVerificationRequest', id: string, tier: HostingVerificationTier, status: HostingVerificationRequestStatus, statusDetails?: string | null, createdAt: string, lastUpdated: string, documents: Array<{ __typename?: 'HostingVerificationRequestDocument', id: string, name: string, createdAt: string, lastUpdated: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } }>, logs: Array<{ __typename?: 'VerificationLogEntry', datetime: string, variant: string, staffId?: string | null, action: string, statusDetail?: string | null }> } | null } };

export type DeleteHostingMutationVariables = Exact<{
  hostingId: Scalars['String']['input'];
}>;


export type DeleteHostingMutation = { __typename?: 'Mutations', deleteHosting: { __typename?: 'MessageResponse', message: string } };

export type DuplicateHostingMutationVariables = Exact<{
  sourceHostingId: Scalars['String']['input'];
}>;


export type DuplicateHostingMutation = { __typename?: 'Mutations', duplicateHosting: { __typename?: 'HostingResponse', message: string, data?: { __typename?: 'Hosting', id: string } | null } };

export type MarkNotificationAsReadMutationVariables = Exact<{
  notificationId: Scalars['String']['input'];
}>;


export type MarkNotificationAsReadMutation = { __typename?: 'Mutations', markNotificationAsRead: { __typename?: 'MessageResponse', message: string } };

export type MarkAllNotificationsAsReadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllNotificationsAsReadMutation = { __typename?: 'Mutations', markAllNotificationsAsRead: { __typename?: 'MessageResponse', message: string } };

export type CreateUpdateHostPaymentDetailsMutationVariables = Exact<{
  input: HostAccountDetailsInput;
}>;


export type CreateUpdateHostPaymentDetailsMutation = { __typename?: 'Mutations', createUpdateHostPaymentDetails: { __typename?: 'HostAccountDetailsResponse', message: string, data?: { __typename?: 'HostAccountDetails', id: string, accountNumber: string, bankCode: string, createdAt: string, lastUpdated: string, accountName?: string | null, bankDetails?: { __typename?: 'Bank', name: string, slug: string, code: string, active: boolean, currency: string, image: string } | null } | null } };

export type RetryBookingPaymentMutationVariables = Exact<{
  bookingId: Scalars['String']['input'];
}>;


export type RetryBookingPaymentMutation = { __typename?: 'Mutations', retryBookingPayment: { __typename?: 'TransactionResponse', message: string, data?: { __typename?: 'Transaction', id: string, reference?: string | null, amount: any, status: TransactionStatus } | null } };

export type VerifyTransactionByReferenceMutationVariables = Exact<{
  reference: Scalars['String']['input'];
}>;


export type VerifyTransactionByReferenceMutation = { __typename?: 'Mutations', verifyTransactionByReference: { __typename?: 'TransactionResponse', message: string, data?: { __typename?: 'Transaction', id: string, status: TransactionStatus } | null } };

export type InitiateSupportChatMutationVariables = Exact<{
  itemType?: InputMaybe<SupportItemType>;
  itemId?: InputMaybe<Scalars['String']['input']>;
  initialMessage?: InputMaybe<Scalars['String']['input']>;
}>;


export type InitiateSupportChatMutation = { __typename?: 'Mutations', initiateSupportChat: { __typename?: 'SupportChat', id: string, status: SupportChatStatus, createdAt: string, lastUpdated: string, messages: Array<{ __typename?: 'SupportChatMessage', id: string }> } };

export type SendSupportMessageMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  text: Scalars['String']['input'];
}>;


export type SendSupportMessageMutation = { __typename?: 'Mutations', sendSupportMessage: { __typename?: 'SupportChatMessage', id: string, chatId: string, text: string, createdAt: string, isReadByUser: boolean, sender?: { __typename?: 'User', id: string, isStaff: boolean, profile: { __typename?: 'Profile', fullName: string } } | null } };

export type UpdateHostMutationVariables = Exact<{
  input: HostInput;
}>;


export type UpdateHostMutation = { __typename?: 'Mutations', updateHost: { __typename?: 'HostResponse', message: string, data?: { __typename?: 'Host', signature?: { __typename?: 'Asset', id: string, publicUrl: string } | null } | null } };

export type UpdateGuestMutationVariables = Exact<{
  input: GuestInput;
}>;


export type UpdateGuestMutation = { __typename?: 'Mutations', updateGuest: { __typename?: 'GuestResponse', message: string, data?: { __typename?: 'Guest', signature?: { __typename?: 'Asset', publicUrl: string, id: string } | null } | null } };

export type UpdatePushNotificationTokenMutationVariables = Exact<{
  input: UpdateNotificationTokensInput;
}>;


export type UpdatePushNotificationTokenMutation = { __typename?: 'Mutations', updatePushNotificationToken: { __typename?: 'NotificationSettingsResponse', message: string } };

export type UpdateUserNotificationSettingsMutationVariables = Exact<{
  input: NotificationSettingsInput;
}>;


export type UpdateUserNotificationSettingsMutation = { __typename?: 'Mutations', updateUserNotificationSettings: { __typename?: 'NotificationSettingsResponse', message: string, data?: { __typename?: 'NotificationSettings', id: string, pushNotifications: boolean, specialOffers: boolean, email: boolean, appUpdates: boolean } | null } };

export type UpdateProfileMutationVariables = Exact<{
  input: ProfileUpdateInput;
}>;


export type UpdateProfileMutation = { __typename?: 'Mutations', updateProfile: { __typename?: 'ProfileResponse', message: string, data?: { __typename?: 'Profile', id: string, fullName: string, gender?: string | null, createdAt: string, lastUpdated: string, image?: { __typename?: 'Asset', publicUrl: string } | null } | null } };

export type UploadKycImageMutationVariables = Exact<{
  file: Scalars['Upload']['input'];
}>;


export type UploadKycImageMutation = { __typename?: 'Mutations', uploadKycImage: { __typename?: 'Kyc', id: string, image?: { __typename?: 'Asset', id: string, secureUrl: string } | null } };

export type VerifyKycMutationVariables = Exact<{
  input: KycInput;
}>;


export type VerifyKycMutation = { __typename?: 'Mutations', verifyKyc: { __typename?: 'Kyc', bvnVerified?: boolean | null, id: string, ninVerified?: boolean | null, image?: { __typename?: 'Asset', id: string, secureUrl: string } | null } };

export type InitiatePhoneNumberVerificationMutationVariables = Exact<{
  phoneNumber: Scalars['String']['input'];
}>;


export type InitiatePhoneNumberVerificationMutation = { __typename?: 'Mutations', initiatePhoneNumberVerification: { __typename?: 'MessageResponse', message: string } };

export type CompletePhoneNumberVerificationMutationVariables = Exact<{
  input: PhoneNumberVerificationInput;
}>;


export type CompletePhoneNumberVerificationMutation = { __typename?: 'Mutations', completePhoneNumberVerification: { __typename?: 'PhoneNumberResponse', message: string, data?: { __typename?: 'PhoneNumber', id: string, number: string, verificationStatus: PhoneNumberVerificationStatus } | null } };

export type DeleteAccountMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteAccountMutation = { __typename?: 'Mutations', deleteAccount: { __typename?: 'BoolResponse', message: string, data?: boolean | null } };

export type AdminFeeConfigQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminFeeConfigQuery = { __typename?: 'Query', adminFeeConfig: { __typename?: 'AdminFeeConfig', id: string, shortLetHostChargesPercent: number, shortLetGuestChargesPercent: number, secureLeaseGuestContributionPercent: number, standardLegalFee: number, cautionCustodyFeePercent: number, cautionDisputeFee: number, cautionClaimWindowDays: number } };

export type AdminLegalConfigQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminLegalConfigQuery = { __typename?: 'Query', adminLegalConfig: { __typename?: 'AdminLegalConfig', id: string, legalFeePercentage: number, inspectionNoticeDays: number, cautionRefundDays: number, gracePeriodDays: number, latePaymentInterestRate: number, breakNoticePeriod: string, minimumOccupationPeriod: string, renewalNoticeMonths: number, guestStayDays: number, forfeitureGracePeriodDays: number, mesneProfitRate: number } };

export type BookingApplicationsCountQueryVariables = Exact<{
  filter?: InputMaybe<BookingApplicationFilter>;
}>;


export type BookingApplicationsCountQuery = { __typename?: 'Query', bookingApplicationsCount: number };

export type BookingApplicationsQueryVariables = Exact<{
  filter?: InputMaybe<BookingApplicationFilter>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type BookingApplicationsQuery = { __typename?: 'Query', bookingApplications: Array<{ __typename?: 'BookingApplication', commencementDate?: string | null, fullName?: string | null, createdAt: string, status: BookingApplicationStatus, id: string, intervalMultiplier?: number | null, booking?: { __typename?: 'Booking', id: string } | null, hosting: { __typename?: 'Hosting', id: string, title?: string | null, city?: string | null, country?: string | null, state?: string | null, coverImage?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } } | null }, guest: { __typename?: 'Guest', user: { __typename?: 'User', profile: { __typename?: 'Profile', fullName: string, image?: { __typename?: 'Asset', publicUrl: string } | null } } } }> };

export type CalculateHostingFeesQueryVariables = Exact<{
  hostingId: Scalars['String']['input'];
  multiplier: Scalars['Int']['input'];
}>;


export type CalculateHostingFeesQuery = { __typename?: 'Query', calculateHostingFees: { __typename?: 'HostingFees', baseRent: any, totalPayableAmount: any, cautionFee: any, serviceCharge: any, legalFee: any, stampDuty: any, guestServiceCharge: any, hostServiceCharge: any, paymentWindowDays: number, lineItems: Array<{ __typename?: 'FeeLineItem', key: string, label: string, description: string, amount: any }> } };

export type BookingApplicationQueryVariables = Exact<{
  bookingApplicationId: Scalars['String']['input'];
}>;


export type BookingApplicationQuery = { __typename?: 'Query', bookingApplication: { __typename?: 'BookingApplication', id: string, fullName?: string | null, email?: string | null, phoneNumber?: string | null, commencementDate?: string | null, correspondenceAddress?: string | null, intervalMultiplier?: number | null, status: BookingApplicationStatus, statusDetails?: string | null, createdAt: string, lastUpdated: string, guest: { __typename?: 'Guest', user: { __typename?: 'User', profile: { __typename?: 'Profile', fullName: string, image?: { __typename?: 'Asset', publicUrl: string } | null } } }, guestFormData?: { __typename?: 'GuestFormData', employmentStatus: GuestFormEmploymentStatus, incomeRanges?: GuestFormIncomeRange | null, occupancyTypes: GuestFormOccupancyType, guarantorRelationships?: GuestFormGuarantorRelationships | null, guarantorName?: string | null, guarantorPhone?: string | null, guarantorAddress?: string | null } | null, bookingAggrement?: { __typename?: 'TenancyTemplate', sections: Array<{ __typename?: 'TenancySection', id: string, title: string, description: string, priority: number, preamble?: string | null, subClauses: Array<{ __typename?: 'SubClause', id: string, title: string, description: string, priority: number, content: string, isMandatory: boolean, isActive: boolean, isCustom: boolean, requiredVariables: Array<{ __typename?: 'SubClauseVariable', name: string, type: VariableType }>, providedValues: Array<{ __typename?: 'SubClauseValue', key: string, value: string }> }> }> } | null, booking?: { __typename?: 'Booking', id: string } | null, hosting: { __typename?: 'Hosting', id: string, title?: string | null, city?: string | null, country?: string | null, state?: string | null, coverImage?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } } | null } } };

export type BookingsQueryVariables = Exact<{
  filter?: InputMaybe<BookingFilterInput>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type BookingsQuery = { __typename?: 'Query', bookings: Array<{ __typename?: 'Booking', id: string, bookingReference: string, expiresAt?: string | null, paymentStatus: PaymentStatus, status?: BookingStatus | null, createdAt: string, commencementDate?: string | null, expiryDate?: string | null, guestServiceCharge: any, amount: any, phoneNumber: string, cautionFee?: any | null, legalFee?: any | null, stampDuty?: any | null, serviceCharge?: any | null, hosting: { __typename?: 'Hosting', id: string, title?: string | null, city?: string | null, country?: string | null, state?: string | null, price?: any | null, paymentInterval?: PaymentInterval | null, coverImage?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } } | null }, transaction?: { __typename?: 'Transaction', id: string, reference?: string | null } | null, feeLineItems: Array<{ __typename?: 'FeeLineItem', key: string, label: string, description: string, amount: any }> }> };

export type BookingQueryVariables = Exact<{
  bookingId: Scalars['String']['input'];
}>;


export type BookingQuery = { __typename?: 'Query', booking: { __typename?: 'Booking', id: string, bookingReference: string, expiresAt?: string | null, paymentStatus: PaymentStatus, createdAt: string, commencementDate?: string | null, expiryDate?: string | null, guestServiceCharge: any, amount: any, phoneNumber: string, fullName: string, email: string, paymentMethod?: string | null, status?: BookingStatus | null, cautionFee?: any | null, serviceCharge?: any | null, legalFee?: any | null, stampDuty?: any | null, hosting: { __typename?: 'Hosting', id: string, title?: string | null, city?: string | null, country?: string | null, state?: string | null, price?: any | null, paymentInterval?: PaymentInterval | null, propertyType?: string | null, street?: string | null, landmarks?: string | null, averageRating?: number | null, totalRatings?: number | null, coverImage?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } } | null }, transaction?: { __typename?: 'Transaction', id: string, status: TransactionStatus, reference?: string | null } | null, tenancyAgreementAsset?: { __typename?: 'Asset', id: string, publicUrl: string } | null, guest: { __typename?: 'Guest', user: { __typename?: 'User', id: string } }, userReview?: { __typename?: 'HostingReview', averageRating?: number | null, description?: string | null, lastUpdated: string, id: string, checkIn?: number | null, accuracy?: number | null, cleanliness?: number | null, communication?: number | null, value?: number | null, location?: number | null, user: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', fullName: string, id: string, gender?: string | null } } } | null, bookingApplication: { __typename?: 'BookingApplication', id: string, intervalMultiplier?: number | null, commencementDate?: string | null }, feeLineItems: Array<{ __typename?: 'FeeLineItem', key: string, label: string, description: string, amount: any }> } };

export type GuestBookingTenancyAgreementPreviewQueryVariables = Exact<{
  bookingId: Scalars['String']['input'];
}>;


export type GuestBookingTenancyAgreementPreviewQuery = { __typename?: 'Query', guestBookingTenancyAgreementPreview: string };

export type CautionClaimsForBookingQueryVariables = Exact<{
  bookingId: Scalars['String']['input'];
}>;


export type CautionClaimsForBookingQuery = { __typename?: 'Query', cautionClaimsForBooking: Array<{ __typename?: 'CautionClaim', id: string, bookingId: string, amountRequested: any, status: CautionClaimStatus, hostNotes?: string | null, guestResponseNotes?: string | null, adminNotes?: string | null, disputeFeeApplied: boolean, createdAt: string, resolvedAt?: string | null, lastUpdated: string }> };

export type CautionRefundForBookingQueryVariables = Exact<{
  bookingId: Scalars['String']['input'];
}>;


export type CautionRefundForBookingQuery = { __typename?: 'Query', cautionRefundForBooking?: { __typename?: 'CautionRefund', id: string, bookingId: string, amount: any, status: CautionRefundStatus, accountNumber: string, accountName: string, bankName: string, bankCode: string, blockedReason?: string | null, createdAt: string, lastUpdated: string } | null };

export type CanLeaveBookingFeedbackQueryVariables = Exact<{
  bookingId: Scalars['String']['input'];
}>;


export type CanLeaveBookingFeedbackQuery = { __typename?: 'Query', canLeaveBookingFeedback: boolean };

export type ShouldShowNpsSurveyQueryVariables = Exact<{ [key: string]: never; }>;


export type ShouldShowNpsSurveyQuery = { __typename?: 'Query', shouldShowNpsSurvey: boolean };

export type UserChatsQueryVariables = Exact<{
  filter?: InputMaybe<HostingChatFilter>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type UserChatsQuery = { __typename?: 'Query', userChats: Array<{ __typename?: 'HostingChat', id: string, lastUpdated: string, unreadMessageCount: number, lastMessage?: { __typename?: 'HostingChatMessage', id: string, text: string, assets: Array<{ __typename?: 'HostingChatAsset', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string, contentType?: string | null } }> } | null, recipientUser: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', fullName: string, id: string, gender?: string | null, image?: { __typename?: 'Asset', publicUrl: string } | null }, onlineUser: { __typename?: 'OnlineUser', id: string, online: boolean } }, hosting: { __typename?: 'Hosting', id: string, title?: string | null, coverImage?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } } | null }, host: { __typename?: 'Host', id: string, user: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', fullName: string } } }, guest: { __typename?: 'Guest', id: string, user: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', fullName: string } } } }> };

export type ChatMessagesQueryVariables = Exact<{
  chatId: Scalars['String']['input'];
  pagination?: InputMaybe<PaginationInput>;
}>;


export type ChatMessagesQuery = { __typename?: 'Query', chatMessages: Array<{ __typename?: 'HostingChatMessage', id: string, text: string, messageType?: string | null, callType?: string | null, callId?: string | null, callDurationSeconds?: number | null, isSender: boolean, edited?: boolean | null, createdAt: string, lastUpdated: string, sender: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', id: string, gender?: string | null, fullName: string, image?: { __typename?: 'Asset', publicUrl: string } | null } }, assets: Array<{ __typename?: 'HostingChatAsset', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string, contentType?: string | null, originalFilename?: string | null } }> }> };

export type HostingChatQueryVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type HostingChatQuery = { __typename?: 'Query', hostingChat: { __typename?: 'HostingChat', id: string, hosting: { __typename?: 'Hosting', id: string, title?: string | null, city?: string | null, state?: string | null, street?: string | null, landmarks?: string | null, price?: any | null, paymentInterval?: PaymentInterval | null, coverImage?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } } | null }, recipientUser: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', gender?: string | null, id: string, fullName: string, image?: { __typename?: 'Asset', publicUrl: string } | null } } } };

export type HostingVerificationRequestsQueryVariables = Exact<{
  hostingId: Scalars['String']['input'];
}>;


export type HostingVerificationRequestsQuery = { __typename?: 'Query', hostingVerificationRequests: Array<{ __typename?: 'HostingVerificationRequest', id: string, tier: HostingVerificationTier, status: HostingVerificationRequestStatus, statusDetails?: string | null, createdAt: string, lastUpdated: string, documents: Array<{ __typename?: 'HostingVerificationRequestDocument', id: string, name: string, createdAt: string, lastUpdated: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } }>, logs: Array<{ __typename?: 'VerificationLogEntry', datetime: string, variant: string, staffId?: string | null, action: string, statusDetail?: string | null }> }> };

export type HostingVerificationTierQueryVariables = Exact<{
  tier: Scalars['String']['input'];
}>;


export type HostingVerificationTierQuery = { __typename?: 'Query', hostingVerificationTier?: { __typename?: 'AdminVerificationTier', id: string, tier: string, description: string, color: string, price?: any | null, documentRequirements: Array<{ __typename?: 'AdminVerificationTierDocumentRequirement', title: string, description: string }> } | null };

export type PropertyTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type PropertyTypesQuery = { __typename?: 'Query', propertyTypes: Array<{ __typename?: 'PropertyTypeConfig', value: string, label: string, searchTerms: Array<string>, rooms: Array<string>, facilities: Array<string>, category?: string | null, icon?: string | null }> };

export type AiHostingSearchPredictionsQueryVariables = Exact<{
  userInput: Scalars['String']['input'];
}>;


export type AiHostingSearchPredictionsQuery = { __typename?: 'Query', aiHostingSearchPredictions: Array<{ __typename?: 'AiSearchPrediction', summary: string, filters: { __typename?: 'AiSearchPredictionFilter', city?: string | null, state?: string | null, country?: string | null, propertyType?: string | null, maxPrice?: any | null, minPrice?: any | null, facilities?: Array<string> | null } }> };

export type AiHostingContentSuggestionQueryVariables = Exact<{
  hostingId: Scalars['String']['input'];
}>;


export type AiHostingContentSuggestionQuery = { __typename?: 'Query', aiHostingContentSuggestion: { __typename?: 'HostingContentSuggestion', title: string, description: string } };

export type TenancyAgreementTemplateQueryVariables = Exact<{ [key: string]: never; }>;


export type TenancyAgreementTemplateQuery = { __typename?: 'Query', tenancyAgreementTemplate: { __typename?: 'TenancyTemplate', totalSections: number, sections: Array<{ __typename?: 'TenancySection', id: string, title: string, description: string, priority: number, preamble?: string | null, subClauses: Array<{ __typename?: 'SubClause', id: string, title: string, description: string, content: string, isMandatory: boolean, isActive: boolean, isCustom: boolean, priority: number, requiredVariables: Array<{ __typename?: 'SubClauseVariable', name: string, type: VariableType }>, providedValues: Array<{ __typename?: 'SubClauseValue', key: string, value: string }> }> }> } };

export type HostingQueryVariables = Exact<{
  hostingId: Scalars['String']['input'];
  pagination?: InputMaybe<PaginationInput>;
}>;


export type HostingQuery = { __typename?: 'Query', hosting: { __typename?: 'Hosting', id: string, kind: HostingKind, parentId?: string | null, childCount: number, priceFrom?: any | null, isBookable: boolean, title?: string | null, propertyType?: string | null, listingType?: ListingType | null, description?: string | null, categories?: Array<string> | null, postalCode?: string | null, city?: string | null, street?: string | null, state?: string | null, country?: string | null, longitude?: string | null, latitude?: string | null, landmarks?: string | null, contact?: string | null, price?: any | null, paymentInterval?: PaymentInterval | null, facilities?: Array<string> | null, averageRating?: number | null, totalRatings?: number | null, publishStatus?: PublishStatus | null, createdAt: string, lastUpdated: string, saved: boolean, cautionFee?: any | null, serviceCharge?: any | null, maxOccupants?: number | null, bookingApplicationsCount: number, parent?: { __typename?: 'Hosting', id: string, title?: string | null } | null, children: Array<{ __typename?: 'Hosting', id: string, kind: HostingKind, parentId?: string | null, childCount: number, title?: string | null, state?: string | null, city?: string | null, price?: any | null, paymentInterval?: PaymentInterval | null, listingType?: ListingType | null, publishStatus?: PublishStatus | null, isBookable: boolean, bookingApplicationsCount: number, createdAt: string, lastUpdated: string, coverImage?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string, lastUpdated: string, originalFilename?: string | null } } | null }>, rooms: Array<{ __typename?: 'HostingRoom', id: string, name: string, count?: number | null, description?: string | null, createdAt: string, lastUpdated: string, images: Array<{ __typename?: 'HostingRoomImage', id: string, createdAt: string, lastUpdated: string, asset: { __typename?: 'Asset', id: string, publicUrl: string, lastUpdated: string } }> }>, host: { __typename?: 'Host', id: string, createdAt: string, user: { __typename?: 'User', id: string, email: string, kushiId: string, phoneNumber?: string | null, kyc: { __typename?: 'Kyc', idDocumentType?: string | null, kycReferenceId?: string | null }, profile: { __typename?: 'Profile', fullName: string, gender?: string | null, id: string, image?: { __typename?: 'Asset', publicUrl: string, lastUpdated: string } | null } }, signature?: { __typename?: 'Asset', id: string, publicUrl: string, lastUpdated: string } | null }, coverImage?: { __typename?: 'HostingRoomImage', id: string, createdAt: string, lastUpdated: string, asset: { __typename?: 'Asset', id: string, publicUrl: string, lastUpdated: string } } | null, video?: { __typename?: 'VideoWalkthrough', id: string, durationSeconds: number, recordedAt: string, asset: { __typename?: 'Asset', id: string, publicUrl: string, lastUpdated: string } } | null, images: Array<{ __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string, lastUpdated: string, originalFilename?: string | null } }>, paymentDetails?: { __typename?: 'HostAccountDetails', id: string, accountNumber: string, accountName?: string | null, bankCode: string, createdAt: string, lastUpdated: string, bankDetails?: { __typename?: 'Bank', name: string, slug: string, code: string, active: boolean, currency: string, image: string } | null } | null, reviews: Array<{ __typename?: 'HostingReview', averageRating?: number | null, description?: string | null, lastUpdated: string, id: string, user: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', fullName: string, id: string, gender?: string | null, image?: { __typename?: 'Asset', publicUrl: string, lastUpdated: string } | null } } }>, reviewAverage: { __typename?: 'HostingReviewAverage', cleanliness?: number | null, accuracy?: number | null, communication?: number | null, location?: number | null, checkIn?: number | null, value?: number | null }, tenancyAgreementTemplate?: { __typename?: 'TenancyTemplate', totalSections: number, sections: Array<{ __typename?: 'TenancySection', id: string, title: string, description: string, priority: number, preamble?: string | null, subClauses: Array<{ __typename?: 'SubClause', id: string, title: string, description: string, content: string, isMandatory: boolean, isActive: boolean, priority: number, isCustom: boolean, requiredVariables: Array<{ __typename?: 'SubClauseVariable', name: string, type: VariableType }>, providedValues: Array<{ __typename?: 'SubClauseValue', key: string, value: string }> }> }> } | null, verification?: { __typename?: 'HostingVerificationData', id: string, landlordFullName: string, landlordAddress: string, verificationTier: HostingVerificationTier, propertyRelationship: HostingPropertyRelationship, declOwnership: boolean, declLitigation: boolean, declIndemnity: boolean, titleType?: string | null, titleNumber?: string | null, createdAt: string, lastUpdated: string, tierTooltip: string } | null } };

export type HostingsQueryVariables = Exact<{
  filters?: InputMaybe<HostingFilterInput>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type HostingsQuery = { __typename?: 'Query', hostings: Array<{ __typename?: 'Hosting', id: string, kind: HostingKind, childCount: number, priceFrom?: any | null, isBookable: boolean, price?: any | null, listingType?: ListingType | null, totalRatings?: number | null, averageRating?: number | null, country?: string | null, state?: string | null, title?: string | null, city?: string | null, street?: string | null, landmarks?: string | null, saved: boolean, publishStatus?: PublishStatus | null, latitude?: string | null, longitude?: string | null, paymentInterval?: PaymentInterval | null, createdAt: string, verification?: { __typename?: 'HostingVerificationData', id: string, verificationTier: HostingVerificationTier, tierTooltip: string } | null, coverImage?: { __typename?: 'HostingRoomImage', asset: { __typename?: 'Asset', publicUrl: string, lastUpdated: string } } | null, images: Array<{ __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string, lastUpdated: string, originalFilename?: string | null } }> }> };

export type SavedHostingFoldersQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
}>;


export type SavedHostingFoldersQuery = { __typename?: 'Query', savedHostingFolders: Array<{ __typename?: 'SavedHostingFolder', id: string, folderName: string, createdAt: string, lastUpdated: string, itemCount: number }> };

export type SavedHostingsQueryVariables = Exact<{
  filters?: InputMaybe<SavedHostingFilterInput>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type SavedHostingsQuery = { __typename?: 'Query', savedHostings: Array<{ __typename?: 'SavedHosting', id: string, image?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', publicUrl: string, lastUpdated: string, id: string } } | null, hosting: { __typename?: 'Hosting', totalRatings?: number | null, averageRating?: number | null, id: string, title?: string | null, saved: boolean, coverImage?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string, lastUpdated: string, originalFilename?: string | null } } | null } }> };

export type SavedHostingFolderQueryVariables = Exact<{
  savedHostingFolderId: Scalars['String']['input'];
}>;


export type SavedHostingFolderQuery = { __typename?: 'Query', savedHostingFolder: { __typename?: 'SavedHostingFolder', id: string, folderName: string, createdAt: string, lastUpdated: string, itemCount: number } };

export type HostListingsQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
  filters?: InputMaybe<HostingFilterInput>;
}>;


export type HostListingsQuery = { __typename?: 'Query', hostings: Array<{ __typename?: 'Hosting', id: string, kind: HostingKind, parentId?: string | null, childCount: number, title?: string | null, description?: string | null, state?: string | null, city?: string | null, listingType?: ListingType | null, publishStatus?: PublishStatus | null, bookingApplicationsCount: number, createdAt: string, lastUpdated: string, coverImage?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string, lastUpdated: string, originalFilename?: string | null } } | null }> };

export type KycStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type KycStatusQuery = { __typename?: 'Query', kycStatus: { __typename?: 'KycStatus', bvnVerified: boolean, ninVerified: boolean, hasLiveness: boolean, kycComplete: boolean } };

export type NotificationsQueryVariables = Exact<{
  filter?: InputMaybe<NotificationsFilterInput>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type NotificationsQuery = { __typename?: 'Query', notifications: Array<{ __typename?: 'Notification', id: string, title: string, message: string, type?: NotificationType | null, createdAt: string, lastUpdated: string, isRead: boolean, data?: { __typename?: 'NotificationData', intent?: NotificationIntent | null, subject?: NotificationSubject | null, id?: string | null } | null }> };

export type BanksQueryVariables = Exact<{ [key: string]: never; }>;


export type BanksQuery = { __typename?: 'Query', banks: Array<{ __typename?: 'Bank', name: string, slug: string, code: string, active: boolean, currency: string, image: string }> };

export type ResolveBankAccountQueryVariables = Exact<{
  input: VerifyAccountInput;
}>;


export type ResolveBankAccountQuery = { __typename?: 'Query', resolveBankAccount: string };

export type HostPaymentDetailsQueryVariables = Exact<{ [key: string]: never; }>;


export type HostPaymentDetailsQuery = { __typename?: 'Query', hostPaymentDetails: Array<{ __typename?: 'HostAccountDetails', id: string, accountNumber: string, bankCode: string, createdAt: string, lastUpdated: string, accountName?: string | null, bankDetails?: { __typename?: 'Bank', name: string, slug: string, code: string, active: boolean, currency: string, image: string } | null }> };

export type TransactionByReferenceQueryVariables = Exact<{
  reference: Scalars['String']['input'];
}>;


export type TransactionByReferenceQuery = { __typename?: 'Query', transactionByReference: { __typename?: 'Transaction', id: string, amount: any, type: TransactionType, createdAt: string, lastUpdated: string, flutterwaveChargeId?: string | null, reference?: string | null, status: TransactionStatus, booking?: { __typename?: 'Booking', id: string, hosting: { __typename?: 'Hosting', id: string, title?: string | null } } | null } };

export type TransactionsQueryVariables = Exact<{
  filter?: InputMaybe<TransactionFilter>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type TransactionsQuery = { __typename?: 'Query', transactions: Array<{ __typename?: 'Transaction', id: string, amount: any, type: TransactionType, createdAt: string, lastUpdated: string, reference?: string | null, status: TransactionStatus, booking?: { __typename?: 'Booking', id: string, hosting: { __typename?: 'Hosting', id: string, title?: string | null } } | null }> };

export type MySupportChatsQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
}>;


export type MySupportChatsQuery = { __typename?: 'Query', mySupportChats: Array<{ __typename?: 'SupportChat', id: string, status: SupportChatStatus, createdAt: string, lastUpdated: string, itemType?: SupportItemType | null, messages: Array<{ __typename?: 'SupportChatMessage', id: string, text: string, createdAt: string, isReadByUser: boolean }> }> };

export type SupportChatQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type SupportChatQuery = { __typename?: 'Query', supportChat: { __typename?: 'SupportChat', id: string, status: SupportChatStatus, createdAt: string, lastUpdated: string, itemType?: SupportItemType | null, supportChatRating?: { __typename?: 'SupportChatRating', id: string, rating: number, comment?: string | null, createdAt: string } | null, user: { __typename?: 'User', id: string, isStaff: boolean, profile: { __typename?: 'Profile', fullName: string, image?: { __typename?: 'Asset', publicUrl: string } | null } }, hosting?: { __typename?: 'Hosting', id: string, title?: string | null, city?: string | null, state?: string | null, price?: any | null, paymentInterval?: PaymentInterval | null, coverImage?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } } | null } | null, booking?: { __typename?: 'Booking', id: string, bookingReference: string, commencementDate?: string | null, durationDescription?: string | null, status?: BookingStatus | null, hosting: { __typename?: 'Hosting', id: string, title?: string | null, city?: string | null, state?: string | null, price?: any | null, paymentInterval?: PaymentInterval | null, coverImage?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } } | null } } | null, transaction?: { __typename?: 'Transaction', id: string, amount: any, status: TransactionStatus, createdAt: string } | null } };

export type SupportChatMessagesQueryVariables = Exact<{
  id: Scalars['String']['input'];
  pagination?: InputMaybe<PaginationInput>;
}>;


export type SupportChatMessagesQuery = { __typename?: 'Query', supportChat: { __typename?: 'SupportChat', id: string, messages: Array<{ __typename?: 'SupportChatMessage', id: string, text: string, createdAt: string, isReadByUser: boolean, assets: Array<{ __typename?: 'SupportChatAsset', id: string, asset?: { __typename?: 'Asset', id: string, publicUrl: string, contentType?: string | null, originalFilename?: string | null } | null }>, sender?: { __typename?: 'User', id: string, isStaff: boolean, profile: { __typename?: 'Profile', fullName: string } } | null }> } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, email: string, kushiId: string, createdAt: string, lastUpdated: string, profile: { __typename?: 'Profile', id: string, fullName: string, gender?: string | null, createdAt: string, lastUpdated: string }, notificationSettings: { __typename?: 'NotificationSettings', id: string, email: boolean, appUpdates: boolean, pushNotifications: boolean, specialOffers: boolean, fcmToken?: string | null, voipToken?: string | null }, kyc: { __typename?: 'Kyc', id: string, bvnVerified?: boolean | null, ninVerified?: boolean | null, idDocumentType?: string | null, kycReferenceId?: string | null, image?: { __typename?: 'Asset', id: string, secureUrl: string } | null }, phoneNumbers: Array<{ __typename?: 'PhoneNumber', id: string, number: string, verificationStatus: PhoneNumberVerificationStatus }> } };

export type HostAnalyticsQueryVariables = Exact<{ [key: string]: never; }>;


export type HostAnalyticsQuery = { __typename?: 'Query', hostAnalytics: { __typename?: 'HostAnalytics', totalListings: number, occupancyRate: number, totalRevenue: any, averageRating: number, fundsInEscrow: any, pendingApplications: number, host: { __typename?: 'Host', id: string, user: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', fullName: string, id: string } } }, topListing?: { __typename?: 'Hosting', id: string, city?: string | null, state?: string | null, price?: any | null, paymentInterval?: PaymentInterval | null, totalRatings?: number | null, title?: string | null, averageRating?: number | null, coverImage?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', publicUrl: string, originalFilename?: string | null, id: string } } | null } | null } };

export type RevenueGrowthQueryVariables = Exact<{
  year?: InputMaybe<Scalars['Int']['input']>;
  month?: InputMaybe<Scalars['Int']['input']>;
  lastNYears?: InputMaybe<Scalars['Int']['input']>;
  lastNMonths?: InputMaybe<Scalars['Int']['input']>;
}>;


export type RevenueGrowthQuery = { __typename?: 'Query', hostAnalytics: { __typename?: 'HostAnalytics', revenueGrowth: { __typename?: 'TimeSeriesData', dataPoints: Array<{ __typename?: 'AnalyticsDataPoint', amount: any, label: string }> } } };

export type AuthHostQueryVariables = Exact<{ [key: string]: never; }>;


export type AuthHostQuery = { __typename?: 'Query', authHost: { __typename?: 'Host', id: string, createdAt: string, lastUpdated: string, signature?: { __typename?: 'Asset', id: string, secureUrl: string, publicUrl: string } | null } };

export type AuthGuestQueryVariables = Exact<{ [key: string]: never; }>;


export type AuthGuestQuery = { __typename?: 'Query', authGuest: { __typename?: 'Guest', id: string, createdAt: string, lastUpdated: string, signature?: { __typename?: 'Asset', id: string, secureUrl: string, publicUrl: string } | null } };

export type UserPhoneNumersQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
}>;


export type UserPhoneNumersQuery = { __typename?: 'Query', me: { __typename?: 'User', phoneNumbers: Array<{ __typename?: 'PhoneNumber', id: string, number: string, verificationStatus: PhoneNumberVerificationStatus, createdAt: string, lastUpdated: string }> } };

export type LatestHostingChatMessageSubscriptionVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type LatestHostingChatMessageSubscription = { __typename?: 'Subscriptions', latestHostingChatMessage: { __typename?: 'HostingChatMessage', id: string, text: string, messageType?: string | null, callType?: string | null, callId?: string | null, callDurationSeconds?: number | null, isSender: boolean, edited?: boolean | null, createdAt: string, lastUpdated: string, sender: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', id: string, gender?: string | null, fullName: string } }, assets: Array<{ __typename?: 'HostingChatAsset', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string, contentType?: string | null, originalFilename?: string | null } }> } };

export type OnlineUserSubscriptionVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type OnlineUserSubscription = { __typename?: 'Subscriptions', onlineUser: { __typename?: 'OnlineUser', online: boolean, lastUpdated: string, id: string, lastSeen: string } };

export type SupportChatMessageAddedSubscriptionVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type SupportChatMessageAddedSubscription = { __typename?: 'Subscriptions', supportChatMessageAdded: { __typename?: 'SupportChatMessage', id: string, chatId: string, text: string, createdAt: string, isReadByUser: boolean, sender?: { __typename?: 'User', id: string, isStaff: boolean, profile: { __typename?: 'Profile', fullName: string } } | null } };


export const SignUpDocument = gql`
    mutation SignUp($input: SignUpInput!) {
  signUp(input: $input) {
    message
  }
}
    `;

export function useSignUpMutation() {
  return Urql.useMutation<SignUpMutation, SignUpMutationVariables>(SignUpDocument);
};
export const GoogleSignUpDocument = gql`
    mutation GoogleSignUp($idToken: String!) {
  googleSignUp(idToken: $idToken) {
    message
    data {
      token
      refreshToken
      expiresAt
      user {
        id
        email
        kushiId
        createdAt
        lastUpdated
        profile {
          id
          fullName
          gender
          createdAt
          lastUpdated
          image {
            publicUrl
          }
        }
        notificationSettings {
          id
          email
          appUpdates
          pushNotifications
          specialOffers
          fcmToken
          voipToken
        }
        kyc {
          id
          bvnVerified
          ninVerified
          idDocumentType
          kycReferenceId
          image {
            id
            secureUrl
          }
        }
        phoneNumbers {
          id
          number
          verificationStatus
        }
      }
    }
  }
}
    `;

export function useGoogleSignUpMutation() {
  return Urql.useMutation<GoogleSignUpMutation, GoogleSignUpMutationVariables>(GoogleSignUpDocument);
};
export const RefreshTokenDocument = gql`
    mutation RefreshToken($input: RefreshTokenInput!) {
  refreshToken(input: $input) {
    message
    data {
      token
      refreshToken
      expiresAt
      user {
        id
        email
        kushiId
        createdAt
        lastUpdated
        profile {
          id
          fullName
          gender
          createdAt
          lastUpdated
          image {
            publicUrl
          }
        }
        notificationSettings {
          id
          email
          appUpdates
          pushNotifications
          specialOffers
          fcmToken
          voipToken
        }
        kyc {
          id
          bvnVerified
          ninVerified
          idDocumentType
          kycReferenceId
          image {
            id
            secureUrl
          }
        }
        phoneNumbers {
          id
          number
          verificationStatus
        }
      }
    }
  }
}
    `;

export function useRefreshTokenMutation() {
  return Urql.useMutation<RefreshTokenMutation, RefreshTokenMutationVariables>(RefreshTokenDocument);
};
export const VerifyEmailDocument = gql`
    mutation VerifyEmail($input: Otpinput!) {
  verifyEmail(input: $input) {
    message
  }
}
    `;

export function useVerifyEmailMutation() {
  return Urql.useMutation<VerifyEmailMutation, VerifyEmailMutationVariables>(VerifyEmailDocument);
};
export const ResendEmailVerificationOtpDocument = gql`
    mutation ResendEmailVerificationOtp($email: String!) {
  resendEmailVerificationOtp(email: $email) {
    message
  }
}
    `;

export function useResendEmailVerificationOtpMutation() {
  return Urql.useMutation<ResendEmailVerificationOtpMutation, ResendEmailVerificationOtpMutationVariables>(ResendEmailVerificationOtpDocument);
};
export const GoogleLoginDocument = gql`
    mutation GoogleLogin($idToken: String!) {
  googleLogin(idToken: $idToken) {
    message
    data {
      token
      refreshToken
      expiresAt
      user {
        id
        email
        kushiId
        createdAt
        lastUpdated
        profile {
          id
          fullName
          gender
          createdAt
          lastUpdated
          image {
            publicUrl
          }
        }
        notificationSettings {
          id
          email
          appUpdates
          pushNotifications
          specialOffers
          fcmToken
          voipToken
        }
        kyc {
          id
          bvnVerified
          ninVerified
          idDocumentType
          kycReferenceId
          image {
            id
            secureUrl
          }
        }
        phoneNumbers {
          id
          number
          verificationStatus
        }
      }
    }
  }
}
    `;

export function useGoogleLoginMutation() {
  return Urql.useMutation<GoogleLoginMutation, GoogleLoginMutationVariables>(GoogleLoginDocument);
};
export const AppleLoginDocument = gql`
    mutation AppleLogin($input: AppleAuthInput!) {
  appleLogin(input: $input) {
    message
    data {
      token
      refreshToken
      expiresAt
      user {
        id
        email
        kushiId
        createdAt
        lastUpdated
        profile {
          id
          fullName
          gender
          createdAt
          lastUpdated
          image {
            publicUrl
          }
        }
        notificationSettings {
          id
          email
          appUpdates
          pushNotifications
          specialOffers
          fcmToken
          voipToken
        }
        kyc {
          id
          bvnVerified
          ninVerified
          idDocumentType
          kycReferenceId
          image {
            id
            secureUrl
          }
        }
        phoneNumbers {
          id
          number
          verificationStatus
        }
      }
    }
  }
}
    `;

export function useAppleLoginMutation() {
  return Urql.useMutation<AppleLoginMutation, AppleLoginMutationVariables>(AppleLoginDocument);
};
export const AppleSignUpDocument = gql`
    mutation AppleSignUp($input: AppleAuthInput!) {
  appleSignUp(input: $input) {
    message
    data {
      token
      refreshToken
      expiresAt
      user {
        id
        email
        kushiId
        createdAt
        lastUpdated
        profile {
          id
          fullName
          gender
          createdAt
          lastUpdated
          image {
            publicUrl
          }
        }
        notificationSettings {
          id
          email
          appUpdates
          pushNotifications
          specialOffers
          fcmToken
          voipToken
        }
        kyc {
          id
          bvnVerified
          ninVerified
          idDocumentType
          kycReferenceId
          image {
            id
            secureUrl
          }
        }
        phoneNumbers {
          id
          number
          verificationStatus
        }
      }
    }
  }
}
    `;

export function useAppleSignUpMutation() {
  return Urql.useMutation<AppleSignUpMutation, AppleSignUpMutationVariables>(AppleSignUpDocument);
};
export const LoginDocument = gql`
    mutation Login($input: LoginInput!) {
  login(input: $input) {
    message
    data {
      token
      refreshToken
      expiresAt
      user {
        id
        email
        kushiId
        createdAt
        lastUpdated
        profile {
          id
          fullName
          gender
          createdAt
          lastUpdated
          image {
            publicUrl
          }
        }
        notificationSettings {
          id
          email
          appUpdates
          pushNotifications
          specialOffers
          fcmToken
          voipToken
        }
        kyc {
          id
          bvnVerified
          ninVerified
          idDocumentType
          kycReferenceId
          image {
            id
            secureUrl
          }
        }
        phoneNumbers {
          id
          number
          verificationStatus
        }
      }
    }
  }
}
    `;

export function useLoginMutation() {
  return Urql.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument);
};
export const RequestPasswordChangeDocument = gql`
    mutation RequestPasswordChange($input: RequestPasswordChangeInput!) {
  requestPasswordChange(input: $input) {
    message
  }
}
    `;

export function useRequestPasswordChangeMutation() {
  return Urql.useMutation<RequestPasswordChangeMutation, RequestPasswordChangeMutationVariables>(RequestPasswordChangeDocument);
};
export const ResendPasswordChangeOtpDocument = gql`
    mutation ResendPasswordChangeOtp($email: String!) {
  resendPasswordChangeOtp(email: $email) {
    message
  }
}
    `;

export function useResendPasswordChangeOtpMutation() {
  return Urql.useMutation<ResendPasswordChangeOtpMutation, ResendPasswordChangeOtpMutationVariables>(ResendPasswordChangeOtpDocument);
};
export const CompletePasswordChangeDocument = gql`
    mutation CompletePasswordChange($input: CompletePasswordChangeInput!) {
  completePasswordChange(input: $input) {
    message
  }
}
    `;

export function useCompletePasswordChangeMutation() {
  return Urql.useMutation<CompletePasswordChangeMutation, CompletePasswordChangeMutationVariables>(CompletePasswordChangeDocument);
};
export const LogoutDocument = gql`
    mutation Logout {
  logout {
    message
  }
}
    `;

export function useLogoutMutation() {
  return Urql.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument);
};
export const InitiateBookingApplicationDocument = gql`
    mutation InitiateBookingApplication($hostingId: String!) {
  initiateBookingApplication(hostingId: $hostingId) {
    message
    data {
      id
      fullName
      email
      phoneNumber
      commencementDate
      correspondenceAddress
      intervalMultiplier
      status
      statusDetails
      createdAt
      lastUpdated
      bookingAggrement {
        totalSections
        sections {
          id
          title
          description
          priority
          preamble
          subClauses {
            id
            title
            description
            priority
            content
            isMandatory
            isActive
            isCustom
            requiredVariables {
              name
              type
            }
            providedValues {
              key
              value
            }
          }
        }
      }
      guestFormData {
        employmentStatus
        incomeRanges
        occupancyTypes
        guarantorRelationships
        guarantorName
        guarantorPhone
        guarantorAddress
      }
    }
  }
}
    `;

export function useInitiateBookingApplicationMutation() {
  return Urql.useMutation<InitiateBookingApplicationMutation, InitiateBookingApplicationMutationVariables>(InitiateBookingApplicationDocument);
};
export const UpdateBookingApplicationDocument = gql`
    mutation UpdateBookingApplication($input: BookingApplicationUpdateInput!) {
  updateBookingApplication(input: $input) {
    message
    data {
      id
      fullName
      email
      phoneNumber
      commencementDate
      correspondenceAddress
      intervalMultiplier
      status
      statusDetails
      createdAt
      lastUpdated
      bookingAggrement {
        totalSections
        sections {
          id
          title
          description
          priority
          preamble
          subClauses {
            id
            title
            description
            priority
            content
            isMandatory
            isActive
            isCustom
            requiredVariables {
              name
              type
            }
            providedValues {
              key
              value
            }
          }
        }
      }
      guestFormData {
        employmentStatus
        incomeRanges
        occupancyTypes
        guarantorRelationships
        guarantorName
        guarantorPhone
        guarantorAddress
      }
    }
  }
}
    `;

export function useUpdateBookingApplicationMutation() {
  return Urql.useMutation<UpdateBookingApplicationMutation, UpdateBookingApplicationMutationVariables>(UpdateBookingApplicationDocument);
};
export const VerifyBookingPaymentDocument = gql`
    mutation VerifyBookingPayment($verifyBookingPaymentId: String!) {
  verifyBookingPayment(id: $verifyBookingPaymentId) {
    message
    data {
      id
      paymentStatus
    }
  }
}
    `;

export function useVerifyBookingPaymentMutation() {
  return Urql.useMutation<VerifyBookingPaymentMutation, VerifyBookingPaymentMutationVariables>(VerifyBookingPaymentDocument);
};
export const InitiateFinalizeBookingDocument = gql`
    mutation InitiateFinalizeBooking($bookingId: String!) {
  initiateFinalizeBooking(bookingId: $bookingId) {
    message
  }
}
    `;

export function useInitiateFinalizeBookingMutation() {
  return Urql.useMutation<InitiateFinalizeBookingMutation, InitiateFinalizeBookingMutationVariables>(InitiateFinalizeBookingDocument);
};
export const FinalizeBookingDocument = gql`
    mutation FinalizeBooking($bookingId: String!, $otp: String!) {
  finalizeBooking(bookingId: $bookingId, otp: $otp) {
    id
  }
}
    `;

export function useFinalizeBookingMutation() {
  return Urql.useMutation<FinalizeBookingMutation, FinalizeBookingMutationVariables>(FinalizeBookingDocument);
};
export const InitiateBookingApplicationSubmissionDocument = gql`
    mutation InitiateBookingApplicationSubmission($applicationId: String!) {
  initiateBookingApplicationSubmission(applicationId: $applicationId) {
    message
  }
}
    `;

export function useInitiateBookingApplicationSubmissionMutation() {
  return Urql.useMutation<InitiateBookingApplicationSubmissionMutation, InitiateBookingApplicationSubmissionMutationVariables>(InitiateBookingApplicationSubmissionDocument);
};
export const CompleteBookingApplicationSubmissionDocument = gql`
    mutation CompleteBookingApplicationSubmission($input: BookingApplicationSubmissionInput!) {
  completeBookingApplicationSubmission(input: $input) {
    message
  }
}
    `;

export function useCompleteBookingApplicationSubmissionMutation() {
  return Urql.useMutation<CompleteBookingApplicationSubmissionMutation, CompleteBookingApplicationSubmissionMutationVariables>(CompleteBookingApplicationSubmissionDocument);
};
export const HostUpdateBookingApplicationStatusDocument = gql`
    mutation HostUpdateBookingApplicationStatus($input: BookingApplicationStatusUpdateInput!) {
  hostUpdateBookingApplicationStatus(input: $input) {
    message
  }
}
    `;

export function useHostUpdateBookingApplicationStatusMutation() {
  return Urql.useMutation<HostUpdateBookingApplicationStatusMutation, HostUpdateBookingApplicationStatusMutationVariables>(HostUpdateBookingApplicationStatusDocument);
};
export const InitiateCancelBookingDocument = gql`
    mutation InitiateCancelBooking($bookingId: String!) {
  initiateCancelBooking(bookingId: $bookingId) {
    message
  }
}
    `;

export function useInitiateCancelBookingMutation() {
  return Urql.useMutation<InitiateCancelBookingMutation, InitiateCancelBookingMutationVariables>(InitiateCancelBookingDocument);
};
export const CancelBookingDocument = gql`
    mutation CancelBooking($bookingId: String!, $otp: String!) {
  cancelBooking(bookingId: $bookingId, otp: $otp) {
    message
  }
}
    `;

export function useCancelBookingMutation() {
  return Urql.useMutation<CancelBookingMutation, CancelBookingMutationVariables>(CancelBookingDocument);
};
export const CancelBookingApplicationDocument = gql`
    mutation cancelBookingApplication($applicationId: String!) {
  cancelBookingApplication(applicationId: $applicationId) {
    message
  }
}
    `;

export function useCancelBookingApplicationMutation() {
  return Urql.useMutation<CancelBookingApplicationMutation, CancelBookingApplicationMutationVariables>(CancelBookingApplicationDocument);
};
export const InitiateAcceptBookingApplicationDocument = gql`
    mutation InitiateAcceptBookingApplication($applicationId: String!) {
  initiateAcceptBookingApplication(applicationId: $applicationId) {
    message
  }
}
    `;

export function useInitiateAcceptBookingApplicationMutation() {
  return Urql.useMutation<InitiateAcceptBookingApplicationMutation, InitiateAcceptBookingApplicationMutationVariables>(InitiateAcceptBookingApplicationDocument);
};
export const AcceptBookingApplicationDocument = gql`
    mutation AcceptBookingApplication($applicationId: String!, $otp: String!) {
  acceptBookingApplication(applicationId: $applicationId, otp: $otp) {
    message
    data {
      id
      status
      statusDetails
    }
  }
}
    `;

export function useAcceptBookingApplicationMutation() {
  return Urql.useMutation<AcceptBookingApplicationMutation, AcceptBookingApplicationMutationVariables>(AcceptBookingApplicationDocument);
};
export const RequestCautionReleaseDocument = gql`
    mutation RequestCautionRelease($input: RequestCautionReleaseInput!) {
  requestCautionRelease(input: $input) {
    message
    data {
      id
      bookingId
      amountRequested
      status
      hostNotes
      disputeFeeApplied
      createdAt
      lastUpdated
    }
  }
}
    `;

export function useRequestCautionReleaseMutation() {
  return Urql.useMutation<RequestCautionReleaseMutation, RequestCautionReleaseMutationVariables>(RequestCautionReleaseDocument);
};
export const RespondToCautionClaimDocument = gql`
    mutation RespondToCautionClaim($input: RespondToCautionClaimInput!) {
  respondToCautionClaim(input: $input) {
    message
    data {
      id
      bookingId
      amountRequested
      status
      guestResponseNotes
      disputeFeeApplied
      createdAt
      lastUpdated
    }
  }
}
    `;

export function useRespondToCautionClaimMutation() {
  return Urql.useMutation<RespondToCautionClaimMutation, RespondToCautionClaimMutationVariables>(RespondToCautionClaimDocument);
};
export const RequestCautionRefundDocument = gql`
    mutation RequestCautionRefund($input: RequestCautionRefundInput!) {
  requestCautionRefund(input: $input) {
    message
    data {
      id
      bookingId
      amount
      status
      accountNumber
      accountName
      bankName
      bankCode
      createdAt
      lastUpdated
    }
  }
}
    `;

export function useRequestCautionRefundMutation() {
  return Urql.useMutation<RequestCautionRefundMutation, RequestCautionRefundMutationVariables>(RequestCautionRefundDocument);
};
export const SubmitFeedbackDocument = gql`
    mutation SubmitFeedback($input: SubmitFeedbackInput!) {
  submitFeedback(input: $input) {
    id
    type
    category
    rating
    title
    body
    contactConsent
    status
    createdAt
  }
}
    `;

export function useSubmitFeedbackMutation() {
  return Urql.useMutation<SubmitFeedbackMutation, SubmitFeedbackMutationVariables>(SubmitFeedbackDocument);
};
export const SubmitNpsDocument = gql`
    mutation SubmitNPS($input: SubmitNPSInput!) {
  submitNps(input: $input) {
    id
    score
    reason
    context
    createdAt
  }
}
    `;

export function useSubmitNpsMutation() {
  return Urql.useMutation<SubmitNpsMutation, SubmitNpsMutationVariables>(SubmitNpsDocument);
};
export const SubmitSupportRatingDocument = gql`
    mutation SubmitSupportRating($input: SubmitSupportRatingInput!) {
  submitSupportRating(input: $input) {
    id
    chatId
    rating
    comment
    createdAt
  }
}
    `;

export function useSubmitSupportRatingMutation() {
  return Urql.useMutation<SubmitSupportRatingMutation, SubmitSupportRatingMutationVariables>(SubmitSupportRatingDocument);
};
export const AddSupportMessageAttachmentDocument = gql`
    mutation AddSupportMessageAttachment($messageId: String!, $file: Upload!) {
  addSupportMessageAttachment(messageId: $messageId, file: $file)
}
    `;

export function useAddSupportMessageAttachmentMutation() {
  return Urql.useMutation<AddSupportMessageAttachmentMutation, AddSupportMessageAttachmentMutationVariables>(AddSupportMessageAttachmentDocument);
};
export const InitiateHostingChatDocument = gql`
    mutation InitiateHostingChat($hostingId: String!) {
  initiateHostingChat(hostingId: $hostingId) {
    id
  }
}
    `;

export function useInitiateHostingChatMutation() {
  return Urql.useMutation<InitiateHostingChatMutation, InitiateHostingChatMutationVariables>(InitiateHostingChatDocument);
};
export const CreateUpdateMessageDocument = gql`
    mutation CreateUpdateMessage($input: HostingChatMessageInput!) {
  createUpdateMessage(input: $input) {
    id
    text
    messageType
    callType
    callId
    callDurationSeconds
    isSender
    sender {
      id
      profile {
        id
        gender
        fullName
      }
    }
    edited
    createdAt
    lastUpdated
    assets {
      id
      asset {
        id
        publicUrl
        contentType
        originalFilename
      }
    }
  }
}
    `;

export function useCreateUpdateMessageMutation() {
  return Urql.useMutation<CreateUpdateMessageMutation, CreateUpdateMessageMutationVariables>(CreateUpdateMessageDocument);
};
export const ClearChatUrnreadMessagesDocument = gql`
    mutation ClearChatUrnreadMessages($chatId: String!) {
  clearChatUrnreadMessages(chatId: $chatId) {
    message
  }
}
    `;

export function useClearChatUrnreadMessagesMutation() {
  return Urql.useMutation<ClearChatUrnreadMessagesMutation, ClearChatUrnreadMessagesMutationVariables>(ClearChatUrnreadMessagesDocument);
};
export const SendChatCallNotificationDocument = gql`
    mutation SendChatCallNotification($chatId: String!, $callType: CallType!, $callId: String!, $durationSeconds: Int, $callKind: String) {
  sendChatCallNotification(
    chatId: $chatId
    callType: $callType
    callId: $callId
    durationSeconds: $durationSeconds
    callKind: $callKind
  ) {
    message
  }
}
    `;

export function useSendChatCallNotificationMutation() {
  return Urql.useMutation<SendChatCallNotificationMutation, SendChatCallNotificationMutationVariables>(SendChatCallNotificationDocument);
};
export const CreateUpdateSavedHostingFolderDocument = gql`
    mutation CreateUpdateSavedHostingFolder($input: SavedHostingFolderInput!) {
  createUpdateSavedHostingFolder(input: $input) {
    message
    data {
      id
    }
  }
}
    `;

export function useCreateUpdateSavedHostingFolderMutation() {
  return Urql.useMutation<CreateUpdateSavedHostingFolderMutation, CreateUpdateSavedHostingFolderMutationVariables>(CreateUpdateSavedHostingFolderDocument);
};
export const CreateOrUpdateHostingDocument = gql`
    mutation CreateOrUpdateHosting($input: HostingInput!) {
  createOrUpdateHosting(input: $input) {
    message
    data {
      id
      kind
      parentId
      title
      propertyType
      listingType
      description
      categories
      postalCode
      city
      street
      state
      country
      longitude
      latitude
      landmarks
      contact
      price
      paymentInterval
      facilities
      averageRating
      totalRatings
      publishStatus
      createdAt
      lastUpdated
      saved
      rooms {
        id
        name
        count
        description
        createdAt
        lastUpdated
        images {
          id
          createdAt
          lastUpdated
          asset {
            id
            publicUrl
          }
        }
      }
      host {
        id
        user {
          id
          email
          profile {
            fullName
            gender
            id
          }
        }
        createdAt
      }
      coverImage {
        id
        createdAt
        lastUpdated
        asset {
          id
          publicUrl
        }
      }
      paymentDetails {
        id
        accountNumber
        accountName
        bankCode
        createdAt
        lastUpdated
        bankDetails {
          name
          slug
          code
          active
          currency
          image
        }
      }
      reviews {
        averageRating
        description
        lastUpdated
        id
        user {
          id
          profile {
            fullName
            id
            gender
          }
        }
      }
      reviewAverage {
        cleanliness
        accuracy
        communication
        location
        checkIn
        value
      }
      tenancyAgreementTemplate {
        sections {
          id
          title
          description
          priority
          preamble
          subClauses {
            id
            title
            description
            content
            isMandatory
            isActive
            priority
            isCustom
            requiredVariables {
              name
              type
            }
            providedValues {
              key
              value
            }
          }
        }
      }
      verification {
        id
        landlordFullName
        landlordAddress
        verificationTier
        propertyRelationship
        declOwnership
        declLitigation
        declIndemnity
        titleType
        titleNumber
        createdAt
        lastUpdated
      }
      cautionFee
      serviceCharge
      maxOccupants
      bookingApplicationsCount
    }
  }
}
    `;

export function useCreateOrUpdateHostingMutation() {
  return Urql.useMutation<CreateOrUpdateHostingMutation, CreateOrUpdateHostingMutationVariables>(CreateOrUpdateHostingDocument);
};
export const CreateOrUpdateHostingRoomDocument = gql`
    mutation CreateOrUpdateHostingRoom($input: HostingRoomInput!) {
  createOrUpdateHostingRoom(input: $input) {
    message
    data {
      name
      id
      images {
        id
        asset {
          publicUrl
          id
        }
      }
      description
      createdAt
      lastUpdated
      count
    }
  }
}
    `;

export function useCreateOrUpdateHostingRoomMutation() {
  return Urql.useMutation<CreateOrUpdateHostingRoomMutation, CreateOrUpdateHostingRoomMutationVariables>(CreateOrUpdateHostingRoomDocument);
};
export const CreateHostingRoomImageDocument = gql`
    mutation CreateHostingRoomImage($input: HostingRoomImageInput!) {
  createHostingRoomImage(input: $input) {
    message
    data {
      id
      asset {
        id
        publicUrl
      }
    }
  }
}
    `;

export function useCreateHostingRoomImageMutation() {
  return Urql.useMutation<CreateHostingRoomImageMutation, CreateHostingRoomImageMutationVariables>(CreateHostingRoomImageDocument);
};
export const SetHostingCoverImageDocument = gql`
    mutation SetHostingCoverImage($hostingRoomImageId: String!) {
  setHostingCoverImage(hostingRoomImageId: $hostingRoomImageId) {
    message
    data {
      id
      sequence
      asset {
        id
        publicUrl
      }
    }
  }
}
    `;

export function useSetHostingCoverImageMutation() {
  return Urql.useMutation<SetHostingCoverImageMutation, SetHostingCoverImageMutationVariables>(SetHostingCoverImageDocument);
};
export const CreateHostingVideoUploadUrlDocument = gql`
    mutation CreateHostingVideoUploadUrl($hostingId: String!, $contentType: String!) {
  createHostingVideoUploadUrl(hostingId: $hostingId, contentType: $contentType) {
    assetId
    uploadUrl
  }
}
    `;

export function useCreateHostingVideoUploadUrlMutation() {
  return Urql.useMutation<CreateHostingVideoUploadUrlMutation, CreateHostingVideoUploadUrlMutationVariables>(CreateHostingVideoUploadUrlDocument);
};
export const SetHostingVideoDocument = gql`
    mutation SetHostingVideo($input: VideoWalkthroughInput!, $assetId: String!) {
  setHostingVideo(input: $input, assetId: $assetId) {
    message
    data {
      id
      durationSeconds
      asset {
        id
        publicUrl
      }
    }
  }
}
    `;

export function useSetHostingVideoMutation() {
  return Urql.useMutation<SetHostingVideoMutation, SetHostingVideoMutationVariables>(SetHostingVideoDocument);
};
export const ReorderHostingRoomsDocument = gql`
    mutation ReorderHostingRooms($hostingId: String!, $orderedRoomIds: [String!]!) {
  reorderHostingRooms(hostingId: $hostingId, orderedRoomIds: $orderedRoomIds) {
    message
  }
}
    `;

export function useReorderHostingRoomsMutation() {
  return Urql.useMutation<ReorderHostingRoomsMutation, ReorderHostingRoomsMutationVariables>(ReorderHostingRoomsDocument);
};
export const ReorderHostingRoomImagesDocument = gql`
    mutation ReorderHostingRoomImages($roomId: String!, $orderedImageIds: [String!]!) {
  reorderHostingRoomImages(roomId: $roomId, orderedImageIds: $orderedImageIds) {
    message
  }
}
    `;

export function useReorderHostingRoomImagesMutation() {
  return Urql.useMutation<ReorderHostingRoomImagesMutation, ReorderHostingRoomImagesMutationVariables>(ReorderHostingRoomImagesDocument);
};
export const DeleteHostingRoomImageDocument = gql`
    mutation DeleteHostingRoomImage($hostingRoomImageId: String!) {
  deleteHostingRoomImage(hostingRoomImageId: $hostingRoomImageId) {
    message
  }
}
    `;

export function useDeleteHostingRoomImageMutation() {
  return Urql.useMutation<DeleteHostingRoomImageMutation, DeleteHostingRoomImageMutationVariables>(DeleteHostingRoomImageDocument);
};
export const MoveHostingRoomImagesDocument = gql`
    mutation MoveHostingRoomImages($targetRoomId: String!, $imageIds: [String!]!) {
  moveHostingRoomImages(targetRoomId: $targetRoomId, imageIds: $imageIds) {
    message
  }
}
    `;

export function useMoveHostingRoomImagesMutation() {
  return Urql.useMutation<MoveHostingRoomImagesMutation, MoveHostingRoomImagesMutationVariables>(MoveHostingRoomImagesDocument);
};
export const DeleteHostingRoomDocument = gql`
    mutation DeleteHostingRoom($hostingRoomId: String!) {
  deleteHostingRoom(hostingRoomId: $hostingRoomId) {
    message
  }
}
    `;

export function useDeleteHostingRoomMutation() {
  return Urql.useMutation<DeleteHostingRoomMutation, DeleteHostingRoomMutationVariables>(DeleteHostingRoomDocument);
};
export const CreateUpdateSavedHostingDocument = gql`
    mutation CreateUpdateSavedHosting($input: SavedHostingInput!) {
  createUpdateSavedHosting(input: $input) {
    message
  }
}
    `;

export function useCreateUpdateSavedHostingMutation() {
  return Urql.useMutation<CreateUpdateSavedHostingMutation, CreateUpdateSavedHostingMutationVariables>(CreateUpdateSavedHostingDocument);
};
export const DeleteSavedHostingDocument = gql`
    mutation DeleteSavedHosting($hostingId: String!) {
  deleteSavedHosting(hostingId: $hostingId) {
    message
  }
}
    `;

export function useDeleteSavedHostingMutation() {
  return Urql.useMutation<DeleteSavedHostingMutation, DeleteSavedHostingMutationVariables>(DeleteSavedHostingDocument);
};
export const DeleteSavedHostingFolderDocument = gql`
    mutation DeleteSavedHostingFolder($folderId: String!) {
  deleteSavedHostingFolder(folderId: $folderId) {
    message
  }
}
    `;

export function useDeleteSavedHostingFolderMutation() {
  return Urql.useMutation<DeleteSavedHostingFolderMutation, DeleteSavedHostingFolderMutationVariables>(DeleteSavedHostingFolderDocument);
};
export const CreateUpdateHostingReviewDocument = gql`
    mutation CreateUpdateHostingReview($input: HostingReviewInput!) {
  createOrUpdateHostingReview(input: $input) {
    message
    data {
      id
    }
  }
}
    `;

export function useCreateUpdateHostingReviewMutation() {
  return Urql.useMutation<CreateUpdateHostingReviewMutation, CreateUpdateHostingReviewMutationVariables>(CreateUpdateHostingReviewDocument);
};
export const InitiateHostingVerificationDocument = gql`
    mutation InitiateHostingVerification($input: HostingVerificationInput!) {
  initiateHostingVerification(input: $input) {
    message
    data {
      id
      landlordFullName
      landlordAddress
      verificationTier
      propertyRelationship
      declOwnership
      declLitigation
      declIndemnity
      titleType
      titleNumber
      createdAt
      lastUpdated
    }
  }
}
    `;

export function useInitiateHostingVerificationMutation() {
  return Urql.useMutation<InitiateHostingVerificationMutation, InitiateHostingVerificationMutationVariables>(InitiateHostingVerificationDocument);
};
export const RequestHostingVerificationTierDocument = gql`
    mutation RequestHostingVerificationTier($input: HostingVerificationTierRequestInput!) {
  requestHostingVerificationTier(input: $input) {
    message
    data {
      id
      tier
      status
      statusDetails
      createdAt
      lastUpdated
      documents {
        id
        name
        createdAt
        lastUpdated
        asset {
          id
          publicUrl
        }
      }
      logs {
        datetime
        variant
        staffId
        action
        statusDetail
      }
    }
  }
}
    `;

export function useRequestHostingVerificationTierMutation() {
  return Urql.useMutation<RequestHostingVerificationTierMutation, RequestHostingVerificationTierMutationVariables>(RequestHostingVerificationTierDocument);
};
export const DeleteHostingDocument = gql`
    mutation deleteHosting($hostingId: String!) {
  deleteHosting(hostingId: $hostingId) {
    message
  }
}
    `;

export function useDeleteHostingMutation() {
  return Urql.useMutation<DeleteHostingMutation, DeleteHostingMutationVariables>(DeleteHostingDocument);
};
export const DuplicateHostingDocument = gql`
    mutation duplicateHosting($sourceHostingId: String!) {
  duplicateHosting(sourceHostingId: $sourceHostingId) {
    message
    data {
      id
    }
  }
}
    `;

export function useDuplicateHostingMutation() {
  return Urql.useMutation<DuplicateHostingMutation, DuplicateHostingMutationVariables>(DuplicateHostingDocument);
};
export const MarkNotificationAsReadDocument = gql`
    mutation MarkNotificationAsRead($notificationId: String!) {
  markNotificationAsRead(notificationId: $notificationId) {
    message
  }
}
    `;

export function useMarkNotificationAsReadMutation() {
  return Urql.useMutation<MarkNotificationAsReadMutation, MarkNotificationAsReadMutationVariables>(MarkNotificationAsReadDocument);
};
export const MarkAllNotificationsAsReadDocument = gql`
    mutation MarkAllNotificationsAsRead {
  markAllNotificationsAsRead {
    message
  }
}
    `;

export function useMarkAllNotificationsAsReadMutation() {
  return Urql.useMutation<MarkAllNotificationsAsReadMutation, MarkAllNotificationsAsReadMutationVariables>(MarkAllNotificationsAsReadDocument);
};
export const CreateUpdateHostPaymentDetailsDocument = gql`
    mutation CreateUpdateHostPaymentDetails($input: HostAccountDetailsInput!) {
  createUpdateHostPaymentDetails(input: $input) {
    message
    data {
      id
      accountNumber
      bankCode
      createdAt
      lastUpdated
      bankDetails {
        name
        slug
        code
        active
        currency
        image
      }
      accountName
    }
  }
}
    `;

export function useCreateUpdateHostPaymentDetailsMutation() {
  return Urql.useMutation<CreateUpdateHostPaymentDetailsMutation, CreateUpdateHostPaymentDetailsMutationVariables>(CreateUpdateHostPaymentDetailsDocument);
};
export const RetryBookingPaymentDocument = gql`
    mutation RetryBookingPayment($bookingId: String!) {
  retryBookingPayment(bookingId: $bookingId) {
    message
    data {
      id
      reference
      amount
      status
    }
  }
}
    `;

export function useRetryBookingPaymentMutation() {
  return Urql.useMutation<RetryBookingPaymentMutation, RetryBookingPaymentMutationVariables>(RetryBookingPaymentDocument);
};
export const VerifyTransactionByReferenceDocument = gql`
    mutation VerifyTransactionByReference($reference: String!) {
  verifyTransactionByReference(reference: $reference) {
    message
    data {
      id
      status
    }
  }
}
    `;

export function useVerifyTransactionByReferenceMutation() {
  return Urql.useMutation<VerifyTransactionByReferenceMutation, VerifyTransactionByReferenceMutationVariables>(VerifyTransactionByReferenceDocument);
};
export const InitiateSupportChatDocument = gql`
    mutation InitiateSupportChat($itemType: SupportItemType, $itemId: String, $initialMessage: String) {
  initiateSupportChat(
    itemType: $itemType
    itemId: $itemId
    initialMessage: $initialMessage
  ) {
    id
    status
    createdAt
    lastUpdated
    messages(pagination: {offset: 0, limit: 1}) {
      id
    }
  }
}
    `;

export function useInitiateSupportChatMutation() {
  return Urql.useMutation<InitiateSupportChatMutation, InitiateSupportChatMutationVariables>(InitiateSupportChatDocument);
};
export const SendSupportMessageDocument = gql`
    mutation SendSupportMessage($chatId: String!, $text: String!) {
  sendSupportMessage(chatId: $chatId, text: $text) {
    id
    chatId
    text
    createdAt
    isReadByUser
    sender {
      id
      isStaff
      profile {
        fullName
      }
    }
  }
}
    `;

export function useSendSupportMessageMutation() {
  return Urql.useMutation<SendSupportMessageMutation, SendSupportMessageMutationVariables>(SendSupportMessageDocument);
};
export const UpdateHostDocument = gql`
    mutation UpdateHost($input: HostInput!) {
  updateHost(input: $input) {
    message
    data {
      signature {
        id
        publicUrl
      }
    }
  }
}
    `;

export function useUpdateHostMutation() {
  return Urql.useMutation<UpdateHostMutation, UpdateHostMutationVariables>(UpdateHostDocument);
};
export const UpdateGuestDocument = gql`
    mutation UpdateGuest($input: GuestInput!) {
  updateGuest(input: $input) {
    message
    data {
      signature {
        publicUrl
        id
      }
    }
  }
}
    `;

export function useUpdateGuestMutation() {
  return Urql.useMutation<UpdateGuestMutation, UpdateGuestMutationVariables>(UpdateGuestDocument);
};
export const UpdatePushNotificationTokenDocument = gql`
    mutation UpdatePushNotificationToken($input: UpdateNotificationTokensInput!) {
  updatePushNotificationToken(tokens: $input) {
    message
  }
}
    `;

export function useUpdatePushNotificationTokenMutation() {
  return Urql.useMutation<UpdatePushNotificationTokenMutation, UpdatePushNotificationTokenMutationVariables>(UpdatePushNotificationTokenDocument);
};
export const UpdateUserNotificationSettingsDocument = gql`
    mutation UpdateUserNotificationSettings($input: NotificationSettingsInput!) {
  updateUserNotificationSettings(input: $input) {
    message
    data {
      id
      pushNotifications
      specialOffers
      email
      appUpdates
    }
  }
}
    `;

export function useUpdateUserNotificationSettingsMutation() {
  return Urql.useMutation<UpdateUserNotificationSettingsMutation, UpdateUserNotificationSettingsMutationVariables>(UpdateUserNotificationSettingsDocument);
};
export const UpdateProfileDocument = gql`
    mutation UpdateProfile($input: ProfileUpdateInput!) {
  updateProfile(input: $input) {
    message
    data {
      id
      fullName
      gender
      createdAt
      lastUpdated
      image {
        publicUrl
      }
    }
  }
}
    `;

export function useUpdateProfileMutation() {
  return Urql.useMutation<UpdateProfileMutation, UpdateProfileMutationVariables>(UpdateProfileDocument);
};
export const UploadKycImageDocument = gql`
    mutation UploadKycImage($file: Upload!) {
  uploadKycImage(file: $file) {
    id
    image {
      id
      secureUrl
    }
  }
}
    `;

export function useUploadKycImageMutation() {
  return Urql.useMutation<UploadKycImageMutation, UploadKycImageMutationVariables>(UploadKycImageDocument);
};
export const VerifyKycDocument = gql`
    mutation VerifyKyc($input: KycInput!) {
  verifyKyc(input: $input) {
    bvnVerified
    id
    ninVerified
    image {
      id
      secureUrl
    }
  }
}
    `;

export function useVerifyKycMutation() {
  return Urql.useMutation<VerifyKycMutation, VerifyKycMutationVariables>(VerifyKycDocument);
};
export const InitiatePhoneNumberVerificationDocument = gql`
    mutation InitiatePhoneNumberVerification($phoneNumber: String!) {
  initiatePhoneNumberVerification(phoneNumber: $phoneNumber) {
    message
  }
}
    `;

export function useInitiatePhoneNumberVerificationMutation() {
  return Urql.useMutation<InitiatePhoneNumberVerificationMutation, InitiatePhoneNumberVerificationMutationVariables>(InitiatePhoneNumberVerificationDocument);
};
export const CompletePhoneNumberVerificationDocument = gql`
    mutation CompletePhoneNumberVerification($input: PhoneNumberVerificationInput!) {
  completePhoneNumberVerification(input: $input) {
    message
    data {
      id
      number
      verificationStatus
    }
  }
}
    `;

export function useCompletePhoneNumberVerificationMutation() {
  return Urql.useMutation<CompletePhoneNumberVerificationMutation, CompletePhoneNumberVerificationMutationVariables>(CompletePhoneNumberVerificationDocument);
};
export const DeleteAccountDocument = gql`
    mutation DeleteAccount {
  deleteAccount {
    message
    data
  }
}
    `;

export function useDeleteAccountMutation() {
  return Urql.useMutation<DeleteAccountMutation, DeleteAccountMutationVariables>(DeleteAccountDocument);
};
export const AdminFeeConfigDocument = gql`
    query AdminFeeConfig {
  adminFeeConfig {
    id
    shortLetHostChargesPercent
    shortLetGuestChargesPercent
    secureLeaseGuestContributionPercent
    standardLegalFee
    cautionCustodyFeePercent
    cautionDisputeFee
    cautionClaimWindowDays
  }
}
    `;

export function useAdminFeeConfigQuery(options?: Omit<Urql.UseQueryArgs<AdminFeeConfigQueryVariables>, 'query'>) {
  return Urql.useQuery<AdminFeeConfigQuery, AdminFeeConfigQueryVariables>({ query: AdminFeeConfigDocument, ...options });
};
export const AdminLegalConfigDocument = gql`
    query AdminLegalConfig {
  adminLegalConfig {
    id
    legalFeePercentage
    inspectionNoticeDays
    cautionRefundDays
    gracePeriodDays
    latePaymentInterestRate
    breakNoticePeriod
    minimumOccupationPeriod
    renewalNoticeMonths
    guestStayDays
    forfeitureGracePeriodDays
    mesneProfitRate
  }
}
    `;

export function useAdminLegalConfigQuery(options?: Omit<Urql.UseQueryArgs<AdminLegalConfigQueryVariables>, 'query'>) {
  return Urql.useQuery<AdminLegalConfigQuery, AdminLegalConfigQueryVariables>({ query: AdminLegalConfigDocument, ...options });
};
export const BookingApplicationsCountDocument = gql`
    query BookingApplicationsCount($filter: BookingApplicationFilter) {
  bookingApplicationsCount(filter: $filter)
}
    `;

export function useBookingApplicationsCountQuery(options?: Omit<Urql.UseQueryArgs<BookingApplicationsCountQueryVariables>, 'query'>) {
  return Urql.useQuery<BookingApplicationsCountQuery, BookingApplicationsCountQueryVariables>({ query: BookingApplicationsCountDocument, ...options });
};
export const BookingApplicationsDocument = gql`
    query BookingApplications($filter: BookingApplicationFilter, $pagination: PaginationInput) {
  bookingApplications(filter: $filter, pagination: $pagination) {
    commencementDate
    fullName
    createdAt
    status
    id
    intervalMultiplier
    booking {
      id
    }
    hosting {
      id
      title
      city
      country
      state
      coverImage {
        id
        asset {
          id
          publicUrl
        }
      }
    }
    guest {
      user {
        profile {
          fullName
          image {
            publicUrl
          }
        }
      }
    }
  }
}
    `;

export function useBookingApplicationsQuery(options?: Omit<Urql.UseQueryArgs<BookingApplicationsQueryVariables>, 'query'>) {
  return Urql.useQuery<BookingApplicationsQuery, BookingApplicationsQueryVariables>({ query: BookingApplicationsDocument, ...options });
};
export const CalculateHostingFeesDocument = gql`
    query CalculateHostingFees($hostingId: String!, $multiplier: Int!) {
  calculateHostingFees(hostingId: $hostingId, multiplier: $multiplier) {
    baseRent
    totalPayableAmount
    cautionFee
    serviceCharge
    legalFee
    stampDuty
    guestServiceCharge
    hostServiceCharge
    paymentWindowDays
    lineItems {
      key
      label
      description
      amount
    }
  }
}
    `;

export function useCalculateHostingFeesQuery(options: Omit<Urql.UseQueryArgs<CalculateHostingFeesQueryVariables>, 'query'>) {
  return Urql.useQuery<CalculateHostingFeesQuery, CalculateHostingFeesQueryVariables>({ query: CalculateHostingFeesDocument, ...options });
};
export const BookingApplicationDocument = gql`
    query BookingApplication($bookingApplicationId: String!) {
  bookingApplication(bookingApplicationId: $bookingApplicationId) {
    id
    fullName
    email
    phoneNumber
    commencementDate
    correspondenceAddress
    intervalMultiplier
    status
    statusDetails
    createdAt
    lastUpdated
    guest {
      user {
        profile {
          fullName
          image {
            publicUrl
          }
        }
      }
    }
    guestFormData {
      employmentStatus
      incomeRanges
      occupancyTypes
      guarantorRelationships
      guarantorName
      guarantorPhone
      guarantorAddress
    }
    bookingAggrement {
      sections {
        id
        title
        description
        priority
        preamble
        subClauses {
          id
          title
          description
          priority
          content
          isMandatory
          isActive
          isCustom
          requiredVariables {
            name
            type
          }
          providedValues {
            key
            value
          }
        }
      }
    }
    booking {
      id
    }
    hosting {
      id
      title
      city
      country
      state
      coverImage {
        id
        asset {
          id
          publicUrl
        }
      }
    }
  }
}
    `;

export function useBookingApplicationQuery(options: Omit<Urql.UseQueryArgs<BookingApplicationQueryVariables>, 'query'>) {
  return Urql.useQuery<BookingApplicationQuery, BookingApplicationQueryVariables>({ query: BookingApplicationDocument, ...options });
};
export const BookingsDocument = gql`
    query Bookings($filter: BookingFilterInput, $pagination: PaginationInput) {
  bookings(filter: $filter, pagination: $pagination) {
    id
    bookingReference
    hosting {
      id
      coverImage {
        id
        asset {
          id
          publicUrl
        }
      }
      title
      city
      country
      state
      price
      paymentInterval
    }
    expiresAt
    paymentStatus
    status
    transaction {
      id
      reference
    }
    createdAt
    commencementDate
    expiryDate
    guestServiceCharge
    amount
    phoneNumber
    cautionFee
    legalFee
    stampDuty
    serviceCharge
    feeLineItems {
      key
      label
      description
      amount
    }
  }
}
    `;

export function useBookingsQuery(options?: Omit<Urql.UseQueryArgs<BookingsQueryVariables>, 'query'>) {
  return Urql.useQuery<BookingsQuery, BookingsQueryVariables>({ query: BookingsDocument, ...options });
};
export const BookingDocument = gql`
    query Booking($bookingId: String!) {
  booking(bookingId: $bookingId) {
    id
    bookingReference
    hosting {
      id
      coverImage {
        id
        asset {
          id
          publicUrl
        }
      }
      title
      city
      country
      state
      price
      paymentInterval
      propertyType
      street
      landmarks
      averageRating
      totalRatings
    }
    expiresAt
    paymentStatus
    transaction {
      id
      status
      reference
    }
    createdAt
    commencementDate
    expiryDate
    guestServiceCharge
    amount
    phoneNumber
    fullName
    email
    paymentMethod
    tenancyAgreementAsset {
      id
      publicUrl
    }
    guest {
      user {
        id
      }
    }
    status
    userReview {
      averageRating
      description
      lastUpdated
      id
      user {
        id
        profile {
          fullName
          id
          gender
        }
      }
      checkIn
      accuracy
      cleanliness
      communication
      value
      location
    }
    bookingApplication {
      id
      intervalMultiplier
      commencementDate
    }
    cautionFee
    serviceCharge
    legalFee
    stampDuty
    feeLineItems {
      key
      label
      description
      amount
    }
  }
}
    `;

export function useBookingQuery(options: Omit<Urql.UseQueryArgs<BookingQueryVariables>, 'query'>) {
  return Urql.useQuery<BookingQuery, BookingQueryVariables>({ query: BookingDocument, ...options });
};
export const GuestBookingTenancyAgreementPreviewDocument = gql`
    query GuestBookingTenancyAgreementPreview($bookingId: String!) {
  guestBookingTenancyAgreementPreview(bookingId: $bookingId)
}
    `;

export function useGuestBookingTenancyAgreementPreviewQuery(options: Omit<Urql.UseQueryArgs<GuestBookingTenancyAgreementPreviewQueryVariables>, 'query'>) {
  return Urql.useQuery<GuestBookingTenancyAgreementPreviewQuery, GuestBookingTenancyAgreementPreviewQueryVariables>({ query: GuestBookingTenancyAgreementPreviewDocument, ...options });
};
export const CautionClaimsForBookingDocument = gql`
    query CautionClaimsForBooking($bookingId: String!) {
  cautionClaimsForBooking(bookingId: $bookingId) {
    id
    bookingId
    amountRequested
    status
    hostNotes
    guestResponseNotes
    adminNotes
    disputeFeeApplied
    createdAt
    resolvedAt
    lastUpdated
  }
}
    `;

export function useCautionClaimsForBookingQuery(options: Omit<Urql.UseQueryArgs<CautionClaimsForBookingQueryVariables>, 'query'>) {
  return Urql.useQuery<CautionClaimsForBookingQuery, CautionClaimsForBookingQueryVariables>({ query: CautionClaimsForBookingDocument, ...options });
};
export const CautionRefundForBookingDocument = gql`
    query CautionRefundForBooking($bookingId: String!) {
  cautionRefundForBooking(bookingId: $bookingId) {
    id
    bookingId
    amount
    status
    accountNumber
    accountName
    bankName
    bankCode
    blockedReason
    createdAt
    lastUpdated
  }
}
    `;

export function useCautionRefundForBookingQuery(options: Omit<Urql.UseQueryArgs<CautionRefundForBookingQueryVariables>, 'query'>) {
  return Urql.useQuery<CautionRefundForBookingQuery, CautionRefundForBookingQueryVariables>({ query: CautionRefundForBookingDocument, ...options });
};
export const CanLeaveBookingFeedbackDocument = gql`
    query CanLeaveBookingFeedback($bookingId: String!) {
  canLeaveBookingFeedback(bookingId: $bookingId)
}
    `;

export function useCanLeaveBookingFeedbackQuery(options: Omit<Urql.UseQueryArgs<CanLeaveBookingFeedbackQueryVariables>, 'query'>) {
  return Urql.useQuery<CanLeaveBookingFeedbackQuery, CanLeaveBookingFeedbackQueryVariables>({ query: CanLeaveBookingFeedbackDocument, ...options });
};
export const ShouldShowNpsSurveyDocument = gql`
    query ShouldShowNPSSurvey {
  shouldShowNpsSurvey
}
    `;

export function useShouldShowNpsSurveyQuery(options?: Omit<Urql.UseQueryArgs<ShouldShowNpsSurveyQueryVariables>, 'query'>) {
  return Urql.useQuery<ShouldShowNpsSurveyQuery, ShouldShowNpsSurveyQueryVariables>({ query: ShouldShowNpsSurveyDocument, ...options });
};
export const UserChatsDocument = gql`
    query UserChats($filter: HostingChatFilter, $pagination: PaginationInput) {
  userChats(filter: $filter, pagination: $pagination) {
    id
    lastUpdated
    unreadMessageCount
    lastMessage {
      id
      text
      assets {
        id
        asset {
          id
          publicUrl
          contentType
        }
      }
    }
    recipientUser {
      id
      profile {
        fullName
        id
        gender
        image {
          publicUrl
        }
      }
      onlineUser {
        id
        online
      }
    }
    hosting {
      id
      title
      coverImage {
        id
        asset {
          id
          publicUrl
        }
      }
    }
    host {
      id
      user {
        id
        profile {
          fullName
        }
      }
    }
    guest {
      id
      user {
        id
        profile {
          fullName
        }
      }
    }
  }
}
    `;

export function useUserChatsQuery(options?: Omit<Urql.UseQueryArgs<UserChatsQueryVariables>, 'query'>) {
  return Urql.useQuery<UserChatsQuery, UserChatsQueryVariables>({ query: UserChatsDocument, ...options });
};
export const ChatMessagesDocument = gql`
    query ChatMessages($chatId: String!, $pagination: PaginationInput) {
  chatMessages(chatId: $chatId, pagination: $pagination) {
    id
    text
    messageType
    callType
    callId
    callDurationSeconds
    isSender
    sender {
      id
      profile {
        id
        gender
        fullName
        image {
          publicUrl
        }
      }
    }
    edited
    createdAt
    lastUpdated
    assets {
      id
      asset {
        id
        publicUrl
        contentType
        originalFilename
      }
    }
    isSender
  }
}
    `;

export function useChatMessagesQuery(options: Omit<Urql.UseQueryArgs<ChatMessagesQueryVariables>, 'query'>) {
  return Urql.useQuery<ChatMessagesQuery, ChatMessagesQueryVariables>({ query: ChatMessagesDocument, ...options });
};
export const HostingChatDocument = gql`
    query HostingChat($chatId: String!) {
  hostingChat(chatId: $chatId) {
    id
    hosting {
      id
      coverImage {
        id
        asset {
          id
          publicUrl
        }
      }
      title
      city
      state
      street
      landmarks
      price
      paymentInterval
    }
    recipientUser {
      id
      profile {
        gender
        id
        fullName
        image {
          publicUrl
        }
      }
    }
  }
}
    `;

export function useHostingChatQuery(options: Omit<Urql.UseQueryArgs<HostingChatQueryVariables>, 'query'>) {
  return Urql.useQuery<HostingChatQuery, HostingChatQueryVariables>({ query: HostingChatDocument, ...options });
};
export const HostingVerificationRequestsDocument = gql`
    query HostingVerificationRequests($hostingId: String!) {
  hostingVerificationRequests(hostingId: $hostingId) {
    id
    tier
    status
    statusDetails
    documents {
      id
      name
      createdAt
      lastUpdated
      asset {
        id
        publicUrl
      }
    }
    logs {
      datetime
      variant
      staffId
      action
      statusDetail
    }
    createdAt
    lastUpdated
  }
}
    `;

export function useHostingVerificationRequestsQuery(options: Omit<Urql.UseQueryArgs<HostingVerificationRequestsQueryVariables>, 'query'>) {
  return Urql.useQuery<HostingVerificationRequestsQuery, HostingVerificationRequestsQueryVariables>({ query: HostingVerificationRequestsDocument, ...options });
};
export const HostingVerificationTierDocument = gql`
    query HostingVerificationTier($tier: String!) {
  hostingVerificationTier(tier: $tier) {
    id
    tier
    description
    color
    price
    documentRequirements {
      title
      description
    }
  }
}
    `;

export function useHostingVerificationTierQuery(options: Omit<Urql.UseQueryArgs<HostingVerificationTierQueryVariables>, 'query'>) {
  return Urql.useQuery<HostingVerificationTierQuery, HostingVerificationTierQueryVariables>({ query: HostingVerificationTierDocument, ...options });
};
export const PropertyTypesDocument = gql`
    query PropertyTypes {
  propertyTypes {
    value
    label
    searchTerms
    rooms
    facilities
    category
    icon
  }
}
    `;

export function usePropertyTypesQuery(options?: Omit<Urql.UseQueryArgs<PropertyTypesQueryVariables>, 'query'>) {
  return Urql.useQuery<PropertyTypesQuery, PropertyTypesQueryVariables>({ query: PropertyTypesDocument, ...options });
};
export const AiHostingSearchPredictionsDocument = gql`
    query AiHostingSearchPredictions($userInput: String!) {
  aiHostingSearchPredictions(userInput: $userInput) {
    summary
    filters {
      city
      state
      country
      propertyType
      maxPrice
      minPrice
      facilities
    }
  }
}
    `;

export function useAiHostingSearchPredictionsQuery(options: Omit<Urql.UseQueryArgs<AiHostingSearchPredictionsQueryVariables>, 'query'>) {
  return Urql.useQuery<AiHostingSearchPredictionsQuery, AiHostingSearchPredictionsQueryVariables>({ query: AiHostingSearchPredictionsDocument, ...options });
};
export const AiHostingContentSuggestionDocument = gql`
    query AiHostingContentSuggestion($hostingId: String!) {
  aiHostingContentSuggestion(hostingId: $hostingId) {
    title
    description
  }
}
    `;

export function useAiHostingContentSuggestionQuery(options: Omit<Urql.UseQueryArgs<AiHostingContentSuggestionQueryVariables>, 'query'>) {
  return Urql.useQuery<AiHostingContentSuggestionQuery, AiHostingContentSuggestionQueryVariables>({ query: AiHostingContentSuggestionDocument, ...options });
};
export const TenancyAgreementTemplateDocument = gql`
    query TenancyAgreementTemplate {
  tenancyAgreementTemplate {
    totalSections
    sections {
      id
      title
      description
      priority
      preamble
      subClauses {
        id
        title
        description
        content
        isMandatory
        isActive
        isCustom
        requiredVariables {
          name
          type
        }
        providedValues {
          key
          value
        }
        priority
      }
    }
  }
}
    `;

export function useTenancyAgreementTemplateQuery(options?: Omit<Urql.UseQueryArgs<TenancyAgreementTemplateQueryVariables>, 'query'>) {
  return Urql.useQuery<TenancyAgreementTemplateQuery, TenancyAgreementTemplateQueryVariables>({ query: TenancyAgreementTemplateDocument, ...options });
};
export const HostingDocument = gql`
    query Hosting($hostingId: String!, $pagination: PaginationInput) {
  hosting(hostingId: $hostingId) {
    id
    kind
    parentId
    childCount
    priceFrom
    isBookable
    parent {
      id
      title
    }
    children(onSale: true) {
      id
      kind
      parentId
      childCount
      title
      state
      city
      price
      paymentInterval
      listingType
      publishStatus
      isBookable
      bookingApplicationsCount
      createdAt
      lastUpdated
      coverImage {
        id
        asset {
          id
          publicUrl
          lastUpdated
          originalFilename
        }
      }
    }
    title
    propertyType
    listingType
    description
    categories
    postalCode
    city
    street
    state
    country
    longitude
    latitude
    landmarks
    contact
    price
    paymentInterval
    facilities
    averageRating
    totalRatings
    publishStatus
    createdAt
    lastUpdated
    saved
    rooms {
      id
      name
      count
      description
      createdAt
      lastUpdated
      images {
        id
        createdAt
        lastUpdated
        asset {
          id
          publicUrl
          lastUpdated
        }
      }
    }
    host {
      id
      user {
        id
        email
        kushiId
        phoneNumber
        kyc {
          idDocumentType
          kycReferenceId
        }
        profile {
          fullName
          gender
          id
          image {
            publicUrl
            lastUpdated
          }
        }
      }
      signature {
        id
        publicUrl
        lastUpdated
      }
      createdAt
    }
    coverImage {
      id
      createdAt
      lastUpdated
      asset {
        id
        publicUrl
        lastUpdated
      }
    }
    video {
      id
      durationSeconds
      recordedAt
      asset {
        id
        publicUrl
        lastUpdated
      }
    }
    images(limit: 4) {
      id
      asset {
        id
        publicUrl
        lastUpdated
        originalFilename
      }
    }
    paymentDetails {
      id
      accountNumber
      accountName
      bankCode
      createdAt
      lastUpdated
      bankDetails {
        name
        slug
        code
        active
        currency
        image
      }
    }
    reviews(pagination: $pagination) {
      averageRating
      description
      lastUpdated
      id
      user {
        id
        profile {
          fullName
          id
          gender
          image {
            publicUrl
            lastUpdated
          }
        }
      }
    }
    reviewAverage {
      cleanliness
      accuracy
      communication
      location
      checkIn
      value
    }
    tenancyAgreementTemplate {
      totalSections
      sections {
        id
        title
        description
        priority
        preamble
        subClauses {
          id
          title
          description
          content
          isMandatory
          isActive
          priority
          isCustom
          requiredVariables {
            name
            type
          }
          providedValues {
            key
            value
          }
        }
      }
    }
    verification {
      id
      landlordFullName
      landlordAddress
      verificationTier
      propertyRelationship
      declOwnership
      declLitigation
      declIndemnity
      titleType
      titleNumber
      createdAt
      lastUpdated
      tierTooltip
    }
    cautionFee
    serviceCharge
    maxOccupants
    bookingApplicationsCount
  }
}
    `;

export function useHostingQuery(options: Omit<Urql.UseQueryArgs<HostingQueryVariables>, 'query'>) {
  return Urql.useQuery<HostingQuery, HostingQueryVariables>({ query: HostingDocument, ...options });
};
export const HostingsDocument = gql`
    query Hostings($filters: HostingFilterInput, $pagination: PaginationInput) {
  hostings(filters: $filters, pagination: $pagination) {
    id
    kind
    childCount
    priceFrom
    isBookable
    price
    listingType
    totalRatings
    averageRating
    country
    state
    title
    city
    street
    landmarks
    saved
    publishStatus
    latitude
    longitude
    paymentInterval
    verification {
      id
      verificationTier
      tierTooltip
    }
    coverImage {
      asset {
        publicUrl
        lastUpdated
      }
    }
    images(limit: 4) {
      id
      asset {
        id
        publicUrl
        lastUpdated
        originalFilename
      }
    }
    paymentInterval
    createdAt
  }
}
    `;

export function useHostingsQuery(options?: Omit<Urql.UseQueryArgs<HostingsQueryVariables>, 'query'>) {
  return Urql.useQuery<HostingsQuery, HostingsQueryVariables>({ query: HostingsDocument, ...options });
};
export const SavedHostingFoldersDocument = gql`
    query SavedHostingFolders($pagination: PaginationInput) {
  savedHostingFolders(pagination: $pagination) {
    id
    folderName
    createdAt
    lastUpdated
    itemCount
  }
}
    `;

export function useSavedHostingFoldersQuery(options?: Omit<Urql.UseQueryArgs<SavedHostingFoldersQueryVariables>, 'query'>) {
  return Urql.useQuery<SavedHostingFoldersQuery, SavedHostingFoldersQueryVariables>({ query: SavedHostingFoldersDocument, ...options });
};
export const SavedHostingsDocument = gql`
    query SavedHostings($filters: SavedHostingFilterInput, $pagination: PaginationInput) {
  savedHostings(filters: $filters, pagination: $pagination) {
    image {
      id
      asset {
        publicUrl
        lastUpdated
        id
      }
    }
    id
    hosting {
      totalRatings
      averageRating
      id
      title
      saved
      coverImage {
        id
        asset {
          id
          publicUrl
          lastUpdated
          originalFilename
        }
      }
    }
  }
}
    `;

export function useSavedHostingsQuery(options?: Omit<Urql.UseQueryArgs<SavedHostingsQueryVariables>, 'query'>) {
  return Urql.useQuery<SavedHostingsQuery, SavedHostingsQueryVariables>({ query: SavedHostingsDocument, ...options });
};
export const SavedHostingFolderDocument = gql`
    query SavedHostingFolder($savedHostingFolderId: String!) {
  savedHostingFolder(id: $savedHostingFolderId) {
    id
    folderName
    createdAt
    lastUpdated
    itemCount
  }
}
    `;

export function useSavedHostingFolderQuery(options: Omit<Urql.UseQueryArgs<SavedHostingFolderQueryVariables>, 'query'>) {
  return Urql.useQuery<SavedHostingFolderQuery, SavedHostingFolderQueryVariables>({ query: SavedHostingFolderDocument, ...options });
};
export const HostListingsDocument = gql`
    query HostListings($pagination: PaginationInput, $filters: HostingFilterInput) {
  hostings(pagination: $pagination, filters: $filters) {
    id
    kind
    parentId
    childCount
    coverImage {
      id
      asset {
        id
        publicUrl
        lastUpdated
        originalFilename
      }
    }
    title
    description
    state
    city
    listingType
    publishStatus
    bookingApplicationsCount
    createdAt
    lastUpdated
  }
}
    `;

export function useHostListingsQuery(options?: Omit<Urql.UseQueryArgs<HostListingsQueryVariables>, 'query'>) {
  return Urql.useQuery<HostListingsQuery, HostListingsQueryVariables>({ query: HostListingsDocument, ...options });
};
export const KycStatusDocument = gql`
    query KycStatus {
  kycStatus {
    bvnVerified
    ninVerified
    hasLiveness
    kycComplete
  }
}
    `;

export function useKycStatusQuery(options?: Omit<Urql.UseQueryArgs<KycStatusQueryVariables>, 'query'>) {
  return Urql.useQuery<KycStatusQuery, KycStatusQueryVariables>({ query: KycStatusDocument, ...options });
};
export const NotificationsDocument = gql`
    query Notifications($filter: NotificationsFilterInput, $pagination: PaginationInput) {
  notifications(filter: $filter, pagination: $pagination) {
    id
    title
    message
    type
    createdAt
    lastUpdated
    isRead
    data {
      intent
      subject
      id
    }
  }
}
    `;

export function useNotificationsQuery(options?: Omit<Urql.UseQueryArgs<NotificationsQueryVariables>, 'query'>) {
  return Urql.useQuery<NotificationsQuery, NotificationsQueryVariables>({ query: NotificationsDocument, ...options });
};
export const BanksDocument = gql`
    query Banks {
  banks {
    name
    slug
    code
    active
    currency
    image
  }
}
    `;

export function useBanksQuery(options?: Omit<Urql.UseQueryArgs<BanksQueryVariables>, 'query'>) {
  return Urql.useQuery<BanksQuery, BanksQueryVariables>({ query: BanksDocument, ...options });
};
export const ResolveBankAccountDocument = gql`
    query ResolveBankAccount($input: VerifyAccountInput!) {
  resolveBankAccount(input: $input)
}
    `;

export function useResolveBankAccountQuery(options: Omit<Urql.UseQueryArgs<ResolveBankAccountQueryVariables>, 'query'>) {
  return Urql.useQuery<ResolveBankAccountQuery, ResolveBankAccountQueryVariables>({ query: ResolveBankAccountDocument, ...options });
};
export const HostPaymentDetailsDocument = gql`
    query HostPaymentDetails {
  hostPaymentDetails {
    id
    accountNumber
    bankCode
    createdAt
    lastUpdated
    bankDetails {
      name
      slug
      code
      active
      currency
      image
    }
    accountName
  }
}
    `;

export function useHostPaymentDetailsQuery(options?: Omit<Urql.UseQueryArgs<HostPaymentDetailsQueryVariables>, 'query'>) {
  return Urql.useQuery<HostPaymentDetailsQuery, HostPaymentDetailsQueryVariables>({ query: HostPaymentDetailsDocument, ...options });
};
export const TransactionByReferenceDocument = gql`
    query TransactionByReference($reference: String!) {
  transactionByReference(reference: $reference) {
    id
    amount
    type
    createdAt
    lastUpdated
    flutterwaveChargeId
    reference
    status
    booking {
      id
      hosting {
        id
        title
      }
    }
  }
}
    `;

export function useTransactionByReferenceQuery(options: Omit<Urql.UseQueryArgs<TransactionByReferenceQueryVariables>, 'query'>) {
  return Urql.useQuery<TransactionByReferenceQuery, TransactionByReferenceQueryVariables>({ query: TransactionByReferenceDocument, ...options });
};
export const TransactionsDocument = gql`
    query Transactions($filter: TransactionFilter, $pagination: PaginationInput) {
  transactions(filter: $filter, pagination: $pagination) {
    id
    amount
    type
    createdAt
    lastUpdated
    reference
    status
    booking {
      id
      hosting {
        id
        title
      }
    }
  }
}
    `;

export function useTransactionsQuery(options?: Omit<Urql.UseQueryArgs<TransactionsQueryVariables>, 'query'>) {
  return Urql.useQuery<TransactionsQuery, TransactionsQueryVariables>({ query: TransactionsDocument, ...options });
};
export const MySupportChatsDocument = gql`
    query MySupportChats($pagination: PaginationInput) {
  mySupportChats(pagination: $pagination) {
    id
    status
    createdAt
    lastUpdated
    itemType
    messages(pagination: {offset: 0, limit: 1}) {
      id
      text
      createdAt
      isReadByUser
    }
  }
}
    `;

export function useMySupportChatsQuery(options?: Omit<Urql.UseQueryArgs<MySupportChatsQueryVariables>, 'query'>) {
  return Urql.useQuery<MySupportChatsQuery, MySupportChatsQueryVariables>({ query: MySupportChatsDocument, ...options });
};
export const SupportChatDocument = gql`
    query SupportChat($id: String!) {
  supportChat(id: $id) {
    id
    status
    createdAt
    lastUpdated
    itemType
    supportChatRating {
      id
      rating
      comment
      createdAt
    }
    user {
      id
      isStaff
      profile {
        fullName
        image {
          publicUrl
        }
      }
    }
    hosting {
      id
      title
      city
      state
      price
      paymentInterval
      coverImage {
        id
        asset {
          id
          publicUrl
        }
      }
    }
    booking {
      id
      bookingReference
      commencementDate
      durationDescription
      status
      hosting {
        id
        title
        city
        state
        price
        paymentInterval
        coverImage {
          id
          asset {
            id
            publicUrl
          }
        }
      }
    }
    transaction {
      id
      amount
      status
      createdAt
    }
  }
}
    `;

export function useSupportChatQuery(options: Omit<Urql.UseQueryArgs<SupportChatQueryVariables>, 'query'>) {
  return Urql.useQuery<SupportChatQuery, SupportChatQueryVariables>({ query: SupportChatDocument, ...options });
};
export const SupportChatMessagesDocument = gql`
    query SupportChatMessages($id: String!, $pagination: PaginationInput) {
  supportChat(id: $id) {
    id
    messages(pagination: $pagination) {
      id
      text
      createdAt
      isReadByUser
      assets {
        id
        asset {
          id
          publicUrl
          contentType
          originalFilename
        }
      }
      sender {
        id
        isStaff
        profile {
          fullName
        }
      }
    }
  }
}
    `;

export function useSupportChatMessagesQuery(options: Omit<Urql.UseQueryArgs<SupportChatMessagesQueryVariables>, 'query'>) {
  return Urql.useQuery<SupportChatMessagesQuery, SupportChatMessagesQueryVariables>({ query: SupportChatMessagesDocument, ...options });
};
export const MeDocument = gql`
    query Me {
  me {
    id
    email
    kushiId
    createdAt
    lastUpdated
    profile {
      id
      fullName
      gender
      createdAt
      lastUpdated
    }
    notificationSettings {
      id
      email
      appUpdates
      pushNotifications
      specialOffers
      fcmToken
      voipToken
    }
    kyc {
      id
      bvnVerified
      ninVerified
      idDocumentType
      kycReferenceId
      image {
        id
        secureUrl
      }
    }
    phoneNumbers {
      id
      number
      verificationStatus
    }
  }
}
    `;

export function useMeQuery(options?: Omit<Urql.UseQueryArgs<MeQueryVariables>, 'query'>) {
  return Urql.useQuery<MeQuery, MeQueryVariables>({ query: MeDocument, ...options });
};
export const HostAnalyticsDocument = gql`
    query HostAnalytics {
  hostAnalytics {
    host {
      id
      user {
        id
        profile {
          fullName
          id
        }
      }
    }
    totalListings
    occupancyRate
    totalRevenue
    averageRating
    fundsInEscrow
    pendingApplications
    topListing {
      id
      coverImage {
        id
        asset {
          publicUrl
          originalFilename
          id
        }
      }
      city
      state
      price
      paymentInterval
      totalRatings
      title
      averageRating
    }
  }
}
    `;

export function useHostAnalyticsQuery(options?: Omit<Urql.UseQueryArgs<HostAnalyticsQueryVariables>, 'query'>) {
  return Urql.useQuery<HostAnalyticsQuery, HostAnalyticsQueryVariables>({ query: HostAnalyticsDocument, ...options });
};
export const RevenueGrowthDocument = gql`
    query RevenueGrowth($year: Int, $month: Int, $lastNYears: Int, $lastNMonths: Int) {
  hostAnalytics {
    revenueGrowth(
      year: $year
      month: $month
      lastNYears: $lastNYears
      lastNMonths: $lastNMonths
    ) {
      dataPoints {
        amount
        label
      }
    }
  }
}
    `;

export function useRevenueGrowthQuery(options?: Omit<Urql.UseQueryArgs<RevenueGrowthQueryVariables>, 'query'>) {
  return Urql.useQuery<RevenueGrowthQuery, RevenueGrowthQueryVariables>({ query: RevenueGrowthDocument, ...options });
};
export const AuthHostDocument = gql`
    query AuthHost {
  authHost {
    id
    createdAt
    lastUpdated
    signature {
      id
      secureUrl
      publicUrl
    }
  }
}
    `;

export function useAuthHostQuery(options?: Omit<Urql.UseQueryArgs<AuthHostQueryVariables>, 'query'>) {
  return Urql.useQuery<AuthHostQuery, AuthHostQueryVariables>({ query: AuthHostDocument, ...options });
};
export const AuthGuestDocument = gql`
    query AuthGuest {
  authGuest {
    id
    createdAt
    lastUpdated
    signature {
      id
      secureUrl
      publicUrl
    }
  }
}
    `;

export function useAuthGuestQuery(options?: Omit<Urql.UseQueryArgs<AuthGuestQueryVariables>, 'query'>) {
  return Urql.useQuery<AuthGuestQuery, AuthGuestQueryVariables>({ query: AuthGuestDocument, ...options });
};
export const UserPhoneNumersDocument = gql`
    query UserPhoneNumers($pagination: PaginationInput) {
  me {
    phoneNumbers(pagination: $pagination) {
      id
      number
      verificationStatus
      createdAt
      lastUpdated
    }
  }
}
    `;

export function useUserPhoneNumersQuery(options?: Omit<Urql.UseQueryArgs<UserPhoneNumersQueryVariables>, 'query'>) {
  return Urql.useQuery<UserPhoneNumersQuery, UserPhoneNumersQueryVariables>({ query: UserPhoneNumersDocument, ...options });
};
export const LatestHostingChatMessageDocument = gql`
    subscription LatestHostingChatMessage($chatId: String!) {
  latestHostingChatMessage(chatId: $chatId) {
    id
    text
    messageType
    callType
    callId
    callDurationSeconds
    isSender
    sender {
      id
      profile {
        id
        gender
        fullName
      }
    }
    edited
    createdAt
    lastUpdated
    assets {
      id
      asset {
        id
        publicUrl
        contentType
        originalFilename
      }
    }
  }
}
    `;

export function useLatestHostingChatMessageSubscription<TData = LatestHostingChatMessageSubscription>(options: Omit<Urql.UseSubscriptionArgs<LatestHostingChatMessageSubscriptionVariables>, 'query'>, handler?: Urql.SubscriptionHandler<LatestHostingChatMessageSubscription, TData>) {
  return Urql.useSubscription<LatestHostingChatMessageSubscription, TData, LatestHostingChatMessageSubscriptionVariables>({ query: LatestHostingChatMessageDocument, ...options }, handler);
};
export const OnlineUserDocument = gql`
    subscription OnlineUser($userId: String!) {
  onlineUser(userId: $userId) {
    online
    lastUpdated
    id
    lastSeen
  }
}
    `;

export function useOnlineUserSubscription<TData = OnlineUserSubscription>(options: Omit<Urql.UseSubscriptionArgs<OnlineUserSubscriptionVariables>, 'query'>, handler?: Urql.SubscriptionHandler<OnlineUserSubscription, TData>) {
  return Urql.useSubscription<OnlineUserSubscription, TData, OnlineUserSubscriptionVariables>({ query: OnlineUserDocument, ...options }, handler);
};
export const SupportChatMessageAddedDocument = gql`
    subscription SupportChatMessageAdded($chatId: String!) {
  supportChatMessageAdded(chatId: $chatId) {
    id
    chatId
    text
    createdAt
    isReadByUser
    sender {
      id
      isStaff
      profile {
        fullName
      }
    }
  }
}
    `;

export function useSupportChatMessageAddedSubscription<TData = SupportChatMessageAddedSubscription>(options: Omit<Urql.UseSubscriptionArgs<SupportChatMessageAddedSubscriptionVariables>, 'query'>, handler?: Urql.SubscriptionHandler<SupportChatMessageAddedSubscription, TData>) {
  return Urql.useSubscription<SupportChatMessageAddedSubscription, TData, SupportChatMessageAddedSubscriptionVariables>({ query: SupportChatMessageAddedDocument, ...options }, handler);
};