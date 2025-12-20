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
  hosting: Hosting;
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  noteToHost?: Maybe<Scalars['String']['output']>;
  paymentMethod: Scalars['String']['output'];
  paymentStatus: PaymentStatus;
  phoneNumber: Scalars['String']['output'];
  status?: Maybe<BookingStatus>;
  tenancyAgreementAsset?: Maybe<Asset>;
  transaction?: Maybe<Transaction>;
  userReview?: Maybe<HostingReview>;
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
  signature?: Maybe<Asset>;
  user: User;
};

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
  dateAdded: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  signature?: Maybe<Asset>;
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
  policies?: Maybe<HostingPolicies>;
  postalCode?: Maybe<Scalars['String']['output']>;
  price?: Maybe<Scalars['Decimal']['output']>;
  propertyType?: Maybe<Scalars['String']['output']>;
  publishStatus?: Maybe<PublishStatus>;
  reviewAverage: HostingReviewAverage;
  reviews: Array<HostingReview>;
  rooms: Array<HostingRoom>;
  saved: Scalars['Boolean']['output'];
  state?: Maybe<Scalars['String']['output']>;
  street?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  totalRatings?: Maybe<Scalars['Int']['output']>;
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
  policies?: InputMaybe<HostingPoliciesInput>;
  postalCode?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Decimal']['input']>;
  propertyType?: InputMaybe<Scalars['String']['input']>;
  publishStatus?: InputMaybe<PublishStatus>;
  state?: InputMaybe<Scalars['String']['input']>;
  street?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type HostingPolicies = {
  __typename?: 'HostingPolicies';
  additionalClauses?: Maybe<Scalars['String']['output']>;
  correspondenceAddress: Scalars['String']['output'];
  maxOccupancy?: Maybe<Scalars['Int']['output']>;
  notAllowed?: Maybe<Array<Scalars['String']['output']>>;
};

export type HostingPoliciesInput = {
  additionalClauses?: InputMaybe<Scalars['String']['input']>;
  correspondenceAddress: Scalars['String']['input'];
  maxOccupancy?: InputMaybe<Scalars['Int']['input']>;
  notAllowed?: InputMaybe<Array<Scalars['String']['input']>>;
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
  correspondenceAddress: Scalars['String']['input'];
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
  clearChatUrnreadMessages: MessageResponse;
  completePasswordChange: MessageResponse;
  createFlutterwaveCardPaymentMethods: FlutterwaveCardPaymentMethodDataResponse;
  createHostingRoomImage: HostingRoomImageResponse;
  createOrUpdateHosting: HostingResponse;
  createOrUpdateHostingReview: HostingReviewResponse;
  createOrUpdateHostingRoom: HostingRoomResponse;
  createUpdateHostPaymentDetails: HostAccountDetailsResponse;
  createUpdateMessage: HostingChatMessage;
  createUpdateSavedHosting: SavedHostingResponse;
  createUpdateSavedHostingFolder: SavedHostingFolderResponse;
  deleteHostPaymentDetails: MessageResponse;
  deleteHostingRoom: MessageResponse;
  deleteHostingRoomImage: MessageResponse;
  deleteSavedHosting: MessageResponse;
  finalizeBooking: Booking;
  initiateBooking: BookingResponse;
  initiateHostingChat: HostingChat;
  login: AuthTokenResponse;
  refreshToken: AuthTokenResponse;
  requestPasswordChange: MessageResponse;
  resendEmailVerificationOtp: MessageResponse;
  resendPasswordChangeOtp: MessageResponse;
  sendChatVoiceCallNotification: MessageResponse;
  signUp: UserResponse;
  updateGuest: GuestResponse;
  updateHost: HostResponse;
  updateProfile: ProfileResponse;
  updatePushNotificationToken: NotificationSettingsResponse;
  updateUserNotificationSettings: NotificationSettingsResponse;
  verifyBookingPayment: BookingResponse;
  verifyEmail: MessageResponse;
};


export type MutationsAuthorizeTransactionWithOtpArgs = {
  input: TransactionOtpAuthInput;
};


export type MutationsAuthorizeTransactionWithPinArgs = {
  input: TransactionPinAuthInput;
};


export type MutationsClearChatUrnreadMessagesArgs = {
  chatId: Scalars['String']['input'];
};


export type MutationsCompletePasswordChangeArgs = {
  input: CompletePasswordChangeInput;
};


