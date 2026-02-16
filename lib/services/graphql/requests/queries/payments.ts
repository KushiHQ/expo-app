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
`;

export const FLUTTERWAVE_CARD_PAYMENT_METHODS = gql`
  query FlutterwaveCardPaymentMethods {
    flutterwaveCardPaymentMethods {
      id
      first6
      last4
      expiryMonth
      expiryYear
      network
      cardHolderName
    }
  }
`;
