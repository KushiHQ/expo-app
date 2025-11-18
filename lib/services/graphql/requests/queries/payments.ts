import { gql } from "urql";

export const BANKS_QUERY = gql`
  query Banks {
    banks {
      name
      slug
      code
      active
      currency
      image
    }
  }
`;

export const VERIFY_ACCOUNT_QUERY = gql`
  query VerifyAccount($input: VerifyAccountInput!) {
    verifyAccount(input: $input) {
      accountNumber
      accountName
      bankId
    }
  }
`;

export const HOST_PAYMENT_DETAILS = gql`
  query HostPaymentDetails {
    hostPaymentDetails {
      id
      accountNumber
      bankCode
      dateAdded
      lastUpdated
      accountDetails {
        accountNumber
        accountName
        bankId
      }
    }
  }
`;
