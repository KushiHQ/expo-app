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
      phoneNumbers {
        id
        number
        verificationStatus
      }
    }
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

export const REVENUE_GROWTH = gql`
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
