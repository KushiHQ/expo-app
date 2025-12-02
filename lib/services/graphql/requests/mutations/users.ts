import { gql } from "urql";

export const UPDATE_HOST = gql`
  mutation UpdateHost($input: HostInput!) {
    updateHost(input: $input) {
      message
      data {
        signature {
          id
          publicUrl
        }
      }
    }
  }
`;

export const UPDATE_GUEST = gql`
  mutation UpdateGuest($input: GuestInput!) {
    updateGuest(input: $input) {
      message
      data {
        signature {
          publicUrl
          id
        }
      }
    }
  }
`;
