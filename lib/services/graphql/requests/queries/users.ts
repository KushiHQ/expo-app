import { gql } from "urql";

export const AUTH_STREAM_USER_QUERY = gql`
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
      dateAdded
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
      dateAdded
      lastUpdated
      signature {
        id
        publicUrl
      }
    }
  }
`;
