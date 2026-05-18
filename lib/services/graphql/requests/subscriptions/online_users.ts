import { gql } from 'urql';

export const ONLINE_USERS = gql`
  subscription OnlineUser($userId: String!) {
    onlineUser(userId: $userId) {
      online
      lastUpdated
      id
      lastSeen
    }
  }
`;
