import { gql } from "urql";

export const USER_CHATS_QUERY = gql`
  query UserChats($filter: HostingChatFilter, $pagination: PaginationInput) {
    userChats(filter: $filter, pagination: $pagination) {
      id
      lastUpdated
      unreadMessageCount
      lastMessage {
        id
        text
        assets {
          id
          asset {
            id
            publicUrl
            contentType
          }
        }
      }
      recipientUser {
        id
        profile {
          fullName
          id
          gender
        }
        onlineUser {
          id
          online
        }
      }
    }
  }
`;

export const CHAT_MESSAGES_QUERY = gql`
  query ChatMessages($chatId: String!, $pagination: PaginationInput) {
    chatMessages(chatId: $chatId, pagination: $pagination) {
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
      isSender
    }
  }
`;

export const HOSTING_CHAT_QUERY = gql`
  query HostingChat($chatId: String!) {
    hostingChat(chatId: $chatId) {
      id
      hosting {
        id
        coverImage {
          id
          asset {
            id
            publicUrl
          }
        }
        title
        city
        state
        street
        landmarks
        price
        paymentInterval
      }
      recipientUser {
        id
        profile {
          gender
          id
          fullName
        }
      }
    }
  }
`;
