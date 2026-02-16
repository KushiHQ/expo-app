import { gql } from "urql";

export const ME_QUERY = gql`
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
    }
  }
`;

export const AUTH_STREAM_USER_TOKEN = gql`
  query AuthStreamUserToken {
    authStreamUserToken
  }
`;

export const GET_STREAM_USER_ID_QUERY = gql`
  query GetStreamUserId($userId: String!) {
    getStreamUserId(userId: $userId)
  }
`;

export const HOST_ANALYTICS = gql`
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

export const AUTH_HOST = gql`
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

export const AUTH_GUEST = gql`
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
