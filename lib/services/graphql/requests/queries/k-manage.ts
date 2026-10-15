import { gql } from 'urql';

/* Host management, saved collections and chat context for the redesigned screens. */

/** Extra trust signals for the host's review (kept apart from KBookingApplication). */
export const K_APPLICANT_TRUST = gql`
	query KApplicantTrust($bookingApplicationId: String!) {
		bookingApplication(bookingApplicationId: $bookingApplicationId) {
			id
			guest {
				id
				signature {
					id
				}
				user {
					id
					phoneNumberVerified
					createdAt
					kyc {
						id
						ninVerified
						bvnVerified
						idDocumentType
					}
				}
			}
		}
	}
`;

/** What happened after the host accepted: payment, escrow, payout. */
export const K_HOST_TENANCY = gql`
	query KHostTenancy($bookingApplicationId: String!) {
		bookingApplication(bookingApplicationId: $bookingApplicationId) {
			id
			booking {
				id
				status
				paymentStatus
				amount
				hostServiceCharge
				cautionFee
				commencementDate
				expiryDate
				expiresAt
				autoFinalizeAt
				createdAt
				hostTransaction {
					id
					status
					amount
					disbursementAmount
					createdAt
				}
			}
		}
	}
`;

/** Saved homes with their collection. */
export const K_SAVED_COLLECTED = gql`
	query KSavedCollected($filters: SavedHostingFilterInput, $pagination: PaginationInput) {
		savedHostings(filters: $filters, pagination: $pagination) {
			id
			createdAt
			folder {
				id
				folderName
			}
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

export const K_COLLECTIONS = gql`
	query KCollections($pagination: PaginationInput) {
		savedHostingFolders(pagination: $pagination) {
			id
			folderName
			itemCount
			lastUpdated
		}
	}
`;

/** Chat header context: who, the home, and their presence. */
export const K_CHAT = gql`
	query KChat($chatId: String!) {
		hostingChat(chatId: $chatId) {
			id
			hosting {
				id
				title
				city
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
			recipientUser {
				id
				profile {
					id
					fullName
					image {
						publicUrl
					}
				}
				onlineUser {
					id
					online
					lastSeen
				}
			}
		}
	}
`;
