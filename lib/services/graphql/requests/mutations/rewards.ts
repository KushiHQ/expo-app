import { gql } from 'urql';

export const CLAIM_REWARD = gql`
  mutation ClaimReward($rewardId: String!, $accountNumber: String!, $bankCode: String!) {
    claimReward(rewardId: $rewardId, accountNumber: $accountNumber, bankCode: $bankCode) {
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
