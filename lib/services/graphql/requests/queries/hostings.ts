import { gql } from 'urql';

export const AI_HOSTING_CHAT_PREDICTIONS = gql`
  query AiHostingSearchPredictions($userInput: String!) {
    aiHostingSearchPredictions(userInput: $userInput) {
      summary
      filters {
        city
        state
        country
        propertyType
        maxPrice
        minPrice
        facilities
      }
    }
  }
`;

export const AI_HOSTING_CONTENT_SUGGESTION = gql`
  query AiHostingContentSuggestion($hostingId: String!) {
    aiHostingContentSuggestion(hostingId: $hostingId) {
      title
      description
    }
  }
`;

export const TENANCY_AGREEMENT_TEMPLATE = gql`
  query TenancyAgreementTemplate {
    tenancyAgreementTemplate {
      totalSections
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
          isCustom
          requiredVariables {
            name
            type
          }
          providedValues {
            key
            value
          }
          priority
        }
      }
    }
  }
`;

export const HOSTING_QUERY = gql`
  query Hosting($hostingId: String!, $pagination: PaginationInput) {
    hosting(hostingId: $hostingId) {
      id
      kind
      parentId
      childCount
      priceFrom
      isBookable
      parent {
        id
        title
      }
      children {
        id
        kind
        parentId
        childCount
        title
        state
        city
        price
        paymentInterval
        listingType
        publishStatus
        isBookable
        bookingApplicationsCount
        createdAt
        lastUpdated
        coverImage {
          id
          asset {
            id
            publicUrl
            originalFilename
          }
        }
      }
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
          kushiId
          phoneNumber
          kyc {
            idDocumentType
            kycReferenceId
          }
          profile {
            fullName
            gender
            id
            image {
              publicUrl
            }
          }
        }
        signature {
          id
          publicUrl
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
      video {
        id
        durationSeconds
        recordedAt
        asset {
          id
          publicUrl
        }
      }
      images(limit: 4) {
        id
        asset {
          id
          publicUrl
          originalFilename
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

      reviews(pagination: $pagination) {
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
            image {
              publicUrl
            }
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
        totalSections
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
        tierTooltip
      }
      cautionFee
      serviceCharge
      maxOccupants
      bookingApplicationsCount
    }
  }
`;

export const HOSTINGS_QUERY = gql`
  query Hostings($filters: HostingFilterInput, $pagination: PaginationInput) {
    hostings(filters: $filters, pagination: $pagination) {
      id
      kind
      childCount
      priceFrom
      isBookable
      price
      listingType
      totalRatings
      averageRating
      country
      state
      title
      city
      street
      landmarks
      saved
      publishStatus
      latitude
      longitude
      paymentInterval
      verification {
        id
        verificationTier
        tierTooltip
      }
      coverImage {
        asset {
          publicUrl
        }
      }
      images(limit: 4) {
        id
        asset {
          id
          publicUrl
          originalFilename
        }
      }
      paymentInterval
      createdAt
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
  query SavedHostings($filters: SavedHostingFilterInput, $pagination: PaginationInput) {
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
        saved
        coverImage {
          id
          asset {
            id
            publicUrl
            originalFilename
          }
        }
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
  query HostListings($pagination: PaginationInput, $filters: HostingFilterInput) {
    hostings(pagination: $pagination, filters: $filters) {
      id
      kind
      parentId
      childCount
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
      listingType
      publishStatus
      bookingApplicationsCount
      createdAt
      lastUpdated
    }
  }
`;
