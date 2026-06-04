import { gql } from 'urql';

export const MY_SUPPORT_CHATS_QUERY = gql`
  query MySupportChats($pagination: PaginationInput) {
    mySupportChats(pagination: $pagination) {
      id
      status
      createdAt
      lastUpdated
      itemType
      messages(pagination: { offset: 0, limit: 1 }) {
        id
        text
        createdAt
        isReadByUser
      }
    }
  }
`;

export const SUPPORT_CHAT_QUERY = gql`
  query SupportChat($id: String!) {
    supportChat(id: $id) {
      id
      status
      createdAt
      lastUpdated
      itemType
      supportChatRating {
        id
        rating
        comment
        createdAt
      }
      user {
        id
        isStaff
        profile {
          fullName
          image {
            publicUrl
          }
        }
      }
      hosting {
        id
        title
        city
        state
        price
        paymentInterval
        coverImage {
          id
          asset {
            id
            publicUrl
          }
        }
      }
      booking {
        id
        bookingReference
        commencementDate
        durationDescription
        status
        hosting {
          id
          title
          city
          state
          price
          paymentInterval
          coverImage {
            id
            asset {
              id
              publicUrl
            }
          }
        }
      }
      transaction {
        id
        amount
        status
        createdAt
      }
    }
  }
`;

export const SUPPORT_CHAT_MESSAGES_QUERY = gql`
  query SupportChatMessages($id: String!, $pagination: PaginationInput) {
    supportChat(id: $id) {
      id
      messages(pagination: $pagination) {
        id
        text
        createdAt
        isReadByUser
        assets {
          id
          asset {
            id
            publicUrl
            contentType
            originalFilename
          }
        }
        sender {
          id
          isStaff
          profile {
            fullName
          }
        }
      }
    }
  }
`;
