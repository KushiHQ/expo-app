import { gql } from "urql";

export const HOSTINGS_QUERY = gql`
  query Hostings(
    $filters: HostingFilterInput
    $pagination: PaginationInput
    $roomsPagination2: PaginationInput
  ) {
    hostings(filters: $filters, pagination: $pagination) {
      id
      price
      totalRatings
      averageRating
      country
      state
      title
      city
      street
      saved
      publishStatus
      rooms(pagination: $roomsPagination2) {
        id
        images {
          id
          asset {
            id
            publicUrl
            originalFilename
          }
        }
      }
      paymentInterval
      dateAdded
    }
  }
`;

export const SAVED_HOSTING_FOLDER_QUERY = gql`
  query SavedHostingFolders($pagination: PaginationInput) {
    savedHostingFolders(pagination: $pagination) {
      id
      folderName
      createdAt
      lastUpdated
      itemCount
    }
  }
`;

export const SAVED_HOSTINGS_QUERY = gql`
  query SavedHostings(
    $filters: SavedHostingFilterInput
    $pagination: PaginationInput
  ) {
    savedHostings(filters: $filters, pagination: $pagination) {
      image {
        id
        asset {
          publicUrl
          id
        }
      }
      id
      hosting {
        totalRatings
        averageRating
        id
        title
      }
    }
  }
`;
