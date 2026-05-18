import { gql } from 'urql';

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
        createdAt
        lastUpdated
        saved
        rooms {
          id
          name
          count
          description
          createdAt
          lastUpdated
          images {
            id
            createdAt
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
            profile {
              fullName
              gender
              id
            }
          }
          createdAt
        }
        coverImage {
          id
          createdAt
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
          createdAt
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
        reviews {
          averageRating
          description
          lastUpdated
          id
          user {
            id
            profile {
              fullName
              id
              gender
            }
          }
        }
        reviewAverage {
          cleanliness
          accuracy
          communication
          location
          checkIn
          value
        }
        tenancyAgreementTemplate {
          sections {
            id
            title
            description
            priority
            preamble
            subClauses {
              id
              title
              description
              content
              isMandatory
              isActive
              priority
              isCustom
              requiredVariables {
                name
                type
              }
              providedValues {
                key
                value
              }
            }
          }
        }
        verification {
          id
          landlordFullName
          landlordAddress
          verificationTier
          propertyRelationship
          declOwnership
          declLitigation
          declIndemnity
          createdAt
          lastUpdated
        }
        cautionFee
        serviceCharge
        bookingApplicationsCount
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
        createdAt
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

export const CREATE_UPDATE_HOSTING_REVIEW = gql`
  mutation CreateUpdateHostingReview($input: HostingReviewInput!) {
    createOrUpdateHostingReview(input: $input) {
      message
      data {
        id
      }
    }
  }
`;

export const INITIATE_HOSTING_VERFICATION = gql`
  mutation InitiateHostingVerification($input: HostingVerificationInput!) {
    initiateHostingVerification(input: $input) {
      message
    }
  }
`;

export const DELETE_HOSTING = gql`
  mutation deleteHosting($hostingId: String!) {
    deleteHosting(hostingId: $hostingId) {
      message
    }
  }
`;
