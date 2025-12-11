import { gql } from "urql";

export const USER_CHATS_QUERY = gql`
  query UserChats {
    userChats {
      id
      lastUpdated
      host {
        id
        user {
          id
          profile {
            gender
            id
            fullName
          }
          onlineUser {
            id
            online
          }
        }
      }
      guest {
        id
        user {
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
      unreadMessageCount
      lastMessage {
        id
        text
      }
    }
  }
`;

export const CHAT_MESSAGES_QUERY = gql`
  query ChatMessages($chatId: String!) {
    chatMessages(chatId: $chatId) {
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
      host {
        id
        user {
          id
          profile {
            gender
            id
            fullName
          }
        }
      }
      guest {
        id
        user {
          id
          profile {
            gender
            id
            fullName
          }
        }
      }
    }
  }
`;
