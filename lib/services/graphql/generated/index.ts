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

export type AccountDetails = {
  __typename?: 'AccountDetails';
  accountName: Scalars['String']['output'];
  accountNumber: Scalars['String']['output'];
  bankId?: Maybe<Scalars['Int']['output']>;
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
  checkInDate?: Maybe<Scalars['String']['output']>;
  checkOutDate?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  expiresAt?: Maybe<Scalars['String']['output']>;
  fullName: Scalars['String']['output'];
  gender: Gender;
  guestServiceCharge: Scalars['Decimal']['output'];
  hostServiceCharge: Scalars['Decimal']['output'];
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  noteToHost?: Maybe<Scalars['String']['output']>;
  paymentMethod: Scalars['String']['output'];
  paymentStatus: PaymentStatus;
  phoneNumber: Scalars['String']['output'];
  transaction?: Maybe<Transaction>;
};

export type BookingResponse = {
  __typename?: 'BookingResponse';
  data?: Maybe<Booking>;
  message: Scalars['String']['output'];
};

export type CompletePasswordChangeInput = {
  email: Scalars['String']['input'];
  otp: Scalars['String']['input'];
  password1: Scalars['String']['input'];
  password2: Scalars['String']['input'];
};

export type FlutterwaveCardInput = {
  cardHolderName: Scalars['String']['input'];
  cardNumber: Scalars['String']['input'];
  cvv: Scalars['String']['input'];
  expiryMonth: Scalars['String']['input'];
  expiryYear: Scalars['String']['input'];
};

export type FlutterwaveCardPaymentMethodData = {
  __typename?: 'FlutterwaveCardPaymentMethodData';
  cardHolderName: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  expiryMonth: Scalars['Int']['output'];
  expiryYear: Scalars['Int']['output'];
  first6: Scalars['String']['output'];
  flutterwaveId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  last4: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  network: Scalars['String']['output'];
};

export type FlutterwaveCardPaymentMethodDataResponse = {
  __typename?: 'FlutterwaveCardPaymentMethodDataResponse';
  data?: Maybe<FlutterwaveCardPaymentMethodData>;
  message: Scalars['String']['output'];
};

export enum Gender {
  Female = 'FEMALE',
  Male = 'MALE'
}

export type Guest = {
  __typename?: 'Guest';
  dateAdded: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  user: User;
};

export type Host = {
  __typename?: 'Host';
  dateAdded: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  user: User;
};

export type HostAccountDetails = {
  __typename?: 'HostAccountDetails';
  accountDetails: AccountDetails;
  accountName?: Maybe<Scalars['String']['output']>;
  accountNumber: Scalars['String']['output'];
  bankCode: Scalars['String']['output'];
  bankDetails?: Maybe<Bank>;
  dateAdded: Scalars['String']['output'];
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
  averateRating: Scalars['Float']['output'];
  host: Host;
  occupancyRate: Scalars['Float']['output'];
  topListing?: Maybe<Hosting>;
  totalListings: Scalars['Int']['output'];
  totalRevenue: Scalars['Decimal']['output'];
};

export type Hosting = {
  __typename?: 'Hosting';
  averageRating?: Maybe<Scalars['Float']['output']>;
  categories?: Maybe<Array<Scalars['String']['output']>>;
  city?: Maybe<Scalars['String']['output']>;
  contact?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  coverImage?: Maybe<HostingRoomImage>;
  dateAdded: Scalars['String']['output'];
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
  rooms: Array<HostingRoom>;
  saved: Scalars['Boolean']['output'];
  state?: Maybe<Scalars['String']['output']>;
  street?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  totalRatings?: Maybe<Scalars['Int']['output']>;
};


export type HostingRoomsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};

