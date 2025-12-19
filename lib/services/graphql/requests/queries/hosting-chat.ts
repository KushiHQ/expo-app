import { gql } from "urql";

export const USER_CHATS_QUERY = gql`
  query UserChats {
    userChats {
      id
      lastUpdated
      unreadMessageCount
      lastMessage {
        id
        text
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
  query ChatMessages($chatId: String!) {
    chatMessages(chatId: $chatId) {
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
