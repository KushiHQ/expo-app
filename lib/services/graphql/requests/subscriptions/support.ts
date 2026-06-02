import { gql } from 'urql';

export const SUPPORT_CHAT_MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription SupportChatMessageAdded($chatId: String!) {
    supportChatMessageAdded(chatId: $chatId) {
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