export type MutationsCreateFlutterwaveCardPaymentMethodsArgs = {
  input: FlutterwaveCardInput;
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


export type MutationsInitiateBookingArgs = {
  input: InitiateBookingInput;
};


export type MutationsInitiateHostingChatArgs = {
  hostingId: Scalars['String']['input'];
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


export type MutationsSendChatVoiceCallNotificationArgs = {
  chatId: Scalars['String']['input'];
};


export type MutationsSignUpArgs = {
  input: SignUpInput;
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
  expoToken: Scalars['String']['input'];
};


export type MutationsUpdateUserNotificationSettingsArgs = {
  input: NotificationSettingsInput;
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

export type NotificationSettings = {
  __typename?: 'NotificationSettings';
  appUpdates: Scalars['Boolean']['output'];
  createdAt: Scalars['String']['output'];
  email: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  pushNotifications: Scalars['Boolean']['output'];
  specialOffers: Scalars['Boolean']['output'];
  token?: Maybe<Scalars['String']['output']>;
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

export type ProfileResponse = {
  __typename?: 'ProfileResponse';
  data?: Maybe<Profile>;
  message: Scalars['String']['output'];
};

export type ProfileUpdateInput = {
  fullName: Scalars['String']['input'];
  gender?: InputMaybe<Scalars['String']['input']>;
  phoneNumber: Scalars['String']['input'];
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
  authStreamUserToken: Scalars['String']['output'];
  banks: Array<Bank>;
  booking: Booking;
  bookings: Array<Booking>;
  chatMessages: Array<HostingChatMessage>;
  flutterwaveCardPaymentMethods: Array<FlutterwaveCardPaymentMethodData>;
  getStreamUserId: Scalars['String']['output'];
  guestBookingTenancyAgreementPreview: Scalars['String']['output'];
  hostAnalytics: HostAnalytics;
  hostPaymentDetails: Array<HostAccountDetails>;
  hostTenancyAgreementPreview: Scalars['String']['output'];
  hosting: Hosting;
  hostingChat: HostingChat;
  hostings: Array<Hosting>;
  me: User;
  notifications: Array<Notification>;
  savedHosting: SavedHosting;
  savedHostingFolder: SavedHostingFolder;
  savedHostingFolders: Array<SavedHostingFolder>;
  savedHostings: Array<SavedHosting>;
  userChats: Array<HostingChat>;
  userStreamUserToken: Scalars['String']['output'];
  verifyAccount: AccountDetails;
};


export type QueryBookingArgs = {
  bookingId: Scalars['String']['input'];
};


export type QueryBookingsArgs = {
  filter?: InputMaybe<BookingFilterInput>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryChatMessagesArgs = {
  chatId: Scalars['String']['input'];
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryFlutterwaveCardPaymentMethodsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryGetStreamUserIdArgs = {
  userId: Scalars['String']['input'];
};


export type QueryGuestBookingTenancyAgreementPreviewArgs = {
  bookingId: Scalars['String']['input'];
};


export type QueryHostPaymentDetailsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryHostTenancyAgreementPreviewArgs = {
  policies?: InputMaybe<HostingPoliciesInput>;
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


export type QueryUserChatsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryUserStreamUserTokenArgs = {
  userId: Scalars['String']['input'];
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
  BookingPayment = 'booking_payment',
  HostBookingPayment = 'host_booking_payment'
}

export type User = {
  __typename?: 'User';
  dateAdded: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lastUpdated: Scalars['String']['output'];
  notificationSettings: NotificationSettings;
  onlineUser: OnlineUser;
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


export type RefreshTokenMutation = { __typename?: 'Mutations', refreshToken: { __typename?: 'AuthTokenResponse', message: string, data?: { __typename?: 'AuthToken', token: string, refreshToken: string, expiresAt: string, user: { __typename?: 'User', id: string, email: string, dateAdded: string, lastUpdated: string, profile: { __typename?: 'Profile', id: string, fullName: string, phoneNumber: string, gender?: string | null, dateAdded: string, lastUpdated: string }, notificationSettings: { __typename?: 'NotificationSettings', id: string, token?: string | null, email: boolean, appUpdates: boolean, pushNotifications: boolean, specialOffers: boolean } } } | null } };

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


export type LoginMutation = { __typename?: 'Mutations', login: { __typename?: 'AuthTokenResponse', message: string, data?: { __typename?: 'AuthToken', token: string, refreshToken: string, expiresAt: string, user: { __typename?: 'User', id: string, email: string, dateAdded: string, lastUpdated: string, profile: { __typename?: 'Profile', id: string, fullName: string, phoneNumber: string, gender?: string | null, dateAdded: string, lastUpdated: string }, notificationSettings: { __typename?: 'NotificationSettings', id: string, token?: string | null, email: boolean, appUpdates: boolean, pushNotifications: boolean, specialOffers: boolean } } } | null } };

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

export type FinalizeBookingMutationVariables = Exact<{
  bookingId: Scalars['String']['input'];
}>;


export type FinalizeBookingMutation = { __typename?: 'Mutations', finalizeBooking: { __typename?: 'Booking', id: string } };

export type InitiateHostingChatMutationVariables = Exact<{
  hostingId: Scalars['String']['input'];
}>;


export type InitiateHostingChatMutation = { __typename?: 'Mutations', initiateHostingChat: { __typename?: 'HostingChat', id: string } };

export type CreateUpdateMessageMutationVariables = Exact<{
  input: HostingChatMessageInput;
}>;


export type CreateUpdateMessageMutation = { __typename?: 'Mutations', createUpdateMessage: { __typename?: 'HostingChatMessage', id: string, text: string, isSender: boolean, edited?: boolean | null, lastUpdated: string, sender: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', id: string, gender?: string | null, fullName: string } }, assets: Array<{ __typename?: 'HostingChatAsset', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string, contentType?: string | null, originalFilename?: string | null } }> } };

export type ClearChatUrnreadMessagesMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type ClearChatUrnreadMessagesMutation = { __typename?: 'Mutations', clearChatUrnreadMessages: { __typename?: 'MessageResponse', message: string } };

export type CreateUpdateSavedHostingFolderMutationVariables = Exact<{
  input: SavedHostingFolderInput;
}>;


export type CreateUpdateSavedHostingFolderMutation = { __typename?: 'Mutations', createUpdateSavedHostingFolder: { __typename?: 'SavedHostingFolderResponse', message: string, data?: { __typename?: 'SavedHostingFolder', id: string } | null } };

export type CreateOrUpdateHostingMutationVariables = Exact<{
  input: HostingInput;
}>;


export type CreateOrUpdateHostingMutation = { __typename?: 'Mutations', createOrUpdateHosting: { __typename?: 'HostingResponse', message: string, data?: { __typename?: 'Hosting', id: string, title?: string | null, propertyType?: string | null, listingType?: ListingType | null, description?: string | null, categories?: Array<string> | null, postalCode?: string | null, city?: string | null, street?: string | null, state?: string | null, country?: string | null, longitude?: string | null, latitude?: string | null, landmarks?: string | null, contact?: string | null, price?: any | null, paymentInterval?: PaymentInterval | null, facilities?: Array<string> | null, averageRating?: number | null, totalRatings?: number | null, publishStatus?: PublishStatus | null, dateAdded: string, lastUpdated: string, saved: boolean, rooms: Array<{ __typename?: 'HostingRoom', id: string, name: string, description?: string | null, dateAdded: string, lastUpdated: string, images: Array<{ __typename?: 'HostingRoomImage', id: string, dateAdded: string, lastUpdated: string, asset: { __typename?: 'Asset', publicUrl: string, id: string } }> }>, policies?: { __typename?: 'HostingPolicies', maxOccupancy?: number | null, notAllowed?: Array<string> | null, additionalClauses?: string | null } | null } | null } };

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

export type CreateUpdateHostingReviewMutationVariables = Exact<{
  input: HostingReviewInput;
}>;


export type CreateUpdateHostingReviewMutation = { __typename?: 'Mutations', createOrUpdateHostingReview: { __typename?: 'HostingReviewResponse', message: string, data?: { __typename?: 'HostingReview', id: string } | null } };

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

export type UpdateHostMutationVariables = Exact<{
  input: HostInput;
}>;


export type UpdateHostMutation = { __typename?: 'Mutations', updateHost: { __typename?: 'HostResponse', message: string, data?: { __typename?: 'Host', signature?: { __typename?: 'Asset', id: string, publicUrl: string } | null } | null } };

export type UpdateGuestMutationVariables = Exact<{
  input: GuestInput;
}>;


export type UpdateGuestMutation = { __typename?: 'Mutations', updateGuest: { __typename?: 'GuestResponse', message: string, data?: { __typename?: 'Guest', signature?: { __typename?: 'Asset', publicUrl: string, id: string } | null } | null } };

export type UpdatePushNotificationTokenMutationVariables = Exact<{
  expoToken: Scalars['String']['input'];
}>;


export type UpdatePushNotificationTokenMutation = { __typename?: 'Mutations', updatePushNotificationToken: { __typename?: 'NotificationSettingsResponse', message: string } };

export type UpdateUserNotificationSettingsMutationVariables = Exact<{
  input: NotificationSettingsInput;
}>;


export type UpdateUserNotificationSettingsMutation = { __typename?: 'Mutations', updateUserNotificationSettings: { __typename?: 'NotificationSettingsResponse', message: string, data?: { __typename?: 'NotificationSettings', id: string, pushNotifications: boolean, specialOffers: boolean, email: boolean, appUpdates: boolean } | null } };

export type UpdateProfileMutationVariables = Exact<{
  input: ProfileUpdateInput;
}>;


export type UpdateProfileMutation = { __typename?: 'Mutations', updateProfile: { __typename?: 'ProfileResponse', message: string, data?: { __typename?: 'Profile', id: string, fullName: string, phoneNumber: string, gender?: string | null, dateAdded: string, lastUpdated: string } | null } };

export type BookingsQueryVariables = Exact<{
  filter?: InputMaybe<BookingFilterInput>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type BookingsQuery = { __typename?: 'Query', bookings: Array<{ __typename?: 'Booking', id: string, expiresAt?: string | null, paymentStatus: PaymentStatus, createdAt: string, checkInDate?: string | null, checkOutDate?: string | null, guestServiceCharge: any, amount: any, phoneNumber: string, hosting: { __typename?: 'Hosting', id: string, title?: string | null, city?: string | null, country?: string | null, state?: string | null, price?: any | null, paymentInterval?: PaymentInterval | null, coverImage?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } } | null }, transaction?: { __typename?: 'Transaction', id: string } | null }> };

export type BookingQueryVariables = Exact<{
  bookingId: Scalars['String']['input'];
}>;


export type BookingQuery = { __typename?: 'Query', booking: { __typename?: 'Booking', id: string, expiresAt?: string | null, paymentStatus: PaymentStatus, createdAt: string, checkInDate?: string | null, checkOutDate?: string | null, guestServiceCharge: any, amount: any, phoneNumber: string, fullName: string, email: string, gender: Gender, paymentMethod: string, status?: BookingStatus | null, hosting: { __typename?: 'Hosting', id: string, title?: string | null, city?: string | null, country?: string | null, state?: string | null, price?: any | null, paymentInterval?: PaymentInterval | null, propertyType?: string | null, street?: string | null, landmarks?: string | null, coverImage?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } } | null }, transaction?: { __typename?: 'Transaction', id: string } | null, tenancyAgreementAsset?: { __typename?: 'Asset', id: string, publicUrl: string } | null, userReview?: { __typename?: 'HostingReview', averageRating?: number | null, description?: string | null, lastUpdated: string, id: string, checkIn?: number | null, accuracy?: number | null, cleanliness?: number | null, communication?: number | null, value?: number | null, location?: number | null, user: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', fullName: string, id: string, gender?: string | null } } } | null } };

export type GuestBookingTenancyAgreementPreviewQueryVariables = Exact<{
  bookingId: Scalars['String']['input'];
}>;


export type GuestBookingTenancyAgreementPreviewQuery = { __typename?: 'Query', guestBookingTenancyAgreementPreview: string };

export type UserChatsQueryVariables = Exact<{ [key: string]: never; }>;


export type UserChatsQuery = { __typename?: 'Query', userChats: Array<{ __typename?: 'HostingChat', id: string, lastUpdated: string, unreadMessageCount: number, lastMessage?: { __typename?: 'HostingChatMessage', id: string, text: string } | null, recipientUser: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', fullName: string, id: string, gender?: string | null }, onlineUser: { __typename?: 'OnlineUser', id: string, online: boolean } } }> };

export type ChatMessagesQueryVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type ChatMessagesQuery = { __typename?: 'Query', chatMessages: Array<{ __typename?: 'HostingChatMessage', id: string, text: string, isSender: boolean, edited?: boolean | null, lastUpdated: string, sender: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', id: string, gender?: string | null, fullName: string } }, assets: Array<{ __typename?: 'HostingChatAsset', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string, contentType?: string | null, originalFilename?: string | null } }> }> };

export type HostingChatQueryVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type HostingChatQuery = { __typename?: 'Query', hostingChat: { __typename?: 'HostingChat', id: string, hosting: { __typename?: 'Hosting', id: string, title?: string | null, city?: string | null, state?: string | null, street?: string | null, landmarks?: string | null, price?: any | null, paymentInterval?: PaymentInterval | null, coverImage?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } } | null }, recipientUser: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', gender?: string | null, id: string, fullName: string } } } };

export type HostingQueryVariables = Exact<{
  hostingId: Scalars['String']['input'];
  pagination?: InputMaybe<PaginationInput>;
}>;


export type HostingQuery = { __typename?: 'Query', hosting: { __typename?: 'Hosting', id: string, title?: string | null, propertyType?: string | null, listingType?: ListingType | null, description?: string | null, categories?: Array<string> | null, postalCode?: string | null, city?: string | null, street?: string | null, state?: string | null, country?: string | null, longitude?: string | null, latitude?: string | null, landmarks?: string | null, contact?: string | null, price?: any | null, paymentInterval?: PaymentInterval | null, facilities?: Array<string> | null, averageRating?: number | null, totalRatings?: number | null, publishStatus?: PublishStatus | null, dateAdded: string, lastUpdated: string, saved: boolean, rooms: Array<{ __typename?: 'HostingRoom', id: string, name: string, count?: number | null, description?: string | null, dateAdded: string, lastUpdated: string, images: Array<{ __typename?: 'HostingRoomImage', id: string, dateAdded: string, lastUpdated: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } }> }>, host: { __typename?: 'Host', id: string, dateAdded: string, user: { __typename?: 'User', id: string, email: string, profile: { __typename?: 'Profile', fullName: string, gender?: string | null, id: string } } }, coverImage?: { __typename?: 'HostingRoomImage', id: string, dateAdded: string, lastUpdated: string, asset: { __typename?: 'Asset', id: string, publicUrl: string } } | null, paymentDetails?: { __typename?: 'HostAccountDetails', id: string, accountNumber: string, accountName?: string | null, bankCode: string, dateAdded: string, lastUpdated: string, bankDetails?: { __typename?: 'Bank', name: string, slug: string, code: string, active: boolean, currency: string, image: string } | null } | null, policies?: { __typename?: 'HostingPolicies', maxOccupancy?: number | null, notAllowed?: Array<string> | null, additionalClauses?: string | null, correspondenceAddress: string } | null, reviews: Array<{ __typename?: 'HostingReview', averageRating?: number | null, description?: string | null, lastUpdated: string, id: string, user: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', fullName: string, id: string, gender?: string | null } } }>, reviewAverage: { __typename?: 'HostingReviewAverage', cleanliness?: number | null, accuracy?: number | null, communication?: number | null, location?: number | null, checkIn?: number | null, value?: number | null } } };

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

export type HostTenancyAgreementPreviewQueryVariables = Exact<{
  policies?: InputMaybe<HostingPoliciesInput>;
}>;


export type HostTenancyAgreementPreviewQuery = { __typename?: 'Query', hostTenancyAgreementPreview: string };

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

export type AuthStreamUserTokenQueryVariables = Exact<{ [key: string]: never; }>;


export type AuthStreamUserTokenQuery = { __typename?: 'Query', authStreamUserToken: string };

export type GetStreamUserIdQueryVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type GetStreamUserIdQuery = { __typename?: 'Query', getStreamUserId: string };

export type HostAnalyticsQueryVariables = Exact<{ [key: string]: never; }>;


export type HostAnalyticsQuery = { __typename?: 'Query', hostAnalytics: { __typename?: 'HostAnalytics', totalListings: number, occupancyRate: number, totalRevenue: any, averateRating: number, host: { __typename?: 'Host', id: string, user: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', fullName: string, id: string } } }, topListing?: { __typename?: 'Hosting', id: string, city?: string | null, state?: string | null, price?: any | null, paymentInterval?: PaymentInterval | null, totalRatings?: number | null, title?: string | null, averageRating?: number | null, coverImage?: { __typename?: 'HostingRoomImage', id: string, asset: { __typename?: 'Asset', publicUrl: string, originalFilename?: string | null, id: string } } | null } | null } };

export type AuthHostQueryVariables = Exact<{ [key: string]: never; }>;


export type AuthHostQuery = { __typename?: 'Query', authHost: { __typename?: 'Host', id: string, dateAdded: string, lastUpdated: string, signature?: { __typename?: 'Asset', id: string, publicUrl: string } | null } };

export type AuthGuestQueryVariables = Exact<{ [key: string]: never; }>;


export type AuthGuestQuery = { __typename?: 'Query', authGuest: { __typename?: 'Guest', id: string, dateAdded: string, lastUpdated: string, signature?: { __typename?: 'Asset', id: string, publicUrl: string } | null } };

export type LatestHostingChatMessageSubscriptionVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type LatestHostingChatMessageSubscription = { __typename?: 'Subscriptions', latestHostingChatMessage: { __typename?: 'HostingChatMessage', id: string, text: string, isSender: boolean, edited?: boolean | null, lastUpdated: string, sender: { __typename?: 'User', id: string, profile: { __typename?: 'Profile', id: string, gender?: string | null, fullName: string } }, assets: Array<{ __typename?: 'HostingChatAsset', id: string, asset: { __typename?: 'Asset', id: string, publicUrl: string, contentType?: string | null, originalFilename?: string | null } }> } };

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
        notificationSettings {
          id
          token
          email
          appUpdates
          pushNotifications
          specialOffers
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
        notificationSettings {
          id
          token
          email
          appUpdates
          pushNotifications
          specialOffers
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
      policies {
        maxOccupancy
        notAllowed
        additionalClauses
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
    mutation UpdatePushNotificationToken($expoToken: String!) {
  updatePushNotificationToken(expoToken: $expoToken) {
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
      phoneNumber
      gender
      dateAdded
      lastUpdated
    }
  }
}
    `;

export function useUpdateProfileMutation() {
  return Urql.useMutation<UpdateProfileMutation, UpdateProfileMutationVariables>(UpdateProfileDocument);
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
    fullName
    email
    gender
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
    query UserChats {
  userChats {
    id
    lastUpdated
    unreadMessageCount
    lastMessage {
      id
      text
    }
    recipientUser {
      id
      profile {
        fullName
        id
        gender
      }
      onlineUser {
        id
        online
      }
    }
  }
}
    `;

export function useUserChatsQuery(options?: Omit<Urql.UseQueryArgs<UserChatsQueryVariables>, 'query'>) {
  return Urql.useQuery<UserChatsQuery, UserChatsQueryVariables>({ query: UserChatsDocument, ...options });
};
export const ChatMessagesDocument = gql`
    query ChatMessages($chatId: String!) {
  chatMessages(chatId: $chatId) {
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
      }
    }
  }
}
    `;

export function useHostingChatQuery(options: Omit<Urql.UseQueryArgs<HostingChatQueryVariables>, 'query'>) {
  return Urql.useQuery<HostingChatQuery, HostingChatQueryVariables>({ query: HostingChatDocument, ...options });
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
          gender
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
    policies {
      maxOccupancy
      notAllowed
      additionalClauses
      correspondenceAddress
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
export const HostTenancyAgreementPreviewDocument = gql`
    query HostTenancyAgreementPreview($policies: HostingPoliciesInput) {
  hostTenancyAgreementPreview(policies: $policies)
}
    `;

export function useHostTenancyAgreementPreviewQuery(options?: Omit<Urql.UseQueryArgs<HostTenancyAgreementPreviewQueryVariables>, 'query'>) {
  return Urql.useQuery<HostTenancyAgreementPreviewQuery, HostTenancyAgreementPreviewQueryVariables>({ query: HostTenancyAgreementPreviewDocument, ...options });
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
export const AuthStreamUserTokenDocument = gql`
    query AuthStreamUserToken {
  authStreamUserToken
}
    `;

export function useAuthStreamUserTokenQuery(options?: Omit<Urql.UseQueryArgs<AuthStreamUserTokenQueryVariables>, 'query'>) {
  return Urql.useQuery<AuthStreamUserTokenQuery, AuthStreamUserTokenQueryVariables>({ query: AuthStreamUserTokenDocument, ...options });
};
export const GetStreamUserIdDocument = gql`
    query GetStreamUserId($userId: String!) {
  getStreamUserId(userId: $userId)
}
    `;

export function useGetStreamUserIdQuery(options: Omit<Urql.UseQueryArgs<GetStreamUserIdQueryVariables>, 'query'>) {
  return Urql.useQuery<GetStreamUserIdQuery, GetStreamUserIdQueryVariables>({ query: GetStreamUserIdDocument, ...options });
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
export const AuthHostDocument = gql`
    query AuthHost {
  authHost {
    id
    dateAdded
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
    dateAdded
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