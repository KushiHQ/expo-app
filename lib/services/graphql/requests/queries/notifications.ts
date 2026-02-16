import { gql } from "urql";

export const NOTIFICATIONS_QUERY = gql`
  query Notifications(
    $filter: NotificationsFilterInput
    $pagination: PaginationInput
  ) {
    notifications(filter: $filter, pagination: $pagination) {
      id
      title
      message
      type
      createdAt
      lastUpdated
    }
  }
`;
