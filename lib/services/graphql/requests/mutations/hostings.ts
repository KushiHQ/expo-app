import { gql } from "urql";

export const CREATE_UPDATE_SAVED_HOSTING_FOLDER_MUTATION = gql`
  mutation CreateUpdateSavedHostingFolder($input: SavedHostingFolderInput!) {
    createUpdateSavedHostingFolder(input: $input) {
      message
      data {
        id
      }
    }
  }
`;

export const CREATE_UPDATE_HOSTING_MUTATION = gql`
  mutation CreateOrUpdateHosting($input: HostingInput!) {
    createOrUpdateHosting(input: $input) {
      message
      data {
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
          description
          dateAdded
          lastUpdated
          images {
            id
            dateAdded
            lastUpdated
            asset {
              publicUrl
              id
            }
          }
        }
      }
    }
  }
`;

export const CREATE_UPDATE_HOSTING_ROOM = gql`
  mutation CreateOrUpdateHostingRoom($input: HostingRoomInput!) {
    createOrUpdateHostingRoom(input: $input) {
      message
      data {
        name
        id
        images {
          id
          asset {
            publicUrl
            id
          }
        }
        description
        dateAdded
        lastUpdated
        count
      }
    }
  }
`;

export const CREATE_UPDATE_HOSTING_ROOM_IMAGE = gql`
  mutation CreateHostingRoomImage($input: HostingRoomImageInput!) {
    createHostingRoomImage(input: $input) {
      message
      data {
        id
        asset {
          id
          publicUrl
        }
      }
    }
  }
`;

export const DELETE_HOSTING_ROOM_IMAGE = gql`
  mutation DeleteHostingRoomImage($hostingRoomImageId: String!) {
    deleteHostingRoomImage(hostingRoomImageId: $hostingRoomImageId) {
      message
    }
  }
`;

export const DELETE_HOSTING_ROOM = gql`
  mutation DeleteHostingRoom($hostingRoomId: String!) {
    deleteHostingRoom(hostingRoomId: $hostingRoomId) {
      message
    }
  }
`;

export const CREATE_UPDATE_SAVED_HOSTING = gql`
  mutation CreateUpdateSavedHosting($input: SavedHostingInput!) {
    createUpdateSavedHosting(input: $input) {
      message
    }
  }
`;

export const DELETE_SAVED_HOSTING = gql`
  mutation DeleteSavedHosting($hostingId: String!) {
    deleteSavedHosting(hostingId: $hostingId) {
      message
    }
  }
`;
