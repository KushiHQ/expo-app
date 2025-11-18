import { gql } from "urql";

export const HOSTING_QUERY = gql`
  query Hosting($hostingId: String!) {
    hosting(hostingId: $hostingId) {
      id
      title
      propertyType
      listingType
      description
      categories
      postalCode
      city
      street
      state
      country
      longitude
      latitude
      landmarks
      contact
      price
      paymentInterval
      facilities
      averageRating
      totalRatings
      publishStatus
      dateAdded
      lastUpdated
      saved
      rooms {
        id
        name
        count
        description
        dateAdded
        lastUpdated
        images {
          id
          dateAdded
          lastUpdated
          asset {
            id
            publicUrl
          }
        }
      }
      host {
        id
        user {
          id
          email
        }
      }
      coverImage {
        id
        dateAdded
        lastUpdated
        asset {
          id
          publicUrl
        }
      }
      paymentDetails {
        id
        accountNumber
        accountName
        bankCode
        dateAdded
        lastUpdated
        bankDetails {
          name
          slug
          code
          active
          currency
          image
        }
      }
    }
  }
`;

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

export const SAVED_HOSTING_QUERY = gql`
  query SavedHostingFolder($savedHostingFolderId: String!) {
    savedHostingFolder(id: $savedHostingFolderId) {
      id
      folderName
      createdAt
      lastUpdated
      itemCount
    }
  }
`;

export const HOST_LISTINGS_QUERY = gql`
  query HostListings(
    $pagination: PaginationInput
    $filters: HostingFilterInput
  ) {
    hostings(pagination: $pagination, filters: $filters) {
      id
      coverImage {
        id
        asset {
          id
          publicUrl
          originalFilename
        }
      }
      title
      state
      city
      publishStatus
      dateAdded
      lastUpdated
    }
  }
`;
