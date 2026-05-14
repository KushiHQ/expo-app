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
  Upload: { input: any; output: any; }
};

export type AdminReviewHostingVerificationRequestInput = {
  details?: InputMaybe<Scalars['String']['input']>;
  requestId: Scalars['String']['input'];
  status: HostingVerificationStatus;
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
  cautionFee?: Maybe<Scalars['Decimal']['output']>;
  checkInDate?: Maybe<Scalars['String']['output']>;
  checkOutDate?: Maybe<Scalars['String']['output']>;
  correspondenceAddress?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  durationDescription?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  expiresAt?: Maybe<Scalars['String']['output']>;
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
  status?: Maybe<BookingStatus>;
  tenancyAgreementAsset?: Maybe<Asset>;
  transaction?: Maybe<Transaction>;
  userReview?: Maybe<HostingReview>;
};

export type BookingApplication = {
  __typename?: 'BookingApplication';
  booking?: Maybe<Booking>;
  bookingAggrement?: Maybe<TenancyTemplate>;
  checkInDate?: Maybe<Scalars['String']['output']>;
  correspondenceAddress?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  email?: Maybe<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
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
  checkInDate?: InputMaybe<Scalars['String']['input']>;
  excludeStatuses?: InputMaybe<Array<BookingApplicationStatus>>;
  guestEmploymentStatus?: InputMaybe<GuestFormEmploymentStatus>;
  guestId?: InputMaybe<Scalars['String']['input']>;
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
  checkInDate?: InputMaybe<Scalars['String']['input']>;
  correspondenceAddress?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  fullName?: InputMaybe<Scalars['String']['input']>;
  guestFormData?: InputMaybe<GuestFormDataInput>;
  id: Scalars['String']['input'];
  intervalMultiplier?: InputMaybe<Scalars['Int']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
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
  Cancel = 'CANCEL',
  Video = 'VIDEO',
  Voice = 'VOICE'
}

export type CompletePasswordChangeInput = {
  email: Scalars['String']['input'];
  otp: Scalars['String']['input'];
  password1: Scalars['String']['input'];
  password2: Scalars['String']['input'];
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
  guarantorRelationships?: Maybe<GuestFormGuarantorRelationships>;
  incomeRanges?: Maybe<GuestFormIncomeRange>;
  occupancyTypes: GuestFormOccupancyType;
};

