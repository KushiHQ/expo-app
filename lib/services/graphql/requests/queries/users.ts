import { gql } from "urql";

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
