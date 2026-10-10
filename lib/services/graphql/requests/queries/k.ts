import { gql } from 'urql';

/* Queries for the redesigned screens (K = Kushi kit). Field sets mirror the web app. */

export const K_SAVED = gql`
	query KSaved($pagination: PaginationInput) {
		savedHostings(pagination: $pagination) {
			id
			createdAt
			hosting {
				id
					kind
					childCount
					priceFrom
					isBookable
					price
					listingType
					managementType
					totalRatings
					averageRating
					state
					title
					city
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
			}
		}
	}
`;
export const K_APPLICATIONS = gql`
	query KBookingApplications($filter: BookingApplicationFilter, $pagination: PaginationInput) {
		bookingApplications(filter: $filter, pagination: $pagination) {
			commencementDate
			fullName
			createdAt
			status
			id
			intervalMultiplier
			booking {
				id
			}
			hosting {
				id
				title
				city
				country
				state
				price
				paymentInterval
				coverImage {
					id
					asset {
						id
					}
				}
			}
			guest {
				user {
					profile {
						fullName
						image {
							publicUrl
						}
					}
				}
			}
		}
	}
`;
export const K_APPLICATION = gql`
	query KBookingApplication($bookingApplicationId: String!) {
		bookingApplication(bookingApplicationId: $bookingApplicationId) {
			id
			fullName
			email
			phoneNumber
			commencementDate
			correspondenceAddress
			intervalMultiplier
			status
			statusDetails
			createdAt
			lastUpdated
			guest {
				user {
					id
					kyc {
						ninVerified
						bvnVerified
					}
					profile {
						fullName
						image {
							publicUrl
						}
					}
				}
			}
			guestFormData {
				employmentStatus
				incomeRanges
				occupancyTypes
				guarantorRelationships
				guarantorName
				guarantorPhone
				guarantorAddress
			}
			bookingAggrement {
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
						priority
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
					}
				}
			}
			booking {
				id
			}
			hosting {
				id
				title
				city
				country
				state
				price
				paymentInterval
				coverImage {
					id
					asset {
						id
						publicUrl
					}
				}
			}
		}
	}
`;
export const K_BOOKINGS = gql`
	query KBookings($filter: BookingFilterInput, $pagination: PaginationInput) {
		bookings(filter: $filter, pagination: $pagination) {
			id
			hosting {
				id
				coverImage {
					id
					asset {
						id
						publicUrl
					}
				}
				title
				city
				country
				state
				price
				paymentInterval
			}
			expiresAt
			paymentStatus
			status
			transaction {
				id
				reference
			}
			bookingApplication {
				id
			}
			createdAt
			commencementDate
			expiryDate
			guestServiceCharge
			amount
			phoneNumber
			cautionFee
			legalFee
			stampDuty
			serviceCharge
		}
	}
`;
export const K_BOOKING = gql`
	query KBooking($bookingId: String!) {
		booking(bookingId: $bookingId) {
			id
			hosting {
				id
				coverImage {
					id
					asset {
						id
						publicUrl
					}
				}
				title
				city
				country
				state
				price
				paymentInterval
				propertyType
				street
				landmarks
				averageRating
				totalRatings
			}
			expiresAt
			autoFinalizeAt
			paymentStatus
			transaction {
				id
				status
				reference
				amount
			}
			createdAt
			commencementDate
			expiryDate
			guestServiceCharge
			amount
			phoneNumber
			fullName
			email
			paymentMethod
			tenancyAgreementAsset {
				id
				publicUrl
			}
			status
			userReview {
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
				checkIn
				accuracy
				cleanliness
				communication
				value
				location
			}
			bookingApplication {
				id
				intervalMultiplier
				commencementDate
			}
			cautionFee
			serviceCharge
			legalFee
			stampDuty
		}
	}
`;
