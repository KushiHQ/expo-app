import { gql } from 'urql';

export const INITIATE_SUPPORT_CHAT_MUTATION = gql`
  mutation InitiateSupportChat(
    $itemType: SupportItemType
    $itemId: String
    $initialMessage: String
  ) {
    initiateSupportChat(itemType: $itemType, itemId: $itemId, initialMessage: $initialMessage) {
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
        isStaff
        profile {
          fullName
        }
      }
    }
  }
`;
