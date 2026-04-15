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
      isSender
      sender {
        id
        profile {
          id
          gender
          fullName
        }
      }
      edited
      createdAt
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

export const CLEAR_CHAT_UNREAD_MESSAGES = gql`
  mutation ClearChatUrnreadMessages($chatId: String!) {
    clearChatUrnreadMessages(chatId: $chatId) {
      message
    }
  }
`;

export const SEND_CHAT_CALL_NOTIFICATION = gql`
  mutation SendChatCallNotification(
    $chatId: String!
    $callType: CallType!
    $callId: String!
  ) {
    sendChatCallNotification(
      chatId: $chatId
      callType: $callType
      callId: $callId
    ) {
      message
    }
  }
`;