export type GuestFormDataInput = {
  employmentStatus: GuestFormEmploymentStatus;
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
  bookingApplicationsCount?: Maybe<Scalars['Int']['output']>;
  categories?: Maybe<Array<Scalars['String']['output']>>;
  cautionFee?: Maybe<Scalars['Decimal']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  contact?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  coverImage?: Maybe<HostingRoomImage>;
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  facilities?: Maybe<Array<Scalars['String']['output']>>;
  host: Host;
  id: Scalars['String']['output'];
  landmarks?: Maybe<Scalars['String']['output']>;
  lastUpdated: Scalars['String']['output'];
  latitude?: Maybe<Scalars['String']['output']>;
  listingType?: Maybe<ListingType>;
  longitude?: Maybe<Scalars['String']['output']>;
  paymentDetails?: Maybe<HostAccountDetails>;
  paymentInterval?: Maybe<PaymentInterval>;
  postalCode?: Maybe<Scalars['String']['output']>;
  price?: Maybe<Scalars['Decimal']['output']>;
  propertyType?: Maybe<Scalars['String']['output']>;
  publishStatus?: Maybe<PublishStatus>;
  reviewAverage: HostingReviewAverage;
  reviews: Array<HostingReview>;
  rooms: Array<HostingRoom>;
  saved: Scalars['Boolean']['output'];
  serviceCharge?: Maybe<Scalars['Decimal']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  street?: Maybe<Scalars['String']['output']>;
  tenancyAgreementTemplate?: Maybe<TenancyTemplate>;
  title?: Maybe<Scalars['String']['output']>;
  totalRatings?: Maybe<Scalars['Int']['output']>;
  verification?: Maybe<HostingVerification>;
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
  createdAt: Scalars['String']['output'];
  edited?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['String']['output'];
  isSender: Scalars['Boolean']['output'];
  lastUpdated: Scalars['String']['output'];
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
  cautionFee: Scalars['Decimal']['output'];
  guestServiceCharge: Scalars['Decimal']['output'];
  hostServiceCharge: Scalars['Decimal']['output'];
  legalFee: Scalars['Decimal']['output'];
  serviceCharge: Scalars['Decimal']['output'];
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
  landmarks?: InputMaybe<Scalars['String']['input']>;
  latitude?: InputMaybe<Scalars['String']['input']>;
  listingType?: InputMaybe<ListingType>;
  longitude?: InputMaybe<Scalars['String']['input']>;
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

export type HostingVerification = {
  __typename?: 'HostingVerification';
  createdAt: Scalars['String']['output'];
  declIndemnity: Scalars['Boolean']['output'];
  declLitigation: Scalars['Boolean']['output'];
  declOwnership: Scalars['Boolean']['output'];
  familyConsent?: Maybe<Asset>;
  id: Scalars['String']['output'];
  identityDocument?: Maybe<Asset>;
  landlordAddress: Scalars['String']['output'];
  landlordFullName: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  propertyRelationship: HostingPropertyRelationship;
  surveyPlan?: Maybe<Asset>;
  titleDocument?: Maybe<Asset>;
  utilityBill?: Maybe<Asset>;
  verificationTier: HostingVerificationTier;
};

export type HostingVerificationInput = {
  declIndemnity: Scalars['Boolean']['input'];
  declLitigation: Scalars['Boolean']['input'];
  declOwnership: Scalars['Boolean']['input'];
  familyConsentAssetId?: InputMaybe<Scalars['String']['input']>;
  hostingId: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  identityDocumentAssetId?: InputMaybe<Scalars['String']['input']>;
  landlordAddress: Scalars['String']['input'];
  landlordFullName: Scalars['String']['input'];
  propertyRelationship: HostingPropertyRelationship;
  surveyPlanAssetId?: InputMaybe<Scalars['String']['input']>;
  titleDocumentAssetId?: InputMaybe<Scalars['String']['input']>;
  utilityBillAssetId?: InputMaybe<Scalars['String']['input']>;
};

export type HostingVerificationRequest = {
  __typename?: 'HostingVerificationRequest';
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  status: HostingVerificationStatus;
  statusDetails?: Maybe<Scalars['String']['output']>;
  tier: HostingVerificationTier;
};

export type HostingVerificationRequestResponse = {
  __typename?: 'HostingVerificationRequestResponse';
  data?: Maybe<HostingVerificationRequest>;
  message: Scalars['String']['output'];
};

export type HostingVerificationResponse = {
  __typename?: 'HostingVerificationResponse';
  data?: Maybe<HostingVerification>;
  message: Scalars['String']['output'];
};

export enum HostingVerificationStatus {
  Pending = 'PENDING',
  Rejected = 'REJECTED',
  Verified = 'VERIFIED'
}

export enum HostingVerificationTier {
  AddressVerified = 'ADDRESS_VERIFIED',
  IdentityVerified = 'IDENTITY_VERIFIED',
  KushiVetted = 'KUSHI_VETTED',
  OwnerVerified = 'OWNER_VERIFIED',
  Unverified = 'UNVERIFIED'
}

export type Kyc = {
  __typename?: 'Kyc';
  bvnVerified?: Maybe<Scalars['Boolean']['output']>;
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  image?: Maybe<Asset>;
  lastUpdated: Scalars['String']['output'];
  ninVerified?: Maybe<Scalars['Boolean']['output']>;
};

export type KycInput = {
  bvn?: InputMaybe<Scalars['String']['input']>;
  nin?: InputMaybe<Scalars['String']['input']>;
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
  adminReviewHostingVerificationRequest: HostingVerificationRequestResponse;
  adminUpdateBookingApplicationStatus: BookingApplicationResponse;
  appleLogin: AuthTokenResponse;
  appleSignUp: AuthTokenResponse;
  cancelBookingApplication: MessageResponse;
  clearChatUrnreadMessages: MessageResponse;
  completeBookingApplicationSubmission: BookingApplicationResponse;
  completePasswordChange: MessageResponse;
  completePhoneNumberVerification: PhoneNumberResponse;
  createHostingRoomImage: HostingRoomImageResponse;
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
  finalizeBooking: Booking;
  googleLogin: AuthTokenResponse;
  googleSignUp: AuthTokenResponse;
  hostUpdateBookingApplicationStatus: BookingApplicationResponse;
  initiateBookingApplication: BookingApplicationResponse;
  initiateBookingApplicationSubmission: MessageResponse;
  initiateHostingChat: HostingChat;
  initiateHostingVerification: HostingVerificationResponse;
  initiatePhoneNumberVerification: MessageResponse;
  login: AuthTokenResponse;
  logout: MessageResponse;
  markAllNotificationsAsRead: MessageResponse;
  markNotificationAsRead: MessageResponse;
  refreshToken: AuthTokenResponse;
  requestHostingVerificationTier: HostingVerificationResponse;
  requestPasswordChange: MessageResponse;
  resendEmailVerificationOtp: MessageResponse;
  resendPasswordChangeOtp: MessageResponse;
  sendChatCallNotification: MessageResponse;
  signUp: UserResponse;
  updateBookingApplication: BookingApplicationResponse;
  updateGuest: GuestResponse;
  updateHost: HostResponse;
  updateProfile: ProfileResponse;
  updatePushNotificationToken: NotificationSettingsResponse;
  updateUserNotificationSettings: NotificationSettingsResponse;
  uploadKycImage: Kyc;
  verifyBookingPayment: BookingResponse;
  verifyEmail: MessageResponse;
  verifyKyc: Kyc;
  verifyTransactionByReference: TransactionResponse;
};


export type MutationsAdminReviewHostingVerificationRequestArgs = {
  input: AdminReviewHostingVerificationRequestInput;
};


export type MutationsAdminUpdateBookingApplicationStatusArgs = {
  input: BookingApplicationStatusUpdateInput;
};


export type MutationsAppleLoginArgs = {
  input: AppleAuthInput;
};


export type MutationsAppleSignUpArgs = {
  input: AppleAuthInput;
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


export type MutationsFinalizeBookingArgs = {
  bookingId: Scalars['String']['input'];
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


export type MutationsInitiateBookingApplicationArgs = {
  hostingId: Scalars['String']['input'];
};


export type MutationsInitiateBookingApplicationSubmissionArgs = {
  applicationId: Scalars['String']['input'];
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


export type MutationsLoginArgs = {
  input: LoginInput;
};


export type MutationsMarkNotificationAsReadArgs = {
  notificationId: Scalars['String']['input'];
};


export type MutationsRefreshTokenArgs = {
  input: RefreshTokenInput;
};


export type MutationsRequestHostingVerificationTierArgs = {
  hostingId: Scalars['String']['input'];
  targetTier: HostingVerificationTier;
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


export type MutationsSendChatCallNotificationArgs = {
  callId: Scalars['String']['input'];
  callType: CallType;
  chatId: Scalars['String']['input'];
};


export type MutationsSignUpArgs = {
  input: SignUpInput;
};


export type MutationsUpdateBookingApplicationArgs = {
  input: BookingApplicationUpdateInput;
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


export type MutationsUpdateUserNotificationSettingsArgs = {
  input: NotificationSettingsInput;
};


export type MutationsUploadKycImageArgs = {
  file: Scalars['Upload']['input'];
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

export enum PublishStatus {
  Archived = 'ARCHIVED',
  Draft = 'DRAFT',
  Inreview = 'INREVIEW',
  Live = 'LIVE',
  Rejected = 'REJECTED'
}

export type Query = {
  __typename?: 'Query';
  adminHostingVerificationRequests: Array<HostingVerificationRequest>;
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
  chatMessages: Array<HostingChatMessage>;
  guestAnalytics: GuestAnalytics;
  guestBookingTenancyAgreementPreview: Scalars['String']['output'];
  hostAnalytics: HostAnalytics;
  hostPaymentDetails: Array<HostAccountDetails>;
  hosting: Hosting;
  hostingChat: HostingChat;
  hostingCounts: HostingCounts;
  hostings: Array<Hosting>;
  landlordMandateOptions: LandlordMandateConfig;
  me: User;
  notifications: Array<Notification>;
  resolveBankAccount: Scalars['String']['output'];
  savedHosting: SavedHosting;
  savedHostingFolder: SavedHostingFolder;
  savedHostingFolders: Array<SavedHostingFolder>;
  savedHostings: Array<SavedHosting>;
  tenancyAgreementTemplate: TenancyTemplate;
  tenantMandateOptions: TenantMandateConfig;
  transactionByReference: Transaction;
  transactions: Array<Transaction>;
  userChats: Array<HostingChat>;
};


export type QueryAdminHostingVerificationRequestsArgs = {
  pagination?: InputMaybe<PaginationInput>;
  status?: InputMaybe<HostingVerificationStatus>;
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


export type QueryHostingsArgs = {
  filters?: InputMaybe<HostingFilterInput>;
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

export type RequestPasswordChangeInput = {
  email: Scalars['String']['input'];
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

export type Subscriptions = {
  __typename?: 'Subscriptions';
  latestHostingChatMessage: HostingChatMessage;
  onlineUser: OnlineUser;
};


export type SubscriptionsLatestHostingChatMessageArgs = {
  chatId: Scalars['String']['input'];
};


export type SubscriptionsOnlineUserArgs = {
  userId: Scalars['String']['input'];
};

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

export type Transaction = {
  __typename?: 'Transaction';
  amount: Scalars['Decimal']['output'];
  booking?: Maybe<Booking>;
  createdAt: Scalars['String']['output'];
  direction: TransactionDirection;
  flutterwaveChargeId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  reference?: Maybe<Scalars['String']['output']>;
  status: TransactionStatus;
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
  Pending = 'PENDING',
  Processing = 'PROCESSING',
  Refunded = 'REFUNDED',
  Success = 'SUCCESS'
}

export enum TransactionType {
  BookingPayment = 'booking_payment',
  HostBookingPayment = 'host_booking_payment'
}

export type UpdateNotificationTokensInput = {
  fcmToken?: InputMaybe<Scalars['String']['input']>;
  voipToken?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  kyc: Kyc;
  lastUpdated: Scalars['String']['output'];
  notificationSettings: NotificationSettings;
  onlineUser: OnlineUser;
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

export type VerifyAccountInput = {
  accountNumber: Scalars['String']['input'];
  bankCode: Scalars['String']['input'];
};

export type SignUpMutationVariables = Exact<{
  input: SignUpInput;
}>;


export type SignUpMutation = { __typename?: 'Mutations', signUp: { __typename?: 'UserResponse', message: string } };

export type GoogleSignUpMutationVariables = Exact<{
  idToken: Scalars['String']['input'];
}>;


export type GoogleSignUpMutation = { __typename?: 'Mutations', googleSignUp: { __typename?: 'AuthTokenResponse', message: string, data?: { __typename?: 'AuthToken', token: string, refreshToken: string, expiresAt: string, user: { __typename?: 'User', id: string, email: string, createdAt: string, lastUpdated: string, profile: { __typename?: 'Profile', id: string, fullName: string, gender?: string | null, createdAt: string, lastUpdated: string, image?: { __typename?: 'Asset', publicUrl: string } | null }, notificationSettings: { __typename?: 'NotificationSettings', id: string, email: boolean, appUpdates: boolean, pushNotifications: boolean, specialOffers: boolean }, kyc: { __typename?: 'Kyc', id: string, bvnVerified?: boolean | null, ninVerified?: boolean | null, image?: { __typename?: 'Asset', id: string, publicUrl: string } | null }, phoneNumbers: Array<{ __typename?: 'PhoneNumber', id: string, number: string, verificationStatus: PhoneNumberVerificationStatus }> } } | null } };

export type RefreshTokenMutationVariables = Exact<{
  input: RefreshTokenInput;
}>;


export type RefreshTokenMutation = { __typename?: 'Mutations', refreshToken: { __typename?: 'AuthTokenResponse', message: string, data?: { __typename?: 'AuthToken', token: string, refreshToken: string, expiresAt: string, user: { __typename?: 'User', id: string, email: string, createdAt: string, lastUpdated: string, profile: { __typename?: 'Profile', id: string, fullName: string, gender?: string | null, createdAt: string, lastUpdated: string, image?: { __typename?: 'Asset', publicUrl: string } | null }, notificationSettings: { __typename?: 'NotificationSettings', id: string, email: boolean, appUpdates: boolean, pushNotifications: boolean, specialOffers: boolean }, kyc: { __typename?: 'Kyc', id: string, bvnVerified?: boolean | null, ninVerified?: boolean | null, image?: { __typename?: 'Asset', id: string, publicUrl: string } | null }, phoneNumbers: Array<{ __typename?: 'PhoneNumber', id: string, number: string, verificationStatus: PhoneNumberVerificationStatus }> } } | null } };

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


export type GoogleLoginMutation = { __typename?: 'Mutations', googleLogin: { __typename?: 'AuthTokenResponse', message: string, data?: { __typename?: 'AuthToken', token: string, refreshToken: string, expiresAt: string, user: { __typename?: 'User', id: string, email: string, createdAt: string, lastUpdated: string, profile: { __typename?: 'Profile', id: string, fullName: string, gender?: string | null, createdAt: string, lastUpdated: string, image?: { __typename?: 'Asset', publicUrl: string } | null }, notificationSettings: { __typename?: 'NotificationSettings', id: string, email: boolean, appUpdates: boolean, pushNotifications: boolean, specialOffers: boolean }, kyc: { __typename?: 'Kyc', id: string, bvnVerified?: boolean | null, ninVerified?: boolean | null, image?: { __typename?: 'Asset', id: string, publicUrl: string } | null }, phoneNumbers: Array<{ __typename?: 'PhoneNumber', id: string, number: string, verificationStatus: PhoneNumberVerificationStatus }> } } | null } };

export type AppleLoginMutationVariables = Exact<{
  input: AppleAuthInput;
}>;


export type AppleLoginMutation = { __typename?: 'Mutations', appleLogin: { __typename?: 'AuthTokenResponse', message: string, data?: { __typename?: 'AuthToken', token: string, refreshToken: string, expiresAt: string, user: { __typename?: 'User', id: string, email: string, createdAt: string, lastUpdated: string, profile: { __typename?: 'Profile', id: string, fullName: string, gender?: string | null, createdAt: string, lastUpdated: string, image?: { __typename?: 'Asset', publicUrl: string } | null }, notificationSettings: { __typename?: 'NotificationSettings', id: string, email: boolean, appUpdates: boolean, pushNotifications: boolean, specialOffers: boolean }, kyc: { __typename?: 'Kyc', id: string, bvnVerified?: boolean | null, ninVerified?: boolean | null, image?: { __typename?: 'Asset', id: string, publicUrl: string } | null }, phoneNumbers: Array<{ __typename?: 'PhoneNumber', id: string, number: string, verificationStatus: PhoneNumberVerificationStatus }> } } | null } };

export type AppleSignUpMutationVariables = Exact<{
  input: AppleAuthInput;
}>;


export type AppleSignUpMutation = { __typename?: 'Mutations', appleSignUp: { __typename?: 'AuthTokenResponse', message: string, data?: { __typename?: 'AuthToken', token: string, refreshToken: string, expiresAt: string, user: { __typename?: 'User', id: string, email: string, createdAt: string, lastUpdated: string, profile: { __typename?: 'Profile', id: string, fullName: string, gender?: string | null, createdAt: string, lastUpdated: string, image?: { __typename?: 'Asset', publicUrl: string } | null }, notificationSettings: { __typename?: 'NotificationSettings', id: string, email: boolean, appUpdates: boolean, pushNotifications: boolean, specialOffers: boolean }, kyc: { __typename?: 'Kyc', id: string, bvnVerified?: boolean | null, ninVerified?: boolean | null, image?: { __typename?: 'Asset', id: string, publicUrl: string } | null }, phoneNumbers: Array<{ __typename?: 'PhoneNumber', id: string, number: string, verificationStatus: PhoneNumberVerificationStatus }> } } | null } };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutations', login: { __typename?: 'AuthTokenResponse', message: string, data?: { __typename?: 'AuthToken', token: string, refreshToken: string, expiresAt: string, user: { __typename?: 'User', id: string, email: string, createdAt: string, lastUpdated: string, profile: { __typename?: 'Profile', id: string, fullName: string, gender?: string | null, createdAt: string, lastUpdated: string, image?: { __typename?: 'Asset', publicUrl: string } | null }, notificationSettings: { __typename?: 'NotificationSettings', id: string, email: boolean, appUpdates: boolean, pushNotifications: boolean, specialOffers: boolean }, kyc: { __typename?: 'Kyc', id: string, bvnVerified?: boolean | null, ninVerified?: boolean | null, image?: { __typename?: 'Asset', id: string, publicUrl: string } | null }, phoneNumbers: Array<{ __typename?: 'PhoneNumber', id: string, number: string, verificationStatus: PhoneNumberVerificationStatus }> } } | null } };

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


export type InitiateBookingApplicationMutation = { __typename?: 'Mutations', initiateBookingApplication: { __typename?: 'BookingApplicationResponse', message: string, data?: { __typename?: 'BookingApplication', id: string, fullName?: string | null, email?: string | null, phoneNumber?: string | null, checkInDate?: string | null, correspondenceAddress?: string | null, intervalMultiplier?: number | null, status: BookingApplicationStatus, statusDetails?: string | null, createdAt: string, lastUpdated: string, bookingAggrement?: { __typename?: 'TenancyTemplate', totalSections: number, sections: Array<{ __typename?: 'TenancySection', id: string, title: string, description: string, priority: number, preamble?: string | null, subClauses: Array<{ __typename?: 'SubClause', id: string, title: string, description: string, priority: number, content: string, isMandatory: boolean, isActive: boolean, isCustom: boolean, requiredVariables: Array<{ __typename?: 'SubClauseVariable', name: string, type: VariableType }>, providedValues: Array<{ __typename?: 'SubClauseValue', key: string, value: string }> }> }> } | null, guestFormData?: { __typename?: 'GuestFormData', employmentStatus: GuestFormEmploymentStatus, incomeRanges?: GuestFormIncomeRange | null, occupancyTypes: GuestFormOccupancyType, guarantorRelationships?: GuestFormGuarantorRelationships | null } | null } | null } };

export type UpdateBookingApplicationMutationVariables = Exact<{
  input: BookingApplicationUpdateInput;
}>;


export type UpdateBookingApplicationMutation = { __typename?: 'Mutations', updateBookingApplication: { __typename?: 'BookingApplicationResponse', message: string, data?: { __typename?: 'BookingApplication', id: string, fullName?: string | null, email?: string | null, phoneNumber?: string | null, checkInDate?: string | null, correspondenceAddress?: string | null, intervalMultiplier?: number | null, status: BookingApplicationStatus, statusDetails?: string | null, createdAt: string, lastUpdated: string, bookingAggrement?: { __typename?: 'TenancyTemplate', totalSections: number, sections: Array<{ __typename?: 'TenancySection', id: string, title: string, description: string, priority: number, preamble?: string | null, subClauses: Array<{ __typename?: 'SubClause', id: string, title: string, description: string, priority: number, content: string, isMandatory: boolean, isActive: boolean, isCustom: boolean, requiredVariables: Array<{ __typename?: 'SubClauseVariable', name: string, type: VariableType }>, providedValues: Array<{ __typename?: 'SubClauseValue', key: string, value: string }> }> }> } | null, guestFormData?: { __typename?: 'GuestFormData', employmentStatus: GuestFormEmploymentStatus, incomeRanges?: GuestFormIncomeRange | null, occupancyTypes: GuestFormOccupancyType, guarantorRelationships?: GuestFormGuarantorRelationships | null } | null } | null } };

export type VerifyBookingPaymentMutationVariables = Exact<{
  verifyBookingPaymentId: Scalars['String']['input'];
}>;


export type VerifyBookingPaymentMutation = { __typename?: 'Mutations', verifyBookingPayment: { __typename?: 'BookingResponse', message: string, data?: { __typename?: 'Booking', id: string, paymentStatus: PaymentStatus } | null } };

export type FinalizeBookingMutationVariables = Exact<{
  bookingId: Scalars['String']['input'];
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

export type CancelBookingApplicationMutationVariables = Exact<{
  applicationId: Scalars['String']['input'];
}>;


export type CancelBookingApplicationMutation = { __typename?: 'Mutations', cancelBookingApplication: { __typename?: 'MessageResponse', message: string } };

export type InitiateHostingChatMutationVariables = Exact<{
  hostingId: Scalars['String']['input'];
}>;


export type InitiateHostingChatMutation = { __typename?: 'Mutations', initiateHostingChat: { __typename?: 'HostingChat', id: string } };

export type CreateUpdateMessageMutationVariables = Exact<{
  input: HostingChatMessageInput;
}>;


export type CreateUpdateMessageMutation = { __typename?: 'Mutations', createUpdateMessage: { __typename?: 'HostingChatMessage', id: string, text: string, isSender: boolean, edited?: boolean | null, createdAt: string, lastUpdated: string, sender: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', id: string, gender?: string | null, fullName: string } }, assets: Array<{ __typename?: 'HostingChatAsset', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string, contentType?: string | null, originalFilename?: string | null } }> } };

export type ClearChatUrnreadMessagesMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type ClearChatUrnreadMessagesMutation = { __typename?: 'Mutations', clearChatUrnreadMessages: { __typename?: 'MessageResponse', message: string } };

export type SendChatCallNotificationMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  callType: CallType;
  callId: Scalars['String']['input'];
}>;


export type SendChatCallNotificationMutation = { __typename?: 'Mutations', sendChatCallNotification: { __typename?: 'MessageResponse', message: string } };

export type CreateUpdateSavedHostingFolderMutationVariables = Exact<{
  input: SavedHostingFolderInput;
}>;


export type CreateUpdateSavedHostingFolderMutation = { __typename?: 'Mutations', createUpdateSavedHostingFolder: { __typename?: 'SavedHostingFolderResponse', message: string, data?: { __typename?: 'SavedHostingFolder', id: string } | null } };

export type CreateOrUpdateHostingMutationVariables = Exact<{
  input: HostingInput;
}>;


export type CreateOrUpdateHostingMutation = { __typename?: 'Mutations', createOrUpdateHosting: { __typename?: 'HostingResponse', message: string, data?: { __typename?: 'Hosting', id: string, title?: string | null, propertyType?: string | null, listingType?: ListingType | null, description?: string | null, categories?: Array<string> | null, postalCode?: string | null, city?: string | null, street?: string | null, state?: string | null, country?: string | null, longitude?: string | null, latitude?: string | null, landmarks?: string | null, contact?: string | null, price?: any | null, paymentInterval?: PaymentInterval | null, facilities?: Array<string> | null, averageRating?: number | null, totalRatings?: number | null, publishStatus?: PublishStatus | null, createdAt: string, lastUpdated: string, saved: boolean, cautionFee?: any | null, serviceCharge?: any | null, bookingApplicationsCount?: number | null, rooms: Array<{ __typename?: 'HostingRoom', id: string, name: string, count?: number | null, description?: string | null, createdAt: string, lastUpdated: string, images: Array<{ __typename?: 'HostingRoomImage', id: string, createdAt: string, lastUpdated: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } }> }>, host: { __typename?: 'Host', id: string, createdAt: string, user: { __typename?: 'User', id: string, email: string, profile: { __typename?: 'Profile', fullName: string, gender?: string | null, id: string } } }, coverImage?: { __typename?: 'HostingRoomImage', id: string, createdAt: string, lastUpdated: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } } | null, paymentDetails?: { __typename?: 'HostAccountDetails', id: string, accountNumber: string, accountName?: string | null, bankCode: string, createdAt: string, lastUpdated: string, bankDetails?: { __typename?: 'Bank', name: string, slug: string, code: string, active: boolean, currency: string, image: string } | null } | null, reviews: Array<{ __typename?: 'HostingReview', averageRating?: number | null, description?: string | null, lastUpdated: string, id: string, user: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', fullName: string, id: string, gender?: string | null } } }>, reviewAverage: { __typename?: 'HostingReviewAverage', cleanliness?: number | null, accuracy?: number | null, communication?: number | null, location?: number | null, checkIn?: number | null, value?: number | null }, tenancyAgreementTemplate?: { __typename?: 'TenancyTemplate', sections: Array<{ __typename?: 'TenancySection', id: string, title: string, description: string, priority: number, preamble?: string | null, subClauses: Array<{ __typename?: 'SubClause', id: string, title: string, description: string, content: string, isMandatory: boolean, isActive: boolean, priority: number, isCustom: boolean, requiredVariables: Array<{ __typename?: 'SubClauseVariable', name: string, type: VariableType }>, providedValues: Array<{ __typename?: 'SubClauseValue', key: string, value: string }> }> }> } | null, verification?: { __typename?: 'HostingVerification', id: string, landlordFullName: string, landlordAddress: string, verificationTier: HostingVerificationTier, propertyRelationship: HostingPropertyRelationship, declOwnership: boolean, declLitigation: boolean, declIndemnity: boolean, createdAt: string, lastUpdated: string } | null } | null } };

export type CreateOrUpdateHostingRoomMutationVariables = Exact<{
  input: HostingRoomInput;
}>;


export type CreateOrUpdateHostingRoomMutation = { __typename?: 'Mutations', createOrUpdateHostingRoom: { __typename?: 'HostingRoomResponse', message: string, data?: { __typename?: 'HostingRoom', name: string, id: string, description?: string | null, createdAt: string, lastUpdated: string, count?: number | null, images: Array<{ __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', publicUrl: string, id: string } }> } | null } };

export type CreateHostingRoomImageMutationVariables = Exact<{
  input: HostingRoomImageInput;
}>;


export type CreateHostingRoomImageMutation = { __typename?: 'Mutations', createHostingRoomImage: { __typename?: 'HostingRoomImageResponse', message: string, data?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } } | null } };

export type DeleteHostingRoomImageMutationVariables = Exact<{
  hostingRoomImageId: Scalars['String']['input'];
}>;


export type DeleteHostingRoomImageMutation = { __typename?: 'Mutations', deleteHostingRoomImage: { __typename?: 'MessageResponse', message: string } };

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

export type CreateUpdateHostingReviewMutationVariables = Exact<{
  input: HostingReviewInput;
}>;


export type CreateUpdateHostingReviewMutation = { __typename?: 'Mutations', createOrUpdateHostingReview: { __typename?: 'HostingReviewResponse', message: string, data?: { __typename?: 'HostingReview', id: string } | null } };

export type InitiateHostingVerificationMutationVariables = Exact<{
  input: HostingVerificationInput;
}>;


export type InitiateHostingVerificationMutation = { __typename?: 'Mutations', initiateHostingVerification: { __typename?: 'HostingVerificationResponse', message: string } };

export type DeleteHostingMutationVariables = Exact<{
  hostingId: Scalars['String']['input'];
}>;


export type DeleteHostingMutation = { __typename?: 'Mutations', deleteHosting: { __typename?: 'MessageResponse', message: string } };

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

export type VerifyTransactionByReferenceMutationVariables = Exact<{
  reference: Scalars['String']['input'];
}>;


export type VerifyTransactionByReferenceMutation = { __typename?: 'Mutations', verifyTransactionByReference: { __typename?: 'TransactionResponse', message: string, data?: { __typename?: 'Transaction', id: string, status: TransactionStatus } | null } };

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


export type UploadKycImageMutation = { __typename?: 'Mutations', uploadKycImage: { __typename?: 'Kyc', id: string, image?: { __typename?: 'Asset', id: string, publicUrl: string } | null } };

export type VerifyKycMutationVariables = Exact<{
  input: KycInput;
}>;


export type VerifyKycMutation = { __typename?: 'Mutations', verifyKyc: { __typename?: 'Kyc', bvnVerified?: boolean | null, id: string, ninVerified?: boolean | null, image?: { __typename?: 'Asset', id: string, publicUrl: string } | null } };

export type InitiatePhoneNumberVerificationMutationVariables = Exact<{
  phoneNumber: Scalars['String']['input'];
}>;


export type InitiatePhoneNumberVerificationMutation = { __typename?: 'Mutations', initiatePhoneNumberVerification: { __typename?: 'MessageResponse', message: string } };

export type CompletePhoneNumberVerificationMutationVariables = Exact<{
  input: PhoneNumberVerificationInput;
}>;


export type CompletePhoneNumberVerificationMutation = { __typename?: 'Mutations', completePhoneNumberVerification: { __typename?: 'PhoneNumberResponse', message: string, data?: { __typename?: 'PhoneNumber', id: string, number: string, verificationStatus: PhoneNumberVerificationStatus } | null } };

export type BookingApplicationsCountQueryVariables = Exact<{
  filter?: InputMaybe<BookingApplicationFilter>;
}>;


export type BookingApplicationsCountQuery = { __typename?: 'Query', bookingApplicationsCount: number };

export type BookingApplicationsQueryVariables = Exact<{
  filter?: InputMaybe<BookingApplicationFilter>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type BookingApplicationsQuery = { __typename?: 'Query', bookingApplications: Array<{ __typename?: 'BookingApplication', checkInDate?: string | null, fullName?: string | null, createdAt: string, status: BookingApplicationStatus, id: string, intervalMultiplier?: number | null, booking?: { __typename?: 'Booking', id: string } | null, hosting: { __typename?: 'Hosting', id: string, title?: string | null, city?: string | null, country?: string | null, state?: string | null } }> };

export type CalculateHostingFeesQueryVariables = Exact<{
  hostingId: Scalars['String']['input'];
  multiplier: Scalars['Int']['input'];
}>;


export type CalculateHostingFeesQuery = { __typename?: 'Query', calculateHostingFees: { __typename?: 'HostingFees', baseRent: any, totalPayableAmount: any, cautionFee: any, serviceCharge: any, legalFee: any, guestServiceCharge: any, hostServiceCharge: any } };

export type BookingApplicationQueryVariables = Exact<{
  bookingApplicationId: Scalars['String']['input'];
}>;


export type BookingApplicationQuery = { __typename?: 'Query', bookingApplication: { __typename?: 'BookingApplication', id: string, fullName?: string | null, email?: string | null, phoneNumber?: string | null, checkInDate?: string | null, correspondenceAddress?: string | null, intervalMultiplier?: number | null, status: BookingApplicationStatus, statusDetails?: string | null, createdAt: string, lastUpdated: string, guestFormData?: { __typename?: 'GuestFormData', employmentStatus: GuestFormEmploymentStatus, incomeRanges?: GuestFormIncomeRange | null, occupancyTypes: GuestFormOccupancyType, guarantorRelationships?: GuestFormGuarantorRelationships | null } | null, bookingAggrement?: { __typename?: 'TenancyTemplate', sections: Array<{ __typename?: 'TenancySection', id: string, title: string, description: string, priority: number, preamble?: string | null, subClauses: Array<{ __typename?: 'SubClause', id: string, title: string, description: string, priority: number, content: string, isMandatory: boolean, isActive: boolean, isCustom: boolean, requiredVariables: Array<{ __typename?: 'SubClauseVariable', name: string, type: VariableType }>, providedValues: Array<{ __typename?: 'SubClauseValue', key: string, value: string }> }> }> } | null, booking?: { __typename?: 'Booking', id: string } | null, hosting: { __typename?: 'Hosting', id: string, title?: string | null, city?: string | null, country?: string | null, state?: string | null, coverImage?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } } | null } } };

export type BookingsQueryVariables = Exact<{
  filter?: InputMaybe<BookingFilterInput>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type BookingsQuery = { __typename?: 'Query', bookings: Array<{ __typename?: 'Booking', id: string, expiresAt?: string | null, paymentStatus: PaymentStatus, createdAt: string, checkInDate?: string | null, checkOutDate?: string | null, guestServiceCharge: any, amount: any, phoneNumber: string, cautionFee?: any | null, legalFee?: any | null, serviceCharge?: any | null, hosting: { __typename?: 'Hosting', id: string, title?: string | null, city?: string | null, country?: string | null, state?: string | null, price?: any | null, paymentInterval?: PaymentInterval | null, coverImage?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } } | null }, transaction?: { __typename?: 'Transaction', id: string } | null }> };

export type BookingQueryVariables = Exact<{
  bookingId: Scalars['String']['input'];
}>;


export type BookingQuery = { __typename?: 'Query', booking: { __typename?: 'Booking', id: string, expiresAt?: string | null, paymentStatus: PaymentStatus, createdAt: string, checkInDate?: string | null, checkOutDate?: string | null, guestServiceCharge: any, amount: any, phoneNumber: string, fullName: string, email: string, paymentMethod?: string | null, status?: BookingStatus | null, cautionFee?: any | null, serviceCharge?: any | null, legalFee?: any | null, hosting: { __typename?: 'Hosting', id: string, title?: string | null, city?: string | null, country?: string | null, state?: string | null, price?: any | null, paymentInterval?: PaymentInterval | null, propertyType?: string | null, street?: string | null, landmarks?: string | null, averageRating?: number | null, totalRatings?: number | null, coverImage?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } } | null }, transaction?: { __typename?: 'Transaction', id: string, status: TransactionStatus } | null, tenancyAgreementAsset?: { __typename?: 'Asset', id: string, publicUrl: string } | null, userReview?: { __typename?: 'HostingReview', averageRating?: number | null, description?: string | null, lastUpdated: string, id: string, checkIn?: number | null, accuracy?: number | null, cleanliness?: number | null, communication?: number | null, value?: number | null, location?: number | null, user: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', fullName: string, id: string, gender?: string | null } } } | null, bookingApplication: { __typename?: 'BookingApplication', id: string, intervalMultiplier?: number | null, checkInDate?: string | null } } };

export type GuestBookingTenancyAgreementPreviewQueryVariables = Exact<{
  bookingId: Scalars['String']['input'];
}>;


export type GuestBookingTenancyAgreementPreviewQuery = { __typename?: 'Query', guestBookingTenancyAgreementPreview: string };

export type UserChatsQueryVariables = Exact<{
  filter?: InputMaybe<HostingChatFilter>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type UserChatsQuery = { __typename?: 'Query', userChats: Array<{ __typename?: 'HostingChat', id: string, lastUpdated: string, unreadMessageCount: number, lastMessage?: { __typename?: 'HostingChatMessage', id: string, text: string, assets: Array<{ __typename?: 'HostingChatAsset', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string, contentType?: string | null } }> } | null, recipientUser: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', fullName: string, id: string, gender?: string | null, image?: { __typename?: 'Asset', publicUrl: string } | null }, onlineUser: { __typename?: 'OnlineUser', id: string, online: boolean } }, hosting: { __typename?: 'Hosting', id: string, title?: string | null, coverImage?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } } | null }, host: { __typename?: 'Host', id: string, user: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', fullName: string } } }, guest: { __typename?: 'Guest', id: string, user: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', fullName: string } } } }> };

export type ChatMessagesQueryVariables = Exact<{
  chatId: Scalars['String']['input'];
  pagination?: InputMaybe<PaginationInput>;
}>;


export type ChatMessagesQuery = { __typename?: 'Query', chatMessages: Array<{ __typename?: 'HostingChatMessage', id: string, text: string, isSender: boolean, edited?: boolean | null, createdAt: string, lastUpdated: string, sender: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', id: string, gender?: string | null, fullName: string, image?: { __typename?: 'Asset', publicUrl: string } | null } }, assets: Array<{ __typename?: 'HostingChatAsset', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string, contentType?: string | null, originalFilename?: string | null } }> }> };

export type HostingChatQueryVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type HostingChatQuery = { __typename?: 'Query', hostingChat: { __typename?: 'HostingChat', id: string, hosting: { __typename?: 'Hosting', id: string, title?: string | null, city?: string | null, state?: string | null, street?: string | null, landmarks?: string | null, price?: any | null, paymentInterval?: PaymentInterval | null, coverImage?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } } | null }, recipientUser: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', gender?: string | null, id: string, fullName: string, image?: { __typename?: 'Asset', publicUrl: string } | null } } } };

export type AiHostingSearchPredictionsQueryVariables = Exact<{
  userInput: Scalars['String']['input'];
}>;


export type AiHostingSearchPredictionsQuery = { __typename?: 'Query', aiHostingSearchPredictions: Array<{ __typename?: 'AiSearchPrediction', summary: string, filters: { __typename?: 'AiSearchPredictionFilter', city?: string | null, state?: string | null, country?: string | null, propertyType?: string | null, maxPrice?: any | null, minPrice?: any | null, facilities?: Array<string> | null } }> };

export type TenancyAgreementTemplateQueryVariables = Exact<{ [key: string]: never; }>;


export type TenancyAgreementTemplateQuery = { __typename?: 'Query', tenancyAgreementTemplate: { __typename?: 'TenancyTemplate', totalSections: number, sections: Array<{ __typename?: 'TenancySection', id: string, title: string, description: string, priority: number, preamble?: string | null, subClauses: Array<{ __typename?: 'SubClause', id: string, title: string, description: string, content: string, isMandatory: boolean, isActive: boolean, isCustom: boolean, priority: number, requiredVariables: Array<{ __typename?: 'SubClauseVariable', name: string, type: VariableType }>, providedValues: Array<{ __typename?: 'SubClauseValue', key: string, value: string }> }> }> } };

export type HostingQueryVariables = Exact<{
  hostingId: Scalars['String']['input'];
  pagination?: InputMaybe<PaginationInput>;
}>;


export type HostingQuery = { __typename?: 'Query', hosting: { __typename?: 'Hosting', id: string, title?: string | null, propertyType?: string | null, listingType?: ListingType | null, description?: string | null, categories?: Array<string> | null, postalCode?: string | null, city?: string | null, street?: string | null, state?: string | null, country?: string | null, longitude?: string | null, latitude?: string | null, landmarks?: string | null, contact?: string | null, price?: any | null, paymentInterval?: PaymentInterval | null, facilities?: Array<string> | null, averageRating?: number | null, totalRatings?: number | null, publishStatus?: PublishStatus | null, createdAt: string, lastUpdated: string, saved: boolean, cautionFee?: any | null, serviceCharge?: any | null, bookingApplicationsCount?: number | null, rooms: Array<{ __typename?: 'HostingRoom', id: string, name: string, count?: number | null, description?: string | null, createdAt: string, lastUpdated: string, images: Array<{ __typename?: 'HostingRoomImage', id: string, createdAt: string, lastUpdated: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } }> }>, host: { __typename?: 'Host', id: string, createdAt: string, user: { __typename?: 'User', id: string, email: string, profile: { __typename?: 'Profile', fullName: string, gender?: string | null, id: string, image?: { __typename?: 'Asset', publicUrl: string } | null } }, signature?: { __typename?: 'Asset', id: string, publicUrl: string } | null }, coverImage?: { __typename?: 'HostingRoomImage', id: string, createdAt: string, lastUpdated: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } } | null, paymentDetails?: { __typename?: 'HostAccountDetails', id: string, accountNumber: string, accountName?: string | null, bankCode: string, createdAt: string, lastUpdated: string, bankDetails?: { __typename?: 'Bank', name: string, slug: string, code: string, active: boolean, currency: string, image: string } | null } | null, reviews: Array<{ __typename?: 'HostingReview', averageRating?: number | null, description?: string | null, lastUpdated: string, id: string, user: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', fullName: string, id: string, gender?: string | null, image?: { __typename?: 'Asset', publicUrl: string } | null } } }>, reviewAverage: { __typename?: 'HostingReviewAverage', cleanliness?: number | null, accuracy?: number | null, communication?: number | null, location?: number | null, checkIn?: number | null, value?: number | null }, tenancyAgreementTemplate?: { __typename?: 'TenancyTemplate', totalSections: number, sections: Array<{ __typename?: 'TenancySection', id: string, title: string, description: string, priority: number, preamble?: string | null, subClauses: Array<{ __typename?: 'SubClause', id: string, title: string, description: string, content: string, isMandatory: boolean, isActive: boolean, priority: number, isCustom: boolean, requiredVariables: Array<{ __typename?: 'SubClauseVariable', name: string, type: VariableType }>, providedValues: Array<{ __typename?: 'SubClauseValue', key: string, value: string }> }> }> } | null, verification?: { __typename?: 'HostingVerification', id: string, landlordFullName: string, landlordAddress: string, verificationTier: HostingVerificationTier, propertyRelationship: HostingPropertyRelationship, declOwnership: boolean, declLitigation: boolean, declIndemnity: boolean, createdAt: string, lastUpdated: string } | null } };

export type HostingsQueryVariables = Exact<{
  filters?: InputMaybe<HostingFilterInput>;
  pagination?: InputMaybe<PaginationInput>;
  roomsPagination2?: InputMaybe<PaginationInput>;
}>;


export type HostingsQuery = { __typename?: 'Query', hostings: Array<{ __typename?: 'Hosting', id: string, price?: any | null, totalRatings?: number | null, averageRating?: number | null, country?: string | null, state?: string | null, title?: string | null, city?: string | null, street?: string | null, landmarks?: string | null, saved: boolean, publishStatus?: PublishStatus | null, latitude?: string | null, longitude?: string | null, paymentInterval?: PaymentInterval | null, createdAt: string, coverImage?: { __typename?: 'HostingRoomImage', asset: { __typename?: 'Asset', publicUrl: string } } | null, rooms: Array<{ __typename?: 'HostingRoom', id: string, images: Array<{ __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string, originalFilename?: string | null } }> }> }> };

export type SavedHostingFoldersQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
}>;


export type SavedHostingFoldersQuery = { __typename?: 'Query', savedHostingFolders: Array<{ __typename?: 'SavedHostingFolder', id: string, folderName: string, createdAt: string, lastUpdated: string, itemCount: number }> };

export type SavedHostingsQueryVariables = Exact<{
  filters?: InputMaybe<SavedHostingFilterInput>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type SavedHostingsQuery = { __typename?: 'Query', savedHostings: Array<{ __typename?: 'SavedHosting', id: string, image?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', publicUrl: string, id: string } } | null, hosting: { __typename?: 'Hosting', totalRatings?: number | null, averageRating?: number | null, id: string, title?: string | null, saved: boolean } }> };

export type SavedHostingFolderQueryVariables = Exact<{
  savedHostingFolderId: Scalars['String']['input'];
}>;


export type SavedHostingFolderQuery = { __typename?: 'Query', savedHostingFolder: { __typename?: 'SavedHostingFolder', id: string, folderName: string, createdAt: string, lastUpdated: string, itemCount: number } };

export type HostListingsQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
  filters?: InputMaybe<HostingFilterInput>;
}>;


export type HostListingsQuery = { __typename?: 'Query', hostings: Array<{ __typename?: 'Hosting', id: string, title?: string | null, state?: string | null, city?: string | null, publishStatus?: PublishStatus | null, bookingApplicationsCount?: number | null, createdAt: string, lastUpdated: string, coverImage?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string, originalFilename?: string | null } } | null }> };

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

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, email: string, createdAt: string, lastUpdated: string, profile: { __typename?: 'Profile', id: string, fullName: string, gender?: string | null, createdAt: string, lastUpdated: string }, notificationSettings: { __typename?: 'NotificationSettings', id: string, email: boolean, appUpdates: boolean, pushNotifications: boolean, specialOffers: boolean }, kyc: { __typename?: 'Kyc', id: string, bvnVerified?: boolean | null, ninVerified?: boolean | null, image?: { __typename?: 'Asset', id: string, publicUrl: string } | null }, phoneNumbers: Array<{ __typename?: 'PhoneNumber', id: string, number: string, verificationStatus: PhoneNumberVerificationStatus }> } };

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


export type AuthHostQuery = { __typename?: 'Query', authHost: { __typename?: 'Host', id: string, createdAt: string, lastUpdated: string, signature?: { __typename?: 'Asset', id: string, publicUrl: string } | null } };

export type AuthGuestQueryVariables = Exact<{ [key: string]: never; }>;


export type AuthGuestQuery = { __typename?: 'Query', authGuest: { __typename?: 'Guest', id: string, createdAt: string, lastUpdated: string, signature?: { __typename?: 'Asset', id: string, publicUrl: string } | null } };

export type UserPhoneNumersQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
}>;


export type UserPhoneNumersQuery = { __typename?: 'Query', me: { __typename?: 'User', phoneNumbers: Array<{ __typename?: 'PhoneNumber', id: string, number: string, verificationStatus: PhoneNumberVerificationStatus, createdAt: string, lastUpdated: string }> } };

export type LatestHostingChatMessageSubscriptionVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type LatestHostingChatMessageSubscription = { __typename?: 'Subscriptions', latestHostingChatMessage: { __typename?: 'HostingChatMessage', id: string, text: string, isSender: boolean, edited?: boolean | null, createdAt: string, lastUpdated: string, sender: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', id: string, gender?: string | null, fullName: string } }, assets: Array<{ __typename?: 'HostingChatAsset', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string, contentType?: string | null, originalFilename?: string | null } }> } };

export type OnlineUserSubscriptionVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type OnlineUserSubscription = { __typename?: 'Subscriptions', onlineUser: { __typename?: 'OnlineUser', online: boolean, lastUpdated: string, id: string, lastSeen: string } };


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
        }
        kyc {
          id
          bvnVerified
          ninVerified
          image {
            id
            publicUrl
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
        }
        kyc {
          id
          bvnVerified
          ninVerified
          image {
            id
            publicUrl
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
        }
        kyc {
          id
          bvnVerified
          ninVerified
          image {
            id
            publicUrl
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
        }
        kyc {
          id
          bvnVerified
          ninVerified
          image {
            id
            publicUrl
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
        }
        kyc {
          id
          bvnVerified
          ninVerified
          image {
            id
            publicUrl
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
        }
        kyc {
          id
          bvnVerified
          ninVerified
          image {
            id
            publicUrl
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
      checkInDate
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
      checkInDate
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
export const FinalizeBookingDocument = gql`
    mutation FinalizeBooking($bookingId: String!) {
  finalizeBooking(bookingId: $bookingId) {
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
    mutation SendChatCallNotification($chatId: String!, $callType: CallType!, $callId: String!) {
  sendChatCallNotification(chatId: $chatId, callType: $callType, callId: $callId) {
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
        createdAt
        lastUpdated
      }
      cautionFee
      serviceCharge
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
  }
}
    `;

export function useInitiateHostingVerificationMutation() {
  return Urql.useMutation<InitiateHostingVerificationMutation, InitiateHostingVerificationMutationVariables>(InitiateHostingVerificationDocument);
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
      publicUrl
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
      publicUrl
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
    checkInDate
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
    guestServiceCharge
    hostServiceCharge
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
    checkInDate
    correspondenceAddress
    intervalMultiplier
    status
    statusDetails
    createdAt
    lastUpdated
    guestFormData {
      employmentStatus
      incomeRanges
      occupancyTypes
      guarantorRelationships
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
    transaction {
      id
    }
    createdAt
    checkInDate
    checkOutDate
    guestServiceCharge
    amount
    phoneNumber
    cautionFee
    legalFee
    serviceCharge
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
    }
    createdAt
    checkInDate
    checkOutDate
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
      checkInDate
    }
    cautionFee
    serviceCharge
    legalFee
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
          image {
            publicUrl
          }
        }
      }
      signature {
        id
        publicUrl
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
      createdAt
      lastUpdated
    }
    cautionFee
    serviceCharge
    bookingApplicationsCount
  }
}
    `;

export function useHostingQuery(options: Omit<Urql.UseQueryArgs<HostingQueryVariables>, 'query'>) {
  return Urql.useQuery<HostingQuery, HostingQueryVariables>({ query: HostingDocument, ...options });
};
export const HostingsDocument = gql`
    query Hostings($filters: HostingFilterInput, $pagination: PaginationInput, $roomsPagination2: PaginationInput) {
  hostings(filters: $filters, pagination: $pagination) {
    id
    price
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
    coverImage {
      asset {
        publicUrl
      }
    }
    rooms(pagination: $roomsPagination2) {
      id
      images {
        id
        asset {
          id
          publicUrl
          originalFilename
        }
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
    coverImage {
      id
      asset {
        id
        publicUrl
        originalFilename
      }
    }
    title
    state
    city
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
export const MeDocument = gql`
    query Me {
  me {
    id
    email
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
    }
    kyc {
      id
      bvnVerified
      ninVerified
      image {
        id
        publicUrl
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