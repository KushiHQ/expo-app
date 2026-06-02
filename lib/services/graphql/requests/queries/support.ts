import { gql } from 'urql';

export const MY_SUPPORT_CHATS_QUERY = gql`
  query MySupportChats($pagination: PaginationInput) {
    mySupportChats(pagination: $pagination) {
      id
      status
      createdAt
      lastUpdated
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
  query SupportChat($id: String!, $pagination: PaginationInput) {
    supportChat(id: $id) {
      id
      status
      createdAt
      lastUpdated
      messages(pagination: $pagination) {
        id
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
  }
`;
