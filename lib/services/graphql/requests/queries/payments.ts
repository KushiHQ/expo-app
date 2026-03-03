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

export const RESOLVE_BANK_ACCOUNT = gql`
  query ResolveBankAccount($input: VerifyAccountInput!) {
    resolveBankAccount(input: $input)
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

export const TRANSACTION_BY_REFERENCE = gql`
  query TransactionByReference($reference: String!) {
    transactionByReference(reference: $reference) {
      id
      amount
      type
      createdAt
      lastUpdated
      flutterwaveChargeId
      reference
      status
    }
  }
`;