export type HostingFilterInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  creatorId?: InputMaybe<Scalars['String']['input']>;
  facilities?: InputMaybe<Array<Scalars['String']['input']>>;
  maxPrice?: InputMaybe<Scalars['Decimal']['input']>;
  minPrice?: InputMaybe<Scalars['Decimal']['input']>;
  minRating?: InputMaybe<Scalars['Int']['input']>;
  onSale?: InputMaybe<Scalars['Boolean']['input']>;
  publishStatus?: InputMaybe<PublishStatus>;
  state?: InputMaybe<Scalars['String']['input']>;
  street?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type HostingInput = {
  averageRating?: InputMaybe<Scalars['Float']['input']>;
  categories?: InputMaybe<Array<Scalars['String']['input']>>;
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
  state?: InputMaybe<Scalars['String']['input']>;
  street?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

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
  dateAdded: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
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
  dateAdded: Scalars['String']['output'];
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
  dateAdded: Scalars['String']['output'];
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

export type InitiateBookingInput = {
  checkInDate?: InputMaybe<Scalars['String']['input']>;
  checkOutDate?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  fullName: Scalars['String']['input'];
  gender: Gender;
  hostingId: Scalars['String']['input'];
  noteToHost?: InputMaybe<Scalars['String']['input']>;
  paymentMethod: PaymentMethodInput;
  phoneNumber: Scalars['String']['input'];
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
  authorizeTransactionWithOtp: TransactionResponse;
  authorizeTransactionWithPin: TransactionResponse;
  completePasswordChange: MessageResponse;
  createFlutterwaveCardPaymentMethods: FlutterwaveCardPaymentMethodDataResponse;
  createHostingReview: HostingReviewResponse;
  createHostingRoomImage: HostingRoomImageResponse;
  createOrUpdateHosting: HostingResponse;
  createOrUpdateHostingRoom: HostingRoomResponse;
  createUpdateHostPaymentDetails: HostAccountDetailsResponse;
  createUpdateSavedHosting: SavedHostingResponse;
  createUpdateSavedHostingFolder: SavedHostingFolderResponse;
  deleteHostPaymentDetails: MessageResponse;
  deleteHostingRoom: MessageResponse;
  deleteHostingRoomImage: MessageResponse;
  deleteSavedHosting: MessageResponse;
  initiateBooking: BookingResponse;
  login: AuthTokenResponse;
  refreshToken: AuthTokenResponse;
  requestPasswordChange: MessageResponse;
  resendEmailVerificationOtp: MessageResponse;
  resendPasswordChangeOtp: MessageResponse;
  signUp: UserResponse;
  verifyBookingPayment: BookingResponse;
  verifyEmail: MessageResponse;
};


export type MutationsAuthorizeTransactionWithOtpArgs = {
  input: TransactionOtpAuthInput;
};


export type MutationsAuthorizeTransactionWithPinArgs = {
  input: TransactionPinAuthInput;
};


export type MutationsCompletePasswordChangeArgs = {
  input: CompletePasswordChangeInput;
};


export type MutationsCreateFlutterwaveCardPaymentMethodsArgs = {
  input: FlutterwaveCardInput;
};


export type MutationsCreateHostingReviewArgs = {
  input: HostingReviewInput;
};


export type MutationsCreateHostingRoomImageArgs = {
  input: HostingRoomImageInput;
};


export type MutationsCreateOrUpdateHostingArgs = {
  input: HostingInput;
};


export type MutationsCreateOrUpdateHostingRoomArgs = {
  input: HostingRoomInput;
};


export type MutationsCreateUpdateHostPaymentDetailsArgs = {
  input: HostAccountDetailsInput;
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


export type MutationsDeleteHostingRoomArgs = {
  hostingRoomId: Scalars['String']['input'];
};


export type MutationsDeleteHostingRoomImageArgs = {
  hostingRoomImageId: Scalars['String']['input'];
};


export type MutationsDeleteSavedHostingArgs = {
  hostingId: Scalars['String']['input'];
};


export type MutationsInitiateBookingArgs = {
  input: InitiateBookingInput;
};


export type MutationsLoginArgs = {
  input: LoginInput;
};


export type MutationsRefreshTokenArgs = {
  input: RefreshTokenInput;
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


export type MutationsSignUpArgs = {
  input: SignUpInput;
};


export type MutationsVerifyBookingPaymentArgs = {
  id: Scalars['String']['input'];
};


export type MutationsVerifyEmailArgs = {
  input: Otpinput;
};

export type Notification = {
  __typename?: 'Notification';
  action?: Maybe<Scalars['String']['output']>;
  actionData?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  message: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type: NotificationType;
};

export enum NotificationType {
  General = 'GENERAL',
  GuestAlert = 'GUEST_ALERT',
  HostAlert = 'HOST_ALERT',
  System = 'SYSTEM'
}

export type NotificationsFilterInput = {
  type?: InputMaybe<NotificationType>;
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

export enum PaymentMethod {
  Card = 'CARD'
}

export type PaymentMethodInput = {
  id: Scalars['String']['input'];
  method: PaymentMethod;
};

export enum PaymentStatus {
  Failed = 'FAILED',
  Paid = 'PAID',
  Pending = 'PENDING'
}

export type Profile = {
  __typename?: 'Profile';
  dateAdded: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  gender?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  phoneNumber: Scalars['String']['output'];
};

export enum PublishStatus {
  Draft = 'DRAFT',
  Inreview = 'INREVIEW',
  Live = 'LIVE',
  Rejected = 'REJECTED'
}

export type Query = {
  __typename?: 'Query';
  authGuest: Guest;
  authHost: Host;
  banks: Array<Bank>;
  flutterwaveCardPaymentMethods: Array<FlutterwaveCardPaymentMethodData>;
  hostAnalytics: HostAnalytics;
  hostPaymentDetails: Array<HostAccountDetails>;
  hosting: Hosting;
  hostings: Array<Hosting>;
  me: User;
  notifications: Array<Notification>;
  savedHosting: SavedHosting;
  savedHostingFolder: SavedHostingFolder;
  savedHostingFolders: Array<SavedHostingFolder>;
  savedHostings: Array<SavedHosting>;
  verifyAccount: AccountDetails;
};


export type QueryFlutterwaveCardPaymentMethodsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryHostPaymentDetailsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryHostingArgs = {
  hostingId: Scalars['String']['input'];
};


export type QueryHostingsArgs = {
  filters?: InputMaybe<HostingFilterInput>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryNotificationsArgs = {
  filter?: InputMaybe<NotificationsFilterInput>;
  pagination?: InputMaybe<PaginationInput>;
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


export type QueryVerifyAccountArgs = {
  input: VerifyAccountInput;
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
  phoneNumber: Scalars['String']['input'];
};

export type Transaction = {
  __typename?: 'Transaction';
  amount: Scalars['Decimal']['output'];
  dateAdded: Scalars['String']['output'];
  flutterwaveChargeId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  type: TransactionType;
};

export type TransactionOtpAuthInput = {
  otp: Scalars['String']['input'];
  transactionId: Scalars['String']['input'];
};

export type TransactionPinAuthInput = {
  pin: Scalars['String']['input'];
  transactionId: Scalars['String']['input'];
};

export type TransactionResponse = {
  __typename?: 'TransactionResponse';
  data?: Maybe<Transaction>;
  message: Scalars['String']['output'];
};

export enum TransactionType {
  BookingPayment = 'booking_payment'
}

export type User = {
  __typename?: 'User';
  dateAdded: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  profile: Profile;
};

export type UserResponse = {
  __typename?: 'UserResponse';
  data?: Maybe<User>;
  message: Scalars['String']['output'];
};

export type VerifyAccountInput = {
  accountNumber: Scalars['String']['input'];
  bankCode: Scalars['String']['input'];
};

export type SignUpMutationVariables = Exact<{
  input: SignUpInput;
}>;


export type SignUpMutation = { __typename?: 'Mutations', signUp: { __typename?: 'UserResponse', message: string } };

export type RefreshTokenMutationVariables = Exact<{
  input: RefreshTokenInput;
}>;


export type RefreshTokenMutation = { __typename?: 'Mutations', refreshToken: { __typename?: 'AuthTokenResponse', message: string, data?: { __typename?: 'AuthToken', token: string, refreshToken: string, expiresAt: string } | null } };

export type VerifyEmailMutationVariables = Exact<{
  input: Otpinput;
}>;


export type VerifyEmailMutation = { __typename?: 'Mutations', verifyEmail: { __typename?: 'MessageResponse', message: string } };

export type ResendEmailVerificationOtpMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type ResendEmailVerificationOtpMutation = { __typename?: 'Mutations', resendEmailVerificationOtp: { __typename?: 'MessageResponse', message: string } };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutations', login: { __typename?: 'AuthTokenResponse', message: string, data?: { __typename?: 'AuthToken', token: string, refreshToken: string, expiresAt: string, user: { __typename?: 'User', id: string, email: string, dateAdded: string, lastUpdated: string, profile: { __typename?: 'Profile', id: string, fullName: string, phoneNumber: string, gender?: string | null, dateAdded: string, lastUpdated: string } } } | null } };

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

export type InitiateBookingMutationVariables = Exact<{
  input: InitiateBookingInput;
}>;


export type InitiateBookingMutation = { __typename?: 'Mutations', initiateBooking: { __typename?: 'BookingResponse', message: string, data?: { __typename?: 'Booking', id: string, guestServiceCharge: any, transaction?: { __typename?: 'Transaction', amount: any, id: string } | null } | null } };

export type VerifyBookingPaymentMutationVariables = Exact<{
  verifyBookingPaymentId: Scalars['String']['input'];
}>;


export type VerifyBookingPaymentMutation = { __typename?: 'Mutations', verifyBookingPayment: { __typename?: 'BookingResponse', message: string, data?: { __typename?: 'Booking', id: string, paymentStatus: PaymentStatus } | null } };

export type CreateUpdateSavedHostingFolderMutationVariables = Exact<{
  input: SavedHostingFolderInput;
}>;


export type CreateUpdateSavedHostingFolderMutation = { __typename?: 'Mutations', createUpdateSavedHostingFolder: { __typename?: 'SavedHostingFolderResponse', message: string, data?: { __typename?: 'SavedHostingFolder', id: string } | null } };

export type CreateOrUpdateHostingMutationVariables = Exact<{
  input: HostingInput;
}>;


export type CreateOrUpdateHostingMutation = { __typename?: 'Mutations', createOrUpdateHosting: { __typename?: 'HostingResponse', message: string, data?: { __typename?: 'Hosting', id: string, title?: string | null, propertyType?: string | null, listingType?: ListingType | null, description?: string | null, categories?: Array<string> | null, postalCode?: string | null, city?: string | null, street?: string | null, state?: string | null, country?: string | null, longitude?: string | null, latitude?: string | null, landmarks?: string | null, contact?: string | null, price?: any | null, paymentInterval?: PaymentInterval | null, facilities?: Array<string> | null, averageRating?: number | null, totalRatings?: number | null, publishStatus?: PublishStatus | null, dateAdded: string, lastUpdated: string, saved: boolean, rooms: Array<{ __typename?: 'HostingRoom', id: string, name: string, description?: string | null, dateAdded: string, lastUpdated: string, images: Array<{ __typename?: 'HostingRoomImage', id: string, dateAdded: string, lastUpdated: string, asset: { __typename?: 'Asset', publicUrl: string, id: string } }> }> } | null } };

export type CreateOrUpdateHostingRoomMutationVariables = Exact<{
  input: HostingRoomInput;
}>;


export type CreateOrUpdateHostingRoomMutation = { __typename?: 'Mutations', createOrUpdateHostingRoom: { __typename?: 'HostingRoomResponse', message: string, data?: { __typename?: 'HostingRoom', name: string, id: string, description?: string | null, dateAdded: string, lastUpdated: string, count?: number | null, images: Array<{ __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', publicUrl: string, id: string } }> } | null } };

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

export type CreateUpdateHostPaymentDetailsMutationVariables = Exact<{
  input: HostAccountDetailsInput;
}>;


export type CreateUpdateHostPaymentDetailsMutation = { __typename?: 'Mutations', createUpdateHostPaymentDetails: { __typename?: 'HostAccountDetailsResponse', message: string, data?: { __typename?: 'HostAccountDetails', id: string, accountNumber: string, bankCode: string, dateAdded: string, lastUpdated: string, accountName?: string | null, bankDetails?: { __typename?: 'Bank', name: string, slug: string, code: string, active: boolean, currency: string, image: string } | null } | null } };

export type CreateFlutterwaveCardPaymentMethodsMutationVariables = Exact<{
  input: FlutterwaveCardInput;
}>;


export type CreateFlutterwaveCardPaymentMethodsMutation = { __typename?: 'Mutations', createFlutterwaveCardPaymentMethods: { __typename?: 'FlutterwaveCardPaymentMethodDataResponse', message: string } };

export type AuthorizeTransactionWithOtpMutationVariables = Exact<{
  input: TransactionOtpAuthInput;
}>;


export type AuthorizeTransactionWithOtpMutation = { __typename?: 'Mutations', authorizeTransactionWithOtp: { __typename?: 'TransactionResponse', message: string } };

export type AuthorizeTransactionWithPinMutationVariables = Exact<{
  input: TransactionPinAuthInput;
}>;


export type AuthorizeTransactionWithPinMutation = { __typename?: 'Mutations', authorizeTransactionWithPin: { __typename?: 'TransactionResponse', message: string } };

export type HostingQueryVariables = Exact<{
  hostingId: Scalars['String']['input'];
}>;


export type HostingQuery = { __typename?: 'Query', hosting: { __typename?: 'Hosting', id: string, title?: string | null, propertyType?: string | null, listingType?: ListingType | null, description?: string | null, categories?: Array<string> | null, postalCode?: string | null, city?: string | null, street?: string | null, state?: string | null, country?: string | null, longitude?: string | null, latitude?: string | null, landmarks?: string | null, contact?: string | null, price?: any | null, paymentInterval?: PaymentInterval | null, facilities?: Array<string> | null, averageRating?: number | null, totalRatings?: number | null, publishStatus?: PublishStatus | null, dateAdded: string, lastUpdated: string, saved: boolean, rooms: Array<{ __typename?: 'HostingRoom', id: string, name: string, count?: number | null, description?: string | null, dateAdded: string, lastUpdated: string, images: Array<{ __typename?: 'HostingRoomImage', id: string, dateAdded: string, lastUpdated: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } }> }>, host: { __typename?: 'Host', id: string, dateAdded: string, user: { __typename?: 'User', id: string, email: string, profile: { __typename?: 'Profile', fullName: string, id: string } } }, coverImage?: { __typename?: 'HostingRoomImage', id: string, dateAdded: string, lastUpdated: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } } | null, paymentDetails?: { __typename?: 'HostAccountDetails', id: string, accountNumber: string, accountName?: string | null, bankCode: string, dateAdded: string, lastUpdated: string, bankDetails?: { __typename?: 'Bank', name: string, slug: string, code: string, active: boolean, currency: string, image: string } | null } | null } };

export type HostingsQueryVariables = Exact<{
  filters?: InputMaybe<HostingFilterInput>;
  pagination?: InputMaybe<PaginationInput>;
  roomsPagination2?: InputMaybe<PaginationInput>;
}>;


export type HostingsQuery = { __typename?: 'Query', hostings: Array<{ __typename?: 'Hosting', id: string, price?: any | null, totalRatings?: number | null, averageRating?: number | null, country?: string | null, state?: string | null, title?: string | null, city?: string | null, street?: string | null, saved: boolean, publishStatus?: PublishStatus | null, paymentInterval?: PaymentInterval | null, dateAdded: string, rooms: Array<{ __typename?: 'HostingRoom', id: string, images: Array<{ __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string, originalFilename?: string | null } }> }> }> };

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


export type HostListingsQuery = { __typename?: 'Query', hostings: Array<{ __typename?: 'Hosting', id: string, title?: string | null, state?: string | null, city?: string | null, publishStatus?: PublishStatus | null, dateAdded: string, lastUpdated: string, coverImage?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string, originalFilename?: string | null } } | null }> };

export type NotificationsQueryVariables = Exact<{
  filter?: InputMaybe<NotificationsFilterInput>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type NotificationsQuery = { __typename?: 'Query', notifications: Array<{ __typename?: 'Notification', id: string, title: string, message: string, type: NotificationType, createdAt: string, lastUpdated: string, action?: string | null, actionData?: string | null }> };

export type BanksQueryVariables = Exact<{ [key: string]: never; }>;


export type BanksQuery = { __typename?: 'Query', banks: Array<{ __typename?: 'Bank', name: string, slug: string, code: string, active: boolean, currency: string, image: string }> };

export type VerifyAccountQueryVariables = Exact<{
  input: VerifyAccountInput;
}>;


export type VerifyAccountQuery = { __typename?: 'Query', verifyAccount: { __typename?: 'AccountDetails', accountNumber: string, accountName: string, bankId?: number | null } };

export type HostPaymentDetailsQueryVariables = Exact<{ [key: string]: never; }>;


export type HostPaymentDetailsQuery = { __typename?: 'Query', hostPaymentDetails: Array<{ __typename?: 'HostAccountDetails', id: string, accountNumber: string, bankCode: string, dateAdded: string, lastUpdated: string, accountName?: string | null, bankDetails?: { __typename?: 'Bank', name: string, slug: string, code: string, active: boolean, currency: string, image: string } | null }> };

export type FlutterwaveCardPaymentMethodsQueryVariables = Exact<{ [key: string]: never; }>;


export type FlutterwaveCardPaymentMethodsQuery = { __typename?: 'Query', flutterwaveCardPaymentMethods: Array<{ __typename?: 'FlutterwaveCardPaymentMethodData', id: string, first6: string, last4: string, expiryMonth: number, expiryYear: number, network: string, cardHolderName: string }> };

export type HostAnalyticsQueryVariables = Exact<{ [key: string]: never; }>;


export type HostAnalyticsQuery = { __typename?: 'Query', hostAnalytics: { __typename?: 'HostAnalytics', totalListings: number, occupancyRate: number, totalRevenue: any, averateRating: number, host: { __typename?: 'Host', id: string, user: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', fullName: string, id: string } } }, topListing?: { __typename?: 'Hosting', id: string, city?: string | null, state?: string | null, price?: any | null, paymentInterval?: PaymentInterval | null, totalRatings?: number | null, title?: string | null, averageRating?: number | null, coverImage?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', publicUrl: string, originalFilename?: string | null, id: string } } | null } | null } };


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
export const RefreshTokenDocument = gql`
    mutation RefreshToken($input: RefreshTokenInput!) {
  refreshToken(input: $input) {
    message
    data {
      token
      refreshToken
      expiresAt
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
        dateAdded
        lastUpdated
        profile {
          id
          fullName
          phoneNumber
          gender
          dateAdded
          lastUpdated
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
export const InitiateBookingDocument = gql`
    mutation InitiateBooking($input: InitiateBookingInput!) {
  initiateBooking(input: $input) {
    data {
      id
      guestServiceCharge
      transaction {
        amount
        id
      }
    }
    message
  }
}
    `;

export function useInitiateBookingMutation() {
  return Urql.useMutation<InitiateBookingMutation, InitiateBookingMutationVariables>(InitiateBookingDocument);
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
      dateAdded
      lastUpdated
      saved
      rooms {
        id
        name
        description
        dateAdded
        lastUpdated
        images {
          id
          dateAdded
          lastUpdated
          asset {
            publicUrl
            id
          }
        }
      }
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
      dateAdded
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
export const CreateUpdateHostPaymentDetailsDocument = gql`
    mutation CreateUpdateHostPaymentDetails($input: HostAccountDetailsInput!) {
  createUpdateHostPaymentDetails(input: $input) {
    message
    data {
      id
      accountNumber
      bankCode
      dateAdded
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
export const CreateFlutterwaveCardPaymentMethodsDocument = gql`
    mutation CreateFlutterwaveCardPaymentMethods($input: FlutterwaveCardInput!) {
  createFlutterwaveCardPaymentMethods(input: $input) {
    message
  }
}
    `;

export function useCreateFlutterwaveCardPaymentMethodsMutation() {
  return Urql.useMutation<CreateFlutterwaveCardPaymentMethodsMutation, CreateFlutterwaveCardPaymentMethodsMutationVariables>(CreateFlutterwaveCardPaymentMethodsDocument);
};
export const AuthorizeTransactionWithOtpDocument = gql`
    mutation AuthorizeTransactionWithOtp($input: TransactionOtpAuthInput!) {
  authorizeTransactionWithOtp(input: $input) {
    message
  }
}
    `;

export function useAuthorizeTransactionWithOtpMutation() {
  return Urql.useMutation<AuthorizeTransactionWithOtpMutation, AuthorizeTransactionWithOtpMutationVariables>(AuthorizeTransactionWithOtpDocument);
};
export const AuthorizeTransactionWithPinDocument = gql`
    mutation AuthorizeTransactionWithPin($input: TransactionPinAuthInput!) {
  authorizeTransactionWithPin(input: $input) {
    message
  }
}
    `;

export function useAuthorizeTransactionWithPinMutation() {
  return Urql.useMutation<AuthorizeTransactionWithPinMutation, AuthorizeTransactionWithPinMutationVariables>(AuthorizeTransactionWithPinDocument);
};
export const HostingDocument = gql`
    query Hosting($hostingId: String!) {
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
    dateAdded
    lastUpdated
    saved
    rooms {
      id
      name
      count
      description
      dateAdded
      lastUpdated
      images {
        id
        dateAdded
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
          id
        }
      }
      dateAdded
    }
    coverImage {
      id
      dateAdded
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
      dateAdded
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
    saved
    publishStatus
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
    dateAdded
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
    dateAdded
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
    action
    actionData
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
export const VerifyAccountDocument = gql`
    query VerifyAccount($input: VerifyAccountInput!) {
  verifyAccount(input: $input) {
    accountNumber
    accountName
    bankId
  }
}
    `;

export function useVerifyAccountQuery(options: Omit<Urql.UseQueryArgs<VerifyAccountQueryVariables>, 'query'>) {
  return Urql.useQuery<VerifyAccountQuery, VerifyAccountQueryVariables>({ query: VerifyAccountDocument, ...options });
};
export const HostPaymentDetailsDocument = gql`
    query HostPaymentDetails {
  hostPaymentDetails {
    id
    accountNumber
    bankCode
    dateAdded
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
export const FlutterwaveCardPaymentMethodsDocument = gql`
    query FlutterwaveCardPaymentMethods {
  flutterwaveCardPaymentMethods {
    id
    first6
    last4
    expiryMonth
    expiryYear
    network
    cardHolderName
  }
}
    `;

export function useFlutterwaveCardPaymentMethodsQuery(options?: Omit<Urql.UseQueryArgs<FlutterwaveCardPaymentMethodsQueryVariables>, 'query'>) {
  return Urql.useQuery<FlutterwaveCardPaymentMethodsQuery, FlutterwaveCardPaymentMethodsQueryVariables>({ query: FlutterwaveCardPaymentMethodsDocument, ...options });
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
    averateRating
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