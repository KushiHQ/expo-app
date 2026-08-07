import { gql } from 'urql';

// Live updates for the chat LIST: fires whenever a message lands in any chat
// the user is part of. The selection mirrors USER_CHATS_QUERY so graphcache
// normalizes it onto the same HostingChat entity — the row's unread badge and
// last message update in place, with no refetch.
export const USER_CHAT_UPDATED = gql`
  subscription UserChatUpdated {
    userChatUpdated {
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
          image {
            publicUrl
          }
        }
        onlineUser {
          id
          online
        }
      }
      hosting {
        id
        title
        coverImage {
          id
          asset {
            id
            publicUrl
          }
        }
      }
    }
  }
`;

export const LATEST_HOSTING_CHAT_MESSAGES = gql`
  subscription LatestHostingChatMessage($chatId: String!) {
    latestHostingChatMessage(chatId: $chatId) {
      id
      text
      messageType
      callType
      callId
      callDurationSeconds
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
