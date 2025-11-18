import { gql } from "urql";

export const CREATE_UPDATE_HOST_PAYMENT_DETAILS = gql`
  mutation CreateUpdateHostPaymentDetails($input: HostAccountDetailsInput!) {
    createUpdateHostPaymentDetails(input: $input) {
      message
      data {
        id
        accountNumber
        bankCode
        dateAdded
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
