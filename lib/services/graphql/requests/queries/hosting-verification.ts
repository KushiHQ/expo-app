import { gql } from "urql";

export const HOSTING_VERIFICATION_REQUESTS = gql`
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

export const HOSTING_VERIFICATION_TIER = gql`
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
