import { gql } from "urql";

export const UPDATE_HOST = gql`
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

export const UPDATE_GUEST = gql`
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

export const UPDATE_PUSH_NOTIFICATION_TOKEN = gql`
  mutation UpdatePushNotificationToken($input: UpdateNotificationTokensInput!) {
    updatePushNotificationToken(tokens: $input) {
      message
    }
  }
`;

export const UPDATE_USER_NOTIFICATION_SETTINGS = gql`
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

export const UPDATE_USER_PROFILE = gql`
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

export const UPLOAD_KYC_IMAGE = gql`
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

export const VERIFY_KYC = gql`
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

export const INITIATE_PHONE_NUMBER_VERIFICATION = gql`
  mutation InitiatePhoneNumberVerification($phoneNumber: String!) {
    initiatePhoneNumberVerification(phoneNumber: $phoneNumber) {
      message
    }
  }
`;

export const COMPLETE_PHONE_NUMBER_VERIFICATION = gql`
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
