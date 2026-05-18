import { gql } from 'urql';

export const LATEST_HOSTING_CHAT_MESSAGES = gql`
  subscription LatestHostingChatMessage($chatId: String!) {
    latestHostingChatMessage(chatId: $chatId) {
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
