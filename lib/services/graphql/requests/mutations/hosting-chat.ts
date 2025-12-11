import { gql } from "urql";

export const INITIATE_HOSTING_CHAT_MUTATION = gql`
  mutation InitiateHostingChat($hostingId: String!) {
    initiateHostingChat(hostingId: $hostingId) {
      id
    }
  }
`;

export const CREATE_UPDATE_MESSAGE = gql`
  mutation CreateUpdateMessage($input: HostingChatMessageInput!) {
    createUpdateMessage(input: $input) {
      id
      text
      sender {
        id
        profile {
          id
          gender
          fullName
        }
      }
      edited
      lastUpdated
      assets {
        id
        asset {
          id
          publicUrl
          contentType
          originalFilename
        }
      }
    }
  }
`;
