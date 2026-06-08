import { gql } from 'urql';

export const KYC_STATUS_QUERY = gql`
  query KycStatus {
    kycStatus {
      bvnVerified
      ninVerified
      hasLiveness
      kycComplete
    }
  }
`;
