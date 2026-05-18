import { gql } from 'urql';

export const CREATE_UPDATE_HOST_PAYMENT_DETAILS = gql`
  mutation CreateUpdateHostPaymentDetails($input: HostAccountDetailsInput!) {
    createUpdateHostPaymentDetails(input: $input) {
      message
      data {
        id
        accountNumber
        bankCode
        createdAt
        lastUpdated
        bankDetails {
          name
          slug
          code
          active
          currency
          image
        }
        accountName
      }
    }
  }
`;

export const VERIFY_TRANSACTION_BY_REFERENCE = gql`
  mutation VerifyTransactionByReference($reference: String!) {
    verifyTransactionByReference(reference: $reference) {
      message
      data {
        id
        status
      }
    }
  }
`;
