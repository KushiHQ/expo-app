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
        kind
        parentId
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
          titleType
          titleNumber
          createdAt
          lastUpdated
        }
        cautionFee
        serviceCharge
        maxOccupants
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
          lastUpdated
        }
      }
    }
  }
`;

export const SET_HOSTING_COVER_IMAGE = gql`
  mutation SetHostingCoverImage($hostingRoomImageId: String!) {
    setHostingCoverImage(hostingRoomImageId: $hostingRoomImageId) {
      message
      data {
        id
        sequence
        asset {
          id
          publicUrl
        }
      }
    }
  }
`;

export const CREATE_HOSTING_VIDEO_UPLOAD_URL = gql`
  mutation CreateHostingVideoUploadUrl($hostingId: String!, $contentType: String!) {
    createHostingVideoUploadUrl(hostingId: $hostingId, contentType: $contentType) {
      assetId
      uploadUrl
    }
  }
`;

export const SET_HOSTING_VIDEO = gql`
  mutation SetHostingVideo($input: VideoWalkthroughInput!, $assetId: String!) {
    setHostingVideo(input: $input, assetId: $assetId) {
      message
      data {
        id
        durationSeconds
        asset {
          id
          publicUrl
        }
      }
    }
  }
`;

export const REORDER_HOSTING_ROOMS = gql`
  mutation ReorderHostingRooms($hostingId: String!, $orderedRoomIds: [String!]!) {
    reorderHostingRooms(hostingId: $hostingId, orderedRoomIds: $orderedRoomIds) {
      message
    }
  }
`;

export const REORDER_HOSTING_ROOM_IMAGES = gql`
  mutation ReorderHostingRoomImages($roomId: String!, $orderedImageIds: [String!]!) {
    reorderHostingRoomImages(roomId: $roomId, orderedImageIds: $orderedImageIds) {
      message
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

export const MOVE_HOSTING_ROOM_IMAGES = gql`
  mutation MoveHostingRoomImages($targetRoomId: String!, $imageIds: [String!]!) {
    moveHostingRoomImages(targetRoomId: $targetRoomId, imageIds: $imageIds) {
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

export const DELETE_SAVED_HOSTING_FOLDER = gql`
  mutation DeleteSavedHostingFolder($folderId: String!) {
    deleteSavedHostingFolder(folderId: $folderId) {
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

export const INITIATE_HOSTING_VERIFICATION = gql`
  mutation InitiateHostingVerification($input: HostingVerificationInput!) {
    initiateHostingVerification(input: $input) {
      message
      data {
        id
        landlordFullName
        landlordAddress
        verificationTier
        propertyRelationship
        declOwnership
        declLitigation
        declIndemnity
        titleType
        titleNumber
        createdAt
        lastUpdated
      }
    }
  }
`;

export const REQUEST_HOSTING_VERIFICATION_TIER = gql`
  mutation RequestHostingVerificationTier($input: HostingVerificationTierRequestInput!) {
    requestHostingVerificationTier(input: $input) {
      message
      data {
        id
        tier
        status
        statusDetails
        createdAt
        lastUpdated
        documents {
          id
          name
          createdAt
          lastUpdated
          asset {
            id
            publicUrl
          }
        }
        logs {
          datetime
          variant
          staffId
          action
          statusDetail
        }
      }
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

export const DUPLICATE_HOSTING = gql`
  mutation duplicateHosting($sourceHostingId: String!) {
    duplicateHosting(sourceHostingId: $sourceHostingId) {
      message
      data {
        id
      }
    }
  }
`;
