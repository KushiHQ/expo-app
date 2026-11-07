import { gql } from 'urql';

export const MY_REWARDS = gql`
  query MyRewards {
    myRewards {
      id
      title
      description
      amount
      targetCount
      minTier
      progress
      slotsLeft
      endsAt
      countsFrom
      canClaim
      claim {
        status
        amount
        accountName
        accountLast4
        note
      }
    }
  }
`;

export const HOSTING_PUBLISH_BLOCKS = gql`
  query HostingPublishBlocks($hostingId: String!) {
    hosting(hostingId: $hostingId) {
      id
      publishBlocks {
        code
        message
      }
    }
  }
`;
