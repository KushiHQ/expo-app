import { gql } from 'urql';

export const USER_PHONE_NUMBERS = gql`
  query UserPhoneNumers($pagination: PaginationInput) {
    me {
      phoneNumbers(pagination: $pagination) {
        id
        number
        verificationStatus
        createdAt
        lastUpdated
      }
    }
  }
`;
