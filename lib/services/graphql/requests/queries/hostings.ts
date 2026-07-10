import { gql } from 'urql';

export const PROPERTY_TYPES = gql`
  query PropertyTypes {
    propertyTypes {
      value
      label
      searchTerms
      rooms
      facilities
      category
      icon
    }
  }
`;

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
  query TenancyAgreementTemplate($hostingId: String) {
    tenancyAgreementTemplate(hostingId: $hostingId) {
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
  query Hosting($hostingId: String!, $pagination: PaginationInput, $childrenOnSale: Boolean) {
    hosting(hostingId: $hostingId) {
      id
      kind
      parentId
      unitStructure
      childCount
      priceFrom
      isBookable
      parent {
        id
        title
        unitStructure
      }
      children(onSale: $childrenOnSale) {
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
            lastUpdated
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
            lastUpdated
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
              lastUpdated
            }
          }
        }
        signature {
          id
          publicUrl
          lastUpdated
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
          lastUpdated
        }
      }
      video {
        id
        durationSeconds
        recordedAt
        asset {
          id
          publicUrl
          lastUpdated
        }
      }
      images(limit: 4) {
        id
        asset {
          id
          publicUrl
          lastUpdated
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
              lastUpdated
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
          lastUpdated
        }
      }
      images(limit: 4) {
        id
        asset {
          id
          publicUrl
          lastUpdated
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
          lastUpdated
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
            lastUpdated
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
          lastUpdated
          originalFilename
        }
      }
      title
      description
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

export const RECOMMENDED_TENANCY_TEMPLATE = gql`
  query RecommendedTenancyTemplate($hostingId: String!) {
    recommendedTenancyTemplate(hostingId: $hostingId) {
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
          priority
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
  }
`;

export const TENANCY_AGREEMENT_SUMMARY = gql`
  query TenancyAgreementSummary($hostingId: String!) {
    tenancyAgreementSummary(hostingId: $hostingId)
  }
`;
