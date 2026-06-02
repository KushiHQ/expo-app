import { gql } from 'urql';

export const CREATE_SUPPORT_CHAT_MUTATION = gql`
  mutation CreateSupportChat($initialMessage: String!) {
    createSupportChat(initialMessage: $initialMessage) {
      id
      status
      createdAt
      lastUpdated
      messages(pagination: { offset: 0, limit: 1 }) {
        id
      }
    }
  }
`;

export const SEND_SUPPORT_MESSAGE_MUTATION = gql`
  mutation SendSupportMessage($chatId: String!, $text: String!) {
    sendSupportMessage(chatId: $chatId, text: $text) {
      id
      chatId
      text
      createdAt
      isReadByUser
      sender {
        id
        profile {
          fullName
        }
      }
    }
  }
`;
