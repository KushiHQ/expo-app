import { gql } from "urql";

export const SIGN_UP_MUTATION = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      message
    }
  }
`;

export const GOOGLE_SIGN_UP = gql`
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
        }
      }
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
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
        }
      }
    }
  }
`;

export const VERIFY_EMAIL_MUTATION = gql`
  mutation VerifyEmail($input: Otpinput!) {
    verifyEmail(input: $input) {
      message
    }
  }
`;

export const RESEND_EMAIL_VERIFICATION_OTP_MUTATION = gql`
  mutation ResendEmailVerificationOtp($email: String!) {
    resendEmailVerificationOtp(email: $email) {
      message
    }
  }
`;

export const GOOGLE_LOGIN = gql`
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
        }
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
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
        }
      }
    }
  }
`;

export const REQUEST_PASSWORD_CHANGE_MUTATION = gql`
  mutation RequestPasswordChange($input: RequestPasswordChangeInput!) {
    requestPasswordChange(input: $input) {
      message
    }
  }
`;

export const RESEND_PASSWORD_CHANGE_OTP_MUTATION = gql`
  mutation ResendPasswordChangeOtp($email: String!) {
    resendPasswordChangeOtp(email: $email) {
      message
    }
  }
`;

export const COMPLETE_PASSWORD_CHANGE_MUTATION = gql`
  mutation CompletePasswordChange($input: CompletePasswordChangeInput!) {
    completePasswordChange(input: $input) {
      message
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout {
      message
    }
  }
`;
