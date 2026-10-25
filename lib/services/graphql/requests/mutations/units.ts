import { gql } from 'urql';

/** Copy a property's own rooms, photos and details into N units under it. */
export const CREATE_UNITS_FROM_HOSTING = gql`
  mutation CreateUnitsFromHosting($hostingId: String!, $count: Int!, $publish: Boolean) {
    createUnitsFromHosting(hostingId: $hostingId, count: $count, publish: $publish) {
      message
      data {
        id
        childCount
      }
    }
  }
`;

export type CreateUnitsResult = { createUnitsFromHosting: { message: string; data?: { id: string; childCount: number } | null } };
